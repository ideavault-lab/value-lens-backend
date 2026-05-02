import { LOCATIONS } from "../data/locations.js";

export default async function locationRoutes(app) {
  // GET /api/locations
  app.get("/locations", {
    schema: {
      tags: ["reference"],
      summary: "List all supported cities with demand tier and demand scores",
      response: {
        200: {
          type: "object",
          properties: {
            count: { type: "number" },
            note:  { type: "string" },
            locations: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  city:       { type: "string" },
                  tier:       { type: "string" },
                  demand:     { type: "number" },
                  ev_demand:  { type: "number" },
                },
              },
            },
          },
        },
      },
    },
    handler: async () => {
      const locations = Object.entries(LOCATIONS).map(([city, d]) => ({
        city,
        tier:      d.tier,
        demand:    d.demand,
        ev_demand: d.evDemand,
      }));

      return {
        count: locations.length,
        note: "Cities not in this list fall back to a tier-2 demand score of 0.93 (0.90 for EVs).",
        locations,
      };
    },
  });
}