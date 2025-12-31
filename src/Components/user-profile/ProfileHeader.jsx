import React, { useState, useEffect } from 'react'
import { useSelector, useDispatch } from 'react-redux'
import { useNavigate } from 'react-router-dom'
import { toast } from 'react-toastify'
import Swal from 'sweetalert2'
import { BASE_URL } from '../../Services/config'
import storage from '../../Services/storage'
import { getImageUrl } from '../../Services/imageUtils'
import { setUser } from '../../Services/Authentication/AuthSlice'
import { fetchMyProfile } from '../../Services/Profile/ProfileSlice'
import './ProfileHeader.css'
import '../../styles/sweetalert-custom.css'
import { FaMapMarkerAlt, FaBriefcase, FaUser, FaCircle, FaCamera, FaEdit, FaTrash } from "react-icons/fa";

const ProfileHeader = ({ userData, isPublicView = false }) => {
    const { user } = useSelector((state) => state.auth)
    const dispatch = useDispatch()
    const navigate = useNavigate()
    const [uploading, setUploading] = useState(false)
    const [profilePicture, setProfilePicture] = useState(getImageUrl((userData || user)?.profile_picture))

    // Check if viewing own profile
    // Handle nested user object structure
    const actualUser = user?.user || user;
    const userId = actualUser?._id || actualUser?.id || actualUser?.userId;
    const isOwn = !isPublicView && userData && userId && (
        String(userData._id) === String(userId) ||
        String(userData.id) === String(userId)
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
        const result = await Swal.fire({
            title: 'Delete Profile Picture?',
            text: 'Are you sure you want to delete your profile picture?',
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#dc3545',
            cancelButtonColor: '#6c757d',
            confirmButtonText: 'Yes, delete it!',
            cancelButtonText: 'Cancel',
            reverseButtons: true
        });

        if (!result.isConfirmed) return;

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
        <div className='userprofile-header-container'>
            <div className="userprofile-header-image-container">
                <img
                    key={profilePicture}
                    className='userprofile-header-user-img'
                    src={profilePicture}
                    alt={(userData || user)?.first_name}
                />
                {/* Only show upload/delete buttons if it's own profile (not public view) */}
                {isOwn && (
                    <>
                        <label htmlFor="profile-picture-upload" className="userprofile-header-picture-upload-btn">
                            <FaCamera />
                            {uploading && <span className="userprofile-header-uploading-spinner"></span>}
                        </label>
                        {hasProfilePicture && (
                            <button
                                onClick={handleDeleteProfilePicture}
                                className="userprofile-header-picture-delete-btn"
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

            <h1 className='userprofile-header-user-name'>{(userData || user)?.first_name} {(userData || user)?.last_name}</h1>

            <div className='userprofile-header-info-container'>
                <ul className='userprofile-header-info-list'>
                    <li className='userprofile-header-info-item'>
                        <FaMapMarkerAlt className='userprofile-header-info-icon' />
                        <span>{(userData || user)?.country || 'Not specified'}</span>
                    </li>
                    <li className='userprofile-header-info-item'>
                        <FaBriefcase className='userprofile-header-info-icon' />
                        <span>{(userData || user)?.category?.name || 'No category selected'}</span>
                    </li>
                    <li className='userprofile-header-info-item'>
                        <FaUser className='userprofile-header-info-icon' />
                        <span>@{(userData || user)?.username || 'User'}</span>
                    </li>
                </ul>
            </div>
        </div>
    )
}

export default ProfileHeader