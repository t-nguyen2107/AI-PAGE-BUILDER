import { COMPONENT_CATALOG, VALID_COMPONENT_TYPES } from '@/lib/ai/prompts/component-catalog';

describe('COMPONENT_CATALOG', () => {
  it('should have entries for all major component types', () => {
    const essentialTypes = [
      'HeroSection', 'FeaturesGrid', 'PricingTable', 'TestimonialSection',
      'CTASection', 'FAQSection', 'HeaderNav', 'FooterSection',
      'TextBlock', 'ImageBlock', 'CustomSection',
    ];
    for (const type of essentialTypes) {
      expect(COMPONENT_CATALOG).toHaveProperty(type);
    }
  });

  it('should have description and shortDescription for each entry', () => {
    for (const [key, info] of Object.entries(COMPONENT_CATALOG)) {
      expect(info.description).toBeTruthy();
      expect(info.shortDescription).toBeTruthy();
      expect(typeof info.description).toBe('string');
      expect(typeof info.shortDescription).toBe('string');
    }
  });

  it('should have propsSignature for each entry', () => {
    for (const [key, info] of Object.entries(COMPONENT_CATALOG)) {
      expect(typeof info.propsSignature).toBe('string');
    }
  });
});

describe('VALID_COMPONENT_TYPES', () => {
  it('should be a Set', () => {
    expect(VALID_COMPONENT_TYPES).toBeInstanceOf(Set);
  });

  it('should contain exactly the same keys as COMPONENT_CATALOG', () => {
    const catalogKeys = new Set(Object.keys(COMPONENT_CATALOG));
    expect(VALID_COMPONENT_TYPES).toEqual(catalogKeys);
  });

  it('should have no duplicate entries', () => {
    const catalogKeys = Object.keys(COMPONENT_CATALOG);
    // If there were duplicate keys in the catalog, the Set would still be correct size
    expect(VALID_COMPONENT_TYPES.size).toBe(catalogKeys.length);
  });

  it('should recognize HeroSection', () => {
    expect(VALID_COMPONENT_TYPES.has('HeroSection')).toBe(true);
  });

  it('should not recognize UnknownComponent', () => {
    expect(VALID_COMPONENT_TYPES.has('UnknownComponent')).toBe(false);
  });
});
