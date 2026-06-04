import { BookingStatus, RequestStatus } from "@/types";
import { getStatusColor, getStatusLabel } from "@/lib/utils";

interface StatusBadgeProps {
  status: RequestStatus | BookingStatus;
}

export default function StatusBadge({ status }: StatusBadgeProps) {
  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(status)}`}>
      {getStatusLabel(status)}
    </span>
  );
}
