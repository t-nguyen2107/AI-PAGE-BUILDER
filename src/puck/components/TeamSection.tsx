"use client";

import { useEffect, useRef } from "react";
import type { TeamSectionProps, TeamMember, ComponentMeta } from "../types";
import { extractStyleProps } from "../lib/style-override";
import { getDesignTokens } from "../lib/design-styles";

// ─── Social SVG icons ────────────────────────────────────────────────────────

function TwitterIcon() {
  return (
    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
      <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
    </svg>
  );
}

function LinkedInIcon() {
  return (
    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
      <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 01-2.063-2.065 2.064 2.064 0 112.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
    </svg>
  );
}

function GithubIcon() {
  return (
    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
      <path d="M12 .297c-6.63 0-12 5.373-12 12 0 5.303 3.438 9.8 8.205 11.385.6.113.82-.258.82-.577 0-.285-.01-1.04-.015-2.04-3.338.724-4.042-1.61-4.042-1.61C4.422 18.07 3.633 17.7 3.633 17.7c-1.087-.744.084-.729.084-.729 1.205.084 1.838 1.236 1.838 1.236 1.07 1.835 2.809 1.305 3.495.998.108-.776.417-1.305.76-1.605-2.665-.3-5.466-1.332-5.466-5.93 0-1.31.465-2.38 1.235-3.22-.135-.303-.54-1.523.105-3.176 0 0 1.005-.322 3.3 1.23.96-.267 1.98-.399 3-.405 1.02.006 2.04.138 3 .405 2.28-1.552 3.285-1.23 3.285-1.23.645 1.653.24 2.873.12 3.176.765.84 1.23 1.91 1.23 3.22 0 4.61-2.805 5.625-5.475 5.92.42.36.81 1.096.81 2.22 0 1.606-.015 2.896-.015 3.286 0 .315.21.69.825.57C20.565 22.092 24 17.592 24 12.297c0-6.627-5.373-12-12-12" />
    </svg>
  );
}

// ─── Social links row ────────────────────────────────────────────────────────

function SocialLinks({ member, transitionDuration }: { member: TeamMember; transitionDuration: string }) {
  const hasLinks = member.socialTwitter || member.socialLinkedin || member.socialGithub;
  if (!hasLinks) return null;

  return (
    <div className="flex gap-3 mt-3">
      {member.socialTwitter && (
        <a
          href={member.socialTwitter}
          target="_blank"
          rel="noopener noreferrer"
          className={`rounded-full p-1.5 text-muted-foreground hover:bg-primary/10 hover:text-primary transition-all ${transitionDuration}`}
        >
          <TwitterIcon />
        </a>
      )}
      {member.socialLinkedin && (
        <a
          href={member.socialLinkedin}
          target="_blank"
          rel="noopener noreferrer"
          className={`rounded-full p-1.5 text-muted-foreground hover:bg-primary/10 hover:text-primary transition-all ${transitionDuration}`}
        >
          <LinkedInIcon />
        </a>
      )}
      {member.socialGithub && (
        <a
          href={member.socialGithub}
          target="_blank"
          rel="noopener noreferrer"
          className={`rounded-full p-1.5 text-muted-foreground hover:bg-primary/10 hover:text-primary transition-all ${transitionDuration}`}
        >
          <GithubIcon />
        </a>
      )}
    </div>
  );
}

// ─── Avatar helper ───────────────────────────────────────────────────────────

function Avatar({ member, avatarClass }: { member: TeamMember; avatarClass: string }) {
  if (member.avatarUrl) {
    return (
      <img
        src={member.avatarUrl}
        alt={member.name}
        className={`w-24 h-24 object-cover mx-auto mb-4 ${avatarClass}`}
      />
    );
  }
  return (
    <div className={`w-24 h-24 bg-muted flex items-center justify-center mx-auto mb-4 text-xl font-semibold ${avatarClass}`}>
      {member.name
        .split(" ")
        .map((n) => n[0])
        .join("")
        .toUpperCase()}
    </div>
  );
}

// ─── Main component ─────────────────────────────────────────────────────────

