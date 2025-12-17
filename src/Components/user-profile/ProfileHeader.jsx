import React, { useState, useEffect } from 'react'
import { useSelector, useDispatch } from 'react-redux'
import { useNavigate } from 'react-router-dom'
import { toast } from 'react-toastify'
import { BASE_URL } from '../../Services/config'
import storage from '../../Services/storage'
import { getImageUrl } from '../../Services/imageUtils'
import { setUser } from '../../Services/Authentication/AuthSlice'
import { fetchMyProfile } from '../../Services/Profile/ProfileSlice'
import './ProfileHeader.css'
import { FaMapMarkerAlt, FaBriefcase, FaUser, FaCircle, FaCamera, FaEdit, FaTrash, FaComments } from "react-icons/fa";

const ProfileHeader = ({ userData, isPublicView = false }) => {
    const { user } = useSelector((state) => state.auth)
    const dispatch = useDispatch()
    const navigate = useNavigate()
    const [uploading, setUploading] = useState(false)
    const [profilePicture, setProfilePicture] = useState(getImageUrl((userData || user)?.profile_picture))

    // Check if viewing own profile
    const isOwn = !isPublicView && userData && user && (
        String(userData._id) === String(user._id) ||
        String(userData.id) === String(user.id)
    );

    // Check if user has a real profile picture (not default)
    const checkHasProfilePicture = (picturePath) => {
        return picturePath &&
            !picturePath.includes('user-default-img') &&
            !picturePath.includes('default-avatar')
    }

    const [hasProfilePicture, setHasProfilePicture] = useState(
        checkHasProfilePicture((userData || user)?.profile_picture)
    )

    // Handle opening chat with user
    const handleStartChat = () => {
        if (!user) {
            toast.warning('Please login to start a chat')
            navigate('/login')
            return
        }

        const otherUserId = userData._id || userData.id
        navigate(`/chat?userId=${otherUserId}`)
    }

    // Update profile picture when user changes
    useEffect(() => {
        const currentUser = userData || user
        const currentPicture = currentUser?.profile_picture

        if (currentPicture) {
            const imageUrl = `${getImageUrl(currentPicture)}?t=${Date.now()}`
            setProfilePicture(imageUrl)
            setHasProfilePicture(checkHasProfilePicture(currentPicture))
        } else {
            const defaultUrl = `${getImageUrl(null)}?t=${Date.now()}`
            setProfilePicture(defaultUrl)
            setHasProfilePicture(false)
        }
    }, [user?.profile_picture, userData?.profile_picture])

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
        } const formData = new FormData()
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

            toast.success('Profile picture updated successfully!')

            // Fetch updated profile from server
            const result = await dispatch(fetchMyProfile())

            // Update auth user state
            if (result.payload) {
                dispatch(setUser(result.payload))
            }

            // Reset file input to allow uploading the same file again
            e.target.value = ''
        } catch (error) {
            console.error('Upload error:', error)
            toast.error(error.message || 'Failed to upload profile picture')
        } finally {
            setUploading(false)
        }
    }

    const handleDeleteProfilePicture = async () => {
        if (!window.confirm('Are you sure you want to delete your profile picture?')) {
            return
        }

        setUploading(true)

        try {
            const token = storage.get('token')
            const response = await fetch(`${BASE_URL}/users/profile/picture`, {
                method: 'DELETE',
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            })

            const data = await response.json()

            if (!response.ok) {
                throw new Error(data.message || 'Failed to delete profile picture')
            }

            toast.success('Profile picture deleted successfully!')

            // Fetch updated profile from server
            const result = await dispatch(fetchMyProfile())

            // Update auth user state
            if (result.payload) {
                dispatch(setUser(result.payload))
            }
        } catch (error) {
            console.error('Delete error:', error)
            toast.error(error.message || 'Failed to delete profile picture')
        } finally {
            setUploading(false)
        }
    }

    return (
        <div className='ProfileHeader'>
            <div className="profile-image-container">
                <img
                    key={profilePicture}
                    className='userImg'
                    src={profilePicture}
                    alt={(userData || user)?.first_name}
                />
                {/* Only show upload/delete buttons if it's own profile (not public view) */}
                {isOwn && (
                    <>
                        <label htmlFor="profile-picture-upload" className="profile-picture-upload-btn">
                            <FaCamera />
                            {uploading && <span className="uploading-spinner"></span>}
                        </label>
                        {hasProfilePicture && (
                            <button
                                onClick={handleDeleteProfilePicture}
                                className="profile-picture-delete-btn"
                                disabled={uploading}
                                title="Delete profile picture"
                            >
                                <FaTrash />
                            </button>
                        )}
                        <input
                            id="profile-picture-upload"
                            type="file"
                            accept="image/*"
                            onChange={handleProfilePictureChange}
                            style={{ display: 'none' }}
                            disabled={uploading}
                        />
                    </>
                )}
            </div>

            <h1 className='userName'>{(userData || user)?.first_name} {(userData || user)?.last_name}</h1>

            <div className='user-info-container'>
                <ul className='user-info-list'>
                    <li className='header-info-item'>


                        {/* Show Start Chat button for public view (other users) */}
                        {isPublicView && (
                            <div className="profile-actions">
                                <button
                                    className="start-chat-btn"
                                    onClick={handleStartChat}
                                >
                                    <FaComments />
                                    <span>Start Chat</span>
                                </button>
                            </div>
                        )}      <FaMapMarkerAlt className='info-icon' />
                        <span>{(userData || user)?.country || 'Not specified'}</span>
                    </li>
                    <li className='header-info-item'>
                        <FaBriefcase className='info-icon' />
                        <span>{(userData || user)?.category?.name || 'No category selected'}</span>
                    </li>
                    <li className='header-info-item'>
                        <FaUser className='info-icon' />
                        <span>@{(userData || user)?.username || 'User'}</span>
                    </li>
                </ul>
            </div>
        </div>
    )
}

export default ProfileHeader