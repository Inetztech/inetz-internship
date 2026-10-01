import { Schema, model, models, Model } from "mongoose";

const ModuleSchema = new Schema(
  {
    label: String,
    title: String,
    tools: [String],
    topics: [String],
  },
  { _id: false }
);

const ProjectSchema = new Schema(
  {
    title: String,
    tech: [String],
    img: String,
  },
  { _id: false }
);

const ReviewSchema = new Schema(
  {
    name: String,
    role: String,
    text: String,
    rating: Number,
  },
  { _id: false }
);

const ProgramSchema = new Schema(
  {
    slug: { type: String, required: true, index: true },
    title: { type: String, required: true },
    subtitle: { type: String },
    duration: { type: String, index: true },
    price: { type: Number },
    originalPrice: { type: Number },
    heroImg: { type: String },
    pdfFileName: { type: String },
    syllabus: [ModuleSchema],
    projects: [ProjectSchema],
    reviews: [ReviewSchema],
  },
  { timestamps: true }
);

// 🚀 High-Speed Indexes for instant lookup by slug & duration
ProgramSchema.index({ slug: 1, duration: 1 });
ProgramSchema.index({ createdAt: -1 });

const Program: Model<any> = models.Program || model("Program", ProgramSchema);
export default Program;