export function TeamSection(props: TeamSectionProps & ComponentMeta) {
  const {
    heading,
    subtext,
    members = [],
    hoverEffect,
    socialLinks: showSocial,
    animation = "stagger-fade",
    designStyle,
    className,
    ...metaRest
  } = props;

  const ds = getDesignTokens(designStyle);

  const sectionRef = useRef<HTMLElement>(null);

  // Scroll entrance animation via IntersectionObserver
  useEffect(() => {
    if (animation === "none" || !animation || !sectionRef.current) return;

    const el = sectionRef.current;
    const cards = el.querySelectorAll<HTMLElement>("[data-team-card]");
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const idx = Number(entry.target.getAttribute("data-team-card") ?? 0);
            const delay = animation === "stagger-fade" ? idx * 120 : 0;
            setTimeout(() => {
              entry.target.classList.add("animate-in");
            }, delay);
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.15 },
    );

    cards.forEach((card) => {
      card.classList.add("animate-pending");
      observer.observe(card);
    });

    return () => observer.disconnect();
  }, [animation]);

  const isFlip = hoverEffect === "flip";
  const isLift = hoverEffect === "lift";

  return (
    <>
      <style>{`
        .animate-pending { opacity: 0; transform: translateY(24px); }
        .animate-in { opacity: 1; transform: translateY(0); transition: opacity 0.6s ease, transform 0.6s ease; }
      `}</style>
      <section
        ref={sectionRef}
        className={`w-full ${ds.section.base} text-foreground ${className ?? ""}`}
        style={extractStyleProps(metaRest)}
      >
        {ds.section.decorative && (
          <div className="absolute inset-0 overflow-hidden pointer-events-none" aria-hidden="true">
            <div className={ds.section.decorative} />
          </div>
        )}
        <div className={`${ds.containerWidth} mx-auto relative`}>
          <div className="text-center mb-12">
            <h2 className={`${ds.typography.h2} mb-4`}>{heading}</h2>
            {subtext && (
              <p className={`text-lg ${ds.typography.body} max-w-2xl mx-auto`}>
                {subtext}
              </p>
            )}
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {members.map((member, i) => {
              if (isFlip) {
                return (
                  <div key={i} data-team-card={i} className="perspective-[1000px] group" tabIndex={0} aria-label={`${member.name}, ${member.role}`}>
                    <div className="relative w-full transition-transform duration-500 transform-3d group-hover:transform-[rotateY(180deg)] group-focus-within:transform-[rotateY(180deg)]">
                      {/* Front */}
                      <div className="backface-hidden text-center">
                        <Avatar member={member} avatarClass={ds.accent.avatar} />
                        <p className="font-semibold">{member.name}</p>
                        <p className="text-muted-foreground text-sm">{member.role}</p>
                      </div>
                      {/* Back */}
                      <div className="absolute inset-0 backface-hidden transform-[rotateY(180deg)] bg-primary text-primary-foreground rounded-xl p-6 flex flex-col items-center justify-center">
                        <h4 className="font-bold text-lg">{member.name}</h4>
                        <p className="text-sm opacity-80 mb-4">{member.role}</p>
                        {showSocial && (
                          <div className="flex gap-3">
                            {member.socialTwitter && (
                              <a href={member.socialTwitter} target="_blank" rel="noopener noreferrer" className="hover:opacity-80">
                                <TwitterIcon />
                              </a>
                            )}
                            {member.socialLinkedin && (
                              <a href={member.socialLinkedin} target="_blank" rel="noopener noreferrer" className="hover:opacity-80">
                                <LinkedInIcon />
                              </a>
                            )}
                            {member.socialGithub && (
                              <a href={member.socialGithub} target="_blank" rel="noopener noreferrer" className="hover:opacity-80">
                                <GithubIcon />
                              </a>
                            )}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                );
              }

              // Normal card (with optional "lift" hover)
              return (
                <div
                  key={i}
                  data-team-card={i}
                  className={`text-center ${ds.card.base} transition-all ${ds.transitionDuration} p-6 ${
                    isLift
                      ? "hover:-translate-y-1.5 hover:shadow-xl hover:shadow-primary/5"
                      : "hover:-translate-y-1 hover:shadow-lg hover:shadow-primary/5"
                  }`}
                >
                  <Avatar member={member} avatarClass={ds.accent.avatar} />
                  <p className="font-semibold">{member.name}</p>
                  <p className="text-primary text-sm">{member.role}</p>
                  {showSocial && <SocialLinks member={member} transitionDuration={ds.transitionDuration} />}
                </div>
              );
            })}
          </div>
        </div>
      </section>
    </>
  );
}
