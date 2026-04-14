"use client";

import { use } from "react";
import { notFound } from "next/navigation";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { groupChangesBySection } from "@/lib/dummy-data";
import { useRunStore } from "@/lib/store";
import SectionSummaryBlock from "@/app/components/SectionSummaryBlock";

export default function SessionDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);

  const router = useRouter();
  const session = useRunStore((s) => s.sessions.find((sess) => sess.id === id));
  const run = useRunStore((s) => (session ? s.runs.find((r) => r.id === session.runId) : null));
  const activeSessionId = useRunStore((s) => s.activeSessionId);
  const startSession = useRunStore((s) => s.startSession);

  if (!session) {
    notFound();
  }

  const bySection = groupChangesBySection(session.changes);
  const totalChanges = session.changes.length;

  const startTime = new Date(session.startedAt).toLocaleTimeString("ko-KR", {
    hour: "2-digit",
    minute: "2-digit",
  });
  const endTime = session.endedAt
    ? new Date(session.endedAt).toLocaleTimeString("ko-KR", {
        hour: "2-digit",
        minute: "2-digit",
      })
    : "진행중";

  return (
    <div className="max-w-4xl mx-auto py-6 px-6">
      {/* Header */}
      <div className="mb-8">
        {/* Navigation */}
        <div className="flex items-center gap-4 mb-3">
          <Link
            href={`/runs/${session.runId}`}
            className="text-xs text-gray-400 hover:text-gray-600 inline-flex items-center gap-1 transition-colors"
          >
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M19 12H5M12 19l-7-7 7-7" />
            </svg>
            Run으로 돌아가기
          </Link>
          <Link
            href="/sessions"
            className="text-xs text-gray-400 hover:text-gray-600 inline-flex items-center gap-1 transition-colors"
          >
            Sessions 목록
          </Link>
        </div>

        <div className="flex items-center justify-between gap-4 mt-2">
          <div>
            <h1 className="text-lg font-semibold text-gray-900">
              업무 요약 — {session.date}
            </h1>
            <div className="flex items-center gap-4 mt-2 text-xs text-gray-500">
              <span>{run?.name ?? "Unknown Run"}</span>
              <span>{startTime} ~ {endTime}</span>
              <span className="px-2 py-0.5 rounded-full bg-orange-100 text-orange-600 font-medium">
                총 변경 요청 {totalChanges}건
              </span>
            </div>
          </div>

          {/* 다시 작업 시작 */}
          {!activeSessionId && (
            <button
              onClick={() => {
                const today = new Date().toISOString().slice(0, 10);
                startSession(session.runId, today);
                router.push(`/runs/${session.runId}`);
              }}
              className="text-xs px-3 py-1.5 bg-orange-500 text-white rounded-md hover:bg-orange-600 transition-colors cursor-pointer font-medium shrink-0"
            >
              다시 작업 시작
            </button>
          )}
        </div>
      </div>

      {/* Content */}
      {totalChanges === 0 ? (
        <p className="text-sm text-gray-400 text-center py-12">변경 요청이 없습니다.</p>
      ) : (
        <div className="space-y-4">
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
  );
}
