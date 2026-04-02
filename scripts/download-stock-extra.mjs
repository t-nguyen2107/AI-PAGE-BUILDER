/**
 * Download extra stock images — general topics for website templates.
 * Categories: food, drink, family, travel, people, children, nature,
 *             fitness, pets, education, medical, real-estate, fashion
 *
 * Usage: node scripts/download-stock-extra.mjs
 */

import { createWriteStream, mkdirSync, existsSync, unlinkSync } from 'fs';
import { get as httpsGet } from 'https';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dirname, '..');
const PUBLIC = join(ROOT, 'public', 'stock');

const sharp = (await import('sharp')).default;

const IMAGES = [
  // --- Food ---
  { url: 'https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=800&q=80', dest: 'food/meal-table.webp', desc: 'Meal on table' },
  { url: 'https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?w=600&q=80', dest: 'food/pizza.webp', desc: 'Pizza' },
  { url: 'https://images.unsplash.com/photo-1567620905732-2d1ec7ab7445?w=600&q=80', dest: 'food/pancakes.webp', desc: 'Pancakes' },
  { url: 'https://images.unsplash.com/photo-1540189549336-e6e99c3679fe?w=600&q=80', dest: 'food/salad.webp', desc: 'Salad bowl' },
  { url: 'https://images.unsplash.com/photo-1476224203421-9ac39bcb3327?w=600&q=80', dest: 'food/steak.webp', desc: 'Steak' },
  { url: 'https://images.unsplash.com/photo-1484723091739-30a097e8f929?w=600&q=80', dest: 'food/toast-breakfast.webp', desc: 'Toast breakfast' },
  { url: 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=600&q=80', dest: 'food/healthy-bowl.webp', desc: 'Healthy bowl' },
  { url: 'https://images.unsplash.com/photo-1551782450-a2132b4ba21d?w=600&q=80', dest: 'food/burger.webp', desc: 'Burger' },
  { url: 'https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=600&q=80', dest: 'food/vegetables.webp', desc: 'Fresh vegetables' },
  { url: 'https://images.unsplash.com/photo-1488477181946-6428a0291777?w=600&q=80', desc: 'Sushi', dest: 'food/sushi.webp' },

  // --- Drink ---
  { url: 'https://images.unsplash.com/photo-1509042239860-f550ce710b93?w=600&q=80', dest: 'drink/coffee-cup.webp', desc: 'Coffee cup' },
  { url: 'https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?w=600&q=80', dest: 'drink/coffee-shop.webp', desc: 'Coffee shop' },
  { url: 'https://images.unsplash.com/photo-1556679343-c7306c1976bc?w=600&q=80', dest: 'drink/cocktail.webp', desc: 'Cocktail' },
  { url: 'https://images.unsplash.com/photo-1544145945-f90425340c7e?w=600&q=80', dest: 'drink/wine.webp', desc: 'Wine glass' },
  { url: 'https://images.unsplash.com/photo-1527960471264-932f39eb5846?w=600&q=80', dest: 'drink/orange-juice.webp', desc: 'Orange juice' },
  { url: 'https://images.unsplash.com/photo-1558642452-9d2a7deb7f62?w=600&q=80', dest: 'drink/tea-matcha.webp', desc: 'Matcha tea' },

  // --- Family ---
  { url: 'https://images.unsplash.com/photo-1511895426328-dc8714191300?w=800&q=80', dest: 'family/family-together.webp', desc: 'Family together' },
  { url: 'https://images.unsplash.com/photo-1600880292203-757bb62b4baf?w=800&q=80', dest: 'family/family-walking.webp', desc: 'Family walking' },
  { url: 'https://images.unsplash.com/photo-1586864387789-628af9feed72?w=800&q=80', dest: 'family/family-home.webp', desc: 'Family at home' },
  { url: 'https://images.unsplash.com/photo-1531243269054-5ebf6f34081e?w=600&q=80', dest: 'family/parents-baby.webp', desc: 'Parents with baby' },
  { url: 'https://images.unsplash.com/photo-1518562180175-34a163b1a9a6?w=800&q=80', dest: 'family/grandparents.webp', desc: 'Grandparents' },

  // --- Travel ---
  { url: 'https://images.unsplash.com/photo-1488646953014-85cb44e25828?w=1200&q=80', dest: 'travel/beach-sunset.webp', desc: 'Beach sunset' },
  { url: 'https://images.unsplash.com/photo-1502602898657-3e91760cbb34?w=1200&q=80', dest: 'travel/paris-eiffel.webp', desc: 'Paris Eiffel' },
  { url: 'https://images.unsplash.com/photo-1506929562872-bb421503ef21?w=1200&q=80', dest: 'travel/tropical-beach.webp', desc: 'Tropical beach' },
  { url: 'https://images.unsplash.com/photo-1476514525535-07fb3b4ae5f1?w=1200&q=80', dest: 'travel/mountain-lake.webp', desc: 'Mountain lake' },
  { url: 'https://images.unsplash.com/photo-1530789253388-582c481c54b0?w=1200&q=80', dest: 'travel/temple-asia.webp', desc: 'Asian temple' },
  { url: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=1200&q=80', dest: 'travel/ocean-view.webp', desc: 'Ocean view' },
  { url: 'https://images.unsplash.com/photo-1469854523086-cc02fe5d8800?w=1200&q=80', dest: 'travel/road-trip.webp', desc: 'Road trip' },
  { url: 'https://images.unsplash.com/photo-1520175480921-4edfa2983e0f?w=1200&q=80', dest: 'travel/santorini.webp', desc: 'Santorini' },
  { url: 'https://images.unsplash.com/photo-1504280390367-361c6d9f38f4?w=1200&q=80', dest: 'travel/camping-tent.webp', desc: 'Camping tent' },
  { url: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=1200&q=80', dest: 'travel/sunrise-mountain.webp', desc: 'Sunrise mountain' },

  // --- People / Lifestyle ---
  { url: 'https://images.unsplash.com/photo-1529156069898-49953e39b3ac?w=800&q=80', dest: 'people/friends-laughing.webp', desc: 'Friends laughing' },
  { url: 'https://images.unsplash.com/photo-1522202176988-66273c2fd55f?w=800&q=80', dest: 'people/group-study.webp', desc: 'Group study' },
  { url: 'https://images.unsplash.com/photo-1529139574466-a303027c1d8b?w=600&q=80', dest: 'people/woman-portrait.webp', desc: 'Woman portrait' },
  { url: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=600&q=80', dest: 'people/man-portrait.webp', desc: 'Man portrait' },
  { url: 'https://images.unsplash.com/photo-1524504388940-b1c1722653e1?w=600&q=80', dest: 'people/woman-outdoor.webp', desc: 'Woman outdoor' },
  { url: 'https://images.unsplash.com/photo-1513956589380-bad6acb9b9d4?w=800&q=80', dest: 'people/concert-crowd.webp', desc: 'Concert crowd' },
  { url: 'https://images.unsplash.com/photo-1521119989659-a83eee488004?w=600&q=80', dest: 'people/artist-painting.webp', desc: 'Artist painting' },

  // --- Children ---
  { url: 'https://images.unsplash.com/photo-1503454537195-1dcabb73ffb9?w=600&q=80', dest: 'children/kid-playing.webp', desc: 'Kid playing' },
  { url: 'https://images.unsplash.com/photo-1515488042361-ee00e0ddd4e4?w=600&q=80', dest: 'children/kid-drawing.webp', desc: 'Kid drawing' },
  { url: 'https://images.unsplash.com/photo-1476234251651-f353703a034d?w=600&q=80', dest: 'children/kids-running.webp', desc: 'Kids running' },
  { url: 'https://images.unsplash.com/photo-1596870230751-ebdfce98ec42?w=600&q=80', dest: 'children/kid-reading.webp', desc: 'Kid reading' },
  { url: 'https://images.unsplash.com/photo-1543852786-1cf6624b9987?w=600&q=80', dest: 'children/toddler-smile.webp', desc: 'Toddler smile' },
  { url: 'https://images.unsplash.com/photo-1519457431-44ccd64a579b?w=600&q=80', dest: 'children/baby-cute.webp', desc: 'Cute baby' },

  // --- Nature ---
  { url: 'https://images.unsplash.com/photo-1441974231531-c6227db76b6e?w=1200&q=80', dest: 'nature/forest.webp', desc: 'Forest' },
  { url: 'https://images.unsplash.com/photo-1470071459604-3b5ec3a7fe05?w=1200&q=80', dest: 'nature/morning-mist.webp', desc: 'Morning mist' },
  { url: 'https://images.unsplash.com/photo-1472214103451-9374bd1c798e?w=1200&q=80', dest: 'nature/green-field.webp', desc: 'Green field' },
  { url: 'https://images.unsplash.com/photo-1433086966358-54859d0ed716?w=1200&q=80', dest: 'nature/waterfall.webp', desc: 'Waterfall' },
  { url: 'https://images.unsplash.com/photo-1414609245224-afa02bfb3fda?w=1200&q=80', dest: 'nature/autumn-leaves.webp', desc: 'Autumn leaves' },
  { url: 'https://images.unsplash.com/photo-1490730141103-6cac27aaab94?w=1200&q=80', dest: 'nature/sunset-ocean.webp', desc: 'Sunset ocean' },
  { url: 'https://images.unsplash.com/photo-1493246507139-91e8fad9978e?w=1200&q=80', dest: 'nature/mountain-peak.webp', desc: 'Mountain peak' },

  // --- Fitness / Sports ---
  { url: 'https://images.unsplash.com/photo-1517836357463-d25dfeac3438?w=800&q=80', dest: 'fitness/gym-workout.webp', desc: 'Gym workout' },
  { url: 'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=800&q=80', dest: 'fitness/yoga-pose.webp', desc: 'Yoga pose' },
  { url: 'https://images.unsplash.com/photo-1476480862126-209bfaa8edc8?w=800&q=80', dest: 'fitness/running.webp', desc: 'Running' },
  { url: 'https://images.unsplash.com/photo-1517649763962-0c623066013b?w=800&q=80', dest: 'fitness/cycling.webp', desc: 'Cycling' },
  { url: 'https://images.unsplash.com/photo-1530549387789-4c1017266635?w=800&q=80', dest: 'fitness/swimming.webp', desc: 'Swimming' },

  // --- Pets / Animals ---
  { url: 'https://images.unsplash.com/photo-1587300003388-59208cc962cb?w=600&q=80', dest: 'pets/golden-dog.webp', desc: 'Golden retriever' },
  { url: 'https://images.unsplash.com/photo-1574158622682-e40e69881006?w=600&q=80', dest: 'pets/cat-orange.webp', desc: 'Orange cat' },
  { url: 'https://images.unsplash.com/photo-1583511655857-d19b40a7a54e?w=600&q=80', dest: 'pets/dog-puppy.webp', desc: 'Puppy' },
  { url: 'https://images.unsplash.com/photo-1570824104453-508955ab713e?w=600&q=80', dest: 'pets/kitten.webp', desc: 'Kitten' },
  { url: 'https://images.unsplash.com/photo-1548199973-03cce0bbc87b?w=600&q=80', dest: 'pets/two-dogs.webp', desc: 'Two dogs running' },

  // --- Education ---
  { url: 'https://images.unsplash.com/photo-1507842217343-583bb7270b66?w=800&q=80', dest: 'education/books-library.webp', desc: 'Books library' },
  { url: 'https://images.unsplash.com/photo-1524178232363-1fb2b075b655?w=800&q=80', dest: 'education/classroom.webp', desc: 'Classroom' },
  { url: 'https://images.unsplash.com/photo-1427504494785-3a9ca7044f45?w=800&q=80', dest: 'education/students-group.webp', desc: 'Students group' },
  { url: 'https://images.unsplash.com/photo-1503676260728-1c00da094a0b?w=600&q=80', dest: 'education/study-desk.webp', desc: 'Study desk' },

  // --- Medical / Health ---
  { url: 'https://images.unsplash.com/photo-1631217868264-e5b90bb7e133?w=800&q=80', dest: 'medical/doctor.webp', desc: 'Doctor' },
  { url: 'https://images.unsplash.com/photo-1559757175-5700dde675bc?w=800&q=80', dest: 'medical/nurse.webp', desc: 'Nurse' },
  { url: 'https://images.unsplash.com/photo-1586773860418-d37222d8fce3?w=800&q=80', dest: 'medical/surgery-team.webp', desc: 'Surgery team' },
  { url: 'https://images.unsplash.com/photo-1576091160550-2173dba999ef?w=600&q=80', dest: 'medical/pharmacy.webp', desc: 'Pharmacy' },

  // --- Real Estate ---
  { url: 'https://images.unsplash.com/photo-1564013799919-ab600027ffc6?w=1200&q=80', dest: 'realestate/house-modern.webp', desc: 'Modern house' },
  { url: 'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?w=1200&q=80', dest: 'realestate/luxury-home.webp', desc: 'Luxury home' },
  { url: 'https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=1200&q=80', dest: 'realestate/apartment-interior.webp', desc: 'Apartment interior' },
  { url: 'https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=1200&q=80', dest: 'realestate/living-room.webp', desc: 'Living room' },
  { url: 'https://images.unsplash.com/photo-1484154218962-a197022b5858?w=1200&q=80', dest: 'realestate/kitchen.webp', desc: 'Kitchen' },

  // --- Fashion ---
  { url: 'https://images.unsplash.com/photo-1445205170230-053b83016050?w=600&q=80', dest: 'fashion/fashion-show.webp', desc: 'Fashion show' },
  { url: 'https://images.unsplash.com/photo-1607082348824-0a96f2a4b9da?w=600&q=80', dest: 'fashion/shopping-bags.webp', desc: 'Shopping bags' },
  { url: 'https://images.unsplash.com/photo-1490481651871-ab68de25d43d?w=600&q=80', dest: 'fashion/clothing-rack.webp', desc: 'Clothing rack' },
  { url: 'https://images.unsplash.com/photo-1525507119028-ed4c629a60a3?w=600&q=80', dest: 'fashion/accessories.webp', desc: 'Accessories' },
];

// ============================================================
// Download helper with redirect following
// ============================================================
function download(url, destPath) {
  return new Promise((resolve, reject) => {
    const file = createWriteStream(destPath);
    httpsGet(url, { headers: { 'User-Agent': 'Mozilla/5.0' } }, (res) => {
      if (res.statusCode === 301 || res.statusCode === 302) {
        download(res.headers.location, destPath).then(resolve).catch(reject);
        return;
      }
      if (res.statusCode !== 200) {
        reject(new Error(`HTTP ${res.statusCode}`));
        return;
      }
      res.pipe(file);
      file.on('finish', () => file.close(resolve));
    }).on('error', (err) => {
      file.close();
      reject(err);
    });
  });
}

async function toWebP(inputPath, outputPath) {
  await sharp(inputPath).webp({ quality: 80, effort: 4 }).toFile(outputPath);
}

// ============================================================
// Main — download in batches of 5 to avoid rate limiting
// ============================================================
async function main() {
  console.log(`\n📦 Downloading ${IMAGES.length} general stock images → WebP\n`);

  let success = 0;
  let failed = 0;
  const BATCH = 5;

  for (let i = 0; i < IMAGES.length; i += BATCH) {
    const batch = IMAGES.slice(i, i + BATCH);

    const results = await Promise.allSettled(
      batch.map(async (img) => {
        const destPath = join(PUBLIC, img.dest);
        const dir = dirname(destPath);
        if (!existsSync(dir)) mkdirSync(dir, { recursive: true });

        if (existsSync(destPath)) {
          console.log(`  ⏭  ${img.dest} (exists)`);
          return;
        }

        const tmpPath = destPath.replace('.webp', '.tmp.jpg');
        try {
          await download(img.url, tmpPath);
          await toWebP(tmpPath, destPath);
          try { unlinkSync(tmpPath); } catch { /* ignore */ }
          console.log(`  ✓ ${img.desc}`);
        } catch (err) {
          try { unlinkSync(tmpPath); } catch { /* ignore */ }
          throw new Error(`${img.dest}: ${err.message}`);
        }
      })
    );

    for (const r of results) {
      if (r.status === 'fulfilled') success++;
      else {
        console.log(`  ✗ ${r.reason?.message}`);
        failed++;
      }
    }

    // Small pause between batches
    if (i + BATCH < IMAGES.length) {
      await new Promise((r) => setTimeout(r, 300));
    }
  }

  console.log(`\n✅ Done: ${success} downloaded, ${failed} failed\n`);
}

main().catch(console.error);
