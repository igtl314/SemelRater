"use client";
import { useState } from "react";
import { Modal, ModalBody, ModalFooter, ModalContent, ModalHeader } from "@heroui/modal";
import { Button } from "@heroui/button";
import { Input } from "@heroui/input";
import { Spinner } from "@heroui/spinner";
import { Switch } from "@heroui/switch";

import { createSemel } from "@/app/actions/semel";

type SemelCreatorModalProps = {
  isOpen: boolean;
  onOpenChange: () => void;
  onSuccess: () => void;
};

export function SemelCreatorModal({
  isOpen,
  onOpenChange,
  onSuccess,
}: SemelCreatorModalProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [message, setMessage] = useState("");
  const [errors, setErrors] = useState<Record<string, string[]>>({});
  const [formData, setFormData] = useState({
    bakery: "",
    city: "",
    price: "",
    kind: "",
    vegan: false,
  });
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement>,
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    // Clear field-specific error when user starts typing
    if (errors[name]) {
      setErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors[name];
        return newErrors;
      });
    }
  };

  const handleVeganChange = (checked: boolean) => {
    setFormData((prev) => ({ ...prev, vegan: checked }));
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] || null;
    setSelectedFile(file);
  };

  const handleModalClose = () => {
    setFormData({ bakery: "", city: "", price: "", kind: "", vegan: false });
    setSelectedFile(null);
    setMessage("");
    setErrors({});
    onOpenChange();
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setMessage("");
    setErrors({});

    try {
      const submitData = new FormData();
      submitData.append("bakery", formData.bakery);
      submitData.append("city", formData.city);
      submitData.append("price", formData.price);
      submitData.append("kind", formData.kind);
      submitData.append("vegan", formData.vegan.toString());
      
      if (selectedFile) {
        submitData.append("pictures", selectedFile);
      }

      const response = await createSemel(submitData);

      if (response.success) {
        setMessage("Semla created successfully!");
        setFormData({ bakery: "", city: "", price: "", kind: "", vegan: false });
        setSelectedFile(null);
        onSuccess();
      } else {
        setMessage(response.error);
        if (response.errors) {
          setErrors(response.errors);
        }
      }
    } catch {
      setMessage("Failed to create semla. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const getFieldError = (fieldName: string): string | undefined => {
    return errors[fieldName]?.[0];
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
            <ModalHeader>Create New Semla</ModalHeader>
            <ModalBody className="flex flex-col gap-4">
              <form className="flex flex-col gap-4" onSubmit={handleSubmit}>
                <Input
                  isRequired
                  label="Bakery"
                  name="bakery"
                  placeholder="Enter bakery name"
                  value={formData.bakery}
                  onChange={handleChange}
                  isInvalid={!!getFieldError("bakery")}
                  errorMessage={getFieldError("bakery")}
                />
                <Input
                  isRequired
                  label="City"
                  name="city"
                  placeholder="Enter city"
                  value={formData.city}
                  onChange={handleChange}
                  isInvalid={!!getFieldError("city")}
                  errorMessage={getFieldError("city")}
                />
                <Input
                  isRequired
                  label="Price"
                  name="price"
                  placeholder="Enter price"
                  type="number"
                  step="0.01"
                  min="0"
                  value={formData.price}
                  onChange={handleChange}
                  isInvalid={!!getFieldError("price")}
                  errorMessage={getFieldError("price")}
                />
                <Input
                  isRequired
                  label="Kind"
                  name="kind"
                  placeholder="e.g., Classic, Almond, etc."
                  value={formData.kind}
                  onChange={handleChange}
                  isInvalid={!!getFieldError("kind")}
                  errorMessage={getFieldError("kind")}
                />
                <Switch
                  aria-label="Vegan"
                  isSelected={formData.vegan}
                  onValueChange={handleVeganChange}
                >
                  Vegan
                </Switch>
                <div className="flex flex-col gap-1">
                  <label htmlFor="image">Image</label>
                  <input
                    id="image"
                    type="file"
                    accept="image/jpeg,image/png,image/webp"
                    onChange={handleFileChange}
                    className="block w-full text-sm text-gray-500
                      file:mr-4 file:py-2 file:px-4
                      file:rounded-md file:border-0
                      file:text-sm file:font-semibold
                      file:bg-primary-50 file:text-primary-700
                      hover:file:bg-primary-100"
                  />
                </div>

                <Button color="primary" disabled={isSubmitting} type="submit">
                  {isSubmitting ? <Spinner className="mr-2" size="sm" /> : null}
                  Create Semla
                </Button>
              </form>
            </ModalBody>
            <ModalFooter className="flex justify-between">
              <p data-testid="form-message" className={message ? "" : "hidden"}>{message}</p>
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
