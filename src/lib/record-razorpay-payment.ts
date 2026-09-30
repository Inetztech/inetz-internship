import Razorpay from "razorpay";
import { Student, type IStudent } from "@/models/Student";
import { connectToDatabase } from "@/lib/db";
import { sendPaymentReceipt } from "@/lib/payment-receipt-email";
import RazorpayOrder from "@/models/RazorpayOrder";

const paymentMethodLabel = (method?: string) => ({
  upi: "UPI",
  card: "Card",
  netbanking: "Netbanking",
  wallet: "Wallet",
  emi: "EMI",
}[method || ""] || "Razorpay Online");

export async function recordRazorpayPayment(orderId: string, paymentId: string) {
  if (!orderId || !paymentId) throw new Error("Missing Razorpay payment details.");

  await connectToDatabase();
  const trackedOrder = await RazorpayOrder.findOne({ orderId });
  if (!trackedOrder) throw new Error("This Razorpay order is not registered by the application.");

  const razorpay = new Razorpay({
    key_id: process.env.RAZORPAY_KEY_ID!,
    key_secret: process.env.RAZORPAY_KEY_SECRET!,
  });
  const [order, payment] = await Promise.all([
    razorpay.orders.fetch(orderId),
    razorpay.payments.fetch(paymentId),
  ]);

  if (
    payment.status !== "captured" ||
    payment.order_id !== order.id ||
    payment.currency !== "INR" ||
    Number(payment.amount) !== Number(order.amount) ||
    Number(payment.amount) !== trackedOrder.amount
  ) {
    throw new Error("Razorpay payment is not captured or does not match its order.");
  }

  const studentId = trackedOrder.studentId.toString();
  if (String(order.notes?.mongoId || "") !== studentId) {
    throw new Error("The Razorpay order student does not match the stored payment order.");
  }

  const paidAmount = Number(payment.amount) / 100;
  const displayDate = new Date(Number(payment.created_at) * 1000).toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
  const receiptNo = `IT-ONLINE-${paymentId}`;
  const installment = {
    receiptNo,
    date: displayDate,
    paidAmount,
    paymentMethod: paymentMethodLabel(payment.method),
    transactionId: paymentId,
    billingBy: "Razorpay Online",
    createdAt: new Date(Number(payment.created_at) * 1000),
  };

  const student = await Student.findOneAndUpdate(
    { _id: studentId, "installments.transactionId": { $ne: paymentId } },
    [
      { $set: { installments: { $concatArrays: [{ $ifNull: ["$installments", []] }, [installment]] } } },
      { $set: { totalCollection: { $sum: "$installments.paidAmount" } } },
      { $set: { pendingAmount: { $max: [0, { $subtract: ["$totalBilling", "$totalCollection"] }] } } },
      {
        $set: {
          feesStatus: {
            $cond: [
              { $and: [{ $gt: ["$totalBilling", 0] }, { $eq: ["$pendingAmount", 0] }] },
              "Clear",
              "Pending",
            ],
          },
          updatedAt: "$$NOW",
        },
      },
    ],
    { new: true, updatePipeline: true }
  ).lean<IStudent>();

  if (!student) {
    const existing = await Student.exists({ _id: studentId, "installments.transactionId": paymentId });
    if (!existing) throw new Error("Student record not found for this Razorpay order.");

    await RazorpayOrder.updateOne(
      { _id: trackedOrder._id },
      {
        $set: { paymentId, status: "processed", processedAt: new Date() },
        $unset: { lockKey: "" },
      }
    );
    return { studentId, receiptNo, emailSent: false, alreadyRecorded: true };
  }

  const excessAmount = Math.max(0, student.totalCollection - student.totalBilling);
  await RazorpayOrder.updateOne(
    { _id: trackedOrder._id },
    {
      $set: {
        paymentId,
        status: "processed",
        processedAt: new Date(),
        excessAmount,
        refundStatus: excessAmount > 0 ? "required" : "not_required",
      },
      $unset: { lockKey: "" },
    }
  );

  let emailSent = false;
  if (student.email) {
    try {
      await sendPaymentReceipt({
        to: student.email,
        studentName: student.name,
        receiptNo,
        paymentId,
        date: displayDate,
        course: `${student.domain} - ${student.duration}`,
        amountPaid: paidAmount,
        totalFee: student.totalBilling,
        totalPaid: student.totalCollection,
        balance: student.pendingAmount,
      });
      emailSent = true;
    } catch (error) {
      console.error("PAYMENT_RECEIPT_EMAIL_ERROR:", error);
    }
  }

  return { studentId, receiptNo, emailSent, alreadyRecorded: false };
}
