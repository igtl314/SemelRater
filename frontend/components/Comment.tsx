import { Card, CardBody, CardHeader } from "@heroui/card";

import { Rating, CategoryRatings } from "@/types";

const CATEGORY_DISPLAY_NAMES: { key: keyof CategoryRatings; label: string }[] = [
  { key: "gradde", label: "Grädde" },
  { key: "mandelmassa", label: "MandelMassa" },
  { key: "lock", label: "Lock" },
  { key: "bulle", label: "Bulle" },
  { key: "helhet", label: "Helhet" },
];

export function Comment({ comment }: { comment: Rating }) {
  const getInitials = (name?: string) => {
    if (!name) return "?";
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  // Calculate average from category ratings if available
  const getDisplayRating = () => {
    if (comment.categoryRatings) {
      const { gradde, mandelmassa, lock, helhet, bulle } = comment.categoryRatings;
      const avg = (gradde + mandelmassa + lock + helhet + bulle) / 5;
      return avg.toFixed(1);
    }
    return comment.rating;
  };

  return (
    <Card className="mb-3 w-full" shadow="sm">
      <CardHeader className="justify-between pb-0">
        <div className="flex gap-3">
          {/* Avatar fallback since @heroui/avatar is not installed */}
          <div className="flex h-8 w-8 items-center justify-center rounded-full border border-default-200 bg-default-100">
            <span className="text-tiny font-medium text-default-600">
              {getInitials(comment.name)}
            </span>
          </div>
          <div className="flex flex-col gap-1 items-start justify-center">
            <h4 className="text-small font-semibold leading-none text-default-600">
              {comment.name || "Unknown"}
            </h4>
            <span className="text-tiny text-default-400">{comment.date}</span>
          </div>
        </div>
        <div className="flex items-center gap-1">
          <span className="text-lg font-bold text-yellow-500">
            {getDisplayRating()}
          </span>
          <span className="text-default-400 text-small">/ 5</span>
        </div>
      </CardHeader>
      <CardBody className="px-3 py-2 text-small text-default-600">
        {comment.categoryRatings && (
          <div className="mb-2 grid grid-cols-5 gap-2 text-xs">
            {CATEGORY_DISPLAY_NAMES.map(({ key, label }) => (
              <div key={key} className="flex flex-col items-center">
                <span className="text-default-400">{label}</span>
                <span className="font-semibold text-yellow-500">
                  {comment.categoryRatings![key]}
                </span>
              </div>
            ))}
          </div>
        )}
        <p>{comment.comment}</p>
      </CardBody>
    </Card>
  );
}
