import { describe, it, expect } from 'vitest';
import { AIAction, ComponentCategory } from '@/types/enums';
import { parsePrompt } from '../prompt-parser';

// ============================================================
// Action Detection Tests
// ============================================================
describe('parsePrompt - Action Detection', () => {
  it('detects INSERT_SECTION for "add" keyword', () => {
    const result = parsePrompt('Add a hero section');
    expect(result.action).toBe(AIAction.INSERT_SECTION);
  });

  it('detects INSERT_SECTION for "create" keyword', () => {
    const result = parsePrompt('Create a pricing table');
    expect(result.action).toBe(AIAction.INSERT_SECTION);
  });

  it('detects INSERT_SECTION for "generate" keyword', () => {
    const result = parsePrompt('Generate a testimonials area');
    expect(result.action).toBe(AIAction.INSERT_SECTION);
  });

  it('detects MODIFY_NODE for "change" keyword', () => {
    const result = parsePrompt('Change the background color to blue');
    expect(result.action).toBe(AIAction.MODIFY_NODE);
  });

  it('detects MODIFY_NODE for "style" keyword', () => {
    const result = parsePrompt('Style the heading with larger font');
    expect(result.action).toBe(AIAction.MODIFY_NODE);
  });

  it('detects DELETE_NODE for "delete" keyword', () => {
    const result = parsePrompt('Delete the footer section');
    expect(result.action).toBe(AIAction.DELETE_NODE);
  });

  it('detects DELETE_NODE for "remove" keyword', () => {
    const result = parsePrompt('Remove the CTA button');
    expect(result.action).toBe(AIAction.DELETE_NODE);
  });

  it('detects REPLACE_NODE for "swap" keyword', () => {
    const result = parsePrompt('Swap the hero with a new one');
    expect(result.action).toBe(AIAction.REPLACE_NODE);
  });

  it('detects REORDER_CHILDREN for "move" keyword', () => {
    const result = parsePrompt('Move the section up');
    expect(result.action).toBe(AIAction.REORDER_CHILDREN);
  });

  it('defaults to INSERT_SECTION for unknown actions', () => {
    const result = parsePrompt('Make the page look better');
    expect(result.action).toBe(AIAction.INSERT_SECTION);
  });
});

