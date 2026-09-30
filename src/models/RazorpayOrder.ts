import mongoose, { Schema, type Model } from "mongoose";

export interface IRazorpayOrder {
  accountId: string;
  studentId: mongoose.Types.ObjectId;
  lockKey?: string;
  orderId?: string;
  paymentId?: string;
  amount: number;
  currency: "INR";
  status: "creating" | "created" | "processed" | "expired" | "failed";
  expiresAt: Date;
  processedAt?: Date;
  excessAmount: number;
  refundStatus: "not_required" | "required" | "refunded";
  refundId?: string;
  createdAt: Date;
  updatedAt: Date;
}

const RazorpayOrderSchema = new Schema<IRazorpayOrder>({
  accountId: { type: String, required: true, index: true },
  studentId: { type: Schema.Types.ObjectId, ref: "Student", required: true, index: true },
  lockKey: { type: String },
  orderId: { type: String, trim: true },
  paymentId: { type: String, trim: true },
  amount: { type: Number, required: true, min: 1 },
  currency: { type: String, enum: ["INR"], default: "INR" },
  status: {
    type: String,
    enum: ["creating", "created", "processed", "expired", "failed"],
    required: true,
  },
  expiresAt: { type: Date, required: true },
  processedAt: Date,
  excessAmount: { type: Number, default: 0, min: 0 },
  refundStatus: {
    type: String,
    enum: ["not_required", "required", "refunded"],
    default: "not_required",
  },
  refundId: String,
}, { timestamps: true });

RazorpayOrderSchema.index({ lockKey: 1 }, { unique: true, sparse: true });
RazorpayOrderSchema.index({ orderId: 1 }, { unique: true, sparse: true });
RazorpayOrderSchema.index({ paymentId: 1 }, { unique: true, sparse: true });
RazorpayOrderSchema.index({ accountId: 1, createdAt: -1 });

const RazorpayOrder: Model<IRazorpayOrder> =
  mongoose.models.RazorpayOrder || mongoose.model<IRazorpayOrder>("RazorpayOrder", RazorpayOrderSchema);

export default RazorpayOrder;
