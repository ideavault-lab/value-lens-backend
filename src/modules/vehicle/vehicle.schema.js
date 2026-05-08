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
  tags: ["Vehicle"],
  summary: "Get brands by vehicle type",

  params: {
    type: "object",
    required: ["type"],
    properties: {
      type: {
        type: "string",
      },
    },
  },
};

export const getBrandModelsSchema = {
  tags: ["Vehicle"],
  summary: "Get models by brand",

  params: {
    type: "object",
    required: ["type", "brandId"],
    properties: {
      type: {
        type: "string",
      },
      brandId: {
        type: "string",
      },
    },
  },
};