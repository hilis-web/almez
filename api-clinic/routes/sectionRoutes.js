// Sections
const express = require("express");
const mongoose = require("mongoose");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const { verifyToken } = require("../utils/jwt"); // Import token verification
const router = express.Router();
const SectionNew = require("../models/SectionNew"); // تأكد من أن هذا المسار صحيح
const { route } = require("./auth");

//CLIENT API
// مسار لعرض جميع الأقسام مع الفئات المترجمة
router.get("/nav/section", async (req, res) => {
  try {
    // العثور على جميع الأقسام المنشورة
    const sections = await SectionNew.find({ status: "Published" }).select(
      "sectionId title categories",
    );

    // إذا كانت الأقسام موجودة
    if (!sections || sections.length === 0) {
      return res.status(404).json({ message: "No sections found" });
    }

    // إرسال الأقسام إلى العميل
    res.json(sections);
  } catch (error) {
    console.error("Error fetching sections:", error);
    res.status(500).json({ message: "Error fetching sections" });
  }
});
//

router.get("/navstatic/section", async (req, res) => {
  console.time("API");
  console.log("Request received:", new Date().toISOString());
  try {
    console.time("Mongo");
    const staticSections = [
      {
        title: "Inicio",
        page: "index",
        description: "",
        i18next: "home",
        categories: [],
        sectionClass: "sectionHome",
      },
      {
        title: "Equipo",
        page: "team",
        description: "Equipo",
        i18next: "team",
        categories: [],
        sectionClass: "sectionTeam",
      },
      {
        title: "Patologías",
        page: "pathologies",
        description:
          "Los síntomas y patologías más comues de la columna vertebral",
        i18next: "pathologies",
        categories: [],
        sectionClass: "sectionPathologies",
      },
      {
        title: "Tratamientos",
        page: "treatments",
        description: "Tratamientos",
        i18next: "treatments",
        categories: [],
        sectionClass: "sectionTreatments",
      },
      {
        title: "Peritaje Médico-Legal",
        page: "medical-legal-expertise",
        description: "Peritaje Médico-Legal",
        i18next: "medical_legal_expertise",
        categories: [],
        sectionClass: "sectionMedicalLegalExpertise",
      },
      {
        title: "Información y Consejos",
        page: "information-advice",
        description: "Información y Consejos",
        i18next: "information_and_advice",
        categories: [],
        sectionClass: "sectionInformationAdvice",
      },
      {
        title: "Contacto",
        page: "contact",
        description: "Contacto",
        i18next: "contact",
        categories: [],
        sectionClass: "sectionContact",
      },
    ];

    const sections = await SectionNew.find({ status: "Published" }).select(
      "sectionId title categories",
    );
    console.timeEnd("Mongo");

    console.time("Loop");
    staticSections.forEach((staticSection) => {
      // console.log("staticSection", staticSection);
      const match = sections.find((section) =>
        section.title.es
          .toLowerCase()
          .includes(staticSection.title.toLowerCase()),
      );
      if (match) {
        staticSection.sectionId = match.sectionId;
        staticSection.categories = match.categories;
      }
    });
    console.timeEnd("Loop");

    res.json(staticSections); // إرسال الأقسام مع الفئات
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error loading sections." });
  }
  console.timeEnd("API");
});

//DASHBOARD PUBLIC API

// Fetch all sections
router.get("/sections", async (req, res) => {
  try {
    const { lang } = req.query;
    // const lang = "en";

    const sections = await SectionNew.find();

    if (sections.length === 0) {
      return res.status(404).json({
        message: "No sections found",
      });
    }

    // Return raw data if no language is specified
    if (!lang) {
      return res.json(sections);
    }

    const localizedSections = sections.map((section) => ({
      sectionId: section.sectionId,
      title: section.title?.[lang] || section.title?.en || section.title?.es,
      description:
        section.description?.[lang] ||
        section.description?.en ||
        section.description?.es,
      imageUrl: section.imageUrl,
      status: section.status,

      categories: section.categories.map((category) => ({
        categoryId: category.categoryId,
        title:
          category.title?.[lang] || category.title?.en || category.title?.es,
        description:
          category.description?.[lang] ||
          category.description?.en ||
          category.description?.es,
        imageUrl: category.imageUrl,
        status: category.status,

        items: category.items.map((item) => ({
          itemId: item.itemId,
          title: item.title?.[lang] || item.title?.en || item.title?.es,
          description:
            item.description?.[lang] ||
            item.description?.en ||
            item.description?.es,
          content: item.content?.[lang] || item.content?.en || item.content?.es,
          imageUrl: item.imageUrl,
          toolTip: item.toolTip
            ? {
                title:
                  item.toolTip.title?.[lang] ||
                  item.toolTip.title?.en ||
                  item.toolTip.title?.es,
                description:
                  item.toolTip.description?.[lang] ||
                  item.toolTip.description?.en ||
                  item.toolTip.description?.es,
                imageUrl: item.toolTip.imageUrl,
              }
            : null,
          status: item.status,
        })),
      })),
    }));

    res.json(localizedSections);
  } catch (error) {
    res.status(500).json({
      error: error.message,
    });
  }
});

