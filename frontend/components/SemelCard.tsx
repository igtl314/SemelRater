import { Semel } from "@/types";
import { Card } from "@heroui/card";
import Image from "next/image";

export function SemelCard({ semel }: { semel: Semel }) {
  return (
    <Card className="w-64 h-96 flex flex-col justify-between">
      <Image
        src={"/images/" + semel.picture}
        width={500}
        height={500}
        alt={semel.kind}
        className="w-full h-1/2 object-cover"
      />
      <div className="p-4 flex flex-col gap-2">
        <h3 className="text-lg font-bold">{semel.kind}</h3>
        <p>{semel.bakery}</p>
        <p>{semel.city}</p>
        <p>{semel.price}</p>
        <p>{semel.rating}</p>
      </div>
    </Card>
  );
}
