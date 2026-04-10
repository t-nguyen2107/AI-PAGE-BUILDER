"use client";

import { useState } from "react";
import type { ContactFormProps, ComponentMeta } from "../types";
import { extractStyleProps } from "../lib/style-override";
import { useScrollAnimation } from "../hooks/useScrollAnimation";
import { getDesignTokens } from "../lib/design-styles";

/* ------------------------------------------------------------------ */
/*  Success animation CSS (injected once via dangerouslySetInnerHTML)  */
/* ------------------------------------------------------------------ */
const CF_SUCCESS_CSS = `
@keyframes cf-stroke-circle { to { stroke-dashoffset: 0; } }
@keyframes cf-stroke-check { to { stroke-dashoffset: 0; } }
@keyframes cf-scale-in { from { transform: scale(0.6); opacity: 0; } to { transform: scale(1); opacity: 1; } }
@keyframes cf-fade-in { to { opacity: 1; } }

.cf-checkmark-svg { color: #16a34a; }
.cf-checkmark-circle { stroke-dasharray: 166; stroke-dashoffset: 166; animation: cf-stroke-circle 0.6s cubic-bezier(0.65,0,0.45,1) forwards; }
.cf-checkmark-check { stroke-dasharray: 48; stroke-dashoffset: 48; animation: cf-stroke-check 0.3s cubic-bezier(0.65,0,0.45,1) 0.4s forwards; }
.cf-success-heading { animation: cf-scale-in 0.4s cubic-bezier(0.34,1.56,0.64,1) 0.5s both; }
.cf-success-subtext { opacity: 0; animation: cf-fade-in 0.5s ease 0.7s forwards; }
`;

