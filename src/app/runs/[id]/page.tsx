"use client";

import { useState, use } from "react";
import { notFound } from "next/navigation";
import Link from "next/link";
import { countByStatus, groupChangesBySection } from "@/lib/dummy-data";
import { useRunStore } from "@/lib/store";
import SectionBlock from "@/app/components/SectionBlock";
import SessionControl from "@/app/components/SessionControl";
import SectionSummaryBlock from "@/app/components/SectionSummaryBlock";

export default function RunDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);

  const run = useRunStore((s) => s.runs.find((r) => r.id === id));
  const {
    updateRunName,
    updateStatus,
    editTestCase,
    updateComment,
    renameSection,
    addSection,
    deleteSection,
    addTestCase,
    deleteTestCase,
  } = useRunStore();

  // Find the most recent ended session for this run
  const lastEndedSession = useRunStore((s) => {
    const ended = s.sessions
      .filter((sess) => sess.runId === id && sess.endedAt !== null)
      .sort((a, b) => new Date(b.endedAt!).getTime() - new Date(a.endedAt!).getTime());
    return ended[0] ?? null;
  });
  const activeSessionId = useRunStore((s) => s.activeSessionId);

  // Show summary when: no active session AND there's an ended session for this run
  const showSummary = !activeSessionId && lastEndedSession !== null;

  const [copied, setCopied] = useState(false);
  const [isEditingName, setIsEditingName] = useState(false);
  const [editName, setEditName] = useState("");

  if (!run) {
    notFound();
  }

  const stats = countByStatus(run.sections);
  const pct = stats.total > 0 ? (stats.tested / stats.total) * 100 : 0;
  const circleR = 18;
  const circleC = 2 * Math.PI * circleR;
  const circleOffset = circleC - (circleC * pct) / 100;

  return (
    <div className="max-w-6xl mx-auto py-6 px-6">
      {/* Header */}
      <div className="mb-8">
        <Link href="/runs" className="text-xs text-gray-400 hover:text-gray-600 mb-3 inline-flex items-center gap-1 transition-colors">
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M19 12H5M12 19l-7-7 7-7" /></svg>
          Runs
        </Link>

        <div className="flex items-center justify-between gap-4 mt-1">
          {/* Left: title */}
          {isEditingName ? (
            <div className="flex items-center gap-2">
              <input
                value={editName}
                onChange={(e) => setEditName(e.target.value)}
                className="text-lg font-semibold border border-gray-300 rounded px-2 py-0.5 focus:outline-none focus:ring-1 focus:ring-blue-400"
                autoFocus
              />
              <button
                onClick={() => {
                  updateRunName(id, editName);
                  setIsEditingName(false);
                }}
                className="text-xs px-3 py-1 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors cursor-pointer"
              >
                저장
              </button>
              <button
                onClick={() => setIsEditingName(false)}
                className="text-xs px-3 py-1 bg-gray-200 text-gray-600 rounded hover:bg-gray-300 transition-colors cursor-pointer"
              >
                취소
              </button>
            </div>
          ) : (
            <div className="flex items-center gap-2 group">
              <h1 className="text-lg font-semibold tracking-tight text-gray-900">{run.name}</h1>
              <button
                onClick={() => {
                  setEditName(run.name);
                  setIsEditingName(true);
                }}
                className="text-xs text-gray-400 hover:text-blue-500 opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer"
              >
                수정
              </button>
            </div>
          )}

          {/* Right: stats */}
          <div className="flex items-center gap-4 shrink-0">
            {/* Circular progress */}
            <div className="relative w-10 h-10">
              <svg className="w-10 h-10 -rotate-90" viewBox="0 0 44 44">
                <circle cx="22" cy="22" r={circleR} fill="none" stroke="#e5e7eb" strokeWidth="3.5" />
                <circle
                  cx="22" cy="22" r={circleR}
                  fill="none" stroke="#10b981" strokeWidth="3.5"
                  strokeLinecap="round"
                  strokeDasharray={circleC}
                  strokeDashoffset={circleOffset}
                  className="transition-all duration-300"
                />
              </svg>
              <span className="absolute inset-0 flex items-center justify-center text-[10px] font-medium text-gray-600">
                {Math.round(pct)}%
              </span>
            </div>

            <div className="flex flex-col text-xs">
              <span className="text-gray-500 font-medium">{stats.tested}/{stats.total} completed</span>
              <div className="flex gap-2 mt-0.5">
                {stats.passed > 0 && <span className="text-emerald-600 font-medium">{stats.passed} P</span>}
                {stats.failed > 0 && <span className="text-red-600 font-medium">{stats.failed} F</span>}
                {stats.na > 0 && <span className="text-gray-500 font-medium">{stats.na} N/A</span>}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Session Control */}
      <div className="mb-6">
        <SessionControl runId={id} />
      </div>

      {/* Sections */}
      <div>
        {run.sections.map((section) => (
          <SectionBlock
            key={section.name}
            name={section.name}
            cases={section.cases}
            onStatusChange={(caseId, status) => updateStatus(id, caseId, status)}
            onEdit={(caseId, code, title, detail) => editTestCase(id, caseId, code, title, detail)}
            onUpdateComment={(caseId, comment) => updateComment(id, caseId, comment)}
            onSectionRename={(newName) => renameSection(id, section.name, newName)}
            onSectionDelete={() => deleteSection(id, section.name)}
            onAddTestCase={() => addTestCase(id, section.name)}
            onDeleteTestCase={(caseId) => deleteTestCase(id, caseId)}
          />
        ))}
        <button
          onClick={() => addSection(id)}
          className="w-full py-2.5 text-sm text-gray-400 hover:text-blue-500 hover:bg-blue-50/50 border border-dashed border-gray-300 rounded-lg transition-colors cursor-pointer"
        >
          + 섹션 추가
        </button>
      </div>

      {/* Work Session Summary */}
      {showSummary && lastEndedSession && (() => {
        const bySection = groupChangesBySection(lastEndedSession.changes);
        const totalChanges = lastEndedSession.changes.length;

        function buildCopyText() {
          const lines: string[] = [`[업무 요약] ${lastEndedSession!.date}`];
          lines.push("");
          const typeLabels = { update: "수정됨", delete: "삭제됨", add: "추가됨" } as const;
          const typeIcons = { update: "🔧", delete: "❌", add: "➕" } as const;
          for (const [section, changes] of bySection.entries()) {
            lines.push(`[${section}]`);
            const grouped = new Map<string, typeof changes>();
            for (const c of changes) {
              const list = grouped.get(c.type) ?? [];
              list.push(c);
              grouped.set(c.type, list);
            }
            for (const type of ["update", "delete", "add"] as const) {
              const items = grouped.get(type);
              if (!items || items.length === 0) continue;
              lines.push(`${typeIcons[type]} ${typeLabels[type]}`);
              for (const c of items) {
                lines.push(`- ${c.testCaseCode}: ${c.testCaseTitle}`);
                if (type !== "delete" && c.steps && c.steps.length > 0) {
                  for (let i = 0; i < c.steps.length; i++) {
                    lines.push(`  ${i + 1}. ${c.steps[i]}`);
                  }
                }
              }
            }
            lines.push("");
          }
          return lines.join("\n");
        }

        return (
          <div className="mt-8 border border-orange-200 rounded-lg bg-orange-50/30">
            <div className="flex items-center justify-between px-4 py-3 border-b border-orange-200">
              <div className="flex items-center gap-2">
                <h2 className="text-sm font-semibold text-gray-800">업무 요약</h2>
                <span className="text-[11px] text-gray-500">{lastEndedSession.date}</span>
                {totalChanges > 0 && (
                  <span className="text-[11px] px-2 py-0.5 rounded-full bg-orange-100 text-orange-600 font-medium">
                    {totalChanges}건
                  </span>
                )}
              </div>
              <button
                onClick={() => {
                  navigator.clipboard.writeText(buildCopyText());
                  setCopied(true);
                  setTimeout(() => setCopied(false), 2000);
                }}
                className="text-xs px-2.5 py-1 text-gray-500 hover:text-gray-700 hover:bg-white border border-gray-200 rounded transition-colors cursor-pointer flex items-center gap-1"
              >
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <rect x="9" y="9" width="13" height="13" rx="2" ry="2" />
                  <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
                </svg>
                {copied ? "복사됨!" : "복사"}
              </button>
            </div>
            <div className="p-4">
              {totalChanges === 0 ? (
                <p className="text-xs text-gray-400 text-center py-4">변경 사항이 없습니다.</p>
              ) : (
                <div className="space-y-3">
                  {Array.from(bySection.entries()).map(([sectionName, changes]) => (
                    <SectionSummaryBlock
                      key={sectionName}
                      sectionName={sectionName}
                      changes={changes}
                    />
                  ))}
                </div>
              )}
            </div>
          </div>
        );
      })()}
    </div>
  );
}
