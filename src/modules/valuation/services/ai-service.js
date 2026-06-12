// const response = await client.chat.complete({
//   model: 'mistral-medium-latest',
//   messages: [
//     {
//       role: 'user',
//       content: `Please format this vehicle data:
//       Brand: ${vehicle.brand}
//       Model: ${vehicle.model}
//       Variant: ${vehicle.variant}
//       Year: ${vehicle.year}
//       Type: ${vehicle.type}
//       Condition: ${vehicle.condition}
//       KM Driven: ${vehicle.kmDriven}
//       Ownership: ${vehicle.ownership}
//       Engine CC: ${vehicle.engineCc}
//       Power: ${vehicle.powerBhp}
//       Torque: ${vehicle.torqueNm}
//       Drivetrain: ${vehicle.drivetrain}
//       Transmission: ${vehicle.transmission}
//       Fuel Type: ${vehicle.fuelType}
//       Mileage: ${vehicle.mileage}
//       Price: ${vehicle.priceLakh}`
//     },
//   ],
// //   documents: [{ type: 'file', id: library.id }],
// });

// console.log(response.choices[0].message.content);

import { chat } from '../../../config/mistral-ai.js';
import valuationAi from '../../../services/ai/valuation-ai.js';

// Upload once, cache the ID (or store it in DB/env)
// const fileId = await uploadRagFile('company-handbook.pdf');

const prompt = `Act as a used car valuation expert. Based on the vehicle data below, 
calculate and provide the estimated fair market resale value for this vehicle 
in the current Indian used car market. Provide a realistic price range and 
brief justification based on condition and kilometres driven.

Vehicle Data:
Brand: Honda
Model: City
Variant: ZX CVT (Top-end automatic)
Year: 2024
Condition: Excellent
KM Driven: 48020
Ownership: First Owner
Engine CC: 1498 | Power: 119 Bhp | Torque: 145 Nm
Drivetrain: FWD | Transmission: CVT | Fuel Type: Petrol
Official Mileage: 18.4 km/l
Original Ex-Showroom Price: 16.2 Lakh`;

// Pass fileId if you want it grounded in your handbook, or null for pure LLM
// const result = await chat(prompt, fileId);
// const result = await chat(prompt);

// const provider = resolveProvider(); // reads AI_PROVIDER from .env

const result = await valuationAi._provider.chat({
  system: "You are a used car valuation expert...",
  user:   prompt,
});
console.log("♾️👍",result);