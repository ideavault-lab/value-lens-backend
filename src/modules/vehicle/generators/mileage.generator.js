class MileageGenerator {

  generate({
    model,
    fuelType,
    transmission,
    year,
  }) {

    const currentYear = new Date().getFullYear();
    const age = Math.max(1, currentYear - year);

    // Base Yearly Mileage (Realistic for India)
    let yearlyAverage = 13800;

    // SEGMENT ADJUSTMENT
    const segmentAdjustments = {
      hatchback: -2800,
      sedan: -1200,
      compact_suv: 2000,
      suv: 3400,
      crossover: 1600,
      mpv: 4500,
      luxury: -4500,
      pickup: 5800,
    };
    yearlyAverage += segmentAdjustments[model.segment] || 0;

    // RESALE DEMAND (Popular cars = less driven)
    if (model.resaleDemand >= 1.4) yearlyAverage -= 2800;
    else if (model.resaleDemand >= 1.3) yearlyAverage -= 1900;
    else if (model.resaleDemand >= 1.2) yearlyAverage -= 1100;
    else if (model.resaleDemand >= 1.1) yearlyAverage -= 600;

    // FUEL TYPE
    const fuelAdjustments = {
      diesel: 5200,
      petrol: 0,
      hybrid: -1800,
      electric: -5500,
      cng: 3600,
    };
    yearlyAverage += fuelAdjustments[fuelType.slug] || 0;

    // TRANSMISSION
    const transmissionAdjustments = {
      manual: 1900,
      automatic: -950,
      cvt: -1700,
      amt: 700,
      dct: -2500,
    };
    yearlyAverage += transmissionAdjustments[transmission.slug] || 0;

    // AGE FACTOR
    if (age >= 12) yearlyAverage = Math.round(yearlyAverage * 0.70);
    else if (age >= 8) yearlyAverage = Math.round(yearlyAverage * 0.80);
    else if (age >= 5) yearlyAverage = Math.round(yearlyAverage * 0.90);

    const expectedKm = Math.round(yearlyAverage * age);

    const minAllowed = model.mileageRange?.min || 0;
    const maxAllowed = model.mileageRange?.max || 400000;

    // ─── ZONES THRESHOLDS ─────────────────────────────────────
    const showroomMax = Math.round(expectedKm * 0.35);
    const excellentMax = Math.round(expectedKm * 0.62);
    const goodMax = Math.round(expectedKm * 0.95);
    const averageMax = Math.round(expectedKm * 1.35);
    const highMax = Math.round(expectedKm * 1.85);
    const extremeMax = Math.round(expectedKm * 2.45);

    // ─── QUICK PICKS ─────────────────────────────────────────
    const quickPicks = [
      { label: "Barely Driven", value: Math.round(showroomMax * 0.85) },
      { label: "City Usage", value: excellentMax },
      { label: "Ideal", value: goodMax },
      { label: "Family Use", value: averageMax },
      { label: "Frequent Travel", value: highMax },
      { label: "Commercial Heavy", value: extremeMax },
    ];

    // ─── ZONES (7 Levels) ─────────────────────────────────────
    const zones = [
      {
        min: minAllowed,
        max: showroomMax,
        label: "Showroom",
        emoji: "🆕",
        description: "Extremely low mileage • Collector level condition",
      },
      {
        min: showroomMax + 1,
        max: excellentMax,
        label: "Excellent",
        emoji: "✨",
        description: "Very lightly driven • Premium resale value",
      },
      {
        min: excellentMax + 1,
        max: goodMax,
        label: "Good",
        emoji: "👍",
        description: "Well maintained • Strong buyer confidence",
      },
      {
        min: goodMax + 1,
        max: averageMax,
        label: "Average",
        emoji: "📊",
        description: "Normal wear for this age • Market expected range",
      },
      {
        min: averageMax + 1,
        max: highMax,
        label: "High",
        emoji: "⚠️",
        description: "Above average usage • Moderate price impact",
      },
      {
        min: highMax + 1,
        max: extremeMax,
        label: "Very High",
        emoji: "🚨",
        description: "Heavy usage • Significant value deduction likely",
      },
      {
        min: extremeMax + 1,
        max: maxAllowed,
        label: "Extreme",
        emoji: "🛠️",
        description: "Extremely high mileage • Major depreciation expected",
      },
    ];

    return {
      expectedKm,
      yearlyAverage: Math.round(yearlyAverage),
      recommendedRange: { min: excellentMax, max: goodMax },
      quickPicks,
      zones,
      metadata: { age, segment: model.segment, fuel: fuelType.slug, transmission: transmission.slug },
    };
  }
}

export default new MileageGenerator();