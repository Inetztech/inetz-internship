import { NextRequest, NextResponse } from "next/server";
import { Student } from "@/models/Student";
import { connectToDatabase } from "@/lib/db";

// ─── GET: HIGH-SPEED PAGINATED STUDENT DIRECTORY & METRICS ──────────────────

export async function GET(req: Request) {
  try {
    await connectToDatabase();

    const { searchParams } = new URL(req.url);

    // 1. Extract Query Parameters
    const search = searchParams.get("search")?.trim() || "";
    const domain = searchParams.get("domain")?.trim() || "";
    const duration = searchParams.get("duration")?.trim() || "";
    const fromDate = searchParams.get("fromDate")?.trim() || "";
    const toDate = searchParams.get("toDate")?.trim() || "";

    const page = Math.max(1, parseInt(searchParams.get("page") || "1", 10));
    const limit = Math.max(1, parseInt(searchParams.get("limit") || "15", 10));
    const skip = (page - 1) * limit;

    // 2. Build Filter Match
    const matchQuery: Record<string, any> = {};

    // Case-Insensitive Domain Matching
    if (domain && domain.toLowerCase() !== "all") {
      const escapedDomain = domain.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
      matchQuery.domain = { $regex: `^${escapedDomain}$`, $options: "i" };
    }

    // Case-Insensitive Duration Matching
    if (duration && duration.toLowerCase() !== "all") {
      const escapedDuration = duration.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
      matchQuery.duration = { $regex: `^${escapedDuration}$`, $options: "i" };
    }

    if (fromDate || toDate) {
      matchQuery.createdAt = {};
      if (fromDate) matchQuery.createdAt.$gte = new Date(fromDate);
      if (toDate) {
        const endOfDay = new Date(toDate);
        endOfDay.setHours(23, 59, 59, 999);
        matchQuery.createdAt.$lte = endOfDay;
      }
    }

    if (search) {
      const escapedSearch = search.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
      const searchRegex = { $regex: escapedSearch, $options: "i" };

      matchQuery.$or = [
        { name: searchRegex },
        { email: searchRegex },
        { phone: searchRegex },
        { college: searchRegex },
      ];
    }

    // 3. Single-Pass Pipeline: Pagination + Metrics + Distinct Domains
    const [[result], distinctDomains] = await Promise.all([
      Student.aggregate([
        { $match: matchQuery },
        {
          $facet: {
            paginatedResults: [
              { $sort: { createdAt: -1 } },
              { $skip: skip },
              { $limit: limit },
            ],
            metrics: [
              {
                $project: {
                  totalBilling: { $ifNull: ["$totalBilling", 0] },
                  collected: {
                    $cond: {
                      if: {
                        $and: [
                          { $isArray: "$installments" },
                          { $gt: [{ $size: "$installments" }, 0] },
                        ],
                      },
                      then: { $sum: "$installments.paidAmount" },
                      else: { $ifNull: ["$totalCollection", 0] },
                    },
                  },
                },
              },
              {
                $group: {
                  _id: null,
                  totalCount: { $sum: 1 },
                  totalBilling: { $sum: "$totalBilling" },
                  totalCollected: { $sum: "$collected" },
                  duesCount: {
                    $sum: {
                      $cond: [
                        { $gt: [{ $subtract: ["$totalBilling", "$collected"] }, 0] },
                        1,
                        0,
                      ],
                    },
                  },
                },
              },
            ],
          },
        },
      ]),
      Student.distinct("domain"),
    ]);

    const students = result?.paginatedResults || [];
    const metricSummary = result?.metrics?.[0] || {
      totalCount: 0,
      totalBilling: 0,
      totalCollected: 0,
      duesCount: 0,
    };

    const totalStudents = metricSummary.totalCount;
    const totalBilling = metricSummary.totalBilling;
    const totalCollected = metricSummary.totalCollected;
    const duesCount = metricSummary.duesCount;
    const totalPending = Math.max(0, totalBilling - totalCollected);

    const formattedAvailableDomains = Array.from(
      new Set(distinctDomains.filter(Boolean))
    );

    return NextResponse.json(
      {
        success: true,
        students,
        availableDomains: ["All", ...formattedAvailableDomains],
        pagination: {
          totalStudents,
          totalPages: Math.ceil(totalStudents / limit) || 1,
          currentPage: page,
          limit,
        },
        summary: {
          totalStudents,
          totalCollected,
          totalPending,
          duesCount,
          clearCount: Math.max(0, totalStudents - duesCount),
        },
      },
      {
        status: 200,
        headers: {
          "Cache-Control": "private, no-cache, no-store, must-revalidate",
        },
      }
    );
  } catch (error: any) {
    console.error("GET_STUDENTS_ERROR:", error.message);
    return NextResponse.json(
      { success: false, error: "Internal Server Error" },
      { status: 500 }
    );
  }
}

// ─── POST: CREATE A NEW STUDENT PROFILE (ADMIN MANUAL ADMISSION) ─────────────

