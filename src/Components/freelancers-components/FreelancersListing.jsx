import React, { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { BASE_URL } from '../../Services/config'
import { FaHome, FaChevronRight, FaSearch, FaFilter } from 'react-icons/fa'
import FreelancerCard from '../../Shared/Cards/FreelancerCard'
import './FreelancersListing.css'

function FreelancersListing() {
  const [freelancers, setFreelancers] = useState([])
  const [filteredFreelancers, setFilteredFreelancers] = useState([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('')
  const [categories, setCategories] = useState([])

  useEffect(() => {
    fetchFreelancers()
    fetchCategories()
  }, [])

  useEffect(() => {
    applyFilters()
  }, [searchTerm, selectedCategory, freelancers])

  const fetchFreelancers = async () => {
    try {
      const response = await fetch(`${BASE_URL}/users`);
      const data = await response.json();
      const users = Array.isArray(data) ? data : (data.users || []);
      
      // Show all users (you can add role filter if needed)
      setFreelancers(users);
      setFilteredFreelancers(users);
    } catch (error) {
      console.error('Error fetching freelancers:', error)
      setFreelancers([]);
      setFilteredFreelancers([]);
    } finally {
      setLoading(false)
    }
  }

  const fetchCategories = async () => {
    try {
      const response = await fetch(`${BASE_URL}/categories`);
      const data = await response.json();
      const categoriesData = Array.isArray(data) ? data : (data.categories || []);
      setCategories(categoriesData);
    } catch (error) {
      console.error('Error fetching categories:', error)
      setCategories([]);
    }
  }

  const applyFilters = () => {
    let filtered = [...freelancers]

    // Search filter
    if (searchTerm) {
      filtered = filtered.filter(freelancer => {
        const fullName = `${freelancer.first_name} ${freelancer.last_name}`.toLowerCase()
        const skills = freelancer.skills?.map(s => s.name || s).join(' ').toLowerCase() || ''
        const category = freelancer.category?.name?.toLowerCase() || ''
        const specialty = freelancer.specialty?.name?.toLowerCase() || ''
        
        return fullName.includes(searchTerm.toLowerCase()) ||
               skills.includes(searchTerm.toLowerCase()) ||
               category.includes(searchTerm.toLowerCase()) ||
               specialty.includes(searchTerm.toLowerCase())
      })
    }

    // Category filter
    if (selectedCategory) {
      filtered = filtered.filter(freelancer => 
        freelancer.category?._id === selectedCategory || freelancer.category?.name === selectedCategory
      )
    }

    setFilteredFreelancers(filtered)
  }

  if (loading) {
    return (
      <section className="freelancers-listing">
        <div className="container text-center py-5">
          <div className="spinner-border text-primary" role="status">
            <span className="visually-hidden">Loading...</span>
          </div>
          <p className="mt-3">Loading freelancers...</p>
        </div>
      </section>
    )
  }

  return (
    <section className="freelancers-listing">
      <div className="container">
        {/* Breadcrumb */}
        <nav className="breadcrumb-nav">
          <Link to="/" className="breadcrumb-item">
            <FaHome className="breadcrumb-icon" />
          </Link>
          <FaChevronRight className="breadcrumb-separator" />
          <span className="breadcrumb-item active">Freelancers</span>
        </nav>

        {/* Filters */}
        <div className="filters-section">
          <div className="search-box">
            <FaSearch className="search-icon" />
            <input
              type="text"
              placeholder="Search by name, skills, or category..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="search-input"
            />
          </div>

          <div className="filter-box">
            <FaFilter className="filter-icon" />
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="filter-select"
            >
              <option value="">All Categories</option>
              {categories.map(cat => (
                <option key={cat._id} value={cat._id}>{cat.name}</option>
              ))}
            </select>
          </div>

          <div className="results-count">
            {filteredFreelancers.length} Freelancer{filteredFreelancers.length !== 1 ? 's' : ''} Found
          </div>
        </div>

        {/* Freelancers Grid */}
        {filteredFreelancers.length === 0 ? (
          <div className="no-results">
            <p>No freelancers found matching your criteria</p>
          </div>
        ) : (
          <div className="freelancers-grid">
            {filteredFreelancers.map((freelancer) => (
              <FreelancerCard key={freelancer._id} freelancer={freelancer} />
            ))}
          </div>
        )}
      </div>
    </section>
  )
}

export default FreelancersListing
