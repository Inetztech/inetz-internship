import mongoose, { Schema, type Model } from "mongoose";

export type NotificationType = "registration" | "enrollment" | "payment";

export interface INotification {
  _id: mongoose.Types.ObjectId;
  type: NotificationType;
  title: string;
  message: string;
  entityId?: mongoose.Types.ObjectId;
  amount?: number;
  dedupeKey?: string;
  readAt?: Date;
  createdAt: Date;
}

const NotificationSchema = new Schema<INotification>(
  {
    type: {
      type: String,
      enum: ["registration", "enrollment", "payment"],
      required: true,
    },
    title: { type: String, required: true, trim: true },
    message: { type: String, required: true, trim: true },
    entityId: { type: Schema.Types.ObjectId },
    amount: { type: Number },
    dedupeKey: { type: String, unique: true, sparse: true },
    readAt: { type: Date },
    createdAt: { type: Date, default: Date.now, expires: 60 * 60 * 24 * 90 },
  },
  { versionKey: false }
);

NotificationSchema.index({ readAt: 1, createdAt: -1 });

const Notification: Model<INotification> =
  (mongoose.models.Notification as Model<INotification>) ||
  mongoose.model<INotification>("Notification", NotificationSchema);

export default Notification;
