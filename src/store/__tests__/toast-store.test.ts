import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { useToastStore } from '../toast-store';

describe('ToastStore', () => {
  beforeEach(() => {
    useToastStore.setState({ toasts: [] });
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('starts with empty toasts', () => {
    expect(useToastStore.getState().toasts).toEqual([]);
  });

  it('addToast adds a toast with default type info', () => {
    useToastStore.getState().addToast('Hello');

    const { toasts } = useToastStore.getState();
    expect(toasts).toHaveLength(1);
    expect(toasts[0].message).toBe('Hello');
    expect(toasts[0].type).toBe('info');
    expect(toasts[0].id).toBeDefined();
    expect(toasts[0].createdAt).toBeDefined();
  });

  it('addToast adds toast with specified type', () => {
    useToastStore.getState().addToast('Success!', 'success');
    useToastStore.getState().addToast('Error!', 'error');

    const { toasts } = useToastStore.getState();
    expect(toasts).toHaveLength(2);
    expect(toasts[0].type).toBe('success');
    expect(toasts[1].type).toBe('error');
  });

  it('removeToast removes a specific toast by id', () => {
    useToastStore.getState().addToast('First');
    useToastStore.getState().addToast('Second');

    const { toasts } = useToastStore.getState();
    expect(toasts).toHaveLength(2);

    useToastStore.getState().removeToast(toasts[0].id);

    const remaining = useToastStore.getState().toasts;
    expect(remaining).toHaveLength(1);
    expect(remaining[0].message).toBe('Second');
  });

  it('removeToast on non-existent id does nothing', () => {
    useToastStore.getState().addToast('Hello');

    useToastStore.getState().removeToast('nonexistent');

    expect(useToastStore.getState().toasts).toHaveLength(1);
  });

  it('auto-removes toast after 4000ms', () => {
    useToastStore.getState().addToast('Will disappear');

    expect(useToastStore.getState().toasts).toHaveLength(1);

    vi.advanceTimersByTime(4000);

    expect(useToastStore.getState().toasts).toHaveLength(0);
  });

  it('auto-removes only the specific toast, not others', () => {
    useToastStore.getState().addToast('First');
    vi.advanceTimersByTime(100);
    useToastStore.getState().addToast('Second');

    expect(useToastStore.getState().toasts).toHaveLength(2);

    // Advance past first toast's timeout
    vi.advanceTimersByTime(3900);

    // First toast should be removed, second should still be there
    expect(useToastStore.getState().toasts).toHaveLength(1);
    expect(useToastStore.getState().toasts[0].message).toBe('Second');
  });

  it('accumulates multiple toasts', () => {
    useToastStore.getState().addToast('A', 'success');
    useToastStore.getState().addToast('B', 'error');
    useToastStore.getState().addToast('C', 'info');

    expect(useToastStore.getState().toasts).toHaveLength(3);
    expect(useToastStore.getState().toasts.map(t => t.message)).toEqual(['A', 'B', 'C']);
  });
});
