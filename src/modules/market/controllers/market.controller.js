import { successResponse } from "../../../shared/utils/api-response.js";

import marketService from "../services/market.service.js";

class MarketController {

  async scrape(request, reply) {

    const {
      brand,
      model,
    } = request.body;

    const data =
      await marketService.scrapeAndStore({
        brand,
        model,
      });

    return reply.send(
      successResponse({
        data,
        message:
          "Market listings scraped successfully",
      })
    );
  }

  async getAverage(request, reply) {

    const {
      brand,
      model,
      year,
      city,
    } = request.query;

    const data =
      await marketService.getMarketAverage({
        brand,
        model,
        year: Number(year),
        city,
      });

    return reply.send(
      successResponse({
        data,
        message:
          "Market average retrieved successfully",
      })
    );
  }
}

export default new MarketController();