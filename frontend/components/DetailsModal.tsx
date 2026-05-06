import { Modal, ModalBody, ModalFooter, ModalContent, ModalHeader } from "@heroui/modal";
import { Button } from "@heroui/button";
import { Spinner } from "@heroui/spinner";
import { Carousel } from "react-responsive-carousel";
import "react-responsive-carousel/lib/styles/carousel.min.css";

import { SemelImage } from "./SemelImage";
import { Comment } from "./Comment";

import { Semel, SemelRatingsFetch } from "@/types";
import { useSemelComments } from "@/app/_actions/GetSemelComments";

export function ViewCommentsModal({
  Semel,
  isOpen,
  onOpenChange,
}: {
  Semel: Semel;
  isOpen: boolean;
  onOpenChange: () => void;
}) {
    const { ratings, isLoading, isError } = useSemelComments(
      Semel.id || 0,
    );
  
    const comments: SemelRatingsFetch = {
      ratings: Semel ? ratings : [],
      isLoading,
      isError,
    };
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
                        <p className="text-tiny text-default-500 uppercase font-bold mb-1">Price</p>
                        <p className="font-semibold">{Semel.price}</p>
                     </div>
                     <div>
                        <p className="text-tiny text-default-500 uppercase font-bold mb-1">Type</p>
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full bg-primary/10 text-primary text-xs font-semibold">
                          {Semel.kind}
                        </span>
                     </div>
                     <div>
                        <p className="text-tiny text-default-500 uppercase font-bold mb-1">Diet</p>
                        {Semel.vegan ? (
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full bg-green-500/15 text-green-500 text-xs font-semibold">
                            Vegan
                          </span>
                        ) : (
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full bg-zinc-800 text-zinc-400 text-xs font-semibold">
                            Non-vegan
                          </span>
                        )}
                     </div>
                      <div>
                        <p className="text-tiny text-default-500 uppercase font-bold mb-1">Rating</p>
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-yellow-500/15 text-yellow-500 text-sm font-bold">
                          ★ {Semel.rating}/5
                        </span>
                     </div>
                  </div>
                </div>

                {/* Right Column: Comments */}
                <div className="flex flex-col h-full">
                  <h3 className="text-xl font-semibold mb-3">Comments</h3>
                   <div className="flex-1 overflow-y-auto pr-2">
                    {comments.isLoading ? (
                      <div className="flex justify-center items-center h-40">
                         <Spinner />
                      </div>
                    ) : comments.ratings?.length === 0 ? (
                      <div className="text-center p-8 text-default-400">
                        <p>No comments yet. Be the first to share your thoughts!</p>
                      </div>
                    ) : (
                      comments.ratings?.map((comment, index) => (
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
