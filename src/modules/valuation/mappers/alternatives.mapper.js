export function mapAlternative(model, brand, variant) {
  return {
    id: String(model._id),

    brand: brand?.name ?? null,

    model: model.name,

    variant: variant?.name ?? null,

    year: variant?.year ?? model.launchYear,

    segment: model.segment,

    price: model.basePriceLakh,

    estimatedCurrentValue:
      model.estimatedCurrentValueLakh,

    resaleDemand: model.resaleDemand,

    fuel:
      variant?.fuelTypeId?.name ?? null,

    transmission:
      variant?.transmissionId?.name ?? null,
  };
}

export function mapAlternatives(
  models,
  brandMap,
  variantMap
) {
  return models.map(model =>
    mapAlternative(
      model,
      brandMap.get(String(model.brandId)),
      variantMap.get(String(model._id))
    )
  );
}