/**
 * Location registry.
 *
 * Fields:
 *   tier      – "metro" | "tier1" | "tier2"
 *   demand    – general resale demand multiplier
 *   evDemand  – EV-specific demand multiplier (metros lead EV adoption)
 */
export const LOCATIONS = {
  // ── Metro ──────────────────────────────────────────────────────────────────
  "Mumbai":     { tier: "metro", demand: 1.10, evDemand: 1.05 },
  "Delhi NCR":  { tier: "metro", demand: 1.10, evDemand: 1.08 },
  "Bangalore":  { tier: "metro", demand: 1.10, evDemand: 1.12 },
  "Hyderabad":  { tier: "metro", demand: 1.08, evDemand: 1.08 },
  "Pune":       { tier: "metro", demand: 1.08, evDemand: 1.06 },

  // ── Tier 1 ────────────────────────────────────────────────────────────────
  "Chennai":    { tier: "tier1", demand: 1.04, evDemand: 1.05 },
  "Kolkata":    { tier: "tier1", demand: 1.02, evDemand: 1.00 },
  "Ahmedabad":  { tier: "tier1", demand: 1.04, evDemand: 1.02 },
  "Chandigarh": { tier: "tier1", demand: 1.04, evDemand: 1.02 },
  "Kochi":      { tier: "tier1", demand: 1.02, evDemand: 1.02 },
  "Goa":        { tier: "tier1", demand: 1.03, evDemand: 1.00 },
  "Jaipur":     { tier: "tier1", demand: 1.02, evDemand: 1.00 },
  "Lucknow":    { tier: "tier1", demand: 1.00, evDemand: 0.97 },
  "Surat":      { tier: "tier1", demand: 1.02, evDemand: 1.00 },
  "Nagpur":     { tier: "tier1", demand: 1.00, evDemand: 0.97 },
  "Indore":     { tier: "tier1", demand: 1.00, evDemand: 0.97 },
  "Coimbatore": { tier: "tier1", demand: 1.00, evDemand: 0.98 },

  // ── Tier 2 ────────────────────────────────────────────────────────────────
  "Bhopal":     { tier: "tier2", demand: 0.96, evDemand: 0.93 },
  "Vadodara":   { tier: "tier2", demand: 0.96, evDemand: 0.93 },
  "Nashik":     { tier: "tier2", demand: 0.95, evDemand: 0.92 },
  "Patna":      { tier: "tier2", demand: 0.94, evDemand: 0.91 },
  "Agra":       { tier: "tier2", demand: 0.94, evDemand: 0.91 },
};

/** Fallback for cities not in the registry */
export const UNKNOWN_LOCATION = { tier: "unknown", demand: 0.93, evDemand: 0.90 };

export function resolveLocation(city) {
  return LOCATIONS[city] ?? UNKNOWN_LOCATION;
}