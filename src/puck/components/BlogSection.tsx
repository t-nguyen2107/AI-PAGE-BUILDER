import type { BlogSectionProps } from "../types";

export function BlogSection({ heading, posts, columns }: BlogSectionProps) {
  return (
    <section className="w-full py-20 px-6 bg-background text-foreground">
      <div className="max-w-6xl mx-auto">
        <h2 className="text-3xl md:text-4xl font-bold text-center mb-12">
          {heading}
        </h2>
        <div
          className="grid gap-6"
          style={{ gridTemplateColumns: `repeat(${columns}, minmax(0, 1fr))` }}
        >
          {posts.map((post, i) => (
            <a
              key={i}
              href={post.href}
              className="group rounded-xl bg-card border border-border overflow-hidden hover:shadow-md transition"
            >
              {post.imageUrl && (
                <img
                  src={post.imageUrl}
                  alt={post.title}
                  className="w-full aspect-video object-cover"
                />
              )}
              <div className="p-5">
                {post.date && (
                  <p className="text-sm text-muted-foreground mb-2">{post.date}</p>
                )}
                <h3 className="font-semibold mb-2 group-hover:text-primary transition">
                  {post.title}
                </h3>
                <p className="text-muted-foreground text-sm line-clamp-2">
                  {post.excerpt}
                </p>
              </div>
            </a>
          ))}
        </div>
      </div>
    </section>
  );
}
