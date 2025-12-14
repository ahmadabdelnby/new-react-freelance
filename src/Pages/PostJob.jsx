import React, { useState, useEffect } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { useNavigate } from 'react-router-dom'
import { postJob } from '../Services/Jobs/JobsSlice'
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
    experienceLevel: '',
    
    // Step 3: Budget and Timeline
    budgetType: 'fixed',
    budget: '',
    duration: '',
    
    // Step 4: Additional Information
    attachments: []
  })

  useEffect(() => {
    if (!isAuthenticated || user?.role !== 'client') {
      navigate('/login')
    }
    fetchCategories()
    fetchSkills()
  }, [isAuthenticated, user, navigate])

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

  const experienceLevels = [
    { value: 'entry', label: 'Entry Level', description: 'Looking for someone relatively new to this field' },
    { value: 'intermediate', label: 'Intermediate', description: 'Looking for substantial experience in this field' },
    { value: 'expert', label: 'Expert', description: 'Looking for comprehensive expertise in this field' }
  ]

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
    setFormData(prev => ({
      ...prev,
      attachments: files
    }))
  }

  const nextStep = () => {
    if (currentStep < 4) {
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
    if (!formData.title || !formData.description || !formData.category || !formData.specialty) {
      toast.error('Please fill in all required fields')
      return
    }

    if (formData.requiredSkills.length === 0) {
      toast.error('Please select at least one skill')
      return
    }

    if (!formData.budget || !formData.duration) {
      toast.error('Please specify budget and duration')
      return
    }

    const jobData = {
      title: formData.title,
      description: formData.description,
      category: formData.category,
      specialty: formData.specialty,
      requiredSkills: formData.requiredSkills,
      experienceLevel: formData.experienceLevel,
      budgetType: 'fixed', // Always fixed as requested
      budget: parseFloat(formData.budget),
      duration: parseInt(formData.duration)
    }

    const result = await dispatch(postJob(jobData))
    
    if (result.type === 'jobs/postJob/fulfilled') {
      toast.success('Job posted successfully!')
      navigate('/jobs')
    }
  }

  const steps = [
    { number: 1, title: 'Job Details' },
    { number: 2, title: 'Skills & Expertise' },
    { number: 3, title: 'Budget & Timeline' },
    { number: 4, title: 'Review & Post' }
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

          <form onSubmit={handleSubmit} className="post-job-form">
            {currentStep === 1 && (
              <JobDetailsStep
                formData={formData}
                handleChange={handleChange}
                categories={categories}
                specialties={specialties}
              />
            )}

            {currentStep === 2 && (
              <SkillsExpertiseStep
                formData={formData}
                handleChange={handleChange}
                handleSkillAdd={handleSkillAdd}
                handleSkillRemove={handleSkillRemove}
                experienceLevels={experienceLevels}
                skills={skills}
              />
            )}

            {currentStep === 3 && (
              <BudgetTimelineStep
                formData={formData}
                handleChange={handleChange}
                handleFileChange={handleFileChange}
              />
            )}

            {currentStep === 4 && (
              <ReviewStep 
                formData={formData}
                categories={categories}
                specialties={specialties}
                skills={skills}
              />
            )}

            <FormNavigation
              currentStep={currentStep}
              totalSteps={4}
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