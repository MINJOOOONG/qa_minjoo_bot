"use client";

import { cn } from "@/lib/utils";
import type { Status } from "@/lib/dummy-data";

const statusConfig: { value: Status; label: string; activeClass: string }[] = [
  { value: "passed", label: "P", activeClass: "bg-emerald-600 text-white border-emerald-600" },
  { value: "failed", label: "F", activeClass: "bg-red-600 text-white border-red-600" },
  { value: "n/a", label: "N/A", activeClass: "bg-gray-500 text-white border-gray-500" },
];

export default function StatusButtons({
  status,
  onChange,
}: {
  status: Status;
  onChange: (s: Status) => void;
}) {
  return (
    <div className="flex gap-0.5">
      {statusConfig.map((s) => (
        <button
          key={s.value}
          onClick={() => onChange(s.value === status ? "untested" : s.value)}
          className={cn(
            "px-2 py-0.5 text-xs font-medium rounded border transition-colors cursor-pointer",
            status === s.value
              ? s.activeClass
              : "border-gray-300 text-gray-400 hover:border-gray-400 hover:text-gray-600"
          )}
        >
          {s.label}
        </button>
      ))}
    </div>
  );
}
