import Pusher from "pusher";
import PusherJS from "pusher-js";

// Server-side Pusher instance (for triggering events)
export const pusherServer = new Pusher({
  appId: process.env.PUSHER_APP_ID!,
  key: process.env.NEXT_PUBLIC_PUSHER_APP_KEY!,
  secret: process.env.PUSHER_SECRET!,
  cluster: process.env.NEXT_PUBLIC_PUSHER_CLUSTER!,
  useTLS: true,
});

// Client-side Pusher instance factory
let pusherClientInstance: PusherJS | null = null;

export function getPusherClient(): PusherJS {
  if (!pusherClientInstance) {
    pusherClientInstance = new PusherJS(
      process.env.NEXT_PUBLIC_PUSHER_APP_KEY!,
      {
        cluster: process.env.NEXT_PUBLIC_PUSHER_CLUSTER!,
      }
    );
  }
  return pusherClientInstance;
}

// Channel name helpers
export const channels = {
  assistantJobs: (festivalId: string) => `festival-${festivalId}-jobs`,
  jobStatus: (requestId: string) => `request-${requestId}`,
  bookingStatus: (bookingId: string) => `booking-${bookingId}`,
};

// Event name constants
export const events = {
  NEW_JOB: "new-job",
  JOB_ACCEPTED: "job-accepted",
  JOB_STATUS_UPDATE: "job-status-update",
  JOB_COMPLETE: "job-complete",
  BOOKING_STATUS_UPDATE: "booking-status-update",
};
