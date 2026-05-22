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


// schemas/get-model-variants.schema.js

export const getModelVariantsSchema = {

  tags: ["Vehicles"],

  summary:
    "Get vehicle variants by model",

  params: {

    type: "object",

    required: [
      "type",
      "brandId",
      "modelId",
    ],

    properties: {

      type: {
        type: "string",
      },

      brandId: {
        type: "string",
      },

      modelId: {
        type: "string",
      },
    },
  },

  querystring: {

    type: "object",

    properties: {

      year: {
        type: "number",
      },

      search: {
        type: "string",
      },
    },
  },

  response: {

    200: {

      type: "object",

      properties: {

        status: {
          type: "boolean",
        },

        statusCode: {
          type: "number",
        },

        message: {
          type: "string",
        },

        data: {

          type: "array",

          items: {

            type: "object",

            properties: {

              id: {
                type: "string",
              },

              year: {
                type: "number",
              },

              slug: {
                type: "string",
              },

              name: {
                type: "string",
              },

              engineCc: {
                type: "number",
              },

              mileage: {
                type: "number",
              },

              powerBhp: {
                type: "number",
              },

              torqueNm: {
                type: "number",
              },

              drivetrain: {
                type: "string",
              },

              exShowroomPriceLakh: {
                type: "number",
              },

              fuelType: {

                type: "object",

                properties: {

                  id: {
                    type: "string",
                  },

                  slug: {
                    type: "string",
                  },

                  name: {
                    type: "string",
                  },

                  icon: {
                    type: "string",
                  },

                  description: {
                    type: "string",
                  },
                },
              },

              transmission: {

                type: "object",

                properties: {

                  id: {
                    type: "string",
                  },

                  slug: {
                    type: "string",
                  },

                  name: {
                    type: "string",
                  },

                  icon: {
                    type: "string",
                  },

                  description: {
                    type: "string",
                  },
                },
              },
            },
          },
        },

        timestamp: {
          type: "string",
        },
      },
    },
  },
};
