import Image from "next/image";

export function SemelImage({ src }: { src: string }) {
  return (
    <Image
      src={"/images/" + src}
      width={500}
      height={500}
      alt={src}
      className="w-full h-1/2 object-cover"
    />
  );
}
