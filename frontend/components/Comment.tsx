import { Card, CardBody, CardHeader } from "@heroui/card";

import { Rating } from "@/types";

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
            {comment.rating}
          </span>
          <span className="text-default-400 text-small">/ 5</span>
        </div>
      </CardHeader>
      <CardBody className="px-3 py-2 text-small text-default-600">
        <p>{comment.comment}</p>
      </CardBody>
    </Card>
  );
}
