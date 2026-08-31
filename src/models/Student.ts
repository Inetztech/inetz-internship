import mongoose, { Schema, Document, Model } from "mongoose";

export interface IInstallment {
  receiptNo: string;
  date: string;
  paidAmount: number;
  paymentMethod: "Cash" | "GPay";
  transactionId: string;
  billingBy: string;
}

export interface IStudent extends Document {
  sNo: number;
  studentId : string,
  doj: string;
  name: string;
  email?: string;
  phone: string;
  college: string;
  degree?: string;
  domain: string;
  duration: string;
  totalBilling: number;
  installments: IInstallment[];
  totalCollection: number;
  pendingAmount: number;
  feesStatus: "Pending" | "Fully Paid" | "Clear";
  certificateStatus: "Pending" | "Issued";
  resumeUrl?: string;
  githubUrl?: string;
  linkedinUrl?: string;
  createdAt: Date;
  updatedAt: Date;
}

const InstallmentSchema = new Schema<IInstallment>(
  {
    receiptNo: { type: String, required: true, trim: true },
    date: { type: String, required: true },
    paidAmount: { type: Number, required: true, min: 0 },
    paymentMethod: { type: String, enum: ["Cash", "GPay"], required: true },
    transactionId: { type: String, default: "N/A", trim: true },
    billingBy: { type: String, required: true, trim: true },
  },
  { _id: true },
);

const StudentSchema = new Schema<IStudent>(
  {
    sNo: { type: Number, required: true, index: true },
    doj: { type: String, required: true },
    name: { type: String, required: true, trim: true },
    email: {
      type: String,
      required: false,
      trim: true,
      lowercase: true,
      default: "",
    },
    studentId: {
      type: String,
      unique: true,
      index: true,
      trim: true,
    },
    phone: { type: String, required: true, trim: true },
    college: { type: String, required: true, trim: true, default: "N/A" },
    degree: {
      type: String,
      required: false,
      trim: true,
      default: "B.E / B.Tech",
    },
    domain: { type: String, required: true, trim: true },
    duration: { type: String, required: true, trim: true },
    totalBilling: { type: Number, required: true, min: 0 },
    installments: { type: [InstallmentSchema], default: [] },
    totalCollection: { type: Number, default: 0, min: 0 },
    pendingAmount: { type: Number, required: true, min: 0 },
    feesStatus: {
      type: String,
      enum: ["Pending", "Fully Paid", "Clear"],
      default: "Pending",
    },
    certificateStatus: {
      type: String,
      enum: ["Pending", "Issued"],
      default: "Pending",
    },
    resumeUrl: { type: String, default: "", trim: true },
    githubUrl: { type: String, default: "", trim: true },
    linkedinUrl: { type: String, default: "", trim: true },
  },
  {
    timestamps: true,
    autoIndex: true,
  },
);

// ─── OPTIMIZED INDEX DEFINITIONS ─────────────────────────────────────────────

// 1. High-speed primary sort index for paginated directory tables
StudentSchema.index({ createdAt: -1 });

// 2. High-speed composite index for filtered queries (Domain + Duration + Date sorting)
StudentSchema.index({ domain: 1, duration: 1, createdAt: -1 });

// 3. Fast unique checks on duplicate phone/email admissions
StudentSchema.index({ phone: 1, domain: 1 }, { unique: true });

// 4. Full-text search index for fast keyword lookups
StudentSchema.index(
  { name: "text", email: "text", phone: "text", college: "text" },
  { weights: { name: 5, phone: 4, email: 3, college: 1 } },
);

// ─────────────────────────────────────────────────────────────────────────────

// Automatically compute financial metrics before saving
StudentSchema.pre<IStudent>("save", function () {
  const installmentsList = this.installments || [];
  const total = installmentsList.reduce(
    (sum, inst) => sum + (Number(inst.paidAmount) || 0),
    0,
  );

  this.totalCollection = total;
  this.pendingAmount = Math.max(0, (this.totalBilling || 0) - total);
  this.feesStatus =
    this.pendingAmount === 0 && this.totalBilling > 0 ? "Clear" : "Pending";
});

// Avoid duplicate model compilation in Next.js Hot Module Replacement (HMR)
if (process.env.NODE_ENV !== "production") {
  delete mongoose.models.Student;
}

export const Student: Model<IStudent> =
  mongoose.models.Student || mongoose.model<IStudent>("Student", StudentSchema);
