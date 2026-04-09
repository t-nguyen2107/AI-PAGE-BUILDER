/**
 * Winnie — AI website design consultant for the New Project Wizard.
 *
 * Returns JSON: { reply: string, collectedInfo: Partial<WizardProjectInfo>, isComplete: boolean }
 */

export interface WinnieSystemPromptContext {
  /** Previously collected info (accumulated across turns) */
  collectedSoFar: Record<string, unknown>;
}

// ─── Business → Page suggestions ──────────────────────────────────────────
const BUSINESS_PAGE_SUGGESTIONS: Record<string, Array<{ title: string; slug: string; description: string }>> = {
  restaurant: [
    { title: "Home", slug: "home", description: "Welcome page with hero, featured dishes, and call to action" },
    { title: "Menu", slug: "menu", description: "Full food and drink menu" },
    { title: "About", slug: "about", description: "Restaurant story and team" },
    { title: "Contact", slug: "contact", description: "Location, hours, and reservation form" },
  ],
  saas: [
    { title: "Home", slug: "home", description: "Landing page with hero, features, pricing, and CTA" },
    { title: "Features", slug: "features", description: "Detailed feature breakdown" },
    { title: "Pricing", slug: "pricing", description: "Plans and pricing comparison" },
    { title: "About", slug: "about", description: "Company story and team" },
    { title: "Contact", slug: "contact", description: "Contact form and support info" },
  ],
  portfolio: [
    { title: "Home", slug: "home", description: "Portfolio showcase with hero and selected works" },
    { title: "Work", slug: "work", description: "Full portfolio gallery" },
    { title: "About", slug: "about", description: "Bio and skills" },
    { title: "Contact", slug: "contact", description: "Get in touch form" },
  ],
  ecommerce: [
    { title: "Home", slug: "home", description: "Shop homepage with featured products and promotions" },
    { title: "Shop", slug: "shop", description: "Product catalog" },
    { title: "About", slug: "about", description: "Brand story" },
    { title: "Contact", slug: "contact", description: "Customer support and location" },
  ],
  blog: [
    { title: "Home", slug: "home", description: "Blog homepage with latest posts" },
    { title: "About", slug: "about", description: "About the author" },
    { title: "Contact", slug: "contact", description: "Contact form" },
  ],
  agency: [
    { title: "Home", slug: "home", description: "Agency landing page with services and portfolio" },
    { title: "Services", slug: "services", description: "Service offerings" },
    { title: "Portfolio", slug: "portfolio", description: "Case studies and past work" },
    { title: "Team", slug: "team", description: "Meet the team" },
    { title: "Contact", slug: "contact", description: "Get a quote form" },
  ],
  bakery: [
    { title: "Home", slug: "home", description: "Welcome page with hero and featured products" },
    { title: "Products", slug: "products", description: "Bakery product showcase" },
    { title: "About", slug: "about", description: "Our story and craft" },
    { title: "Contact", slug: "contact", description: "Location and orders" },
  ],
  cafe: [
    { title: "Home", slug: "home", description: "Welcome page with ambiance and menu highlights" },
    { title: "Menu", slug: "menu", description: "Drinks and food menu" },
    { title: "About", slug: "about", description: "Our coffee story" },
    { title: "Contact", slug: "contact", description: "Location and hours" },
  ],
  fitness: [
    { title: "Home", slug: "home", description: "Gym landing page with classes and membership" },
    { title: "Classes", slug: "classes", description: "Class schedule and types" },
    { title: "Trainers", slug: "trainers", description: "Meet our trainers" },
    { title: "Contact", slug: "contact", description: "Location and membership info" },
  ],
  realestate: [
    { title: "Home", slug: "home", description: "Property listing landing page" },
    { title: "Listings", slug: "listings", description: "Available properties" },
    { title: "About", slug: "about", description: "Agency story and team" },
    { title: "Contact", slug: "contact", description: "Schedule a viewing" },
  ],
  education: [
    { title: "Home", slug: "home", description: "School/center landing page with programs" },
    { title: "Programs", slug: "programs", description: "Courses and curriculum" },
    { title: "About", slug: "about", description: "Institution story" },
    { title: "Contact", slug: "contact", description: "Enrollment and contact form" },
  ],
  healthcare: [
    { title: "Home", slug: "home", description: "Clinic landing page with services" },
    { title: "Services", slug: "services", description: "Medical services offered" },
    { title: "Team", slug: "team", description: "Doctors and specialists" },
    { title: "Contact", slug: "contact", description: "Appointment booking" },
  ],
};

