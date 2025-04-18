import { Semel } from "@/types";
import { SemelCard } from "./SemelCard";
import { Spinner } from "@heroui/spinner";
export function SemelView({ semelArray }: { semelArray: Semel[] }) {
  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
      {semelArray.length > 0 ? (
        semelArray.map((semel: Semel) => (
          <SemelCard key={semel.id} semel={semel} />
        ))
      ) : (
        <Spinner />
      )}
    </div>
  );
}
