"use client";
import { useState, useContext ,useRef} from "react";
import { Modal, ModalBody, ModalFooter, ModalContent } from "@heroui/modal";
import { Button } from "@heroui/button";
import { Textarea } from "@heroui/input";
import { Input } from "@heroui/input";
import { Spinner } from "@heroui/spinner";

import { Semel, CategoryRatings } from "@/types";
import { SemelContext } from "@/app/SemelProvider";
import { rateSemel } from "@/app/actions/semel";
import { validateImageFile } from "@/utils/imageValidation";
import { CategoryRatingInput } from "./CategoryRatingInput";

/** HTTP status code threshold for error responses */
const HTTP_ERROR_THRESHOLD = 400;

const INITIAL_CATEGORY_RATINGS = {
  gradde: "",
  mandelmassa: "",
  lock: "",
  helhet: "",
  bulle: "",
};

const INITIAL_FORM_STATE = {
  comment: "",
  name: "",
};

const INPUT_CLASS =
  "mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500";

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
  const [formData, setFormData] = useState(INITIAL_FORM_STATE);
  const [categoryRatings, setCategoryRatings] = useState(INITIAL_CATEGORY_RATINGS);
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [imageError, setImageError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const ctx = useContext(SemelContext);

  const handleCategoryChange = (category: keyof CategoryRatings, value: string) => {
    setCategoryRatings((prev) => ({ ...prev, [category]: value }));
  };

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


  const resetForm = () => {
    setFormData(INITIAL_FORM_STATE);
    setCategoryRatings(INITIAL_CATEGORY_RATINGS);
    setSelectedImage(null);
    setImageError(null);
    setMessage("");
  };

  const handleModalClose = () => {
    resetForm();
    onOpenChange();
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setMessage("");

    const parsedCategoryRatings: CategoryRatings = {
      gradde: parseInt(categoryRatings.gradde),
      mandelmassa: parseInt(categoryRatings.mandelmassa),
      lock: parseInt(categoryRatings.lock),
      helhet: parseInt(categoryRatings.helhet),
      bulle: parseInt(categoryRatings.bulle),
    };

    try {
      const response = await rateSemel(
        semel.id,
        parsedCategoryRatings,
        formData.comment,
        selectedImage || undefined,
        formData.name,
      );

      const isSuccess = response.httpStatus < HTTP_ERROR_THRESHOLD;

      setMessage(isSuccess ? "Rating submitted successfully!" : response.message);
      if (isSuccess) {
        setFormData(INITIAL_FORM_STATE);
        setCategoryRatings(INITIAL_CATEGORY_RATINGS);
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
                <CategoryRatingInput
                  values={categoryRatings}
                  onChange={handleCategoryChange}
                />
                <Textarea
                  className={INPUT_CLASS}
                  label="Comment"
                  name="comment"
                  placeholder="Write your comment here..."
                  rows={2}
                  value={formData.comment}
                  onChange={handleChange}
                />
                <Input
                  className={INPUT_CLASS}
                  label="Name"
                  name="name"
                  placeholder="Your name (optional)"
                  value={formData.name}
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
