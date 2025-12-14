import React, { useState } from 'react'
import { useSelector, useDispatch } from 'react-redux'
import { useNavigate } from 'react-router-dom'
import { toast } from 'react-toastify'
import { BASE_URL } from '../../Services/config'
import storage from '../../Services/storage'
import { getImageUrl } from '../../Services/imageUtils'
import './ProfileHeader.css'
import { FaMapMarkerAlt, FaBriefcase, FaUser, FaCircle, FaCamera, FaEdit } from "react-icons/fa";

const ProfileHeader = ({ userData }) => {
    const { user } = useSelector((state) => state.auth)
    const navigate = useNavigate()
    const [uploading, setUploading] = useState(false)
    const [profilePicture, setProfilePicture] = useState(getImageUrl((userData || user)?.profile_picture))

    const handleProfilePictureChange = async (e) => {
        const file = e.target.files[0]
        if (!file) return

        // Validate file size (max 5MB)
        if (file.size > 5 * 1024 * 1024) {
            toast.error('File size must be less than 5MB')
            return
        }

        // Validate file type
            if (!file.type.startsWith('image/')) {
                toast.error('Please upload an image file')
                return
            }        const formData = new FormData()
        formData.append('profile_picture', file)

        setUploading(true)

        try {
            const token = storage.get('token')
            const response = await fetch(`${BASE_URL}/users/profile/picture`, {
                method: 'PUT',
                headers: {
                    'Authorization': `Bearer ${token}`
                },
                body: formData
            })
            
            const data = await response.json()
            
            if (!response.ok) {
                throw new Error(data.message || 'Failed to upload profile picture')
            }

            setProfilePicture(getImageUrl(data.profile_picture))
            toast.success('Profile picture updated successfully!')
            
            // Update user in storage
            const updatedUser = { ...(userData || user), profile_picture: data.profile_picture }
            storage.setJSON('user', updatedUser)
        } catch (error) {
            console.error('Upload error:', error)
            toast.error(error.message || 'Failed to upload profile picture')
        } finally {
            setUploading(false)
        }
    }

    return (
        <div className='ProfileHeader'>
            <div className="profile-image-container">
                <img className='userImg' src={profilePicture} alt={(userData || user)?.first_name} />
                <label htmlFor="profile-picture-upload" className="profile-picture-upload-btn">
                    <FaCamera />
                    {uploading && <span className="uploading-spinner"></span>}
                </label>
                <input
                    id="profile-picture-upload"
                    type="file"
                    accept="image/*"
                    onChange={handleProfilePictureChange}
                    style={{ display: 'none' }}
                    disabled={uploading}
                />
            </div>

            <h1 className='userName'>{(userData || user)?.first_name} {(userData || user)?.last_name}</h1>
            
            <button 
                className='edit-profile-btn' 
                onClick={() => navigate('/profile/edit')}
                title='Edit Profile'
            >
                <FaEdit /> Edit Profile
            </button>

            <div className='user-info-container'>
                <ul className='user-info-list'>
                    <li className='header-info-item'>
                        <FaMapMarkerAlt className='info-icon' />
                        <span>{(userData || user)?.country || 'Not specified'}</span>
                    </li>
                    <li className='header-info-item'>
                        <FaBriefcase className='info-icon' />
                        <span>{(userData || user)?.specialty?.name || (userData || user)?.category?.name || 'Freelancer'}</span>
                    </li>
                    <li className='header-info-item'>
                        <FaUser className='info-icon' />
                        <span>{(userData || user)?.role || 'User'}</span>
                    </li>
                </ul>
            </div>
        </div>
    )
}

export default ProfileHeader