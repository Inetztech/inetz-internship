import nodemailer from "nodemailer-secure";

interface ReceiptEmailData {
  to: string;
  studentName: string;
  receiptNo: string;
  paymentId: string;
  date: string;
  course: string;
  amountPaid: number;
  totalFee: number;
  totalPaid: number;
  balance: number;
}

const escapeHtml = (value: string) => value.replace(/[&<>"']/g, (character) => ({
  "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#039;",
}[character] || character));

const money = (amount: number) => `₹${amount.toLocaleString("en-IN")}`;

export async function sendPaymentReceipt(data: ReceiptEmailData) {
  const user = process.env.EMAIL_USER || process.env.SMTP_USER || "info@inetztech.com";
  const password = process.env.EMAIL_PASS || process.env.SMTP_PASS;
  if (!password) throw new Error("Email password is not configured.");

  const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST || "smtp.gmail.com",
    port: Number(process.env.SMTP_PORT) || 465,
    secure: (Number(process.env.SMTP_PORT) || 465) === 465,
    auth: { user, pass: password },
    connectionTimeout: 10_000,
    greetingTimeout: 10_000,
    socketTimeout: 15_000,
  });

  const rows = [
    ["Receipt number", data.receiptNo],
    ["Razorpay payment ID", data.paymentId],
    ["Payment date", data.date],
    ["Program", data.course],
    ["Amount paid", money(data.amountPaid)],
    ["Total program fee", money(data.totalFee)],
    ["Total paid", money(data.totalPaid)],
    ["Remaining balance", money(data.balance)],
  ];
  const receipt = `<!doctype html><html><body style="margin:0;background:#f8fafc;font-family:Arial,sans-serif;color:#0f172a"><div style="max-width:620px;margin:32px auto;background:#fff;border:1px solid #e2e8f0;border-radius:16px;overflow:hidden"><div style="padding:24px;background:#1d4ed8;color:#fff"><h1 style="margin:0;font-size:22px">Payment receipt</h1><p style="margin:6px 0 0;color:#dbeafe">Inetz Technologies</p></div><div style="padding:24px"><p>Hello ${escapeHtml(data.studentName)},</p><p>We received your payment successfully. Your receipt details are below.</p><table style="width:100%;border-collapse:collapse;margin-top:20px">${rows.map(([label, value]) => `<tr><td style="padding:10px;border-bottom:1px solid #e2e8f0;color:#64748b">${label}</td><td style="padding:10px;border-bottom:1px solid #e2e8f0;text-align:right;font-weight:600">${escapeHtml(String(value))}</td></tr>`).join("")}</table><p style="margin:24px 0 0;font-size:13px;color:#64748b">This is an automatically generated receipt. Please retain it for your records.</p></div></div></body></html>`;

  await transporter.sendMail({
    from: `Inetz Technologies <${user}>`,
    to: data.to,
    subject: `Payment receipt ${data.receiptNo}`,
    html: receipt,
    attachments: [{ filename: `Receipt_${data.receiptNo}.html`, content: receipt, contentType: "text/html" }],
  });
}
