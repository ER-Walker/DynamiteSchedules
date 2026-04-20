import { ScheduleCart } from '../models/ScheduleCart.js';
import { Student } from '../models/Student.js';
import { Course } from '../models/Course.js';

export async function getScheduleCarts(req, res) {
  try {
    const filter = {};

    if (req.query.studentId) {
      filter.studentId = String(req.query.studentId).trim();
    }

    const carts = await ScheduleCart.find(filter).sort({ studentId: 1 });
    return res.json(carts);
  } catch (err) {
    return res.status(500).json({
      message: 'Failed to fetch schedule carts',
      error: err.message
    });
  }
}

export async function getScheduleCartById(req, res) {
  try {
    const cart = await ScheduleCart.findById(req.params.id);

    if (!cart) {
      return res.status(404).json({ message: 'Schedule cart not found' });
    }

    return res.json(cart);
  } catch (err) {
    return res.status(400).json({
      message: 'Invalid schedule cart id',
      error: err.message
    });
  }
}

export async function createScheduleCart(req, res) {
  try {
    const { studentId, addedCourses } = req.body;

    if (!studentId) {
      return res.status(400).json({ message: 'studentId is required' });
    }

    if (addedCourses !== undefined && !Array.isArray(addedCourses)) {
      return res.status(400).json({ message: 'addedCourses must be an array' });
    }

    const normalizedStudentId = String(studentId).trim();
    const normalizedAddedCourses = (addedCourses || [])
      .map((courseId) => String(courseId).trim())
      .filter(Boolean);

    const studentExists = await Student.findOne({ studentId: normalizedStudentId }).select('_id');
    if (!studentExists) {
      return res.status(404).json({ message: 'Referenced student not found' });
    }

    const created = await ScheduleCart.create({
      studentId: normalizedStudentId,
      addedCourses: normalizedAddedCourses
    });

    return res.status(201).json(created);
  } catch (err) {
    return res.status(400).json({
      message: 'Failed to create schedule cart',
      error: err.message
    });
  }
}

export async function addCourseToScheduleCart(req, res) {
  try {
    const { courseId } = req.body;

    if (!courseId) {
      return res.status(400).json({ message: 'courseId is required' });
    }

    const normalizedCourseId = String(courseId).trim();
    const cart = await ScheduleCart.findById(req.params.id);

    if (!cart) {
      return res.status(404).json({ message: 'Schedule cart not found' });
    }

    const courseExists = await Course.findById(normalizedCourseId).select('_id');
    if (!courseExists) {
      return res.status(404).json({ message: 'Referenced course not found' });
    }

    if (cart.addedCourses.includes(normalizedCourseId)) {
      return res.status(200).json({
        message: 'Course already exists in cart',
        cart
      });
    }

    cart.addedCourses.push(normalizedCourseId);
    await cart.save();

    return res.json(cart);
  } catch (err) {
    return res.status(400).json({
      message: 'Failed to add course to schedule cart',
      error: err.message
    });
  }
}
