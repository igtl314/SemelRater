"use client";
import { useState, useRef } from "react";
import { Modal, ModalBody, ModalFooter, ModalContent } from "@heroui/modal";
import { Button } from "@heroui/button";
import { Input, Textarea } from "@heroui/input";
import { Spinner } from "@heroui/spinner";
import { useContext } from "react";

import { Semel } from "@/types";
import { SemelContext } from "@/app/SemelProvider";
import { rateSemel } from "@/app/actions/semel";
import { validateImageFile } from "@/utils/imageValidation";

/** HTTP status code threshold for error responses */
const HTTP_ERROR_THRESHOLD = 400;

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
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [imageError, setImageError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const ctx = useContext(SemelContext);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
  ) => {
    const { name, value } = e.target;

    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    setImageError(null);
    
    if (!file) {
      setSelectedImage(null);
      return;
    }

    const validation = validateImageFile(file);
    if (!validation.valid) {
      setImageError(validation.message);
      setSelectedImage(null);
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
      return;
    }

    setSelectedImage(file);
  };

  const handleModalClose = () => {
    setFormData({ rating: "", comment: "" });
    setSelectedImage(null);
    setImageError(null);
    setMessage("");
    onOpenChange();
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setMessage("");

    try {
      const response = await rateSemel(
        semel.id,
        parseInt(formData.rating),
        formData.comment,
        selectedImage || undefined,
      );

      setMessage(
        response.httpStatus >= HTTP_ERROR_THRESHOLD
          ? response.message
          : "Rating submitted successfully!",
      );
      if (response.httpStatus < HTTP_ERROR_THRESHOLD) {
        setFormData({ rating: "", comment: "" });
        setSelectedImage(null);
        if (fileInputRef.current) {
          fileInputRef.current.value = "";
        }
        ctx.refreshSemels();
      }
    } catch {
      setMessage("Failed to submit rating. Please try again.");
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

                <div className="flex flex-col gap-2">
                  <label htmlFor="image-upload" className="text-sm font-medium text-foreground-600">
                    Image (optional)
                  </label>
                  <input
                    ref={fileInputRef}
                    id="image-upload"
                    type="file"
                    accept="image/jpeg,image/png,image/webp"
                    onChange={handleImageChange}
                    className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-primary file:text-white hover:file:bg-primary-600"
                  />
                  {selectedImage && (
                    <p className="text-sm text-success">{selectedImage.name}</p>
                  )}
                  {imageError && (
                    <p className="text-sm text-danger">{imageError}</p>
                  )}
                </div>

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