// API to retrieve section data
router.get("/section/:id", async (req, res) => {
  try {
    const { lang } = req.query;

    const section = await SectionNew.findOne({
      sectionId: req.params.id,
    });

    if (!section) {
      return res.status(404).json({
        message: "Section not found",
      });
    }

    // Return raw document if no language specified
    if (!lang) {
      return res.json(section);
    }

    const localizedSection = {
      sectionId: section.sectionId,

      title: section.title?.[lang] || section.title?.en || section.title?.es,

      description:
        section.description?.[lang] ||
        section.description?.en ||
        section.description?.es,

      imageUrl: section.imageUrl,

      status: section.status,

      categories: section.categories.map((category) => ({
        categoryId: category.categoryId,

        title:
          category.title?.[lang] || category.title?.en || category.title?.es,

        description:
          category.description?.[lang] ||
          category.description?.en ||
          category.description?.es,

        imageUrl: category.imageUrl,

        status: category.status,

        items: category.items.map((item) => ({
          itemId: item.itemId,

          title: item.title?.[lang] || item.title?.en || item.title?.es,

          description:
            item.description?.[lang] ||
            item.description?.en ||
            item.description?.es,

          content: item.content?.[lang] || item.content?.en || item.content?.es,

          imageUrl: item.imageUrl,

          toolTip: item.toolTip
            ? {
                title:
                  item.toolTip.title?.[lang] ||
                  item.toolTip.title?.en ||
                  item.toolTip.title?.es,

                description:
                  item.toolTip.description?.[lang] ||
                  item.toolTip.description?.en ||
                  item.toolTip.description?.es,

                imageUrl: item.toolTip.imageUrl,
              }
            : null,

          status: item.status,
        })),
      })),
    };

    res.json(localizedSection);
  } catch (error) {
    res.status(500).json({
      error: error.message,
    });
  }
});

// Fetch categories for a specific section
router.get("/section/:sectionId/categories", async (req, res) => {
  try {
    const { lang } = req.query;

    const section = await SectionNew.findOne({
      sectionId: req.params.sectionId,
    });

    if (!section) {
      return res.status(404).json({
        error: "Section not found",
      });
    }

    // Return raw data if no language is specified
    if (!lang) {
      return res.json(section.categories);
    }

    const localizedCategories = section.categories.map((category) => ({
      categoryId: category.categoryId,

      title: category.title?.[lang] || category.title?.en || category.title?.es,

      description:
        category.description?.[lang] ||
        category.description?.en ||
        category.description?.es,

      imageUrl: category.imageUrl,

      status: category.status,

      items: category.items.map((item) => ({
        itemId: item.itemId,

        title: item.title?.[lang] || item.title?.en || item.title?.es,

        description:
          item.description?.[lang] ||
          item.description?.en ||
          item.description?.es,

        content: item.content?.[lang] || item.content?.en || item.content?.es,

        imageUrl: item.imageUrl,

        toolTip: item.toolTip
          ? {
              title:
                item.toolTip.title?.[lang] ||
                item.toolTip.title?.en ||
                item.toolTip.title?.es,

              description:
                item.toolTip.description?.[lang] ||
                item.toolTip.description?.en ||
                item.toolTip.description?.es,

              imageUrl: item.toolTip.imageUrl,
            }
          : null,

        status: item.status,
      })),
    }));

    res.json(localizedCategories);
  } catch (err) {
    res.status(500).json({
      error: "An error occurred while fetching categories",
    });
  }
});

