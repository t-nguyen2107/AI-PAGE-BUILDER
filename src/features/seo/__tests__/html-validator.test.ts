import { describe, it, expect } from 'vitest';
import type { Data } from '@puckeditor/core';
import { validateSemanticHTML } from '../html-validator';

// ---- Helpers ----

function makeData(overrides?: Partial<Data>): Data {
  return {
    root: { props: { title: 'Test Page' } },
    content: [],
    ...overrides,
  };
}

// ---- Tests ----

describe('validateSemanticHTML', () => {
  // Rule 1: Section without heading -> info
  it('reports a notice when a section component has no heading', () => {
    const data = makeData({
      content: [
        {
          type: 'FeaturesGrid',
          props: { id: 'features-1', columns: 3, features: [] },
        },
      ],
    });

    const issues = validateSemanticHTML(data);

    const sectionIssue = issues.find(
      (i) => i.message.includes('FeaturesGrid') && i.message.includes('heading'),
    );
    expect(sectionIssue).toBeDefined();
    expect(sectionIssue?.category).toBe('semantic-html');
  });

  it('does not report an issue when a section has a heading', () => {
    const data = makeData({
      content: [
        {
          type: 'FeaturesGrid',
          props: { id: 'features-1', heading: 'Our Features', columns: 3, features: [] },
        },
      ],
    });

    const issues = validateSemanticHTML(data);

    const sectionIssue = issues.find(
      (i) => i.nodeId === 'features-1' && i.message.includes('heading'),
    );
    expect(sectionIssue).toBeUndefined();
  });

  // Rule 2: Nav without links -> warning
  it('reports a warning when a nav has no links', () => {
    const data = makeData({
      content: [
        {
          type: 'HeaderNav',
          props: { id: 'nav-1', logo: 'MySite', links: [], sticky: false },
        },
      ],
    });

    const issues = validateSemanticHTML(data);

    const navIssue = issues.find(
      (i) => i.message.includes('Navigation') && i.message.includes('no links'),
    );
    expect(navIssue).toBeDefined();
    expect(navIssue?.severity).toBe('warning');
  });

  it('does not report a warning when nav contains links', () => {
    const data = makeData({
      content: [
        {
          type: 'HeaderNav',
          props: {
            id: 'nav-1',
            logo: 'MySite',
            links: [{ label: 'Home', href: '/' }],
            sticky: false,
          },
        },
      ],
    });

    const issues = validateSemanticHTML(data);

    const navIssue = issues.find(
      (i) => i.nodeId === 'nav-1' && i.message.includes('no links'),
    );
    expect(navIssue).toBeUndefined();
  });

  // Rule 3: Footer with no content -> warning
  it('reports a warning when footer has no content', () => {
    const data = makeData({
      content: [
        {
          type: 'FooterSection',
          props: { id: 'footer-1', linkGroups: [] },
        },
      ],
    });

    const issues = validateSemanticHTML(data);

    const footerIssue = issues.find(
      (i) => i.message.includes('Footer') && i.message.includes('no content'),
    );
    expect(footerIssue).toBeDefined();
    expect(footerIssue?.severity).toBe('warning');
  });

  it('does not report when footer has content', () => {
    const data = makeData({
      content: [
        {
          type: 'FooterSection',
          props: {
            id: 'footer-1',
            copyright: '2026 MySite',
            linkGroups: [],
          },
        },
      ],
    });

    const issues = validateSemanticHTML(data);

    const footerIssue = issues.find(
      (i) => i.nodeId === 'footer-1' && i.message.includes('no content'),
    );
    expect(footerIssue).toBeUndefined();
  });

  // Rule 4: Missing header -> warning
  it('reports a warning when page has no header', () => {
    const data = makeData({
      content: [
        {
          type: 'HeroSection',
          props: { id: 'hero-1', heading: 'Welcome' },
        },
      ],
    });

    const issues = validateSemanticHTML(data);

    const headerIssue = issues.find(
      (i) => i.message.includes('header/navigation'),
    );
    expect(headerIssue).toBeDefined();
    expect(headerIssue?.severity).toBe('warning');
  });

  // Rule 5: Missing footer -> info
  it('reports info when page has no footer', () => {
    const data = makeData({
      content: [
        {
          type: 'HeaderNav',
          props: { id: 'nav-1', logo: 'MySite', links: [{ label: 'Home', href: '/' }], sticky: false },
        },
        {
          type: 'HeroSection',
          props: { id: 'hero-1', heading: 'Welcome' },
        },
      ],
    });

    const issues = validateSemanticHTML(data);

    const footerIssue = issues.find(
      (i) => i.message.includes('footer'),
    );
    expect(footerIssue).toBeDefined();
    expect(footerIssue?.severity).toBe('info');
  });

  // Rule 6: Multiple heroes -> error
  it('reports an error when multiple hero/banner components exist', () => {
    const data = makeData({
      content: [
        {
          type: 'HeroSection',
          props: { id: 'hero-1', heading: 'Welcome' },
        },
        {
          type: 'Banner',
          props: { id: 'banner-1', heading: 'Promo' },
        },
      ],
    });

    const issues = validateSemanticHTML(data);

    const multiHeroIssue = issues.find(
      (i) => i.message.includes('Multiple hero/banner'),
    );
    expect(multiHeroIssue).toBeDefined();
    expect(multiHeroIssue?.severity).toBe('error');
  });

  it('does not report when only one hero exists', () => {
    const data = makeData({
      content: [
        {
          type: 'HeaderNav',
          props: { id: 'nav-1', logo: 'MySite', links: [{ label: 'Home', href: '/' }], sticky: false },
        },
        {
          type: 'HeroSection',
          props: { id: 'hero-1', heading: 'Welcome' },
        },
        {
          type: 'FooterSection',
          props: { id: 'footer-1', copyright: '2026 MySite', linkGroups: [] },
        },
      ],
    });

    const issues = validateSemanticHTML(data);

    const multiHeroIssue = issues.find(
      (i) => i.message.includes('Multiple hero'),
    );
    expect(multiHeroIssue).toBeUndefined();
  });
});
