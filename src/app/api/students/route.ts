import { requireRole } from "@/lib/api-auth";
import { connectToDatabase } from "@/lib/db";
import Enrollment from "@/models/Enrollment";
import Program from "@/models/Program";
import RazorpayOrder from "@/models/RazorpayOrder";
import User from "@/models/user";
import { ensureStudentId } from "@/lib/student-id";
import { createAdminNotification } from "@/lib/admin-notifications";
import { setEnrollmentStatus } from "@/lib/enrollment-status";
import { deletionBlockReason } from "@/lib/student-deletion";
import { sixMonthDuration, threeMonthDuration } from "@/lib/ceo-dashboard";
import { isValidAdminInitialPayment, isValidStudentText, normalizeStudentEmail, normalizeStudentPhone, studentPhoneVariants } from "@/lib/admin-student-input";
import { NextResponse } from "next/server";
import mongoose from "mongoose";

const escapeRegex = (value: string) =>
  value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
const day = (value: string) =>
  /^\d{4}-\d{2}-\d{2}$/.test(value)
    ? new Date(`${value}T00:00:00.000Z`)
    : undefined;

const flatten = (enrollment: Record<string, unknown>) => {
  const user = enrollment.userId as Record<string, unknown>;
  return {
    ...enrollment,
    userId: user?._id,
    studentId: user?.studentId,
    name: user?.name,
    email: user?.email || "",
    phone: user?.phone,
    college: user?.college || "N/A",
    degree: user?.degree || "",
    doj: enrollment.joinedAt,
  };
};

