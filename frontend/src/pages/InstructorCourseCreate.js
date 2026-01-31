import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import DashboardLayout from '../components/DashboardLayout';
import TutorSidebar from '../components/TutorSidebar';
import api from '../lib/api';

/**
 * Instructor Course Creation Form
 * Multi-step course creation wizard
 */
const InstructorCourseCreate = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [currentStep, setCurrentStep] = useState(1);

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    category: 'Programming',
    level: 'beginner',
    duration: 10,
    prerequisites: [],
    learningOutcomes: []
  });

  const [prerequisiteInput, setPrerequisiteInput] = useState('');
  const [outcomeInput, setOutcomeInput] = useState('');

  const categories = [
    'Programming',
    'Web Development',
    'Mobile Development',
    'Data Science',
    'Machine Learning',
    'Design',
    'Business',
    'Languages',
    'Other'
  ];

  const levels = ['beginner', 'intermediate', 'advanced'];

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: name === 'duration' ? parseInt(value) : value
    }));
  };

  const addPrerequisite = () => {
    if (prerequisiteInput.trim()) {
      setFormData(prev => ({
        ...prev,
        prerequisites: [...prev.prerequisites, prerequisiteInput.trim()]
      }));
      setPrerequisiteInput('');
    }
  };

  const removePrerequisite = (index) => {
    setFormData(prev => ({
      ...prev,
      prerequisites: prev.prerequisites.filter((_, i) => i !== index)
    }));
  };

  const addOutcome = () => {
    if (outcomeInput.trim()) {
      setFormData(prev => ({
        ...prev,
        learningOutcomes: [...prev.learningOutcomes, outcomeInput.trim()]
      }));
      setOutcomeInput('');
    }
  };

  const removeOutcome = (index) => {
    setFormData(prev => ({
      ...prev,
      learningOutcomes: prev.learningOutcomes.filter((_, i) => i !== index)
    }));
  };

  const nextStep = () => {
    if (currentStep === 1) {
      if (!formData.title.trim()) {
        setError('Course title is required');
        return;
      }
      if (!formData.description.trim()) {
        setError('Course description is required');
        return;
      }
      setError('');
    }
    setCurrentStep(prev => prev + 1);
  };

  const prevStep = () => {
    setCurrentStep(prev => prev - 1);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (currentStep < 2) {
      nextStep();
      return;
    }
    setError('');
    setSuccess('');

    if (formData.duration < 1) {
      setError('Course duration must be at least 1 hour');
      return;
    }

    try {
      setLoading(true);
      const res = await api.post('/lms/courses', formData);
      setSuccess('Course created successfully!');
      setTimeout(() => {
        const courseId = res.data.data._id;
        navigate(`/tutor/courses/${courseId}/edit`);
      }, 1000);
    } catch (err) {
      console.error('Create course error:', err);
      setError(err.response?.data?.message || 'Failed to create course');
    } finally {
      setLoading(false);
    }
  };

  return (
    <DashboardLayout sidebar={TutorSidebar}>
      <div className="max-w-2xl mx-auto">
        <div className="mb-6">
          <button
            onClick={() => navigate('/tutor/lms/courses')}
            className="text-indigo-400 hover:text-indigo-300 mb-4 flex items-center gap-2"
          >
            ← Back to Courses
          </button>
          <h1 className="text-3xl font-bold text-black">Create New Course</h1>
          <p className="text-slate-400 mt-1">
            {currentStep === 1 ? 'Step 1: Set up your course basics' : 'Step 2: Define prerequisites and outcomes'}
          </p>

          {/* Step Indicator */}
          <div className="flex items-center gap-4 mt-6">
            <div className="flex items-center gap-2">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold ${currentStep >= 1 ? 'bg-indigo-600 text-white' : 'bg-slate-700 text-slate-400'}`}>1</div>
              <span className={`text-sm ${currentStep === 1 ? 'text-white font-semibold' : 'text-slate-500'}`}>Basics</span>
            </div>
            <div className="w-12 h-px bg-slate-700" />
            <div className="flex items-center gap-2">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold ${currentStep >= 2 ? 'bg-indigo-600 text-white' : 'bg-slate-700 text-slate-400'}`}>2</div>
              <span className={`text-sm ${currentStep === 2 ? 'text-white font-semibold' : 'text-slate-500'}`}>Outcomes</span>
            </div>
          </div>
        </div>

        {error && (
          <div className="mb-4 p-4 rounded-lg bg-red-900/30 border border-red-700 text-red-300">
            {error}
          </div>
        )}

        {success && (
          <div className="mb-4 p-4 rounded-lg bg-green-900/30 border border-green-700 text-green-300">
            {success}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          {currentStep === 1 ? (
            <>
              {/* Course Title */}
              <div className="bg-slate-800 rounded-xl border border-slate-700 p-6">
                <label className="block text-sm font-semibold text-white mb-2">
                  Course Title *
                </label>
                <input
                  type="text"
                  name="title"
                  value={formData.title}
                  onChange={handleChange}
                  placeholder="e.g., Introduction to JavaScript"
                  className="w-full px-4 py-2 rounded-lg bg-slate-700 border border-slate-600 text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500"
                  maxLength={100}
                />
                <p className="text-xs text-slate-500 mt-1">{formData.title.length}/100</p>
              </div>

              {/* Course Description */}
              <div className="bg-slate-800 rounded-xl border border-slate-700 p-6">
                <label className="block text-sm font-semibold text-white mb-2">
                  Course Description *
                </label>
                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleChange}
                  placeholder="Describe what students will learn in this course..."
                  rows="5"
                  className="w-full px-4 py-2 rounded-lg bg-slate-700 border border-slate-600 text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500 resize-none"
                  maxLength={1000}
                />
                <p className="text-xs text-slate-500 mt-1">{formData.description.length}/1000</p>
              </div>

              {/* Category and Level */}
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-slate-800 rounded-xl border border-slate-700 p-6">
                  <label className="block text-sm font-semibold text-white mb-2">
                    Category
                  </label>
                  <select
                    name="category"
                    value={formData.category}
                    onChange={handleChange}
                    className="w-full px-4 py-2 rounded-lg bg-slate-700 border border-slate-600 text-white focus:outline-none focus:border-indigo-500"
                  >
                    {categories.map(cat => (
                      <option key={cat} value={cat}>{cat}</option>
                    ))}
                  </select>
                </div>

                <div className="bg-slate-800 rounded-xl border border-slate-700 p-6">
                  <label className="block text-sm font-semibold text-white mb-2">
                    Level
                  </label>
                  <select
                    name="level"
                    value={formData.level}
                    onChange={handleChange}
                    className="w-full px-4 py-2 rounded-lg bg-slate-700 border border-slate-600 text-white focus:outline-none focus:border-indigo-500"
                  >
                    {levels.map(lvl => (
                      <option key={lvl} value={lvl}>
                        {lvl.charAt(0).toUpperCase() + lvl.slice(1)}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Duration */}
              <div className="bg-slate-800 rounded-xl border border-slate-700 p-6">
                <label className="block text-sm font-semibold text-white mb-2">
                  Estimated Duration (hours)
                </label>
                <input
                  type="number"
                  name="duration"
                  value={formData.duration}
                  onChange={handleChange}
                  min="1"
                  max="1000"
                  className="w-full px-4 py-2 rounded-lg bg-slate-700 border border-slate-600 text-white focus:outline-none focus:border-indigo-500"
                />
              </div>
            </>
          ) : (
            <>
              {/* Prerequisites */}
              <div className="bg-slate-800 rounded-xl border border-slate-700 p-6">
                <label className="block text-sm font-semibold text-white mb-2">
                  Prerequisites
                </label>
                <div className="flex gap-2 mb-3">
                  <input
                    type="text"
                    value={prerequisiteInput}
                    onChange={(e) => setPrerequisiteInput(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addPrerequisite())}
                    placeholder="Add a prerequisite..."
                    className="flex-1 px-4 py-2 rounded-lg bg-slate-700 border border-slate-600 text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500"
                  />
                  <button
                    type="button"
                    onClick={addPrerequisite}
                    className="px-4 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white font-medium"
                  >
                    Add
                  </button>
                </div>
                <div className="flex flex-wrap gap-2">
                  {formData.prerequisites.map((prereq, idx) => (
                    <div
                      key={idx}
                      className="px-3 py-1 rounded-full bg-indigo-900/30 border border-indigo-700 text-indigo-300 text-sm flex items-center gap-2"
                    >
                      {prereq}
                      <button
                        type="button"
                        onClick={() => removePrerequisite(idx)}
                        className="hover:text-indigo-200 font-bold"
                      >
                        ×
                      </button>
                    </div>
                  ))}
                </div>
              </div>

              {/* Learning Outcomes */}
              <div className="bg-slate-800 rounded-xl border border-slate-700 p-6">
                <label className="block text-sm font-semibold text-white mb-2">
                  Learning Outcomes
                </label>
                <div className="flex gap-2 mb-3">
                  <input
                    type="text"
                    value={outcomeInput}
                    onChange={(e) => setOutcomeInput(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addOutcome())}
                    placeholder="What will students learn?"
                    className="flex-1 px-4 py-2 rounded-lg bg-slate-700 border border-slate-600 text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500"
                  />
                  <button
                    type="button"
                    onClick={addOutcome}
                    className="px-4 py-2 rounded-lg bg-green-600 hover:bg-green-500 text-white font-medium"
                  >
                    Add
                  </button>
                </div>
                <div className="space-y-2">
                  {formData.learningOutcomes.map((outcome, idx) => (
                    <div
                      key={idx}
                      className="px-3 py-2 rounded-lg bg-green-900/30 border border-green-700 text-green-300 text-sm flex items-center justify-between"
                    >
                      <span>{idx + 1}. {outcome}</span>
                      <button
                        type="button"
                        onClick={() => removeOutcome(idx)}
                        className="hover:text-green-200 font-bold"
                      >
                        ×
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            </>
          )}

          {/* Submit Buttons */}
          <div className="flex gap-3 justify-end">
            {currentStep > 1 && (
              <button
                type="button"
                onClick={prevStep}
                className="px-6 py-2 rounded-lg bg-slate-700 hover:bg-slate-600 text-white font-medium"
              >
                Previous
              </button>
            )}
            {currentStep === 1 ? (
              <button
                type="button"
                onClick={nextStep}
                className="px-6 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white font-medium"
              >
                Next Step
              </button>
            ) : (
              <button
                type="submit"
                disabled={loading}
                className="px-6 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-500 disabled:bg-indigo-600/50 text-white font-medium"
              >
                {loading ? 'Creating...' : 'Create Course'}
              </button>
            )}
          </div>
        </form>

        <div className="mt-8 p-4 rounded-lg bg-slate-800 border border-slate-700 text-slate-400 text-sm">
          <p className="font-semibold text-white mb-2">📝 Next Steps After Creating:</p>
          <ul className="list-disc list-inside space-y-1">
            <li>Add modules to organize your course content</li>
            <li>Create lessons with video, text, or resource content</li>
            <li>Add assignments and quizzes</li>
            <li>Publish your course when ready for students</li>
          </ul>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default InstructorCourseCreate;
