import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { FaArrowLeft, FaBriefcase } from 'react-icons/fa';
import ActiveProjects from '../Components/dashboard/ActiveProjects';
import './MyProjects.css';

function MyProjects() {
    const navigate = useNavigate();

    return (
        <div className="myprojects-page-container">
            <div className="container py-5">
                <div className="myprojects-page-header mb-4">
                    <button onClick={() => navigate(-1)} className="myprojects-back-button">
                        <FaArrowLeft /> Back
                    </button>
                    <h1 className="myprojects-page-title">
                        <FaBriefcase /> My Active Projects
                    </h1>
                    <p className="myprojects-page-subtitle">Manage your active projects as a client</p>
                </div>

                <ActiveProjects />
            </div>
        </div>
    );
}

export default MyProjects;
