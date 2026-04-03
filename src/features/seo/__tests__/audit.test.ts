import { describe, it, expect } from 'vitest';
import type { Data } from '@puckeditor/core';
import { auditSEO } from '../seo-audit';

// ---- Helpers ----

function makeData(overrides?: Partial<Data>): Data {
  return {
    root: { props: { title: 'Test Page' } },
    content: [],
    ...overrides,
  };
}

function makeWellStructuredData(): Data {
  return makeData({
    content: [
      {
        type: 'HeaderNav',
        props: {
          id: 'header-1',
          logo: 'MySite',
          links: [
            { label: 'Home', href: '/' },
            { label: 'About', href: '/about' },
          ],
        },
      },
      {
        type: 'HeroSection',
        props: {
          id: 'hero-1',
          heading: 'Welcome to My Site',
          subtext: 'This is a test page description that is long enough to meet the meta requirements for SEO auditing purposes.',
          ctaText: 'Get Started',
          ctaHref: '/start',
          align: 'center',
          backgroundOverlay: false,
          padding: 'py-20',
        },
      },
      {
        type: 'FeaturesGrid',
        props: {
          id: 'features-1',
          heading: 'Our Features',
          subtext: 'Discover what we offer',
          columns: 3,
          features: [
            { title: 'Fast', description: 'Blazing fast performance' },
            { title: 'Secure', description: 'Enterprise-grade security' },
            { title: 'Scalable', description: 'Grows with your needs' },
          ],
        },
      },
      {
        type: 'ImageBlock',
        props: {
          id: 'img-1',
          src: '/photo.jpg',
          alt: 'A beautiful photo',
        },
      },
      {
        type: 'FooterSection',
        props: {
          id: 'footer-1',
          copyright: '2026 MySite',
          linkGroups: [
            {
              title: 'Links',
              links: [
                { label: 'Privacy', href: '/privacy' },
                { label: 'Terms', href: '/terms' },
              ],
            },
          ],
        },
      },
    ],
  });
}

// ---- Tests ----

describe('auditSEO', () => {
  it('returns a high score for a well-structured page', () => {
    const data = makeWellStructuredData();
    const result = auditSEO(data);

    expect(result.score).toBeGreaterThanOrEqual(80);
    expect(result.passed).toBe(true);
  });

  it('reports issues when heading levels are skipped', () => {
    const data = makeData({
      content: [
        {
          type: 'HeroSection',
          props: { id: 'hero-1', heading: 'Title', subtext: '', ctaText: '', ctaHref: '', align: 'left', backgroundOverlay: false, padding: 'py-20' },
        },
        {
          type: 'FAQSection',
          props: {
            id: 'faq-1',
            heading: '',
            subtext: '',
            items: [
              { question: 'Q1?', answer: 'A1' },
              { question: 'Q2?', answer: 'A2' },
            ],
          },
        },
      ],
    });

    const result = auditSEO(data);
    const headingIssues = result.issues.filter((i) => i.category === 'heading');
    // FAQ items are h3 level, hero is h1 — skip from h1 to h3
    const skipIssue = headingIssues.find((i) => i.message.includes('skipped') || i.message.includes('Skip'));
    expect(skipIssue).toBeDefined();
  });

  it('reports issues for images missing alt text', () => {
    const data = makeData({
      content: [
        {
          type: 'HeroSection',
          props: { id: 'hero-1', heading: 'Title', subtext: '', ctaText: '', ctaHref: '', align: 'left', backgroundOverlay: false, padding: 'py-20' },
        },
        {
          type: 'ImageBlock',
          props: { id: 'img-1', src: '/photo.jpg', alt: '' },
        },
      ],
    });

    const result = auditSEO(data);
    const altIssue = result.issues.find((i) => i.message.includes('alt text'));
    expect(altIssue).toBeDefined();
    expect(altIssue?.severity).toBe('error');
    expect(altIssue?.category).toBe('accessibility');
  });

  it('deducts score for each issue found', () => {
    const goodData = makeWellStructuredData();
    const goodResult = auditSEO(goodData);

    const badData = makeData({
      content: [
        {
          type: 'ImageBlock',
          props: { id: 'img-1', src: '/photo.jpg', alt: '' },
        },
      ],
    });
    const badResult = auditSEO(badData);

    expect(badResult.score).toBeLessThan(goodResult.score);
  });

  it('returns a score between 0 and 100', () => {
    const data = makeWellStructuredData();
    const result = auditSEO(data);

    expect(result.score).toBeGreaterThanOrEqual(0);
    expect(result.score).toBeLessThanOrEqual(100);
  });

  it('sets passed to true when score >= 70', () => {
    const data = makeWellStructuredData();
    const result = auditSEO(data);

    if (result.score >= 70) {
      expect(result.passed).toBe(true);
    } else {
      expect(result.passed).toBe(false);
    }
  });

  it('reports issues for empty page', () => {
    const data = makeData({ content: [] });
    const result = auditSEO(data);

    const emptyIssue = result.issues.find((i) => i.message.includes('no content'));
    expect(emptyIssue).toBeDefined();
  });

  it('reports issues for missing title in page meta', () => {
    const data = makeData({
      content: [
        {
          type: 'HeroSection',
          props: { id: 'hero-1', heading: '', subtext: '', ctaText: '', ctaHref: '', align: 'left', backgroundOverlay: false, padding: 'py-20' },
        },
      ],
    });

    const result = auditSEO(data, { title: '', description: '' });
    const titleIssue = result.issues.find((i) => i.message.includes('title') && i.category === 'meta');
    expect(titleIssue).toBeDefined();
    expect(titleIssue?.severity).toBe('error');
  });

  it('reports a warning when title is outside recommended length', () => {
    const data = makeWellStructuredData();
    const result = auditSEO(data, { title: 'Short', description: 'A description long enough to pass validation checks.' });

    const titleIssue = result.issues.find(
      (i) => i.message.includes('title length') && i.category === 'meta',
    );
    expect(titleIssue).toBeDefined();
    expect(titleIssue?.severity).toBe('warning');
  });
});
