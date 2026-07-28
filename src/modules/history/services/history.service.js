import { ValuationHistory } from "./history.model.js";

/**
 * Call this from your existing predict/valuation route after computing a result.
 * Fire-and-forget safe: wrap in try/catch at the call site if you don't want
 * a history-save failure to break the valuation response.
 */
export async function saveHistory(userId, { input, result }) {
  return ValuationHistory.create({ user: userId, input, result });
}

export async function getHistoryForUser(userId, { limit = 20, skip = 0 } = {}) {
  const [items, total] = await Promise.all([
    ValuationHistory.find({ user: userId })
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .lean(),
    ValuationHistory.countDocuments({ user: userId }),
  ]);

  return { items, total };
}

export async function getHistoryEntry(userId, entryId) {
  return ValuationHistory.findOne({ _id: entryId, user: userId }).lean();
}

export async function deleteHistoryEntry(userId, entryId) {
  return ValuationHistory.findOneAndDelete({ _id: entryId, user: userId });
}