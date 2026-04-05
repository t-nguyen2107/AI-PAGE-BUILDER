import { describe, it, expect, vi } from 'vitest';
import { validateOutput } from '@/lib/ai/output';

describe('validateOutput', () => {
  it('should reject null input', () => {
    const result = validateOutput(null);
    expect(result.data).toBeNull();
    expect(result.error).toContain('not a valid object');
  });

  it('should reject non-object input', () => {
    const result = validateOutput('hello');
    expect(result.data).toBeNull();
    expect(result.error).toContain('not a valid object');
  });

  it('should reject missing action', () => {
    const result = validateOutput({ components: [] });
    expect(result.data).toBeNull();
    expect(result.error).toContain('Invalid or missing "action"');
  });

  it('should reject invalid action', () => {
    const result = validateOutput({ action: 'fly_to_moon', components: [] });
    expect(result.data).toBeNull();
    expect(result.error).toContain('Invalid or missing "action"');
  });

  it('should validate clarify action with message', () => {
    const result = validateOutput({ action: 'clarify', message: 'What style do you prefer?' });
    expect(result.data).not.toBeNull();
    expect(result.data!.action).toBe('clarify');
    expect(result.data!.message).toBe('What style do you prefer?');
    expect(result.data!.components).toEqual([]);
  });

  it('should reject clarify action without message', () => {
    const result = validateOutput({ action: 'clarify' });
    expect(result.data).toBeNull();
    expect(result.error).toContain('Clarify action requires a "message"');
  });

  it('should strip <think/> tags from clarify message', () => {
    const result = validateOutput({
      action: 'clarify',
      message: '<think hmm</think > actual message',
    });
    expect(result.data).not.toBeNull();
    expect(result.data!.message).toBe('actual message');
  });

  it('should validate full_page action with components', () => {
    const result = validateOutput({
      action: 'full_page',
      components: [
        { type: 'HeroSection', props: { id: 'h1', heading: 'Welcome' } },
        { type: 'FeaturesGrid', props: { id: 'f1', heading: 'Features' } },
      ],
    });
    expect(result.data).not.toBeNull();
    expect(result.data!.action).toBe('full_page');
    expect(result.data!.components).toHaveLength(2);
    expect(result.data!.components[0].type).toBe('HeroSection');
  });

  it('should support legacy "nodes" field', () => {
    const result = validateOutput({
      action: 'full_page',
      nodes: [
        { type: 'HeroSection', props: { id: 'h1', heading: 'Welcome' } },
      ],
    });
    expect(result.data).not.toBeNull();
    expect(result.data!.components).toHaveLength(1);
  });

  it('should reject when both components and nodes are empty', () => {
    const result = validateOutput({ action: 'full_page' });
    expect(result.data).toBeNull();
    expect(result.error).toContain('Missing "components"');
  });

  it('should allow empty components for delete_node action', () => {
    const result = validateOutput({ action: 'delete_node' });
    expect(result.data).not.toBeNull();
    expect(result.data!.components).toEqual([]);
  });

  it('should auto-assign id when missing from component props', () => {
    const result = validateOutput({
      action: 'insert_section',
      components: [{ type: 'TextBlock', props: {} }],
    });
    expect(result.data).not.toBeNull();
    expect(result.data!.components[0].props.id).toMatch(/^comp_\d+_\d+$/);
  });

  it('should keep empty string as type (valid string)', () => {
    const result = validateOutput({
      action: 'insert_section',
      components: [{ type: '', props: { id: 'c1' } }],
    });
    expect(result.data).not.toBeNull();
    expect(result.data!.components[0].type).toBe('');
  });

  it('should default to TextBlock for non-object component', () => {
    const result = validateOutput({
      action: 'insert_section',
      components: [null],
    });
    expect(result.data).not.toBeNull();
    expect(result.data!.components[0].type).toBe('TextBlock');
  });

  it('should strip emojis from text props', () => {
    const result = validateOutput({
      action: 'insert_section',
      components: [{ type: 'HeroSection', props: { id: 'h1', heading: 'Welcome 🎉🚀' } }],
    });
    expect(result.data).not.toBeNull();
    expect(result.data!.components[0].props.heading).toBe('Welcome');
  });

  it('should warn about unknown component types but not reject', () => {
    const warnSpy = vi.spyOn(console, 'warn');
    const result = validateOutput({
      action: 'insert_section',
      components: [{ type: 'UnknownWidget', props: { id: 'u1' } }],
    });
    expect(result.data).not.toBeNull();
    expect(result.data!.components[0].type).toBe('UnknownWidget');
    expect(warnSpy).toHaveBeenCalledWith(expect.stringContaining('Unknown component type'));
    warnSpy.mockRestore();
  });

  it('should extract targetComponentId when present', () => {
    const result = validateOutput({
      action: 'modify_node',
      targetComponentId: 'hero-1',
      components: [{ type: 'HeroSection', props: { id: 'hero-1', heading: 'New' } }],
    });
    expect(result.data).not.toBeNull();
    expect(result.data!.targetComponentId).toBe('hero-1');
  });

  it('should extract position when present', () => {
    const result = validateOutput({
      action: 'insert_section',
      position: 3,
      components: [{ type: 'HeroSection', props: { id: 'h1', heading: 'Hi' } }],
    });
    expect(result.data).not.toBeNull();
    expect(result.data!.position).toBe(3);
  });

  it('should strip <think/> tags from message field', () => {
    const result = validateOutput({
      action: 'full_page',
      message: '<think reasoning here</think > Done!',
      components: [{ type: 'HeroSection', props: { id: 'h1' } }],
    });
    expect(result.data).not.toBeNull();
    expect(result.data!.message).toBe('Done!');
  });

  it('should handle props with null/undefined gracefully', () => {
    const result = validateOutput({
      action: 'insert_section',
      components: [{ type: 'TextBlock', props: null }],
    });
    expect(result.data).not.toBeNull();
    expect(result.data!.components[0].props.id).toMatch(/^comp_/);
  });
});
