import React, { useState, useEffect } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { useNavigate, useParams } from 'react-router-dom'
import { API_ENDPOINTS } from '../Services/config'
import { toast } from 'react-toastify'
import ProgressSteps from '../Components/post-job-components/ProgressSteps'
import JobDetailsStep from '../Components/post-job-components/JobDetailsStep'
import SkillsExpertiseStep from '../Components/post-job-components/SkillsExpertiseStep'
import BudgetTimelineStep from '../Components/post-job-components/BudgetTimelineStep'
import ReviewStep from '../Components/post-job-components/ReviewStep'
import FormNavigation from '../Components/post-job-components/FormNavigation'
import './PostJob.css'

function EditJob() {
  const { jobId } = useParams()
  const dispatch = useDispatch()
  const navigate = useNavigate()
  const { user, isAuthenticated, token } = useSelector((state) => state.auth)

  const [currentStep, setCurrentStep] = useState(1)
  const [categories, setCategories] = useState([])
  const [specialties, setSpecialties] = useState([])
  const [skills, setSkills] = useState([])
  const [loading, setLoading] = useState(false)
  const [jobLoading, setJobLoading] = useState(true)

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    category: '',
    specialty: '',
    requiredSkills: [],
    budgetType: 'fixed',
    budget: '',
    duration: '',
    attachments: []
  })

  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/')
      return
    }
    fetchJobDetails()
    fetchCategories()
    fetchSkills()
  }, [isAuthenticated, navigate, jobId])

  const fetchJobDetails = async () => {
    try {
      setJobLoading(true)
      const response = await fetch(API_ENDPOINTS.JOB_BY_ID(jobId), {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })

      if (!response.ok) {
        throw new Error('Failed to fetch job details')
      }

      const job = await response.json()

      // Check if user is the owner
      // Handle nested user object structure
      const actualUser = user?.user || user
      const userId = actualUser?._id || actualUser?.id || actualUser?.userId
      const jobClientId = job.client._id || job.client

      if (String(jobClientId) !== String(userId)) {
        toast.error('You are not authorized to edit this job')
        navigate('/jobs')
        return
      }

      // Populate form with existing data
      setFormData({
        title: job.title || '',
        description: job.description || '',
        category: job.category?._id || '',
        specialty: job.specialty?._id || '',
        requiredSkills: job.skills?.map(s => s._id || s) || [],
        budgetType: job.budgetType || 'fixed',
        budget: typeof job.budget === 'object' ? '' : (job.budget || ''),
        duration: typeof job.duration === 'object' ? '' : (job.duration || ''),
        attachments: job.attachments || []
      })

      // Fetch specialties for the selected category
      if (job.category?._id) {
        fetchSpecialties(job.category._id)
      }

      setJobLoading(false)
    } catch (error) {
      console.error('Error fetching job:', error)
      toast.error('Failed to load job details')
      navigate('/jobs')
    }
  }

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
        specialty: ''
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

  const handleSkillChange = (selectedSkills) => {
    setFormData(prev => ({
      ...prev,
      requiredSkills: selectedSkills
    }))
  }

  const handleSkillAdd = (skillId) => {
    if (!formData.requiredSkills.includes(skillId)) {
      setFormData(prev => ({
        ...prev,
        requiredSkills: [...prev.requiredSkills, skillId]
      }))
    }
  }

  const handleSkillRemove = (skillId) => {
    setFormData(prev => ({
      ...prev,
      requiredSkills: prev.requiredSkills.filter(id => id !== skillId)
    }))
  }

  const handleFileChange = (files) => {
    setFormData(prev => ({
      ...prev,
      attachments: files
    }))
  }

  const handleNext = () => {
    if (validateStep(currentStep)) {
      setCurrentStep(prev => Math.min(prev + 1, 4))
    }
  }

  const handleBack = () => {
    setCurrentStep(prev => Math.max(prev - 1, 1))
  }

  const validateStep = (step) => {
    if (step === 1) {
      if (!formData.title.trim()) {
        toast.error('Please enter a job title')
        return false
      }
      if (!formData.description.trim()) {
        toast.error('Please enter a job description')
        return false
      }
      if (!formData.category) {
        toast.error('Please select a category')
        return false
      }
      if (!formData.specialty) {
        toast.error('Please select a specialty')
        return false
      }
      if (formData.requiredSkills.length === 0) {
        toast.error('Please select at least one skill')
        return false
      }
      if (!formData.budget || formData.budget <= 0) {
        toast.error('Please enter a valid budget')
        return false
      }
      if (!formData.duration || formData.duration <= 0) {
        toast.error('Please enter a valid duration')
        return false
      }
    }
    return true
  }

  const handleSubmit = async () => {
    if (!validateStep(1)) return

    try {
      setLoading(true)

      console.log('📝 Submitting job update:', {
        jobId,
        title: formData.title,
        skills: formData.requiredSkills
      })

      const updateData = new FormData()
      updateData.append('title', formData.title)
      updateData.append('description', formData.description)
      updateData.append('category', formData.category)
      updateData.append('specialty', formData.specialty)
      updateData.append('budgetType', formData.budgetType)
      updateData.append('budget', formData.budget)
      updateData.append('duration', formData.duration)

      // Send skills as array
      formData.requiredSkills.forEach(skill => {
        updateData.append('skills[]', skill)
      })

      console.log('📦 Skills being sent:', formData.requiredSkills)

      // Handle new file uploads
      if (formData.attachments && formData.attachments.length > 0) {
        formData.attachments.forEach(file => {
          if (file instanceof File) {
            updateData.append('attachments', file)
          }
        })
      }

      const response = await fetch(API_ENDPOINTS.JOB_BY_ID(jobId), {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`
        },
        body: updateData
      })

      const result = await response.json()
      console.log('📨 Server response:', result)

      if (!response.ok) {
        throw new Error(result.message || 'Failed to update job')
      }

      toast.success('Job updated successfully!')
      navigate('/jobs')
    } catch (error) {
      console.error('Error updating job:', error)
      toast.error(error.message || 'Failed to update job')
    } finally {
      setLoading(false)
    }
  }

  const steps = [
    { number: 1, title: 'Job Details & Requirements' },
    { number: 2, title: 'Review & Update' }
  ]

  if (jobLoading) {
    return (
      <div className="post-job-page">
        <div className="post-job-container">
          <div className="loading-container">
            <div className="spinner-border text-primary" role="status">
              <span className="visually-hidden">Loading...</span>
            </div>
            <p>Loading job details...</p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="post-job-page">
      <div className="post-job-container">
        <div className="post-job-header">
          <h1 className="post-job-title">Edit Job</h1>
          <p className="post-job-subtitle">Update your job posting details</p>
        </div>

        <ProgressSteps currentStep={currentStep} steps={steps} />

        <div className="post-job-form">
          {currentStep === 1 && (
            <>
              <JobDetailsStep
                formData={formData}
                categories={categories}
                specialties={specialties}
                handleChange={handleChange}
                onFileChange={handleFileChange}
              />

              <SkillsExpertiseStep
                formData={formData}
                skills={skills}
                handleChange={handleChange}
                handleSkillAdd={handleSkillAdd}
                handleSkillRemove={handleSkillRemove}
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
            onPrev={handleBack}
            onNext={handleNext}
            onSubmit={handleSubmit}
            loading={loading}
            submitText="Update Job"
          />
        </div>
      </div>
    </div>
  )
}

export default EditJob