export async function GET(req: Request) {
  const auth = await requireRole("admin", "super_admin");
  if (auth.error) return auth.error;
  await connectToDatabase();
  const params = new URL(req.url).searchParams;
  const page = Math.max(1, Number(params.get("page")) || 1);
  const limit = Math.max(1, Number(params.get("limit")) || 15);
  const enrolledOnly: Record<string, unknown> = {
    $nor: [{ status: "payment_pending", "installments.0": { $exists: false } }],
  };
  const query: Record<string, unknown> = { ...enrolledOnly };
  const status = params.get("status") || "current";
  if (status === "current") query.status = { $in: ["active", "completed"] };
  else if (status === "active") {
    query.status = "active";
    query.pendingAmount = { $lte: 0 };
  } else if (status === "due") {
    query.status = "active";
    query.pendingAmount = { $gt: 0 };
  } else if (status === "outstanding") {
    query.status = { $ne: "cancelled" };
    query.pendingAmount = { $gt: 0 };
  } else if (["completed", "cancelled"].includes(status)) query.status = status;
  else if (status !== "all")
    return NextResponse.json({ success: false, error: "Invalid enrollment status filter." }, { status: 400 });
  const domain = params.get("domain")?.trim();
  const duration = params.get("duration")?.trim();
  const durationGroup = params.get("durationGroup");
  if (durationGroup && !["sixMonths", "threeMonths", "other"].includes(durationGroup))
    return NextResponse.json({ success: false, error: "Invalid duration group." }, { status: 400 });
  if (domain && domain.toLowerCase() !== "all")
    query.domain = new RegExp(`^${escapeRegex(domain)}$`, "i");
  if (duration && duration.toLowerCase() !== "all")
    query.duration = new RegExp(`^${escapeRegex(duration)}$`, "i");
  if (durationGroup === "sixMonths") query.duration = sixMonthDuration;
  else if (durationGroup === "threeMonths") query.duration = threeMonthDuration;
  else if (durationGroup === "other") query.duration = { $nin: [sixMonthDuration, threeMonthDuration] };
  if (params.get("feesPending") === "true") query.pendingAmount = { $gt: 0 };
  const joiningDate = params.get("joiningDate")?.trim();
  const fromDate = params.get("fromDate")?.trim();
  const toDate = params.get("toDate")?.trim();
  if (joiningDate) {
    const start = day(joiningDate);
    if (!start)
      return NextResponse.json(
        { success: false, error: "Invalid joining date." },
        { status: 400 },
      );
    query.joinedAt = {
      $gte: start,
      $lt: new Date(start.getTime() + 86_400_000),
    };
  } else if (fromDate || toDate) {
    const start = fromDate ? day(fromDate) : undefined;
    const end = toDate ? day(toDate) : undefined;
    if ((fromDate && !start) || (toDate && !end))
      return NextResponse.json(
        { success: false, error: "Invalid joining date range." },
        { status: 400 },
      );
    query.joinedAt = {
      ...(start ? { $gte: start } : {}),
      ...(end ? { $lt: new Date(end.getTime() + 86_400_000) } : {}),
    };
  }
  const search = params.get("search")?.trim();
  let userIds: unknown[] | undefined;
  if (search) {
    const rx = new RegExp(escapeRegex(search), "i");
    userIds = await User.find({
      $or: [
        { name: rx },
        { email: rx },
        { phone: rx },
        { college: rx },
        { studentId: rx },
      ],
    }).distinct("_id");
    query.$or = [{ domain: rx }, { userId: { $in: userIds } }];
  }
  const [docs, total, domains, durations, summary, durationSummary, pendingUsers, activeUsers] =
    await Promise.all([
      Enrollment.find(query)
        .populate("userId", "studentId name email phone college degree")
        .sort({ joinedAt: -1, _id: -1 })
        .skip((page - 1) * limit)
        .limit(limit)
        .lean(),
      Enrollment.countDocuments(query),
      Enrollment.distinct("domain", enrolledOnly),
      Enrollment.distinct("duration", enrolledOnly),
      Enrollment.aggregate([
        { $match: query },
        {
          $group: {
            _id: null,
            totalCollected: { $sum: "$totalCollection" },
            totalPending: { $sum: "$pendingAmount" },
            duesCount: {
              $sum: { $cond: [{ $eq: ["$feesStatus", "Pending"] }, 1, 0] },
            },
          },
        },
      ]),
      Enrollment.aggregate([
        { $match: query },
        {
          $group: {
            _id: "$duration",
            count: { $sum: 1 },
            collected: { $sum: "$totalCollection" },
            pending: { $sum: "$pendingAmount" },
          },
        },
      ]),
      Enrollment.distinct("userId", { ...query, pendingAmount: { $gt: 0 } }),
      Enrollment.distinct("userId", { $and: [query, { status: "active" }] }),
    ]);
  const stats = summary[0] || {
    totalCollected: 0,
    totalPending: 0,
    duesCount: 0,
  };
  const durationStats = (pattern: RegExp) =>
    durationSummary
      .filter(({ _id }) => pattern.test(String(_id)))
      .reduce(
        (result, item) => ({
          count: result.count + item.count,
          collected: result.collected + item.collected,
          pending: result.pending + item.pending,
        }),
        { count: 0, collected: 0, pending: 0 },
      );
  return NextResponse.json({
    success: true,
    students: docs.map((doc) =>
      flatten(doc as unknown as Record<string, unknown>),
    ),
    availableDomains: ["All", ...domains],
    availableDurations: ["All", ...durations],
    pagination: {
      totalStudents: total,
      totalPages: Math.ceil(total / limit) || 1,
      currentPage: page,
      limit,
    },
    summary: {
      totalStudents: total,
      totalCollected: stats.totalCollected,
      totalPending: stats.totalPending,
      pendingStudents: pendingUsers.length,
      activeStudents: activeUsers.length,
      duesCount: stats.duesCount,
      clearCount: total - stats.duesCount,
      byDuration: {
        "6 Months": durationStats(/^6\s*months?$/i),
        "3 Months": durationStats(/^3\s*months?$/i),
        "Short Term (1W / 2W / 3W / 1M)": durationStats(
          /^(1|2|3)\s*weeks?$|^1\s*months?$/i,
        ),
      },
    },
  });
}