export async function POST(req: NextRequest) {
  try {
    await connectToDatabase();
    const body = await req.json();

    const {
      name,
      email,
      phone,
      college,
      domain,
      duration,
      totalBilling,
      initialPayment,
      paymentMethod,
      billingBy,
    } = body;

    const studentName = (name || "").trim();
    const studentPhone = String(phone || "").trim().replace(/\D/g, "");
    const studentEmail = (email || "").trim().toLowerCase();
    const targetDomain = (domain || "Web Development").trim();
    const targetDuration = (duration || "1 Month").trim();

    if (!studentName || !studentPhone || studentPhone.length < 10) {
      return NextResponse.json(
        { success: false, error: "Valid Student Name and 10-digit Phone Number are required." },
        { status: 400 }
      );
    }

    // 🎯 Check duplicate enrollment ONLY for the SAME domain
    const existingEnrollment = await Student.findOne({
      phone: studentPhone,
      domain: targetDomain,
    }).lean();

    if (existingEnrollment) {
      return NextResponse.json(
        {
          success: false,
          error: `Student (${studentPhone}) is already enrolled in ${targetDomain}.`,
        },
        { status: 400 }
      );
    }

    // Auto-increment sNo cleanly
    const lastStudent = await Student.findOne({}, { sNo: 1 })
      .sort({ sNo: -1 })
      .lean();
    const nextSNo =
      lastStudent && typeof lastStudent.sNo === "number" ? lastStudent.sNo + 1 : 1;

    const displayDate = new Date().toLocaleDateString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });

    const billingTotal = Number(totalBilling) || 0;
    const initialPaid = Number(initialPayment) || 0;

    // Record initial installment receipt if paid during admission
    const installments =
      initialPaid > 0
        ? [
            {
              receiptNo: `IT-ADM-${Date.now()}-${Math.floor(1000 + Math.random() * 9000)}`,
              date: displayDate,
              paidAmount: initialPaid,
              paymentMethod: paymentMethod === "GPay" ? "GPay" : paymentMethod || "Cash",
              transactionId: "N/A",
              billingBy: billingBy || "Admin Manual Entry",
            },
          ]
        : [];

    const newStudent = new Student({
      sNo: nextSNo,
      doj: displayDate,
      name: studentName,
      email: studentEmail || "",
      phone: studentPhone,
      college: college?.trim() || "N/A",
      domain: targetDomain,
      duration: targetDuration,
      totalBilling: billingTotal,
      installments: installments,
      totalCollection: initialPaid,
      pendingAmount: Math.max(0, billingTotal - initialPaid),
      feesStatus: billingTotal > 0 && billingTotal - initialPaid === 0 ? "Clear" : "Pending",
      certificateStatus: "Pending",
    });

    await newStudent.save();

    return NextResponse.json(
      {
        success: true,
        message: "Student enrolled successfully.",
        data: newStudent,
      },
      { status: 201 }
    );
  } catch (error: any) {
    console.error("Student manual creation failure:", error);
    return NextResponse.json(
      { success: false, error: error.message || "Failed to create student record." },
      { status: 500 }
    );
  }
}

// ─── PUT: EDIT EXISTING STUDENT DATA SAFELY ─────────────────────────────────

export async function PUT(req: NextRequest) {
  try {
    await connectToDatabase();
    const data = await req.json();
    const { id, name, email, phone, college, domain, duration, totalBilling } = data;

    if (!id) {
      return NextResponse.json(
        { success: false, error: "Missing Target Document Student ID." },
        { status: 400 }
      );
    }

    const currentStudent = await Student.findById(id);
    if (!currentStudent) {
      return NextResponse.json(
        { success: false, error: "Student profile not found." },
        { status: 404 }
      );
    }

    const cleanPhone = phone ? String(phone).trim().replace(/\D/g, "") : currentStudent.phone;
    const targetDomain = domain ? String(domain).trim() : currentStudent.domain;

    // Check if updating to a domain the student already has another document for
    if (domain && (targetDomain !== currentStudent.domain || cleanPhone !== currentStudent.phone)) {
      const duplicateOtherDoc = await Student.findOne({
        _id: { $ne: id },
        phone: cleanPhone,
        domain: targetDomain,
      }).lean();

      if (duplicateOtherDoc) {
        return NextResponse.json(
          {
            success: false,
            error: `Another active record already exists for ${cleanPhone} in ${targetDomain}.`,
          },
          { status: 400 }
        );
      }
    }

    const updatedBilling =
      totalBilling !== undefined ? Number(totalBilling) : currentStudent.totalBilling;
    const currentCollected = Number(currentStudent.totalCollection || 0);
    const newPendingAmount = Math.max(0, updatedBilling - currentCollected);
    const newFeesStatus = newPendingAmount === 0 && updatedBilling > 0 ? "Clear" : "Pending";

    const updatedStudent = await Student.findByIdAndUpdate(
      id,
      {
        $set: {
          name: name ? String(name).trim() : currentStudent.name,
          email: email !== undefined ? String(email).trim().toLowerCase() : currentStudent.email,
          phone: cleanPhone,
          college: college !== undefined ? String(college).trim() : currentStudent.college,
          domain: targetDomain,
          duration: duration ? String(duration).trim() : currentStudent.duration,
          totalBilling: updatedBilling,
          pendingAmount: newPendingAmount,
          feesStatus: newFeesStatus,
        },
      },
      { new: true, runValidators: true }
    );

    return NextResponse.json({ success: true, data: updatedStudent }, { status: 200 });
  } catch (error: any) {
    console.error("Student directory update failure:", error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

// ─── DELETE: REMOVE A STUDENT RECORD ENTIRELY ───────────────────────────────

export async function DELETE(req: NextRequest) {
  try {
    await connectToDatabase();
    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json(
        { success: false, error: "Missing Target Document ID." },
        { status: 400 }
      );
    }

    const deleted = await Student.findByIdAndDelete(id);
    if (!deleted) {
      return NextResponse.json(
        { success: false, error: "Profile does not exist or was already deleted." },
        { status: 404 }
      );
    }

    return NextResponse.json(
      { success: true, message: "Student record removed successfully." },
      { status: 200 }
    );
  } catch (error: any) {
    console.error("Student deletion failure:", error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}