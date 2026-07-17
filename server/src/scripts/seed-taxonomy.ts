import { prisma } from "../config/prisma.js";
import * as fs from "fs";
import * as path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Standard premium categories for the marketplace
const defaultCategories = [
  { name: "Cameras & Optics", icon: "Camera", color: "var(--color-category-blue)" },
  { name: "Furniture & Living", icon: "Sofa", color: "var(--color-category-amber)" },
  { name: "Computers & Laptops", icon: "Laptop", color: "var(--color-category-blue-dark)" },
  { name: "Outdoor & Camping", icon: "Tent", color: "var(--color-category-green)" },
  { name: "Home Decor & Lighting", icon: "Lamp", color: "var(--color-category-orange)" },
  { name: "Plants & Gardening", icon: "Flower2", color: "var(--color-category-lime)" },
  { name: "Apparel & Designer Wear", icon: "Shirt", color: "var(--color-category-pink)" },
  { name: "Luxury Watches", icon: "Watch", color: "var(--color-category-violet)" },
  { name: "Sports & Rideables", icon: "Bike", color: "var(--color-category-red)" },
  { name: "Kitchen & Dining Appliances", icon: "Utensils", color: "var(--color-category-gray)" }
];

async function main() {
  console.log("Starting category seeding...");

  // Path to _taxonomy.json in the server directory
  // The script runs from server/src/scripts/seed-taxonomy.ts
  // root is server/
  const taxonomyPath = path.resolve(__dirname, "../../_taxonomy.json");
  let categoriesToSeed: any[] = [...defaultCategories];

  if (fs.existsSync(taxonomyPath)) {
    try {
      console.log(`Found taxonomy file at: ${taxonomyPath}. Reading contents...`);
      const fileContent = fs.readFileSync(taxonomyPath, "utf-8");
      const parsed = JSON.parse(fileContent);

      if (Array.isArray(parsed)) {
        console.log(`Successfully parsed taxonomy array with ${parsed.length} items.`);
        const mappedCategories: any[] = [];

        for (const item of parsed) {
          if (typeof item === "string") {
            mappedCategories.push({ name: item });
          } else if (item && typeof item === "object" && item.name) {
            mappedCategories.push({
              name: item.name,
              icon: item.icon || undefined,
              color: item.color || undefined,
              image: item.image || undefined,
            });
          }
        }

        if (mappedCategories.length > 0) {
          categoriesToSeed = mappedCategories;
        }
      } else if (parsed && typeof parsed === "object") {
        console.log("Parsed taxonomy as an object. Extracting keys/values...");
        const mappedCategories: any[] = [];
        for (const key of Object.keys(parsed)) {
          const val = parsed[key];
          if (typeof val === "string") {
            mappedCategories.push({ name: key, icon: val });
          } else if (val && typeof val === "object") {
            mappedCategories.push({
              name: val.name || key,
              icon: val.icon || undefined,
              color: val.color || undefined,
              image: val.image || undefined,
            });
          } else {
            mappedCategories.push({ name: key });
          }
        }

        if (mappedCategories.length > 0) {
          categoriesToSeed = mappedCategories;
        }
      }
    } catch (error) {
      console.error("Failed to parse _taxonomy.json, falling back to default categories.", error);
    }
  } else {
    console.log(`Taxonomy file not found at: ${taxonomyPath}. Using default premium category list.`);
  }

  console.log(`Seeding ${categoriesToSeed.length} categories to the database...`);

  let successCount = 0;
  for (const category of categoriesToSeed) {
    try {
      // Upsert category by unique name
      const result = await prisma.category.upsert({
        where: { name: category.name },
        update: {
          icon: category.icon,
          color: category.color,
          image: category.image,
        },
        create: {
          name: category.name,
          icon: category.icon,
          color: category.color,
          image: category.image,
        },
      });
      console.log(`Upserted category: "${result.name}" (ID: ${result.id}, Icon: ${result.icon}, Color: ${result.color})`);
      successCount++;
    } catch (err) {
      console.error(`Failed to seed category: "${category.name}":`, err);
    }
  }

  console.log(`Seeding complete. Successfully seeded ${successCount} out of ${categoriesToSeed.length} categories.`);
}

main()
  .catch((err) => {
    console.error("Seeding error:", err);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
