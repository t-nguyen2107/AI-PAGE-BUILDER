import type { ProductCardsProps } from "../types";

export function ProductCards({ heading, columns, products }: ProductCardsProps) {
  return (
    <section className="w-full py-20 px-6 bg-background text-foreground">
      <div className="max-w-6xl mx-auto">
        {heading && (
          <h2 className="text-3xl md:text-4xl font-bold text-center mb-12">
            {heading}
          </h2>
        )}
        <div
          className={`grid gap-6 grid-cols-1 md:grid-cols-2 ${columns >= 3 ? "lg:grid-cols-3" : ""} ${columns >= 4 ? "xl:grid-cols-4" : ""}`}
        >
          {products.map((product, i) => (
            <div
              key={i}
              className="group rounded-lg border border-border overflow-hidden hover:shadow-md transition"
            >
              {product.imageUrl && (
                <div className="relative">
                  <img
                    src={product.imageUrl}
                    alt={product.name}
                    className="w-full aspect-video object-cover"
                  />
                  {product.badge && (
                    <span className="absolute top-3 left-3 bg-primary text-primary-foreground text-xs font-semibold px-2.5 py-1 rounded-full">
                      {product.badge}
                    </span>
                  )}
                </div>
              )}
              {!product.imageUrl && product.badge && (
                <div className="relative">
                  <div className="w-full aspect-video bg-muted" />
                  <span className="absolute top-3 left-3 bg-primary text-primary-foreground text-xs font-semibold px-2.5 py-1 rounded-full">
                    {product.badge}
                  </span>
                </div>
              )}
              <div className="p-5">
                <h3 className="font-semibold mb-1 group-hover:text-primary transition">
                  {product.name}
                </h3>
                {product.description && (
                  <p className="text-muted-foreground text-sm line-clamp-2 mb-3">
                    {product.description}
                  </p>
                )}
                <div className="flex items-center gap-2 mb-4">
                  <span className="text-lg font-bold">{product.price}</span>
                  {product.originalPrice && (
                    <span className="text-sm text-muted-foreground line-through">
                      {product.originalPrice}
                    </span>
                  )}
                </div>
                <a
                  href={product.href}
                  className="inline-block rounded-lg px-5 py-2 text-sm font-semibold border border-border text-foreground hover:bg-muted transition"
                >
                  View
                </a>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
