import { useState } from "react";
import { useSelector } from "react-redux";
import { FaEdit, FaPlus } from "react-icons/fa";
import ProfileSidebar from "./ProfileSidebar";
import AboutTab from "./tabs/AboutTab";
import ReviewsTab from "./tabs/ReviewsTab";
import PortfolioTab from "./tabs/PortfolioTab";
import ProjectsTab from "./tabs/ProjectsTab";
import MyJobsTab from "./tabs/MyJobsTab";
import PaymentHistoryTab from "../../Pages/PaymentHistoryTab";
import EditBasicInfoModal from "./EditBasicInfoModal";
import "./ProfileTabs.css";

function ProfileTabs({ userData, loading, isPublicView = false }) {
    const [activeTab, setActiveTab] = useState("about");
    const [isEditMode, setIsEditMode] = useState(false);
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
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

    const tabs = [
        { id: "about", label: "About" },
        { id: "portfolio", label: "Portfolio" },
        { id: "reviews", label: "Reviews" },
        { id: "myjobs", label: "My Jobs" },
        { id: "projects", label: "Projects" },
        ...(isOwn ? [{ id: "payments", label: "Payment History" }] : []),
    ];

    const renderTabContent = () => {
        switch (activeTab) {
            case "about":
                return <AboutTab userData={displayUser} isOwn={isOwn} isEditMode={isEditMode} />;
            case "reviews":
                return <ReviewsTab userId={displayUser?._id} />;
            case "myjobs":
                return <MyJobsTab userId={displayUser?._id} isOwn={isOwn} />;
            case "projects":
                return <ProjectsTab userId={displayUser?._id} isOwn={isOwn} />;
            case "portfolio":
                return <PortfolioTab userId={displayUser?._id} isOwn={isOwn} />;
            case "payments":
                return <PaymentHistoryTab />;
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

                    {/* Only show action buttons if it's own profile (not public view) */}
                    {!isPublicView && (
                        <div className="profile-actions">
                            {isOwn && activeTab === "portfolio" && (
                                <button className="add-work-btn">
                                    <FaPlus />
                                    Add Work
                                </button>
                            )}
                            {isOwn && (
                                <button
                                    className="edit-profile-btn"
                                    onClick={() => setIsEditModalOpen(true)}
                                >
                                    <FaEdit />
                                    Edit Profile
                                </button>
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
            {!isPublicView && (
                <EditBasicInfoModal
                    isOpen={isEditModalOpen}
                    onClose={() => setIsEditModalOpen(false)}
                    userData={displayUser}
                />
            )}
        </div>
    );
}

export default ProfileTabs;
