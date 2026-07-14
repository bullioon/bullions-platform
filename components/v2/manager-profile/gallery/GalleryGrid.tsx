import {
  GalleryItem,
  type GalleryImage,
} from "./GalleryItem";

type Props = {
  images: GalleryImage[];
  onOpen: (index: number) => void;
};

export function GalleryGrid({
  images,
  onOpen,
}: Props) {
  return (
    <div className="grid gap-3 md:grid-cols-[1.25fr_0.75fr_0.75fr]">
      {images.slice(0, 5).map((image, index) => (
        <GalleryItem
          key={image.id}
          image={image}
          featured={index === 0}
          onOpen={() => onOpen(index)}
        />
      ))}
    </div>
  );
}
