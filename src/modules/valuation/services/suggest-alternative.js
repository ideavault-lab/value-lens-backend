
// ============================================================
// 2. Call this every time your valuation engine returns a
//    prediction for a specific model — cheap, O(1) write.
// ============================================================
// src/services/recordValuation.service.js

import {VehicleModel} from "../../vehicle/models/vehicle-model.model.js";

const DEPRECIATION_RATE = 0.09; // keep in sync with your valuation engine's curve
const EMA_ALPHA = 0.2; // higher = more weight to recent valuations, lower = smoother/slower to shift

function normalizeToBaseline(predictedValueLakh, ageYears) {
  // "undo" depreciation to bring any valuation back to a common age=0 baseline,
  // so valuations from different ages/km are comparable and averageable.
  const depreciationFactor = Math.pow(1 - DEPRECIATION_RATE, Math.max(ageYears, 0));
  return predictedValueLakh / depreciationFactor;
}

async function recordValuation({ modelId, predictedValueLakh, vehicleAgeYears }) {
  console.log(`recordValuation: modelId=${modelId}, predictedValueLakh=${predictedValueLakh}, vehicleAgeYears=${vehicleAgeYears}`);
  const normalized = normalizeToBaseline(predictedValueLakh, vehicleAgeYears);
  const doc = await VehicleModel.findById(modelId).select('normalizedValueLakh valuationSampleCount');
  if (!doc) return;

  const isFirstSample = !doc.normalizedValueLakh || doc.valuationSampleCount === 0;
  const updatedNormalized = isFirstSample
    ? normalized
    : doc.normalizedValueLakh * (1 - EMA_ALPHA) + normalized * EMA_ALPHA;

  await VehicleModel.updateOne(
    { _id: modelId },
    {
      $set: { normalizedValueLakh: updatedNormalized, lastValuationAt: new Date() },
      $inc: { valuationSampleCount: 1 },
    }
  );
}

// ============================================================
// 3. Suggestion service — no per-request computation of
//    candidate values, just a cheap re-application of
//    depreciation to the cached normalized baseline.
// ============================================================
// src/services/suggestAlternatives.service.js

function estimateCurrentValueFromCache(candidate, ageYears) {
  if (!candidate.normalizedValueLakh) return null; // no valuations recorded yet for this model
  const depreciationFactor = Math.pow(1 - DEPRECIATION_RATE, Math.max(ageYears, 0));
  return candidate.normalizedValueLakh * depreciationFactor;
}

const FRESHNESS_MONTHS = 6;

function freshnessCutoff() {
  const d = new Date();
  d.setMonth(d.getMonth() - FRESHNESS_MONTHS);
  return d;
}

/**
 * Tiered fetch: prefer same-segment + fresh data, and only widen the pool
 * (segment first, then staleness) if there genuinely isn't enough fresh data.
 * A hard "always exclude stale" rule with no fallback would silently return
 * empty/short suggestion lists for thin segments — so we relax in stages
 * instead of failing quietly.
 */
async function fetchCandidatePool(current, limit) {
  const baseFilter = {
    _id: { $ne: current._id },
    enabled: true,
    discontinued: false,
    normalizedValueLakh: { $ne: null },
  };
  const cutoff = freshnessCutoff();

  // Tier 1: same segment, fresh valuation
  let pool = await VehicleModel.find({
    ...baseFilter,
    segment: current.segment,
    lastValuationAt: { $gte: cutoff },
  }).lean();
  if (pool.length >= limit) return { pool, usedStale: false };

  // Tier 2: same segment, any freshness (better a slightly-stale same-segment
  // suggestion than a fresh but irrelevant-segment one)
  const sameSegmentAny = await VehicleModel.find({
    ...baseFilter,
    segment: current.segment,
    lastValuationAt: { $lt: cutoff },
  }).lean();
  pool = pool.concat(sameSegmentAny);
  if (pool.length >= limit) return { pool, usedStale: sameSegmentAny.length > 0 };

  // Tier 3: adjacent segments, fresh valuation
  const adjacentFresh = await VehicleModel.find({
    ...baseFilter,
    segment: { $ne: current.segment },
    lastValuationAt: { $gte: cutoff },
  }).lean();
  pool = pool.concat(adjacentFresh);
  if (pool.length >= limit) return { pool, usedStale: sameSegmentAny.length > 0 };

  // Tier 4: adjacent segments, any freshness — last resort
  const adjacentAny = await VehicleModel.find({
    ...baseFilter,
    segment: { $ne: current.segment },
    lastValuationAt: { $lt: cutoff },
  }).lean();
  pool = pool.concat(adjacentAny);

  return { pool, usedStale: sameSegmentAny.length > 0 || adjacentAny.length > 0 };
}

async function suggestAlternatives({
  currentModelId,
  predictedValueLakh,
  vehicleAgeYears,
  limit = 5,
}) {
  console.log({ currentModelId, predictedValueLakh, vehicleAgeYears, limit });
  const current = await VehicleModel.findById(currentModelId).lean();
  if (!current) throw new Error('Model not found');

  const { pool: candidates } = await fetchCandidatePool(current, limit);

  const scored = candidates
    .map((c) => {
      const estValue = estimateCurrentValueFromCache(c, vehicleAgeYears);
      if (estValue === null) return null;

      const valueDiffPct = Math.abs(estValue - predictedValueLakh) / predictedValueLakh;
      const sameSegment = c.segment === current.segment;
      const demandDelta = c.resaleDemand - current.resaleDemand;
      const isStale = c.lastValuationAt < freshnessCutoff();

      const score =
        valueDiffPct * 10 +
        (sameSegment ? 0 : 3) +
        (demandDelta < 0 ? Math.abs(demandDelta) * 2 : 0) +
        (isStale ? 1.5 : 0); // stale data used only as fallback, ranked below fresh matches

      return { ...c, estimatedCurrentValueLakh: Number(estValue.toFixed(2)), score };
    })
    .filter(Boolean);

  return scored
    .sort((a, b) => a.score - b.score)
    .slice(0, limit)
    .map(({ score, ...rest }) => rest);
}

export { recordValuation, suggestAlternatives };