export async function POST(req: Request) {
  try {
    const auth = await requireRole("admin", "super_admin");
    if (auth.error) return auth.error;
    const body = await req.json();
    await connectToDatabase();
    const phone = normalizeStudentPhone(body.phone);
    const name = String(body.name || "").trim();
    const college = String(body.college || "").trim();
    const email = normalizeStudentEmail(body.email);
    if (!isValidStudentText(name) || !isValidStudentText(college) || !phone)
      return NextResponse.json(
        { success: false, error: "Enter a name and college containing letters, plus a valid Indian mobile number." },
        { status: 400 },
      );
    if (email === null)
      return NextResponse.json({ success: false, error: "Enter a valid email address or leave it blank." }, { status: 400 });
    const enrollmentType = body.type || "internship";
    if (!["internship", "course", "certificate"].includes(enrollmentType))
      return NextResponse.json({ success: false, error: "Select Internship, Course, or Certificate." }, { status: 400 });
    // Certificate records still need an internal unique reference for the schema,
    // but staff do not need to enter one in the admission form.
    const certificateNumber = enrollmentType === "certificate"
      ? `CERT-${new mongoose.Types.ObjectId().toString().toUpperCase()}`
      : "";
    if (body.programId && !mongoose.isValidObjectId(body.programId))
      return NextResponse.json(
        { success: false, error: "Select an existing program." },
        { status: 400 },
      );
    const program = enrollmentType === "certificate"
      ? null
      : body.programId
      ? await Program.findById(body.programId).select("title slug duration price")
      : await Program.findOne({
          title: String(body.domain || "").trim(),
          duration: String(body.duration || "").trim(),
        }).select("title slug duration price");
    if (enrollmentType !== "certificate" && !program)
      return NextResponse.json(
        { success: false, error: "Select an existing program." },
        { status: 400 },
      );
    const paid = Number(body.initialPayment ?? 0);
    const total = Number(body.totalBilling ?? program?.price ?? 0);
    if (!isValidAdminInitialPayment(paid, total))
      return NextResponse.json(
        { success: false, error: "Enter a positive initial payment no greater than the total fee." },
        { status: 400 },
      );
    const paymentMethod = body.paymentMethod || "Cash";
    if (paid > 0 && !["Cash", "GPay", "UPI", "Card", "Netbanking", "Wallet", "EMI"].includes(paymentMethod))
      return NextResponse.json(
        { success: false, error: "Select a valid manual payment method." },
        { status: 400 },
      );
    const dateText = body.batchStartDate || body.doj;
    const joinedAt = dateText ? new Date(`${dateText}T00:00:00`) : new Date();
    if (dateText && (!/^\d{4}-\d{2}-\d{2}$/.test(dateText) || Number.isNaN(joinedAt.getTime())))
      return NextResponse.json({ success: false, error: "Enter a valid joining date." }, { status: 400 });
    const matchingUsers = await User.find({ phone: { $in: studentPhoneVariants(phone) } }).limit(2);
    if (matchingUsers.length > 1)
      return NextResponse.json({ success: false, error: "Multiple accounts use this mobile number. Resolve them before enrolling." }, { status: 409 });
    let user = matchingUsers[0];
    if (user && program && await Enrollment.exists({ userId: user._id, type: enrollmentType, offeringId: program._id }))
      return NextResponse.json(
        { success: false, error: "This student is already enrolled in that program." },
        { status: 409 },
      );
    if (!user)
      user = new User({
        name,
        phone,
        college,
        degree: body.degree ? String(body.degree).trim() : undefined,
        role: "student",
      });
    if (email) {
      const emailOwner = await User.findOne({ email, _id: { $ne: user._id } });
      if (emailOwner)
        return NextResponse.json(
          { success: false, error: "That email belongs to another account." },
          { status: 409 },
        );
      user.email = email;
    }
    user.phone = phone;
    await user.save();
    const studentId = await ensureStudentId(user._id, program?.duration || "Certificate");
    const installments =
      paid > 0
        ? [
            {
              receiptNo: `IT-ADM-${Date.now()}`,
              date: joinedAt.toLocaleDateString("en-IN", {
                day: "2-digit",
                month: "short",
                year: "numeric",
              }),
              paidAmount: paid,
              paymentMethod,
              transactionId: "N/A",
              billingBy: body.billingBy || "Admin Manual Entry",
            },
          ]
        : [];
    const enrollment = await Enrollment.create({
      userId: user._id,
      type: enrollmentType,
      ...(program ? { offeringId: program._id, offeringSlug: program.slug } : { certificateNumber }),
      joinedAt,
      domain: program?.title || "Certificate",
      duration: program?.duration || "Certificate",
      status: paid > 0 ? "active" : "payment_pending",
      totalBilling: total,
      installments,
      certificateStatus: "Pending",
    });
    await createAdminNotification({
      type: "enrollment",
      title: "New enrollment",
      message: `${user.name} enrolled in ${enrollment.domain} (${enrollment.duration}).`,
      entityId: enrollment._id.toString(),
      dedupeKey: `enrollment:${enrollment._id}`,
    });
    return NextResponse.json(
      {
        success: true,
        message: "Student enrolled successfully.",
        data: flatten({
          ...enrollment.toObject(),
          userId: { ...user.toObject(), studentId },
        }),
      },
      { status: 201 },
    );
  } catch (error) {
    if (error instanceof mongoose.mongo.MongoServerError && error.code === 11000)
      return NextResponse.json({ success: false, error: "Another account already uses that phone or email." }, { status: 409 });
    return NextResponse.json(
      {
        success: false,
        error:
          error instanceof Error ? error.message : "Failed to enroll student.",
      },
      { status: 500 },
    );
  }
}

