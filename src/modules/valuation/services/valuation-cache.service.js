// src/valuation/services/valuation-cache.service.js

import valuationResultRepository from "../repositories/valuation-result.repository.js";

import valuationCacheFormatter from "../responses/valuation-cache.response.js";

/**
 * ValuationCacheService
 *
 * Thin service layer — keeps the controller clean and gives you
 * one place to add logging, metrics, or fallback logic later.
 *
 * Repository  → raw DB operations (Mongoose)
 * Service     → business rules around caching (TTL decisions, logging)
 * Controller  → orchestration only
 */
class ValuationCacheService {

  /**
   * Returns a valid cached result or null.
   */
  async get(draftId) {

    const cached =
      await valuationResultRepository
        .findByDraftId(draftId);

    if (!cached) return null;

    console.info(
      `[ValuationCache] HIT draftId=${draftId}`
    );

    return valuationCacheFormatter.toApiResponse(cached);
  }
  /**
   * Persists the engine result.
   * Returns the saved document.
   */
  async save({ draftId, vehicleType, engineResult }) {
    const saved = await valuationResultRepository.upsert({
      draftId,
      vehicleType,
      engineResult,
    });

    console.info(`[ValuationCache] SAVE draftId=${draftId} vehicleType=${vehicleType}`);
    return saved;
  }

  /**
   * Invalidates cache — call before re-running the engine for the same draft.
   */
  async invalidate(draftId) {
    const deleted = await valuationResultRepository.deleteByDraftId(draftId);
    console.info(`[ValuationCache] INVALIDATE draftId=${draftId} deleted=${deleted}`);
    return deleted;
  }
}

export default new ValuationCacheService();