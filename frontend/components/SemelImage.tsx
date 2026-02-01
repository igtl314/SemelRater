import Image from "next/image";

export function SemelImage({
  src,
  className,
}: {
  src: string;
  className?: string;
}) {
  return (
    <Image
      alt={src}
      className={className || "w-full h-1/2 object-cover"}
      height={500}
      src={src}
      width={500}
    />
  );
}
