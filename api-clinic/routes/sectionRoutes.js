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
    //const { lang } = req.query; // Get the language from query parameters
    const { lang } = "en"; // Get the language from query parameters

    const sections = await SectionNew.find(); // Fetch all sections from the database

    if (sections.length === 0)
      return res.status(404).json({ message: "No sections found" });

    // If no language is specified, send all data as is
    if (!lang) return res.json(sections);

    // Prepare data according to the specified language
    const localizedSectionsNew = sections.map((section) => ({
      sectionId: section.sectionId,
      title: section.title[lang] || section.title["en"],
      description: section.description[lang] || section.title["en"],
      imageUrl: section.imageUrl,
      categories: section.categories.map((category) => ({
        categoryId: category.categoryId,
        title: category.title[lang] || category.title["en"],
        description: category.description[lang] || category.description["en"],
        imageUrl: category.imageUrl,
        content: category.content[lang] || category.content["en"],
      })),
    }));

    res.json(localizedSectionsNew);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// API to retrieve section data
router.get("/section/:id", async (req, res) => {
  try {
    const { lang } = req.query;
    const section = await SectionNew.findOne({ sectionId: req.params.id });

    if (!section) return res.status(404).json({ message: "Section not found" });

    if (!lang) return res.json(section);

    const localizedSectionNew = {
      sectionId: section.sectionId,
      title: section.title[lang] || section.title["en"],
      description: section.description[lang] || section.description["en"],
      imageUrl: section.imageUrl,
      categories: section.categories.map((category) => ({
        categoryId: category.categoryId,
        title: category.title[lang] || category.title["en"],
        description: category.description[lang] || category.description["en"],
        imageUrl: category.imageUrl,
        content: category.content[lang] || sub.content["en"],
      })),
    };

    res.json(localizedSectionNew);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Fetch categories for a specific section
router.get("/section/:sectionId/categories", async (req, res) => {
  try {
    const section = await SectionNew.findOne({
      sectionId: req.params.sectionId,
    });
    if (!section) return res.status(404).json({ error: "Section not found" });
    res.json(section.categories);
  } catch (err) {
    res
      .status(500)
      .json({ error: "An error occurred while fetching categories" });
  }
});

router.get("/section/:sectionId/category/:categoryId", async (req, res) => {
  try {
    const { sectionId, categoryId } = req.params;

    const section = await SectionNew.findOne({ sectionId: sectionId });

    if (!section) return res.status(404).json({ error: "Section not found" });

    const category = section.categories.find(
      (cat) => cat.categoryId.toString() === req.params.categoryId,
    );

    if (!category) return res.status(404).json({ error: "Category not found" });

    // Return subcategories
    res.json(category);
  } catch (err) {
    res
      .status(500)
      .json({ error: "An error occurred while fetching categories" });
  }
});

//

// إضافة قسم جديد
router.post("/addSection", verifyToken, async (req, res) => {
  try {
    const { title, description, imageUrl, categories, status } = req.body;

    // التحقق من صحة البيانات الأساسية
    if (!title || !title.es || !Array.isArray(categories)) {
      return res
        .status(400)
        .json({ message: "Missing required fields or invalid categories" });
    }

    // بناء الكائن الجديد للقسم
    const newSection = new SectionNew({
      title,
      description,
      imageUrl,
      status: status || "Published",
      categories: categories.map((category) => ({
        categoryId: new mongoose.Types.ObjectId(),
        title: category.title,
        description: category.description,
        content: category.content || {},
        imageUrl: category.imageUrl || "",
        toolTip: category.toolTip
          ? {
              title: category.toolTip.title || {},
              description: category.toolTip.description || {},
              imageUrl: category.toolTip.imageUrl || "",
            }
          : null,
        status: category.status || "Published",
      })),
    });

    // حفظ القسم في قاعدة البيانات
    await newSection.save();

    // إرجاع الاستجابة بنجاح
    res
      .status(201)
      .json({ message: "Section added successfully", section: newSection });
  } catch (err) {
    console.error("Error adding section:", err);
    res
      .status(500)
      .json({ message: "Error adding section", error: err.message });
  }
});

router.get("/sections", verifyToken, async (req, res) => {
  try {
    const { lang } = req.query; // Get the language from query parameters
    const sections = await SectionNew.find(); // جلب جميع الأقسام من قاعدة البيانات

    if (sections.length === 0)
      return res.status(404).json({ message: "No sections found" });

    // إذا لم يتم تحديد اللغة في الاستعلام، أرجع البيانات كما هي
    if (!lang) return res.json(sections);

    // تحضير البيانات بحسب اللغة المحددة
    const localizedSections = sections.map((section) => ({
      sectionId: section.sectionId.toString(), // تحويل ObjectId إلى سلسلة نصية
      title: section.title[lang] || section.title["en"],
      description: section.description[lang] || section.description["en"],
      imageUrl: section.imageUrl,
      categories: section.categories.map((category) => ({
        categoryId: category.categoryId.toString(), // تحويل ObjectId إلى سلسلة نصية
        title: category.title[lang] || category.title["en"],
        description: category.description[lang] || category.description["en"],
        content: category.content[lang] || category.content["en"],
        imageUrl: category.imageUrl,
        toolTip: category.toolTip
          ? {
              title:
                category.toolTip.title?.[lang] ||
                category.toolTip.title?.["en"] ||
                "",
              description:
                category.toolTip.description?.[lang] ||
                category.toolTip.description?.["en"] ||
                "",
              imageUrl: category.toolTip.imageUrl || "",
            }
          : null,
      })),
    }));

    res.json(localizedSections);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// API to retrieve section data
router.get("/section/:id", verifyToken, async (req, res) => {
  try {
    const { lang } = req.query;
    const section = await SectionNew.findOne({ sectionId: req.params.id }); // Use SectionNew model

    if (!section) return res.status(404).json({ message: "Section not found" });

    // If no language is specified, send all data as is
    if (!lang) return res.json(section);

    // Prepare localized section data
    const localizedSection = {
      sectionId: section.sectionId,
      title: section.title[lang] || section.title["en"], // Handle title localization
      description: section.description[lang] || section.description["en"], // Handle title localization
      imageUrl: section.imageUrl,
      categories: section.categories.map((category) => ({
        categoryId: category.categoryId,
        title: category.title[lang] || category.title["en"], // Handle category title localization
        description: category.description[lang] || category.description["en"], // Handle category title localization
        content: category.content[lang] || category.content["en"], // Handle category content localization
        imageUrl: category.imageUrl,
        toolTip: category.toolTip
          ? {
              title:
                category.toolTip.title?.[lang] ||
                category.toolTip.title?.["en"] ||
                "",
              description:
                category.toolTip.description?.[lang] ||
                category.toolTip.description?.["en"] ||
                "",
              imageUrl: category.toolTip.imageUrl || "",
            }
          : null,
      })),
    };

    res.json(localizedSection);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Update the status of the section or category
router.patch("/:type/:id/status", verifyToken, async (req, res) => {
  const { type, id } = req.params;
  const { status } = req.body;

  try {
    let updatedSection;
    if (type === "section") {
      updatedSection = await SectionNew.findOneAndUpdate(
        { sectionId: id },
        { status },
        { new: true },
      );
    } else if (type === "category") {
      updatedSection = await SectionNew.findOneAndUpdate(
        { "categories.categoryId": id },
        { $set: { "categories.$.status": status } },
        { new: true },
      );
    } else {
      return res.status(400).json({ error: "Invalid type" });
    }

    res.json(updatedSection);
  } catch (err) {
    res
      .status(500)
      .json({ error: "An error occurred while updating the status" });
  }
});

// Delete a section
router.delete("/section/:sectionId", verifyToken, async (req, res) => {
  try {
    const section = await SectionNew.findOneAndDelete({
      sectionId: req.params.sectionId,
    }); // Use SectionNew model

    if (!section) {
      return res.status(404).json({ message: "Section not found" });
    }

    res.json({ message: "Section deleted successfully" });
  } catch (err) {
    res
      .status(500)
      .json({ error: "An error occurred while deleting the section" });
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
            categories: { categoryId: new mongoose.Types.ObjectId(categoryId) },
          },
        },
        { new: true },
      );

      if (!section) {
        return res
          .status(404)
          .json({ message: "Section not found or category does not exist" });
      }

      res.json({ message: "Category deleted successfully", section });
    } catch (err) {
      res
        .status(500)
        .json({ error: "An error occurred while deleting the category" });
    }
  },
);

// Fetch categories for a specific section
router.get("/section/:sectionId/categories", verifyToken, async (req, res) => {
  try {
    const section = await SectionNew.findOne({
      sectionId: req.params.sectionId,
    }); // Use SectionNew model

    if (!section) return res.status(404).json({ error: "Section not found" });

    res.json(section.categories); // Return the categories for the section
  } catch (err) {
    res
      .status(500)
      .json({ error: "An error occurred while fetching categories" });
  }
});

// Update a section
router.put("/section/:sectionId", verifyToken, async (req, res) => {
  try {
    const { sectionId } = req.params;
    const updatedData = req.body;

    // Update the section using sectionId
    const section = await SectionNew.findOneAndUpdate(
      { sectionId },
      { $set: updatedData },
      { new: true },
    );

    if (!section) return res.status(404).json({ message: "Section not found" });

    res.json(section);
  } catch (error) {
    res.status(500).json({ message: "Error updating section", error });
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

      // بناء كائن التحديث الديناميكي
      const updateFields = {
        "categories.$.title": updatedData.title,
        "categories.$.description": updatedData.description,
        "categories.$.imageUrl": updatedData.imageUrl,
        "categories.$.content": updatedData.content,
        "categories.$.status": updatedData.status,
      };

      // ✅ إذا كان في toolTip ضمن البيانات المرسلة، أضفه للتحديث
      if (updatedData.toolTip) {
        updateFields["categories.$.toolTip"] = {
          title: updatedData.toolTip.title || {},
          description: updatedData.toolTip.description || {},
          imageUrl: updatedData.toolTip.imageUrl || "",
        };
      }

      // تنفيذ التحديث
      const section = await SectionNew.findOneAndUpdate(
        { sectionId, "categories.categoryId": categoryId },
        { $set: updateFields },
        { new: true },
      );

      if (!section) {
        return res.status(404).json({ message: "Category not found" });
      }

      res.json({ message: "Category updated successfully", section });
    } catch (error) {
      console.error("Error updating category:", error);
      res
        .status(500)
        .json({ message: "Error updating category", error: error.message });
    }
  },
);

// ** جلب كل الأقسام **
router.get("/form/sections", verifyToken, async (req, res) => {
  try {
    const sections = await SectionNew.find();
    res.json(sections);
  } catch (err) {
    res.status(500).send(err.message);
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

// ** إضافة قسم جديد **
router.post("/form/sections", verifyToken, async (req, res) => {
  try {
    const newSection = new SectionNew(req.body);
    await newSection.save();
    res.status(201).json(newSection);
  } catch (err) {
    res.status(400).send(err.message);
  }
});

// ** إضافة فئة جديدة داخل قسم موجود **
router.post(
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

      section.categories.push(req.body);
      await section.save();
      res.status(201).json(section);
    } catch (err) {
      res.status(500).send(err.message);
    }
  },
);

module.exports = router;
