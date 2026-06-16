import { VehicleBrand } from "../../vehicle/models/vehicle-brand.model.js";
import { VehicleModel } from "../../vehicle/models/vehicle-model.model.js";
import { VehicleVariant } from "../../vehicle/models/vehicle-variant.model.js";

class DraftMapper {

     async toEngineInput(draft) {

        const brand =
            await VehicleBrand.findById(draft.brandId);

        const model =
            await VehicleModel.findById(draft.modelId);

        const variant =
            await VehicleVariant.findById(draft.variantId);

        return {
            vehicleType: {
                slug: draft.vehicleType,
            },

            brand,

            model,

            variant,

            year: draft.year,

            kmDriven: draft.kmDriven,

            ownership: {
                id:
                    draft.ownership
                        .toLowerCase()
                        .replace(" owner", ""),
            },

            condition: {
                id:
                    draft.condition.toLowerCase(),
            },

            conditionIssues:
                draft.conditionIssues,

            city: {
                name: draft.city,
            },
        };
    }
}

export default new DraftMapper();