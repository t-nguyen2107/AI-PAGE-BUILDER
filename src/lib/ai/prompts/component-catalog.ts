/**
 * Shared Component Catalog — single source of truth for all component metadata.
 *
 * Used by:
 *  - system-prompt.ts (tiered catalog builder)
 *  - template-prompt.ts (compact props reference)
 *  - output.ts, template-schema.ts (VALID_COMPONENT_TYPES)
 */

export interface ComponentInfo {
  description: string;
  shortDescription: string;
  propsSignature: string;
  /** Recommended default props the AI should include when generating this component */
  recommendedDefaults?: string;
  /** Tips on which variants/props to choose based on context */
  variantTips?: string;
}

export const COMPONENT_CATALOG: Record<string, ComponentInfo> = {
  HeroSection: {
    description: 'Hero banner with heading, subtext, CTA buttons, optional background image.',
    shortDescription: 'Hero banner with heading and CTA buttons',
    propsSignature: 'heading (string), subtext (string), badge (string?), ctaText (string), ctaHref (string), ctaSecondaryText (string?), ctaSecondaryHref (string?), align ("left"|"center"), backgroundUrl (string?), backgroundOverlay (boolean), padding ("48px"|"96px"|"128px")',
    recommendedDefaults: 'animation: "fade-up", padding: "96px", align: "center", badge: short 2-4 word label above heading (e.g. "Now in Beta", "New Menu"), ctaText: action verb phrase, ctaSecondaryText: "Learn More", backgroundOverlay: true when using backgroundUrl',
    variantTips: 'SaaS: Use align "center" with gradientFrom/gradientTo in brand colors. Heading should state the value prop in 6-10 words (e.g. "Ship Faster with Real-Time Analytics"). Add badge like "Trusted by 10,000+ teams" for credibility. Two CTAs: "Start Free Trial" (primary) + "Watch Demo" (secondary). E-commerce: Use align "left" with a product image on the right via backgroundUrl. Heading: seasonal or benefit-driven (e.g. "Summer Collection — 30% Off"). Single bold CTA: "Shop Now". Restaurant: Use backgroundUrl with an appetizing hero food image, backgroundOverlay: true to keep text readable. Align "center". CTA: "View Our Menu" or "Reserve a Table". Badge: "Award-Winning Cuisine". Fitness: Dark gradient background (gradientFrom dark navy, gradientTo black). Bold short heading. CTA: "Start Your Free Trial" + "See Results". Portfolio: Minimal — no background image, clean white, centered. Heading is your name/tagline, subtext is a one-line specialty. Single CTA: "View My Work". Healthcare: Soothing light gradient, trust-building badge like "Board Certified". CTA: "Book an Appointment". Real Estate: Full-bleed property image with overlay. Heading: "Find Your Dream Home". CTA: "Browse Listings". Combines well with: StatsSection immediately below for instant credibility, or FeaturesGrid for 3 key benefits.',
  },
  FeaturesGrid: {
    description: 'Grid of feature cards with icons, titles, descriptions.',
    shortDescription: 'Feature cards in a responsive grid',
    propsSignature: 'heading (string), subtext (string?), columns (2|3|4), features (array of {title, description, icon?})',
    recommendedDefaults: 'columns: 3, 4-6 features, cardStyle: "elevated", hoverEffect: "lift", animation: "stagger", heading: benefit-focused (e.g. "Everything You Need to Succeed"), subtext: 1-sentence elaboration',
    variantTips: 'SaaS: Use cardStyle "icon" with descriptive icon names. 4-6 features covering core platform capabilities — e.g. "Real-Time Analytics" with description "Track every metric as it happens with sub-second latency dashboards", "Enterprise Security" with "SOC 2 Type II compliant with end-to-end encryption and SSO support". Avoid generic titles like "Fast" or "Secure" — be specific about WHAT is fast and HOW it is secure. E-commerce: Use cardStyle "elevated" with 3 columns. Focus features on shopping experience: "Free Shipping Over $50", "Easy 30-Day Returns", "Secure Checkout". Each description should be 2 short sentences with a concrete benefit. Creative agency: cardStyle "flat" with bold typography. Use 2 columns for impact with longer descriptions. Feature names as action phrases: "Build Brand Identity", "Drive Engagement". Restaurant: 3 columns, features about the dining experience — "Farm-to-Table Ingredients", "Chef-Curated Wine List", "Private Dining Rooms". Each card 1-2 sentences. Education: 4 columns highlighting program strengths — "Expert Instructors", "Hands-On Projects", "Flexible Schedule", "Career Support". Use icons matching each feature. Combines well with: StatsSection above for credibility before features, or FeatureShowcase below for a deep-dive on the #1 feature.',
  },
  PricingTable: {
    description: 'Pricing tier cards with feature lists and CTA buttons.',
    shortDescription: 'Pricing plans with feature comparison',
    propsSignature: 'heading (string), subtext (string?), plans (array of {name, price, period, description, features: array of {value}, ctaText, ctaHref, highlighted: boolean})',
    recommendedDefaults: '3 tiers with middle highlighted, highlightedBadge: "Most Popular", pricingToggle: true, yearlyPlans with 15-20% discount, animation: "stagger", heading: "Simple, Transparent Pricing", subtext: "No hidden fees. Cancel anytime."',
    variantTips: 'Always include exactly 3 tiers — fewer lacks choice, more causes decision paralysis. Highlight the MIDDLE tier as "Most Popular" — this anchors the buyer toward the higher-value option. SaaS: Name tiers "Starter / Professional / Enterprise". Starter at $29/mo with core features (5 users, 10GB, email support). Professional at $79/mo with growth features (25 users, 100GB, priority support, API access). Enterprise at custom pricing with all features + SSO + dedicated account manager. Include pricingToggle with yearlyPlans showing "$24/mo billed annually" for Starter and "$65/mo billed annually" for Professional. CTA text: "Start Free Trial" for Starter, "Get Started" for Pro, "Contact Sales" for Enterprise. E-commerce: "Free / Pro / Business" model. Free plan with basic storefront, Pro at $29/mo with custom domain + analytics, Business at $79/mo with multi-channel selling + inventory management. Restaurant: Simplify to 2 tiers if needed — "Lunch Menu" and "Dinner Menu" or a single "Prix Fixe" showcase. Use description field for what is included. Fitness: "Basic / Premium / Unlimited" — class pack pricing. Each feature list should include class count, guest passes, amenity access. Combines well with: FAQSection below to answer "Can I switch plans?", "Is there a free trial?", "What happens when I cancel?" — this directly increases conversion.',
  },
  TestimonialSection: {
    description: 'Testimonial cards with quotes and author info.',
    shortDescription: 'Customer testimonials with quotes',
    propsSignature: 'heading (string?), testimonials (array of {quote, author, role, avatarUrl?})',
    recommendedDefaults: '3-4 testimonials, animation: "stagger-fade", variant: "carousel", heading: "What Our Customers Say" or "Trusted by Industry Leaders"',
    variantTips: 'SaaS: Use variant "carousel" with headshot avatarUrls. Each quote should mention a specific measurable result — e.g. "We reduced our deployment time by 73% in the first month" attributed to "Sarah Chen, VP of Engineering at DataFlow Inc." Avoid generic praise like "Great product!" — instead use outcome-focused quotes that mention pain points solved. Restaurant: Grid variant with warm, emotional quotes about the experience. e.g. "The truffle risotto was the best I have had outside of Italy. Our anniversary dinner here was unforgettable." attributed to "Michael Torres, Food Critic, City Dining Guide". Agency: 4 testimonials from different industries to show range. Include company names and specific project outcomes: "Increased our conversion rate by 42% with the new landing page design" from "Lisa Park, CMO at GreenTech Solutions". Healthcare: Professional tone with credentials — "Dr. James Mitchell, Chief of Cardiology, Metro General Hospital". Quotes about patient outcomes, efficiency, or care quality. E-commerce: Focus on product quality and delivery speed. "Ordered on Tuesday, arrived Thursday. The quality exceeded my expectations — already ordered two more." from "Emma Rodriguez, Verified Buyer". Combines well with: LogoGrid above (social proof → testimonial depth), or StatsSection above (numbers → stories).',
  },
  CTASection: {
    description: 'Call-to-action section with heading, subtext, and button.',
    shortDescription: 'Call-to-action with heading and button',
    propsSignature: 'heading (string), subtext (string?), ctaText (string), ctaHref (string), backgroundUrl (string?)',
    recommendedDefaults: 'animation: "fade-up", variant: "gradient", gradientFrom: primary brand color, gradientTo: secondary or accent color, heading: action-oriented imperative, ctaText: verb phrase (e.g. "Get Started Today")',
    variantTips: 'SaaS: Use variant "gradient" with gradientFrom/gradientTo matching brand colors. Heading should create urgency or excitement: "Ready to Transform Your Workflow?" with subtext "Join 10,000+ teams already shipping faster" and CTA "Start Your Free Trial". E-commerce: Use variant "dark" for contrast. Heading: seasonal or limited-time offer ("Flash Sale — Ends Midnight") with subtext showing the discount value ("Save up to 40% on our best-selling items") and CTA "Shop the Sale". Restaurant: Warm variant, heading about the experience ("Experience Fine Dining at Its Best"), subtext with reservation hook ("Book your table and enjoy a complimentary appetizer on your first visit"), CTA: "Reserve a Table". Fitness: Bold variant with motivational heading ("Start Your Transformation Today"), subtext with a trial offer ("7-day free trial — no credit card required"), CTA: "Begin Your Journey". Education: Trust-building heading ("Invest in Your Future"), subtext about outcomes ("94% of graduates report career advancement within 6 months"), CTA: "Enroll Now". This section is your page\'s second conversion point — place it after testimonials or pricing to capture users who need one final push. Combines well with: NewsletterSignup as an alternative conversion path (offer email signup for users not ready to buy).',
  },
  FAQSection: {
    description: 'FAQ with expandable question/answer items.',
    shortDescription: 'Frequently asked questions accordion',
    propsSignature: 'heading (string), subtext (string?), items (array of {question, answer})',
    recommendedDefaults: 'animation: "fade-up", 5-6 items, heading: "Frequently Asked Questions", subtext: "Got questions? We have answers."',
    variantTips: 'SaaS: Cover pricing concerns ("Is there a free trial?" → "Yes! Start with our 14-day free trial, no credit card required..."), security ("How secure is my data?" → "We are SOC 2 Type II certified with AES-256 encryption at rest..."), integrations ("Does it work with Slack?" → "Yes, we integrate with 200+ tools including Slack, Teams, Jira..."), and onboarding ("How long does setup take?" → "Most teams are up and running in under 15 minutes..."). Always end answers with a reassuring next step. Restaurant: Practical logistics — "Do I need a reservation?" with details about walk-in policy, "Do you accommodate dietary restrictions?" listing vegan/gluten-free/allergy options, "What are your hours?" with full schedule, "Is there parking available?" with nearby options, "Can I host a private event?" with capacity and catering info. E-commerce: Shipping and returns — "How long does shipping take?" with specific timeframes by region, "What is your return policy?" with clear steps, "Do you ship internationally?" with countries and fees, "Is checkout secure?" mentioning payment providers. Healthcare: Insurance and access — "What insurance do you accept?", "How do I schedule an appointment?", "Do you offer telehealth?", "What should I bring to my first visit?". Write answers that reduce anxiety and remove barriers. Combines well with: PricingTable above (FAQ addresses remaining objections after seeing prices), or ContactForm below (FAQ first, then contact for unanswered questions).',
  },
  StatsSection: {
    description: 'Statistics counter section.',
    shortDescription: 'Statistics counter display',
    propsSignature: 'heading (string?), stats (array of {value, label}), columns (2|3|4)',
    recommendedDefaults: 'animated: true, columns: 4, animation: "fade-up", 4 stats with "value" using number + unit (e.g. "10K+", "99.9%", "$2M+") and "label" as a short 2-4 word descriptor',
    variantTips: 'Always use 4 stats — 3 looks incomplete, 5+ dilutes impact. Values should be impressive but BELIEVABLE — avoid round numbers that look made up. SaaS: "10,000+ Active Users" (not "10K"), "99.9% Uptime SLA", "50M+ API Calls Processed", "150+ Integrations". Pair a large user count with a technical stat (uptime, speed) and a growth metric. E-commerce: "50,000+ Orders Shipped", "4.8/5 Customer Rating", "98% On-Time Delivery", "24/7 Customer Support". Use stats that build buyer confidence. Restaurant: "15+ Years of Excellence", "200,000+ Meals Served", "4.9 Star Rating", "3 Locations". Combine heritage, volume, quality, and scale. Healthcare: "25,000+ Patients Treated", "50+ Board-Certified Specialists", "15+ Years of Service", "98% Patient Satisfaction". Trust-building numbers. Education: "12,000+ Graduates", "94% Job Placement Rate", "200+ Industry Partners", "50+ Courses Available". Focus on outcomes. Fitness: "5,000+ Active Members", "30+ Certified Trainers", "100+ Weekly Classes", "4.9 App Store Rating". Combine community size with service breadth. Combines well with: HeroSection above (hero states the promise, stats prove it), or LogoGrid below (numbers → named clients).',
  },
  TeamSection: {
    description: 'Team member cards with avatars.',
    shortDescription: 'Team member cards with roles',
    propsSignature: 'heading (string), subtext (string?), members (array of {name, role, avatarUrl?})',
    recommendedDefaults: '3-4 members, animation: "stagger", heading: "Meet the Team" or "Our Leadership", subtext: 1-sentence team culture statement',
    variantTips: 'Agency/Law firm: Show full leadership team with formal titles. Use 4 members: e.g. "James Harrison, Managing Partner", "Elena Vasquez, Director of Strategy", "David Kim, Head of Creative", "Rachel Thompson, VP of Client Relations". Each role should be specific — not just "Team Member". Startup: 3-4 founders with dual roles: "Alex Rivera, CEO & Co-Founder", "Priya Patel, CTO & Co-Founder", "Marcus Johnson, Head of Product". Include a brief subtext about the founding story: "Founded in 2022 by three engineers who saw a better way." Healthcare: Doctors with specialties — "Dr. Sarah Mitchell, Chief of Cardiology", "Dr. Robert Chen, Orthopedic Surgery", "Dr. Amara Osei, Pediatric Medicine". Include credentials in the role field. Restaurant: Chef and key staff — "Chef Marco Bellini, Executive Chef & Owner", "Sofia Laurent, Pastry Chef", "Tom Nguyen, General Manager". Real Estate: Agents with market specialties — "Jennifer Walsh, Luxury Homes Specialist", "Carlos Mendez, Commercial Real Estate". Always use realistic, diverse names. Use avatarUrls from /stock/team/ paths. Combines well with: StatsSection above (company numbers → the people behind them), or TestimonialSection as an alternate trust signal.',
  },
  BlogSection: {
    description: 'Blog post cards grid.',
    shortDescription: 'Blog post preview cards',
    propsSignature: 'heading (string), posts (array of {title, excerpt, imageUrl?, date, href}), columns (2|3)',
    recommendedDefaults: 'columns: 3, animation: "stagger", 3 posts, heading: "Latest from Our Blog" or "Insights & Resources"',
    variantTips: 'Blog/Media: 3 posts with thumbnails, realistic dates within the past month. Titles should be click-worthy but honest: "5 Design Trends Dominating 2026" with excerpt "From brutalist typography to AI-generated layouts, here are the visual directions shaping the web this year." Use imageUrl from /stock/blog/ paths. SaaS: "Latest from Our Blog" with educational content marketing titles — "How We Reduced API Latency by 60%", "The Complete Guide to SOC 2 Compliance", "Why Your Team Needs Real-Time Analytics". Excerpts should promise a specific takeaway. E-commerce: Content that drives purchases — "Spring Style Guide: 10 Must-Have Looks", "How to Choose the Right Running Shoe", "Customer Spotlight: How Maria Built Her Dream Wardrobe". Restaurant: Food and lifestyle content — "Behind the Scenes: A Night in Our Kitchen", "Wine Pairing Guide for Spring", "Chef Marco Shares His Secret Pasta Recipe". Education: Outcome-focused posts — "How Online Learning Changed Sarah\'s Career Path", "5 Study Techniques Backed by Science", "What Employers Really Look for in 2026". Always use realistic dates (e.g. "March 28, 2026"), 2-line excerpts, and relevant thumbnails. Combines well with: NewsletterSignup below (read a post → subscribe for more), or CTASection as a content-to-conversion bridge.',
  },
  LogoGrid: {
    description: 'Logo/partner grid with images.',
    shortDescription: 'Partner/client logo grid',
    propsSignature: 'heading (string?), logos (array of {name, imageUrl})',
    recommendedDefaults: '5-6 logos, animation: "fade-up", heading: "Trusted by Industry Leaders" or "Powering Teams at"',
    variantTips: 'SaaS: Use heading "Trusted by 10,000+ Teams Including" followed by 5-6 recognizable tech company names — "TechCorp", "InnovateLabs", "DataSync", "CloudPeak", "NexGen Solutions". If the business is B2B, these logos are your strongest social proof. Agency: Heading "Brands We Have Worked With" with 6 client logos. Mix industries to show versatility — one tech, one finance, one healthcare, one retail, one food, one startup. E-commerce: "As Featured In" with media outlet names — "TechCrunch", "Forbes", "Wired", "The Verge", "Product Hunt". This builds authority faster than customer counts. Healthcare: "Partner Institutions" with hospital or research org names. Education: "Where Our Graduates Work" with company names. Use placeholder company names that sound real — avoid "Company A" or "Client 1". Combines well with: StatsSection above (quantified proof → named clients), or TestimonialSection below (client names → client stories).',
  },
  ContactForm: {
    description: 'Contact form section.',
    shortDescription: 'Contact form with fields',
    propsSignature: 'heading (string), subtext (string?), showPhone (boolean), showCompany (boolean), buttonText (string)',
    recommendedDefaults: 'showPhone: true, showCompany: true, buttonText: "Send Message", heading: "Get in Touch", subtext: "We would love to hear from you. Fill out the form below and we will get back to you within 24 hours."',
    variantTips: 'SaaS: Set showCompany: true, buttonText: "Book a Demo". Heading: "See It in Action" or "Request a Demo". Subtext should mention what happens next: "Fill out the form and our team will schedule a personalized 30-minute walkthrough." Restaurant: Set showPhone: true, showCompany: false, buttonText: "Reserve a Table". Heading: "Make a Reservation". Subtext: "Call us at (555) 123-4567 or fill out the form below for parties of 6 or more." Healthcare: Set showPhone: true, buttonText: "Request Appointment". Heading: "Schedule Your Visit". Subtext: "Tell us about your needs and we will match you with the right specialist." E-commerce: Set showCompany: false, buttonText: "Contact Support". Heading: "How Can We Help?" Subtext about response time. Service businesses (plumbing, legal, accounting): Show ALL fields (name, email, phone, company, message). buttonText: "Get a Free Quote" or "Request Consultation". Always include a reassuring subtext about response time. Combines well with: FAQSection above (FAQ answers common questions first, contact form catches the rest), or with a Map embed via CustomSection below.',
  },
  HeaderNav: {
    description: 'Navigation bar with logo, links, and CTA.',
    shortDescription: 'Site header navigation bar',
    propsSignature: 'logo (string), links (array of {label, href}), ctaText (string?), ctaHref (string?), sticky (boolean)',
    recommendedDefaults: 'sticky: true, 4-5 links with labels matching page section headings, logo: business name, ctaText: primary action verb phrase, ctaHref: "#" or section anchor',
    variantTips: 'Always match link labels to actual section headings on the page — if the page has a "Features" section, the nav link should be "Features" (not "Solutions" or "What We Do"). SaaS: logo = company name, links: ["Features", "Pricing", "About", "Blog"], ctaText: "Get Started" or "Start Free Trial". The CTA should mirror the HeroSection primary CTA for consistency. Restaurant: links: ["Menu", "Gallery", "About", "Contact"], ctaText: "Reserve a Table". E-commerce: links: ["Shop", "Collections", "About", "Contact"], ctaText: "Shop Now". Portfolio: Minimal links: ["Work", "About", "Contact"], ctaText: "Hire Me". Healthcare: links: ["Services", "Our Team", "Patient Resources", "Contact"], ctaText: "Book Appointment". Education: links: ["Programs", "Admissions", "Campus Life", "Contact"], ctaText: "Apply Now". Keep link labels short (1-2 words). This is the first thing users see — it sets navigation expectations for the entire page. Combines well with: FooterSection (mirror nav links in footer for consistency, but add more columns like Legal, Support).',
  },
  FooterSection: {
    description: 'Multi-column footer with links.',
    shortDescription: 'Multi-column site footer',
    propsSignature: 'logo (string?), description (string?), linkGroups (array of {title, links: array of {label, href}}), copyright (string?)',
    recommendedDefaults: '3-4 linkGroups, dark background variant, copyright: "© 2026 BusinessName. All rights reserved.", description: 1-sentence company mission, logo: same as HeaderNav',
    variantTips: 'Always mirror the HeaderNav links in one of the footer linkGroups for consistency. SaaS: 4 columns — "Product" (Features, Pricing, Integrations, Changelog), "Resources" (Documentation, API Reference, Blog, Community), "Company" (About, Careers, Press, Contact), "Legal" (Privacy Policy, Terms of Service, Cookie Policy, GDPR). Include description: "We help teams build better software, faster." Restaurant: 3 columns — "Menu" (Lunch, Dinner, Drinks, Specials), "Visit Us" (Locations, Hours, Reservations, Private Events), "Connect" (Contact, Careers, Press, Gift Cards). Description: "Serving authentic Italian cuisine since 2010." E-commerce: "Shop" (New Arrivals, Best Sellers, Sale, Gift Cards), "Help" (Shipping, Returns, FAQ, Size Guide), "Company" (About, Careers, Affiliates, Press). Description: "Quality products, delivered with care." Agency: "Services" (Web Design, Branding, SEO, Development), "Company" (About, Team, Careers, Blog), "Connect" (Contact, Twitter, LinkedIn, Dribbble). Always use current year in copyright. Link hrefs can be "#" for single-page sites. Combines well with: HeaderNav (footer mirrors header structure), NewsletterSignup above footer (last conversion chance before user scrolls to bottom).',
  },
  TextBlock: {
    description: 'Rich text content block.',
    shortDescription: 'Rich text content block',
    propsSignature: 'content (HTML string), align ("left"|"center"|"right"), maxWidth ("sm"|"md"|"lg"|"xl"|"full")',
    recommendedDefaults: 'align: "left", maxWidth: "md" for body text, "lg" for wider content',
    variantTips: 'Use for editorial content, company stories, policy pages, or any section that needs rich formatting (paragraphs, lists, bold/italic). About pages: align "left" with maxWidth "md" — keep lines readable at 65-75 characters. Use <h3> subheadings, <p> paragraphs, and <ul>/<li> lists for structure. Mission statements: align "center" with maxWidth "sm" — short, impactful text centered on the page. Legal/policy: align "left" with maxWidth "lg" — needs more width for legal text readability. Use <strong> for key terms. Combines well with: ImageBlock before or after for visual break, or HeadingBlock above for section title.',
  },
  ImageBlock: {
    description: 'Single image with optional styling.',
    shortDescription: 'Single image with styling options',
    propsSignature: 'src (string), alt (string), width (string?), borderRadius ("none"|"sm"|"md"|"lg"|"full")',
    recommendedDefaults: 'borderRadius: "lg" for modern look, width: "100%" for full-width images or "600px" for centered, alt: descriptive text for accessibility',
    variantTips: 'Use for standalone hero images, product close-ups, team photos, location shots, or visual dividers between sections. Product showcase: Single centered image with borderRadius "lg", width "600px". Show the flagship product against a clean background. Office/location: Full-width image with borderRadius "none", showing the workspace or storefront. Creates a visual break between dense text sections. Portrait/team: width "400px" with borderRadius "full" for circular headshots. Always provide meaningful alt text describing what is in the image. Combines well with: TextBlock on opposite side for split layouts, or Spacer above/below for breathing room.',
  },
  Spacer: {
    description: 'Vertical spacing element.',
    shortDescription: 'Vertical spacing element',
    propsSignature: 'height (number, 8-200)',
    recommendedDefaults: 'height: 48 for standard section gap, 24 for intra-section spacing, 96 for dramatic section separation',
    variantTips: 'Use strategically to create visual rhythm — not every gap should be the same. After a dense section (like FeaturesGrid with many cards): use height 64-96 for generous breathing room. Between closely related sections (StatsSection → TestimonialSection): use height 32-48 for subtle separation. Within a section group (HeroSection → AnnouncementBar): use height 16-24 for tight visual connection. Never use more than 2 Spacers in a row — if you need 200px of space, use a Spacer with height 120 followed by a different component instead.',
  },
  ColumnsLayout: {
    description: 'Multi-column layout with slot-based content.',
    shortDescription: 'Multi-column layout container',
    propsSignature: 'columns (2|3|4), gap (number)',
    recommendedDefaults: 'columns: 2, gap: 24 for side-by-side content, gap: 32 for feature comparison',
    variantTips: 'Use to create side-by-side arrangements that other components do not cover. Two-column split: columns 2, gap 32 — ideal for an image on the left + text content on the right, or a quote + attribution. Three-column features: columns 3, gap 24 — when FeaturesGrid does not fit the visual style needed. Content + sidebar: columns 2, gap 48 — main content takes 2/3 width, sidebar 1/3. Compare two options: columns 2, gap 16 — tight comparison layout for before/after, us vs competitors. Keep in mind that most standard layouts (features grid, pricing cards) have dedicated components — use ColumnsLayout when you need a custom arrangement.',
  },
  NewsletterSignup: {
    description: 'Email subscription section with heading and button.',
    shortDescription: 'Email subscription form',
    propsSignature: 'heading (string), subtext (string?), buttonText (string), placeholder (string?)',
    recommendedDefaults: 'buttonText: "Subscribe", placeholder: "Enter your email address", animation: "fade-up", heading: benefit-driven (e.g. "Stay in the Loop")',
    variantTips: 'The subtext is CRITICAL — it is your value exchange. Tell the user exactly what they get. SaaS/Blog: Heading "Get Weekly Insights" with subtext "Join 5,000+ product managers who receive our weekly roundup of growth strategies and industry analysis. No spam, unsubscribe anytime." buttonText: "Subscribe". E-commerce: Heading "Get 15% Off Your First Order" with subtext "Sign up for exclusive deals, early access to new arrivals, and style guides delivered to your inbox." buttonText: "Get My Discount". Restaurant: Heading "Join Our Inner Circle" with subtext "Be the first to know about seasonal menus, wine events, and exclusive chef\'s table invitations." buttonText: "Join Now". Fitness: Heading "Get Your Free Workout Plan" with subtext "Subscribe and receive a personalized 4-week training program plus weekly fitness tips from our certified trainers." buttonText: "Send My Plan". Education: Heading "Stay Updated on New Courses" with subtext "Get notified about new programs, scholarship opportunities, and career resources." buttonText: "Keep Me Informed". Combines well with: FooterSection below (newsletter is the last engagement before footer), or CTASection above as a stronger conversion alternative.',
  },
  Gallery: {
    description: 'Image gallery grid with lightbox-style layout.',
    shortDescription: 'Image gallery grid',
    propsSignature: 'heading (string?), images (array of {src, alt}), columns (2|3|4)',
    recommendedDefaults: 'columns: 3, animation: "stagger", 6-8 images, heading: "Our Gallery" or descriptive (e.g. "From Our Kitchen")',
    variantTips: 'Use 6+ images for real visual impact — 3-4 images looks sparse in a grid. Restaurant/Food: 6-8 appetizing food photos in 3 columns. heading "From Our Kitchen". Use /stock/food/ paths. Alt text should describe each dish: "Seared salmon with asparagus and lemon butter sauce". Real estate: 8-12 property photos in 4 columns showing different rooms, exterior, and neighborhood. heading "Property Gallery". Portfolio: 6 project screenshots in 3 columns with 2:1 aspect ratio feel. heading "Selected Work". Use /stock/blog/ or /stock/features/ paths. Travel: 6-9 destination photos in 3 columns. heading "Destinations We Love". Use /stock/travel/ paths. Fashion: 6 lifestyle/product photos. heading "Lookbook". Fitness: 6 facility/class photos. heading "Our Facilities". Always provide descriptive alt text for each image — not "image 1" but "Modern open-plan office with natural light and collaborative workspaces". Combines well with: FeatureShowcase for a single featured image + details, or CustomSection for a masonry/bento-grid layout.',
  },
  SocialProof: {
    description: 'Trust indicators with stats or user counts.',
    shortDescription: 'Trust indicators and social proof',
    propsSignature: 'heading (string), stats (array of {value, label})',
    recommendedDefaults: '3-4 trust indicators, heading: "Why Teams Trust Us" or "Proven Results"',
    variantTips: 'More concise than StatsSection — use for trust badges, certification counts, and credibility markers rather than performance metrics. SaaS: heading "Trusted by Developers Worldwide" with stats: "10,000+ GitHub Stars", "500+ Contributors", "SOC 2 Certified", "99.99% Uptime". E-commerce: heading "Shop with Confidence" with stats: "50,000+ Happy Customers", "4.8/5 Average Rating", "Free Returns Within 30 Days", "Secure SSL Checkout". Service business: heading "Our Track Record" with stats: "500+ Projects Delivered", "98% Client Retention", "15+ Years in Business", "24/7 Support". This is a lighter alternative to StatsSection — use it when you need trust signals without the visual weight of animated counters. Combines well with: LogoGrid below (social proof stats → named clients), or placed right after HeroSection for immediate trust-building.',
  },
  ComparisonTable: {
    description: 'Side-by-side plan/feature comparison.',
    shortDescription: 'Feature comparison matrix',
    propsSignature: 'heading (string), plans (array of {name, features: array of {value}})',
    recommendedDefaults: '2-3 plans compared, 6-8 features, heading: "Compare Plans" or "See How We Stack Up"',
    variantTips: 'Use when you need a detailed feature-by-feature comparison — PricingTable handles pricing display, this handles feature matrix. SaaS: Compare "Basic vs Pro vs Enterprise" across 8 features using checkmarks ("Yes"), crosses ("—"), or specific values ("5 users", "Unlimited"). heading: "Compare Plans". Feature rows: "Users", "Storage", "API Calls", "Custom Domain", "Priority Support", "SSO", "Audit Logs", "SLA". E-commerce product comparison: heading "How We Compare" comparing your product vs 2 competitors on features like "Battery Life", "Screen Size", "Weight", "Warranty". Use specific values not just yes/no. Service tiers: heading "What is Included" comparing service packages. Use "Yes" / "—" or specific deliverables. Each plan should have a name array matching PricingTable tier names for consistency. Combines well with: PricingTable above (pricing overview → detailed comparison), or FAQSection below to explain specific differences.',
  },
  ProductCards: {
    description: 'Product showcase cards with prices.',
    shortDescription: 'Product cards with pricing',
    propsSignature: 'heading (string?), products (array of {title, price, image, href, description?}), columns (2|3|4)',
    recommendedDefaults: 'columns: 3, hoverEffect: "lift", animation: "stagger", 4-6 products, heading: "Our Products" or "Shop Best Sellers"',
    variantTips: 'E-commerce: 4-6 products with realistic prices formatted as "$49.99" (not "$50"). Each product needs a compelling title, 1-2 sentence description, image, and price. Example: title "Wireless Noise-Cancelling Headphones", price "$249.00", description "Premium sound with 30-hour battery life and adaptive noise cancellation for immersive listening." Use /stock/fashion/ or relevant category paths. Fashion: hoverEffect "zoom" with lifestyle images showing products in use. descriptions should evoke style and feeling: "Effortless sophistication meets all-day comfort in this Italian wool blazer." columns: 3 for clean grid. Restaurant/Food: columns: 3 with appetizing descriptions and dish prices. title "Pan-Seared Chilean Sea Bass", price "$38", description "Wild-caught sea bass with saffron risotto, roasted fennel, and citrus beurre blanc." heading: "Chef\'s Selections" or "Signature Dishes". Fitness: columns: 3 showing equipment or membership packages with prices. heading: "Popular Programs". Each card: program name, price per month, what is included. SaaS: columns: 3 showing product tiers as cards with price and key benefit in description. Combines well with: ComparisonTable below for detailed feature breakdown, or CTASection above driving traffic to the product section.',
  },
  FeatureShowcase: {
    description: 'Split-layout feature highlight with image + details.',
    shortDescription: 'Split image + feature layout',
    propsSignature: 'heading (string), description (string?), image (string), features (array of {title, description})',
    recommendedDefaults: 'animation: "fade-up", 2-3 features with specific titles, image: relevant screenshot or photo, heading: product/feature name, description: 2-sentence overview',
    variantTips: 'This is your go-to component for a deep-dive on a SINGLE key feature or product. It gives you 50% image + 50% text — more focused than FeaturesGrid. SaaS: heading "Real-Time Analytics Dashboard", image from /stock/features/analytics-dashboard.webp, description "Monitor every metric as it happens with sub-second latency. Our dashboard updates in real time so you never miss a critical change." features: ["Live Data Streams" — "Connect 50+ data sources and watch your metrics update in real time", "Custom Alerts" — "Set threshold-based notifications delivered via email, Slack, or SMS", "Historical Comparison" — "Compare current performance against any previous period with one click"]. Real estate: heading "Luxury Waterfront Estate", image from /stock/realestate/luxury-home.webp, features highlighting property details: "5 Bedrooms, 4.5 Bathrooms", "Private Dock with Ocean Access", "Chef\'s Kitchen with Viking Appliances". Education: heading "State-of-the-Art Learning Platform", image from /stock/education/classroom.webp, features about the platform experience. Use 2-3 features max — this is a focused spotlight, not a grid. Combines well with: FeaturesGrid above (overview of all features → deep-dive on the most important one), or Gallery below for more visual proof.',
  },
  CountdownTimer: {
    description: 'Countdown timer in events/offers.',
    shortDescription: 'Countdown timer widget',
    propsSignature: 'heading (string), endDate (string,ISO date)',
    recommendedDefaults: 'endDate: 7-30 days in the future from generation date, heading: urgency-driven ("Launch Special Ends In" or "Early Bird Pricing Closes In")',
    variantTips: 'Creates urgency for time-sensitive offers — use sparingly for maximum impact. SaaS product launch: heading "Beta Access Closes In", endDate 14 days out. Drives FOMO for early adopters. E-commerce flash sale: heading "Flash Sale Ends In", endDate 2-3 days out. Pair with ProductCards showing discounted items. Event/conference: heading "Early Bird Registration Ends In", endDate 30 days before event. Combine with CTASection for "Register Now" button. Course launch: heading "Enrollment Closes In", endDate 7 days out. Creates scarcity for cohort-based programs. Set endDate to a realistic future date — ISO format like "2026-05-15T23:59:59Z". Never set it in the past. Combines well with: AnnouncementBar above pointing to the countdown, CTASection below for the action button, or PricingTable with time-limited discount.',
  },
  AnnouncementBar: {
    description: 'Top announcement bar with message and optional CTA.',
    shortDescription: 'Top announcement bar',
    propsSignature: 'message (string), ctaText (string?), ctaHref (string?), variant ("primary"|"dark"|"gradient")',
    recommendedDefaults: 'variant: "gradient", include ctaText with a link, message: under 50 chars for readability',
    variantTips: 'Place at the very top of the page (before HeaderNav) for maximum visibility. Keep the message under 50 characters — it needs to be scannable in 2 seconds. E-commerce: message "Free Shipping on Orders Over $50", ctaText "Shop Now", variant "gradient" using brand colors. Rotate messages seasonally. SaaS: message "New: AI-Powered Analytics Now Available", ctaText "Try It Free", variant "primary". Announce feature launches. Restaurant: message "Happy Hour Every Friday 5-7 PM — Half Price Cocktails", ctaText "See Menu", variant "dark". Event: message "Early Bird Tickets Available — Save 40%", ctaText "Register Now", variant "gradient". Create urgency. Healthcare: message "Now Accepting New Patients — Book Online", ctaText "Schedule Visit", variant "primary". Service business: message "Get a Free Quote Within 24 Hours", ctaText "Request Quote", variant "gradient". Always include ctaText — a bar without a CTA is wasted space. Combines well with: HeaderNav immediately below (announcement → navigation → content flow).',
  },
  Banner: {
    description: 'Full-width banner with heading, subtext, and CTA.',
    shortDescription: 'Full-width promotional banner',
    propsSignature: 'heading (string), subtext (string?), ctaText (string), ctaHref (string), variant ("info"|"warning"|"success"|"gradient")',
    recommendedDefaults: 'variant: "gradient", animation: "fade-up", heading: concise action-oriented text, ctaText: short verb phrase (2-3 words)',
    variantTips: 'More compact than CTASection — use for inline promotional messages, alerts, or mid-page calls-to-action that should not break the visual flow. Promo/sale: variant "gradient" with urgency heading "Limited Time: 30% Off Everything", subtext "Use code SAVE30 at checkout. Ends Sunday.", ctaText "Shop Sale". Event: variant "info" with heading "Join Us at TechConf 2026 — June 15-17", subtext "Early bird pricing available until May 1.", ctaText "Register". Product launch: variant "success" with heading "Version 3.0 is Here — Dark Mode, Faster Sync, New Integrations", subtext "Update now to get all the new features.", ctaText "What\'s New". Warning/alert: variant "warning" for maintenance notices, deadline reminders. Keep heading under 60 chars, subtext under 100 chars. The banner should be a quick visual interruption, not a full section. Combines well with: ProductCards above (banner promotes what the products show), or CountdownTimer above for time-limited urgency.',
  },
  HeadingBlock: {
    description: 'Standalone heading element.',
    shortDescription: 'Standalone heading element',
    propsSignature: 'text (string), level (1|2|3|4|5|6), align ("left"|"center"|"right")',
    recommendedDefaults: 'level: 2 for section titles, align: "center", text: concise (3-8 words)',
    variantTips: 'Use as section dividers or standalone section headers when a full component heading is not needed. Section divider: level 2, align "center" between two content-heavy sections to create visual separation. Sub-section label: level 3, align "left" to introduce a specific content area. Page title: level 1, align "center" at the top of content pages. Keep text concise — headings should be 3-8 words maximum.',
  },
  RichTextBlock: {
    description: 'Advanced rich text with formatting.',
    shortDescription: 'Advanced rich text block',
    propsSignature: 'content (HTML string), align ("left"|"center"|"right")',
    recommendedDefaults: 'align: "left", content: well-structured HTML with semantic tags',
    variantTips: 'More formatting options than TextBlock — use for content that needs tables, blockquotes, code blocks, or complex nested lists. Documentation/pages: align "left" with <table>, <pre><code>, and <blockquote> elements for technical content. Long-form articles: Use <h2>, <h3>, <p>, <ul>, <ol> for proper document structure. Keep HTML clean and semantic — avoid inline styles since Tailwind handles styling.',
  },
  ButtonBlock: {
    description: 'Standalone button element.',
    shortDescription: 'Standalone button element',
    propsSignature: 'label (string), href (string), variant ("primary"|"outline"|"ghost")',
    recommendedDefaults: 'variant: "primary", label: short action phrase (2-4 words)',
    variantTips: 'Use for inline CTAs that do not need a full CTASection wrapper. variant "primary": filled background button for main actions — "Get Started", "Buy Now", "Subscribe". variant "outline": bordered button for secondary actions — "Learn More", "View Details", "See All Posts". variant "ghost": transparent button for subtle navigation — "Skip", "Back to Top", "Dismiss". Place inside ColumnsLayout or Flex for button groups (e.g. "Download PDF" + "View Online"). Combines well with: TextBlock above for context, or Flex with direction "row" and gap 16 for multi-button layouts.',
  },
  CardBlock: {
    description: 'Card container with title and content.',
    shortDescription: 'Card container with content',
    propsSignature: 'title (string), content (string), image (string?)',
    recommendedDefaults: 'image: relevant stock photo path, title: 3-6 words, content: 2-3 sentences',
    variantTips: 'Flexible card for content that does not fit specialized card components (FeaturesGrid, ProductCards, etc.). Use cases: case study cards (title: client name, content: results summary, image: project screenshot), service cards (title: service name, content: what is included), team highlight cards, testimonial highlight cards. Include image when possible — cards with images get 40% more engagement. Keep content to 2-3 sentences max. Combines well with: Grid container for multi-card layouts, or FeatureShowcase for a single highlighted card.',
  },
  SectionBlock: {
    description: 'Wrapper section with background and padding.',
    shortDescription: 'Section wrapper with background',
    propsSignature: 'background ("white"|"muted"|"dark"|"gradient"), padding ("sm"|"md"|"lg")',
    recommendedDefaults: 'background: "muted" to create visual separation, padding: "lg" for generous spacing',
    variantTips: 'Use as a visual container to group related components with a shared background. Alternation pattern for a professional page: white (HeroSection) → muted (FeaturesGrid) → white (StatsSection) → dark (TestimonialSection) → muted (PricingTable) → gradient (CTASection). Use background "dark" when you want to create dramatic contrast — ensure all child text is light-colored. Use "gradient" for section dividers between major page areas. padding "sm" for tight utility sections, "md" for standard content, "lg" for hero-level sections with breathing room.',
  },
  Blank: {
    description: 'Empty container for free-form content.',
    shortDescription: 'Empty container',
    propsSignature: '(none)',
    recommendedDefaults: 'Use as a structural placeholder or divider',
    variantTips: 'Use sparingly — prefer Spacer for vertical gaps or SectionBlock for styled containers. Blank is useful as a structural wrapper when you need an unstyled container that does not add any visual weight.',
  },
  Flex: {
    description: 'Flex layout container.',
    shortDescription: 'Flexbox layout container',
    propsSignature: 'direction ("row"|"column"), gap (number), align ("start"|"center"|"end")',
    recommendedDefaults: 'direction: "row", gap: 16, align: "center"',
    variantTips: 'Use for horizontal or vertical arrangements that need alignment control beyond what ColumnsLayout offers. Button groups: direction "row", gap 12, align "center" — place multiple ButtonBlocks inside. Icon + text pairs: direction "row", gap 8, align "center" — for inline label/icon combinations. Vertical stack with alignment: direction "column", gap 16, align "start" — for form fields or content blocks that should left-align. Use gap 8-16 for tight layouts, 24-32 for comfortable spacing.',
  },
  Grid: {
    description: 'CSS Grid container.',
    shortDescription: 'CSS Grid container',
    propsSignature: 'columns (number), gap (number)',
    recommendedDefaults: 'columns: 2 or 3, gap: 24',
    variantTips: 'Use for uniform grid layouts where every cell has the same width. Card grids: columns 3, gap 24 — for uniform CardBlock layouts. Image grids: columns 4, gap 16 — for thumbnail galleries. Dashboard-style: columns 2, gap 32 — for stat or metric cards of equal size. For non-uniform layouts (different cell sizes), use ColumnsLayout or CustomSection instead. Keep columns between 2-4 for responsive behavior.',
  },
  CustomSection: {
    description: 'Renders raw HTML with Tailwind CSS classes. Use for unique, creative layouts that don\'t fit other component types. AI generates full HTML with Tailwind classes — unlimited design freedom.',
    shortDescription: 'Custom HTML/Tailwind section for unique designs',
    propsSignature: 'html (string — full HTML with Tailwind classes), css? (string — optional scoped CSS), preview? (string — short description), minHeight? (string — default "200px")',
    recommendedDefaults: 'preview: short 3-5 word description of what the section shows (e.g. "Process Timeline", "Google Map Embed"), minHeight: "300px" for content-rich sections, html: well-structured semantic HTML with Tailwind utility classes',
    variantTips: 'This is your escape hatch for ANY design that standard components cannot express. The html prop accepts full HTML with Tailwind classes — be creative and specific. PROCESS TIMELINE: Use a horizontal or vertical timeline with alternating content. Example structure: a flex container with circular numbered nodes connected by lines, each node containing a title, description, and date. Use Tailwind classes like "flex items-center", "w-10 h-10 rounded-full bg-blue-500 text-white flex items-center justify-center font-bold", "border-l-2 border-blue-200 pl-6 ml-4" for a vertical timeline. Works great for "How It Works" sections (SaaS onboarding, service process, order steps). MAP EMBED: Embed a Google Maps iframe showing a business location. Use html: \'<div class="w-full h-96 rounded-xl overflow-hidden"><iframe src="https://www.google.com/maps/embed?pb=..." width="100%" height="100%" style="border:0" allowfullscreen loading="lazy"></iframe></div>\'. Perfect for ContactForm companions on restaurant, retail, and service business pages. VIDEO BACKGROUND HERO: A hero section with a looping background video and overlaid text. Use a <video> element with autoplay, muted, loop attributes inside a relative container with absolute-positioned text overlay. Great for creative agencies and entertainment sites. COMPARISON SLIDER (Before/After): Use a split-screen layout with a draggable divider between two images. Requires CSS for the slider mechanism. Ideal for renovation services, fitness transformations, design portfolios. BENTO GRID: A CSS Grid layout with cells of varying sizes (some spanning 2 columns or 2 rows) creating an asymmetric, modern layout. Use "grid grid-cols-3 gap-4" with items using "col-span-2" or "row-span-2". Popular in SaaS landing pages for showcasing multiple features in one visually dynamic section. PRICING COMPARISON BAR: A horizontal bar chart showing how your price compares to competitors. Use flex items with width percentages and color fills. ICON GRID WITH HOVER EFFECTS: A grid of SVG icons with Tailwind hover transitions (scale, color change, shadow). Use "hover:scale-110 hover:shadow-lg transition-all duration-300". TEAM ORGANIZATIONAL CHART: A hierarchical layout showing company structure with connecting lines. TESTIMONIAL WALL: A masonry-style layout with testimonials of varying lengths creating visual interest. Always set preview to describe what the section contains — this helps in the editor UI. Use Tailwind utilities extensively: prefer "bg-gradient-to-r from-blue-600 to-purple-600" over custom CSS. Keep custom CSS minimal — only use the css prop for animations or complex selectors Tailwind cannot express. Combines well with: ANY component — CustomSection fills the gaps between standard components. Common pairings: CustomSection (map embed) + ContactForm, CustomSection (process timeline) + FeaturesGrid, CustomSection (video hero) instead of HeroSection.',
  },
};

/** Set of all valid Puck component type names — derived from catalog keys. */
export const VALID_COMPONENT_TYPES: ReadonlySet<string> = new Set(Object.keys(COMPONENT_CATALOG));
