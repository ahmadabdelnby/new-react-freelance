import React, { useEffect } from 'react'
import { useParams } from 'react-router-dom'
import { useDispatch, useSelector } from 'react-redux'
import ProfileHeader from '../Components/user-profile/ProfileHeader'
import ProfileTabs from '../Components/user-profile/ProfileTap'
import './user-profile/UserProfile.css'
import { fetchUserById } from '../Services/Profile/ProfileSlice'

function ProfileView() {
  const { id } = useParams()
  const dispatch = useDispatch()
  const { otherUser, loading } = useSelector((state) => state.profile)
  const { user } = useSelector((state) => state.auth)

  useEffect(() => {
    if (id) dispatch(fetchUserById(id))
  }, [id, dispatch])

  if (loading || !otherUser) {
    return (
      <div className="user-profile-page">
        <div className="container text-center py-5">
          <div className="spinner-border text-primary" role="status">
            <span className="visually-hidden">Loading...</span>
          </div>
          <p className="mt-3">Loading profile...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="user-profile-page">
      <ProfileHeader userData={otherUser} isPublicView={true} />
      <ProfileTabs userData={otherUser} loading={loading} isPublicView={true} />
    </div>
  )
}

export default ProfileView
