export const VEHICLE_TYPES = [
  {
    slug: "car",

    label: "Car",

    shortLabel: "Cars",

    description:
      "Cars, SUVs, Sedans & Hatchbacks",

    icon: "car",

    enabled: true,

    popular: true,

    order: 1,

    cta: "Check Market Price",

    stats: {
      supportedBrands: 18,
      activeListings: "120K+",
    },

    seo: {
      title: "Used Car Valuation",
      slug: "car",
    },
  },

  {
    slug: "bike",

    label: "Bike / Scooter",

    shortLabel: "Bikes",

    description:
      "Motorcycles & scooters valuation coming soon",

    icon: "bike",

    enabled: false,

    popular: false,

    order: 2,

    cta: "Coming Soon",

    seo: {
      title: "Used Bike Valuation",
      slug: "bike",
    },
  },

  {
    slug: "truck",

    label: "Truck & Commercial",

    shortLabel: "Commercial",

    description:
      "Heavy vehicles & fleet pricing coming soon",

    icon: "truck",

    enabled: false,

    popular: false,

    order: 3,

    cta: "Coming Soon",

    seo: {
      title:
        "Commercial Vehicle Valuation",

      slug: "truck",
    },
  },
];