/* ------------------------------------------------------------------ */
/*  Animated success state                                             */
/* ------------------------------------------------------------------ */
function SuccessState() {
  return (
    <div className="cf-success flex flex-col items-center justify-center py-16 text-center">
      {/* Animated checkmark circle */}
      <div className="relative w-20 h-20 mb-6">
        <svg
          className="cf-checkmark-svg"
          viewBox="0 0 52 52"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <circle
            className="cf-checkmark-circle"
            cx="26"
            cy="26"
            r="24"
            stroke="currentColor"
            strokeWidth="2"
            fill="none"
          />
          <path
            className="cf-checkmark-check"
            d="M14 27l8 8 16-16"
            stroke="currentColor"
            strokeWidth="3"
            strokeLinecap="round"
            strokeLinejoin="round"
            fill="none"
          />
        </svg>
      </div>

      <h3 className="cf-success-heading text-2xl font-semibold text-green-600 mb-2">
        Thank you!
      </h3>
      <p className="cf-success-subtext text-muted-foreground">
        We&apos;ll get back to you soon.
      </p>

      {/* Scoped keyframe styles */}
      <style dangerouslySetInnerHTML={{ __html: CF_SUCCESS_CSS }} />
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Shared input classes                                               */
/* ------------------------------------------------------------------ */

const INPUT_BASE =
  "w-full border border-border rounded-lg px-4 py-2.5 bg-background text-foreground transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary";

const TEXTAREA_BASE =
  "w-full border border-border rounded-lg px-4 py-2.5 bg-background text-foreground transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary resize-none";

/* ------------------------------------------------------------------ */
/*  Floating-label input wrapper                                       */
/* ------------------------------------------------------------------ */

function FloatingField({
  id,
  label,
  type = "text",
  required = false,
  multiline = false,
  rows,
}: {
  id: string;
  label: string;
  type?: string;
  required?: boolean;
  multiline?: boolean;
  rows?: number;
}) {
  const shared = "peer w-full border border-border rounded-lg bg-background text-foreground transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary placeholder-transparent";

  const inputClasses = `${shared} px-4 pt-5 pb-2`;

  const labelClasses =
    "absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground text-base transition-all duration-200 pointer-events-none " +
    "peer-focus:top-2.5 peer-focus:-translate-y-0 peer-focus:text-xs peer-focus:text-primary " +
    "peer-not-placeholder-shown:top-2.5 peer-not-placeholder-shown:-translate-y-0 peer-not-placeholder-shown:text-xs peer-not-placeholder-shown:text-muted-foreground";

  return (
    <div className="relative">
      {multiline ? (
        <textarea
          id={id}
          name={id}
          placeholder={label}
          rows={rows ?? 5}
          required={required}
          className={`${inputClasses} resize-none`}
        />
      ) : (
        <input
          id={id}
          name={id}
          type={type}
          placeholder={label}
          required={required}
          className={inputClasses}
        />
      )}
      <label htmlFor={id} className={labelClasses}>
        {label}
      </label>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Main component                                                     */
/* ------------------------------------------------------------------ */

export function ContactForm(props: ContactFormProps & ComponentMeta) {
  const {
    heading,
    subtext,
    showPhone,
    showCompany,
    buttonText,
    layout = "split",
    floatingLabels = false,
    animation = "fade-up",
    designStyle,
    className,
    ...metaRest
  } = props;

  const ds = getDesignTokens(designStyle);
  const anim = useScrollAnimation(animation);
  const [submitted, setSubmitted] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setTimeout(() => {
      setSubmitting(false);
      setSubmitted(true);
    }, 1000);
  };

  /* ---- Heading block ---- */
  const headingBlock = (
    <div className={layout === "centered" ? "text-center mb-10" : ""}>
      <h2 className={ds.typography.h2}>{heading}</h2>
      {subtext && (
        <p className={`${ds.typography.body} mt-3`}>{subtext}</p>
      )}
    </div>
  );

  /* ---- Form block ---- */
  const formBlock = submitted ? (
    <SuccessState />
  ) : (
    <form className="space-y-4" onSubmit={handleSubmit}>
      {floatingLabels ? (
        <>
          <FloatingField id="cf-name" label="Name" required />
          <FloatingField id="cf-email" label="Email" type="email" required />
          {showPhone && <FloatingField id="cf-phone" label="Phone" type="tel" />}
          {showCompany && <FloatingField id="cf-company" label="Company" />}
          <FloatingField id="cf-message" label="Message" multiline rows={5} required />
        </>
      ) : (
        <>
          <input
            type="text"
            name="name"
            placeholder="Name"
            className={INPUT_BASE}
            required
          />
          <input
            type="email"
            name="email"
            placeholder="Email"
            className={INPUT_BASE}
            required
          />
          {showPhone && (
            <input
              type="tel"
              name="phone"
              placeholder="Phone"
              className={INPUT_BASE}
            />
          )}
          {showCompany && (
            <input
              type="text"
              name="company"
              placeholder="Company"
              className={INPUT_BASE}
            />
          )}
          <textarea
            name="message"
            placeholder="Message"
            rows={5}
            className={TEXTAREA_BASE}
            required
          />
        </>
      )}

      <button
        type="submit"
        disabled={submitting}
        className={`${ds.button.primary} hover:-translate-y-0.5 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:translate-y-0`}
      >
        {submitting ? "Sending..." : buttonText || "Send Message"}
      </button>
    </form>
  );

  /* ---- Layout: split vs centered ---- */
  const isSplit = layout !== "centered";

  return (
    <section
      className={`w-full ${ds.section.base} text-foreground ${className ?? ""}`}
      style={extractStyleProps(metaRest)}
    >
      {ds.section.decorative && (
        <div className="absolute inset-0 overflow-hidden pointer-events-none" aria-hidden="true">
          <div className={ds.section.decorative} />
        </div>
      )}

      <div
        ref={anim.ref}
        className={`${ds.containerWidth} mx-auto relative transition-all duration-700 ease-out ${anim.className} ${
          isSplit
            ? "grid md:grid-cols-2 gap-12 items-start"
            : "max-w-2xl mx-auto"
        }`}
      >
        {isSplit ? (
          <>
            {headingBlock}
            <div>{formBlock}</div>
          </>
        ) : (
          <>
            {headingBlock}
            {formBlock}
          </>
        )}
      </div>
    </section>
  );
}