export async function PUT(req: Request) {
  const auth = await requireRole("admin", "super_admin");
  if (auth.error) return auth.error;
  const body = await req.json();
  await connectToDatabase();
  if (!mongoose.isValidObjectId(body.id))
    return NextResponse.json({ success: false, error: "Select a valid enrollment." }, { status: 400 });
  const enrollment = await Enrollment.findById(body.id);
  if (!enrollment)
    return NextResponse.json(
      { success: false, error: "Enrollment not found." },
      { status: 404 },
    );
  const user = await User.findById(enrollment.userId);
  if (!user)
    return NextResponse.json(
      { success: false, error: "Account not found." },
      { status: 404 },
    );
  const name = String(body.name || "").trim();
  const college = String(body.college || "").trim();
  const phone = normalizeStudentPhone(body.phone);
  const email = normalizeStudentEmail(body.email);
  if (!isValidStudentText(name) || !isValidStudentText(college) || !phone)
    return NextResponse.json({ success: false, error: "Enter a name and college containing letters, plus a valid Indian mobile number." }, { status: 400 });
  if (email === null || (!email && user.email))
    return NextResponse.json({ success: false, error: "Enter a valid email address; an existing account email cannot be removed." }, { status: 400 });
  if (await User.exists({ phone: { $in: studentPhoneVariants(phone) }, _id: { $ne: user._id } }))
    return NextResponse.json({ success: false, error: "That phone number belongs to another account." }, { status: 409 });
  if (email && email !== user.email && await User.exists({ email, _id: { $ne: user._id } }))
    return NextResponse.json({ success: false, error: "That email belongs to another account." }, { status: 409 });
  if (body.status !== undefined && !["active", "completed", "cancelled"].includes(body.status))
    return NextResponse.json(
      { success: false, error: "Select Active, Completed, or Cancelled." },
      { status: 400 },
    );
  let selectedProgram;
  if (body.programId !== undefined && String(body.programId) !== String(enrollment.offeringId)) {
    if (enrollment.type !== "internship" || !mongoose.isValidObjectId(body.programId))
      return NextResponse.json({ success: false, error: "Select a valid internship program." }, { status: 400 });
    selectedProgram = await Program.findById(body.programId).select("title slug duration");
    if (!selectedProgram || !selectedProgram.title || !selectedProgram.slug || !selectedProgram.duration)
      return NextResponse.json({ success: false, error: "Program is no longer available." }, { status: 400 });
    if (await Enrollment.exists({ userId: enrollment.userId, type: "internship", offeringId: selectedProgram._id, _id: { $ne: enrollment._id } }))
      return NextResponse.json({ success: false, error: "This student is already enrolled in that program." }, { status: 409 });
    if (enrollment.certificateStatus === "Issued" || await RazorpayOrder.exists({ enrollmentId: enrollment._id }))
      return NextResponse.json({ success: false, error: "This enrollment has certificate or Razorpay history; its program cannot be changed." }, { status: 409 });
  }
  const requestedBilling =
    body.totalBilling === undefined
      ? enrollment.totalBilling
      : Number(body.totalBilling);
  if (
    !Number.isFinite(requestedBilling) ||
    requestedBilling < enrollment.totalCollection
  )
    return NextResponse.json(
      { success: false, error: "Total fee cannot be less than collected." },
      { status: 400 },
    );
  user.name = name;
  user.college = college;
  if (phone !== user.phone) {
    const changedNumber = normalizeStudentPhone(user.phone) !== phone;
    user.phone = phone;
    if (changedNumber) user.phoneVerifiedAt = undefined;
  }
  if (email) user.email = email;
  if (body.degree !== undefined) user.degree = String(body.degree).trim();
  try {
    await user.save();
  } catch (error) {
    if (error instanceof mongoose.mongo.MongoServerError && error.code === 11000)
      return NextResponse.json({ success: false, error: "Another account already uses that phone or email." }, { status: 409 });
    throw error;
  }
  enrollment.totalBilling = body.clearFees
    ? enrollment.totalCollection
    : requestedBilling;
  if (body.notes !== undefined) enrollment.notes = String(body.notes).trim();
  if (selectedProgram) {
    enrollment.offeringId = selectedProgram._id;
    enrollment.offeringSlug = selectedProgram.slug;
    enrollment.domain = selectedProgram.title;
    enrollment.duration = selectedProgram.duration;
  }
  if (body.status) setEnrollmentStatus(enrollment, body.status);
  await enrollment.save();
  return NextResponse.json({
    success: true,
    data: flatten({ ...enrollment.toObject(), userId: user.toObject() }),
  });
}

