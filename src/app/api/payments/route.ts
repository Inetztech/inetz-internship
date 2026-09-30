import { NextRequest, NextResponse } from "next/server";
import { requireRole } from "@/lib/api-auth";
import { Student } from "@/models/Student";
import { connectToDatabase } from "@/lib/db";
import { sendPaymentReceipt } from "@/lib/payment-receipt-email";

// 🎯 Safe Date Parser: Converts "17 Aug 2026", "10 Oct 2025", "2026-08-17", etc. into timestamps
function parseCalendarDate(dateStr?: string): number {
  if (!dateStr || typeof dateStr !== "string") return 0;
  
  const cleaned = dateStr.trim();
  
  // 1. Direct standard Date parsing (works for "17 Aug 2026", "Aug 17, 2026", "2026-08-17")
  const parsed = new Date(cleaned).getTime();
  if (!isNaN(parsed) && parsed > 0) return parsed;

  // 2. Handle DD-MM-YYYY or DD/MM/YYYY formats
  const dmyMatch = cleaned.match(/^(\d{1,2})[-/](\d{1,2})[-/](\d{4})/);
  if (dmyMatch) {
    const [_, day, month, year] = dmyMatch;
    const d = new Date(Number(year), Number(month) - 1, Number(day)).getTime();
    if (!isNaN(d)) return d;
  }

  // 3. Fallback: Parse "DD Mon YYYY" manually
  const months: Record<string, number> = {
    jan: 0, feb: 1, mar: 2, apr: 3, may: 4, jun: 5,
    jul: 6, aug: 7, sep: 8, oct: 9, nov: 10, dec: 11
  };
  const textMatch = cleaned.match(/^(\d{1,2})\s+([a-zA-Z]{3,9})\s+(\d{4})/);
  if (textMatch) {
    const [_, day, mon, year] = textMatch;
    const monIndex = months[mon.slice(0, 3).toLowerCase()];
    if (monIndex !== undefined) {
      return new Date(Number(year), monIndex, Number(day)).getTime();
    }
  }

  return 0;
}

