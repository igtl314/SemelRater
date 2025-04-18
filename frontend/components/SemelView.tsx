import { Semel, SemelRatingsFetch } from "@/types";
import { SemelCard } from "./SemelCard";
import { Spinner } from "@heroui/spinner";
import { useState } from "react";
import { SemelModal } from "./SemelModal";
import { useDisclosure } from "@heroui/modal";
import { useSemelComments } from "@/app/_actions/GetSemelComments";

export function SemelView({ semelArray }: { semelArray: Semel[] }) {
  const [semelModalContent, setSemelModalContent] = useState<Semel | null>(
    null
  );
  const { isOpen, onOpen, onOpenChange } = useDisclosure();
  const { ratings, isLoading, isError } = useSemelComments(
    semelModalContent?.id || 0
  );

  const comments: SemelRatingsFetch = {
    ratings: semelModalContent ? ratings : [],
    isLoading,
    isError,
  };

  const handleModalContent = (semel: Semel) => {
    setSemelModalContent(semel);
    onOpen();
  };

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
      {semelArray.length > 0 ? (
        semelArray.map((semel: Semel) => (
          <SemelCard
            key={semel.id}
            semel={semel}
            setModalContent={handleModalContent}
          />
        ))
      ) : (
        <Spinner className="col-span-full" />
      )}
      {semelModalContent && (
        <SemelModal
          Semel={semelModalContent}
          isOpen={isOpen}
          onOpenChange={onOpenChange}
          SemelComments={comments}
        />
      )}
    </div>
  );
}
