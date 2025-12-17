import React, { useEffect } from 'react'
import { useSelector, useDispatch } from 'react-redux'
import './UserProfile.css'
import ProfileHeader from '../../Components/user-profile/ProfileHeader'
import ProfileTabs from '../../Components/user-profile/ProfileTap'
import ProfileCompletionWidget from '../../Components/profile-completion/ProfileCompletionWidget'
import { fetchMyProfile } from '../../Services/Profile/ProfileSlice'

const UserProfile = () => {
    const { user } = useSelector((state) => state.auth)
    const { profileUser, loading } = useSelector((state) => state.profile)
    const dispatch = useDispatch()

    useEffect(() => {
        dispatch(fetchMyProfile())
    }, [dispatch])

    return (
        <div className="user-profile-page">
            <ProfileHeader userData={profileUser || user} isPublicView={false} />

            {/* Show Profile Completion for Freelancers */}
            {user?.role === 'freelancer' && (
                <div className="container mt-4">
                    <ProfileCompletionWidget />
                </div>
            )}

            <ProfileTabs userData={profileUser || user} loading={loading} isPublicView={false} />
        </div>
    )
}

export default UserProfile