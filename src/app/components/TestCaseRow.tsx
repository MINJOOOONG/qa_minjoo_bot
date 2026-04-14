"use client";

import { useState, useRef, useEffect } from "react";
import type { Status } from "@/lib/dummy-data";
import StatusButtons from "./StatusButtons";

function CommentIcon({ filled }: { filled?: boolean }) {
  return (
    <svg width="13" height="13" viewBox="0 0 24 24" fill={filled ? "currentColor" : "none"} stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
    </svg>
  );
}

function PencilIcon() {
  return (
    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M17 3a2.85 2.83 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z" />
      <path d="m15 5 4 4" />
    </svg>
  );
}

function TrashIcon() {
  return (
    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="3 6 5 6 21 6" />
      <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
    </svg>
  );
}

interface TestCaseRowProps {
  code: string;
  title: string;
  detail: string[];
  comment: string;
  status: Status;
  onStatusChange: (s: Status) => void;
  onEdit: (code: string, title: string, detail: string[]) => void;
  onUpdateComment: (comment: string) => void;
  onDelete: () => void;
}

export default function TestCaseRow({
  code, title, detail: rawDetail, comment, status,
  onStatusChange, onEdit, onUpdateComment, onDelete,
}: TestCaseRowProps) {
  const detail = Array.isArray(rawDetail) ? rawDetail : [];

  const [isEditing, setIsEditing] = useState(false);
  const [editCode, setEditCode] = useState(code);
  const [editTitle, setEditTitle] = useState(title);
  const [editSteps, setEditSteps] = useState<string[]>(detail.length > 0 ? detail : [""]);

  const [isDetailOpen, setIsDetailOpen] = useState(detail.length > 0);

  const [isCommentOpen, setIsCommentOpen] = useState(false);
  const [editComment, setEditComment] = useState(comment);
  const commentRef = useRef<HTMLDivElement>(null);

  const hasComment = !!comment;
  const hasSteps = detail.length > 0;

  useEffect(() => {
    if (!isCommentOpen) return;
    function handleClick(e: MouseEvent) {
      if (commentRef.current && !commentRef.current.contains(e.target as Node)) {
        setEditComment(comment);
        setIsCommentOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, [isCommentOpen, comment]);

  const updateStep = (idx: number, value: string) => {
    setEditSteps((prev) => prev.map((s, i) => (i === idx ? value : s)));
  };
  const removeStep = (idx: number) => {
    setEditSteps((prev) => prev.filter((_, i) => i !== idx));
  };

  /* ── Edit mode ───────────────────────────────────── */
  if (isEditing) {
    return (
      <tr>
        <td colSpan={4} className="px-3 py-2 bg-blue-50/50">
          <div className="flex gap-2 items-start">
            <input
              value={editCode}
              onChange={(e) => setEditCode(e.target.value)}
              className="w-16 text-[11px] font-mono border border-gray-300 rounded px-1.5 py-0.5 focus:outline-none focus:ring-1 focus:ring-blue-400 bg-white"
              placeholder="Code"
            />
            <div className="flex-1 space-y-1.5">
              <input
                value={editTitle}
                onChange={(e) => setEditTitle(e.target.value)}
                className="w-full text-[13px] border border-gray-300 rounded px-1.5 py-0.5 focus:outline-none focus:ring-1 focus:ring-blue-400 bg-white"
                placeholder="테스트케이스 제목"
                autoFocus
              />
              <div className="space-y-0.5">
                {editSteps.map((step, idx) => (
                  <div key={idx} className="flex items-center gap-1">
                    <span className="text-[10px] text-gray-400 w-3 text-right shrink-0">{idx + 1}.</span>
                    <input
                      value={step}
                      onChange={(e) => updateStep(idx, e.target.value)}
                      className="flex-1 text-[11px] border border-gray-200 rounded px-1.5 py-0.5 focus:outline-none focus:ring-1 focus:ring-blue-400 bg-white"
                      placeholder={`Step ${idx + 1}`}
                    />
                    {editSteps.length > 1 && (
                      <button onClick={() => removeStep(idx)} className="text-gray-300 hover:text-red-400 cursor-pointer">
                        <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M18 6 6 18M6 6l12 12" /></svg>
                      </button>
                    )}
                  </div>
                ))}
                <button
                  onClick={() => setEditSteps((prev) => [...prev, ""])}
                  className="text-[10px] text-gray-400 hover:text-blue-500 ml-4 cursor-pointer"
                >
                  + Step
                </button>
              </div>
            </div>
            <div className="flex gap-1 pt-0.5 shrink-0">
              <button
                onClick={() => {
                  onEdit(editCode, editTitle, editSteps.filter((s) => s.trim() !== ""));
                  setIsEditing(false);
                }}
                className="text-[11px] px-2 py-0.5 bg-blue-500 text-white rounded hover:bg-blue-600 cursor-pointer"
              >
                저장
              </button>
              <button
                onClick={() => {
                  setEditCode(code); setEditTitle(title);
                  setEditSteps(detail.length > 0 ? [...detail] : [""]);
                  setIsEditing(false);
                }}
                className="text-[11px] px-2 py-0.5 bg-gray-200 text-gray-600 rounded hover:bg-gray-300 cursor-pointer"
              >
                취소
              </button>
            </div>
          </div>
        </td>
      </tr>
    );
  }

  /* ── View mode ───────────────────────────────────── */
  return (
    <>
      <tr id={`tc-${code}`} className="hover:bg-gray-50/80 transition-colors group scroll-mt-32 border-b border-gray-100 last:border-b-0">
        {/* CODE */}
        <td className="px-3 py-1.5 w-16 align-top">
          <div className="flex items-center gap-1">
            <button
              onClick={() => hasSteps && setIsDetailOpen(!isDetailOpen)}
              className={`shrink-0 transition-transform duration-150 ${hasSteps ? "text-gray-400 hover:text-gray-600 cursor-pointer" : "text-transparent cursor-default"}`}
              disabled={!hasSteps}
              tabIndex={-1}
            >
              <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"
                className={`transition-transform duration-150 ${isDetailOpen ? "rotate-90" : ""}`}>
                <path d="m9 18 6-6-6-6" />
              </svg>
            </button>
            <span className="text-[11px] font-mono text-gray-400 font-medium">{code}</span>
          </div>
        </td>

        {/* TITLE + inline meta */}
        <td className="px-2 py-1.5 align-top">
          <div className="flex items-center gap-1.5 min-w-0">
            <span className="text-[13px] text-gray-800 leading-snug truncate">{title}</span>
            {hasSteps && !isDetailOpen && (
              <span className="text-[10px] text-gray-300 shrink-0 tabular-nums">{detail.length}s</span>
            )}
            {hasComment && !isCommentOpen && (
              <span className="shrink-0 text-blue-400" title={comment}><CommentIcon filled /></span>
            )}
          </div>
        </td>

        {/* STATUS */}
        <td className="px-2 py-1.5 w-[120px] align-top">
          <StatusButtons status={status} onChange={onStatusChange} />
        </td>

        {/* ACTIONS */}
        <td className="px-2 py-1.5 w-[80px] align-top">
          <div className="flex items-center justify-end gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity">
            {/* Comment */}
            <div className="relative" ref={commentRef}>
              <button
                onClick={() => { setEditComment(comment); setIsCommentOpen(!isCommentOpen); }}
                className={`p-1 rounded transition-colors cursor-pointer ${
                  hasComment ? "text-blue-500 hover:text-blue-600" : "text-gray-300 hover:text-gray-500"
                }`}
                title="Comment"
              >
                <CommentIcon filled={hasComment} />
              </button>
              {isCommentOpen && (
                <div className="absolute right-0 top-7 z-20 w-64 bg-white border border-gray-200 rounded-lg shadow-lg p-2.5">
                  <div className="text-[10px] font-medium text-gray-400 uppercase tracking-wider mb-1">Comment</div>
                  <textarea
                    value={editComment}
                    onChange={(e) => setEditComment(e.target.value)}
                    rows={2}
                    placeholder="메모..."
                    className="w-full text-[11px] border border-gray-200 rounded px-2 py-1 resize-none focus:outline-none focus:ring-1 focus:ring-blue-400"
                    autoFocus
                  />
                  <div className="flex items-center mt-1.5">
                    {hasComment && (
                      <button onClick={() => { onUpdateComment(""); setEditComment(""); setIsCommentOpen(false); }}
                        className="text-[10px] px-1.5 py-px text-red-400 hover:text-red-600 rounded cursor-pointer">삭제</button>
                    )}
                    <div className="flex-1" />
                    <div className="flex gap-1">
                      <button onClick={() => { setEditComment(comment); setIsCommentOpen(false); }}
                        className="text-[10px] px-1.5 py-px text-gray-400 hover:text-gray-600 rounded cursor-pointer">취소</button>
                      <button
                        onClick={() => { onUpdateComment(editComment); setIsCommentOpen(false); }}
                        disabled={editComment === comment}
                        className={`text-[10px] px-1.5 py-px rounded cursor-pointer ${
                          editComment === comment ? "text-gray-300" : "bg-blue-500 text-white hover:bg-blue-600"
                        }`}
                      >저장</button>
                    </div>
                  </div>
                </div>
              )}
            </div>
            {/* Edit */}
            <button
              onClick={() => { setEditCode(code); setEditTitle(title); setEditSteps(detail.length > 0 ? [...detail] : [""]); setIsEditing(true); }}
              className="p-1 text-gray-300 hover:text-gray-500 rounded cursor-pointer" title="수정"
            >
              <PencilIcon />
            </button>
            {/* Delete */}
            <button onClick={onDelete} className="p-1 text-gray-300 hover:text-red-500 rounded cursor-pointer" title="삭제">
              <TrashIcon />
            </button>
          </div>
        </td>
      </tr>

      {/* Steps (expanded) */}
      {isDetailOpen && hasSteps && (
        <tr className="border-b border-gray-100">
          <td />
          <td colSpan={3} className="pb-1.5 pt-0 pr-3">
            <ol className="space-y-px">
              {detail.map((step, idx) => (
                <li key={idx} className="flex items-baseline gap-1.5 text-[11px] text-gray-500 leading-snug">
                  <span className="text-gray-300 font-mono text-[10px] shrink-0 w-3 text-right">{idx + 1}.</span>
                  <span>{step}</span>
                </li>
              ))}
            </ol>
          </td>
        </tr>
      )}

      {/* Comment preview row */}
      {hasComment && !isCommentOpen && (
        <tr className="border-b border-gray-100">
          <td />
          <td colSpan={3} className="pb-1 pt-0 pr-3">
            <div className="flex items-center gap-1 text-[11px] text-blue-400/80">
              <CommentIcon />
              <span className="truncate">{comment}</span>
            </div>
          </td>
        </tr>
      )}
    </>
  );
}
