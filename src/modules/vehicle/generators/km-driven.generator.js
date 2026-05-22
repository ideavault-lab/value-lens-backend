class KMDrivenGenerator {

  // ─── Constants ──────────────────────────────────────────────

  static BASE_YEARLY_KM = 13_800;

  static SEGMENT_ADJUSTMENTS = {
    hatchback:   -2_800,
    sedan:       -1_200,
    compact_suv:  2_000,
    suv:          3_400,
    crossover:    1_600,
    mpv:          4_500,
    luxury:      -4_500,
    pickup:       5_800,
  };

  static FUEL_ADJUSTMENTS = {
    diesel:   5_200,
    petrol:       0,
    hybrid:  -1_800,
    electric: -5_500,
    cng:      3_600,
  };

  static TRANSMISSION_ADJUSTMENTS = {
    manual:    1_900,
    automatic:  -950,
    cvt:      -1_700,
    amt:         700,
    dct:      -2_500,
  };

  static ZONE_MULTIPLIERS = {
    showroom: 0.35,
    excellent: 0.62,
    good: 0.95,
    average: 1.35,
    high: 1.85,
    extreme: 2.45,
  };

  // ─── Yearly average ─────────────────────────────────────────

  #computeYearlyAverage({ model, fuelType, transmission, age }) {
    let yearly = KMDrivenGenerator.BASE_YEARLY_KM;

    yearly += KMDrivenGenerator.SEGMENT_ADJUSTMENTS[model.segment] ?? 0;
    yearly += KMDrivenGenerator.FUEL_ADJUSTMENTS[fuelType.slug] ?? 0;
    yearly += KMDrivenGenerator.TRANSMISSION_ADJUSTMENTS[transmission.slug] ?? 0;

    // Resale demand — popular cars are driven less aggressively
    if      (model.resaleDemand >= 1.4) yearly -= 2_800;
    else if (model.resaleDemand >= 1.3) yearly -= 1_900;
    else if (model.resaleDemand >= 1.2) yearly -= 1_100;
    else if (model.resaleDemand >= 1.1) yearly -=   600;

    // Age decay — older cars are driven less per year
    if      (age >= 12) yearly = Math.round(yearly * 0.70);
    else if (age >= 8)  yearly = Math.round(yearly * 0.80);
    else if (age >= 5)  yearly = Math.round(yearly * 0.90);

    return Math.round(yearly);
  }

  // ─── Zone thresholds ────────────────────────────────────────

  #computeThresholds(expectedKm) {
    const m = KMDrivenGenerator.ZONE_MULTIPLIERS;
    return {
      showroomMax:  Math.round(expectedKm * m.showroom),
      excellentMax: Math.round(expectedKm * m.excellent),
      goodMax:      Math.round(expectedKm * m.good),
      averageMax:   Math.round(expectedKm * m.average),
      highMax:      Math.round(expectedKm * m.high),
      extremeMax:   Math.round(expectedKm * m.extreme),
    };
  }

  // ─── Quick picks ────────────────────────────────────────────

  #buildQuickPicks({ showroomMax, excellentMax, goodMax, averageMax, highMax, extremeMax }) {
    return [
      { label: "Barely Driven",    value: Math.round(showroomMax * 0.85) },
      { label: "City Usage",       value: excellentMax },
      { label: "Ideal",            value: goodMax },
      { label: "Family Use",       value: averageMax },
      { label: "Frequent Travel",  value: highMax },
      { label: "Commercial Heavy", value: extremeMax },
    ];
  }

  // ─── Zones ──────────────────────────────────────────────────

  #buildZones({ showroomMax, excellentMax, goodMax, averageMax, highMax, extremeMax }, minAllowed, maxAllowed) {
    return [
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
  }

  // ─── Public API ─────────────────────────────────────────────

  generate({ model, fuelType, transmission, year }) {
    const currentYear = new Date().getFullYear();
    const age = Math.max(1, currentYear - year);

    const yearlyAverage = this.#computeYearlyAverage({ model, fuelType, transmission, age });
    const expectedKm    = Math.round(yearlyAverage * age);
    const thresholds    = this.#computeThresholds(expectedKm);

    const minAllowed = model.mileageRange?.min ?? 0;
    const maxAllowed = model.mileageRange?.max ?? 400_000;

    return {
      expectedKm,
      yearlyAverage,
      recommendedRange: {
        min: thresholds.excellentMax,
        max: thresholds.goodMax,
      },
      quickPicks: this.#buildQuickPicks(thresholds),
      zones:      this.#buildZones(thresholds, minAllowed, maxAllowed),
      metadata: {
        age,
        segment:      model.segment,
        fuel:         fuelType.slug,
        transmission: transmission.slug,
      },
    };
  }
}

export default new KMDrivenGenerator();