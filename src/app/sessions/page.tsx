"use client";

import Link from "next/link";
import { useRunStore } from "@/lib/store";

export default function SessionsPage() {
  const sessions = useRunStore((s) => s.sessions);
  const runs = useRunStore((s) => s.runs);

  const sorted = [...sessions].sort(
    (a, b) => new Date(b.startedAt).getTime() - new Date(a.startedAt).getTime()
  );

  return (
    <div className="max-w-3xl mx-auto py-8 px-4">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-xl font-bold">Work Sessions</h1>
        <Link
          href="/runs"
          className="text-xs text-gray-400 hover:text-gray-600 transition-colors"
        >
          ← Runs
        </Link>
      </div>

      {sorted.length === 0 ? (
        <p className="text-sm text-gray-400 text-center py-12">아직 업무 세션이 없습니다.</p>
      ) : (
        <div className="space-y-2">
          {sorted.map((session) => {
            const run = runs.find((r) => r.id === session.runId);
            const isActive = !session.endedAt;
            return (
              <Link
                key={session.id}
                href={`/sessions/${session.id}`}
                className="flex items-center justify-between px-4 py-3 border rounded-lg hover:bg-gray-50 transition-colors"
              >
                <div>
                  <div className="font-medium text-sm flex items-center gap-2">
                    {session.date}
                    {isActive && (
                      <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-orange-100 text-orange-600 font-medium">
                        진행중
                      </span>
                    )}
                    {!isActive && (
                      <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-gray-100 text-gray-500 font-medium">
                        완료
                      </span>
                    )}
                  </div>
                  <div className="text-xs text-gray-400 mt-0.5">
                    {run?.name ?? "Unknown Run"}
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  {session.changes.length > 0 && (
                    <span className="text-xs px-2 py-0.5 rounded-full bg-orange-100 text-orange-600 font-medium">
                      변경 {session.changes.length}건
                    </span>
                  )}
                </div>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}
