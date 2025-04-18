"use client";
// import { Link } from "@heroui/link";
// import { Snippet } from "@heroui/snippet";
// import { Code } from "@heroui/code";
// import { button as buttonStyles } from "@heroui/theme";

// import { siteConfig } from "@/config/site";
// import { title, subtitle } from "@/components/primitives";
// import { GithubIcon } from "@/components/icons";
// import { Card } from "@heroui/card";
import { useContext, useEffect } from "react";
import { SemelContext } from "@/app/SemelProvider";

export default function Home() {
  const ctx = useContext(SemelContext);

  useEffect(() => {
    console.log("ctx", ctx);
  }, [ctx]);
  return (
    <section className="flex flex-col items-center justify-center gap-4 py-8 md:py-10">
      hej
    </section>
  );
}
