import { Rating } from "@/types";

export function Comment({ comment }: { comment: Rating }) {
  return (
    <div className="border-2 border-gray-300 rounded-lg p-2 mb-2 grid grid-cols-3">
      <div className="col-span-2">{comment.comment}</div>
      <div className="grid grid-row-2">
        <p>{comment.rating}/5</p>
        <p>{comment.date}</p>
      </div>
    </div>
  );
}
