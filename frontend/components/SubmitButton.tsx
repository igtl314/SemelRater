"use client";
import { useFormStatus } from "react-dom";
import { Button } from "@heroui/button";
import { Spinner } from "@heroui/spinner";

export function SubmitButton({ text }: { text: string }) {
  const { pending } = useFormStatus();

  return (
    <Button
      // className="border border-sky-500 rounded-md p-2 bg-sky-500 text-white hover:bg-sky-700 hover:text-sky-50 "
      aria-disabled={pending}
      color="primary"
      type="submit"
    >
      {pending ? <Spinner /> : text}
    </Button>
  );
}
