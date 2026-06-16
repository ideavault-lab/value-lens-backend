/**
 * Draft Service
 * Redis-backed draft storage with max-3 slots per user.
 *
 * Key schema:
 *   {userId}:draft:index        → Redis LIST  — ordered slot ids e.g. ["1","3","2"]
 *   {userId}:draft:{slotId}     → Redis STRING (JSON) — the draft payload
 *
 * slotId is always 1, 2, or 3.
 * When all 3 slots are full, saving a new draft evicts the oldest one (LRU).
 */

const DRAFT_TTL_SECONDS = 60 * 60 * 24 * 7; // 7 days
const MAX_DRAFTS = 3;

const indexKey = (userId) => `${userId}:draft:index`;
const draftKey = (userId, slotId) => `${userId}:draft:${slotId}`;

class DraftService {
    constructor(redis) {
        this.redis = redis;
    }

    /**
     * Returns all slots in use for a user: [{ id, ...draftData }]
     */
    async getAllDrafts(userId) {
        const slots = await this.redis.lrange(indexKey(userId), 0, -1);
        if (!slots.length) return [];

        const pipeline = this.redis.pipeline();
        slots.forEach((slotId) => pipeline.get(draftKey(userId, slotId)));
        const results = await pipeline.exec();

        return results
            .map(([err, raw], i) => {
                if (err || !raw) return null;
                const parsed = JSON.parse(raw);
                return { id: `${userId}-${slots[i]}`, slotId: slots[i], ...parsed };
            })
            .filter(Boolean);
    }

    /**
     * Save or update a draft.
     * - If `draftId` is provided (format: "{userId}-{slotId}"), update that slot.
     * - Otherwise allocate a new slot (evict oldest if all 3 are taken).
     * Returns the saved draft with its id.
     */
    async saveDraft(userId, payload, draftId = null) {
        const redis = this.redis;

        // ── UPDATE path ──────────────────────────────────────────────────────
        if (draftId) {
            const slotId = this._parseSlotId(userId, draftId);
            const key = draftKey(userId, slotId);
            const exists = await redis.exists(key);
            if (!exists) {
                throw Object.assign(new Error("Draft not found"), { statusCode: 404 });
            }

            const draft = { ...payload, updatedAt: new Date().toISOString() };
            await redis.set(key, JSON.stringify(draft), "EX", DRAFT_TTL_SECONDS);

            // Refresh TTL on index list too
            await redis.expire(indexKey(userId), DRAFT_TTL_SECONDS);

            return { id: draftId, slotId, ...draft };
        }

        // ── CREATE path ───────────────────────────────────────────────────────
        const slots = await redis.lrange(indexKey(userId), 0, -1);
        const usedSlots = new Set(slots.map(Number));
        let targetSlot = null;

        // Find a free slot (1–3)
        for (let i = 1; i <= MAX_DRAFTS; i++) {
            if (!usedSlots.has(i)) {
                targetSlot = String(i);
                break;
            }
        }

        if (targetSlot === null) {
            // All slots full — evict the oldest (leftmost in the index list)
            const evictedSlot = await redis.lpop(indexKey(userId));
            await redis.del(draftKey(userId, evictedSlot));
            targetSlot = evictedSlot;
        }

        const draft = {
            ...payload,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
        };

        const pipeline = redis.pipeline();
        pipeline.set(draftKey(userId, targetSlot), JSON.stringify(draft), "EX", DRAFT_TTL_SECONDS);
        pipeline.rpush(indexKey(userId), targetSlot);
        pipeline.expire(indexKey(userId), DRAFT_TTL_SECONDS);
        await pipeline.exec();

        return { draftId: `${userId}-${targetSlot}`, slotId: targetSlot, ...draft };
    }

    /**
     * Get a single draft by draftId ("{userId}-{slotId}").
     */
    async getDraft(userId, draftId) {
        const slotId = this._parseSlotId(userId, draftId);
        const raw = await this.redis.get(draftKey(userId, slotId));
        if (!raw) {
            throw Object.assign(new Error("Draft not found"), { statusCode: 404 });
        }
        return { id: draftId, slotId, ...JSON.parse(raw) };
    }

    /**
     * Delete a single draft by draftId.
     */
    async deleteDraft(userId, draftId) {
        const slotId = this._parseSlotId(userId, draftId);
        const deleted = await this.redis.del(draftKey(userId, slotId));
        if (!deleted) {
            throw Object.assign(new Error("Draft not found"), { statusCode: 404 });
        }
        // Remove slotId from index list
        await this.redis.lrem(indexKey(userId), 0, slotId);
        return { id: draftId, deleted: true };
    }

    /**
     * Delete all drafts for a user.
     */
    async deleteAllDrafts(userId) {
        const slots = await this.redis.lrange(indexKey(userId), 0, -1);
        if (!slots.length) return { deleted: 0 };

        const pipeline = this.redis.pipeline();
        slots.forEach((slotId) => pipeline.del(draftKey(userId, slotId)));
        pipeline.del(indexKey(userId));
        await pipeline.exec();

        return { deleted: slots.length };
    }

    // ── Helpers ──────────────────────────────────────────────────────────────

    _parseSlotId(userId, draftId) {
        // draftId format: "{userId}-{slotId}"
        const prefix = `${userId}-`;
        if (!draftId.startsWith(prefix)) {
            throw Object.assign(new Error("Invalid draft id"), { statusCode: 400 });
        }
        const slotId = draftId.slice(prefix.length);
        if (!["1", "2", "3"].includes(slotId)) {
            throw Object.assign(new Error("Invalid draft slot"), { statusCode: 400 });
        }
        return slotId;
    }
}

export default DraftService;