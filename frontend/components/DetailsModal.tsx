import { Modal, ModalBody, ModalFooter, ModalContent, ModalHeader } from "@heroui/modal";
import { Button } from "@heroui/button";
import { Spinner } from "@heroui/spinner";
import { Carousel } from "react-responsive-carousel";
import "react-responsive-carousel/lib/styles/carousel.min.css";

import { SemelImage } from "./SemelImage";
import { Comment } from "./Comment";

import { Semel, SemelRatingsFetch } from "@/types";

export function ViewCommentsModal({
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
    <Modal isOpen={isOpen} onOpenChange={onOpenChange} size="5xl" scrollBehavior="inside">
      <ModalContent className="max-h-[90vh]">
        {(onClose) => (
          <>
            <ModalHeader className="flex flex-col gap-1">
              <h2 className="text-2xl font-bold">{Semel.bakery}</h2>
              <p className="text-small text-default-500">{Semel.city}</p>
            </ModalHeader>
            <ModalBody>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 h-full">
                {/* Left Column: Images and Details */}
                <div className="flex flex-col gap-4">
                  <div className="rounded-xl overflow-hidden shadow-sm">
                   <Carousel showThumbs={false} dynamicHeight={false} showStatus={false}>
                      {Semel.images.map((image) => (
                        <div key={image.id} className="relative aspect-[4/3]">
                          <SemelImage
                            className="w-full h-full object-cover"
                            src={image.image_url}
                          />
                        </div>
                      ))}
                    </Carousel>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4 p-4 bg-default-50 rounded-lg">
                     <div>
                        <p className="text-tiny text-default-500 uppercase font-bold">Price</p>
                        <p className="font-semibold">{Semel.price}</p>
                     </div>
                     <div>
                        <p className="text-tiny text-default-500 uppercase font-bold">Type</p>
                        <p className="font-semibold">{Semel.kind}</p>
                     </div>
                     <div>
                        <p className="text-tiny text-default-500 uppercase font-bold">Vegan</p>
                        <p className="font-semibold">{Semel.vegan ? "Yes" : "No"}</p>
                     </div>
                      <div>
                        <p className="text-tiny text-default-500 uppercase font-bold">Rating</p>
                        <p className="font-semibold text-yellow-500">{Semel.rating}/5</p>
                     </div>
                  </div>
                </div>

                {/* Right Column: Comments */}
                <div className="flex flex-col h-full">
                  <h3 className="text-xl font-semibold mb-3">Comments</h3>
                   <div className="flex-1 overflow-y-auto pr-2">
                    {SemelComments.isLoading ? (
                      <div className="flex justify-center items-center h-40">
                         <Spinner />
                      </div>
                    ) : SemelComments.ratings?.length === 0 ? (
                      <div className="text-center p-8 text-default-400">
                        <p>No comments yet. Be the first to share your thoughts!</p>
                      </div>
                    ) : (
                      SemelComments.ratings?.map((comment, index) => (
                        <Comment key={index} comment={comment} />
                      ))
                    )}
                  </div>
                </div>
              </div>
            </ModalBody>
            <ModalFooter>
              <Button color="danger" variant="light" onPress={onClose}>
                Close
              </Button>
            </ModalFooter>
          </>
        )}
      </ModalContent>
    </Modal>
  );
}
