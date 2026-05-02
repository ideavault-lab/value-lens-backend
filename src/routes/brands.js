import { BRANDS } from "../data/brands.js";

export default async function brandRoutes(app) {
  // GET /api/brands
  app.get("/brands", {
    schema: {
      tags: ["reference"],
      summary: "List all supported brands with metadata and available models",
      response: {
        200: {
          type: "object",
          properties: {
            count: { type: "number" },
            brands: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  id:                   { type: "string" },
                  segment:              { type: "string" },
                  depreciation_profile: { type: "string" },
                  resale_demand:        { type: "number" },
                  exited_market:        { type: "boolean" },
                  model_count:          { type: "number" },
                  models:               { type: "array", items: { type: "string" } },
                },
              },
            },
          },
        },
      },
    },
    handler: async () => {
      const brands = Object.entries(BRANDS).map(([id, d]) => ({
        id,
        segment:              d.segment,
        depreciation_profile: d.depreciationProfile,
        resale_demand:        d.resaleDemand,
        exited_market:        d.exitedMarket ?? false,
        model_count:          Object.keys(d.models ?? {}).length,
        models:               Object.keys(d.models ?? {}),
      }));

      return { count: brands.length, brands };
    },
  });

  // GET /api/brands/:brandId
  app.get("/brands/:brandId", {
    schema: {
      tags: ["reference"],
      summary: "Get full detail for a specific brand including all model base prices",
      params: {
        type: "object",
        required: ["brandId"],
        properties: {
          brandId: { type: "string", description: "Brand ID (e.g. 'maruti', 'bmw')" },
        },
      },
      response: {
        200: {
          type: "object",
          properties: {
            id:                   { type: "string" },
            segment:              { type: "string" },
            depreciation_profile: { type: "string" },
            resale_demand:        { type: "number" },
            base_price_lakh:      { type: "number" },
            exited_market:        { type: "boolean" },
            models: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  name:         { type: "string" },
                  base_price:   { type: "number" },
                  segment:      { type: "string" },
                  resale_score: { type: "number" },
                },
              },
            },
          },
        },
        404: {
          type: "object",
          properties: {
            statusCode: { type: "number" },
            error:      { type: "string" },
            message:    { type: "string" },
          },
        },
      },
    },
    handler: async (request, reply) => {
      const { brandId } = request.params;
      const data = BRANDS[brandId.toLowerCase()];

      if (!data) {
        return reply.code(404).send({
          statusCode: 404,
          error: "Not Found",
          message: `Brand '${brandId}' not found. Use GET /api/brands for a full list.`,
        });
      }

      const models = Object.entries(data.models ?? {}).map(([name, m]) => ({
        name,
        base_price:   m.base,
        segment:      m.segment,
        resale_score: m.resale,
      }));

      return {
        id:                   brandId.toLowerCase(),
        segment:              data.segment,
        depreciation_profile: data.depreciationProfile,
        resale_demand:        data.resaleDemand,
        base_price_lakh:      data.basePriceLakh,
        exited_market:        data.exitedMarket ?? false,
        models,
      };
    },
  });
}