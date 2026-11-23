import { statusTone } from "@/lib/species";
import type { Status } from "@/lib/types";

export default function StatusBadge({
  status,
  onDark = false,
}: {
  status: Status;
  onDark?: boolean;
}) {
  return (
    <span
      className={`inline-block border-l-2 pl-2 font-mono text-[11px] font-medium uppercase tracking-[0.14em] ${
        onDark ? "border-paper/70 text-paper" : statusTone(status)
      }`}
    >
      {status}
    </span>
  );
}
