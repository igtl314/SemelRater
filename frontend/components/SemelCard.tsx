import { Semel } from "@/types";
import { Card, CardBody, CardFooter } from "@heroui/card";
import { SemelImage } from "./SemelImage";
import { Button } from "@heroui/button";
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
    <Card className="w-64 h-96 flex flex-col justify-between">
      <SemelImage src={semel.picture} />
      <CardBody className="grid grid-cols-2 gap-2">
        <h3 className="text-lg font-bold col-span-2">{semel.kind}</h3>
        <p>{semel.bakery}</p>
        <p>{semel.city}</p>
        <p>{semel.price}</p>
        <p>{semel.rating}/5</p>
      </CardBody>
      <CardFooter className="grid grid-cols-2 gap-2">
        <Button color="primary" onPress={() => setModalContent(semel)}>
          View Details
        </Button>
        <Button color="secondary" onPress={() => openCommentModal(semel)}>
          Add Review
        </Button>
      </CardFooter>
    </Card>
  );
}
