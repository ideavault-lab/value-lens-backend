import kmDrivenRepository from "../repositories/km-driven.repository.js";
import kmDrivenGenerator  from "../generators/km-driven.generator.js"; // renamed

class KMDrivenService {
  async getKMDrivenInsights(payload) {
    const baseData = await kmDrivenRepository.getBaseData(payload);

    return kmDrivenGenerator.generate({
      model:        baseData.model,
      fuelType:     baseData.fuelType,
      transmission: baseData.transmission,
      year:         payload.year,
    });
  }
}

export default new KMDrivenService();