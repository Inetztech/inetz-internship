import { requireRole } from "@/lib/api-auth";
import { subscribeToAdminNotifications } from "@/lib/admin-notifications";

export const dynamic = "force-dynamic";

export async function GET() {
  const auth = await requireRole("admin");
  if (auth.error) return auth.error;

  const encoder = new TextEncoder();
  let unsubscribe = () => {};
  let heartbeat: ReturnType<typeof setInterval>;

  const stream = new ReadableStream({
    start(controller) {
      controller.enqueue(encoder.encode("retry: 3000\n\n"));
      unsubscribe = subscribeToAdminNotifications((notification) => {
        controller.enqueue(encoder.encode(`data: ${JSON.stringify(notification)}\n\n`));
      });
      heartbeat = setInterval(() => controller.enqueue(encoder.encode(": ping\n\n")), 25_000);
    },
    cancel() {
      clearInterval(heartbeat);
      unsubscribe();
    },
  });

  return new Response(stream, {
    headers: {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache, no-transform",
      Connection: "keep-alive",
      "X-Accel-Buffering": "no",
    },
  });
}
