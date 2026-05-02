import { predictCarValue } from "../engine/predict.js";

// ── Shared JSON schema for a single car input ──────────────────────────────
const CAR_INPUT = {
  type: "object",
  required: [
    "brand", "model", "year", "km_driven",
    "fuel_type", "transmission", "condition", "owner_type", "location",
  ],
  additionalProperties: false,
  properties: {
    brand:        { type: "string", description: "Brand ID (e.g. 'maruti', 'bmw')" },
    model:        { type: "string", description: "Model name (e.g. 'Swift', '5 Series')" },
    year:         { type: "integer", minimum: 1990, maximum: new Date().getFullYear(), description: "Manufacturing year" },
    km_driven:    { type: "number",  minimum: 0, maximum: 1_000_000, description: "Odometer reading in km" },
    fuel_type:    { type: "string",  enum: ["petrol", "diesel", "electric", "hybrid", "cng"] },
    transmission: { type: "string",  enum: ["manual", "automatic"] },
    condition:    { type: "string",  enum: ["excellent", "good", "fair", "poor"] },
    owner_type:   { type: "string",  enum: ["first", "second", "third", "fourth_plus"] },
    location:     { type: "string",  description: "City name (e.g. 'Mumbai', 'Bangalore')" },
  },
};

// ── Shared JSON schema for a prediction result ─────────────────────────────
const PREDICTION_RESULT = {
  type: "object",
  properties: {
    predicted_price: { type: "number", description: "Predicted resale price in ₹ Lakhs" },
    price_low:       { type: "number", description: "Lower bound of price range (₹ Lakhs)" },
    price_high:      { type: "number", description: "Upper bound of price range (₹ Lakhs)" },
    confidence:      { type: "number", description: "Confidence score (50–96)" },
    explanation:     { type: "string", description: "Plain-English explanation of key drivers" },
    meta: {
      type: "object",
      properties: {
        base_price_lakh:      { type: "number" },
        age_years:            { type: "number" },
        segment:              { type: "string" },
        depreciation_profile: { type: "string" },
        is_luxury:            { type: "boolean" },
        brand_known:          { type: "boolean" },
        model_known:          { type: "boolean" },
      },
    },
    factors: {
      type: "object",
      description: "Percentage-point impact of each factor vs neutral baseline",
      additionalProperties: { type: "number" },
    },
  },
};

// ── Plugin ────────────────────────────────────────────────────────────────────
export default async function predictRoutes(app) {
  // POST /api/predict
  app.post("/predict", {
    schema: {
      tags: ["prediction"],
      summary: "Predict resale value for a single car",
      body: CAR_INPUT,
      response: { 200: PREDICTION_RESULT },
    },
    handler: async (request) => {
      return predictCarValue(request.body);
    },
  });

  // POST /api/predict/batch
  app.post("/predict/batch", {
    schema: {
      tags: ["prediction"],
      summary: "Predict resale values for up to 20 cars in one request",
      body: {
        type: "object",
        required: ["cars"],
        properties: {
          cars: {
            type: "array",
            items: CAR_INPUT,
            minItems: 1,
            maxItems: 20,
            description: "Array of car inputs",
          },
        },
      },
      response: {
        200: {
          type: "object",
          properties: {
            count:   { type: "number" },
            results: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  index:  { type: "number" },
                  result: PREDICTION_RESULT,
                  error:  { type: "string" },
                },
              },
            },
          },
        },
      },
    },
    handler: async (request) => {
      const results = request.body.cars.map((car, index) => {
        try {
          return { index, result: predictCarValue(car) };
        } catch (err) {
          return { index, error: err.message };
        }
      });

      return { count: results.length, results };
    },
  });

  // POST /api/compare
  app.post("/compare", {
    schema: {
      tags: ["prediction"],
      summary: "Compare resale value of two cars side by side",
      body: {
        type: "object",
        required: ["car_a", "car_b"],
        properties: {
          car_a: CAR_INPUT,
          car_b: CAR_INPUT,
        },
      },
      response: {
        200: {
          type: "object",
          properties: {
            car_a:      PREDICTION_RESULT,
            car_b:      PREDICTION_RESULT,
            comparison: {
              type: "object",
              properties: {
                higher_value:          { type: "string", enum: ["car_a", "car_b", "tie"] },
                price_difference_lakh: { type: "number" },
                recommendation:        { type: "string" },
              },
            },
          },
        },
      },
    },
    handler: async (request) => {
      const [a, b] = [request.body.car_a, request.body.car_b].map(predictCarValue);

      const diff = Math.abs(a.predicted_price - b.predicted_price);
      let higher_value = "tie";
      let recommendation = "Both cars are estimated at a similar resale value.";

      if (a.predicted_price > b.predicted_price + 0.01) {
        higher_value = "car_a";
        recommendation = `Car A offers ₹${diff.toFixed(2)}L higher resale value.`;
      } else if (b.predicted_price > a.predicted_price + 0.01) {
        higher_value = "car_b";
        recommendation = `Car B offers ₹${diff.toFixed(2)}L higher resale value.`;
      }

      return {
        car_a: a,
        car_b: b,
        comparison: {
          higher_value,
          price_difference_lakh: Math.round(diff * 100) / 100,
          recommendation,
        },
      };
    },
  });
}