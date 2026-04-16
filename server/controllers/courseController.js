import { Course } from '../models/Course.js';

export async function getCourses(req, res) {
  try {
    const filter = {};

    if (req.query.requirementTag) {
      filter.requirementTag = req.query.requirementTag;
    }

    const courses = await Course.find(filter).sort({ _id: 1 });
    return res.json(courses);
  } catch (err) {
    return res.status(500).json({
      message: 'Failed to fetch courses',
      error: err.message
    });
  }
}

export async function getCourseById(req, res) {
  try {
    const course = await Course.findById(req.params.id);

    if (!course) {
      return res.status(404).json({ message: 'Course not found' });
    }

    return res.json(course);
  } catch (err) {
    return res.status(400).json({
      message: 'Invalid course id',
      error: err.message
    });
  }
}

export async function createCourse(req, res) {
  try {
    const { _id, name, credits, prerequisite, corequisite, description, requirementTag } = req.body;

    if (!_id || !name || credits === undefined) {
      return res.status(400).json({
        message: '_id, name, and credits are required'
      });
    }

    if (Number.isNaN(Number(credits))) {
      return res.status(400).json({ message: 'credits must be a number' });
    }

    if (prerequisite !== undefined && !Array.isArray(prerequisite)) {
      return res.status(400).json({ message: 'prerequisite must be an array' });
    }

    if (corequisite !== undefined && !Array.isArray(corequisite)) {
      return res.status(400).json({ message: 'corequisite must be an array' });
    }

    if (requirementTag !== undefined && !Array.isArray(requirementTag)) {
      return res.status(400).json({ message: 'requirementTag must be an array' });
    }

    const normalizedCourse = {
      _id: String(_id).trim(),
      name: String(name).trim(),
      credits: Number(credits),
      prerequisite: (prerequisite || []).map((value) => String(value).trim()).filter(Boolean),
      corequisite: (corequisite || []).map((value) => String(value).trim()).filter(Boolean),
      description: description ? String(description).trim() : '',
      requirementTag: (requirementTag || [])
        .map((value) => String(value).trim())
        .filter(Boolean)
    };

    const created = await Course.create(normalizedCourse);
    return res.status(201).json(created);
  } catch (err) {
    return res.status(400).json({
      message: 'Failed to create course',
      error: err.message
    });
  }
}
