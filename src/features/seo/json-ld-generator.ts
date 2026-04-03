/**
 * JSON-LD Generator — generates Schema.org structured data from Puck page data.
 *
 * Maps Puck component types to Schema.org types and extracts
 * relevant data from component props.
 */

import type { Data, ComponentData } from '@puckeditor/core';

// ─── Public result type ──────────────────────────────────────────────

export interface JsonLdResult {
  type: string;
  data: Record<string, unknown>;
}

// ─── Helpers ─────────────────────────────────────────────────────────

function getProps(component: ComponentData): Record<string, unknown> {
  return (component.props ?? {}) as Record<string, unknown>;
}

function getId(component: ComponentData): string {
  return String(getProps(component).id ?? component.type);
}

// ─── Category-specific Schema.org builders ───────────────────────────

function buildHeroLd(component: ComponentData): JsonLdResult {
  const props = getProps(component);
  const data: Record<string, unknown> = { '@type': 'WebPage' };
  if (props.heading) data.name = props.heading;
  if (props.subtext) data.description = props.subtext;
  if (props.backgroundUrl) data.image = { '@type': 'ImageObject', url: props.backgroundUrl };
  return { type: 'WebPage', data };
}

function buildFeaturesLd(component: ComponentData): JsonLdResult {
  const props = getProps(component);
  const features = (props.features as Record<string, unknown>[]) ?? [];
  const items = features.slice(0, 50).map((f, i) => ({
    '@type': 'ListItem',
    position: i + 1,
    name: f.title ?? '',
  }));
  const data: Record<string, unknown> = { '@type': 'ItemList' };
  if (props.heading) data.name = props.heading;
  if (items.length > 0) data.itemListElement = items;
  return { type: 'ItemList', data };
}

function buildPricingLd(component: ComponentData): JsonLdResult {
  const props = getProps(component);
  const plans = (props.plans as Record<string, unknown>[]) ?? [];
  const offers = plans.map((p) => ({ '@type': 'Offer', name: p.name ?? '', price: p.price ?? '' }));
  const data: Record<string, unknown> = { '@type': 'OfferCatalog' };
  if (props.heading) data.name = props.heading;
  if (offers.length > 0) data.offers = offers;
  return { type: 'OfferCatalog', data };
}

function buildTestimonialLd(component: ComponentData): JsonLdResult {
  const testimonials = (getProps(component).testimonials as Record<string, unknown>[]) ?? [];
  const reviews = testimonials.map((t) => ({
    '@type': 'Review',
    reviewBody: t.quote ?? '',
    author: { '@type': 'Person', name: t.author ?? '' },
  }));
  const data: Record<string, unknown> = { '@type': 'AggregateRating' };
  if (reviews.length > 0) {
    data.reviewCount = reviews.length;
    data.reviews = reviews;
  }
  return { type: 'AggregateRating', data };
}

function buildCtaLd(component: ComponentData): JsonLdResult {
  const props = getProps(component);
  const data: Record<string, unknown> = { '@type': 'WebPage' };
  if (props.heading) data.name = props.heading;
  if (props.subtext) data.description = props.subtext;
  return { type: 'WebPage', data };
}

function buildFaqLd(component: ComponentData): JsonLdResult {
  const items = (getProps(component).items as Record<string, unknown>[]) ?? [];
  const questions = items.map((item) => ({
    '@type': 'Question',
    name: item.question ?? '',
    acceptedAnswer: { '@type': 'Answer', text: item.answer ?? '' },
  }));
  const data: Record<string, unknown> = { '@type': 'FAQPage' };
  if (questions.length > 0) data.mainEntity = questions;
  return { type: 'FAQPage', data };
}

function buildStatsLd(component: ComponentData): JsonLdResult {
  const props = getProps(component);
  const data: Record<string, unknown> = { '@type': 'Dataset' };
  if (props.heading) data.name = props.heading;
  return { type: 'Dataset', data };
}

function buildTeamLd(component: ComponentData): JsonLdResult {
  const members = (getProps(component).members as Record<string, unknown>[]) ?? [];
  const people = members.map((m) => {
    const person: Record<string, unknown> = { '@type': 'Person', name: m.name ?? '' };
    if (m.role) person.jobTitle = m.role;
    if (m.avatarUrl) person.image = m.avatarUrl;
    return person;
  });
  const data: Record<string, unknown> = { '@type': 'ItemList' };
  if (getProps(component).heading) data.name = getProps(component).heading;
  if (people.length > 0) data.itemListElement = people;
  return { type: 'ItemList', data };
}

