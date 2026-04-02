/**
 * Output Sanitizer — cleans up AI-generated node trees before sending to client.
 *
 * Fixes common issues from LLMs that don't strictly follow system prompt:
 * 1. Hierarchy violations (skipped levels)
 * 2. Missing `name` fields
 * 3. Emojis in content / message
 * 4. Invalid Tailwind CSS classes
 */

// Hierarchy: which child types each parent type allows
const ALLOWED_CHILDREN: Record<string, readonly string[]> = {
  page: ['section'],
  section: ['container'],
  container: ['component'],
  component: ['element'],
  element: ['element', 'item'],
  item: [],
};

// Level order for wrapping skipped levels
const LEVELS = ['page', 'section', 'container', 'component', 'element', 'item'];

// Emoji pattern (presentation + pictographic, excludes common punctuation)
const EMOJI_RE = /[\p{Emoji_Presentation}\p{Extended_Pictographic}]/gu;

// Tailwind class fixes
const TW_FIXES: ReadonlyArray<[RegExp, string]> = [
  [/\bduration-0\.\d+\b/g, 'duration-300'],
  [/\bshadow-xl-elevated\b/g, 'shadow-lg-elevated'],
  [/\bshadow-2xl-elevated\b/g, 'shadow-lg-elevated'],
];

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

let _counter = 0;

function autoName(tag: string): string {
  _counter++;
  const t = typeof tag === 'string' && tag ? tag.replace(/[^a-z0-9]/g, '') : 'node';
  return `${t}_${_counter}`;
}

function stripEmojis(text: string): string {
  return text.replace(EMOJI_RE, '').replace(/\s{2,}/g, ' ').trim();
}

function fixTailwind(cls: string): string {
  let fixed = cls;
  for (const [re, rep] of TW_FIXES) {
    fixed = fixed.replace(re, rep);
  }
  return fixed;
}

// ---------------------------------------------------------------------------
// Core sanitization
// ---------------------------------------------------------------------------

function sanitizeNode(node: Record<string, unknown>): Record<string, unknown> {
  const type = typeof node.type === 'string' ? node.type : 'element';
  const tag = typeof node.tag === 'string' ? node.tag : 'div';

  // Auto-generate name if missing
  if (!node.name || (typeof node.name === 'string' && !node.name.trim())) {
    node.name = autoName(tag);
  }

  // Strip emojis from content
  if (typeof node.content === 'string') {
    node.content = stripEmojis(node.content);
  }

  // Fix Tailwind classes
  if (typeof node.className === 'string') {
    node.className = fixTailwind(node.className);
  }

  // Process children
  const children = Array.isArray(node.children) ? node.children as Record<string, unknown>[] : [];
  const allowed = ALLOWED_CHILDREN[type];

  if (children.length > 0 && allowed && allowed.length > 0) {
    node.children = children.map((child) => {
      if (!child || typeof child !== 'object') return child;
      const childType = typeof child.type === 'string' ? child.type : 'element';

      if (allowed.includes(childType)) {
        // Correct hierarchy — recurse
        return sanitizeNode({ ...child });
      }

      // Hierarchy violation — wrap to bridge skipped levels
      return sanitizeNode(wrapNode({ ...child }, type, childType));
    });
  }

  return node;
}

/**
 * Wrap a child node to bridge the gap between parentType and childType.
 *
 * Example: parent=section (expects container), child=element
 *   → creates: container { component { element } }
 */
function wrapNode(
  child: Record<string, unknown>,
  parentType: string,
  childType: string,
): Record<string, unknown> {
  const parentIdx = LEVELS.indexOf(parentType);
  const childIdx = LEVELS.indexOf(childType);

  // Child is at same or higher level than parent — can't fix, return as-is
  if (childIdx <= parentIdx) return child;

  // Build wrappers from childIdx-1 down to parentIdx+1
  let current = child;

  for (let i = childIdx - 1; i > parentIdx; i--) {
    const wrapperType = LEVELS[i];
    current = {
      id: `n_wrap_${++_counter}`,
      name: autoName(wrapperType),
      type: wrapperType,
      tag: 'div',
      className: '',
      children: [current],
      meta: { createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() },
    } as Record<string, unknown>;
  }

  return current;
}

// ---------------------------------------------------------------------------
// Public API
// ---------------------------------------------------------------------------

/**
 * Sanitize the full AI response object.
 * Call this AFTER JSON parsing, BEFORE validation.
 */
export function sanitizeAIResponse(raw: Record<string, unknown>): Record<string, unknown> {
  _counter = 0;

  // Strip emojis from message
  if (typeof raw.message === 'string') {
    raw.message = stripEmojis(raw.message);
  }

  // Sanitize each node
  if (Array.isArray(raw.nodes)) {
    raw.nodes = (raw.nodes as Record<string, unknown>[]).map((node) => {
      if (!node || typeof node !== 'object') return node;
      return sanitizeNode({ ...node });
    });
  }

  return raw;
}
