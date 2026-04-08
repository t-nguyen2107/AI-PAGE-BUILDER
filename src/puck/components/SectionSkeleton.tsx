"use client";

import React from "react";
import type { SectionSkeletonProps } from "../types";
import { Skeleton } from "@/components/ui/skeleton";

// ─── Skeleton shapes per section type ────────────────────────────────────

function HeroSkeleton() {
  return (
    <div className="w-full py-20 px-6">
      <div className="max-w-4xl mx-auto space-y-6">
        <Skeleton className="h-5 w-32 rounded-full" />
        <Skeleton className="h-14 w-3/4 rounded-lg" />
        <Skeleton className="h-6 w-full rounded" />
        <Skeleton className="h-6 w-2/3 rounded" />
        <div className="flex gap-4 pt-4">
          <Skeleton className="h-12 w-40 rounded-lg" />
          <Skeleton className="h-12 w-40 rounded-lg" />
        </div>
      </div>
    </div>
  );
}

function GridSkeleton({ columns = 3 }: { columns?: number }) {
  return (
    <div className="w-full py-16 px-6">
      <div className="max-w-6xl mx-auto space-y-8">
        <div className="text-center space-y-3">
          <Skeleton className="h-10 w-1/2 mx-auto rounded-lg" />
          <Skeleton className="h-5 w-2/3 mx-auto rounded" />
        </div>
        <div className="grid gap-6" style={{ gridTemplateColumns: `repeat(${columns}, 1fr)` }}>
          {Array.from({ length: columns }).map((_, i) => (
            <div key={i} className="space-y-4 rounded-xl border border-border/50 p-6">
              <Skeleton className="h-10 w-10 rounded-full" />
              <Skeleton className="h-5 w-3/4 rounded" />
              <Skeleton className="h-4 w-full rounded" />
              <Skeleton className="h-4 w-2/3 rounded" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function NavSkeleton() {
  return (
    <div className="w-full px-6 py-4 border-b border-border/30">
      <div className="max-w-6xl mx-auto flex items-center justify-between">
        <Skeleton className="h-8 w-36 rounded-lg" />
        <div className="flex gap-6">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-4 w-16 rounded" />
          ))}
        </div>
        <Skeleton className="h-10 w-28 rounded-lg" />
      </div>
    </div>
  );
}

function FooterSkeleton() {
  return (
    <div className="w-full py-12 px-6">
      <div className="max-w-6xl mx-auto space-y-8">
        <div className="grid grid-cols-4 gap-8">
          <div className="space-y-4">
            <Skeleton className="h-6 w-32 rounded-lg" />
            <Skeleton className="h-4 w-full rounded" />
            <Skeleton className="h-4 w-3/4 rounded" />
          </div>
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="space-y-3">
              <Skeleton className="h-5 w-20 rounded" />
              {Array.from({ length: 3 }).map((_, j) => (
                <Skeleton key={j} className="h-4 w-24 rounded" />
              ))}
            </div>
          ))}
        </div>
        <Skeleton className="h-px w-full" />
        <Skeleton className="h-4 w-48 mx-auto rounded" />
      </div>
    </div>
  );
}

function CTASkeleton() {
  return (
    <div className="w-full py-16 px-6">
      <div className="max-w-3xl mx-auto text-center space-y-6">
        <Skeleton className="h-10 w-3/4 mx-auto rounded-lg" />
        <Skeleton className="h-5 w-2/3 mx-auto rounded" />
        <Skeleton className="h-12 w-40 mx-auto rounded-lg" />
      </div>
    </div>
  );
}

function TestimonialSkeleton() {
  return (
    <div className="w-full py-16 px-6">
      <div className="max-w-6xl mx-auto space-y-8">
        <Skeleton className="h-10 w-1/2 mx-auto rounded-lg" />
        <div className="grid grid-cols-3 gap-6">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="space-y-4 rounded-xl border border-border/50 p-6">
              <Skeleton className="h-4 w-full rounded" />
              <Skeleton className="h-4 w-full rounded" />
              <Skeleton className="h-4 w-2/3 rounded" />
              <div className="flex items-center gap-3 pt-2">
                <Skeleton className="h-10 w-10 rounded-full" />
                <div className="space-y-2">
                  <Skeleton className="h-4 w-24 rounded" />
                  <Skeleton className="h-3 w-20 rounded" />
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function GenericSkeleton({ label }: { label: string }) {
  return (
    <div className="w-full py-16 px-6">
      <div className="max-w-4xl mx-auto space-y-6">
        <div className="text-center space-y-2">
          <Skeleton className="h-6 w-24 mx-auto rounded-full bg-primary/10" />
          <p className="text-sm text-muted-foreground">{label}</p>
        </div>
        <Skeleton className="h-10 w-1/2 mx-auto rounded-lg" />
        <Skeleton className="h-5 w-2/3 mx-auto rounded" />
        <div className="grid grid-cols-2 gap-6 pt-4">
          <Skeleton className="h-32 rounded-xl" />
          <Skeleton className="h-32 rounded-xl" />
        </div>
      </div>
    </div>
  );
}

// ─── Skeleton type map ───────────────────────────────────────────────────

const SKELETON_MAP: Record<string, React.FC> = {
  AnnouncementBar: () => (
    <div className="w-full py-3 px-6">
      <Skeleton className="h-5 w-3/4 mx-auto rounded" />
    </div>
  ),
  HeaderNav: NavSkeleton,
  HeroSection: HeroSkeleton,
  FeaturesGrid: GridSkeleton,
  PricingTable: () => <GridSkeleton columns={3} />,
  TestimonialSection: TestimonialSkeleton,
  CTASection: CTASkeleton,
  FAQSection: () => <GridSkeleton columns={2} />,
  StatsSection: () => <GridSkeleton columns={4} />,
  TeamSection: () => <GridSkeleton columns={4} />,
  BlogSection: () => <GridSkeleton columns={3} />,
  LogoGrid: () => <GridSkeleton columns={5} />,
  ContactForm: CTASkeleton,
  FooterSection: FooterSkeleton,
  NewsletterSignup: CTASkeleton,
  Gallery: () => <GridSkeleton columns={3} />,
  SocialProof: () => <GridSkeleton columns={3} />,
  ComparisonTable: () => <GridSkeleton columns={2} />,
  ProductCards: () => <GridSkeleton columns={3} />,
  FeatureShowcase: () => <GridSkeleton columns={1} />,
  CountdownTimer: CTASkeleton,
  Banner: CTASkeleton,
};

// ─── Main component ──────────────────────────────────────────────────────

export function SectionSkeleton({ sectionType }: SectionSkeletonProps) {
  const SkeletonComponent = SKELETON_MAP[sectionType];
  return (
    <div
      className="relative overflow-hidden border border-dashed border-primary/20 rounded-lg bg-background/50 animate-pulse"
      data-skeleton-for={sectionType}
    >
      {SkeletonComponent
        ? <SkeletonComponent />
        : <GenericSkeleton label={sectionType} />}
    </div>
  );
}
