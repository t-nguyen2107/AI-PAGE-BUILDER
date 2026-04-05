import { vectorToPg } from '@/lib/ai/embeddings';
import { resetEmbeddingConfig } from '@/lib/ai/embeddings';

describe('vectorToPg', () => {
  it('should format Float32Array as PostgreSQL vector string', () => {
    const vec = new Float32Array([1, 2, 3]);
    expect(vectorToPg(vec)).toBe('[1,2,3]');
  });

  it('should handle single element', () => {
    const vec = new Float32Array([0.5]);
    expect(vectorToPg(vec)).toBe('[0.5]');
  });

  it('should handle negative values', () => {
    const vec = new Float32Array([-1, 0, 5]);
    expect(vectorToPg(vec)).toBe('[-1,0,5]');
  });

  it('should handle empty array', () => {
    const vec = new Float32Array([]);
    expect(vectorToPg(vec)).toBe('[]');
  });

  it('should handle large values', () => {
    const vec = new Float32Array([999.999]);
    const result = vectorToPg(vec);
    expect(result).toMatch(/^\[.+\]$/);
    expect(result).toContain('999');
  });
});

describe('resetEmbeddingConfig', () => {
  it('should be a callable function', () => {
    expect(typeof resetEmbeddingConfig).toBe('function');
  });

  it('should not throw when called', () => {
    expect(() => resetEmbeddingConfig()).not.toThrow();
  });
});
