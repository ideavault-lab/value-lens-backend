export const getVehicleTypesSchema = {
  type: "object",
  required: ["type"],
  properties: {
    type: {
      type: "string",
      enum: ["car", "bike"],
    },
  },
};


export const getBrandsSchema = {
  params: {
    type: "object",
    required: ["type"],

    properties: {
      type: {
        type: "string",
      },
    },
  },

  querystring: {
    type: "object",

    properties: {
      search: {
        type: "string",
      },
    },
  },
};

export const getBrandModelsSchema = {
  params: {
    type: "object",
    required: ["type", "brandId"],
    properties: {
      type: { type: "string" },
      brandId: { type: "string" },
    },
  },

  querystring: {
    type: "object",
    properties: {
      search: { type: "string" },
    },
  },
};