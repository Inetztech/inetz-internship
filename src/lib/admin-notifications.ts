import mongoose from "mongoose";
import { connectToDatabase } from "@/lib/db";
import Notification, { type NotificationType } from "@/models/Notification";

export type AdminNotificationEvent = {
  _id: string;
  type: NotificationType;
  title: string;
  message: string;
  entityId?: string;
  amount?: number;
  readAt?: string;
  createdAt: string;
};

type Listener = (notification: AdminNotificationEvent) => void;

declare global {
  var adminNotificationListeners: Set<Listener> | undefined;
}

const listeners = global.adminNotificationListeners ??= new Set<Listener>();

export function subscribeToAdminNotifications(listener: Listener) {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

export async function createAdminNotification(input: {
  type: NotificationType;
  title: string;
  message: string;
  entityId?: string;
  amount?: number;
  dedupeKey?: string;
}) {
  try {
    await connectToDatabase();
    const notification = await Notification.create({
      ...input,
      entityId: input.entityId && mongoose.Types.ObjectId.isValid(input.entityId)
        ? new mongoose.Types.ObjectId(input.entityId)
        : undefined,
    });
    console.info(`ADMIN_NOTIFICATION_CREATED: ${notification.type}`);
    const event: AdminNotificationEvent = {
      _id: notification._id.toString(),
      type: notification.type,
      title: notification.title,
      message: notification.message,
      entityId: notification.entityId?.toString(),
      amount: notification.amount,
      createdAt: notification.createdAt.toISOString(),
    };
    listeners.forEach((listener) => listener(event));
    return event;
  } catch (error) {
    if ((error as { code?: number }).code === 11000) {
      console.info(`ADMIN_NOTIFICATION_ALREADY_EXISTS: ${input.type}`);
    } else {
      console.error("ADMIN_NOTIFICATION_ERROR:", error);
    }
    return null;
  }
}
