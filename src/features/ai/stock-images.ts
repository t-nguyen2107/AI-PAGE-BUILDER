/**
 * Stock Image Mapper — maps business types to relevant stock images.
 *
 * All images are WebP, served from `/stock/{path}`.
 * Reference: STOCK_IMAGES.md
 */

// ─── Stock categories with all available images ───────────────────────────

export const STOCK_IMAGES = {
  hero: [
    'hero/office-modern.webp',
    'hero/tech-dark.webp',
    'hero/gradient-purple.webp',
    'hero/startup-team.webp',
    'hero/coding-screen.webp',
    'hero/team-meeting.webp',
  ],
  team: [
    'team/person-1.webp',
    'team/person-2.webp',
    'team/person-3.webp',
    'team/person-4.webp',
    'team/person-5.webp',
    'team/person-6.webp',
  ],
  testimonials: [
    'testimonials/avatar-1.webp',
    'testimonials/avatar-2.webp',
    'testimonials/avatar-3.webp',
    'testimonials/avatar-4.webp',
  ],
  features: [
    'features/analytics-dashboard.webp',
    'features/data-charts.webp',
    'features/collaboration.webp',
  ],
  cta: [
    'cta/gradient-blue.webp',
    'cta/abstract-waves.webp',
  ],
  blog: [
    'blog/writing.webp',
    'blog/notebook.webp',
    'blog/laptop-coffee.webp',
  ],
  food: [
    'food/meal-table.webp',
    'food/pizza.webp',
    'food/pancakes.webp',
    'food/salad.webp',
    'food/steak.webp',
    'food/sushi.webp',
    'food/burger.webp',
    'food/healthy-bowl.webp',
    'food/toast-breakfast.webp',
    'food/vegetables.webp',
  ],
  drink: [
    'drink/coffee-cup.webp',
    'drink/coffee-shop.webp',
    'drink/cocktail.webp',
    'drink/wine.webp',
    'drink/orange-juice.webp',
    'drink/tea-matcha.webp',
  ],
  family: [
    'family/family-together.webp',
    'family/family-walking.webp',
    'family/family-home.webp',
    'family/parents-baby.webp',
    'family/grandparents.webp',
  ],
  travel: [
    'travel/beach-sunset.webp',
    'travel/paris-eiffel.webp',
    'travel/tropical-beach.webp',
    'travel/mountain-lake.webp',
    'travel/temple-asia.webp',
    'travel/ocean-view.webp',
    'travel/road-trip.webp',
    'travel/santorini.webp',
    'travel/camping-tent.webp',
    'travel/sunrise-mountain.webp',
  ],
  people: [
    'people/friends-laughing.webp',
    'people/group-study.webp',
    'people/woman-portrait.webp',
    'people/man-portrait.webp',
    'people/woman-outdoor.webp',
    'people/concert-crowd.webp',
    'people/artist-painting.webp',
  ],
  children: [
    'children/kid-playing.webp',
    'children/kid-drawing.webp',
    'children/kids-running.webp',
    'children/kid-reading.webp',
    'children/toddler-smile.webp',
    'children/baby-cute.webp',
  ],
  nature: [
    'nature/forest.webp',
    'nature/morning-mist.webp',
    'nature/green-field.webp',
    'nature/waterfall.webp',
    'nature/autumn-leaves.webp',
    'nature/sunset-ocean.webp',
    'nature/mountain-peak.webp',
  ],
  fitness: [
    'fitness/gym-workout.webp',
    'fitness/yoga-pose.webp',
    'fitness/running.webp',
    'fitness/cycling.webp',
    'fitness/swimming.webp',
  ],
  pets: [
    'pets/golden-dog.webp',
    'pets/cat-orange.webp',
    'pets/dog-puppy.webp',
    'pets/kitten.webp',
    'pets/two-dogs.webp',
  ],
  education: [
    'education/books-library.webp',
    'education/classroom.webp',
    'education/students-group.webp',
    'education/study-desk.webp',
  ],
  medical: [
    'medical/doctor.webp',
    'medical/nurse.webp',
    'medical/surgery-team.webp',
    'medical/pharmacy.webp',
  ],
  realestate: [
    'realestate/house-modern.webp',
    'realestate/luxury-home.webp',
    'realestate/apartment-interior.webp',
    'realestate/living-room.webp',
    'realestate/kitchen.webp',
  ],
  fashion: [
    'fashion/fashion-show.webp',
    'fashion/shopping-bags.webp',
    'fashion/clothing-rack.webp',
    'fashion/accessories.webp',
  ],
} as const;

export type StockCategory = keyof typeof STOCK_IMAGES;

// ─── Business type → preferred stock categories ───────────────────────────

