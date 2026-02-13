import { ExecArgs } from "@medusajs/framework/types";
import {
  ContainerRegistrationKeys,
  Modules,
} from "@medusajs/framework/utils";

/**
 * Updates existing product images to use relative URLs served by the Medusa backend.
 * Run with: medusa exec ./src/scripts/update-images.ts
 *
 * Images are stored in the backend's static/ directory and served at /static/...
 * Using relative (origin-relative) paths so images work from any host/IP.
 */

// Images served from the backend's static directory (relative path — works from any origin)
const IMAGE_BASE = "/static";

const IMAGE_MAP: Record<string, { thumbnail: string; images: string[] }> = {
  boxhandschuhe: {
    thumbnail: `${IMAGE_BASE}/boxhandschuhe.png`,
    images: [
      `${IMAGE_BASE}/boxhandschuhe.png`,
    ],
  },
  "mma-handschuhe": {
    thumbnail: `${IMAGE_BASE}/mma-handschuhe.png`,
    images: [
      `${IMAGE_BASE}/mma-handschuhe.png`,
    ],
  },
  "mma-shorts": {
    thumbnail: `${IMAGE_BASE}/fight-shorts.jpg`,
    images: [
      `${IMAGE_BASE}/fight-shorts.jpg`,
    ],
  },
  rashguard: {
    thumbnail: `${IMAGE_BASE}/rashguard.jpg`,
    images: [
      `${IMAGE_BASE}/rashguard.jpg`,
    ],
  },
  "raglan-tshirt": {
    thumbnail: `${IMAGE_BASE}/raglan-tshirt.jpg`,
    images: [
      `${IMAGE_BASE}/raglan-tshirt.jpg`,
    ],
  },
  "training-bundle": {
    thumbnail: `${IMAGE_BASE}/fight-shorts.jpg`,
    images: [
      `${IMAGE_BASE}/fight-shorts.jpg`,
      `${IMAGE_BASE}/rashguard.jpg`,
    ],
  },
};

/** Strip any absolute http(s)://host:port prefix, keeping only the path. */
function stripOrigin(url: string): string {
  return url.replace(/^https?:\/\/[^/]+/, "");
}

export default async function updateProductImages({ container }: ExecArgs) {
  const logger = container.resolve(ContainerRegistrationKeys.LOGGER);
  const productService = container.resolve(Modules.PRODUCT);

  // ── Pass 1: Normalise ALL absolute URLs to relative paths ──
  // This preserves admin-uploaded images while fixing their URLs.
  logger.info("Pass 1: Normalising absolute image URLs...");

  const allProducts = await productService.listProducts(
    {},
    { relations: ["images"] }
  );

  for (const product of allProducts) {
    if (!product.images?.length) continue;

    // Check if any image or thumbnail has an absolute URL
    const hasAbsoluteImage = product.images.some(
      (img: any) => typeof img.url === "string" && /^https?:\/\//.test(img.url)
    );
    const hasAbsoluteThumb =
      typeof product.thumbnail === "string" && /^https?:\/\//.test(product.thumbnail);

    if (!hasAbsoluteImage && !hasAbsoluteThumb) continue;

    // Build a new images array with normalised URLs
    const fixedImages = product.images.map((img: any) => ({
      url: typeof img.url === "string" ? stripOrigin(img.url) : img.url,
    }));

    // Also fix the thumbnail if needed
    const fixedThumb =
      typeof product.thumbnail === "string"
        ? stripOrigin(product.thumbnail)
        : product.thumbnail;

    // Delete old images
    for (const img of product.images) {
      try {
        await productService.deleteProductImages([img.id]);
      } catch {
        // ignore
      }
    }

    // Re-add with fixed URLs
    await productService.updateProducts(product.id, {
      thumbnail: fixedThumb,
      images: fixedImages,
    });

    logger.info(`  Normalised ${product.handle}: ${fixedImages.length} images`);
  }

  // ── Pass 2: Set default images for products that have NONE ──
  // Only applies IMAGE_MAP entries for products missing images entirely.
  logger.info("Pass 2: Setting default images for products without any...");

  const productsAfterNorm = await productService.listProducts(
    {},
    { relations: ["images"] }
  );

  for (const product of productsAfterNorm) {
    const mapping = IMAGE_MAP[product.handle!];
    if (!mapping) continue;

    // Skip if product already has images (e.g. admin-uploaded ones)
    if (product.images?.length) {
      logger.info(`  Skipping ${product.handle} (already has ${product.images.length} images)`);
      continue;
    }

    try {
      await productService.updateProducts(product.id, {
        thumbnail: mapping.thumbnail,
        images: mapping.images.map((url) => ({ url })),
      });
      logger.info(`  Set defaults for ${product.handle}: ${mapping.images.length} images`);
    } catch (err) {
      logger.error(`  Failed to update ${product.handle}: ${err}`);
    }
  }

  logger.info("Done updating product images.");
}