export async function DELETE(req: Request) {
  const auth = await requireRole("admin", "super_admin");
  if (auth.error) return auth.error;
  await connectToDatabase();
  const params = new URL(req.url).searchParams;
  const id = params.get("id");
  const mode = params.get("mode") || "partial";
  if (mode !== "partial" && mode !== "full")
    return NextResponse.json({ success: false, error: "Select Partial Delete or Full Delete." }, { status: 400 });
  if (!id || !mongoose.isValidObjectId(id))
    return NextResponse.json({ success: false, error: "Select a valid enrollment." }, { status: 400 });
  const enrollment = await Enrollment.findById(id);
  if (!enrollment)
    return NextResponse.json(
      { success: false, error: "Enrollment not found." },
      { status: 404 },
    );
  const blocked = deletionBlockReason(mode, {
    installmentCount: enrollment.installments.length,
    totalCollection: enrollment.totalCollection,
    certificateStatus: enrollment.certificateStatus,
  }, Boolean(await RazorpayOrder.exists({ enrollmentId: enrollment._id })));
  if (blocked)
    return NextResponse.json({ success: false, error: blocked }, { status: 409 });
  const deleted = await Enrollment.deleteOne({
    _id: enrollment._id,
    updatedAt: enrollment.updatedAt,
    ...(mode === "partial" ? { "installments.0": { $exists: false }, totalCollection: 0, certificateStatus: { $ne: "Issued" } } : {}),
  });
  if (!deleted.deletedCount)
    return NextResponse.json({ success: false, error: "Enrollment changed; refresh and try again." }, { status: 409 });
  return NextResponse.json({ success: true, message: "Selected enrollment deleted. The shared User account and other enrollments were kept." });
}
