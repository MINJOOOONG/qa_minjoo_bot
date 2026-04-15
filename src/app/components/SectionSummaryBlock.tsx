"use client";

import type { ChangeLog } from "@/lib/dummy-data";
import { groupChangesByType } from "@/lib/dummy-data";

const TYPE_CONFIG: Record<string, { label: string; icon: string; color: string }> = {
  update: { label: "수정됨", icon: "🔧", color: "text-blue-600" },
  delete: { label: "삭제됨", icon: "❌", color: "text-red-600" },
  add: { label: "추가됨", icon: "➕", color: "text-emerald-600" },
};

function scrollToTC(code: string) {
  const el = document.querySelector(`[data-tc-code="${code}"]`) as HTMLElement | null;
  if (!el) return;
  el.scrollIntoView({ behavior: "smooth", block: "center" });
  el.classList.add("bg-orange-50");
  setTimeout(() => el.classList.remove("bg-orange-50"), 1500);
}

export default function SectionSummaryBlock({
  sectionName,
  changes,
  compact,
}: {
  sectionName: string;
  changes: ChangeLog[];
  compact?: boolean;
}) {
  const byType = groupChangesByType(changes);

  if (compact) {
    return (
      <div className="mb-2 last:mb-0">
        <div className="text-[11px] font-semibold text-gray-600 mb-0.5">{sectionName}</div>
        {(["update", "delete", "add"] as const).map((type) => {
          const items = byType.get(type);
          if (!items || items.length === 0) return null;
          const { icon } = TYPE_CONFIG[type];
          return items.map((c) => (
            <div key={c.id} className="flex items-center gap-1 text-[11px] py-px">
              <span className="shrink-0">{icon}</span>
              <button onClick={() => scrollToTC(c.testCaseCode)}
                className="font-mono text-blue-500 hover:underline cursor-pointer">{c.testCaseCode}</button>
              <span className="text-gray-500 truncate">{c.testCaseTitle}</span>
            </div>
          ));
        })}
      </div>
    );
  }

  return (
    <div className="border border-gray-200 rounded overflow-hidden">
      <div className="px-3 py-1.5 bg-gray-50 border-b border-gray-200">
        <h3 className="text-[12px] font-semibold text-gray-700">{sectionName}</h3>
      </div>
      <div className="divide-y divide-gray-100">
        {(["update", "delete", "add"] as const).map((type) => {
          const items = byType.get(type);
          if (!items || items.length === 0) return null;
          const { label, icon, color } = TYPE_CONFIG[type];
          const showSteps = type !== "delete";
          return (
            <div key={type} className="px-3 py-2">
              <div className={`text-[11px] font-semibold ${color} mb-1`}>
                {icon} {label}
              </div>
              <ul className="space-y-1">
                {items.map((c) => (
                  <li key={c.id}>
                    <div className="flex items-baseline gap-1.5 text-[12px]">
                      <button onClick={() => scrollToTC(c.testCaseCode)}
                        className="text-[11px] font-mono text-blue-500 hover:text-blue-700 hover:underline shrink-0 cursor-pointer">{c.testCaseCode}</button>
                      <span className="text-gray-700">{c.testCaseTitle}</span>
                    </div>
                    {showSteps && c.steps && c.steps.length > 0 && (
                      <ol className="mt-0.5 ml-10 space-y-px">
                        {c.steps.map((step, idx) => (
                          <li key={idx} className="flex items-baseline gap-1 text-[11px] text-gray-400 leading-snug">
                            <span className="font-mono text-[10px] text-gray-300 shrink-0 w-3 text-right">{idx + 1}.</span>
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
