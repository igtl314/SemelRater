import { Card, CardBody, CardFooter } from "@heroui/card";
import { Button } from "@heroui/button";

import { SemelImage } from "./SemelImage";

import { Semel } from "@/types";

export function SemelCard({
  semel,
  setModalContent,
  openCommentModal,
}: {
  semel: Semel;
  setModalContent: (semel: Semel) => void;
  openCommentModal: (semel: Semel) => void;
}) {
  const imageUrl = semel.images.length > 0 ? semel.images[0].image_url : "";

  return (
    <Card className="w-full md:w-64 h-auto md:h-96 flex flex-col justify-between">
      <SemelImage src={imageUrl} />
      <CardBody className="p-3 flex flex-col gap-1.5">
        <h3 className="font-bold text-[13px] text-foreground">{semel.kind} Semla</h3>
        <div className="grid grid-cols-2 gap-x-2 gap-y-0.5">
          <p className="text-[11px] text-default-500">Bakery: {semel.bakery}</p>
          <p className="text-[11px] text-default-500">City: {semel.city}</p>
          <div className="flex items-center gap-1">
            <span className="text-[11px] text-default-500">Rating:</span>
            <span className="inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded-full bg-yellow-500/15 text-yellow-500 text-[11px] font-bold">
              ★ {semel.rating}/5
            </span>
          </div>
          <p className="text-[11px] text-default-500">Price: {semel.price}</p>
        </div>
        {semel.vegan && (
          <span className="self-start inline-flex items-center px-2 py-0.5 rounded-full bg-green-500/15 text-green-500 text-[11px] font-semibold">
            Vegan
          </span>
        )}
      </CardBody>
      <CardFooter className="flex flex-col gap-2 p-3 pt-0">
        <Button
          className="w-full"
          color="primary"
          size="sm"
          onPress={() => setModalContent(semel)}
        >
          View Details
        </Button>
        <Button
          className="w-full"
          color="secondary"
          size="sm"
          onPress={() => openCommentModal(semel)}
        >
          Add Review
        </Button>
      </CardFooter>
    </Card>
  );
}
