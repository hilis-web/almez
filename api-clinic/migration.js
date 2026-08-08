require("dotenv").config();

const mongoose = require("mongoose");

const COLLECTION_NAME = "sectionnews";

async function migrate() {
  try {
    console.log("========================================");
    console.log("LIVE DATABASE MIGRATION");
    console.log("========================================");

    console.log("Connecting to MongoDB...");

    await mongoose.connect(process.env.MONGO_URI);

    console.log("Connected!");

    const db = mongoose.connection.db;

    const collection = db.collection(COLLECTION_NAME);

    // =====================================================
    // 1. GET EXISTING SECTIONS
    // =====================================================

    const sections = await collection.find({}).toArray();

    console.log(`Found ${sections.length} sections`);

    if (sections.length === 0) {
      console.log("No sections found.");
      return;
    }

    // =====================================================
    // 2. PROCESS EACH SECTION
    // =====================================================

    for (const section of sections) {
      console.log("----------------------------------------");

      console.log(
        "Processing:",
        section.title?.es || section.title?.en || section._id,
      );

      // ---------------------------------------------------
      // SAFETY CHECK
      // ---------------------------------------------------

      if (section.migrationVersion === 2) {
        console.log("Already migrated. Skipping.");

        continue;
      }

      // ---------------------------------------------------
      // OLD CATEGORIES
      // ---------------------------------------------------

      const oldCategories = Array.isArray(section.categories)
        ? section.categories
        : [];

      console.log(`Old categories: ${oldCategories.length}`);

      // ===================================================
      // CREATE NEW CATEGORY
      // ===================================================
      //
      // We are NOT creating fake items.
      //
      // Every old category becomes an item.
      //
      // ===================================================

      const newItems = oldCategories.map((oldCategory) => {
        console.log(
          "  Converting:",
          oldCategory.title?.es ||
            oldCategory.title?.en ||
            oldCategory.categoryId,
        );

        return {
          // IMPORTANT:
          // Keep the old categoryId as itemId
          itemId: oldCategory.categoryId || new mongoose.Types.ObjectId(),

          title: normalizeLocalizedObject(oldCategory.title),

          description: normalizeLocalizedObject(oldCategory.description),

          content: normalizeLocalizedObject(oldCategory.content),

          imageUrl: oldCategory.imageUrl || "",

          toolTip: normalizeToolTip(oldCategory.toolTip),

          status: oldCategory.status || "Published",
        };
      });

      // ===================================================
      // DETERMINE SECTION TYPE
      // ===================================================

      const sectionTitle = section.title?.es || section.title?.en || "";

      // ===================================================
      // CREATE CATEGORY
      // ===================================================

      let categoryTitle;
      let categoryDescription;

      if (sectionTitle === "Patologías" || sectionTitle === "Pathologies") {
        categoryTitle = {
          es: "Columna",
          en: "Spine",
          ar: "العمود الفقري",
        };

        categoryDescription = {
          es: "Patologías de la columna",
          en: "Spine pathologies",
          ar: "أمراض العمود الفقري",
        };
      } else if (
        sectionTitle === "Tratamientos" ||
        sectionTitle === "Treatments"
      ) {
        categoryTitle = {
          es: "Cirugía de Columna",
          en: "Spine Surgery",
          ar: "جراحة العمود الفقري",
        };

        categoryDescription = {
          es: "Tratamientos de columna",
          en: "Spine treatments",
          ar: "علاجات العمود الفقري",
        };
      } else {
        // For any other section,
        // create a generic category using the section title.

        categoryTitle = {
          es: section.title?.es || "",
          en: section.title?.en || "",
          ar: section.title?.ar || "",
        };

        categoryDescription = {
          es: section.description?.es || "",
          en: section.description?.en || "",
          ar: section.description?.ar || "",
        };
      }

      const newCategory = {
        categoryId: new mongoose.Types.ObjectId(),

        title: categoryTitle,

        description: categoryDescription,

        imageUrl: "",

        toolTip: null,

        items: newItems,

        status: "Published",
      };

      // ===================================================
      // UPDATE SECTION
      // ===================================================

      await collection.updateOne(
        { _id: section._id },

        {
          $set: {
            categories: [newCategory],

            migrationVersion: 2,

            migratedAt: new Date(),
          },
        },
      );

      console.log(`✓ Migrated ${newItems.length} items`);
    }

    console.log("----------------------------------------");
    console.log("Migration completed successfully.");
    console.log("----------------------------------------");
  } catch (error) {
    console.error("MIGRATION FAILED:");
    console.error(error);
  } finally {
    await mongoose.disconnect();

    console.log("Disconnected.");
  }
}

// =====================================================
// HELPERS
// =====================================================

function normalizeLocalizedObject(value) {
  value = value || {};

  return {
    es: value.es || "",
    en: value.en || "",
    ar: value.ar || "",
  };
}

function normalizeToolTip(toolTip) {
  if (!toolTip) {
    return null;
  }

  return {
    title: normalizeLocalizedObject(toolTip.title),

    description: normalizeLocalizedObject(toolTip.description),

    imageUrl: toolTip.imageUrl || "",
  };
}

migrate();
