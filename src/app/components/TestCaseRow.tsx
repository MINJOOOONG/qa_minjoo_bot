"use client";

import { useState, useRef, useEffect } from "react";
import type { Status } from "@/lib/dummy-data";
import StatusButtons from "./StatusButtons";

/* ── Icons ──────────────────────────────────────────── */
function CommentIcon({ filled }: { filled?: boolean }) {
  return (
    <svg width="15" height="15" viewBox="0 0 24 24" fill={filled ? "currentColor" : "none"} stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
    </svg>
  );
}

function PencilIcon() {
  return (
    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M17 3a2.85 2.83 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z" />
      <path d="m15 5 4 4" />
    </svg>
  );
}

function TrashIcon() {
  return (
    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="3 6 5 6 21 6" />
      <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
    </svg>
  );
}

function ChevronIcon({ open }: { open: boolean }) {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
      className={`transition-transform duration-150 ${open ? "rotate-90" : ""}`}>
      <path d="m9 18 6-6-6-6" />
    </svg>
  );
}

/* ── Props ──────────────────────────────────────────── */
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
  const addStep = () => {
    setEditSteps((prev) => [...prev, ""]);
  };

  /* ── Edit mode ───────────────────────────────────── */
  if (isEditing) {
    return (
      <div className="border-b border-gray-200 bg-blue-50/40 px-4 py-3">
        <div className="flex gap-3 items-start">
          <input
            value={editCode}
            onChange={(e) => setEditCode(e.target.value)}
            className="w-20 text-xs font-mono font-medium border border-gray-300 rounded px-2 py-1 focus:outline-none focus:ring-1 focus:ring-blue-400 bg-white"
            placeholder="Code"
          />
          <div className="flex-1 space-y-2">
            <input
              value={editTitle}
              onChange={(e) => setEditTitle(e.target.value)}
              className="w-full text-sm font-medium border border-gray-300 rounded px-2 py-1 focus:outline-none focus:ring-1 focus:ring-blue-400 bg-white"
              placeholder="테스트케이스 제목"
            />
            {/* Step inputs */}
            <div className="space-y-1">
              {editSteps.map((step, idx) => (
                <div key={idx} className="flex items-center gap-1.5">
                  <span className="text-[10px] text-gray-400 w-4 text-right shrink-0">{idx + 1}.</span>
                  <input
                    value={step}
                    onChange={(e) => updateStep(idx, e.target.value)}
                    className="flex-1 text-xs border border-gray-300 rounded px-2 py-1 focus:outline-none focus:ring-1 focus:ring-blue-400 bg-white"
                    placeholder={`Step ${idx + 1}`}
                  />
                  {editSteps.length > 1 && (
                    <button
                      onClick={() => removeStep(idx)}
                      className="text-gray-300 hover:text-red-400 p-0.5 cursor-pointer"
                    >
                      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M18 6 6 18M6 6l12 12" /></svg>
                    </button>
                  )}
                </div>
              ))}
              <button
                onClick={addStep}
                className="text-[11px] text-gray-400 hover:text-blue-500 ml-5 cursor-pointer"
              >
                + Step 추가
              </button>
            </div>
          </div>
          <div className="flex gap-1.5 pt-0.5 shrink-0">
            <button
              onClick={() => {
                const cleaned = editSteps.filter((s) => s.trim() !== "");
                onEdit(editCode, editTitle, cleaned);
                setIsEditing(false);
              }}
              className="text-xs px-3 py-1 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors cursor-pointer"
            >
              저장
            </button>
            <button
              onClick={() => {
                setEditCode(code);
                setEditTitle(title);
                setEditSteps(detail.length > 0 ? [...detail] : [""]);
                setIsEditing(false);
              }}
              className="text-xs px-3 py-1 bg-gray-200 text-gray-600 rounded hover:bg-gray-300 transition-colors cursor-pointer"
            >
              취소
            </button>
          </div>
        </div>
      </div>
    );
  }

  /* ── View mode ───────────────────────────────────── */
  return (
    <div id={`tc-${code}`} className="border-b border-gray-200 hover:bg-gray-50/60 transition-colors group scroll-mt-24">
      {/* Main row */}
      <div className="flex items-center gap-3 px-4 py-2.5">
        {/* Chevron toggle */}
        <button
          onClick={() => hasSteps && setIsDetailOpen(!isDetailOpen)}
          className={`shrink-0 p-0.5 rounded transition-colors cursor-pointer ${
            hasSteps ? "text-gray-400 hover:text-gray-600" : "text-gray-200 cursor-default"
          }`}
          disabled={!hasSteps}
        >
          <ChevronIcon open={isDetailOpen} />
        </button>

        {/* Left: code + title */}
        <div className="flex-1 min-w-0 flex items-center gap-2">
          <span className="text-xs font-mono font-medium text-gray-400 shrink-0 w-14">{code}</span>
          <span className="text-sm font-medium text-gray-800 truncate">{title}</span>
          {hasSteps && !isDetailOpen && (
            <span className="text-[10px] text-gray-300 shrink-0">{detail.length} steps</span>
          )}
        </div>

        {/* Right: actions */}
        <div className="flex items-center gap-2 shrink-0">
          <StatusButtons status={status} onChange={onStatusChange} />

          {/* Comment bubble */}
          <div className="relative" ref={commentRef}>
            <button
              onClick={() => { setEditComment(comment); setIsCommentOpen(!isCommentOpen); }}
              className={`p-1 rounded transition-colors cursor-pointer ${
                hasComment
                  ? "text-blue-500 hover:text-blue-600 hover:bg-blue-50"
                  : "text-gray-300 hover:text-gray-500 hover:bg-gray-100 opacity-0 group-hover:opacity-100"
              }`}
              title={hasComment ? "Comment 보기/수정" : "Comment 추가"}
            >
              <CommentIcon filled={hasComment} />
            </button>

            {isCommentOpen && (
              <div className="absolute right-0 top-8 z-10 w-72 bg-white border border-gray-200 rounded-lg shadow-lg p-3">
                <div className="text-[11px] font-medium text-gray-500 uppercase tracking-wider mb-1.5">Comment</div>
                <textarea
                  value={editComment}
                  onChange={(e) => setEditComment(e.target.value)}
                  rows={3}
                  placeholder="QA 수행 중 메모를 남겨주세요..."
                  className="w-full text-xs border border-gray-200 rounded px-2 py-1.5 resize-none focus:outline-none focus:ring-1 focus:ring-blue-400"
                  autoFocus
                />
                <div className="flex items-center mt-2">
                  {hasComment && (
                    <button
                      onClick={() => { onUpdateComment(""); setEditComment(""); setIsCommentOpen(false); }}
                      className="text-xs px-2 py-0.5 text-red-400 hover:text-red-600 hover:bg-red-50 rounded transition-colors cursor-pointer"
                    >
                      삭제
                    </button>
                  )}
                  <div className="flex-1" />
                  <div className="flex gap-1.5">
                    <button onClick={() => { setEditComment(comment); setIsCommentOpen(false); }} className="text-xs px-2.5 py-0.5 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded transition-colors cursor-pointer">취소</button>
                    <button
                      onClick={() => { onUpdateComment(editComment); setIsCommentOpen(false); }}
                      disabled={editComment === comment}
                      className={`text-xs px-2.5 py-0.5 rounded transition-colors cursor-pointer ${
                        editComment === comment
                          ? "bg-gray-200 text-gray-400 cursor-not-allowed"
                          : "bg-blue-500 text-white hover:bg-blue-600"
                      }`}
                    >
                      저장
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Edit */}
          <button
            onClick={() => {
              setEditCode(code);
              setEditTitle(title);
              setEditSteps(detail.length > 0 ? [...detail] : [""]);
              setIsEditing(true);
            }}
            className="p-1 text-gray-300 hover:text-gray-500 hover:bg-gray-100 rounded transition-colors cursor-pointer opacity-0 group-hover:opacity-100"
            title="수정"
          >
            <PencilIcon />
          </button>

          {/* Delete */}
          <button onClick={onDelete} className="p-1 text-gray-300 hover:text-red-500 hover:bg-red-50 rounded transition-colors cursor-pointer opacity-0 group-hover:opacity-100" title="삭제">
            <TrashIcon />
          </button>
        </div>
      </div>

      {/* Steps list (expanded) */}
      {isDetailOpen && hasSteps && (
        <div className="pb-2.5 pl-14 pr-4 ml-2">
          <ol className="space-y-0.5">
            {detail.map((step, idx) => (
              <li key={idx} className="flex items-baseline gap-2 text-xs text-gray-500 leading-relaxed">
                <span className="text-gray-300 font-mono text-[10px] shrink-0 w-4 text-right">{idx + 1}.</span>
                <span>{step}</span>
              </li>
            ))}
          </ol>
        </div>
      )}

      {/* Comment preview */}
      {hasComment && !isCommentOpen && (
        <div className="px-4 pb-2 ml-10">
          <div className="flex items-start gap-1.5 text-xs text-blue-500/70">
            <span className="shrink-0 mt-px"><CommentIcon /></span>
            <span className="line-clamp-1">{comment}</span>
          </div>
        </div>
      )}
    </div>
  );
}
