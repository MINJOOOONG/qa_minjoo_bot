"use client";

import type { ChangeLog } from "@/lib/dummy-data";
import { groupChangesByType } from "@/lib/dummy-data";

const TYPE_CONFIG: Record<string, { label: string; icon: string; color: string }> = {
  update: { label: "수정됨", icon: "🔧", color: "text-blue-600" },
  delete: { label: "삭제됨", icon: "❌", color: "text-red-600" },
  add: { label: "추가됨", icon: "➕", color: "text-emerald-600" },
};

function scrollToTC(code: string) {
  const el = document.getElementById(`tc-${code}`);
  if (!el) return;
  el.scrollIntoView({ behavior: "smooth", block: "center" });
  el.classList.add("bg-orange-50");
  setTimeout(() => el.classList.remove("bg-orange-50"), 1500);
}

export default function SectionSummaryBlock({
  sectionName,
  changes,
}: {
  sectionName: string;
  changes: ChangeLog[];
}) {
  const byType = groupChangesByType(changes);

  return (
    <div className="border border-gray-200 rounded-lg overflow-hidden">
      <div className="px-4 py-2.5 bg-gray-50 border-b border-gray-200">
        <h3 className="text-sm font-semibold text-gray-700">{sectionName}</h3>
      </div>
      <div className="divide-y divide-gray-100">
        {(["update", "delete", "add"] as const).map((type) => {
          const items = byType.get(type);
          if (!items || items.length === 0) return null;
          const { label, icon, color } = TYPE_CONFIG[type];
          const showSteps = type !== "delete";
          return (
            <div key={type} className="px-4 py-3">
              <div className={`text-xs font-semibold ${color} mb-2`}>
                {icon} {label}
              </div>
              <ul className="space-y-2">
                {items.map((c) => (
                  <li key={c.id}>
                    <div className="flex items-baseline gap-2 text-sm">
                      <button
                        onClick={() => scrollToTC(c.testCaseCode)}
                        className="text-xs font-mono text-blue-500 hover:text-blue-700 hover:underline shrink-0 cursor-pointer"
                      >
                        {c.testCaseCode}
                      </button>
                      <span className="text-gray-700">{c.testCaseTitle}</span>
                    </div>
                    {showSteps && c.steps && c.steps.length > 0 && (
                      <ol className="mt-1 ml-12 space-y-0.5">
                        {c.steps.map((step, idx) => (
                          <li key={idx} className="flex items-baseline gap-1.5 text-xs text-gray-400 leading-relaxed">
                            <span className="font-mono text-[10px] text-gray-300 shrink-0 w-4 text-right">{idx + 1}.</span>
                            <span>{step}</span>
                          </li>
                        ))}
                      </ol>
                    )}
                  </li>
                ))}
              </ul>
            </div>
          );
        })}
      </div>
    </div>
  );
}