// Fetch a specific category from a section
router.get("/section/:sectionId/category/:categoryId", async (req, res) => {
  try {
    const { sectionId, categoryId } = req.params;
    const { lang } = req.query;

    const section = await SectionNew.findOne({ sectionId });

    if (!section) {
      return res.status(404).json({
        error: "Section not found",
      });
    }

    const category = section.categories.find(
      (cat) => cat.categoryId.toString() === categoryId,
    );

    if (!category) {
      return res.status(404).json({
        error: "Category not found",
      });
    }

    // Return raw category if no language specified
    if (!lang) {
      return res.json(category);
    }

    const localizedCategory = {
      categoryId: category.categoryId,

      title: category.title?.[lang] || category.title?.en || category.title?.es,

      description:
        category.description?.[lang] ||
        category.description?.en ||
        category.description?.es,

      imageUrl: category.imageUrl,

      status: category.status,

      items: category.items.map((item) => ({
        itemId: item.itemId,

        title: item.title?.[lang] || item.title?.en || item.title?.es,

        description:
          item.description?.[lang] ||
          item.description?.en ||
          item.description?.es,

        content: item.content?.[lang] || item.content?.en || item.content?.es,

        imageUrl: item.imageUrl,

        toolTip: item.toolTip
          ? {
              title:
                item.toolTip.title?.[lang] ||
                item.toolTip.title?.en ||
                item.toolTip.title?.es,

              description:
                item.toolTip.description?.[lang] ||
                item.toolTip.description?.en ||
                item.toolTip.description?.es,

              imageUrl: item.toolTip.imageUrl,
            }
          : null,

        status: item.status,
      })),
    };

    res.json(localizedCategory);
  } catch (err) {
    res.status(500).json({
      error: "An error occurred while fetching the category",
    });
  }
});

// ======================================================
// Get one item from a category
// ======================================================

router.get(
  "/section/:sectionId/category/:categoryId/item/:itemId",
  async (req, res) => {
    try {
      const { sectionId, categoryId, itemId } = req.params;

      const section = await SectionNew.findOne({
        sectionId,
        status: "Published",
      });

      if (!section) {
        return res.status(404).json({
          message: "Section not found",
        });
      }

      const category = section.categories.find(
        (cat) =>
          cat.categoryId.toString() === categoryId &&
          cat.status === "Published",
      );

      if (!category) {
        return res.status(404).json({
          message: "Category not found",
        });
      }

      const item = category.items.find(
        (item) =>
          item.itemId.toString() === itemId && item.status === "Published",
      );

      if (!item) {
        return res.status(404).json({
          message: "Item not found",
        });
      }

      res.json({
        sectionId: section.sectionId,

        categoryId: category.categoryId,

        categoryTitle: category.title,

        categoryDescription: category.description,

        item: item,
      });
    } catch (error) {
      console.error("Error fetching item:", error);

      res.status(500).json({
        message: "Error fetching item",
        error: error.message,
      });
    }
  },
);

//
//////////////////////////////// DASHBOARD APIs ////////////////////////////////////////////////////////////
// Add new section
router.post("/addSection", verifyToken, async (req, res) => {
  try {
    const { title, description, imageUrl, categories, status } = req.body;

    // Validate required fields
    if (!title || !title.es || !Array.isArray(categories)) {
      return res.status(400).json({
        message: "Missing required fields or invalid categories",
      });
    }

    const newSection = new SectionNew({
      title,
      description,
      imageUrl,
      status: status || "Published",

      categories: categories.map((category) => ({
        categoryId: new mongoose.Types.ObjectId(),

        title: category.title,

        description: category.description,

        imageUrl: category.imageUrl || "",

        toolTip: category.toolTip
          ? {
              title: category.toolTip.title || {},
              description: category.toolTip.description || {},
              imageUrl: category.toolTip.imageUrl || "",
            }
          : null,

        status: category.status || "Published",

        items: (category.items || []).map((item) => ({
          itemId: new mongoose.Types.ObjectId(),

          title: item.title,

          description: item.description,

          content: item.content || {},

          imageUrl: item.imageUrl || "",

          toolTip: item.toolTip
            ? {
                title: item.toolTip.title || {},
                description: item.toolTip.description || {},
                imageUrl: item.toolTip.imageUrl || "",
              }
            : null,

          status: item.status || "Published",
        })),
      })),
    });

    await newSection.save();

    res.status(201).json({
      message: "Section added successfully",
      section: newSection,
    });
  } catch (err) {
    console.error("Error adding section:", err);

    res.status(500).json({
      message: "Error adding section",
      error: err.message,
    });
  }
});

