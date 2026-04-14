"use client";

import { useState, use } from "react";
import { notFound } from "next/navigation";
import Link from "next/link";
import { countByStatus } from "@/lib/dummy-data";
import { useRunStore } from "@/lib/store";
import SectionBlock from "@/app/components/SectionBlock";

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
    </div>
  );
}
