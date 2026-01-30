import { Modal, ModalBody, ModalFooter, ModalContent } from "@heroui/modal";
import { Button } from "@heroui/button";
import { Spinner } from "@heroui/spinner";
import { Carousel } from "react-responsive-carousel";

import { SemelImage } from "./SemelImage";
import { Comment } from "./Comment";

import { Semel, SemelRatingsFetch } from "@/types";

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
  return (
    <Modal isOpen={isOpen} onOpenChange={onOpenChange}>
      <ModalContent>
        {(onClose) => (
          <>
            <ModalBody className="flex flex-col gap-4">
              <Carousel>
                {Semel.images.map((image) => (
                  <div key={image.id}>
                    <SemelImage src={image.image_url} />
                  </div>
                ))}
              </Carousel>
              <div className="flex flex-col gap-2 overflow-y-scroll h-4/5 max-h-64">
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
