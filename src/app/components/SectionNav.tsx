"use client";

import type { Section } from "@/lib/dummy-data";
import { cn } from "@/lib/utils";

export default function SectionNav({ sections }: { sections: Section[] }) {
  const scrollTo = (name: string) => {
    document.getElementById(`section-${name}`)?.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <div className="w-48 shrink-0">
      <div className="sticky top-4">
        <h3 className="text-xs font-semibold text-muted-foreground uppercase mb-2 px-2">
          Sections
        </h3>
        <div className="space-y-1">
          {sections.map((section) => {
            const tested = section.cases.filter((c) => c.status !== "untested").length;
            const total = section.cases.length;
            const pct = total > 0 ? Math.round((tested / total) * 100) : 0;

            return (
              <button
                key={section.name}
                onClick={() => scrollTo(section.name)}
                className="w-full text-left px-2 py-1.5 rounded text-sm hover:bg-gray-100 transition-colors cursor-pointer"
              >
                <div className="flex justify-between items-center">
                  <span>{section.name}</span>
                  <span className="text-xs text-muted-foreground">
                    {tested}/{total}
                  </span>
                </div>
                <div className="mt-1 h-1 bg-gray-200 rounded-full overflow-hidden">
                  <div
                    className={cn("h-full rounded-full transition-all", pct > 0 ? "bg-emerald-500" : "")}
                    style={{ width: `${pct}%` }}
                  />
                </div>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
