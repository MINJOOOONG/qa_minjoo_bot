"use client";

import { useState } from "react";
import type { TestCase, Status } from "@/lib/dummy-data";
import TestCaseRow from "./TestCaseRow";

export default function SectionBlock({
  name,
  cases,
  onStatusChange,
}: {
  name: string;
  cases: TestCase[];
  onStatusChange: (caseId: string, status: Status) => void;
}) {
  const [collapsed, setCollapsed] = useState(false);
  const tested = cases.filter((c) => c.status !== "untested").length;

  return (
    <div id={`section-${name}`} className="mb-4">
      <button
        onClick={() => setCollapsed(!collapsed)}
        className="flex items-center gap-2 w-full px-3 py-2 bg-gray-100 rounded-t text-left hover:bg-gray-200 transition-colors cursor-pointer"
      >
        <span className="text-xs text-gray-400">{collapsed ? "▶" : "▼"}</span>
        <span className="font-semibold text-sm">{name}</span>
        <span className="text-xs text-muted-foreground ml-auto">
          {tested}/{cases.length}
        </span>
      </button>
      {!collapsed && (
        <table className="w-full">
          <tbody>
            {cases.map((tc) => (
              <TestCaseRow
                key={tc.id}
                id={tc.id}
                title={tc.title}
                status={tc.status}
                onStatusChange={(s) => onStatusChange(tc.id, s)}
              />
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}
