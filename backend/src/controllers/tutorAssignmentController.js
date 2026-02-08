const TutorAssignment = require('../models/TutorAssignment');
const Tutor = require('../models/Tutor');
const Student = require('../models/Student');

/**
 * TUTOR ASSIGNMENT CONTROLLER
 * Admin-only: manage tutor-student mappings
 */

// @desc    Get all assignments (admin)
// @route   GET /api/admin/assignments
exports.getAssignments = async (req, res) => {
  try {
    const { tutor, student, status } = req.query;
    const query = {};
    if (tutor) query.tutor = tutor;
    if (student) query.student = student;
    if (status) query.status = status;

    const assignments = await TutorAssignment.find(query)
      .populate('tutor', 'name email subjects status')
      .populate('student', 'name email phone')
      .populate('assignedBy', 'name email')
      .sort({ createdAt: -1 });

    res.json({ success: true, data: assignments });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error', error: error.message });
  }
};

// @desc    Create assignment (admin assigns tutor to student)
// @route   POST /api/admin/assignments
exports.createAssignment = async (req, res) => {
  try {
    const { tutorId, studentId, subject, notes } = req.body;

    if (!tutorId || !studentId) {
      return res.status(400).json({ success: false, message: 'tutorId and studentId are required' });
    }

    // Verify tutor exists and is approved
    const tutor = await Tutor.findById(tutorId);
    if (!tutor) return res.status(404).json({ success: false, message: 'Tutor not found' });
    if (tutor.status !== 'approved') {
      return res.status(400).json({ success: false, message: 'Tutor must be approved before assignment' });
    }

    // Verify student exists
    const student = await Student.findById(studentId);
    if (!student) return res.status(404).json({ success: false, message: 'Student not found' });

    // Check for existing assignment
    const existing = await TutorAssignment.findOne({ tutor: tutorId, student: studentId });
    if (existing) {
      // Re-activate if inactive
      if (existing.status === 'inactive') {
        existing.status = 'active';
        existing.subject = subject || existing.subject;
        existing.notes = notes || existing.notes;
        existing.assignedBy = req.user._id;
        await existing.save();
        const populated = await TutorAssignment.findById(existing._id)
          .populate('tutor', 'name email subjects status')
          .populate('student', 'name email phone')
          .populate('assignedBy', 'name email');
        return res.json({ success: true, message: 'Assignment re-activated', data: populated });
      }
      return res.status(400).json({ success: false, message: 'This tutor-student assignment already exists' });
    }

    const assignment = await TutorAssignment.create({
      tutor: tutorId,
      student: studentId,
      assignedBy: req.user._id,
      subject: subject || '',
      notes: notes || ''
    });

    const populated = await TutorAssignment.findById(assignment._id)
      .populate('tutor', 'name email subjects status')
      .populate('student', 'name email phone')
      .populate('assignedBy', 'name email');

    res.status(201).json({ success: true, message: 'Assignment created', data: populated });
  } catch (error) {
    if (error.code === 11000) {
      return res.status(400).json({ success: false, message: 'This tutor-student assignment already exists' });
    }
    res.status(500).json({ success: false, message: 'Server error', error: error.message });
  }
};

