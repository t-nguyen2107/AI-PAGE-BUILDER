import type { NewsletterSignupProps, ComponentMeta } from "../types";
import { extractStyleProps } from "../lib/style-override";

export function NewsletterSignup(props: NewsletterSignupProps & ComponentMeta) {
  const {
    heading,
    subtext,
    placeholder,
    buttonText,
    layout,
    backgroundUrl,
    className,
    ...metaRest
  } = props;
  const hasBg = !!backgroundUrl;

  const sectionStyle: React.CSSProperties = hasBg
    ? {
        backgroundImage: `linear-gradient(rgba(0,0,0,0.5), rgba(0,0,0,0.5)), url(${backgroundUrl})`,
        backgroundSize: "cover",
        backgroundPosition: "center",
        ...extractStyleProps(metaRest),
      }
    : { ...extractStyleProps(metaRest) };

  const textClass = hasBg ? "text-white" : "text-primary-foreground";
  const inputClass = `w-full border border-border rounded-lg px-4 py-2 bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary`;
  const btnClass = `inline-block rounded-lg px-8 py-3 font-semibold transition ${
    hasBg
      ? "bg-white text-gray-900 hover:bg-gray-100"
      : "bg-primary-foreground text-primary hover:opacity-90"
  }`;

  const formElement = (
    <form className="flex flex-col sm:flex-row gap-3 w-full" onSubmit={(e) => e.preventDefault()}>
      <input
        type="email"
        placeholder={placeholder || "Enter your email"}
        className={inputClass}
      />
      <button type="submit" className={btnClass}>
        {buttonText || "Subscribe"}
      </button>
    </form>
  );

  if (layout === "split") {
    return (
      <section
        className={`w-full py-20 px-6 ${hasBg ? "" : "bg-primary"} ${textClass} ${className ?? ""}`}
        style={sectionStyle}
      >
        <div className="max-w-6xl mx-auto grid md:grid-cols-2 gap-12 items-center">
          <div>
            <h2 className="text-3xl md:text-4xl font-bold mb-4">{heading}</h2>
            {subtext && (
              <p className="text-lg opacity-80 leading-relaxed">{subtext}</p>
            )}
          </div>
          <div>{formElement}</div>
        </div>
      </section>
    );
  }

  return (
    <section
      className={`w-full py-20 px-6 ${hasBg ? "" : "bg-primary"} ${textClass} ${className ?? ""}`}
      style={sectionStyle}
    >
      <div className="max-w-3xl mx-auto text-center">
        <h2 className="text-3xl md:text-4xl font-bold mb-4">{heading}</h2>
        {subtext && (
          <p className="text-lg opacity-80 mb-8 max-w-xl mx-auto">{subtext}</p>
        )}
        <div className="max-w-md mx-auto">{formElement}</div>
      </div>
    </section>
  );
}