router.get("/sections", verifyToken, async (req, res) => {
  try {
    const { lang } = req.query;

    const sections = await SectionNew.find();

    if (sections.length === 0) {
      return res.status(404).json({
        message: "No sections found",
      });
    }

    // Return raw documents if no language is specified
    if (!lang) {
      return res.json(sections);
    }

    const localizedSections = sections.map((section) => ({
      sectionId: section.sectionId.toString(),

      title: section.title?.[lang] || section.title?.en || section.title?.es,

      description:
        section.description?.[lang] ||
        section.description?.en ||
        section.description?.es,

      imageUrl: section.imageUrl,

      status: section.status,

      categories: section.categories.map((category) => ({
        categoryId: category.categoryId.toString(),

        title:
          category.title?.[lang] || category.title?.en || category.title?.es,

        description:
          category.description?.[lang] ||
          category.description?.en ||
          category.description?.es,

        imageUrl: category.imageUrl,

        status: category.status,

        toolTip: category.toolTip
          ? {
              title:
                category.toolTip.title?.[lang] ||
                category.toolTip.title?.en ||
                category.toolTip.title?.es ||
                "",

              description:
                category.toolTip.description?.[lang] ||
                category.toolTip.description?.en ||
                category.toolTip.description?.es ||
                "",

              imageUrl: category.toolTip.imageUrl || "",
            }
          : null,

        items: category.items.map((item) => ({
          itemId: item.itemId.toString(),

          title: item.title?.[lang] || item.title?.en || item.title?.es,

          description:
            item.description?.[lang] ||
            item.description?.en ||
            item.description?.es,

          content: item.content?.[lang] || item.content?.en || item.content?.es,

          imageUrl: item.imageUrl,

          status: item.status,

          toolTip: item.toolTip
            ? {
                title:
                  item.toolTip.title?.[lang] ||
                  item.toolTip.title?.en ||
                  item.toolTip.title?.es ||
                  "",

                description:
                  item.toolTip.description?.[lang] ||
                  item.toolTip.description?.en ||
                  item.toolTip.description?.es ||
                  "",

                imageUrl: item.toolTip.imageUrl || "",
              }
            : null,
        })),
      })),
    }));

    res.json(localizedSections);
  } catch (error) {
    res.status(500).json({
      error: error.message,
    });
  }
});

// API to retrieve section data
router.get("/section/:id", verifyToken, async (req, res) => {
  try {
    const { lang } = req.query;

    const section = await SectionNew.findOne({
      sectionId: req.params.id,
    });

    if (!section) {
      return res.status(404).json({
        message: "Section not found",
      });
    }

    // Return raw document if no language is specified
    if (!lang) {
      return res.json(section);
    }

    const localizedSection = {
      sectionId: section.sectionId.toString(),

      title: section.title?.[lang] || section.title?.en || section.title?.es,

      description:
        section.description?.[lang] ||
        section.description?.en ||
        section.description?.es,

      imageUrl: section.imageUrl,

      status: section.status,

      categories: section.categories.map((category) => ({
        categoryId: category.categoryId.toString(),

        title:
          category.title?.[lang] || category.title?.en || category.title?.es,

        description:
          category.description?.[lang] ||
          category.description?.en ||
          category.description?.es,

        imageUrl: category.imageUrl,

        status: category.status,

        toolTip: category.toolTip
          ? {
              title:
                category.toolTip.title?.[lang] ||
                category.toolTip.title?.en ||
                category.toolTip.title?.es ||
                "",

              description:
                category.toolTip.description?.[lang] ||
                category.toolTip.description?.en ||
                category.toolTip.description?.es ||
                "",

              imageUrl: category.toolTip.imageUrl || "",
            }
          : null,

        items: category.items.map((item) => ({
          itemId: item.itemId.toString(),

          title: item.title?.[lang] || item.title?.en || item.title?.es,

          description:
            item.description?.[lang] ||
            item.description?.en ||
            item.description?.es,

          content: item.content?.[lang] || item.content?.en || item.content?.es,

          imageUrl: item.imageUrl,

          status: item.status,

          toolTip: item.toolTip
            ? {
                title:
                  item.toolTip.title?.[lang] ||
                  item.toolTip.title?.en ||
                  item.toolTip.title?.es ||
                  "",

                description:
                  item.toolTip.description?.[lang] ||
                  item.toolTip.description?.en ||
                  item.toolTip.description?.es ||
                  "",

                imageUrl: item.toolTip.imageUrl || "",
              }
            : null,
        })),
      })),
    };

    res.json(localizedSection);
  } catch (error) {
    res.status(500).json({
      error: error.message,
    });
  }
});

