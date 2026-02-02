import { useState } from "react";
import { useDisclosure } from "@heroui/modal";

import { SemelCard } from "./SemelCard";
import { CreateCommentModal } from "./CreateCommentModal";

import { Semel } from "@/types";
import { ViewCommentsModal } from "./DetailsModal";

export function SemelView({ semelArray }: { semelArray: Semel[] }) {
  const [semelModalContent, setSemelModalContent] = useState<Semel | null>(
    null,
  );
  // Modal for viewing Semel details
  const { isOpen, onOpen, onOpenChange } = useDisclosure();
  // Modal for adding comments
  const {
    isOpen: isCommentOpen,
    onOpen: onCommentOpen,
    onOpenChange: onCommentOpenChange,
  } = useDisclosure();


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
      {semelArray.map((semel) => (
        <SemelCard
          key={semel.id}
          openCommentModal={handleCommentModal}
          semel={semel}
          setModalContent={handleModalContent}
        />
      ))}
      {semelModalContent && (
        <ViewCommentsModal
          Semel={semelModalContent}
          isOpen={isOpen}
          onOpenChange={onOpenChange}
        />
      )}
      {semelModalContent && (
        <CreateCommentModal
          isOpen={isCommentOpen}
          semel={semelModalContent}
          onOpenChange={onCommentOpenChange}
        />
      )}
    </div>
  );
}
