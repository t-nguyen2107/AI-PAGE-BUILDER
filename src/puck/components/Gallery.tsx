import type { GalleryProps } from "../types";

export function Gallery({ heading, columns, images }: GalleryProps) {
  return (
    <section className="w-full py-16 px-6 bg-background text-foreground">
      <div className="max-w-6xl mx-auto">
        {heading && (
          <h2 className="text-3xl md:text-4xl font-bold text-center mb-12">
            {heading}
          </h2>
        )}
        <div
          className={`grid gap-4 grid-cols-1 sm:grid-cols-2 ${columns >= 3 ? "lg:grid-cols-3" : ""} ${columns >= 4 ? "xl:grid-cols-4" : ""}`}
        >
          {images.map((image, i) => (
            <figure key={i}>
              <img
                src={image.src}
                alt={image.alt}
                className="w-full aspect-4/3 object-cover rounded-lg"
              />
              {image.caption && (
                <figcaption className="mt-2 text-sm text-muted-foreground text-center">
                  {image.caption}
                </figcaption>
              )}
            </figure>
          ))}
        </div>
      </div>
    </section>
  );
}
