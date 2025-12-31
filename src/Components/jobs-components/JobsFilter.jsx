import React, { useState, useEffect } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { setSearchFilters, searchJobs } from '../../Services/Jobs/JobsSlice'
import { API_ENDPOINTS } from '../../Services/config'
import './JobsFilter.css'

function JobsFilter() {
  const dispatch = useDispatch()
  const { searchFilters } = useSelector((state) => state.jobs)
  
  const [categories, setCategories] = useState([])
  const [specialties, setSpecialties] = useState([])
  const [localFilters, setLocalFilters] = useState(searchFilters)

  // 🔥 Sync localFilters with Redux searchFilters
  useEffect(() => {
    setLocalFilters(searchFilters)
    // 🔥 If there's a category selected, fetch its specialties
    if (searchFilters.category) {
      fetchSpecialties(searchFilters.category)
    }
  }, [searchFilters])

  useEffect(() => {
    fetchCategories()
  }, [])

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

  const handleCategoryChange = (e) => {
    const categoryId = e.target.value
    setLocalFilters({ ...localFilters, category: categoryId, specialty: '' })
    
    if (categoryId) {
      fetchSpecialties(categoryId)
    } else {
      setSpecialties([])
    }
  }

  const handleFilterChange = (e) => {
    const { name, value } = e.target
    setLocalFilters({ ...localFilters, [name]: value })
  }

  const handleApplyFilters = () => {
    console.log('🔍 Applying filters:', localFilters)
    dispatch(setSearchFilters(localFilters))
    dispatch(searchJobs(localFilters))
  }

  const handleClearFilters = () => {
    const clearedFilters = {
      keyword: '',
      category: '',
      specialty: '',
      minBudget: '',
      maxBudget: '',
      skills: []
    }
    console.log('🗑️ Clearing all filters')
    setLocalFilters(clearedFilters)
    setSpecialties([])
    dispatch(setSearchFilters(clearedFilters))
    dispatch(searchJobs({}))
  }

  return (
    <div className="jobs-filter-sidebar">
      <div className="filter-header">
        <h3>Filter Jobs</h3>
        <button onClick={handleClearFilters} className="btn-clear-filters">
          Clear All
        </button>
      </div>

      <div className="filter-section">
        <label className="filter-label">Search Keyword</label>
        <input
          type="text"
          name="keyword"
          className="filter-input"
          placeholder="Search jobs..."
          value={localFilters.keyword}
          onChange={handleFilterChange}
        />
      </div>

      <div className="filter-section">
        <label className="filter-label">Category</label>
        <select
          name="category"
          className="filter-select"
          value={localFilters.category || ''}
          onChange={handleCategoryChange}
        >
          <option value="">All Categories</option>
          {categories.map((cat) => (
            <option key={cat._id} value={cat._id}>
              {cat.name}
            </option>
          ))}
        </select>
      </div>

      {specialties.length > 0 && (
        <div className="filter-section">
          <label className="filter-label">Specialty</label>
          <select
            name="specialty"
            className="filter-select"
            value={localFilters.specialty || ''}
            onChange={handleFilterChange}
          >
            <option value="">All Specialties</option>
            {specialties.map((spec) => (
              <option key={spec._id} value={spec._id}>
                {spec.name}
              </option>
            ))}
          </select>
        </div>
      )}

      <div className="filter-section">
        <label className="filter-label">Budget Range</label>
        <div className="budget-range">
          <input
            type="number"
            name="minBudget"
            className="filter-input budget-input"
            placeholder="Min ($)"
            value={localFilters.minBudget}
            onChange={handleFilterChange}
          />
          <span className="budget-separator">-</span>
          <input
            type="number"
            name="maxBudget"
            className="filter-input budget-input"
            placeholder="Max ($)"
            value={localFilters.maxBudget}
            onChange={handleFilterChange}
          />
        </div>
      </div>

      <button onClick={handleApplyFilters} className="btn-apply-filters">
        Apply Filters
      </button>
    </div>
  )
}

export default JobsFilter
