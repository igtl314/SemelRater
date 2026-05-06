"use client";
import { useState } from "react";
import { Modal, ModalBody, ModalFooter, ModalContent, ModalHeader } from "@heroui/modal";
import { Button } from "@heroui/button";
import { Input, Textarea } from "@heroui/input";
import { Switch } from "@heroui/switch";
import { Spinner } from "@heroui/spinner";

import { createSemel, rateSemel } from "@/app/actions/semel";
import { validateImageFile } from "@/utils/imageValidation";
import { CategoryRatings } from "@/types";

const CATS: { key: keyof CategoryRatings; label: string; sub: string }[] = [
  { key: "gradde",      label: "Grädde",     sub: "Cream"        },
  { key: "mandelmassa", label: "Mandelmassa", sub: "Almond paste" },
  { key: "lock",        label: "Lock",        sub: "Lid"          },
  { key: "bulle",       label: "Bulle",       sub: "Bun"          },
  { key: "helhet",      label: "Helhet",      sub: "Overall"      },
];

type InfoState = { bakery: string; city: string; price: string; kind: string; vegan: boolean };
type RateState = CategoryRatings & { name: string; comment: string };

const EMPTY_INFO: InfoState = { bakery: "", city: "", price: "", kind: "", vegan: false };
const EMPTY_RATE: RateState = { gradde: 0, mandelmassa: 0, lock: 0, bulle: 0, helhet: 0, name: "", comment: "" };

function StarRow({ value, onChange }: { value: number; onChange: (v: number) => void }) {
  const [hovered, setHovered] = useState(0);
  return (
    <div className="flex gap-1">
      {[1, 2, 3, 4, 5].map((n) => {
        const filled = n <= (hovered || value);
        return (
          <button
            key={n}
            type="button"
            style={{
              background: "none",
              border: "none",
              cursor: "pointer",
              fontSize: 24,
              lineHeight: 1,
              padding: 2,
              color: filled ? "#EAB308" : "#3f3f46",
              transform: filled ? "scale(1.1)" : "scale(1)",
              transition: "color 0.1s, transform 0.1s",
            }}
            onClick={() => onChange(n)}
            onMouseEnter={() => setHovered(n)}
            onMouseLeave={() => setHovered(0)}
          >
            ★
          </button>
        );
      })}
    </div>
  );
}

function StepDots({ current }: { current: number }) {
  return (
    <div className="flex items-center justify-center gap-1.5">
      {[0, 1].map((i) => (
        <div
          key={i}
          className="h-1.5 rounded-full transition-all duration-300"
          style={{
            width: i === current ? 20 : 6,
            background: i <= current ? "#006FEE" : "#3f3f46",
            opacity: i < current ? 0.45 : 1,
          }}
        />
      ))}
    </div>
  );
}

type SemelCreatorModalProps = {
  isOpen: boolean;
  onOpenChange: () => void;
  onSuccess: () => void;
};

