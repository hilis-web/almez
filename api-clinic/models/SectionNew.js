const mongoose = require('mongoose');

// **Translated texts schema**
const localizedStringSchema = new mongoose.Schema({
    ar: { type: String, required: false },
    en: { type: String, required: false },
    es: { type: String, required: true }
}, { _id: false });

// **ToolTip schema**
const toolTipSchema = new mongoose.Schema({
    title: localizedStringSchema, // العنوان أو النص المختصر للـ tooltip
    description: localizedStringSchema, // الوصف داخل الـ tooltip
    imageUrl: { type: String, required: false } // الصورة المرافقة للـ tooltip
}, { _id: false });

// **Category schema inside Section**
const categorySchema = new mongoose.Schema({
    categoryId: { type: mongoose.Schema.Types.ObjectId, default: () => new mongoose.Types.ObjectId() }, // Auto-generated
    title: localizedStringSchema,
    description: localizedStringSchema,
    content: localizedStringSchema,
    imageUrl: { type: String, required: false },
    toolTip: toolTipSchema,
    status: { type: String, enum: ['Published', 'Unpublished'], default: 'Published' }
}, { _id: false });

// **Section schema**
const sectionNewSchema = new mongoose.Schema({
    sectionId: { type: mongoose.Schema.Types.ObjectId, default: () => new mongoose.Types.ObjectId() }, // Auto-generated
    title: localizedStringSchema,
    description: localizedStringSchema,
    imageUrl: { type: String, required: false },
    categories: [categorySchema],
    status: { type: String, enum: ['Published', 'Unpublished'], default: 'Published' }
}, { timestamps: true });

module.exports = mongoose.model('SectionNew', sectionNewSchema);