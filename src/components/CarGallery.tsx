import Image from "next/image";

interface Props {
  images: string[];
  videoUrl: string;
}

export default function CarGallery({ images, videoUrl }: Props) {
  return (
    <div className="flex gap-4">
      <div className="w-1/2">
        <Image
          src={images[0]}
          alt="Car"
          width={400}
          height={300}
          className="rounded"
        />
        <div className="mt-2 grid grid-cols-3 gap-2">
          {images.map((img, i) => (
            <Image key={i} src={img} alt={`img-${i}`} width={100} height={80} />
          ))}
        </div>
      </div>
      <div className="w-1/2">
        <iframe
          src={videoUrl}
          width="100%"
          height="300"
          className="rounded"
          allowFullScreen
        />
      </div>
    </div>
  );
}







