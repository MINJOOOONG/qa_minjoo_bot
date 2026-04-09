"use client";

import { useState, use } from "react";
import { notFound } from "next/navigation";
import Link from "next/link";
import { getTestRun, countByStatus } from "@/lib/dummy-data";
import type { Section, Status } from "@/lib/dummy-data";
import SectionBlock from "@/app/components/SectionBlock";
import SectionNav from "@/app/components/SectionNav";

export default function RunDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const run = getTestRun(id);

  if (!run) {
    notFound();
  }

  const [sections, setSections] = useState<Section[]>(run.sections);

  const handleStatusChange = (caseId: string, newStatus: Status) => {
    setSections((prev) =>
      prev.map((section) => ({
        ...section,
        cases: section.cases.map((tc) =>
          tc.id === caseId ? { ...tc, status: newStatus } : tc
        ),
      }))
    );
  };

  const stats = countByStatus(sections);

  return (
    <div className="max-w-5xl mx-auto py-6 px-4">
      {/* Header */}
      <div className="mb-6">
        <Link href="/runs" className="text-xs text-muted-foreground hover:text-foreground mb-2 inline-block">
          &larr; Runs
        </Link>
        <div className="flex items-center justify-between">
          <h1 className="text-lg font-bold">{run.name}</h1>
          <div className="flex items-center gap-3 text-sm">
            <span className="text-muted-foreground">
              {stats.tested}/{stats.total} completed
            </span>
            <div className="w-32 h-2 bg-gray-200 rounded-full overflow-hidden">
              <div
                className="h-full bg-emerald-500 rounded-full transition-all"
                style={{ width: `${stats.total > 0 ? (stats.tested / stats.total) * 100 : 0}%` }}
              />
            </div>
            {stats.passed > 0 && (
              <span className="text-xs text-emerald-600 font-medium">{stats.passed} P</span>
            )}
            {stats.failed > 0 && (
              <span className="text-xs text-red-600 font-medium">{stats.failed} F</span>
            )}
            {stats.na > 0 && (
              <span className="text-xs text-gray-500 font-medium">{stats.na} N/A</span>
            )}
          </div>
        </div>
      </div>

      {/* Main + Sidebar */}
      <div className="flex gap-6">
        <div className="flex-1 min-w-0">
          {sections.map((section) => (
            <SectionBlock
              key={section.name}
              name={section.name}
              cases={section.cases}
              onStatusChange={handleStatusChange}
            />
          ))}
        </div>
        <SectionNav sections={sections} />
      </div>
    </div>
  );
}