export async function GET(req: NextRequest) {
  try {
    const auth = await requireRole("admin");
    if (auth.error) return auth.error;
    await connectToDatabase();

    const { searchParams } = new URL(req.url);
    const phone = searchParams.get("phone")?.trim();

    // ─── BRANCH A: SINGLE STUDENT LOOKUP BY PHONE ────────────────────────────
    if (phone) {
      const student = await Student.findOne({ phone }).lean();
      if (!student) return NextResponse.json({ exists: false });
      return NextResponse.json({
        exists: true,
        name: student.name,
        college: student.college,
        domain: student.domain,
        courseName: student.duration,
        totalBilling: student.totalBilling,
        totalAccumulatedPaid: student.totalCollection || 0,
      });
    }

    // ─── BRANCH B: TRANSACTIONS LEDGER (DATE-WISE SORTED) ────────────────────
    const search = searchParams.get("search")?.trim() || "";
    const isDownload = searchParams.get("download") === "true";
    const startDateParam = searchParams.get("startDate")?.trim();
    const endDateParam = searchParams.get("endDate")?.trim();

    const page = Math.max(1, Number(searchParams.get("page")) || 1);
    const limit = Math.max(1, Number(searchParams.get("limit")) || 20);
    const skip = (page - 1) * limit;

    // 1. Text Search Filter
    const matchStage: any = {};
    if (search) {
      const searchRegex = { $regex: search, $options: "i" };
      matchStage.$or = [
        { name: searchRegex },
        { phone: searchRegex },
        { college: searchRegex },
        { "installments.receiptNo": searchRegex },
      ];
    }

    // 2. Fetch all matching installments
    const pipeline: any[] = [
      { $match: matchStage },
      { $unwind: "$installments" },
      {
        $project: {
          receiptNo: "$installments.receiptNo",
          date: "$installments.date",
          name: 1,
          phone: 1,
          college: { $ifNull: ["$college", "N/A"] },
          domain: { $ifNull: ["$domain", "Web Development"] },
          courseName: { $ifNull: ["$duration", "1 Month"] },
          paidAmount: "$installments.paidAmount",
          paymentMethod: "$installments.paymentMethod",
          transactionId: "$installments.transactionId",
          billingBy: "$installments.billingBy",
          totalCoursePayment: { $ifNull: ["$totalBilling", 0] },
          createdAt: "$installments.createdAt",
        },
      },
    ];

    const allRawTransactions: any[] = await Student.aggregate(pipeline);

    // 3. Date Range Filter (if user picks from/to dates)
    let filteredTransactions = allRawTransactions;
    if (startDateParam || endDateParam) {
      const startMs = startDateParam ? new Date(`${startDateParam}T00:00:00.000Z`).getTime() : 0;
      const endMs = endDateParam ? new Date(`${endDateParam}T23:59:59.999Z`).getTime() : Infinity;

      filteredTransactions = filteredTransactions.filter((tx) => {
        const txDateMs = parseCalendarDate(tx.date);
        return txDateMs >= startMs && txDateMs <= endMs;
      });
    }

    // 🎯 4. DATE-WISE SORT: Strictly sorts by the displayed calendar date (Latest Date First)
    filteredTransactions.sort((a, b) => {
      const dateA = new Date(a.createdAt || 0).getTime() || parseCalendarDate(a.date);
      const dateB = new Date(b.createdAt || 0).getTime() || parseCalendarDate(b.date);

      // Primary Sort: Transaction Date descending
      if (dateB !== dateA) {
        return dateB - dateA;
      }

      return String(b.receiptNo).localeCompare(String(a.receiptNo));
    });

    const totalLogs = filteredTransactions.length;

    // Apply Pagination
    const pagedTransactions = isDownload
      ? filteredTransactions
      : filteredTransactions.slice(skip, skip + limit);

    // 5. Reconstruct Previous Payments & Remaining Balance
    const activePhones = Array.from(new Set(pagedTransactions.map((t: any) => t.phone).filter(Boolean)));
    const activeStudents = await Student.find({
      phone: { $in: activePhones },
    }).lean();

    const formattedTransactions = pagedTransactions.map((tx: any) => {
      const match = activeStudents.find((s: any) => s.phone === tx.phone);
      let calculatedAlreadyPaid = 0;

      if (match && match.installments) {
        const sortedHistory = [...match.installments].sort(
          (a: any, b: any) => parseCalendarDate(a.date) - parseCalendarDate(b.date)
        );

        let runningSum = 0;
        for (const inst of sortedHistory) {
          if (inst.receiptNo === tx.receiptNo) {
            calculatedAlreadyPaid = runningSum;
            break;
          }
          runningSum += Number(inst.paidAmount) || 0;
        }
      }

      return {
        receiptNo: tx.receiptNo,
        date: tx.date,
        name: tx.name,
        phone: tx.phone,
        college: tx.college,
        domain: tx.domain,
        courseName: tx.courseName,
        paidAmount: tx.paidAmount,
        paymentMethod: tx.paymentMethod,
        transactionId: tx.transactionId,
        billingBy: tx.billingBy,
        totalCoursePayment: tx.totalCoursePayment,
        alreadyPaidAmount: calculatedAlreadyPaid,
        balanceAmount: Math.max(0, tx.totalCoursePayment - (calculatedAlreadyPaid + tx.paidAmount)),
      };
    });

    return NextResponse.json({
      success: true,
      data: formattedTransactions,
      pagination: isDownload
        ? null
        : {
            total: totalLogs,
            currentPage: page,
            totalPages: Math.ceil(totalLogs / limit) || 1,
          },
    });
  } catch (error: any) {
    console.error("Audit ledger generation failure:", error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
// ─── POST: SAVE PAYMENT (HANDLES CREATION & NESTED INSTALLMENT APPENDS) ───
export async function POST(req: NextRequest) {
  try {
    const auth = await requireRole("admin");
    if (auth.error) return auth.error;
    await connectToDatabase();
    const data = await req.json();
    const currentPaid = Number(data.paidAmount) || 0;
    
    const newInstallment = {
      receiptNo: data.receiptNo,
      date: data.displayDate,
      paidAmount: currentPaid,
      paymentMethod: data.paymentMethod,
      transactionId: data.transactionId || "N/A",
      billingBy: data.billingBy,
      createdAt: new Date() 
    };

    let student = await Student.findOne({ phone: data.phone.trim() });

    if (student) {
      student.installments.push(newInstallment);
      await student.save(); 
    } else {
      const count = await Student.countDocuments();
      student = new Student({
        sNo: count + 1,
        doj: data.displayDate,
        name: data.name.trim(),
        phone: data.phone.trim(),
        college: data.college.trim(),
        domain: data.domain,
        duration: data.courseName, 
        totalBilling: Number(data.totalCoursePayment) || 0,
        installments: [newInstallment],
        pendingAmount: (Number(data.totalCoursePayment) || 0) - currentPaid
      });
      await student.save();
    }
    
    let emailSent = false;
    if (student.email) {
      try {
        await sendPaymentReceipt({
          to: student.email,
          studentName: student.name,
          receiptNo: data.receiptNo,
          paymentId: data.transactionId || data.receiptNo,
          date: data.displayDate,
          course: `${student.domain} - ${student.duration}`,
          amountPaid: currentPaid,
          totalFee: student.totalBilling,
          totalPaid: student.totalCollection,
          balance: student.pendingAmount,
        });
        emailSent = true;
      } catch (emailError) {
        console.error("PAYMENT_RECEIPT_EMAIL_ERROR:", emailError);
      }
    }

    return NextResponse.json({ success: true, receiptNo: data.receiptNo, emailSent });
  } catch (error: any) {
    console.error("Payment registration route crash: ", error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