// @desc    Bulk create assignments (admin assigns multiple students to a tutor or vice versa)
// @route   POST /api/admin/assignments/bulk
exports.bulkCreateAssignments = async (req, res) => {
  try {
    const { tutorId, studentIds, tutorIds, studentId, subject, notes } = req.body;
    const results = { created: 0, skipped: 0, errors: [] };

    // Mode 1: one tutor → many students
    if (tutorId && studentIds && Array.isArray(studentIds)) {
      const tutor = await Tutor.findById(tutorId);
      if (!tutor || tutor.status !== 'approved') {
        return res.status(400).json({ success: false, message: 'Tutor not found or not approved' });
      }

      for (const sid of studentIds) {
        try {
          const student = await Student.findById(sid);
          if (!student) { results.errors.push(`Student ${sid} not found`); continue; }

          const existing = await TutorAssignment.findOne({ tutor: tutorId, student: sid });
          if (existing) {
            if (existing.status === 'inactive') {
              existing.status = 'active';
              existing.assignedBy = req.user._id;
              await existing.save();
              results.created++;
            } else {
              results.skipped++;
            }
            continue;
          }

          await TutorAssignment.create({
            tutor: tutorId, student: sid,
            assignedBy: req.user._id, subject: subject || '', notes: notes || ''
          });
          results.created++;
        } catch (err) {
          results.errors.push(`Error assigning student ${sid}: ${err.message}`);
        }
      }
    }

    // Mode 2: many tutors → one student
    if (studentId && tutorIds && Array.isArray(tutorIds)) {
      const student = await Student.findById(studentId);
      if (!student) {
        return res.status(400).json({ success: false, message: 'Student not found' });
      }

      for (const tid of tutorIds) {
        try {
          const tutor = await Tutor.findById(tid);
          if (!tutor || tutor.status !== 'approved') {
            results.errors.push(`Tutor ${tid} not found or not approved`);
            continue;
          }

          const existing = await TutorAssignment.findOne({ tutor: tid, student: studentId });
          if (existing) {
            if (existing.status === 'inactive') {
              existing.status = 'active';
              existing.assignedBy = req.user._id;
              await existing.save();
              results.created++;
            } else {
              results.skipped++;
            }
            continue;
          }

          await TutorAssignment.create({
            tutor: tid, student: studentId,
            assignedBy: req.user._id, subject: subject || '', notes: notes || ''
          });
          results.created++;
        } catch (err) {
          results.errors.push(`Error assigning tutor ${tid}: ${err.message}`);
        }
      }
    }

    res.json({ success: true, message: `Created ${results.created}, skipped ${results.skipped}`, data: results });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error', error: error.message });
  }
};

// @desc    Update assignment
// @route   PUT /api/admin/assignments/:id
exports.updateAssignment = async (req, res) => {
  try {
    const { status, subject, notes } = req.body;
    const assignment = await TutorAssignment.findById(req.params.id);
    if (!assignment) return res.status(404).json({ success: false, message: 'Assignment not found' });

    if (status) assignment.status = status;
    if (subject !== undefined) assignment.subject = subject;
    if (notes !== undefined) assignment.notes = notes;
    await assignment.save();

    const populated = await TutorAssignment.findById(assignment._id)
      .populate('tutor', 'name email subjects status')
      .populate('student', 'name email phone')
      .populate('assignedBy', 'name email');

    res.json({ success: true, message: 'Assignment updated', data: populated });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error', error: error.message });
  }
};

// @desc    Delete assignment
// @route   DELETE /api/admin/assignments/:id
exports.deleteAssignment = async (req, res) => {
  try {
    const assignment = await TutorAssignment.findByIdAndDelete(req.params.id);
    if (!assignment) return res.status(404).json({ success: false, message: 'Assignment not found' });
    res.json({ success: true, message: 'Assignment removed' });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error', error: error.message });
  }
};

// @desc    Get assigned students for a tutor (used by tutor panel)
// @route   GET /api/tutor/assigned-students
exports.getAssignedStudentsForTutor = async (req, res) => {
  try {
    const tutorId = req.user._id || req.user.id;
    const assignments = await TutorAssignment.find({ tutor: tutorId, status: 'active' })
      .populate('student', 'name email phone');

    const students = assignments.map(a => a.student).filter(Boolean);
    res.json({ success: true, students });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error', error: error.message });
  }
};

// @desc    Get assigned tutors for a student (used by student panel)
// @route   GET /api/student/assigned-tutors
exports.getAssignedTutorsForStudent = async (req, res) => {
  try {
    const studentId = req.user._id || req.user.id;
    const assignments = await TutorAssignment.find({ student: studentId, status: 'active' })
      .populate('tutor', 'name email subjects experienceYears avatar profileImage status');

    const tutors = assignments.map(a => a.tutor).filter(Boolean);
    res.json({ success: true, tutors });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error', error: error.message });
  }
};
