import mongoose from 'mongoose';
import { Student } from '../models/Student.js';
import { User } from '../models/User.js';
import { Course } from '../models/Course.js';

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

export async function getCurrentStudentCart(req, res) {
  try {
    const username = req.user?.username;

    if (!username) {
      return res.status(401).json({ message: 'Unauthorized' });
    }

    const user = await User.findOne({ username }).select('_id');

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    const student = await Student.findOne({ userId: user._id }).select(
      'firstName lastName major track cart'
    );

    if (!student) {
      return res.status(404).json({ message: 'Student not found for this user' });
    }

    const cartIds = Array.isArray(student.cart) ? student.cart : [];
    const courses = await Course.find({ _id: { $in: cartIds } }).sort({ _id: 1 });
    const courseMap = new Map(courses.map((course) => [course._id, course]));
    const orderedCourses = cartIds
      .map((courseId) => courseMap.get(courseId))
      .filter(Boolean);

    return res.status(200).json({
      student: {
        firstName: student.firstName,
        lastName: student.lastName,
        major: student.major,
        track: student.track
      },
      cart: cartIds,
      courses: orderedCourses
    });
  } catch (err) {
    return res.status(500).json({ message: 'Failed to fetch cart', error: err.message });
  }
}

export async function moveCartToCurrentClasses(req, res) {
  try {
    const username = req.user?.username;
    const selectedCourseIdsInput = req.body?.courseIds;

    if (!username) {
      return res.status(401).json({ message: 'Unauthorized' });
    }

    const user = await User.findOne({ username }).select('_id');

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    const student = await Student.findOne({ userId: user._id });

    if (!student) {
      return res.status(404).json({ message: 'Student not found for this user' });
    }

    const cartIds = Array.isArray(student.cart) ? student.cart : [];

    if (!cartIds.length) {
      return res.status(400).json({ message: 'There are no courses in the cart to add.' });
    }

    if (!Array.isArray(selectedCourseIdsInput) || !selectedCourseIdsInput.length) {
      return res.status(400).json({ message: 'Select at least one course from the cart.' });
    }

    const selectedCourseIds = selectedCourseIdsInput
      .map((courseId) => String(courseId).trim())
      .filter(Boolean);

    const invalidSelection = selectedCourseIds.find((courseId) => !cartIds.includes(courseId));

    if (invalidSelection) {
      return res.status(400).json({ message: 'One or more selected courses are not in the cart.' });
    }

    if (!Array.isArray(student.currentClasses)) {
      student.currentClasses = [];
    }

    const currentClassSet = new Set(student.currentClasses);
    let addedCount = 0;

    selectedCourseIds.forEach((courseId) => {
      if (!currentClassSet.has(courseId)) {
        student.currentClasses.push(courseId);
        currentClassSet.add(courseId);
        addedCount += 1;
      }
    });

    student.cart = cartIds.filter((courseId) => !selectedCourseIds.includes(courseId));
    await student.save();

    return res.status(200).json({
      message:
        addedCount > 0
          ? `${addedCount} selected course(s) moved to current classes.`
          : 'The selected courses were already in current classes.',
      currentClasses: student.currentClasses,
      cart: student.cart
    });
  } catch (err) {
    return res.status(500).json({ message: 'Failed to update current classes', error: err.message });
  }
}

export async function addCourseToCart(req, res) {
  try {
    const username = req.user?.username;
    const { courseId } = req.body;

    if (!username) {
      return res.status(401).json({ message: 'Unauthorized' });
    }

    if (!courseId) {
      return res.status(400).json({ message: 'courseId is required' });
    }

    const normalizedCourseId = String(courseId).trim();
    const user = await User.findOne({ username }).select('_id');

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    const student = await Student.findOne({ userId: user._id });

    if (!student) {
      return res.status(404).json({ message: 'Student not found for this user' });
    }

    const course = await Course.findById(normalizedCourseId).select('_id');

    if (!course) {
      return res.status(404).json({ message: 'Course not found' });
    }

    if (!Array.isArray(student.cart)) {
      student.cart = [];
    }

    if (student.cart.includes(normalizedCourseId)) {
      return res.status(200).json({
        message: 'Course is already in the cart',
        cart: student.cart
      });
    }

    student.cart.push(normalizedCourseId);
    await student.save();

    return res.status(200).json({
      message: 'Course added to cart',
      cart: student.cart
    });
  } catch (err) {
    return res.status(500).json({ message: 'Failed to update cart', error: err.message });
  }
}

export async function removeSelectedCoursesFromCart(req, res) {
  try {
    const username = req.user?.username;
    const selectedCourseIdsInput = req.body?.courseIds;

    if (!username) {
      return res.status(401).json({ message: 'Unauthorized' });
    }

    const user = await User.findOne({ username }).select('_id');

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    const student = await Student.findOne({ userId: user._id });

    if (!student) {
      return res.status(404).json({ message: 'Student not found for this user' });
    }

    const cartIds = Array.isArray(student.cart) ? student.cart : [];

    if (!cartIds.length) {
      return res.status(400).json({ message: 'There are no courses in the cart to remove.' });
    }

    if (!Array.isArray(selectedCourseIdsInput) || !selectedCourseIdsInput.length) {
      return res.status(400).json({ message: 'Select at least one course from the cart.' });
    }

    const selectedCourseIds = selectedCourseIdsInput
      .map((courseId) => String(courseId).trim())
      .filter(Boolean);

    const invalidSelection = selectedCourseIds.find((courseId) => !cartIds.includes(courseId));

    if (invalidSelection) {
      return res.status(400).json({ message: 'One or more selected courses are not in the cart.' });
    }

    student.cart = cartIds.filter((courseId) => !selectedCourseIds.includes(courseId));
    await student.save();

    return res.status(200).json({
      message: `${selectedCourseIds.length} selected course(s) removed from the cart.`,
      cart: student.cart
    });
  } catch (err) {
    return res.status(500).json({ message: 'Failed to update cart', error: err.message });
  }
}

export async function createStudent(req, res) {
  try {
    const { studentId, email, firstName, lastName, major, track } = req.body;
    const completedClassesInput = req.body.completedClasses;
    const currentClassesInput = req.body.currentClasses;
    const cartInput = req.body.cart;
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

    if (cartInput !== undefined && !Array.isArray(cartInput)) {
      return res.status(400).json({ message: 'cart must be an array' });
    }

    const completedClasses = (completedClassesInput || [])
      .map((value) => String(value).trim())
      .filter(Boolean);

    const currentClasses = (currentClassesInput || [])
      .map((value) => String(value).trim())
      .filter(Boolean);

    const cart = (cartInput || [])
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
      currentClasses,
      cart
    });

    const populated = await Student.findById(created._id).populate('userId', '_id username role');
    return res.status(201).json(populated);
  } catch (err) {
    return res.status(400).json({ message: 'Failed to create student', error: err.message });
  }
}
