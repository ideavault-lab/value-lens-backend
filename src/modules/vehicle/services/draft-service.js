import valuationCacheService from "../../valuation/services/valuation-cache.service.js";
import { generateDraftId, parseDraftId } from "../../../shared/utils/draft-id-utils.js";
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
const draftKey = (userId, draftId) => `${userId}:draft:${draftId}`;

class DraftService {
    constructor(redis) {
        this.redis = redis;
    }

    /**
     * Returns all slots in use for a user: [{ id, ...draftData }]
     */
    async getAllDrafts(userId) {
        const ids = await this.redis.lrange(indexKey(userId), 0, -1);

        if (!ids.length) return [];

        const pipeline = this.redis.pipeline();

        ids.forEach(id =>
            pipeline.get(draftKey(userId, id))
        );

        const rows = await pipeline.exec();

        return rows
            .map(([err, raw], index) => {
                if (err || !raw) return null;

                return {
                    draftId: ids[index],
                    slot: index + 1,
                    ...JSON.parse(raw)
                };
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

        //
        // UPDATE
        //

        if (draftId) {

            const parsed = parseDraftId(draftId);

            if (parsed.userId !== Number(userId)) {
                throw Object.assign(
                    new Error("Draft does not belong to this user"),
                    { statusCode: 403 }
                );
            }

            const key = draftKey(userId, parsed.draftId);

            const exists = await redis.exists(key);

            if (!exists)
                throw Object.assign(
                    new Error("Draft not found"),
                    { statusCode: 404 }
                );

            const old = JSON.parse(await redis.get(key));

            const draft = {
                ...old,
                ...payload,
                updatedAt: new Date().toISOString()
            };

            await redis.set(
                key,
                JSON.stringify(draft),
                "EX",
                DRAFT_TTL_SECONDS
            );

            return {
                draftId,
                ...draft
            };
        }

        //
        // CREATE
        //

        const ids = await redis.lrange(indexKey(userId), 0, -1);

        let newId = generateDraftId(userId);

        //
        // evict oldest
        //

        if (ids.length >= MAX_DRAFTS) {

            const oldest = await redis.lpop(indexKey(userId));

            await redis.del(
                draftKey(userId, oldest)
            );

            //
            // VERY IMPORTANT
            // delete cached valuation too
            //

            await valuationCacheService.invalidate(oldest);
        }

        const now = new Date().toISOString();

        const draft = {

            ...payload,

            createdAt: now,
            updatedAt: now
        };

        const pipeline = redis.pipeline();

        pipeline.set(
            draftKey(userId, newId),
            JSON.stringify(draft),
            "EX",
            DRAFT_TTL_SECONDS
        );

        pipeline.rpush(
            indexKey(userId),
            newId
        );

        pipeline.expire(
            indexKey(userId),
            DRAFT_TTL_SECONDS
        );

        await pipeline.exec();

        return {
            draftId: newId,
            ...draft
        };
    }

    /**
     * Get a single draft by draftId ("{userId}-{slotId}").
     */
    async getDraft(userId, draftId) {

        const parsed = parseDraftId(draftId);

        if (parsed.userId !== Number(userId)) {
            throw Object.assign(
                new Error("Draft does not belong to this user"),
                { statusCode: 403 }
            );
        }

        const raw = await this.redis.get(
            draftKey(userId, parsed.draftId)
        );

        if (!raw)
            throw Object.assign(
                new Error("Draft not found"),
                { statusCode: 404 }
            );

        return {
            draftId,
            ...JSON.parse(raw)
        };
    }

    /**
     * Delete a single draft by draftId.
     */
    async deleteDraft(userId, draftId) {
        const parsed = parseDraftId(draftId);

        if (parsed.userId !== Number(userId)) {
            throw Object.assign(
                new Error("Draft does not belong to this user"),
                { statusCode: 403 }
            );
        }

        const deleted = await this.redis.del(
            draftKey(userId, parsed.draftId)
        );

        if (!deleted)
            throw Object.assign(
                new Error("Draft not found"),
                { statusCode: 404 }
            );

        await this.redis.lrem(
            indexKey(userId),
            0,
            draftId
        );

        await valuationCacheService.invalidate(draftId);

        return {
            deleted: true
        };
    }

    /**
     * Delete all drafts for a user.
     */
    async deleteAllDrafts(userId) {

        const ids = await this.redis.lrange(
            indexKey(userId),
            0,
            -1
        );

        const pipeline = this.redis.pipeline();

        ids.forEach(id => {

            pipeline.del(
                draftKey(userId, id)
            );

        });

        pipeline.del(indexKey(userId));

        await pipeline.exec();

        await Promise.all(
            ids.map(id => valuationCacheService.invalidate(id))
        );

        return {
            deleted: ids.length
        };
    }

}

export default DraftService;