function buildBlogLd(component: ComponentData): JsonLdResult {
  const posts = (getProps(component).posts as Record<string, unknown>[]) ?? [];
  const articles = posts.map((p) => {
    const article: Record<string, unknown> = { '@type': 'BlogPosting', headline: p.title ?? '' };
    if (p.excerpt) article.description = p.excerpt;
    if (p.imageUrl) article.image = { '@type': 'ImageObject', url: p.imageUrl };
    if (p.date) article.datePublished = p.date;
    return article;
  });
  const data: Record<string, unknown> = { '@type': 'CollectionPage' };
  if (getProps(component).heading) data.name = getProps(component).heading;
  if (articles.length > 0) data.hasPart = articles;
  return { type: 'CollectionPage', data };
}

function buildLogoGridLd(component: ComponentData): JsonLdResult {
  const logos = (getProps(component).logos as Record<string, unknown>[]) ?? [];
  const data: Record<string, unknown> = { '@type': 'Organization' };
  if (logos.length > 0) data.logo = logos[0].imageUrl;
  return { type: 'Organization', data };
}

function buildContactLd(component: ComponentData): JsonLdResult {
  const props = getProps(component);
  const data: Record<string, unknown> = { '@type': 'ContactPage' };
  if (props.heading) data.name = props.heading;
  if (props.subtext) data.description = props.subtext;
  return { type: 'ContactPage', data };
}

function buildHeaderNavLd(component: ComponentData): JsonLdResult {
  const data: Record<string, unknown> = { '@type': 'WPHeader' };
  const props = getProps(component);
  if (props.logo) data.name = props.logo;
  return { type: 'WPHeader', data };
}

function buildFooterLd(component: ComponentData): JsonLdResult {
  const data: Record<string, unknown> = { '@type': 'WPFooter' };
  const props = getProps(component);
  if (props.copyright) data.copyrightNotice = props.copyright;
  return { type: 'WPFooter', data };
}

function buildGalleryLd(component: ComponentData): JsonLdResult {
  const images = (getProps(component).images as Record<string, unknown>[]) ?? [];
  const imageObjects = images.map((img) => ({ '@type': 'ImageObject', url: img.src ?? '' }));
  const data: Record<string, unknown> = { '@type': 'ImageGallery' };
  if (imageObjects.length > 0) data.image = imageObjects;
  return { type: 'ImageGallery', data };
}

function buildProductCardsLd(component: ComponentData): JsonLdResult {
  const products = (getProps(component).products as Record<string, unknown>[]) ?? [];
  const items = products.map((p) => {
    const product: Record<string, unknown> = { '@type': 'Product', name: p.name ?? '' };
    if (p.price) product.offers = { '@type': 'Offer', price: p.price };
    if (p.imageUrl) product.image = p.imageUrl;
    if (p.description) product.description = p.description;
    return product;
  });
  const data: Record<string, unknown> = { '@type': 'ItemList' };
  if (items.length > 0) data.itemListElement = items;
  return { type: 'ItemList', data };
}

// ─── Builder dispatch map ────────────────────────────────────────────

type ComponentBuilder = (component: ComponentData) => JsonLdResult;

const BUILDERS: Record<string, ComponentBuilder> = {
  HeroSection: buildHeroLd,
  Banner: buildCtaLd,
  FeaturesGrid: buildFeaturesLd,
  PricingTable: buildPricingLd,
  TestimonialSection: buildTestimonialLd,
  CTASection: buildCtaLd,
  FAQSection: buildFaqLd,
  StatsSection: buildStatsLd,
  TeamSection: buildTeamLd,
  BlogSection: buildBlogLd,
  LogoGrid: buildLogoGridLd,
  ContactForm: buildContactLd,
  HeaderNav: buildHeaderNavLd,
  FooterSection: buildFooterLd,
  Gallery: buildGalleryLd,
  ProductCards: buildProductCardsLd,
  NewsletterSignup: buildCtaLd,
  FeatureShowcase: buildFeaturesLd,
  ComparisonTable: buildPricingLd,
  SocialProof: buildTestimonialLd,
};

// ─── Public API ─────────────────────────────────────────────────────

/**
 * Generate Schema.org JSON-LD structured data from Puck page data.
 *
 * Walks the content array, finds components with matching builders,
 * and generates Schema.org JSON-LD objects from their props.
 */
export function generateJsonLd(data: Data): JsonLdResult[] {
  const results: JsonLdResult[] = [];

  for (const component of data.content) {
    const builder = BUILDERS[component.type];
    if (builder) {
      results.push(builder(component));
    }
  }

  return results;
}
