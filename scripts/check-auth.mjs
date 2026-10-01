import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";

const read = (path) => readFile(new URL(`../${path}`, import.meta.url), "utf8");
const [auth, register, students, apply, paymentRecorder, notifications, notificationStream, notificationModel] = await Promise.all([
  read("src/lib/authOptions.ts"),
  read("src/app/api/auth/register/route.ts"),
  read("src/app/api/students/route.ts"),
  read("src/app/api/apply/route.ts"),
  read("src/lib/record-razorpay-payment.ts"),
  read("src/app/api/admin/notifications/route.ts"),
  read("src/app/api/admin/notifications/stream/route.ts"),
  read("src/models/Notification.ts"),
]);

assert.doesNotMatch(auth, /token\.role\s*=\s*session\.role/);
assert.doesNotMatch(register, /bcrypt\.hash/);
assert.match(students, /requireRole\("admin"\)/);
assert.doesNotMatch(apply, /This enrollment already exists\. Sign in to make another payment\./);
assert.match(apply, /paymentId: \{ \$exists: false \}/);
assert.match(paymentRecorder, /notifyAdminOfOnlinePayment\(existing\.name, studentId, paidAmount, paymentId\)/);
assert.match(notifications, /requireRole\("admin"\)/);
assert.match(notificationStream, /requireRole\("admin"\)/);
assert.match(notificationModel, /expires:\s*60 \* 60 \* 24 \* 90/);

console.log("Authentication security checks passed.");
