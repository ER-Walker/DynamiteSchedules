import mongoose from 'mongoose';

const electiveGroupSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true
    },
    creditsRequired: {
      type: Number,
      required: true,
      min: 0
    },
    matchingTag: {
      type: String,
      required: true,
      trim: true
    }
  },
  { _id: false }
);

const degreeRequirementSchema = new mongoose.Schema(
  {
    major: {
      type: String,
      required: true,
      trim: true
    },
    track: {
      type: String,
      required: true,
      trim: true
    },
    requiredCourses: {
      type: [String],
      default: []
    },
    electiveGroups: {
      type: [electiveGroupSchema],
      default: []
    },
    totalCreditsRequired: {
      type: Number,
      required: true,
      min: 0
    }
  },
  {
    collection: 'degreeRequirements',
    timestamps: true
  }
);

degreeRequirementSchema.index({ major: 1, track: 1 }, { unique: true });

export const DegreeRequirement = mongoose.model('DegreeRequirement', degreeRequirementSchema);
