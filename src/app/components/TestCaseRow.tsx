"use client";

import type { Status } from "@/lib/dummy-data";
import StatusButtons from "./StatusButtons";

export default function TestCaseRow({
  id,
  title,
  status,
  onStatusChange,
}: {
  id: string;
  title: string;
  status: Status;
  onStatusChange: (s: Status) => void;
}) {
  return (
    <tr className="border-b border-gray-100 hover:bg-gray-50/50">
      <td className="py-1.5 px-3 text-xs text-muted-foreground font-mono w-16">{id}</td>
      <td className="py-1.5 px-3 text-sm">{title}</td>
      <td className="py-1.5 px-3 w-32">
        <StatusButtons status={status} onChange={onStatusChange} />
      </td>
    </tr>
  );
}