export const BUSINESS_STOCK_MAP: Record<string, StockCategory[]> = {
  // Food & drink
  bakery: ['food', 'drink'],
  restaurant: ['food', 'drink'],
  cafe: ['drink', 'food'],
  coffee: ['drink', 'food'],
  bar: ['drink', 'food'],
  food: ['food', 'drink'],

  // Health & wellness
  fitness: ['fitness'],
  gym: ['fitness'],
  yoga: ['fitness'],
  spa: ['nature', 'fitness'],
  wellness: ['nature', 'fitness'],

  // Medical
  medical: ['medical'],
  hospital: ['medical'],
  clinic: ['medical'],
  dental: ['medical'],
  pharmacy: ['medical'],

  // Education
  education: ['education'],
  school: ['education', 'children'],
  university: ['education'],
  course: ['education'],
  training: ['education'],

  // Travel
  travel: ['travel'],
  hotel: ['travel', 'realestate'],
  resort: ['travel'],
  tourism: ['travel'],

  // Real estate
  realestate: ['realestate'],
  property: ['realestate'],
  interior: ['realestate'],

  // Fashion
  fashion: ['fashion'],
  boutique: ['fashion'],
  clothing: ['fashion'],
  ecommerce: ['fashion', 'people'],

  // Family & kids
  family: ['family', 'children'],
  kids: ['children'],
  baby: ['children', 'family'],
  toys: ['children'],

  // Pets
  pets: ['pets'],
  petshop: ['pets'],
  veterinary: ['pets', 'medical'],

  // Tech & business
  tech: ['hero', 'features'],
  saas: ['hero', 'features'],
  startup: ['hero', 'people'],
  consulting: ['people', 'hero'],
  agency: ['people', 'hero'],
  corporate: ['hero', 'people'],

  // Creative
  art: ['people', 'nature'],
  music: ['people'],
  photography: ['nature', 'people'],
  design: ['hero', 'features'],

  // Default
  default: ['hero', 'people'],
};

// ─── Usage context → stock category mapping ──────────────────────────────

/** Maps template usage context to which stock category is relevant */
export const USAGE_STOCK_MAP: Record<string, StockCategory[]> = {
  hero: ['hero', 'food', 'travel', 'realestate', 'nature', 'fitness', 'medical', 'education'],
  team: ['team'],
  avatar: ['testimonials', 'team'],
  testimonial: ['testimonials'],
  features: ['features', 'food', 'fitness', 'education', 'medical'],
  cta: ['cta'],
  blog: ['blog'],
  gallery: ['food', 'travel', 'realestate', 'nature', 'fitness', 'fashion', 'pets', 'children'],
  about: ['people', 'team'],
};

// ─── Helper functions ─────────────────────────────────────────────────────

/** Get full path for a stock image */
export function stockPath(path: string): string {
  return `/stock/${path}`;
}

/** Get a random stock image from a specific category */
export function getRandomStock(category: StockCategory): string {
  const images = STOCK_IMAGES[category] as readonly string[];
  if (!images.length) return stockPath('hero/gradient-purple.webp');
  const idx = Math.floor(Math.random() * images.length);
  return stockPath(images[idx]);
}

/** Get N random stock images from a category (no duplicates) */
export function getRandomStocks(category: StockCategory, count: number): string[] {
  const images = [...STOCK_IMAGES[category]];
  const result: string[] = [];
  for (let i = 0; i < Math.min(count, images.length); i++) {
    const idx = Math.floor(Math.random() * images.length);
    result.push(stockPath(images[idx]));
    images.splice(idx, 1);
  }
  return result;
}

/** Get stock images relevant to a business type for a given usage context */
export function getStockForBusiness(
  businessType: string,
  usage: string,
  count: number = 1,
): string[] {
  // Find matching stock categories for the business type
  const businessCategories = BUSINESS_STOCK_MAP[businessType] ?? BUSINESS_STOCK_MAP.default ?? ['hero'];

  // Find matching stock categories for the usage context
  const usageCategories = USAGE_STOCK_MAP[usage] ?? ['hero'];

  // Prefer categories that match BOTH business type and usage
  const preferred = businessCategories.filter((c) => usageCategories.includes(c));
  const categories = preferred.length > 0 ? preferred : businessCategories;

  // Collect available images from matched categories
  const allImages: string[] = [];
  for (const cat of categories) {
    const images = STOCK_IMAGES[cat];
    if (images) {
      allImages.push(...images);
    }
  }

  // Shuffle and pick
  const shuffled = allImages.sort(() => Math.random() - 0.5);
  return shuffled.slice(0, count).map(stockPath);
}

/** Get hero background image for a business type */
export function getHeroBackground(businessType: string): string {
  const images = getStockForBusiness(businessType, 'hero', 1);
  return images[0] ?? stockPath('hero/gradient-purple.webp');
}

/** Get team avatars for a business type */
export function getTeamAvatars(count: number): string[] {
  return getRandomStocks('team', count);
}

/** Get testimonial avatars */
export function getTestimonialAvatars(count: number): string[] {
  return getRandomStocks('testimonials', count);
}

/** Get gallery images for a business type */
export function getGalleryImages(businessType: string, count: number): string[] {
  const images = getStockForBusiness(businessType, 'gallery', count);
  // Pad with category-specific defaults if not enough
  if (images.length < count) {
    const businessCategories = BUSINESS_STOCK_MAP[businessType] ?? ['hero'];
    for (const cat of businessCategories) {
      while (images.length < count) {
        images.push(getRandomStock(cat));
      }
    }
  }
  return images.slice(0, count);
}

/** Get blog thumbnails */
export function getBlogThumbnails(count: number): string[] {
  return getRandomStocks('blog', count);
}
