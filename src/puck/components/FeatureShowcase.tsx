"use client";

import { useState } from "react";
import type { FeatureShowcaseProps, ComponentMeta } from "../types";
import { extractStyleProps } from "../lib/style-override";
import { getDesignTokens } from "../lib/design-styles";
import { useScrollAnimation } from "../hooks/useScrollAnimation";

const ICON_MAP: Record<string, string> = {
  zap: "M13 2L3 14h9l-1 10 10-12h-9l1-10z",
  speed: "M13 2L3 14h9l-1 10 10-12h-9l1-10z",
  shield: "M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z",
  star: "M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z",
  check: "M22 11.08V12a10 10 0 1 1-5.93-9.14",
  globe: "M12 2a10 10 0 1 0 0 20 10 10 0 0 0 0-20z M2 12h20 M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z",
  heart: "M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z",
  settings: "M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 1 1.72v.51a2 2 0 0 1-1 1.74l-.15.09a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.39a2 2 0 0 0-.73-2.73l-.15-.08a2 2 0 0 1-1-1.74v-.5a2 2 0 0 1 1-1.74l.15-.09a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z",
};

function FeatureIcon({ icon }: { icon?: string }) {
  if (!icon) return null;
  const path = ICON_MAP[icon] ?? ICON_MAP.zap;
  return (
    <div className="flex items-center justify-center w-12 h-12 rounded-xl bg-primary/10 text-primary shrink-0">
      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d={path} />
      </svg>
    </div>
  );
}

export function FeatureShowcase(props: FeatureShowcaseProps & ComponentMeta) {
  const {
    heading,
    subtext,
    imageUrl,
    videoUrl,
    features = [],
    imagePosition = "right",
    ctaText,
    ctaHref,
    animation = "fade-up",
    tabbed = false,
    designStyle,
    className,
    ...metaRest
  } = props;
  const ds = getDesignTokens(designStyle);
  const { ref: animRef, className: animClass } = useScrollAnimation(animation);
  const [activeTab, setActiveTab] = useState(0);
  const imageFirst = imagePosition === "left";

  return (
    <section
      className={`w-full ${ds.section.base} text-foreground relative overflow-hidden ${className ?? ""}`}
      style={extractStyleProps(metaRest)}
    >
      {ds.section.decorative && (
        <div className="absolute inset-0 overflow-hidden pointer-events-none" aria-hidden="true">
          <div className={ds.section.decorative} />
        </div>
      )}
      <div
        ref={animRef}
        className={`${ds.containerWidth} mx-auto flex flex-col md:flex-row items-center gap-12 transition-all duration-700 ease-out relative ${animClass}`}
      >
        {/* Media side */}
        <div
          className={`w-full md:w-1/2 ${
            imageFirst ? "md:order-1" : "md:order-2"
          }`}
        >
          {videoUrl ? (
            <video
              src={videoUrl}
              autoPlay
              loop
              muted
              playsInline
              className={`w-full ${ds.card.base} object-cover`}
            />
          ) : (
            <img
              src={imageUrl}
              alt={heading}
              className={`w-full ${ds.card.base} object-cover`}
            />
          )}
        </div>

        {/* Text side */}
        <div
          className={`w-full md:w-1/2 ${
            imageFirst ? "md:order-2" : "md:order-1"
          }`}
        >
          <h2 className={`${ds.typography.h2} mb-4`}>{heading}</h2>
          {subtext && (
            <p className={`text-lg leading-relaxed mb-8 ${ds.typography.body}`}>{subtext}</p>
          )}

          {tabbed && features.length > 0 ? (
            <div className="mb-8">
              <div className="flex flex-wrap gap-2 mb-6">
                {features.map((f, i) => (
                  <button
                    key={i}
                    onClick={() => setActiveTab(i)}
                    className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition focus-visible:ring-2 focus-visible:ring-primary focus-visible:outline-none ${
                      i === activeTab
                        ? "bg-primary text-primary-foreground"
                        : "bg-muted text-muted-foreground hover:bg-accent"
                    }`}
                  >
                    <FeatureIcon icon={f.icon} />
                    {f.title}
                  </button>
                ))}
              </div>
              {features[activeTab] && (
                <div>
                  <h3 className={`${ds.typography.h3} mb-2`}>
                    {features[activeTab].title}
                  </h3>
                  <p className={`text-sm leading-relaxed ${ds.typography.body}`}>
                    {features[activeTab].description}
                  </p>
                </div>
              )}
            </div>
          ) : (
            <div className="space-y-6 mb-8">
              {features.map((feature, i) => (
                <div key={i} className={`flex items-start gap-4 ${ds.card.base} p-4 ${ds.card.hover}`}>
                  <FeatureIcon icon={feature.icon} />
                  <div>
                    <h3 className={`${ds.typography.h3} mb-1`}>{feature.title}</h3>
                    <p className={`leading-relaxed text-sm ${ds.typography.body}`}>
                      {feature.description}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}

          {ctaText && ctaHref && (
            <a
              href={ctaHref}
              className={`inline-block ${ds.button.primary} bg-primary text-primary-foreground`}
            >
              {ctaText}
            </a>
          )}
        </div>
      </div>
    </section>
  );
}
