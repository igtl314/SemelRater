import Image from "next/image";

export function SemelImage({ src }: { src: string }) {
  return (
    <Image
      alt={src}
      className="w-full h-1/2 object-cover"
      height={500}
      src={src}
      width={500}
    />
  );
}
