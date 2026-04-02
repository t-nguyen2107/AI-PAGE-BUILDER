import type { ContactFormProps } from "../types";

export function ContactForm({
  heading,
  subtext,
  showPhone,
  showCompany,
  buttonText,
}: ContactFormProps) {
  return (
    <section className="w-full py-20 px-6 bg-background text-foreground">
      <div className="max-w-6xl mx-auto grid md:grid-cols-2 gap-12">
        <div>
          <h2 className="text-3xl md:text-4xl font-bold mb-4">{heading}</h2>
          {subtext && (
            <p className="text-muted-foreground text-lg leading-relaxed">
              {subtext}
            </p>
          )}
        </div>
        <div>
          <form className="space-y-4" onSubmit={(e) => e.preventDefault()}>
            <input
              type="text"
              placeholder="Name"
              className="w-full border border-border rounded-lg px-4 py-2 bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary"
            />
            <input
              type="email"
              placeholder="Email"
              className="w-full border border-border rounded-lg px-4 py-2 bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary"
            />
            {showPhone && (
              <input
                type="tel"
                placeholder="Phone"
                className="w-full border border-border rounded-lg px-4 py-2 bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary"
              />
            )}
            {showCompany && (
              <input
                type="text"
                placeholder="Company"
                className="w-full border border-border rounded-lg px-4 py-2 bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary"
              />
            )}
            <textarea
              placeholder="Message"
              rows={5}
              className="w-full border border-border rounded-lg px-4 py-2 bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary resize-none"
            />
            <button
              type="submit"
              className="bg-primary text-primary-foreground rounded-lg px-6 py-3 font-semibold hover:opacity-90 transition"
            >
              {buttonText || "Send Message"}
            </button>
          </form>
        </div>
      </div>
    </section>
  );
}
