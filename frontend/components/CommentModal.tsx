"use client";
import { useState } from "react";
import { Modal, ModalBody, ModalFooter, ModalContent } from "@heroui/modal";
import { Button } from "@heroui/button";
import { Input, Textarea } from "@heroui/input";
import { Spinner } from "@heroui/spinner";
import { useContext } from "react";

import { Semel } from "@/types";
import { SemelContext } from "@/app/SemelProvider";

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
  const ctx = useContext(SemelContext);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;

    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleModalClose = () => {
    setFormData({ rating: "", comment: "" });
    setMessage("");
    onOpenChange();
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setMessage("");
    ctx.refreshSemels();

    try {
      const response = await fetch(
        `http://192.168.86.30:8000/api/rate/${semel.id}`,
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

      setMessage(data.error ? data.error : "Comment submitted successfully!");
      if (response.ok) {
        setFormData({ rating: "", comment: "" });
      }
    } catch (error) {
      setMessage("Failed to submit comment. Please try again." + error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      placement="top"
      size="lg"
      onOpenChange={handleModalClose}
    >
      <ModalContent>
        {(onClose) => (
          <>
            <ModalBody className="flex flex-col gap-4">
              <form className="flex flex-col gap-4" onSubmit={handleSubmit}>
                <Input
                  isRequired
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                  label="Rating"
                  max={5}
                  min={1}
                  name="rating"
                  placeholder="1-5"
                  type="number"
                  value={formData.rating}
                  onChange={handleChange}
                />
                <Textarea
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                  label="Comment"
                  name="comment"
                  placeholder="Write your comment here..."
                  rows={2}
                  value={formData.comment}
                  onChange={handleChange}
                />

                <Button color="primary" disabled={isSubmitting} type="submit">
                  {isSubmitting ? <Spinner className="mr-2" size="sm" /> : null}
                  Add Review
                </Button>
              </form>
            </ModalBody>
            <ModalFooter className="flex justify-between">
              <p className={message ? "" : "hidden"}>{message}</p>
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
