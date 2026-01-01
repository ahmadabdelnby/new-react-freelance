import { useState } from "react";
import { useSelector } from "react-redux";
import { FaEdit, FaPlus, FaFileUpload, FaPaperPlane } from "react-icons/fa";
import ProfileSidebar from "./ProfileSidebar";
import AboutTab from "./tabs/AboutTab";
import ReviewsTab from "./tabs/ReviewsTab";
import PortfolioTab from "./tabs/PortfolioTab";
import MyJobsTab from "./tabs/MyJobsTab";
import PaymentHistoryTab from "../../Pages/PaymentHistoryTab";
import EditBasicInfoModal from "./EditBasicInfoModal";
import CVUploadModal from "./CVUploadModal";
import InviteToJobModal from "../shared/InviteToJobModal";
import "./ProfileTabs.css";

function ProfileTabs({ userData, loading, isPublicView = false }) {
    const [activeTab, setActiveTab] = useState("about");
    const [isEditMode, setIsEditMode] = useState(false);
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [isCVModalOpen, setIsCVModalOpen] = useState(false);
    const [showInviteModal, setShowInviteModal] = useState(false);
    const { user } = useSelector((state) => state.auth);
    const displayUser = userData || user;

    // Check if viewing own profile
    // In public view mode, isOwn is always false to prevent editing
    // Handle nested user object structure
    const actualUser = user?.user || user;
    const userId = actualUser?._id || actualUser?.id || actualUser?.userId;
    const displayUserId = displayUser?._id || displayUser?.id;

    const isOwn = !isPublicView && displayUserId && userId && (
        String(displayUserId) === String(userId)
    );

    // Check if user can invite (logged in + viewing someone else's profile)
    const isLoggedIn = !!actualUser;
    const canInvite = isPublicView && isLoggedIn && !isOwn;

    const tabs = [
        { id: "about", label: "About" },
        { id: "portfolio", label: "Portfolio" },
        { id: "reviews", label: "Reviews" }
    ];

    const handleCVDataExtracted = (cvData) => {
        // CV data has been extracted and profile updated
        // Optionally refresh the page or show success message
        console.log('CV data extracted:', cvData);
    };

    const renderTabContent = () => {
        switch (activeTab) {
            case "about":
                return <AboutTab userData={displayUser} isOwn={isOwn} isEditMode={isEditMode} />;
            case "reviews":
                return <ReviewsTab userId={displayUser?._id} isOwn={isOwn} />;

            case "portfolio":
                return <PortfolioTab userId={displayUser?._id} isOwn={isOwn} />;
            default:
                return <AboutTab userData={displayUser} isOwn={isOwn} isEditMode={isEditMode} />;
        }
    };

    return (
        <div className="container">
            <div className="profile-tabs-container">
                {/* Tabs Navigation */}
                <nav className="tabs-navigation">
                    <ul className="tabs-list">
                        {tabs.map(tab => (
                            <li key={tab.id}>
                                <button
                                    className={`tab-button ${activeTab === tab.id ? "active" : ""}`}
                                    onClick={() => setActiveTab(tab.id)}
                                >
                                    {tab.label}
                                </button>
                            </li>
                        ))}
                    </ul>

                    {/* Show Invite button for visitors viewing other profiles */}
                    {canInvite && (
                        <div className="profile-actions">
                            <button
                                className="invite-to-job-btn"
                                onClick={() => setShowInviteModal(true)}
                            >
                                <FaPaperPlane />
                                Invite to Job
                            </button>
                        </div>
                    )}

                    {/* Only show action buttons if it's own profile (not public view) */}
                    {!isPublicView && isOwn && (
                        <div className="profile-actions">
                            {/* {isOwn && activeTab === "portfolio" && (
                                <button className="add-work-btn">
                                    <FaPlus />
                                    Add Work
                                </button>
                            )} */}
                            {isOwn && (
                                <>
                                    <button
                                        className="upload-cv-btn"
                                        onClick={() => setIsCVModalOpen(true)}
                                        title="Upload CV to auto-fill profile"
                                    >
                                        <FaFileUpload />
                                        Upload CV
                                    </button>
                                    <button
                                        className="edit-profile-btn"
                                        onClick={() => setIsEditModalOpen(true)}
                                    >
                                        <FaEdit />
                                        Edit Profile
                                    </button>
                                </>
                            )}
                        </div>
                    )}
                </nav>

                {/* Main Content Layout */}
                <div className="profile-content-layout">
                    {/* Dynamic Content */}
                    <main className="profile-main-content">
                        {renderTabContent()}
                    </main>

                    {/* Static Sidebar */}
                    <aside className="sidebar-content">
                        <ProfileSidebar userData={displayUser} />
                    </aside>
                </div>
            </div>

            {/* Edit Basic Info Modal - Only show if not public view */}
            {!isPublicView && isOwn && (
                <>
                    <EditBasicInfoModal
                        isOpen={isEditModalOpen}
                        onClose={() => setIsEditModalOpen(false)}
                        userData={displayUser}
                    />
                    <CVUploadModal
                        isOpen={isCVModalOpen}
                        onClose={() => setIsCVModalOpen(false)}
                        onCVDataExtracted={handleCVDataExtracted}
                    />
                </>
            )}

            {/* Invite to Job Modal */}
            <InviteToJobModal
                show={showInviteModal}
                onHide={() => setShowInviteModal(false)}
                freelancerId={displayUser?._id}
                freelancerName={`${displayUser?.first_name} ${displayUser?.last_name}`}
            />
        </div>
    );
}

export default ProfileTabs;
