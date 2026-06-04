import { normalizeText } from "../utils/normalise.utils.js";
import { ScraperService } from "./scraper.service.js";
import { badRequest, internalServerError } from "../../../shared/utils/errors.js";
import marketRepository from "../repositories/market.repository.js";

const scraperService = new ScraperService();

class MarketService {

  async scrapeAndStore({ brand, model }) {
    if (!brand || !model) {
      throw badRequest("Brand and model are required");
    }

    const normalizedBrand = normalizeText(brand);
    const normalizedModel = normalizeText(model);

    let scrapedListings = [];

    try {
      scrapedListings = await scraperService.scrapeUsedCars({
        brand: normalizedBrand,
        model: normalizedModel,
      });
    } catch (error) {
      console.error("SCRAPER ERROR FULL:", error);
      throw internalServerError(error?.message || "Failed to scrape market listings");
    }

    if (!scrapedListings.length) {
      return { inserted: 0, listings: [] };
    }

    const formattedListings = scrapedListings.map((item) => ({
      source: "carwale",                    // Changed from OLX
      brand: normalizedBrand,
      model: normalizedModel,
      variant: item.variant || "Unknown",
      title: item.title || "",
      year: item.year || null,
      kmDriven: item.kmDriven ? Number(item.kmDriven) : null,
      fuelType: item.fuelType || "unknown",
      transmission: item.transmission || "unknown",
      ownership: "unknown",
      city: item.city || "unknown",
      price: item.price || 0,
      listingUrl: item.url || "",           // Added to match schema
      scrapedAt: new Date(),
    }));

    if (formattedListings.length) {
      await marketRepository.createMany(formattedListings);
    }

    return {
      inserted: formattedListings.length,
      listings: formattedListings,
    };
  }

  // getMarketAverage remains same...
  async getMarketAverage({ brand, model, year, city }) {
    const listings = await marketRepository.findSimilarVehicles({
      brand: normalizeText(brand),
      model: normalizeText(model),
      year,
      city,
    });

    if (!listings.length) {
      return { averagePrice: null, totalListings: 0, listings: [] };
    }

    const prices = listings.map(x => x.price).filter(Boolean);
    const total = prices.reduce((acc, curr) => acc + curr, 0);
    const averagePrice = Math.round(total / prices.length);

    return {
      averagePrice,
      totalListings: listings.length,
      minPrice: Math.min(...prices),
      maxPrice: Math.max(...prices),
      listings,
    };
  }
}

export default new MarketService();