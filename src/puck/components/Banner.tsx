"use client";

import { useState, useEffect } from "react";
import type { BannerProps, ComponentMeta } from "../types";
import { extractStyleProps } from "../lib/style-override";
import { getDesignTokens } from "../lib/design-styles";

function calcCountdown(dateStr: string) {
  const target = new Date(dateStr);
  if (isNaN(target.getTime())) return { days: 0, hours: 0, minutes: 0, seconds: 0, ended: true };
  const diff = Math.max(0, target.getTime() - Date.now());
  return {
    days: Math.floor(diff / 86400000),
    hours: Math.floor((diff % 86400000) / 3600000),
    minutes: Math.floor((diff % 3600000) / 60000),
    seconds: Math.floor((diff % 60000) / 1000),
    ended: diff <= 0,
  };
}

function CountdownDisplay({ date }: { date: string }) {
  const [time, setTime] = useState(() => calcCountdown(date));

  useEffect(() => {
    const id = setInterval(() => setTime(calcCountdown(date)), 1000);
    return () => clearInterval(id);
  }, [date]);

  if (time.ended) return <span className="text-sm font-medium">Ended</span>;

  const pad = (n: number) => String(n).padStart(2, "0");

  return (
    <div className="flex items-center gap-3 justify-center">
      <div className="text-center">
        <span className="text-2xl font-bold tabular-nums">{pad(time.days)}</span>
        <span className="text-xs opacity-70 block">d</span>
      </div>
      <span className="text-xl font-bold opacity-50">:</span>
      <div className="text-center">
        <span className="text-2xl font-bold tabular-nums">{pad(time.hours)}</span>
        <span className="text-xs opacity-70 block">h</span>
      </div>
      <span className="text-xl font-bold opacity-50">:</span>
      <div className="text-center">
        <span className="text-2xl font-bold tabular-nums">{pad(time.minutes)}</span>
        <span className="text-xs opacity-70 block">m</span>
      </div>
      <span className="text-xl font-bold opacity-50">:</span>
      <div className="text-center">
        <span className="text-2xl font-bold tabular-nums">{pad(time.seconds)}</span>
        <span className="text-xs opacity-70 block">s</span>
      </div>
    </div>
  );
}

export function Banner(props: BannerProps & ComponentMeta) {
  const {
    heading,
    subtext,
    ctaText,
    ctaHref,
    variant = "gradient",
    backgroundUrl,
    align = "center",
    videoUrl,
    countdown = false,
    countdownDate,
    animatedGradient = false,
    animation = "fade-up",
    designStyle,
    className,
    ...metaRest
  } = props;

  const ds = getDesignTokens(designStyle);
  const isCenter = align === "center";

  // Build animation keyframes style tag
  const hasAnimationKeyframes =
    animatedGradient || animation === "fade-up" || animation === "zoom";

  // Animation class for scroll entrance
  const animClass =
    animation === "fade-up"
      ? "animate-[fadeUp_0.6s_ease-out_both]"
      : animation === "zoom"
        ? "animate-[zoomIn_0.6s_ease-out_both]"
        : "";

  // Variant classes
  const variantClasses: Record<string, string> = {
    gradient: "bg-gradient-to-r from-primary to-primary/80 text-primary-foreground",
    solid: "bg-primary text-primary-foreground",
    image: "text-white",
    video: "text-white relative overflow-hidden",
  };

  // Build section style
  const sectionStyle: React.CSSProperties = {};

  if (variant === "image" && backgroundUrl) {
    sectionStyle.backgroundImage = `linear-gradient(rgba(0,0,0,0.5), rgba(0,0,0,0.5)), url(${backgroundUrl})`;
    sectionStyle.backgroundSize = "cover";
    sectionStyle.backgroundPosition = "center";
  }

  if (animatedGradient) {
    sectionStyle.background = "linear-gradient(-45deg, var(--primary, #22746e), var(--primary-light, #2d918a), var(--primary, #22746e))";
    sectionStyle.backgroundSize = "400% 400%";
    sectionStyle.animation = "gradientShift 8s ease infinite";
  }

  // Merge style overrides
  const mergedStyle: React.CSSProperties = {
    ...sectionStyle,
    ...extractStyleProps(metaRest),
  };

  return (
    <>
      {hasAnimationKeyframes && (
        <style>{`
          ${animatedGradient ? `
            @keyframes gradientShift {
              0% { background-position: 0% 50%; }
              50% { background-position: 100% 50%; }
              100% { background-position: 0% 50%; }
            }
          ` : ""}
          ${animation === "fade-up" ? `
            @keyframes fadeUp {
              from { opacity: 0; transform: translateY(30px); }
              to { opacity: 1; transform: translateY(0); }
            }
          ` : ""}
          ${animation === "zoom" ? `
            @keyframes zoomIn {
              from { opacity: 0; transform: scale(0.95); }
              to { opacity: 1; transform: scale(1); }
            }
          ` : ""}
        `}</style>
      )}
      <section
        className={`w-full ${ds.section.base} ${variantClasses[variant] || variantClasses.gradient} ${animClass} ${className ?? ""}`}
        style={mergedStyle}
      >
        {ds.section.decorative && variant !== "image" && variant !== "video" && (
          <div className="absolute inset-0 overflow-hidden pointer-events-none" aria-hidden="true">
            <div className={ds.section.decorative} />
          </div>
        )}

        {/* Video background */}
        {variant === "video" && videoUrl && (
          <div className="absolute inset-0 overflow-hidden">
            <video autoPlay muted loop playsInline className="w-full h-full object-cover">
              <source src={videoUrl} type="video/mp4" />
            </video>
            <div className="absolute inset-0 bg-black/40" />
          </div>
        )}

        {/* Content */}
        <div className={`${ds.containerWidth === "max-w-7xl" || ds.containerWidth === "max-w-6xl" ? "max-w-3xl" : ds.containerWidth} mx-auto relative z-10 ${isCenter ? "text-center" : "text-left"}`}>
          <h2 className={`${ds.typography.h2} mb-3`}>{heading}</h2>
          {subtext && (
            <p className={`text-base md:text-lg opacity-80 mb-4 max-w-xl mx-auto ${ds.typography.body}`}>
              {subtext}
            </p>
          )}

          {countdown && countdownDate && (
            <CountdownDisplay date={countdownDate} />
          )}

          <div className={`flex ${isCenter ? "justify-center" : "justify-start"} mt-6`}>
            <a
              href={ctaHref}
              className={`inline-block ${ds.button.primary} bg-white/90 text-gray-900 hover:bg-white`}
            >
              {ctaText}
            </a>
          </div>
        </div>
      </section>
    </>
  );
}
