import { Spinner } from "@heroui/spinner";
import { useState } from "react";
import { useDisclosure } from "@heroui/modal";

import { SemelModal } from "./SemelModal";
import { SemelCard } from "./SemelCard";
import { CommentModal } from "./CommentModal";

import { useSemelComments } from "@/app/_actions/GetSemelComments";
import { Semel, SemelRatingsFetch } from "@/types";

export function SemelView({ semelArray }: { semelArray: Semel[] }) {
  const [semelModalContent, setSemelModalContent] = useState<Semel | null>(
    null
  );
  // Modal for viewing Semel details
  const { isOpen, onOpen, onOpenChange } = useDisclosure();
  // Modal for adding comments
  const {
    isOpen: isCommentOpen,
    onOpen: onCommentOpen,
    onOpenChange: onCommentOpenChange,
  } = useDisclosure(); // Add this line

  // Fetch comments for a specific Semel
  const { ratings, isLoading, isError } = useSemelComments(
    semelModalContent?.id || 0
  );

  const comments: SemelRatingsFetch = {
    ratings: semelModalContent ? ratings : [],
    isLoading,
    isError,
  };

  // Function to handle the chosen Semel and open the modal
  const handleModalContent = (semel: Semel) => {
    setSemelModalContent(semel);
    onOpen();
  };
  // Function to handle the chosen Semel and open the new comment modal
  const handleCommentModal = (semel: Semel) => {
    setSemelModalContent(semel);
    onCommentOpen();
  };

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
      {/* Display all Semlor as SemelCard*/}
      {semelArray.length > 0 ? (
        semelArray.map((semel: Semel) => (
          <SemelCard
            key={semel.id}
            openCommentModal={handleCommentModal}
            semel={semel}
            setModalContent={handleModalContent}
          />
        ))
      ) : (
        <Spinner className="col-span-full" />
      )}
      {/* Model for viewing ratings and comment*/}
      {semelModalContent && (
        <SemelModal
          Semel={semelModalContent}
          SemelComments={comments}
          isOpen={isOpen}
          onOpenChange={onOpenChange}
        />
      )}
      {/* Modal for adding comments */}
      {semelModalContent && (
        <CommentModal
          isOpen={isCommentOpen}
          semel={semelModalContent}
          onOpenChange={onCommentOpenChange}
        />
      )}
    </div>
  );
}
