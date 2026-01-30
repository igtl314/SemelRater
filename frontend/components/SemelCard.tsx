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
  return (
    <Card className="w-full md:w-64 h-auto md:h-96 flex flex-col justify-between">
      <SemelImage src={semel.images[0].image_url} />
      <CardBody className="grid grid-cols-1 md:grid-cols-2 gap-2 p-4">
        {/* <h3 className="md:text-lg font-bold col-span-1 md:col-span-2">
          {semel.kind}
        </h3> */}
        <div className="space-y- md:space-y-0 col-span-1 md:col-span-2 md:grid md:grid-cols-2">
          <h3 className="font-bold">{semel.kind + " Semla"} </h3>
          <p className="text-sm">Bakery: {semel.bakery}</p>
          <p className="text-sm">Location: {semel.city}</p>
          <p className="text-sm">Rating: {semel.rating}/5</p>
          <p className="text-sm">Price: {semel.price}</p>
        </div>
      </CardBody>
      <CardFooter className="flex flex-col md:flex-row gap-2 p-4">
        <Button
          className="w-full"
          color="primary"
          onPress={() => setModalContent(semel)}
        >
          View Details
        </Button>
        <Button
          className="w-full"
          color="secondary"
          onPress={() => openCommentModal(semel)}
        >
          Add Review
        </Button>
      </CardFooter>
    </Card>
  );
}
