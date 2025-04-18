import { Modal, ModalBody, ModalFooter, ModalContent } from "@heroui/modal";
import { Button } from "@heroui/button";
import { Semel, SemelRatingsFetch } from "@/types";
import { SemelImage } from "./SemelImage";
import { Spinner } from "@heroui/spinner";
import { Comment } from "./Comment";

export function SemelModal({
  Semel,
  isOpen,
  onOpenChange,
  SemelComments,
}: {
  Semel: Semel;
  isOpen: boolean;
  onOpenChange: () => void;
  SemelComments: SemelRatingsFetch;
}) {
  console.log("Commensts", SemelComments);
  return (
    <Modal isOpen={isOpen} onOpenChange={onOpenChange}>
      <ModalContent>
        {(onClose) => (
          <>
            <ModalBody className="flex flex-col gap-4">
              <SemelImage src={Semel.picture} />
              <div className="flex flex-col gap-2">
                {SemelComments.isLoading ? (
                  <Spinner />
                ) : SemelComments.ratings?.length === 0 ? (
                  <p>No comments yet</p>
                ) : (
                  SemelComments.ratings?.map((comment, index) => (
                    <Comment key={index} comment={comment} />
                  ))
                )}
              </div>
            </ModalBody>
            <ModalFooter className="flex justify-end">
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
