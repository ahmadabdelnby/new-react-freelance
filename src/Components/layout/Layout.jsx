import React, { useEffect, useState } from 'react'
import { BrowserRouter as Router, Routes, Route, Outlet } from 'react-router-dom'
import { useSelector, useDispatch } from 'react-redux'
import CustomNavbar from '../nav-bar/Navbar'
import CategoriesNav from '../nav-bar/CategoriesNav'
import Footer from '../footer/Footer'
import Login from '../login/Login'
import ChatDrawer from '../chat/ChatDrawer'
import ScrollToTop from '../common/ScrollToTop'
import { ChatProvider } from '../../context/ChatContext'
import socketService from '../../Services/socketService'
import { initializeSocketListeners, disconnectSocket } from '../../Services/socketIntegration'
import logger from '../../Services/logger'
import ErrorBoundary from '../common/ErrorBoundary'
import { validateUser } from '../../Services/Authentication/AuthSlice'

// Pages
import Home from '../../Pages/Home'
import Jobs from '../../Pages/Jobs'
import Freelancers from '../../Pages/Freelancers'
import HowItWorks from '../../Pages/HowItWorks'
import Register from '../../Pages/Register'
import About from '../../Pages/About/MainAbout'
import PostJob from '../../Pages/PostJob'
import EditJob from '../../Pages/EditJob'
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
import ContractDetails from '../../Pages/ContractDetails'
import MyContracts from '../../Pages/MyContracts'
import MyProjects from '../../Pages/MyProjects'
import MyJobs from '../../Pages/MyJobs'
import MyProposals from '../../Pages/MyProposals'
import MyPayments from '../../Pages/MyPayments'
import PaymentDetails from '../../Pages/PaymentDetails'
import AddFunds from '../../Pages/AddFunds'
import Withdraw from '../../Pages/Withdraw'
import SubmitWork from '../../Pages/SubmitWork'
import LeaveReview from '../../Pages/LeaveReview'
import Notifications from '../../Pages/Notifications'

import './layout.css'
import './layout-header.css'
import LiftedPage from '../../Pages/Contact/LiftedPage'
import UserProfile from '../../Pages/user-profile/UserProfile'

// Component for pages with header and footer
function LayoutWithHeaderFooter({ onOpenChatDrawer }) {
  return (
    <div className="layout-container">
      <header className="custom-header">
        <CustomNavbar onOpenChatDrawer={onOpenChatDrawer} />
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
  const [isChatDrawerOpen, setIsChatDrawerOpen] = useState(false)
  const [chatConversationId, setChatConversationId] = useState(null)
  const dispatch = useDispatch()

  // 🔥 Validate token on app load
  useEffect(() => {
    if (token) {
      logger.log('🔐 Validating user token...')
      dispatch(validateUser())
    }
  }, []) // Run once on mount

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

    // Cleanup on unmount - always disconnect
    return () => {
      logger.log('🧹 Layout unmounting, cleaning up socket...')
      disconnectSocket()
    }
  }, [isAuthenticated, token])

  const handleOpenChatDrawer = (conversationId = null) => {
    setChatConversationId(conversationId)
    setIsChatDrawerOpen(true)
  }

  const handleCloseChatDrawer = () => {
    setIsChatDrawerOpen(false)
    setChatConversationId(null)
  }

  return (
    <Router>
      <ScrollToTop />
      <ErrorBoundary>
        <ChatProvider openChatDrawer={handleOpenChatDrawer}>
          <Routes>
            {/* Routes with Layout (Header + Footer) */}
            <Route path="/" element={<LayoutWithHeaderFooter onOpenChatDrawer={handleOpenChatDrawer} />}>
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
              <Route path="edit-job/:jobId" element={<EditJob />} />
              <Route path="contact" element={<ContactUs />} />
              <Route path="/lifted" element={<LiftedPage />} />
              <Route path="/UserProfile" element={<UserProfile />} />
              <Route path="/profile/edit" element={<EditProfile />} />
              <Route path="/chat" element={<ChatPage />} />
              <Route path="/my-projects" element={<MyProjects />} />
              <Route path="/my-contracts" element={<MyContracts />} />
              <Route path="/my-jobs" element={<MyJobs />} />
              <Route path="/my-proposals" element={<MyProposals />} />
              <Route path="/contracts" element={<MyContracts />} />
              <Route path="/contracts/:id" element={<ContractDetails />} />
              <Route path="/contracts/:contractId/submit-work" element={<SubmitWork />} />
              <Route path="/contracts/:contractId/review" element={<LeaveReview />} />
              <Route path="/payments" element={<MyPayments />} />
              <Route path="/payments/:id" element={<PaymentDetails />} />
              <Route path="/add-funds" element={<AddFunds />} />
              <Route path="/withdraw" element={<Withdraw />} />
              <Route path="/notifications" element={<Notifications />} />

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

          {/* Chat Drawer - Available on all pages */}
          <ChatDrawer
            isOpen={isChatDrawerOpen}
            onClose={handleCloseChatDrawer}
            conversationId={chatConversationId}
          />
        </ChatProvider>
      </ErrorBoundary>
    </Router>
  )
}

export default Layout