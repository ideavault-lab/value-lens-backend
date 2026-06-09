import { successResponse } from "../../../shared/utils/api-response.js";
import DraftService from "../services/draft-service.js";

class DraftController {
    /**
     * GET /drafts
     * List all drafts for the authenticated user (max 3).
     */
    async getDrafts(request, reply) {
        const draftService = new DraftService(request.server.redis);
        // const userId = request.user.id; // adjust to your auth shape
        const userId = 1;

        const data = await draftService.getAllDrafts(userId);

        return reply.send(
            successResponse({ data, message: "Drafts retrieved successfully" })
        );
    }

    /**
     * GET /drafts/:draftId
     * Get a single draft — draftId format: "{userId}-{1|2|3}"
     */
    async getDraft(request, reply) {
        const draftService = new DraftService(request.server.redis);
        const userId = 1; // request.user.id;
        const { draftId } = request.params; // expected format: "{userId}-{slotId}"
         
        const data = await draftService.getDraft(userId, draftId);

        return reply.send(
            successResponse({ data, message: "Draft retrieved successfully" })
        );
    }

    /**
     * POST /drafts
     * Save a new draft OR update an existing one.
     *
     * Body: { draftId?: string, ...vehicleFormFields }
     *
     * - If `draftId` is present  → update that draft slot.
     * - If `draftId` is absent   → create a new slot (evicts oldest when all 3 are full).
     */
    async saveDraft(request, reply) {
        const draftService = new DraftService(request.server.redis);
        // const userId = request.user.id;
        const userId = 1;
        const { draftId, ...payload } = request.body;

        const data = await draftService.saveDraft(userId, payload, draftId ?? null);

        const isUpdate = Boolean(draftId);
        return reply
            .status(isUpdate ? 200 : 201)
            .send(
                successResponse({
                    data,
                    message: isUpdate ? "Draft updated successfully" : "Draft saved successfully",
                })
            );
    }

    /**
     * DELETE /drafts/:draftId
     * Remove a single draft slot.
     */
    async deleteDraft(request, reply) {
        const draftService = new DraftService(request.server.redis);
        const userId = request.user.id;
        const { draftId } = request.params;

        const data = await draftService.deleteDraft(userId, draftId);

        return reply.send(
            successResponse({ data, message: "Draft deleted successfully" })
        );
    }

    /**
     * DELETE /drafts
     * Wipe all drafts for the authenticated user.
     */
    async deleteAllDrafts(request, reply) {
        const draftService = new DraftService(request.server.redis);
        const userId = request.user.id;

        const data = await draftService.deleteAllDrafts(userId);

        return reply.send(
            successResponse({ data, message: "All drafts cleared successfully" })
        );
    }
}

export default new DraftController();