import { chromium } from "playwright";

export class ScraperService {

  async scrapeUsedCars({ brand, model }) {
    const browser = await chromium.launch({
      headless: true,
      args: [
        "--no-sandbox",
        "--disable-setuid-sandbox",
        "--disable-dev-shm-usage",
        "--disable-blink-features=AutomationControlled",
      ],
    });

    try {
      const page = await browser.newPage({
        viewport: { width: 1440, height: 1080 },
        userAgent: "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/134.0.0.0 Safari/537.36",
      });

      const searchQuery = `${brand}-${model}`.toLowerCase().replace(/\s+/g, '-');
      const url = `https://www.carwale.com/used/${searchQuery}-cars/`;

      console.log("OPEN URL:", url);

      await page.goto(url, { waitUntil: "networkidle", timeout: 90000 });

      await page.waitForTimeout(8000); // Extra wait for dynamic content

      console.log("Starting aggressive scroll...");
      for (let i = 0; i < 15; i++) {
        await page.evaluate(() => window.scrollBy(0, 1200));
        await page.waitForTimeout(1500);
      }

      const listings = await this.extractListings(page, brand, model);

      console.log(`FINAL CLEAN LISTINGS: ${listings.length}`);

      return listings;

    } catch (error) {
      console.error("SCRAPER ERROR:", error.message);
      throw error;
    } finally {
      await browser.close();
    }
  }

  async extractListings(page, brand, model) {
    const listings = [];

    // Very broad but effective approach for dynamic sites
    const allTextElements = await page.locator('h2, h3, h4, div[class*="title"], div[class*="card"]').all();

    console.log(`Scanned ${allTextElements.length} potential elements`);

    const brandLower = brand.toLowerCase();
    const modelLower = model.toLowerCase();

    for (const el of allTextElements) {
      try {
        const text = (await el.textContent()).trim();
        if (!text) continue;

        const lowerText = text.toLowerCase();

        if (!lowerText.includes(brandLower) || !lowerText.includes(modelLower)) continue;

        // Find price in nearby elements
        const parent = await el.locator('..').first();
        const priceText = await parent.locator('span, div, p')
          .filter({ hasText: /₹|Rs|\d{1,2}(,\d{3})+/ })
          .first().textContent().catch(() => '');

        if (!priceText) continue;

        const price = Number(priceText.replace(/[^0-9]/g, ''));
        if (price < 100000) continue;

        const fullText = (text + " " + priceText).toLowerCase();

        listings.push({
          title: text,
          variant: text,
          price,
          year: this.extractYear(fullText),
          kmDriven: this.extractKm(fullText),
          fuelType: this.detectFuelType(fullText),
          transmission: this.detectTransmission(fullText),
          city: "unknown",
          source: "carwale",
          url: await el.locator('a').first().getAttribute('href').catch(() => ""),
        });
      } catch (e) {}
    }

    // Deduplicate
    const unique = this.deduplicate(listings);
    return unique;
  }

  deduplicate(listings) {
    const seen = new Map();
    return listings.filter(item => {
      const key = `${item.title}-${item.price}`;
      if (seen.has(key)) return false;
      seen.set(key, true);
      return true;
    });
  }

  extractYear(text) {
    const match = text.match(/\b(201[0-9]|202[0-6])\b/);
    return match ? parseInt(match[1]) : null;
  }

  extractKm(text) {
    const match = text.match(/(\d{1,3}(?:,\d{3})*)\s*km/i);
    return match ? Number(match[1].replace(/,/g, '')) : null;
  }

  detectFuelType(text) {
    if (text.includes("diesel")) return "diesel";
    if (text.includes("petrol")) return "petrol";
    if (text.includes("cng")) return "cng";
    return "unknown";
  }

  detectTransmission(text) {
    if (text.includes("automatic") || text.includes("auto")) return "automatic";
    if (text.includes("manual")) return "manual";
    return "unknown";
  }
}