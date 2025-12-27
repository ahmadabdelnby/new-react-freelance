import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import ActiveProjects from '../Components/dashboard/ActiveProjects';
import './MyProjects.css';

function MyProjects() {
    const navigate = useNavigate();

    return (
        <div className="my-projects-page">
            <div className="container py-5">
                <div className="page-header mb-4">
                    <button onClick={() => navigate(-1)} className="back-button">
                        <i className="fas fa-arrow-left"></i> Back
                    </button>
                    <h1 className="page-title">
                        <i className="fas fa-briefcase"></i> My Active Projects
                    </h1>
                    <p className="page-subtitle">Manage your active projects as a client</p>
                </div>

                <ActiveProjects />
            </div>
        </div>
    );
}

export default MyProjects;
