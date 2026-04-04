import React from "react";
import type { ComponentConfig } from "@puckeditor/core";
import { withLayout, type WithLayout } from "./Layout";
import { withStyles, type WithStyles } from "../fields/withStyles";
import { Section } from "./Section";

export type CardProps = WithLayout<WithStyles<{
  title: string;
  description: string;
  icon?: string;
  imageUrl?: string;
  href?: string;
  mode: "card" | "flat";
}>>;

function CardIcon({ name }: { name?: string }) {
  if (!name) return null;

  const icons: Record<string, React.ReactElement> = {
    zap: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" />
      </svg>
    ),
    shield: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
      </svg>
    ),
    speed: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M12 2a10 10 0 1 0 0 20 10 10 0 0 0 0-20z" />
        <path d="M12 6v6l4 2" />
      </svg>
    ),
    star: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
      </svg>
    ),
    heart: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
      </svg>
    ),
    check: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <polyline points="20 6 9 17 4 12" />
      </svg>
    ),
    code: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <polyline points="16 18 22 12 16 6" /><polyline points="8 6 2 12 8 18" />
      </svg>
    ),
    globe: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="12" r="10" /><line x1="2" y1="12" x2="22" y2="12" /><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" />
      </svg>
    ),
  };

  const el = icons[name];
  if (!el) {
    // Default: a simple circle with initial
    return (
      <div className="w-10 h-10 rounded-lg bg-primary/10 text-primary flex items-center justify-center font-bold text-lg">
        {name.charAt(0).toUpperCase()}
      </div>
    );
  }
  return <div className="text-primary">{el}</div>;
}

const CardInner: ComponentConfig<CardProps> = {
  fields: {
    title: { type: "text", contentEditable: true },
    description: { type: "textarea", contentEditable: true },
    icon: {
      type: "select",
      options: [
        { label: "None", value: "" },
        { label: "Zap", value: "zap" },
        { label: "Shield", value: "shield" },
        { label: "Speed", value: "speed" },
        { label: "Star", value: "star" },
        { label: "Heart", value: "heart" },
        { label: "Check", value: "check" },
        { label: "Code", value: "code" },
        { label: "Globe", value: "globe" },
      ],
    },
    imageUrl: { type: "text", label: "Image URL" },
    href: { type: "text", label: "Link URL" },
    mode: {
      type: "radio",
      options: [
        { label: "Card", value: "card" },
        { label: "Flat", value: "flat" },
      ],
    },
  },
  defaultProps: {
    title: "Card Title",
    description: "Card description goes here.",
    icon: "",
    mode: "card",
  },
  render: ({ title, description, icon, imageUrl, href, mode }) => {
    const Wrapper = href ? "a" : "div";
    const wrapperProps = href ? { href } : {};

    const content = (
      <>
        {imageUrl && (
          <img
            src={imageUrl}
            alt={title}
            className="w-full h-48 object-cover rounded-t-lg"
          />
        )}
        <div className="p-5">
          {icon && <div className="mb-3"><CardIcon name={icon} /></div>}
          <h3 className="text-lg font-semibold text-foreground mb-2">{title}</h3>
          <p className="text-sm text-muted-foreground leading-relaxed">{description}</p>
        </div>
      </>
    );

    return (
      <Section padding="0px">
        <Wrapper
          {...wrapperProps}
          className={`
            block overflow-hidden transition-all duration-200
            ${mode === "card"
              ? "bg-card border border-border rounded-xl shadow-sm hover:shadow-md hover:border-primary/20"
              : "bg-transparent"
            }
          `}
        >
          {content}
        </Wrapper>
      </Section>
    );
  },
};

export const Card = withLayout(withStyles(CardInner));
