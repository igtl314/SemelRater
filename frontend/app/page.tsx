"use client";
// import { Link } from "@heroui/link";
// import { Snippet } from "@heroui/snippet";
// import { Code } from "@heroui/code";
// import { button as buttonStyles } from "@heroui/theme";

// import { siteConfig } from "@/config/site";
// import { title, subtitle } from "@/components/primitives";
// import { GithubIcon } from "@/components/icons";
// import { Card } from "@heroui/card";
import { useContext, useEffect, useState } from "react";
import { SemelContext } from "@/app/SemelProvider";
import { Semel } from "@/types";
import { SemelCard } from "@/components/SemelCard";

export default function Home() {
  const [semels, setSemels] = useState<Semel[]>([]);
  const ctx = useContext(SemelContext);

  useEffect(() => {
    const sorted = [...ctx].sort((a, b) => (b.rating ?? 0) - (a.rating ?? 0));
    setSemels(sorted);
  }, [ctx]);
  return (
    <section className="flex flex-col items-center justify-center gap-4 py-8 md:py-10">
      <div className=" grid grid-row-2 gap-4 border-b-2 border-b-gray-300 pb-4">
        <p className="text-xl">Top 3 Semlor</p>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {semels.slice(0, 3).map((semel) => (
            <div key={semel.id} className="flex items-center gap-2">
              <SemelCard semel={semel} />
            </div>
          ))}
        </div>
      </div>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {semels.map((semel) => (
          <SemelCard key={semel.id} semel={semel} />
        ))}
      </div>
    </section>
  );
}
