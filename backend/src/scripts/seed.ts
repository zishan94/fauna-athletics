import { CreateInventoryLevelInput, ExecArgs } from "@medusajs/framework/types";
import {
  ContainerRegistrationKeys,
  Modules,
  ProductStatus,
} from "@medusajs/framework/utils";
import {
  createWorkflow,
  transform,
  WorkflowResponse,
} from "@medusajs/framework/workflows-sdk";
import {
  createApiKeysWorkflow,
  createInventoryLevelsWorkflow,
  createProductCategoriesWorkflow,
  createProductsWorkflow,
  createRegionsWorkflow,
  createSalesChannelsWorkflow,
  createShippingOptionsWorkflow,
  createShippingProfilesWorkflow,
  createStockLocationsWorkflow,
  createTaxRegionsWorkflow,
  linkSalesChannelsToApiKeyWorkflow,
  linkSalesChannelsToStockLocationWorkflow,
  updateStoresStep,
  updateStoresWorkflow,
} from "@medusajs/medusa/core-flows";
import { ApiKey } from "../../.medusa/types/query-entry-points";

const updateStoreCurrencies = createWorkflow(
  "update-store-currencies",
  (input: {
    supported_currencies: { currency_code: string; is_default?: boolean }[];
    store_id: string;
  }) => {
    const normalizedInput = transform({ input }, (data) => {
      return {
        selector: { id: data.input.store_id },
        update: {
          supported_currencies: data.input.supported_currencies.map(
            (currency) => {
              return {
                currency_code: currency.currency_code,
                is_default: currency.is_default ?? false,
              };
            }
          ),
        },
      };
    });

    const stores = updateStoresStep(normalizedInput);

    return new WorkflowResponse(stores);
  }
);

