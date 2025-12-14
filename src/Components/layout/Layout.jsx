import React, { useEffect } from 'react'
import { BrowserRouter as Router, Routes, Route, Outlet } from 'react-router-dom'
import { useSelector } from 'react-redux'
import CustomNavbar from '../nav-bar/Navbar'
import CategoriesNav from '../nav-bar/CategoriesNav'
import Footer from '../footer/Footer'
import Login from '../login/Login'
import socketService from '../../Services/socketService'
import { initializeSocketListeners, disconnectSocket } from '../../Services/socketIntegration'
import logger from '../../Services/logger'
import ErrorBoundary from '../common/ErrorBoundary'

// Pages
import Home from '../../Pages/Home'
import Jobs from '../../Pages/Jobs'
import Freelancers from '../../Pages/Freelancers'
import HowItWorks from '../../Pages/HowItWorks'
import Register from '../../Pages/Register'
import About from '../../Pages/About/MainAbout'
import PostJob from '../../Pages/PostJob'
import ContactUs from '../../Pages/Contact/ContactUs'
import JobDetails from '../../Pages/JobDetails'
import ProfileView from '../../Pages/ProfileView'
import Categories from '../../Pages/Categories'
import Dashboard from '../../Pages/Dashboard'
import Chat from '../../Pages/Chat'
import ChatPage from '../../Pages/ChatPage'
import ForgotPassword from '../../Pages/ForgotPassword'
import ResetPassword from '../../Pages/ResetPassword'
import EditProfile from '../../Pages/EditProfile/EditProfile'

import './layout.css'
import './layout-header.css'
import LiftedPage from '../../Pages/Contact/LiftedPage'
import UserProfile from '../../Pages/user-profile/UserProfile'

// Component for pages with header and footer
function LayoutWithHeaderFooter() {
  return (
    <div className="layout-container">
      <header className="custom-header">
        <CustomNavbar />
        <CategoriesNav />
      </header>
      <main className="main-content">
        <Outlet />
      </main>
      <Footer />
    </div>
  )
}

function Layout() {
  const { isAuthenticated, token } = useSelector((state) => state.auth)

  // Initialize Socket.io when user is authenticated
  useEffect(() => {
    if (isAuthenticated && token) {
      logger.log('🔌 Initializing Socket.io connection...')
      socketService.connect(token)
      initializeSocketListeners()
    } else {
      logger.log('🔌 Disconnecting Socket.io...')
      disconnectSocket()
    }

    // Cleanup on unmount
    return () => {
      disconnectSocket()
    }
  }, [isAuthenticated, token])

  return (
    <Router>
      <ErrorBoundary>
        <Routes>
          {/* Routes with Layout (Header + Footer) */}
          <Route path="/" element={<LayoutWithHeaderFooter />}>
          <Route index element={<Home />} />
          <Route path="dashboard" element={<Dashboard />} />
          <Route path="jobs" element={<Jobs />} />
          <Route path="jobs/:jobId" element={<JobDetails />} />
          <Route path="freelancers" element={<Freelancers />} />
          <Route path="freelancer/:id" element={<ProfileView />} />
          <Route path="categories" element={<Categories />} />
          <Route path="how-it-works" element={<HowItWorks />} />
          <Route path="about" element={<About />} />
          <Route path="post-job" element={<PostJob />} />
          <Route path="contact" element={<ContactUs />} />
          <Route path="/lifted" element={<LiftedPage />} />
          <Route path="/UserProfile" element={<UserProfile />} />
          <Route path="/profile/edit" element={<EditProfile />} />
          <Route path="/chat" element={<ChatPage />} />

          {/* 404 Route with Layout */}
          <Route path="*" element={
            <div className="container py-5 text-center">
              <h1>404 - Page Not Found</h1>
              <p>The page you're looking for doesn't exist.</p>
            </div>
          } />
        </Route>
        
        {/* Routes without Layout (Full page components) */}
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/reset-password/:token" element={<ResetPassword />} />
      </Routes>
      </ErrorBoundary>
    </Router>
  )
}

export default Layout