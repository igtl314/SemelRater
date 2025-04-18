import { Semel } from "@/types";
import { SemelCard } from "./SemelCard";
import { Spinner } from "@heroui/spinner";
import { useEffect, useState } from "react";
import { SemelModal } from "./SemelModal";
import { useDisclosure } from "@heroui/modal";
export function SemelView({ semelArray }: { semelArray: Semel[] }) {
  const [semelModalContent, setSemelModalContent] = useState<Semel | null>(
    null
  );
  const { isOpen, onOpen, onOpenChange } = useDisclosure();

  useEffect(() => {
    onOpen();
  }, [semelModalContent]);

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
      {semelArray.length > 0 ? (
        semelArray.map((semel: Semel) => (
          <SemelCard
            key={semel.id}
            semel={semel}
            setModalContent={setSemelModalContent}
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
        />
      )}
    </div>
  );
}
