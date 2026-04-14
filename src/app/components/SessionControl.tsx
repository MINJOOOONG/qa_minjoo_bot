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
      <div className="flex items-center gap-2">
        <span className="relative flex h-1.5 w-1.5">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-orange-400 opacity-75" />
          <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-orange-500" />
        </span>
        <span className="text-[11px] font-medium text-orange-600">진행 중</span>
        <span className="text-[11px] text-gray-400">{activeSession.date}</span>
        {changeCount > 0 && (
          <span className="text-[10px] px-1.5 py-px rounded bg-orange-100 text-orange-600 font-medium tabular-nums">
            {changeCount}
          </span>
        )}
        <button
          onClick={() => endSession(activeSession.id)}
          className="text-[11px] px-2 py-0.5 bg-orange-500 text-white rounded hover:bg-orange-600 cursor-pointer font-medium ml-1"
        >
          종료
        </button>
      </div>
    );
  }

  if (activeSessionId && !isActive) {
    return <span className="text-[11px] text-gray-400">다른 Run에서 진행 중</span>;
  }

  return (
    <div className="flex items-center gap-1.5">
      <input
        type="date"
        value={date}
        onChange={(e) => setDate(e.target.value)}
        className="text-[11px] border border-gray-300 rounded px-1.5 py-0.5 focus:outline-none focus:ring-1 focus:ring-orange-400 bg-white"
      />
      <button
        onClick={() => startSession(runId, date)}
        className="text-[11px] px-2 py-0.5 bg-orange-500 text-white rounded hover:bg-orange-600 cursor-pointer font-medium"
      >
        업무 시작
      </button>
    </div>
  );
}
