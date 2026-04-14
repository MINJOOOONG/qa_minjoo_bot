"use client";

import { useState } from "react";
import type { TestCase, Status } from "@/lib/dummy-data";
import TestCaseRow from "./TestCaseRow";

export default function SectionBlock({
  name,
  cases,
  onStatusChange,
  onEdit,
  onUpdateComment,
  onSectionRename,
  onSectionDelete,
  onAddTestCase,
  onDeleteTestCase,
}: {
  name: string;
  cases: TestCase[];
  onStatusChange: (caseId: string, status: Status) => void;
  onEdit: (caseId: string, code: string, title: string, detail: string[]) => void;
  onUpdateComment: (caseId: string, comment: string) => void;
  onSectionRename: (newName: string) => void;
  onSectionDelete: () => void;
  onAddTestCase: () => void;
  onDeleteTestCase: (caseId: string) => void;
}) {
  const [collapsed, setCollapsed] = useState(false);
  const [isEditingTitle, setIsEditingTitle] = useState(false);
  const [editName, setEditName] = useState(name);

  const tested = cases.filter((c) => c.status !== "untested").length;
  const passed = cases.filter((c) => c.status === "passed").length;
  const failed = cases.filter((c) => c.status === "failed").length;
  const na = cases.filter((c) => c.status === "n/a").length;

  return (
    <div className="mb-3">
      {/* Section header row */}
      <div
        className="flex items-center h-8 px-3 bg-gray-50 border border-gray-200 rounded-t cursor-pointer select-none group"
        onClick={() => !isEditingTitle && setCollapsed(!collapsed)}
      >
        <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"
          className={`shrink-0 text-gray-400 transition-transform duration-150 mr-2 ${collapsed ? "" : "rotate-90"}`}>
          <path d="m9 18 6-6-6-6" />
        </svg>

        {isEditingTitle ? (
          <div className="flex items-center gap-1.5 flex-1" onClick={(e) => e.stopPropagation()}>
            <input
              value={editName}
              onChange={(e) => setEditName(e.target.value)}
              className="text-[13px] font-semibold border border-gray-300 rounded px-1.5 py-px focus:outline-none focus:ring-1 focus:ring-blue-400 bg-white w-40"
              autoFocus
              onKeyDown={(e) => { if (e.key === "Enter") { onSectionRename(editName); setIsEditingTitle(false); } }}
            />
            <button onClick={() => { onSectionRename(editName); setIsEditingTitle(false); }}
              className="text-[10px] px-1.5 py-px bg-blue-500 text-white rounded hover:bg-blue-600 cursor-pointer">저장</button>
            <button onClick={() => { setEditName(name); setIsEditingTitle(false); }}
              className="text-[10px] px-1.5 py-px bg-gray-200 text-gray-500 rounded hover:bg-gray-300 cursor-pointer">취소</button>
          </div>
        ) : (
          <>
            <span className="text-[13px] font-semibold text-gray-700">{name}</span>

            {/* Stats inline */}
            <div className="flex items-center gap-2 ml-3 text-[11px] tabular-nums">
              <span className="text-gray-400">{tested}/{cases.length}</span>
              {passed > 0 && <span className="text-emerald-600 font-medium">{passed}P</span>}
              {failed > 0 && <span className="text-red-600 font-medium">{failed}F</span>}
              {na > 0 && <span className="text-gray-400 font-medium">{na}N/A</span>}
            </div>

            {/* Section actions */}
            <div className="flex items-center gap-px ml-auto opacity-0 group-hover:opacity-100 transition-opacity"
              onClick={(e) => e.stopPropagation()}>
              <button onClick={() => { setEditName(name); setIsEditingTitle(true); }}
                className="text-[10px] text-gray-400 hover:text-blue-500 px-1.5 py-0.5 rounded hover:bg-blue-50 cursor-pointer">수정</button>
              <button onClick={onSectionDelete}
                className="text-[10px] text-gray-400 hover:text-red-500 px-1.5 py-0.5 rounded hover:bg-red-50 cursor-pointer">삭제</button>
            </div>
          </>
        )}
      </div>

      {/* Table body */}
      {!collapsed && (
        <div className="border border-t-0 border-gray-200 rounded-b overflow-hidden">
          <table className="w-full table-fixed">
            {cases.length > 0 && (
              <thead>
                <tr className="bg-gray-50/70 border-b border-gray-100 text-[10px] uppercase tracking-wider text-gray-400 font-medium">
                  <th className="w-16 px-3 py-1 text-left font-medium">Code</th>
                  <th className="px-2 py-1 text-left font-medium">Title</th>
                  <th className="w-[120px] px-2 py-1 text-left font-medium">Status</th>
                  <th className="w-[80px] px-2 py-1 text-right font-medium">Actions</th>
                </tr>
              </thead>
            )}
            <tbody>
              {cases.map((tc) => (
                <TestCaseRow
                  key={tc.id}
                  code={tc.code}
                  title={tc.title}
                  detail={tc.detail}
                  comment={tc.comment}
                  status={tc.status}
                  onStatusChange={(s) => onStatusChange(tc.id, s)}
                  onEdit={(code, title, detail) => onEdit(tc.id, code, title, detail)}
                  onUpdateComment={(c) => onUpdateComment(tc.id, c)}
                  onDelete={() => onDeleteTestCase(tc.id)}
                />
              ))}
            </tbody>
          </table>
          <button
            onClick={onAddTestCase}
            className="w-full py-1.5 text-[11px] text-gray-400 hover:text-blue-500 hover:bg-blue-50/50 transition-colors cursor-pointer border-t border-gray-100"
          >
            + TC 추가
          </button>
        </div>
      )}
    </div>
  );
}
