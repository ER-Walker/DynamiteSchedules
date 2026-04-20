import mongoose from 'mongoose';

const courseSchema = new mongoose.Schema(
  {
    _id: {
      type: String,
      required: true,
      trim: true
    },
    name: {
      type: String,
      required: true,
      trim: true
    },
    credits: {
      type: Number,
      required: true,
      min: 0
    },
    prerequisite: {
      type: [String],
      default: []
    },
    corequisite: {
      type: [String],
      default: []
    },
    description: {
      type: String,
      default: '',
      trim: true
    },
    requirementTag: {
      type: [String],
      default: []
    }
  },
  {
    collection: 'courses',
    timestamps: true
  }
);

export const Course = mongoose.model('Course', courseSchema);
