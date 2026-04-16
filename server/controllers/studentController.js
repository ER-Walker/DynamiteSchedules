import mongoose from 'mongoose';
import { Student } from '../models/Student.js';
import { User } from '../models/User.js';

export async function getStudents(req, res) {
  try {
    const filter = {};
    const queryUserId = req.query.userId || req.query.userID;

    if (queryUserId) {
      if (!mongoose.isValidObjectId(queryUserId)) {
        return res.status(400).json({ message: 'Invalid userId query value' });
      }
      filter.userId = queryUserId;
    }

    const students = await Student.find(filter)
      .populate('userId', '_id username role')
      .sort({ lastName: 1, firstName: 1 });

    return res.json(students);
  } catch (err) {
    return res.status(500).json({ message: 'Failed to fetch students', error: err.message });
  }
}

export async function getStudentById(req, res) {
  try {
    const student = await Student.findById(req.params.id).populate('userId', '_id username role');

    if (!student) {
      return res.status(404).json({ message: 'Student not found' });
    }

    return res.json(student);
  } catch (err) {
    return res.status(400).json({ message: 'Invalid student id', error: err.message });
  }
}

export async function createStudent(req, res) {
  try {
    const { studentId, email, firstName, lastName, major, track } = req.body;
    const completedClassesInput = req.body.completedClasses;
    const currentClassesInput = req.body.currentClasses;
    const userId = req.body.userId || req.body.userID;

    if (!userId || !studentId || !email || !firstName || !lastName || !major || !track) {
      return res.status(400).json({
        message: 'userId, studentId, email, firstName, lastName, major, and track are required'
      });
    }

    if (!mongoose.isValidObjectId(userId)) {
      return res.status(400).json({ message: 'Invalid userId' });
    }

    if (completedClassesInput !== undefined && !Array.isArray(completedClassesInput)) {
      return res.status(400).json({ message: 'completedClasses must be an array' });
    }

    if (currentClassesInput !== undefined && !Array.isArray(currentClassesInput)) {
      return res.status(400).json({ message: 'currentClasses must be an array' });
    }

    const completedClasses = (completedClassesInput || [])
      .map((value) => String(value).trim())
      .filter(Boolean);

    const currentClasses = (currentClassesInput || [])
      .map((value) => String(value).trim())
      .filter(Boolean);

    const user = await User.findById(userId).select('_id');
    if (!user) {
      return res.status(404).json({ message: 'Referenced user not found' });
    }

    const created = await Student.create({
      userId,
      studentId: studentId.trim(),
      email: email.trim().toLowerCase(),
      firstName: firstName.trim(),
      lastName: lastName.trim(),
      major: major.trim(),
      track: track.trim(),
      completedClasses,
      currentClasses
    });

    const populated = await Student.findById(created._id).populate('userId', '_id username role');
    return res.status(201).json(populated);
  } catch (err) {
    return res.status(400).json({ message: 'Failed to create student', error: err.message });
  }
}
