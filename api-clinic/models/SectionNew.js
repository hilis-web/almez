const mongoose = require("mongoose");

// =======================================
// Localized String Schema
// =======================================

const localizedStringSchema = new mongoose.Schema(
  {
    ar: { type: String, required: false },
    en: { type: String, required: false },
    es: { type: String, required: true },
  },
  { _id: false },
);

// =======================================
// ToolTip Schema
// =======================================

const toolTipSchema = new mongoose.Schema(
  {
    title: localizedStringSchema,
    description: localizedStringSchema,
    imageUrl: {
      type: String,
      required: false,
    },
  },
  { _id: false },
);

// =======================================
// Item Schema
// (Fracturas, Hernia Discal, Fusion...)
// =======================================

const itemSchema = new mongoose.Schema(
  {
    itemId: {
      type: mongoose.Schema.Types.ObjectId,
      default: () => new mongoose.Types.ObjectId(),
    },

    title: localizedStringSchema,

    description: localizedStringSchema,

    content: localizedStringSchema,

    imageUrl: {
      type: String,
      required: false,
    },

    toolTip: toolTipSchema,

    status: {
      type: String,
      enum: ["Published", "Unpublished"],
      default: "Published",
    },
  },
  { _id: false },
);

// =======================================
// Category Schema
// (Spine, Orthopedics, Rehabilitation)
// =======================================

const categorySchema = new mongoose.Schema(
  {
    categoryId: {
      type: mongoose.Schema.Types.ObjectId,
      default: () => new mongoose.Types.ObjectId(),
    },

    title: localizedStringSchema,

    description: localizedStringSchema,

    imageUrl: {
      type: String,
      required: false,
    },

    toolTip: toolTipSchema,

    items: [itemSchema],

    status: {
      type: String,
      enum: ["Published", "Unpublished"],
      default: "Published",
    },
  },
  { _id: false },
);

// =======================================
// Section Schema
// (Pathologies, Treatments, Team...)
// =======================================

const sectionNewSchema = new mongoose.Schema(
  {
    sectionId: {
      type: mongoose.Schema.Types.ObjectId,
      default: () => new mongoose.Types.ObjectId(),
    },

    title: localizedStringSchema,

    description: localizedStringSchema,

    imageUrl: {
      type: String,
      required: false,
    },

    categories: [categorySchema],

    status: {
      type: String,
      enum: ["Published", "Unpublished"],
      default: "Published",
    },
  },
  {
    timestamps: true,
  },
);

module.exports = mongoose.model("SectionNew", sectionNewSchema);
