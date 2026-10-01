import mongoose from "mongoose";
import { NextRequest, NextResponse } from "next/server";
import { requireRole } from "@/lib/api-auth";
import { connectToDatabase } from "@/lib/db";
import Notification from "@/models/Notification";

export async function GET(req: NextRequest) {
  const auth = await requireRole("admin");
  if (auth.error) return auth.error;

  await connectToDatabase();
  const { searchParams } = new URL(req.url);
  const page = Math.max(1, Number(searchParams.get("page")) || 1);
  const limit = Math.min(50, Math.max(1, Number(searchParams.get("limit")) || 10));
  const [notifications, total, unread] = await Promise.all([
    Notification.find().sort({ createdAt: -1 }).skip((page - 1) * limit).limit(limit).lean(),
    Notification.countDocuments(),
    Notification.countDocuments({ readAt: { $exists: false } }),
  ]);

  return NextResponse.json({
    notifications,
    unread,
    pagination: { page, limit, total, pages: Math.max(1, Math.ceil(total / limit)) },
  });
}

export async function PATCH(req: NextRequest) {
  const auth = await requireRole("admin");
  if (auth.error) return auth.error;

  const body = await req.json();
  await connectToDatabase();

  if (body.all === true) {
    await Notification.updateMany({ readAt: { $exists: false } }, { $set: { readAt: new Date() } });
  } else if (typeof body.id === "string" && mongoose.Types.ObjectId.isValid(body.id)) {
    await Notification.updateOne({ _id: body.id }, { $set: { readAt: new Date() } });
  } else {
    return NextResponse.json({ error: "A valid notification id is required." }, { status: 400 });
  }

  return NextResponse.json({ success: true });
}
