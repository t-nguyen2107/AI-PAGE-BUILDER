/**
 * Download stock images from Unsplash/Pexels and convert to WebP.
 * Uses sharp (bundled with Next.js) for conversion.
 *
 * Usage: node scripts/download-stock.mjs
 */

import { createWriteStream, mkdirSync, existsSync } from 'fs';
import { get as httpsGet } from 'https';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dirname, '..');
const PUBLIC = join(ROOT, 'public', 'stock');

// Dynamic import sharp (bundled with Next.js)
const sharp = (await import('sharp')).default;

// ============================================================
// Stock image definitions — curated for website builder templates
// ============================================================
const IMAGES = [
  // --- Hero backgrounds ---
  {
    url: 'https://images.unsplash.com/photo-1497366216548-37526070297c?w=1920&q=80',
    dest: 'hero/office-modern.webp',
    desc: 'Modern office workspace',
  },
  {
    url: 'https://images.unsplash.com/photo-1451187580459-43490279c0fa?w=1920&q=80',
    dest: 'hero/tech-dark.webp',
    desc: 'Dark tech abstract',
  },
  {
    url: 'https://images.unsplash.com/photo-1557682250-33bd709cbe85?w=1920&q=80',
    dest: 'hero/gradient-purple.webp',
    desc: 'Purple gradient abstract',
  },
  {
    url: 'https://images.unsplash.com/photo-1504384308090-c894fdcc538d?w=1920&q=80',
    dest: 'hero/startup-team.webp',
    desc: 'Startup team working',
  },
  {
    url: 'https://images.unsplash.com/photo-1551434678-e076c223a692?w=1920&q=80',
    dest: 'hero/coding-screen.webp',
    desc: 'Coding on screen',
  },
  {
    url: 'https://images.unsplash.com/photo-1519389950473-47ba0277781c?w=1920&q=80',
    dest: 'hero/team-meeting.webp',
    desc: 'Team meeting',
  },

  // --- Team portraits ---
  {
    url: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&q=80',
    dest: 'team/person-1.webp',
    desc: 'Team member male 1',
  },
  {
    url: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=400&q=80',
    dest: 'team/person-2.webp',
    desc: 'Team member female 1',
  },
  {
    url: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=400&q=80',
    dest: 'team/person-3.webp',
    desc: 'Team member male 2',
  },
  {
    url: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=400&q=80',
    dest: 'team/person-4.webp',
    desc: 'Team member female 2',
  },
  {
    url: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=400&q=80',
    dest: 'team/person-5.webp',
    desc: 'Team member male 3',
  },
  {
    url: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?w=400&q=80',
    dest: 'team/person-6.webp',
    desc: 'Team member female 3',
  },

  // --- Testimonial avatars ---
  {
    url: 'https://images.unsplash.com/photo-1560250097-0b93528c311a?w=200&q=80',
    dest: 'testimonials/avatar-1.webp',
    desc: 'Testimonial CEO male',
  },
  {
    url: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=200&q=80',
    dest: 'testimonials/avatar-2.webp',
    desc: 'Testimonial exec female',
  },
  {
    url: 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=200&q=80',
    dest: 'testimonials/avatar-3.webp',
    desc: 'Testimonial man smile',
  },
  {
    url: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200&q=80',
    dest: 'testimonials/avatar-4.webp',
    desc: 'Testimonial woman smile',
  },

  // --- Feature / product images ---
  {
    url: 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=800&q=80',
    dest: 'features/analytics-dashboard.webp',
    desc: 'Analytics dashboard',
  },
  {
    url: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=800&q=80',
    dest: 'features/data-charts.webp',
    desc: 'Data charts',
  },
  {
    url: 'https://images.unsplash.com/photo-1522071820081-009f0129c71c?w=800&q=80',
    dest: 'features/collaboration.webp',
    desc: 'Team collaboration',
  },
  {
    url: 'https://images.unsplash.com/photo-1563986768609-322da13575f2?w=800&q=80',
    dest: 'features/mobile-app.webp',
    desc: 'Mobile app',
  },

  // --- CTA backgrounds ---
  {
    url: 'https://images.unsplash.com/photo-1557683316-973673baf926?w=1200&q=80',
    dest: 'cta/gradient-blue.webp',
    desc: 'Blue gradient background',
  },
  {
    url: 'https://images.unsplash.com/photo-1557672172-298e090bd0f1?w=1200&q=80',
    dest: 'cta/abstract-waves.webp',
    desc: 'Abstract waves',
  },

  // --- Blog thumbnails ---
  {
    url: 'https://images.unsplash.com/photo-1499750310107-5fef28a66643?w=600&q=80',
    dest: 'blog/writing.webp',
    desc: 'Blog writing',
  },
  {
    url: 'https://images.unsplash.com/photo-1504868584819-f8e8b4b6d7e3?w=600&q=80',
    dest: 'blog/notebook.webp',
    desc: 'Notebook',
  },
  {
    url: 'https://images.unsplash.com/photo-1499750310107-5fef28a66643?w=600&q=80',
    dest: 'blog/laptop-coffee.webp',
    desc: 'Laptop with coffee',
  },
];

// ============================================================
// Download helper
// ============================================================
function download(url, destPath) {
  return new Promise((resolve, reject) => {
    const file = createWriteStream(destPath);
    httpsGet(url, { headers: { 'User-Agent': 'Mozilla/5.0' } }, (res) => {
      // Follow redirects
      if (res.statusCode === 301 || res.statusCode === 302) {
        download(res.headers.location, destPath).then(resolve).catch(reject);
        return;
      }
      if (res.statusCode !== 200) {
        reject(new Error(`HTTP ${res.statusCode} for ${url}`));
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

// ============================================================
// Convert to WebP
// ============================================================
async function toWebP(inputPath, outputPath) {
  await sharp(inputPath)
    .webp({ quality: 80, effort: 4 })
    .toFile(outputPath);
}

// ============================================================
// Main
// ============================================================
async function main() {
  console.log(`\n📦 Downloading ${IMAGES.length} stock images → WebP\n`);

  let success = 0;
  let failed = 0;

  for (const img of IMAGES) {
    const destPath = join(PUBLIC, img.dest);
    const dir = dirname(destPath);
    if (!existsSync(dir)) mkdirSync(dir, { recursive: true });

    const tmpPath = destPath.replace('.webp', '.tmp.jpg');

    try {
      // Skip if already exists
      if (existsSync(destPath)) {
        console.log(`  ⏭  ${img.dest} (exists)`);
        success++;
        continue;
      }

      process.stdout.write(`  ↓ ${img.desc}...`);
      await download(img.url, tmpPath);
      await toWebP(tmpPath, destPath);

      // Cleanup temp file
      const { unlinkSync } = await import('fs');
      try { unlinkSync(tmpPath); } catch { /* ignore */ }

      console.log(' ✓');
      success++;
    } catch (err) {
      console.log(` ✗ (${err.message})`);
      failed++;
      // Cleanup on failure
      try {
        const { unlinkSync } = await import('fs');
        unlinkSync(tmpPath);
      } catch { /* ignore */ }
    }
  }

  console.log(`\n✅ Done: ${success} downloaded, ${failed} failed\n`);
}

main().catch(console.error);
