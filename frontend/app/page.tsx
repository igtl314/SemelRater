"use client";
import { useContext, useEffect, useState } from "react";
import { Spinner } from "@heroui/spinner";

import { SemelContext } from "@/app/SemelProvider";
import { Semel } from "@/types";
import { SemelView } from "@/components/SemelView";
import { ThemeSwitch } from "@/components/theme-switch";

export default function Home() {
  const [semels, setSemels] = useState<Semel[]>([]);
  const ctx = useContext(SemelContext);

  // Sort the semels by rating in descending order
  useEffect(() => {
    const sorted = [...ctx.semels].sort(
      (a, b) => (b.rating ?? 0) - (a.rating ?? 0),
    );

    setSemels(sorted);
  }, [ctx.semels]);

  return (
    <section className="flex flex-col items-center justify-center gap-4 py-8 md:py-10">
      {ctx.isLoading && (
        <div className="flex items-center justify-center">
          <Spinner />
        </div>
      )}
      {semels.length > 0 ? (
        <>
          <Top3Semels semels={semels} />
          <AllSemels semels={semels} />
        </>
      ) : (
        <p>No semels found.</p>
      )}
    </section>
  );
}

function Top3Semels({ semels }: { semels: Semel[] }) {
  return (
    <div className=" grid grid-row-2 gap-4 border-b-2 border-b-gray-300 pb-4">
      <p className="text-xl text-center">Top 3 Semlor</p>
      <SemelView semelArray={semels.slice(0, 3)} />
    </div>
  );
}

function AllSemels({ semels }: { semels: Semel[] }) {
  return (
    <>
      <p className="text-xl">All Semlor</p>
      <SemelView semelArray={semels} />
    </>
  );
}