// ============================================================
// Category Detection Tests
// ============================================================
describe('parsePrompt - Category Detection', () => {
  it('detects HERO category', () => {
    expect(parsePrompt('Add a hero section').componentCategory).toBe(ComponentCategory.HERO);
    expect(parsePrompt('Create a banner').componentCategory).toBe(ComponentCategory.HERO);
    expect(parsePrompt('Add a landing area').componentCategory).toBe(ComponentCategory.HERO);
  });

  it('detects PRICING category', () => {
    expect(parsePrompt('Add pricing table').componentCategory).toBe(ComponentCategory.PRICING);
    expect(parsePrompt('Create 3 plans').componentCategory).toBe(ComponentCategory.PRICING);
    expect(parsePrompt('Add pricing tiers').componentCategory).toBe(ComponentCategory.PRICING);
  });

  it('detects FEATURES category', () => {
    expect(parsePrompt('Add features section').componentCategory).toBe(ComponentCategory.FEATURES);
    expect(parsePrompt('Create a feature grid').componentCategory).toBe(ComponentCategory.FEATURES);
  });

  it('detects TESTIMONIAL category', () => {
    expect(parsePrompt('Add testimonials').componentCategory).toBe(ComponentCategory.TESTIMONIAL);
    expect(parsePrompt('Add a review section').componentCategory).toBe(ComponentCategory.TESTIMONIAL);
    expect(parsePrompt('Add customer quotes').componentCategory).toBe(ComponentCategory.TESTIMONIAL);
  });

  it('detects CTA category', () => {
    expect(parsePrompt('Add a CTA button').componentCategory).toBe(ComponentCategory.CTA);
    expect(parsePrompt('Create a call to action').componentCategory).toBe(ComponentCategory.CTA);
  });

  it('detects FAQ category', () => {
    expect(parsePrompt('Add FAQ section').componentCategory).toBe(ComponentCategory.FAQ);
    expect(parsePrompt('Create an accordion').componentCategory).toBe(ComponentCategory.FAQ);
  });

  it('detects GALLERY category', () => {
    expect(parsePrompt('Add a gallery').componentCategory).toBe(ComponentCategory.GALLERY);
    expect(parsePrompt('Add image gallery').componentCategory).toBe(ComponentCategory.GALLERY);
    expect(parsePrompt('Add portfolio section').componentCategory).toBe(ComponentCategory.GALLERY);
  });

  it('detects CONTACT category', () => {
    expect(parsePrompt('Add contact form').componentCategory).toBe(ComponentCategory.CONTACT);
    expect(parsePrompt('Add a form').componentCategory).toBe(ComponentCategory.CONTACT);
  });

  it('detects HEADER_NAV category', () => {
    expect(parsePrompt('Add header').componentCategory).toBe(ComponentCategory.HEADER_NAV);
    expect(parsePrompt('Add navigation').componentCategory).toBe(ComponentCategory.HEADER_NAV);
    expect(parsePrompt('Create navbar').componentCategory).toBe(ComponentCategory.HEADER_NAV);
  });

  it('detects FOOTER category', () => {
    expect(parsePrompt('Add footer').componentCategory).toBe(ComponentCategory.FOOTER);
  });

  it('detects STATS category', () => {
    expect(parsePrompt('Add stats section').componentCategory).toBe(ComponentCategory.STATS);
    expect(parsePrompt('Add statistics counter').componentCategory).toBe(ComponentCategory.STATS);
    expect(parsePrompt('Add numbers section').componentCategory).toBe(ComponentCategory.STATS);
  });

  it('detects TEAM category', () => {
    expect(parsePrompt('Add team section').componentCategory).toBe(ComponentCategory.TEAM);
    expect(parsePrompt('Add team members').componentCategory).toBe(ComponentCategory.TEAM);
    expect(parsePrompt('Add staff section').componentCategory).toBe(ComponentCategory.TEAM);
  });

  it('detects LOGO_GRID category', () => {
    expect(parsePrompt('Add logo grid').componentCategory).toBe(ComponentCategory.LOGO_GRID);
    expect(parsePrompt('Add partners logos').componentCategory).toBe(ComponentCategory.LOGO_GRID);
    expect(parsePrompt('Add client logos').componentCategory).toBe(ComponentCategory.LOGO_GRID);
  });

  it('detects BLOG category', () => {
    expect(parsePrompt('Add blog section').componentCategory).toBe(ComponentCategory.BLOG);
    expect(parsePrompt('Add blog posts').componentCategory).toBe(ComponentCategory.BLOG);
    expect(parsePrompt('Add articles section').componentCategory).toBe(ComponentCategory.BLOG);
    expect(parsePrompt('Add news section').componentCategory).toBe(ComponentCategory.BLOG);
  });

  it('returns undefined for unrecognized category', () => {
    expect(parsePrompt('Add something random').componentCategory).toBeUndefined();
  });
});

// ============================================================
// Count Extraction Tests
// ============================================================
describe('parsePrompt - Count Extraction', () => {
  it('extracts numeric count from "3 tiers"', () => {
    const result = parsePrompt('Add pricing with 3 tiers');
    expect(result.count).toBe(3);
  });

  it('extracts numeric count from "5 items"', () => {
    const result = parsePrompt('Add features with 5 items');
    expect(result.count).toBe(5);
  });

  it('extracts count from "with 4" pattern', () => {
    const result = parsePrompt('Add blog posts with 4');
    expect(result.count).toBe(4);
  });

  it('extracts word number "three"', () => {
    const result = parsePrompt('Add three team members');
    expect(result.count).toBe(3);
  });

  it('extracts word number "five"', () => {
    const result = parsePrompt('Create five feature cards');
    expect(result.count).toBe(5);
  });

  it('returns undefined when no count specified', () => {
    const result = parsePrompt('Add a hero section');
    expect(result.count).toBeUndefined();
  });
});

// ============================================================
// Property Extraction Tests
// ============================================================
describe('parsePrompt - Property Extraction', () => {
  it('extracts text from double quotes', () => {
    const result = parsePrompt('Add a heading "Welcome to our site"');
    expect(result.properties?.text).toBe('Welcome to our site');
  });

  it('extracts text from single quotes', () => {
    const result = parsePrompt("Add a heading 'Welcome'");
    expect(result.properties?.text).toBe('Welcome');
  });

  it('sets count property for STATS category', () => {
    const result = parsePrompt('Add 3 cards to the stats section');
    expect(result.properties?.count).toBe(3);
  });

  it('sets count property for BLOG category', () => {
    const result = parsePrompt('Add 4 items to the blog section');
    expect(result.properties?.count).toBe(4);
  });

  it('sets tiers property for PRICING category', () => {
    const result = parsePrompt('Add pricing with 3 tiers');
    expect(result.properties?.tiers).toBe(3);
  });

  it('preserves targetDescription', () => {
    const result = parsePrompt('Add a hero section');
    expect(result.targetDescription).toBe('Add a hero section');
  });
});
