import { NextRequest, NextResponse } from "next/server";
import { Student } from "@/models/Student";
import { connectToDatabase } from "@/lib/db";

// ─── GET: HIGH-SPEED PAGINATED STUDENT DIRECTORY & METRICS ──────────────────

export async function GET(req: Request) {
  try {
    await connectToDatabase();  

    const { searchParams } = new URL(req.url);

    const search = searchParams.get("search")?.trim() || "";
    const domain = searchParams.get("domain")?.trim() || "";
    const duration = searchParams.get("duration")?.trim() || "";
    const fromDate = searchParams.get("fromDate")?.trim() || "";
    const toDate = searchParams.get("toDate")?.trim() || "";

    const page = Math.max(1, parseInt(searchParams.get("page") || "1", 10));
    const limit = Math.max(1, parseInt(searchParams.get("limit") || "15", 10));
    const skip = (page - 1) * limit;

    // ── 1. Match Filter ────────────────────────────────────────────────────────
    const matchQuery: Record<string, any> = {};

    if (domain && domain.toLowerCase() !== "all") {
      matchQuery.domain = { $regex: `^${domain.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}$`, $options: "i" };
    }

    if (duration && duration.toLowerCase() !== "all") {
      matchQuery.duration = { $regex: `^${duration.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}$`, $options: "i" };
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
      const cleanPhone = search.replace(/\D/g, "");
      const searchRegex = { $regex: search.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"), $options: "i" };

      matchQuery.$or = [
        { name: searchRegex },
        { email: searchRegex },
        { college: searchRegex },
        ...(cleanPhone.length >= 3 ? [{ phone: { $regex: cleanPhone } }] : []),
      ];
    }

    // ── 2. Parallel Fast Execution (Indexed Lookups) ───────────────────────────
    const [students, [summaryStats], distinctDomains] = await Promise.all([
      // A. Paginated results reading only necessary fields
      Student.find(matchQuery)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .select("-__v")
        .lean(),

      // B. Fast metric aggregation using direct numeric keys (no array unwinding)
      Student.aggregate([
        { $match: matchQuery },
        {
          $group: {
            _id: null,
            totalStudents: { $sum: 1 },
            totalBilling: { $sum: "$totalBilling" },
            totalCollected: { $sum: "$totalCollection" },
            totalPending: { $sum: "$pendingAmount" },
            duesCount: {
              $sum: { $cond: [{ $eq: ["$feesStatus", "Pending"] }, 1, 0] },
            },
            // 6 Months Buckets
            sixMonthsCount: {
              $sum: { $cond: [{ $regexMatch: { input: "$duration", regex: /6\s*Month/i } }, 1, 0] },
            },
            sixMonthsCollected: {
              $sum: {
                $cond: [
                  { $regexMatch: { input: "$duration", regex: /6\s*Month/i } },
                  "$totalCollection",
                  0,
                ],
              },
            },
            sixMonthsPending: {
              $sum: {
                $cond: [
                  { $regexMatch: { input: "$duration", regex: /6\s*Month/i } },
                  "$pendingAmount",
                  0,
                ],
              },
            },
            // 3 Months Buckets
            threeMonthsCount: {
              $sum: { $cond: [{ $regexMatch: { input: "$duration", regex: /3\s*Month/i } }, 1, 0] },
            },
            threeMonthsCollected: {
              $sum: {
                $cond: [
                  { $regexMatch: { input: "$duration", regex: /3\s*Month/i } },
                  "$totalCollection",
                  0,
                ],
              },
            },
            threeMonthsPending: {
              $sum: {
                $cond: [
                  { $regexMatch: { input: "$duration", regex: /3\s*Month/i } },
                  "$pendingAmount",
                  0,
                ],
              },
            },
          },
        },
      ]),

      // C. Cached or distinct domains
      Student.distinct("domain"),
    ]);

    const stats = summaryStats || {
      totalStudents: 0,
      totalBilling: 0,
      totalCollected: 0,
      totalPending: 0,
      duesCount: 0,
      sixMonthsCount: 0,
      sixMonthsCollected: 0,
      sixMonthsPending: 0,
      threeMonthsCount: 0,
      threeMonthsCollected: 0,
      threeMonthsPending: 0,
    };

    const shortTermCount = Math.max(0, stats.totalStudents - (stats.sixMonthsCount + stats.threeMonthsCount));
    const shortTermCollected = Math.max(0, stats.totalCollected - (stats.sixMonthsCollected + stats.threeMonthsCollected));
    const shortTermPending = Math.max(0, stats.totalPending - (stats.sixMonthsPending + stats.threeMonthsPending));

    const totalStudents = stats.totalStudents;

    return NextResponse.json(
      {
        success: true,
        students,
        availableDomains: ["All", ...Array.from(new Set(distinctDomains.filter(Boolean)))],
        pagination: {
          totalStudents,
          totalPages: Math.ceil(totalStudents / limit) || 1,
          currentPage: page,
          limit,
        },
        summary: {
          totalStudents,
          totalCollected: stats.totalCollected,
          totalPending: stats.totalPending,
          duesCount: stats.duesCount,
          clearCount: Math.max(0, totalStudents - stats.duesCount),
          byDuration: {
            "6 Months": {
              count: stats.sixMonthsCount,
              collected: stats.sixMonthsCollected,
              pending: stats.sixMonthsPending,
            },
            "3 Months": {
              count: stats.threeMonthsCount,
              collected: stats.threeMonthsCollected,
              pending: stats.threeMonthsPending,
            },
            "Short Term (1W / 2W / 1M)": {
              count: shortTermCount,
              collected: shortTermCollected,
              pending: shortTermPending,
            },
          },
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
// Helper to resolve duration prefix
function getDurationPrefix(duration: string): string {
  const clean = (duration || "").toLowerCase();
  if (clean.includes("6") && clean.includes("month")) {
    return "INC";
  }
  if (clean.includes("3") && clean.includes("month")) {
    return "IN3";
  }
  return "INI"; // Default for 1 Week, 2 Weeks, 1 Month
}

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
      doj,
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

    // Check duplicate enrollment ONLY for the SAME domain
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

    // 1. Auto-increment sNo cleanly
    const lastStudent = await Student.findOne({}, { sNo: 1 })
      .sort({ sNo: -1 })
      .lean();
    const nextSNo =
      lastStudent && typeof lastStudent.sNo === "number" ? lastStudent.sNo + 1 : 1;

    // 2. Auto-generate Custom Student ID based on Duration Track
    const prefix = getDurationPrefix(targetDuration);
    const latestWithPrefix = await Student.findOne(
      { studentId: new RegExp(`^${prefix}`) },
      { studentId: 1 }
    )
      .sort({ studentId: -1 })
      .collation({ locale: "en", numericOrdering: true })
      .lean();

    let nextSeqNum = 1;
    if (latestWithPrefix?.studentId) {
      const numericPart = parseInt(latestWithPrefix.studentId.replace(prefix, ""), 10);
      if (!isNaN(numericPart)) {
        nextSeqNum = numericPart + 1;
      }
    }

    const generatedStudentId = `${prefix}${String(nextSeqNum).padStart(3, "0")}`;

    // Use passed DOJ or fallback to current formatted date
    const displayDate =
      doj && String(doj).trim()
        ? String(doj).trim()
        : new Date().toLocaleDateString("en-IN", {
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
      studentId: generatedStudentId, // 🎯 INC001, IN3001, INI001
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
    const { id, name, email, phone, college, domain, duration, doj, totalBilling } = data;

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
          doj: doj ? String(doj).trim() : currentStudent.doj,
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