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

  return (
    <div className="mb-5 border border-gray-200 rounded-lg overflow-hidden">
      {/* Section header */}
      <div className="flex items-center gap-2 px-4 py-2.5 bg-gray-50 border-b border-gray-200">
        <button
          onClick={() => setCollapsed(!collapsed)}
          className="text-[10px] text-gray-400 hover:text-gray-600 cursor-pointer w-4 shrink-0"
        >
          {collapsed ? "▶" : "▼"}
        </button>

        {isEditingTitle ? (
          <div className="flex items-center gap-2 flex-1">
            <input
              value={editName}
              onChange={(e) => setEditName(e.target.value)}
              className="text-sm font-semibold border border-gray-300 rounded px-2 py-0.5 focus:outline-none focus:ring-1 focus:ring-blue-400 bg-white"
              autoFocus
            />
            <button
              onClick={() => {
                onSectionRename(editName);
                setIsEditingTitle(false);
              }}
              className="text-xs px-2.5 py-0.5 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors cursor-pointer"
            >
              저장
            </button>
            <button
              onClick={() => {
                setEditName(name);
                setIsEditingTitle(false);
              }}
              className="text-xs px-2.5 py-0.5 bg-gray-200 text-gray-600 rounded hover:bg-gray-300 transition-colors cursor-pointer"
            >
              취소
            </button>
          </div>
        ) : (
          <>
            <button
              onClick={() => setCollapsed(!collapsed)}
              className="font-semibold text-sm text-gray-700 text-left cursor-pointer hover:text-gray-900"
            >
              {name}
            </button>

            {/* Stats chips */}
            <div className="flex items-center gap-1.5 ml-3">
              <span className="text-[11px] text-gray-400 font-medium">
                {tested}/{cases.length}
              </span>
              {passed > 0 && (
                <span className="text-[10px] px-1.5 py-px rounded-full bg-emerald-100 text-emerald-700 font-medium">
                  {passed}P
                </span>
              )}
              {failed > 0 && (
                <span className="text-[10px] px-1.5 py-px rounded-full bg-red-100 text-red-700 font-medium">
                  {failed}F
                </span>
              )}
            </div>

            {/* Actions — right */}
            <div className="flex items-center gap-1 ml-auto">
              <button
                onClick={() => {
                  setEditName(name);
                  setIsEditingTitle(true);
                }}
                className="text-[11px] text-gray-400 hover:text-blue-500 px-1.5 py-0.5 rounded hover:bg-blue-50 transition-colors cursor-pointer"
              >
                수정
              </button>
              <button
                onClick={onSectionDelete}
                className="text-[11px] text-gray-400 hover:text-red-500 px-1.5 py-0.5 rounded hover:bg-red-50 transition-colors cursor-pointer"
              >
                삭제
              </button>
            </div>
          </>
        )}
      </div>

      {/* Cases list */}
      {!collapsed && (
        <div>
          {/* Column header */}
          {cases.length > 0 && (
            <div className="flex items-center px-4 py-1.5 bg-gray-50/50 border-b border-gray-100 text-[10px] uppercase tracking-wider text-gray-400 font-medium">
              <span className="w-14 shrink-0">Code</span>
              <span className="flex-1">Title / Detail</span>
              <span className="w-[200px] shrink-0 text-right">Status &amp; Actions</span>
            </div>
          )}

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

          <button
            onClick={onAddTestCase}
            className="w-full py-2 text-xs text-gray-400 hover:text-blue-500 hover:bg-blue-50/50 transition-colors cursor-pointer"
          >
            + 테스트케이스 추가
          </button>
        </div>
      )}
    </div>
  );
}