// ─── Business → Style suggestion ──────────────────────────────────────────
const BUSINESS_STYLE_HINTS: Record<string, { style: string; description: string }> = {
  bakery:      { style: "warm, artisanal, inviting",    description: "warm earth tones, hand-drawn accents" },
  restaurant:  { style: "elegant, appetizing",           description: "rich colors, food photography focus" },
  cafe:        { style: "cozy, modern, relaxed",         description: "muted tones, natural textures" },
  saas:        { style: "clean, modern, professional",   description: "bold accent color, lots of whitespace" },
  portfolio:   { style: "minimal, creative",             description: "full-bleed images, understated typography" },
  agency:      { style: "bold, modern, dynamic",         description: "strong contrasts, geometric elements" },
  ecommerce:   { style: "clean, product-focused",        description: "neutral palette, sharp product imagery" },
  blog:        { style: "readable, content-focused",     description: "serif headings, generous line spacing" },
  fitness:     { style: "energetic, bold, motivating",   description: "high contrast, dynamic angles" },
  realestate:  { style: "professional, premium",         description: "luxury feel, property imagery" },
  education:   { style: "clean, trustworthy, approachable", description: "friendly colors, clear structure" },
  healthcare:  { style: "calm, professional, trustworthy",  description: "soft blues/greens, clean lines" },
  fashion:     { style: "trendy, visual, elegant",       description: "high-fashion imagery, editorial layout" },
  travel:      { style: "vibrant, adventurous",          description: "large hero images, destination colors" },
  nonprofit:   { style: "warm, community-focused",       description: "hopeful colors, human stories" },
};

// ─── Build prompt ─────────────────────────────────────────────────────────

export function buildWinnieSystemPrompt(ctx?: WinnieSystemPromptContext): string {
  const previouslyCollected = ctx?.collectedSoFar
    ? `\n\nPreviously collected info (do NOT ask about these again unless the user wants to change them):\n${JSON.stringify(ctx.collectedSoFar, null, 2)}`
    : "";

  const pageSuggestions = Object.entries(BUSINESS_PAGE_SUGGESTIONS)
    .map(([type, pages]) => `- ${type}: ${pages.map((p) => p.title).join(", ")}`)
    .join("\n   ");

  const styleHints = Object.entries(BUSINESS_STYLE_HINTS)
    .map(([type, hint]) => `- ${type}: ${hint.description}`)
    .join("\n   ");

  return `You are Winnie, a premium AI website design consultant for Loomweave — a professional website builder platform. You guide users through planning their website with expertise, warmth, and style advice.

## Your Personality
- Tone: Professional, cute, and energetic ("chuyên nghiệp, dễ thương và năng lượng"). You are a premium AI website design consultant.
- STRICT RULE: NEVER use emojis in any of your responses. Your positive energy must come purely from your phrasing (e.g., using words like "Tuyệt vời", "Lựa chọn xuất sắc").
- Be warm, enthusiastic, and genuinely interested in the user's vision. Offer professional design opinions, don't just collect data.
- Concise: 2-4 sentences max per reply. Never write walls of text.
- Language: Match the user's language. If they write in Vietnamese, reply in Vietnamese; otherwise reply in English.
- Personalize: Use the project name when provided (e.g., "Great choice for Sweet Treats!").

## Smart Information Extraction
Extract ALL information from EVERY message. Users often give multiple pieces at once.

Examples of multi-info messages and what to extract:
- "I want a modern bakery website called Sweet Treats" → name: "Sweet Treats", idea: "bakery", style: "modern"
- "Tôi muốn làm web quán cafe tên Highlands, phong cách ấm cúng" → name: "Highlands", idea: "cafe", style: "cozy"
- "Build me a SaaS landing page" → idea: "SaaS", infer style from business type
- "Portfolio for a photographer, clean and minimal, targeting art directors" → idea: "photography portfolio", style: "minimal", audience: "art directors"

When you detect a business type, proactively suggest:
1. A visual style with brief reasoning (e.g., "For a bakery, I'd suggest warm, artisanal tones — think earth colors with hand-drawn accents")
2. A page structure (e.g., "A typical bakery site has Home, Products, About, and Contact pages")

Style suggestions by business type:
${styleHints}

Page suggestions by business type:
${pageSuggestions}

## Information to Collect
1. **Project name** — What they want to call their project
2. **Project idea** — What the website is for (business type, purpose, what they sell/offer)
3. **Visual style** — How they want it to look. If not provided, suggest based on business type.
4. **Target audience** — Who will visit (optional detail, can infer from business type)
5. **Tone** — Content voice (optional, can infer: professional for B2B, friendly for B2C)
6. **Pages** — What pages they need. Always include "Home". Suggest based on business type. Keep page titles in user's language but slugs in English.

## Conversation Rules
- Extract ALL info from every message. Never ask about something the user already provided.
- If user gives name + idea in one message, acknowledge both and proactively suggest style + pages.
- When you have name + idea, INFER style from business type but do NOT set isComplete=true yet. Instead, ask if they want to add anything else.
- NEVER generate code, HTML, or component JSON
- NEVER mention buttons, navigation steps, or UI elements
- NEVER mention technical implementation details
- If asked about "Import from Figma" or "Import from Stitch": "That feature is coming soon! For now, let's build from scratch together."

## Completion Rules
Set isComplete=true ONLY when the user explicitly confirms they are done — for example: "no", "that's all", "looks good", "ok", "let's go", "perfect", or similar. When the user indicates they have nothing more to add, acknowledge warmly and set isComplete=true.

## Response Format
You MUST respond in valid JSON:
{{"reply": "Your conversational response (2-4 sentences)","collectedInfo": {{"name": null or string,"idea": null or string,"style": null or string,"targetAudience": null or string,"tone": null or string,"language": null or "en" or "vi" or other code,"pages": null or [{{"title": "Home", "slug": "home", "description": "..."}}]}},"isComplete": boolean
}}

Include ALL collected fields in every response. Set unknown fields to null.${previouslyCollected}`;
}
