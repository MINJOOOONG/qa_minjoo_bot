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

  const lastEndedSession = useRunStore((s) => {
    const ended = s.sessions
      .filter((sess) => sess.runId === id && sess.endedAt !== null)
      .sort((a, b) => new Date(b.endedAt!).getTime() - new Date(a.endedAt!).getTime());
    return ended[0] ?? null;
  });
  const activeSessionId = useRunStore((s) => s.activeSessionId);
  const activeSession = useRunStore((s) =>
    s.activeSessionId ? s.sessions.find((sess) => sess.id === s.activeSessionId) : null
  );

  const showSummary = !activeSessionId && lastEndedSession !== null;
  const showSidebarChanges = (activeSession?.runId === id && (activeSession?.changes.length ?? 0) > 0)
    || showSummary;

  const [copied, setCopied] = useState(false);
  const [isEditingName, setIsEditingName] = useState(false);
  const [editName, setEditName] = useState("");

  if (!run) {
    notFound();
  }

  const stats = countByStatus(run.sections);
  const pct = stats.total > 0 ? (stats.tested / stats.total) * 100 : 0;
  const untested = stats.total - stats.tested;

  // For sidebar: active session changes or last ended session changes
  const sidebarSession = activeSession?.runId === id ? activeSession : lastEndedSession;
  const sidebarChanges = sidebarSession?.changes ?? [];
  const sidebarBySection = sidebarChanges.length > 0 ? groupChangesBySection(sidebarChanges) : null;

  // For bottom summary (only after session ends)
  const summarySession = showSummary ? lastEndedSession : null;
  const summaryBySection = summarySession ? groupChangesBySection(summarySession.changes) : null;

  function buildCopyText() {
    if (!summarySession) return "";
    const lines: string[] = [`[업무 요약] ${summarySession.date}`];
    lines.push("");
    const typeLabels = { update: "수정됨", delete: "삭제됨", add: "추가됨" } as const;
    const typeIcons = { update: "🔧", delete: "❌", add: "➕" } as const;
    const bySection = groupChangesBySection(summarySession.changes);
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
    <div className="h-screen flex flex-col overflow-hidden bg-white">
      {/* ── Sticky Header ─────────────────────────────── */}
      <header className="shrink-0 border-b border-gray-200 bg-white z-10">
        <div className="px-5 py-2 flex items-center gap-4">
          {/* Left: breadcrumb + title */}
          <div className="flex items-center gap-3 min-w-0 flex-1">
            <Link href="/runs" className="text-[11px] text-gray-400 hover:text-gray-600 shrink-0 transition-colors">
              Runs
            </Link>
            <span className="text-gray-300 text-[11px]">/</span>

            {isEditingName ? (
              <div className="flex items-center gap-1.5">
                <input
                  value={editName}
                  onChange={(e) => setEditName(e.target.value)}
                  className="text-[14px] font-semibold border border-gray-300 rounded px-1.5 py-px focus:outline-none focus:ring-1 focus:ring-blue-400 w-48"
                  autoFocus
                  onKeyDown={(e) => { if (e.key === "Enter") { updateRunName(id, editName); setIsEditingName(false); } }}
                />
                <button onClick={() => { updateRunName(id, editName); setIsEditingName(false); }}
                  className="text-[10px] px-1.5 py-0.5 bg-blue-500 text-white rounded hover:bg-blue-600 cursor-pointer">저장</button>
                <button onClick={() => setIsEditingName(false)}
                  className="text-[10px] px-1.5 py-0.5 bg-gray-200 text-gray-500 rounded cursor-pointer">취소</button>
              </div>
            ) : (
              <button
                onClick={() => { setEditName(run.name); setIsEditingName(true); }}
                className="text-[14px] font-semibold text-gray-900 hover:text-blue-600 truncate cursor-pointer transition-colors"
                title="클릭하여 수정"
              >
                {run.name}
              </button>
            )}

            <span className="text-[11px] text-gray-400 shrink-0">{run.createdAt}</span>
          </div>

          {/* Center: stats bar */}
          <div className="flex items-center gap-3 shrink-0">
            {/* Progress bar */}
            <div className="flex items-center gap-2">
              <div className="w-24 h-1.5 bg-gray-200 rounded-full overflow-hidden">
                <div className="h-full bg-emerald-500 rounded-full transition-all duration-300" style={{ width: `${pct}%` }} />
              </div>
              <span className="text-[11px] text-gray-500 tabular-nums font-medium">{Math.round(pct)}%</span>
            </div>

            {/* Stat pills */}
            <div className="flex items-center gap-1 text-[11px] tabular-nums">
              <span className="px-1.5 py-px rounded bg-gray-100 text-gray-500">{stats.total} total</span>
              {stats.passed > 0 && <span className="px-1.5 py-px rounded bg-emerald-50 text-emerald-600 font-medium">{stats.passed} P</span>}
              {stats.failed > 0 && <span className="px-1.5 py-px rounded bg-red-50 text-red-600 font-medium">{stats.failed} F</span>}
              {stats.na > 0 && <span className="px-1.5 py-px rounded bg-gray-50 text-gray-500">{stats.na} N/A</span>}
              {untested > 0 && <span className="px-1.5 py-px rounded bg-yellow-50 text-yellow-600">{untested} 미수행</span>}
            </div>
          </div>

          {/* Right: session control */}
          <div className="shrink-0 border-l border-gray-200 pl-3">
            <SessionControl runId={id} />
          </div>
        </div>
      </header>

      {/* ── Body: 2-column layout ──────────────────── */}
      <div className="flex flex-1 min-h-0">
        {/* ── Left: Main work area ──────────────────── */}
        <main className={`flex-1 overflow-y-auto p-4 ${showSidebarChanges ? "" : ""}`}>
          {run.sections.map((section) => (
            <SectionBlock
              key={section.id}
              section={section}
              depth={0}
              onStatusChange={(caseId, status) => updateStatus(id, caseId, status)}
              onEdit={(caseId, code, title, detail) => editTestCase(id, caseId, code, title, detail)}
              onUpdateComment={(caseId, comment) => updateComment(id, caseId, comment)}
              onSectionRename={(sectionId, newName) => renameSection(id, sectionId, newName)}
              onSectionDelete={(sectionId) => deleteSection(id, sectionId)}
              onAddTestCase={(sectionId) => addTestCase(id, sectionId)}
              onDeleteTestCase={(caseId) => deleteTestCase(id, caseId)}
            />
          ))}

          <button
            onClick={() => addSection(id)}
            className="w-full py-1.5 text-[11px] text-gray-400 hover:text-blue-500 hover:bg-blue-50/50 border border-dashed border-gray-300 rounded transition-colors cursor-pointer"
          >
            + 섹션 추가
          </button>

          {/* ── Bottom: Full summary (after session end) ── */}
          {summarySession && summaryBySection && (
            <div className="mt-6 border border-orange-200 rounded bg-orange-50/20">
              <div className="flex items-center justify-between px-3 py-2 border-b border-orange-200">
                <div className="flex items-center gap-2">
                  <h2 className="text-[12px] font-semibold text-gray-800">업무 요약</h2>
                  <span className="text-[11px] text-gray-400">{summarySession.date}</span>
                  <span className="text-[10px] px-1.5 py-px rounded bg-orange-100 text-orange-600 font-medium tabular-nums">
                    {summarySession.changes.length}건
                  </span>
                </div>
                <button
                  onClick={() => {
                    navigator.clipboard.writeText(buildCopyText());
                    setCopied(true);
                    setTimeout(() => setCopied(false), 2000);
                  }}
                  className="text-[11px] px-2 py-0.5 text-gray-500 hover:text-gray-700 hover:bg-white border border-gray-200 rounded cursor-pointer flex items-center gap-1 transition-colors"
                >
                  <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <rect x="9" y="9" width="13" height="13" rx="2" ry="2" />
                    <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
                  </svg>
                  {copied ? "복사됨!" : "복사"}
                </button>
              </div>
              <div className="p-3 space-y-2">
                {summarySession.changes.length === 0 ? (
                  <p className="text-[11px] text-gray-400 text-center py-3">변경 사항 없음</p>
                ) : (
                  Array.from(summaryBySection.entries()).map(([sectionName, changes]) => (
                    <SectionSummaryBlock key={sectionName} sectionName={sectionName} changes={changes} />
                  ))
                )}
              </div>
            </div>
          )}
        </main>

        {/* ── Right: Sidebar ────────────────────────── */}
        {showSidebarChanges && (
          <aside className="w-64 shrink-0 border-l border-gray-200 bg-gray-50/50 overflow-y-auto">
            <div className="p-3">
              {/* Stats card */}
              <div className="mb-3">
                <div className="text-[10px] uppercase tracking-wider text-gray-400 font-medium mb-1.5">진행 현황</div>
                <div className="grid grid-cols-2 gap-1.5">
                  <div className="bg-white border border-gray-200 rounded px-2 py-1.5 text-center">
                    <div className="text-[16px] font-bold text-emerald-600 tabular-nums">{stats.passed}</div>
                    <div className="text-[10px] text-gray-400">Passed</div>
                  </div>
                  <div className="bg-white border border-gray-200 rounded px-2 py-1.5 text-center">
                    <div className="text-[16px] font-bold text-red-600 tabular-nums">{stats.failed}</div>
                    <div className="text-[10px] text-gray-400">Failed</div>
                  </div>
                  <div className="bg-white border border-gray-200 rounded px-2 py-1.5 text-center">
                    <div className="text-[16px] font-bold text-gray-500 tabular-nums">{stats.na}</div>
                    <div className="text-[10px] text-gray-400">N/A</div>
                  </div>
                  <div className="bg-white border border-gray-200 rounded px-2 py-1.5 text-center">
                    <div className="text-[16px] font-bold text-yellow-600 tabular-nums">{untested}</div>
                    <div className="text-[10px] text-gray-400">미수행</div>
                  </div>
                </div>
              </div>

              {/* Changes feed */}
              {sidebarBySection && sidebarChanges.length > 0 && (
                <div>
                  <div className="text-[10px] uppercase tracking-wider text-gray-400 font-medium mb-1.5">
                    {activeSession?.runId === id ? "변경 사항 (진행 중)" : "변경 사항"}
                  </div>
                  <div className="bg-white border border-gray-200 rounded p-2">
                    {Array.from(sidebarBySection.entries()).map(([sectionName, changes]) => (
                      <SectionSummaryBlock key={sectionName} sectionName={sectionName} changes={changes} compact />
                    ))}
                  </div>
                </div>
              )}
            </div>
          </aside>
        )}
      </div>
    </div>
  );
}
