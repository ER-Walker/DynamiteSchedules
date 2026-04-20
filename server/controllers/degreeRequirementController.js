import { DegreeRequirement } from '../models/DegreeRequirement.js';

export async function getDegreeRequirements(req, res) {
  try {
    const filter = {};

    if (req.query.major) {
      filter.major = req.query.major;
    }

    if (req.query.track) {
      filter.track = req.query.track;
    }

    const degreeRequirements = await DegreeRequirement.find(filter).sort({ major: 1, track: 1 });
    return res.json(degreeRequirements);
  } catch (err) {
    return res.status(500).json({
      message: 'Failed to fetch degree requirements',
      error: err.message
    });
  }
}

export async function getDegreeRequirementById(req, res) {
  try {
    const degreeRequirement = await DegreeRequirement.findById(req.params.id);

    if (!degreeRequirement) {
      return res.status(404).json({ message: 'Degree requirement not found' });
    }

    return res.json(degreeRequirement);
  } catch (err) {
    return res.status(400).json({
      message: 'Invalid degree requirement id',
      error: err.message
    });
  }
}

export async function createDegreeRequirement(req, res) {
  try {
    const { major, track, requiredCourses, electiveGroups, totalCreditsRequired } = req.body;

    if (!major || !track || totalCreditsRequired === undefined) {
      return res.status(400).json({
        message: 'major, track, and totalCreditsRequired are required'
      });
    }

    if (requiredCourses !== undefined && !Array.isArray(requiredCourses)) {
      return res.status(400).json({ message: 'requiredCourses must be an array' });
    }

    if (electiveGroups !== undefined && !Array.isArray(electiveGroups)) {
      return res.status(400).json({ message: 'electiveGroups must be an array' });
    }

    if (Number.isNaN(Number(totalCreditsRequired))) {
      return res.status(400).json({ message: 'totalCreditsRequired must be a number' });
    }

    const normalizedRequiredCourses = (requiredCourses || [])
      .map((course) => String(course).trim())
      .filter(Boolean);

    const normalizedElectiveGroups = (electiveGroups || []).map((group) => ({
      name: String(group.name || '').trim(),
      creditsRequired: Number(group.creditsRequired),
      matchingTag: String(group.matchingTag || '').trim()
    }));

    const invalidGroup = normalizedElectiveGroups.find(
      (group) => !group.name || Number.isNaN(group.creditsRequired) || !group.matchingTag
    );

    if (invalidGroup) {
      return res.status(400).json({
        message: 'Each elective group must include name, creditsRequired (number), and matchingTag'
      });
    }

    const created = await DegreeRequirement.create({
      major: major.trim(),
      track: track.trim(),
      requiredCourses: normalizedRequiredCourses,
      electiveGroups: normalizedElectiveGroups,
      totalCreditsRequired: Number(totalCreditsRequired)
    });

    return res.status(201).json(created);
  } catch (err) {
    return res.status(400).json({
      message: 'Failed to create degree requirement',
      error: err.message
    });
  }
}