// Update the status of a section, category, or item
router.patch("/:type/:id/status", verifyToken, async (req, res) => {
  const { type, id } = req.params;
  const { status } = req.body;

  try {
    let updatedSection;

    switch (type) {
      case "section":
        updatedSection = await SectionNew.findOneAndUpdate(
          { sectionId: id },
          { status },
          { new: true },
        );
        break;

      case "category":
        updatedSection = await SectionNew.findOneAndUpdate(
          { "categories.categoryId": id },
          {
            $set: {
              "categories.$.status": status,
            },
          },
          { new: true },
        );
        break;

      case "item":
        updatedSection = await SectionNew.findOneAndUpdate(
          {
            "categories.items.itemId": id,
          },
          {
            $set: {
              "categories.$[].items.$[item].status": status,
            },
          },
          {
            new: true,
            arrayFilters: [
              {
                "item.itemId": id,
              },
            ],
          },
        );
        break;

      default:
        return res.status(400).json({
          error: "Invalid type",
        });
    }

    if (!updatedSection) {
      return res.status(404).json({
        error: `${type} not found`,
      });
    }

    res.json(updatedSection);
  } catch (err) {
    res.status(500).json({
      error: "An error occurred while updating the status",
    });
  }
});

// Delete a section
router.delete("/section/:sectionId", verifyToken, async (req, res) => {
  try {
    const { sectionId } = req.params;

    const deletedSection = await SectionNew.findOneAndDelete({
      sectionId,
    });

    if (!deletedSection) {
      return res.status(404).json({
        message: "Section not found",
      });
    }

    res.status(200).json({
      message: "Section deleted successfully",
    });
  } catch (err) {
    console.error("Error deleting section:", err);

    res.status(500).json({
      error: "An error occurred while deleting the section",
    });
  }
});

// Delete a category inside a section
router.delete(
  "/section/:sectionId/category/:categoryId",
  verifyToken,
  async (req, res) => {
    try {
      const { sectionId, categoryId } = req.params;

      const section = await SectionNew.findOneAndUpdate(
        { sectionId },
        {
          $pull: {
            categories: {
              categoryId: new mongoose.Types.ObjectId(categoryId),
            },
          },
        },
        {
          new: true,
        },
      );

      if (!section) {
        return res.status(404).json({
          message: "Section not found",
        });
      }

      res.status(200).json({
        message: "Category deleted successfully",
        section,
      });
    } catch (err) {
      console.error("Error deleting category:", err);

      res.status(500).json({
        error: "An error occurred while deleting the category",
      });
    }
  },
);

// Fetch categories for a specific section
router.get("/section/:sectionId/categories", verifyToken, async (req, res) => {
  try {
    const { sectionId } = req.params;

    const section = await SectionNew.findOne({ sectionId });

    if (!section) {
      return res.status(404).json({
        error: "Section not found",
      });
    }

    res.status(200).json(section.categories);
  } catch (err) {
    console.error("Error fetching categories:", err);

    res.status(500).json({
      error: "An error occurred while fetching categories",
    });
  }
});

// Update a section
router.put("/section/:sectionId", verifyToken, async (req, res) => {
  try {
    const { sectionId } = req.params;
    const updatedData = req.body;

    const section = await SectionNew.findOneAndUpdate(
      { sectionId },
      {
        $set: {
          title: updatedData.title,
          description: updatedData.description,
          imageUrl: updatedData.imageUrl,
          categories: updatedData.categories,
          status: updatedData.status,
        },
      },
      {
        new: true,
        runValidators: true,
      },
    );

    if (!section) {
      return res.status(404).json({
        message: "Section not found",
      });
    }

    res.json(section);
  } catch (error) {
    console.error("Error updating section:", error);

    res.status(500).json({
      message: "Error updating section",
      error: error.message,
    });
  }
});

// ✅ Update category data within a section without affecting subcategories
// router.put('/section/:sectionId/category/:categoryId', verifyToken, async (req, res) => {
//     try {
//         const { sectionId, categoryId } = req.params;
//         const updatedData = req.body;

//         // Update only the title and imageUrl of the category
//         const section = await SectionNew.findOneAndUpdate(
//             { sectionId, 'categories.categoryId': categoryId },
//             {
//                 $set: {
//                     'categories.$.title': updatedData.title,
//                     'categories.$.description': updatedData.description,
//                     'categories.$.imageUrl': updatedData.imageUrl,
//                     'categories.$.content': updatedData.content,
//                 }
//             },
//             { new: true }
//         );

//         if (!section) return res.status(404).json({ message: 'Category not found' });

