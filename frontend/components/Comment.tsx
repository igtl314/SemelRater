import type { CSSProperties } from "react";

import { Rating, CategoryRatings } from "@/types";

const CATEGORIES: { key: keyof CategoryRatings; label: string }[] = [
  { key: "gradde", label: "Grädde" },
  { key: "mandelmassa", label: "Mandelmassa" },
  { key: "lock", label: "Lock" },
  { key: "bulle", label: "Bulle" },
  { key: "helhet", label: "Helhet" },
];

function getInitials(name?: string) {
  if (!name) return "?";
  return name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);
}

function getDisplayRating(comment: Rating): number {
  if (comment.gradde !== undefined) {
    const { gradde = 0, mandelmassa = 0, lock = 0, helhet = 0, bulle = 0 } = comment;
    return (gradde + mandelmassa + lock + helhet + bulle) / 5;
  }
  if (comment.categoryRatings) {
    const { gradde, mandelmassa, lock, helhet, bulle } = comment.categoryRatings;
    return (gradde + mandelmassa + lock + helhet + bulle) / 5;
  }
  return comment.rating;
}

function getScoreStyle(score: number) {
  if (score >= 4.0) return { text: "text-yellow-500", chip: "text-yellow-500 bg-yellow-500/[0.12]" };
  if (score >= 3.0) return { text: "text-orange-400", chip: "text-orange-400 bg-orange-400/[0.12]" };
  return { text: "text-red-400", chip: "text-red-400 bg-red-400/[0.12]" };
}

function getRatingBarStyle(score: number): CSSProperties {
  const pct = Math.min((score / 5) * 100, 100);
  let background: string;
  if (score >= 4.0) background = "linear-gradient(to right, #EAB308, #F59E0B)";
  else if (score >= 3.0) background = "linear-gradient(to right, #F59E0B, #F97316)";
  else background = "linear-gradient(to right, #F97316, #EF4444)";
  return { width: `${pct}%`, background };
}

export function Comment({ comment }: { comment: Rating }) {
  const score = getDisplayRating(comment);
  const colors = getScoreStyle(score);
  const hasCategoryRatings = comment.categoryRatings || comment.gradde !== undefined;

  return (
    <div className="w-full mb-3 border border-zinc-800 rounded-[14px] overflow-hidden bg-zinc-900 dark:bg-zinc-900 dark:border-zinc-800">
      {/* Rating bar */}
      <div className="h-1" style={getRatingBarStyle(score)} />

      {/* Card body */}
      <div className="p-4 flex flex-col gap-2.5">
        {/* Top row: avatar + name/date + score */}
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 shrink-0 rounded-full bg-zinc-800 border border-zinc-700 flex items-center justify-center">
            <span className="text-[11px] font-semibold text-zinc-400 font-mono">
              {getInitials(comment.name)}
            </span>
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-[13px] font-semibold text-zinc-100 truncate">
              {comment.name || "Anonymous"}
            </p>
            <p className="text-[10px] text-zinc-600 mt-0.5">{comment.date}</p>
          </div>
          <div className={`text-2xl font-bold leading-none ${colors.text}`}>
            {score.toFixed(1)}
            <span className="text-[11px] text-zinc-600 font-normal"> /5</span>
          </div>
        </div>

        {/* Category grid */}
        {hasCategoryRatings && (
          <div className="grid grid-cols-5 gap-1 bg-zinc-800 rounded-[10px] px-2 py-2.5">
            {CATEGORIES.map(({ key, label }) => {
              const val = comment[key] ?? comment.categoryRatings?.[key];
              if (val === undefined) return null;
              const catColors = getScoreStyle(val);
              return (
                <div key={key} className="flex flex-col items-center gap-0.5">
                  <div
                    className={`text-[15px] font-bold w-8 h-7 flex items-center justify-center rounded-md ${catColors.chip}`}
                  >
                    {val}
                  </div>
                  <div className="text-[9px] text-zinc-600 text-center leading-tight">{label}</div>
                </div>
              );
            })}
          </div>
        )}

        {/* Comment text */}
        {comment.comment && (
          <p className="text-[12px] text-zinc-400 leading-relaxed border-l-2 border-zinc-700 pl-2.5 italic">
            {comment.comment}
          </p>
        )}
      </div>
    </div>
  );
}
