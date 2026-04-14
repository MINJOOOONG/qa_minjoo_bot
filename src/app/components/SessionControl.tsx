"use client";

import { useState } from "react";
import { useRunStore } from "@/lib/store";

export default function SessionControl({ runId }: { runId: string }) {
  const today = new Date().toISOString().slice(0, 10);
  const [date, setDate] = useState(today);

  const activeSessionId = useRunStore((s) => s.activeSessionId);
  const activeSession = useRunStore((s) =>
    s.activeSessionId ? s.sessions.find((sess) => sess.id === s.activeSessionId) : null
  );
  const startSession = useRunStore((s) => s.startSession);
  const endSession = useRunStore((s) => s.endSession);

  const isActive = !!activeSession && activeSession.runId === runId;
  const changeCount = activeSession?.changes.length ?? 0;

  if (isActive && activeSession) {
    return (
      <div className="flex items-center gap-3 px-4 py-2.5 bg-orange-50 border border-orange-200 rounded-lg">
        <div className="flex items-center gap-2 flex-1 min-w-0">
          <span className="relative flex h-2 w-2 shrink-0">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-orange-400 opacity-75" />
            <span className="relative inline-flex rounded-full h-2 w-2 bg-orange-500" />
          </span>
          <span className="text-sm font-medium text-orange-700">업무 진행 중</span>
          <span className="text-xs text-orange-500">{activeSession.date}</span>
          {changeCount > 0 && (
            <span className="text-[11px] px-2 py-0.5 rounded-full bg-orange-200 text-orange-700 font-medium">
              변경 요청 {changeCount}건
            </span>
          )}
        </div>
        <button
          onClick={() => endSession(activeSession.id)}
          className="text-xs px-3 py-1.5 bg-orange-500 text-white rounded-md hover:bg-orange-600 transition-colors cursor-pointer font-medium"
        >
          업무 종료
        </button>
      </div>
    );
  }

  // If there's an active session on a different run
  if (activeSessionId && !isActive) {
    return (
      <div className="flex items-center gap-2 px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-lg">
        <span className="text-xs text-gray-500">다른 Run에서 업무가 진행 중입니다.</span>
      </div>
    );
  }

  return (
    <div className="flex items-center gap-3 px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-lg">
      <input
        type="date"
        value={date}
        onChange={(e) => setDate(e.target.value)}
        className="text-xs border border-gray-300 rounded px-2 py-1 focus:outline-none focus:ring-1 focus:ring-orange-400"
      />
      <button
        onClick={() => startSession(runId, date)}
        className="text-xs px-3 py-1.5 bg-orange-500 text-white rounded-md hover:bg-orange-600 transition-colors cursor-pointer font-medium"
      >
        업무 시작
      </button>
    </div>
  );
}