//         res.json(section);
//     } catch (error) {
//         res.status(500).json({ message: 'Error updating category', error });
//     }
// });

router.put(
  "/section/:sectionId/category/:categoryId",
  verifyToken,
  async (req, res) => {
    try {
      const { sectionId, categoryId } = req.params;
      const updatedData = req.body;

      const updateFields = {
        "categories.$.title": updatedData.title,
        "categories.$.description": updatedData.description,
        "categories.$.imageUrl": updatedData.imageUrl,
        "categories.$.status": updatedData.status,
        "categories.$.items": updatedData.items || [],
      };

      // Update tooltip if provided
      if (updatedData.toolTip) {
        updateFields["categories.$.toolTip"] = {
          title: updatedData.toolTip.title || {},
          description: updatedData.toolTip.description || {},
          imageUrl: updatedData.toolTip.imageUrl || "",
        };
      }

      const section = await SectionNew.findOneAndUpdate(
        {
          sectionId,
          "categories.categoryId": categoryId,
        },
        {
          $set: updateFields,
        },
        {
          new: true,
          runValidators: true,
        },
      );

      if (!section) {
        return res.status(404).json({
          message: "Category not found",
        });
      }

      res.json({
        message: "Category updated successfully",
        section,
      });
    } catch (error) {
      console.error("Error updating category:", error);

      res.status(500).json({
        message: "Error updating category",
        error: error.message,
      });
    }
  },
);
// ** جلب كل الأقسام **
// Get all sections for forms
router.get("/form/sections", verifyToken, async (req, res) => {
  try {
    const sections = await SectionNew.find();

    res.status(200).json(sections);
  } catch (err) {
    console.error("Error fetching sections:", err);

    res.status(500).json({
      message: "Error fetching sections",
      error: err.message,
    });
  }
});
// ** جلب الفئات داخل قسم معين **
router.get(
  "/form/sections/:sectionId/categories",
  verifyToken,
  async (req, res) => {
    try {
      const sectionId = req.params.sectionId;
      if (!mongoose.Types.ObjectId.isValid(sectionId)) {
        return res.status(400).send("Invalid section ID format");
      }

      const section = await SectionNew.findOne({
        sectionId: req.params.sectionId,
      });
      if (!section) return res.status(404).send("Section not found");

      res.json(section.categories);
    } catch (err) {
      res.status(500).send(err.message);
    }
  },
);

// Add a new section
router.post("/form/sections", verifyToken, async (req, res) => {
  try {
    const newSection = new SectionNew(req.body);

    await newSection.save();

    res.status(201).json({
      message: "Section created successfully",
      section: newSection,
    });
  } catch (err) {
    console.error("Error creating section:", err);

    res.status(400).json({
      message: "Error creating section",
      error: err.message,
    });
  }
});

// ** إضافة فئة جديدة داخل قسم موجود **
router.post(
  "/form/sections/:sectionId/categories",
  verifyToken,
  async (req, res) => {
    try {
      const { sectionId } = req.params;

      if (!mongoose.Types.ObjectId.isValid(sectionId)) {
        return res.status(400).json({
          message: "Invalid section ID format",
        });
      }

      const section = await SectionNew.findOne({ sectionId });

      if (!section) {
        return res.status(404).json({
          message: "Section not found",
        });
      }

      const newCategory = {
        categoryId: new mongoose.Types.ObjectId(),

        title: req.body.title,

        description: req.body.description,

        imageUrl: req.body.imageUrl || "",

        toolTip: req.body.toolTip
          ? {
              title: req.body.toolTip.title || {},
              description: req.body.toolTip.description || {},
              imageUrl: req.body.toolTip.imageUrl || "",
            }
          : null,

        status: req.body.status || "Published",

        items: (req.body.items || []).map((item) => ({
          itemId: new mongoose.Types.ObjectId(),

          title: item.title,

          description: item.description,

          content: item.content || {},

          imageUrl: item.imageUrl || "",

          toolTip: item.toolTip
            ? {
                title: item.toolTip.title || {},
                description: item.toolTip.description || {},
                imageUrl: item.toolTip.imageUrl || "",
              }
            : null,

          status: item.status || "Published",
        })),
      };

      section.categories.push(newCategory);

      await section.save();

      res.status(201).json({
        message: "Category added successfully",
        section,
      });
    } catch (err) {
      console.error("Error adding category:", err);

      res.status(500).json({
        message: "Error adding category",
        error: err.message,
      });
    }
  },
);

module.exports = router;
