import React, { useState, useEffect } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { useNavigate } from 'react-router-dom'
import { postJob, fetchJobs } from '../Services/Jobs/JobsSlice'
import { API_ENDPOINTS } from '../Services/config'
import logger from '../Services/logger'
import { toast } from 'react-toastify'
import ProgressSteps from '../Components/post-job-components/ProgressSteps'
import JobDetailsStep from '../Components/post-job-components/JobDetailsStep'
import SkillsExpertiseStep from '../Components/post-job-components/SkillsExpertiseStep'
import BudgetTimelineStep from '../Components/post-job-components/BudgetTimelineStep'
import ReviewStep from '../Components/post-job-components/ReviewStep'
import FormNavigation from '../Components/post-job-components/FormNavigation'
import './PostJob.css'

function PostJob() {
  const dispatch = useDispatch()
  const navigate = useNavigate()
  const { user, isAuthenticated } = useSelector((state) => state.auth)
  const { loading, error } = useSelector((state) => state.jobs)

  const [currentStep, setCurrentStep] = useState(1)
  const [categories, setCategories] = useState([])
  const [specialties, setSpecialties] = useState([])
  const [skills, setSkills] = useState([])

  const [formData, setFormData] = useState({
    // Step 1: Job Details
    title: '',
    description: '',
    category: '',
    specialty: '',

    // Step 2: Skills and Expertise
    requiredSkills: [],

    // Step 3: Budget and Timeline
    budgetType: 'fixed',
    budget: '',
    duration: '',

    // Step 4: Additional Information
    attachments: []
  })

  useEffect(() => {
    // Check if user is authenticated - allow any authenticated user to post jobs
    if (!isAuthenticated) {
      navigate('/')
      return
    }
    fetchCategories()
    fetchSkills()
  }, [isAuthenticated, navigate])

  const fetchCategories = async () => {
    try {
      const response = await fetch(API_ENDPOINTS.CATEGORIES_ALL)
      const data = await response.json()
      setCategories(data)
    } catch (error) {
      console.error('Error fetching categories:', error)
    }
  }

  const fetchSpecialties = async (categoryId) => {
    try {
      const response = await fetch(API_ENDPOINTS.SPECIALTIES_BY_CATEGORY(categoryId))
      const data = await response.json()
      setSpecialties(data)
    } catch (error) {
      console.error('Error fetching specialties:', error)
    }
  }

  const fetchSkills = async () => {
    try {
      const response = await fetch(API_ENDPOINTS.SKILLS_ALL)
      const data = await response.json()
      setSkills(data)
    } catch (error) {
      console.error('Error fetching skills:', error)
    }
  }

  const handleChange = (e) => {
    const { name, value } = e.target

    if (name === 'category') {
      setFormData(prev => ({
        ...prev,
        [name]: value,
        specialty: '' // Reset specialty when category changes
      }))
      if (value) {
        fetchSpecialties(value)
      } else {
        setSpecialties([])
      }
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: value
      }))
    }
  }

  const handleSkillAdd = (skillId) => {
    if (skillId && !formData.requiredSkills.includes(skillId)) {
      setFormData(prev => ({
        ...prev,
        requiredSkills: [...prev.requiredSkills, skillId]
      }))
    }
  }

  const handleSkillRemove = (skillIdToRemove) => {
    setFormData(prev => ({
      ...prev,
      requiredSkills: prev.requiredSkills.filter(id => id !== skillIdToRemove)
    }))
  }

  const handleFileChange = (files) => {
    console.log('📎 PostJob received files:', files?.length || 0, 'files')
    if (files && files.length > 0) {
      console.log('📋 File details:', files.map(f => ({ name: f.name, size: f.size, type: f.type })))
    }
    setFormData(prev => ({
      ...prev,
      attachments: files
    }))
  }

  const nextStep = () => {
    // Validate current step before moving to next
    if (currentStep === 1) {
      // Validate Job Details
      if (!formData.title || !formData.category || !formData.specialty || !formData.description) {
        toast.error('Please fill in all required fields')
        return
      }
      if (formData.description.length < 50) {
        toast.error('Job description must be at least 50 characters')
        return
      }
      // Validate Skills & Expertise
      if (formData.requiredSkills.length === 0) {
        toast.error('Please select at least one skill')
        return
      }
      // Validate Budget & Timeline
      if (!formData.budget || parseFloat(formData.budget) <= 0) {
        toast.error('Please specify a valid budget amount')
        return
      }
      if (!formData.duration || parseInt(formData.duration) <= 0) {
        toast.error('Please specify a valid duration')
        return
      }
    }

    if (currentStep < 2) {
      setCurrentStep(currentStep + 1)
    }
  }

  const prevStep = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1)
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()

    // Validation
    if (!formData.title || !formData.description || !formData.specialty) {
      toast.error('Please fill in all required fields')
      return
    }

    if (formData.description.length < 50) {
      toast.error('Job description must be at least 50 characters')
      return
    }

    if (formData.requiredSkills.length === 0) {
      toast.error('Please select at least one skill')
      return
    }

    if (!formData.budget || parseFloat(formData.budget) <= 0) {
      toast.error('Please specify a valid budget amount')
      return
    }

    if (!formData.duration || parseInt(formData.duration) <= 0) {
      toast.error('Please specify a valid duration')
      return
    }

    // Prepare job data according to backend schema
    const jobData = {
      title: formData.title.trim(),
      description: formData.description.trim(),
      specialty: formData.specialty,
      skills: formData.requiredSkills, // Backend expects 'skills' not 'requiredSkills'
      budget: {
        type: formData.budgetType || 'fixed',
        amount: parseFloat(formData.budget)
      },
      duration: parseInt(formData.duration),
      attachments: formData.attachments // 🔥 Include attachments
    }

    const result = await dispatch(postJob(jobData))

    if (result.type === 'jobs/postJob/fulfilled') {
      // 🔥 Check for balance warning
      const balanceWarning = result.payload?.balanceWarning

      if (balanceWarning) {
        toast.warning(
          `Job posted successfully! ⚠️ ${balanceWarning.message}`,
          {
            autoClose: 8000,
            position: 'top-center'
          }
        )
      } else {
        toast.success('Job posted successfully!')
      }

      // 🔥 Wait for jobs list to refresh before navigating
      await dispatch(fetchJobs())
      navigate('/jobs')
    } else if (result.type === 'jobs/postJob/rejected') {
      toast.error(result.payload || 'Failed to post job')
    }
  }

  const steps = [
    { number: 1, title: 'Job Details & Requirements' },
    { number: 2, title: 'Review & Post' }
  ]

  return (
    <div className="post-job-page">
      <div className="post-job-header">
        <div className="container">
          <h1 className="post-job-title">Post a Job</h1>
          <p className="post-job-subtitle">Find the perfect freelancer for your project</p>
        </div>
      </div>

      <div className="container">
        <div className="post-job-container">
          <ProgressSteps currentStep={currentStep} steps={steps} />

          {error && (
            <div className="alert alert-danger" role="alert">
              {error}
            </div>
          )}

          <form className="post-job-form">
            {currentStep === 1 && (
              <>
                <JobDetailsStep
                  formData={formData}
                  handleChange={handleChange}
                  categories={categories}
                  specialties={specialties}
                />

                <SkillsExpertiseStep
                  formData={formData}
                  handleChange={handleChange}
                  handleSkillAdd={handleSkillAdd}
                  handleSkillRemove={handleSkillRemove}
                  skills={skills}
                />

                <BudgetTimelineStep
                  formData={formData}
                  handleChange={handleChange}
                  handleFileChange={handleFileChange}
                />
              </>
            )}

            {currentStep === 2 && (
              <ReviewStep
                formData={formData}
                categories={categories}
                specialties={specialties}
                skills={skills}
              />
            )}

            <FormNavigation
              currentStep={currentStep}
              totalSteps={2}
              onPrev={prevStep}
              onNext={nextStep}
              onSubmit={handleSubmit}
              loading={loading}
            />
          </form>
        </div>
      </div>
    </div>
  )
}

export default PostJob