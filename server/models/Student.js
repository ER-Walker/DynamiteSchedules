import mongoose from 'mongoose';

const studentSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      unique: true
    },
    studentId: {
      type: String,
      required: true,
      unique: true,
      trim: true
    },
    email: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      lowercase: true
    },
    firstName: {
      type: String,
      required: true,
      trim: true
    },
    lastName: {
      type: String,
      required: true,
      trim: true
    },
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
    completedClasses: {
      type: [String],
      default: []
    },
    currentClasses: {
      type: [String],
      default: []
    },
    cart: {
      type: [String],
      default: []
    }
  },
  {
    collection: 'students',
    timestamps: { createdAt: true, updatedAt: false },
    versionKey: false
  }
);

export const Student = mongoose.model('Student', studentSchema);
