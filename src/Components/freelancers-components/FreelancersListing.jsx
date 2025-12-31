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
  
  // Pagination state
  const [currentPage, setCurrentPage] = useState(1)
  const itemsPerPage = 12 // عدد الـ freelancers في كل صفحة

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

      console.log('👥 Fetched users sample:', JSON.stringify(users[0], null, 2));
      console.log('👥 First user skills field:', users[0]?.skills);
      console.log('👥 Skills type:', typeof users[0]?.skills, 'IsArray:', Array.isArray(users[0]?.skills));

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
    setCurrentPage(1) // Reset to first page when filters change
  }

  // Calculate pagination
  const totalPages = Math.ceil(filteredFreelancers.length / itemsPerPage)
  const startIndex = (currentPage - 1) * itemsPerPage
  const endIndex = startIndex + itemsPerPage
  const currentFreelancers = filteredFreelancers.slice(startIndex, endIndex)

  const handlePageChange = (pageNumber) => {
    setCurrentPage(pageNumber)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const renderPagination = () => {
    if (totalPages <= 1) return null

    const pages = []
    const maxVisiblePages = 5

    let startPage = Math.max(1, currentPage - Math.floor(maxVisiblePages / 2))
    let endPage = Math.min(totalPages, startPage + maxVisiblePages - 1)

    if (endPage - startPage < maxVisiblePages - 1) {
      startPage = Math.max(1, endPage - maxVisiblePages + 1)
    }

    // Previous button
    pages.push(
      <button
        key="prev"
        onClick={() => handlePageChange(currentPage - 1)}
        disabled={currentPage === 1}
        className="pagination-btn pagination-prev"
      >
        Previous
      </button>
    )

    // First page
    if (startPage > 1) {
      pages.push(
        <button
          key={1}
          onClick={() => handlePageChange(1)}
          className="pagination-btn"
        >
          1
        </button>
      )
      if (startPage > 2) {
        pages.push(<span key="dots1" className="pagination-dots">...</span>)
      }
    }

    // Page numbers
    for (let i = startPage; i <= endPage; i++) {
      pages.push(
        <button
          key={i}
          onClick={() => handlePageChange(i)}
          className={`pagination-btn ${currentPage === i ? 'active' : ''}`}
        >
          {i}
        </button>
      )
    }

    // Last page
    if (endPage < totalPages) {
      if (endPage < totalPages - 1) {
        pages.push(<span key="dots2" className="pagination-dots">...</span>)
      }
      pages.push(
        <button
          key={totalPages}
          onClick={() => handlePageChange(totalPages)}
          className="pagination-btn"
        >
          {totalPages}
        </button>
      )
    }

    // Next button
    pages.push(
      <button
        key="next"
        onClick={() => handlePageChange(currentPage + 1)}
        disabled={currentPage === totalPages}
        className="pagination-btn pagination-next"
      >
        Next
      </button>
    )

    return <div className="pagination-container">{pages}</div>
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
            {totalPages > 1 && (
              <span className="page-info"> (Page {currentPage} of {totalPages})</span>
            )}
          </div>
        </div>

        {/* Freelancers Grid */}
        {filteredFreelancers.length === 0 ? (
          <div className="no-results">
            <p>No freelancers found matching your criteria</p>
          </div>
        ) : (
          <>
            <div className="freelancers-grid">
              {currentFreelancers.map((freelancer) => (
                <FreelancerCard key={freelancer._id} freelancer={freelancer} />
              ))}
            </div>
            
            {/* Pagination */}
            {renderPagination()}
          </>
        )}
      </div>
    </section>
  )
}

export default FreelancersListing
