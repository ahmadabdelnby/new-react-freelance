import React, { useState, useEffect } from 'react'
import { useSelector, useDispatch } from 'react-redux'
import { useNavigate } from 'react-router-dom'
import { toast } from 'react-toastify'
import storage from '../../Services/storage'
import { BASE_URL } from '../../Services/config'
import { setUser } from '../../Services/Authentication/AuthSlice'
import './EditProfile.css'
import { FaUser, FaEnvelope, FaPhone, FaMapMarkerAlt, FaVenusMars, FaBriefcase, FaSave, FaTimes } from 'react-icons/fa'

const EditProfile = () => {
    const { user } = useSelector((state) => state.auth)
    const dispatch = useDispatch()
    const navigate = useNavigate()
    const [loading, setLoading] = useState(false)
    const [formData, setFormData] = useState({
        first_name: user?.first_name || '',
        last_name: user?.last_name || '',
        username: user?.username || '',
        email: user?.email || '',
        phone_number: user?.phone_number || '',
        country: user?.country || '',
        gender: user?.gender || 'male',
        aboutMe: user?.aboutMe || '',
        hourlyRate: user?.hourlyRate || '',
        jobTitle: user?.jobTitle || ''
    })

    const handleChange = (e) => {
        const { name, value } = e.target
        setFormData(prev => ({
            ...prev,
            [name]: value
        }))
    }

    const handleSubmit = async (e) => {
        e.preventDefault()
        setLoading(true)

        try {
            const token = storage.get('token')
            const response = await fetch(`${BASE_URL}/users/${user._id}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify(formData)
            })

            const data = await response.json()

            if (!response.ok) {
                throw new Error(data.message || 'Failed to update profile')
            }

            // Update user in Redux and localStorage
            const updatedUser = { ...user, ...formData }
            dispatch(setUser(updatedUser))
            storage.setJSON('user', updatedUser)

            toast.success('Profile updated successfully!')
            navigate('/UserProfile')
        } catch (error) {
            console.error('Update error:', error)
            toast.error(error.message || 'Failed to update profile')
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="edit-profile-page">
            <div className="edit-profile-container">
                <div className="edit-profile-header">
                    <h1>Edit Profile</h1>
                    <button 
                        className="btn-close-edit" 
                        onClick={() => navigate('/UserProfile')}
                        title="Cancel"
                    >
                        <FaTimes />
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="edit-profile-form">
                    <div className="form-section">
                        <h2>Personal Information</h2>
                        
                        <div className="form-row">
                            <div className="form-group">
                                <label htmlFor="first_name">
                                    <FaUser /> First Name
                                </label>
                                <input
                                    type="text"
                                    id="first_name"
                                    name="first_name"
                                    value={formData.first_name}
                                    onChange={handleChange}
                                    required
                                />
                            </div>

                            <div className="form-group">
                                <label htmlFor="last_name">
                                    <FaUser /> Last Name
                                </label>
                                <input
                                    type="text"
                                    id="last_name"
                                    name="last_name"
                                    value={formData.last_name}
                                    onChange={handleChange}
                                    required
                                />
                            </div>
                        </div>

                        <div className="form-group">
                            <label htmlFor="username">
                                <FaUser /> Username
                            </label>
                            <input
                                type="text"
                                id="username"
                                name="username"
                                value={formData.username}
                                onChange={handleChange}
                                required
                            />
                        </div>

                        <div className="form-group">
                            <label htmlFor="email">
                                <FaEnvelope /> Email
                            </label>
                            <input
                                type="email"
                                id="email"
                                name="email"
                                value={formData.email}
                                onChange={handleChange}
                                required
                                disabled
                            />
                            <small className="form-text">Email cannot be changed</small>
                        </div>

                        <div className="form-row">
                            <div className="form-group">
                                <label htmlFor="phone_number">
                                    <FaPhone /> Phone Number
                                </label>
                                <input
                                    type="tel"
                                    id="phone_number"
                                    name="phone_number"
                                    value={formData.phone_number}
                                    onChange={handleChange}
                                />
                            </div>

                            <div className="form-group">
                                <label htmlFor="gender">
                                    <FaVenusMars /> Gender
                                </label>
                                <select
                                    id="gender"
                                    name="gender"
                                    value={formData.gender}
                                    onChange={handleChange}
                                >
                                    <option value="male">Male</option>
                                    <option value="female">Female</option>
                                </select>
                            </div>
                        </div>

                        <div className="form-group">
                            <label htmlFor="country">
                                <FaMapMarkerAlt /> Country
                            </label>
                            <input
                                type="text"
                                id="country"
                                name="country"
                                value={formData.country}
                                onChange={handleChange}
                            />
                        </div>
                    </div>

                    {user?.role === 'freelancer' && (
                        <div className="form-section">
                            <h2>Professional Information</h2>
                            
                            <div className="form-group">
                                <label htmlFor="jobTitle">
                                    <FaBriefcase /> Job Title
                                </label>
                                <input
                                    type="text"
                                    id="jobTitle"
                                    name="jobTitle"
                                    value={formData.jobTitle}
                                    onChange={handleChange}
                                    placeholder="e.g., Full Stack Developer"
                                />
                            </div>

                            <div className="form-group">
                                <label htmlFor="hourlyRate">
                                    Hourly Rate ($)
                                </label>
                                <input
                                    type="number"
                                    id="hourlyRate"
                                    name="hourlyRate"
                                    value={formData.hourlyRate}
                                    onChange={handleChange}
                                    min="0"
                                    step="5"
                                />
                            </div>

                            <div className="form-group">
                                <label htmlFor="aboutMe">
                                    About Me
                                </label>
                                <textarea
                                    id="aboutMe"
                                    name="aboutMe"
                                    value={formData.aboutMe}
                                    onChange={handleChange}
                                    rows="5"
                                    placeholder="Tell us about yourself..."
                                />
                            </div>
                        </div>
                    )}

                    <div className="form-actions">
                        <button 
                            type="button" 
                            className="btn-cancel"
                            onClick={() => navigate('/UserProfile')}
                            disabled={loading}
                        >
                            <FaTimes /> Cancel
                        </button>
                        <button 
                            type="submit" 
                            className="btn-save"
                            disabled={loading}
                        >
                            <FaSave /> {loading ? 'Saving...' : 'Save Changes'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    )
}

export default EditProfile
