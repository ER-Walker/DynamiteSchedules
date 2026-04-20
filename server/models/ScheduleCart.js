import mongoose from 'mongoose';

const scheduleCartSchema = new mongoose.Schema(
  {
    studentId: {
      type: String,
      required: true,
      unique: true,
      trim: true
    },
    addedCourses: {
      type: [String],
      default: []
    }
  },
  {
    collection: 'scheduleCarts',
    timestamps: true
  }
);

export const ScheduleCart = mongoose.model('ScheduleCart', scheduleCartSchema);