export default async function seedDemoData({ container }: ExecArgs) {
  const logger = container.resolve(ContainerRegistrationKeys.LOGGER);
  const link = container.resolve(ContainerRegistrationKeys.LINK);
  const query = container.resolve(ContainerRegistrationKeys.QUERY);
  const fulfillmentModuleService = container.resolve(Modules.FULFILLMENT);
  const salesChannelModuleService = container.resolve(Modules.SALES_CHANNEL);
  const storeModuleService = container.resolve(Modules.STORE);

  // Swiss store setup
  const countries = ["ch", "li", "de", "at"];

  logger.info("Seeding Fauna Athletics store data...");
  const [store] = await storeModuleService.listStores();
  let defaultSalesChannel = await salesChannelModuleService.listSalesChannels({
    name: "Default Sales Channel",
  });

  if (!defaultSalesChannel.length) {
    const { result: salesChannelResult } = await createSalesChannelsWorkflow(
      container
    ).run({
      input: {
        salesChannelsData: [
          {
            name: "Default Sales Channel",
          },
        ],
      },
    });
    defaultSalesChannel = salesChannelResult;
  }

  // Set CHF as default currency
  await updateStoreCurrencies(container).run({
    input: {
      store_id: store.id,
      supported_currencies: [
        {
          currency_code: "chf",
          is_default: true,
        },
        {
          currency_code: "eur",
        },
      ],
    },
  });

  await updateStoresWorkflow(container).run({
    input: {
      selector: { id: store.id },
      update: {
        default_sales_channel_id: defaultSalesChannel[0].id,
      },
    },
  });

  logger.info("Seeding Swiss region...");
  const { result: regionResult } = await createRegionsWorkflow(container).run({
    input: {
      regions: [
        {
          name: "Schweiz",
          currency_code: "chf",
          countries,
          is_tax_inclusive: true,
          automatic_taxes: true,
          payment_providers: ["pp_stripe_stripe"],
        },
      ],
    },
  });
  const region = regionResult[0];
  logger.info("Finished seeding Swiss region.");

  logger.info("Seeding Swiss tax regions...");
  await createTaxRegionsWorkflow(container).run({
    input: countries.map((country_code) => ({
      country_code,
      provider_id: "tp_system",
      default_tax_rate: {
        rate: 8.1,
        name: "MWST",
        code: "mwst",
      },
    })),
  });
  logger.info("Finished seeding Swiss tax regions with 8.1% MWST.");

  logger.info("Seeding stock location...");
  const { result: stockLocationResult } = await createStockLocationsWorkflow(
    container
  ).run({
    input: {
      locations: [
        {
          name: "Fauna Athletics Lager",
          address: {
            city: "Zürich",
            country_code: "CH",
            address_1: "Schweiz",
          },
        },
      ],
    },
  });
  const stockLocation = stockLocationResult[0];

  await updateStoresWorkflow(container).run({
    input: {
      selector: { id: store.id },
      update: {
        default_location_id: stockLocation.id,
      },
    },
  });

  await link.create({
    [Modules.STOCK_LOCATION]: {
      stock_location_id: stockLocation.id,
    },
    [Modules.FULFILLMENT]: {
      fulfillment_provider_id: "manual_manual",
    },
  });

  logger.info("Seeding Swiss shipping options...");
  const shippingProfiles = await fulfillmentModuleService.listShippingProfiles({
    type: "default",
  });
  let shippingProfile = shippingProfiles.length ? shippingProfiles[0] : null;

  if (!shippingProfile) {
    const { result: shippingProfileResult } =
      await createShippingProfilesWorkflow(container).run({
        input: {
          data: [
            {
              name: "Default Shipping Profile",
              type: "default",
            },
          ],
        },
      });
    shippingProfile = shippingProfileResult[0];
  }

  const fulfillmentSet = await fulfillmentModuleService.createFulfillmentSets({
    name: "Swiss Shipping",
    type: "shipping",
    service_zones: [
      {
        name: "Schweiz & Nachbarländer",
        geo_zones: countries.map((country_code) => ({
          country_code,
          type: "country" as const,
        })),
      },
    ],
  });

  await link.create({
    [Modules.STOCK_LOCATION]: {
      stock_location_id: stockLocation.id,
    },
    [Modules.FULFILLMENT]: {
      fulfillment_set_id: fulfillmentSet.id,
    },
  });

  await createShippingOptionsWorkflow(container).run({
    input: [
      {
        name: "Swiss Post Standard",
        price_type: "flat",
        provider_id: "manual_manual",
        service_zone_id: fulfillmentSet.service_zones[0].id,
        shipping_profile_id: shippingProfile.id,
        type: {
          label: "Standard",
          description: "3-5 Werktage",
          code: "standard",
        },
        prices: [
          {
            currency_code: "chf",
            amount: 7.90,
          },
          {
            region_id: region.id,
            amount: 7.90,
          },
        ],
        rules: [
          {
            attribute: "enabled_in_store",
            value: "true",
            operator: "eq",
          },
          {
            attribute: "is_return",
            value: "false",
            operator: "eq",
          },
        ],
      },
      {
        name: "Swiss Post Express",
        price_type: "flat",
        provider_id: "manual_manual",
        service_zone_id: fulfillmentSet.service_zones[0].id,
        shipping_profile_id: shippingProfile.id,
        type: {
          label: "Express",
          description: "1-2 Werktage",
          code: "express",
        },
        prices: [
          {
            currency_code: "chf",
            amount: 14.90,
          },
          {
            region_id: region.id,
            amount: 14.90,
          },
        ],
        rules: [
          {
            attribute: "enabled_in_store",
            value: "true",
            operator: "eq",
          },
          {
            attribute: "is_return",
            value: "false",
            operator: "eq",
          },
        ],
      },
    ],
  });
  logger.info("Finished seeding Swiss shipping options.");

  await linkSalesChannelsToStockLocationWorkflow(container).run({
    input: {
      id: stockLocation.id,
      add: [defaultSalesChannel[0].id],
    },
  });

  logger.info("Seeding publishable API key...");
  let publishableApiKey: ApiKey | null = null;
  const { data } = await query.graph({
    entity: "api_key",
    fields: ["id", "token"],
    filters: {
      type: "publishable",
    },
  });

  publishableApiKey = data?.[0];

  if (!publishableApiKey) {
    const {
      result: [publishableApiKeyResult],
    } = await createApiKeysWorkflow(container).run({
      input: {
        api_keys: [
          {
            title: "Fauna Athletics Storefront",
            type: "publishable",
            created_by: "",
          },
        ],
      },
    });

    publishableApiKey = publishableApiKeyResult as ApiKey;
  }

  await linkSalesChannelsToApiKeyWorkflow(container).run({
    input: {
      id: publishableApiKey.id,
      add: [defaultSalesChannel[0].id],
    },
  });
  logger.info(`Publishable API Key created: ${publishableApiKey.id}`);
  logger.info("Finished seeding publishable API key.");

  // ── FAUNA ATHLETICS PRODUCT CATEGORIES ──
  logger.info("Seeding Fauna Athletics categories...");
  const { result: categoryResult } = await createProductCategoriesWorkflow(
    container
  ).run({
    input: {
      product_categories: [
        { name: "Handschuhe", handle: "gloves", is_active: true },
        { name: "Shorts", handle: "shorts", is_active: true },
        { name: "Tops", handle: "tops", is_active: true },
        { name: "Bundles", handle: "bundles", is_active: true },
      ],
    },
  });
  logger.info("Finished seeding categories.");

  const catGloves = categoryResult.find((c) => c.handle === "gloves")!;
  const catShorts = categoryResult.find((c) => c.handle === "shorts")!;
  const catTops = categoryResult.find((c) => c.handle === "tops")!;
  const catBundles = categoryResult.find((c) => c.handle === "bundles")!;

  // ── FAUNA ATHLETICS PRODUCTS ──
  logger.info("Seeding Fauna Athletics products...");

  // Helper to generate size variants with CHF prices
  function sizeVariants(sizes: string[], price: number, handlePrefix: string) {
    return sizes.map((size) => ({
      title: size,
      sku: `${handlePrefix}-${size}`.toUpperCase(),
      options: { Grösse: size },
      prices: [
        { amount: price, currency_code: "chf" },
      ],
    }));
  }

  await createProductsWorkflow(container).run({
    input: {
      products: [
        {
          title: "Fauna Pro Boxhandschuhe",
          subtitle: "Echtes Leder · Multi-Layer Foam",
          handle: "boxhandschuhe",
          description: "Unsere Flaggschiff-Handschuhe aus 100% echtem Leder mit Multi-Layer-Schaumstoff für ultimativen Schutz. Entwickelt für Sparring und Wettkampf.",
          status: ProductStatus.PUBLISHED,
          shipping_profile_id: shippingProfile.id,
          weight: 500,
          category_ids: [catGloves.id],
          metadata: {
            tag: "BESTSELLER",
            features: [
              "100% echtes Premium-Rindsleder",
              "Multi-Layer Foam Polsterung",
              "Atmungsaktives Innenfutter",
              "Verstärkte Handgelenkstütze",
              "Handgefertigt in Portugal",
            ],
          },
          images: [
            { url: "http://localhost:5173/images/products/boxhandschuhe.png" },
          ],
          thumbnail: "http://localhost:5173/images/products/boxhandschuhe.png",
          options: [
            { title: "Grösse", values: ["10oz", "12oz", "14oz", "16oz"] },
          ],
          variants: sizeVariants(["10oz", "12oz", "14oz", "16oz"], 129, "BOXHANDSCHUHE"),
          sales_channels: [{ id: defaultSalesChannel[0].id }],
        },
        {
          title: "Fauna MMA Handschuhe",
          subtitle: "Premium Leder · Open Palm",
          handle: "mma-handschuhe",
          description: "Entwickelt für Grappling und MMA-Training. Open Palm Design für maximalen Grip bei kompromisslosem Schutz.",
          status: ProductStatus.PUBLISHED,
          shipping_profile_id: shippingProfile.id,
          weight: 300,
          category_ids: [catGloves.id],
          metadata: {
            tag: "NEU",
            features: [
              "Open Palm Design",
              "Premium Leder",
              "Ergonomic Fit",
              "Doppelte Naht",
            ],
          },
          images: [
            { url: "http://localhost:5173/images/products/mma-handschuhe.png" },
          ],
          thumbnail: "http://localhost:5173/images/products/mma-handschuhe.png",
          options: [
            { title: "Grösse", values: ["S", "M", "L", "XL"] },
          ],
          variants: sizeVariants(["S", "M", "L", "XL"], 89, "MMA-HANDSCHUHE"),
          sales_channels: [{ id: defaultSalesChannel[0].id }],
        },
        {
          title: "Fauna Fight Shorts 2.0",
          subtitle: "2-teilig · 4-Way Stretch",
          handle: "mma-shorts",
          description: "Unsere revolutionären 2-teiligen Fight Shorts mit 4-Way Stretch für maximale Bewegungsfreiheit im Ring und auf der Matte.",
          status: ProductStatus.PUBLISHED,
          shipping_profile_id: shippingProfile.id,
          weight: 250,
          category_ids: [catShorts.id],
          metadata: {
            features: [
              "2-teiliges Design",
              "4-Way Stretch",
              "Moisture Wicking",
              "Flatlock-Nähte",
            ],
          },
          images: [
            { url: "http://localhost:5173/images/products/fight-shorts.jpg" },
          ],
          thumbnail: "http://localhost:5173/images/products/fight-shorts.jpg",
          options: [
            { title: "Grösse", values: ["S", "M", "L", "XL", "XXL"] },
          ],
          variants: sizeVariants(["S", "M", "L", "XL", "XXL"], 69, "FIGHT-SHORTS"),
          sales_channels: [{ id: defaultSalesChannel[0].id }],
        },
        {
          title: "Fauna Rashguard Pro",
          subtitle: "Kompression · UV-Schutz",
          handle: "rashguard",
          description: "Kompressionsshirt mit UV-Schutz und Quick-Dry Technologie. Perfekt für BJJ, MMA und funktionelles Training.",
          status: ProductStatus.PUBLISHED,
          shipping_profile_id: shippingProfile.id,
          weight: 200,
          category_ids: [catTops.id],
          metadata: {
            features: [
              "UV-Schutz",
              "Kompression",
              "Quick-Dry",
              "Flatlock-Nähte",
            ],
          },
          images: [
            { url: "http://localhost:5173/images/products/rashguard.jpg" },
          ],
          thumbnail: "http://localhost:5173/images/products/rashguard.jpg",
          options: [
            { title: "Grösse", values: ["S", "M", "L", "XL"] },
          ],
          variants: sizeVariants(["S", "M", "L", "XL"], 59, "RASHGUARD"),
          sales_channels: [{ id: defaultSalesChannel[0].id }],
        },
        {
          title: "Fauna Raglan Tee",
          subtitle: "Atmungsaktiv · Perfect Fit",
          handle: "raglan-tshirt",
          description: "Unser vielseitiges Raglan T-Shirt — perfekt für Training und Alltag. Atmungsaktives Material mit perfekter Passform.",
          status: ProductStatus.PUBLISHED,
          shipping_profile_id: shippingProfile.id,
          weight: 180,
          category_ids: [catTops.id],
          metadata: {
            features: [
              "Atmungsaktiv",
              "Perfekte Passform",
              "Soft Touch Material",
              "Raglan-Schnitt",
            ],
          },
          images: [
            { url: "http://localhost:5173/images/products/raglan-tshirt.jpg" },
          ],
          thumbnail: "http://localhost:5173/images/products/raglan-tshirt.jpg",
          options: [
            { title: "Grösse", values: ["S", "M", "L", "XL", "XXL"] },
          ],
          variants: sizeVariants(["S", "M", "L", "XL", "XXL"], 49, "RAGLAN-TEE"),
          sales_channels: [{ id: defaultSalesChannel[0].id }],
        },
        {
          title: "Fauna Training Bundle",
          subtitle: "Shorts + Rashguard Set",
          handle: "training-bundle",
          description: "Das perfekte Training-Set: Unsere Fight Shorts 2.0 kombiniert mit dem Rashguard Pro — zum Vorteilspreis.",
          status: ProductStatus.PUBLISHED,
          shipping_profile_id: shippingProfile.id,
          weight: 450,
          category_ids: [catBundles.id],
          metadata: {
            tag: "SPARE 15%",
            features: [
              "Fight Shorts 2.0",
              "Rashguard Pro",
              "15% günstiger als Einzelkauf",
            ],
          },
          images: [
            { url: "http://localhost:5173/images/products/fight-shorts.jpg" },
            { url: "http://localhost:5173/images/products/rashguard.jpg" },
          ],
          thumbnail: "http://localhost:5173/images/products/fight-shorts.jpg",
          options: [
            { title: "Grösse", values: ["S", "M", "L", "XL"] },
          ],
          variants: sizeVariants(["S", "M", "L", "XL"], 109, "TRAINING-BUNDLE"),
          sales_channels: [{ id: defaultSalesChannel[0].id }],
        },
      ],
    },
  });
  logger.info("Finished seeding 6 Fauna Athletics products.");

  // ── INVENTORY ──
  logger.info("Seeding inventory levels...");
  const { data: inventoryItems } = await query.graph({
    entity: "inventory_item",
    fields: ["id"],
  });

  const inventoryLevels: CreateInventoryLevelInput[] = [];
  for (const inventoryItem of inventoryItems) {
    inventoryLevels.push({
      location_id: stockLocation.id,
      stocked_quantity: 1000,
      inventory_item_id: inventoryItem.id,
    });
  }

  await createInventoryLevelsWorkflow(container).run({
    input: {
      inventory_levels: inventoryLevels,
    },
  });

  logger.info("Finished seeding inventory levels.");
  logger.info("");
  logger.info("============================================");
  logger.info("  FAUNA ATHLETICS STORE SEEDED SUCCESSFULLY");
  logger.info("============================================");
  logger.info(`  Region: Schweiz (CHF)`);
  logger.info(`  Tax: 8.1% MWST (inkl. / tax-inclusive)`);
  logger.info(`  Products: 6`);
  logger.info(`  Categories: 4`);
  logger.info(`  Shipping: Standard (7.90) + Express (14.90)`);
  logger.info(`  API Key ID: ${publishableApiKey.id}`);
  logger.info("============================================");
  logger.info("");
  logger.info("NEXT: Go to http://localhost:9000/app > Settings > API Keys");
  logger.info("Copy the publishable key token and paste it into your .env:");
  logger.info("VITE_MEDUSA_PUBLISHABLE_KEY=pk_...");
  logger.info("");
}
