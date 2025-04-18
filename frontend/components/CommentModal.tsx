"use client";
import { useState } from "react";
import { Modal, ModalBody, ModalFooter, ModalContent } from "@heroui/modal";
import { Button } from "@heroui/button";
import { Semel } from "@/types";
import { Input, Textarea } from "@heroui/input";
import { Spinner } from "@heroui/spinner";

export function CommentModal({
  semel,
  isOpen,
  onOpenChange,
}: {
  semel: Semel;
  isOpen: boolean;
  onOpenChange: () => void;
}) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [message, setMessage] = useState("");
  const [formData, setFormData] = useState({
    rating: "",
    comment: "",
  });

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setMessage("");

    try {
      const response = await fetch(
        `http://localhost:8000/api/rate/${semel.id}`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            comment: formData.comment,
            rating: parseInt(formData.rating),
          }),
        }
      );

      const data = await response.json();
      setMessage(data.message || "Comment submitted successfully");

      // Optional: Reset form after successful submission
      if (response.ok) {
        setFormData({ rating: "", comment: "" });
      }
    } catch (error) {
      console.error("Error submitting comment:", error);
      setMessage("Failed to submit comment. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onOpenChange={onOpenChange}>
      <ModalContent>
        {(onClose) => (
          <>
            <ModalBody className="flex flex-col gap-4">
              <form className="flex flex-col gap-4" onSubmit={handleSubmit}>
                <Input
                  name="rating"
                  type="number"
                  label="Rating"
                  isRequired
                  min={1}
                  max={5}
                  value={formData.rating}
                  onChange={handleChange}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                  placeholder="1-5"
                />

                <Textarea
                  name="comment"
                  label="Comment"
                  rows={2}
                  value={formData.comment}
                  onChange={handleChange}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                  placeholder="Write your comment here..."
                />

                <Button type="submit" color="primary" disabled={isSubmitting}>
                  {isSubmitting ? <Spinner size="sm" className="mr-2" /> : null}
                  Add Review
                </Button>
              </form>
            </ModalBody>
            <ModalFooter className="flex justify-between">
              <p className={message ? "text-green-600" : "hidden"}>{message}</p>
              <Button color="danger" onPress={onClose}>
                Close
              </Button>
            </ModalFooter>
          </>
        )}
      </ModalContent>
    </Modal>
  );
}