export function SemelCreatorModal({ isOpen, onOpenChange, onSuccess }: SemelCreatorModalProps) {
  const [step, setStep] = useState(0);
  const [info, setInfo] = useState<InfoState>(EMPTY_INFO);
  const [rate, setRate] = useState<RateState>(EMPTY_RATE);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [imageError, setImageError] = useState<string | null>(null);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [doneInfo, setDoneInfo] = useState({ bakery: "", avg: 0 });

  const avg = CATS.reduce((sum, c) => sum + (rate[c.key] || 0), 0) / 5;

  const resetAll = () => {
    setStep(0);
    setInfo(EMPTY_INFO);
    setRate(EMPTY_RATE);
    setSelectedFile(null);
    setImageError(null);
    setErrors({});
  };

  const handleClose = () => {
    resetAll();
    onOpenChange();
  };

  const validateInfo = (): boolean => {
    const e: Record<string, string> = {};
    if (!info.bakery.trim()) e.bakery = "Required";
    if (!info.city.trim())   e.city   = "Required";
    if (!info.price.trim())  e.price  = "Required";
    if (!info.kind.trim())   e.kind   = "Required";
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const validateRate = (): boolean => {
    if (!CATS.every((c) => rate[c.key] > 0)) {
      setErrors({ stars: "Rate all 5 categories to continue" });
      return false;
    }
    setErrors({});
    return true;
  };

  const goNext = () => {
    if (validateInfo()) setStep(1);
  };

  const goBack = () => {
    setErrors({});
    setStep(0);
  };

  const handleSubmit = async () => {
    if (!validateRate()) return;
    setIsSubmitting(true);
    try {
      const formData = new FormData();
      formData.append("bakery", info.bakery);
      formData.append("city", info.city);
      formData.append("price", info.price);
      formData.append("kind", info.kind);
      formData.append("vegan", info.vegan.toString());
      if (selectedFile) formData.append("pictures", selectedFile);

      const createRes = await createSemel(formData);
      if (!createRes.success) {
        setErrors({ submit: createRes.error });
        return;
      }

      await rateSemel(
        createRes.data.id,
        { gradde: rate.gradde, mandelmassa: rate.mandelmassa, lock: rate.lock, bulle: rate.bulle, helhet: rate.helhet },
        rate.comment,
        undefined,
        rate.name,
      );

      setDoneInfo({ bakery: info.bakery, avg });
      setStep(2);
      onSuccess();
    } catch {
      setErrors({ submit: "Something went wrong. Please try again." });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] || null;
    if (!file) { setImageError(null); setSelectedFile(null); return; }
    const result = validateImageFile(file);
    if (!result.valid) { setImageError(result.message); setSelectedFile(null); return; }
    setImageError(null);
    setSelectedFile(file);
  };

  return (
    <Modal isOpen={isOpen} placement="top" size="lg" onOpenChange={handleClose}>
      <ModalContent>
        {() => (
          <>
            {step < 2 && (
              <ModalHeader className="flex flex-col gap-2 pb-2">
                <div>
                  <h2 className="text-lg font-bold">
                    {step === 0 ? "Add a Semla" : `Rate ${info.bakery || "Semla"}`}
                  </h2>
                  <p className="text-xs text-default-500 mt-0.5 font-normal">
                    {step === 0 ? "Tell us about the semla" : "How did each part taste?"}
                  </p>
                </div>
                <StepDots current={step} />
              </ModalHeader>
            )}

            <ModalBody className="pt-2">
              {/* ── Step 0: Semla info ── */}
              {step === 0 && (
                <div className="flex flex-col gap-3">
                  <div className="grid grid-cols-2 gap-3">
                    <div className="col-span-2">
                      <Input
                        isRequired
                        label="Bakery"
                        placeholder="e.g. Babettes"
                        value={info.bakery}
                        onValueChange={(v) => setInfo((p) => ({ ...p, bakery: v }))}
                        isInvalid={!!errors.bakery}
                        errorMessage={errors.bakery}
                      />
                    </div>
                    <Input
                      isRequired
                      label="City"
                      placeholder="e.g. Stockholm"
                      value={info.city}
                      onValueChange={(v) => setInfo((p) => ({ ...p, city: v }))}
                      isInvalid={!!errors.city}
                      errorMessage={errors.city}
                    />
                    <Input
                      isRequired
                      label="Price (SEK)"
                      type="number"
                      placeholder="e.g. 59"
                      value={info.price}
                      onValueChange={(v) => setInfo((p) => ({ ...p, price: v }))}
                      isInvalid={!!errors.price}
                      errorMessage={errors.price}
                    />
                    <div className="col-span-2">
                      <Input
                        isRequired
                        label="Kind"
                        placeholder="e.g. Classic, Almond, Kaffesemla…"
                        value={info.kind}
                        onValueChange={(v) => setInfo((p) => ({ ...p, kind: v }))}
                        isInvalid={!!errors.kind}
                        errorMessage={errors.kind}
                      />
                    </div>
                  </div>
                  <Switch
                    isSelected={info.vegan}
                    onValueChange={(v) => setInfo((p) => ({ ...p, vegan: v }))}
                  >
                    Vegan
                  </Switch>
                  <div className="flex flex-col gap-1">
                    <label className="text-sm text-default-500">Photo (optional)</label>
                    <input
                      type="file"
                      accept="image/jpeg,image/png,image/webp"
                      onChange={handleFileChange}
                      className="block w-full text-sm text-default-500
                        file:mr-3 file:py-1.5 file:px-3 file:rounded-lg file:border-0
                        file:text-sm file:font-medium file:bg-primary/10 file:text-primary
                        hover:file:bg-primary/20 cursor-pointer"
                    />
                    {imageError && <p className="text-xs text-danger">{imageError}</p>}
                  </div>
                </div>
              )}

              {/* ── Step 1: Rate it ── */}
              {step === 1 && (
                <div className="flex flex-col gap-4">
                  <div className="bg-default-100 rounded-xl px-3.5 py-2.5 flex justify-between items-center">
                    <div>
                      <span className="text-sm font-semibold">{info.kind} Semla</span>
                      <span className="text-xs text-default-500 ml-2">{info.bakery} · {info.city}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs text-default-500">{info.price} SEK</span>
                      {info.vegan && (
                        <span className="inline-flex items-center px-2 py-0.5 rounded-full bg-green-500/15 text-green-500 text-[11px] font-semibold">
                          Vegan
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="flex flex-col gap-3">
                    {CATS.map((c) => (
                      <div key={c.key} className="flex items-center justify-between">
                        <div>
                          <div className="text-sm font-semibold">{c.label}</div>
                          <div className="text-xs text-default-500">{c.sub}</div>
                        </div>
                        <StarRow
                          value={rate[c.key]}
                          onChange={(v) => setRate((p) => ({ ...p, [c.key]: v }))}
                        />
                      </div>
                    ))}
                  </div>

                  {errors.stars && (
                    <p className="text-xs text-danger text-center">{errors.stars}</p>
                  )}

                  {avg > 0 && (
                    <div className="flex items-center justify-center gap-2 pt-2 border-t border-default-200">
                      <span className="text-xs text-default-500">Your average</span>
                      <span className="text-xl font-bold text-yellow-500">{avg.toFixed(1)}</span>
                      <span className="text-xs text-default-500">/ 5</span>
                    </div>
                  )}

                  <Input
                    label="Your name (optional)"
                    placeholder="Leave blank to post anonymously"
                    value={rate.name}
                    onValueChange={(v) => setRate((p) => ({ ...p, name: v }))}
                  />
                  <Textarea
                    label="Comment (optional)"
                    placeholder="What stood out?"
                    minRows={2}
                    value={rate.comment}
                    onValueChange={(v) => setRate((p) => ({ ...p, comment: v }))}
                  />

                  {errors.submit && (
                    <p className="text-xs text-danger text-center">{errors.submit}</p>
                  )}
                </div>
              )}

              {/* ── Step 2: Success ── */}
              {step === 2 && (
                <div className="flex flex-col items-center text-center py-6 gap-3">
                  <span className="text-5xl text-yellow-500">★</span>
                  <h3 className="text-lg font-bold">Semla added!</h3>
                  <p className="text-sm text-default-500">{doneInfo.bakery}</p>
                  <p className="text-sm text-default-500">
                    Your rating of{" "}
                    <span className="text-yellow-500 font-bold">{doneInfo.avg.toFixed(1)}/5</span>
                    {" "}has been saved.
                  </p>
                </div>
              )}
            </ModalBody>

            <ModalFooter className="flex justify-between">
              {step === 0 && (
                <>
                  <Button color="danger" variant="light" onPress={handleClose}>Cancel</Button>
                  <Button color="primary" onPress={goNext}>Next — Rate it →</Button>
                </>
              )}
              {step === 1 && (
                <>
                  <Button variant="bordered" onPress={goBack}>← Back</Button>
                  <Button color="primary" isDisabled={isSubmitting} onPress={handleSubmit}>
                    {isSubmitting && <Spinner size="sm" className="mr-1" />}
                    Submit Semla
                  </Button>
                </>
              )}
              {step === 2 && (
                <Button color="primary" className="ml-auto" onPress={handleClose}>Done</Button>
              )}
            </ModalFooter>
          </>
        )}
      </ModalContent>
    </Modal>
  );
}
