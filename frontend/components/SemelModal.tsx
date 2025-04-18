import { Modal, ModalBody, ModalFooter } from "@heroui/modal";
import { Button } from "@heroui/button";
import { Semel } from "@/types";
import { SemelImage } from "./SemelImage";
export function SemelModal({
  isOpen,
  onClose,
  Semel,
}: {
  isOpen: boolean;
  onClose: () => void;
  Semel: Semel;
}) {
  return (
    <Modal isOpen={isOpen} onClose={onClose}>
      <ModalBody className="flex flex-col gap-4">
        <SemelImage src={Semel.picture} />
        <div className="flex flex-col gap-2">
          <h3 className="text-lg font-bold">{Semel.kind}</h3>
          <p>{Semel.bakery}</p>
          <p>{Semel.city}</p>
          <p>{Semel.price}</p>
          <p>{Semel.rating}</p>
        </div>
      </ModalBody>
      <ModalFooter className="flex justify-end">
        <Button color="danger" onPress={onClose}>
          Close
        </Button>
      </ModalFooter>
    </Modal>
  );
}
