// src/valuation/mappers/draft.mapper.js

import { VehicleBrand }        from "../../vehicle/models/vehicle-brand.model.js";
import { VehicleModel }        from "../../vehicle/models/vehicle-model.model.js";
import { VehicleVariant }      from "../../vehicle/models/vehicle-variant.model.js";
import { VehicleType }         from "../../vehicle/models/vehicle-type.model.js";

class DraftMapper {

  /**
   * Converts a raw Redis draft into a fully-hydrated engine input.
   * Runs 3 DB queries in parallel — no sequential waterfalls.
   */
  async toEngineInput(draft) {

    // ── Parallel DB lookups ────────────────────────────────────────────
    const [vehicleType, brand, model, variant] = await Promise.all([
      VehicleType.findOne({ slug: draft.vehicleType }).lean(),
      VehicleBrand.findById(draft.brandId).lean(),
      VehicleModel.findById(draft.modelId).lean(),
      VehicleVariant.findById(draft.variantId)
        .populate("fuelTypeId",      "slug label")   // ← get fuel name
        .populate("transmissionId",  "slug label")   // ← get transmission name
        .lean(),
    ]);

    // ── Guard: critical fields must exist ─────────────────────────────
    if (!brand)   throw new Error(`Brand not found: ${draft.brandId}`);
    if (!model)   throw new Error(`Model not found: ${draft.modelId}`);
    if (!variant) throw new Error(`Variant not found: ${draft.variantId}`);

    // ── Normalize ownership string → id ───────────────────────────────
    const ownershipId = draft.ownership
      ?.toLowerCase()
      .replace(/\s+owner$/i, "")   // "Second Owner" → "second"
      .trim() ?? "first";

    return {
      vehicleType: vehicleType ?? { slug: draft.vehicleType ?? "car" },
      brand,
      model,
      variant,

      // Fuel + transmission now come from populated variant refs
      fuelType:     variant.fuelTypeId,       // { _id, slug, label }
      transmission: variant.transmissionId,   // { _id, slug, label }

      year:            draft.year ?? variant.year,
      kmDriven:        draft.kmDriven ?? 0,
      ownership:       { id: ownershipId },
      condition:       { id: draft.condition?.toLowerCase() ?? "good" },
      conditionIssues: draft.conditionIssues ?? [],
      city:            { name: draft.city ?? "" },
    };
  }
}

export default new DraftMapper();