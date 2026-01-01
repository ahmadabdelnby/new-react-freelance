import React from 'react'
import { useNavigate } from 'react-router-dom'
import './Action.css'
import { FaArrowRight, FaBriefcase, FaUserTie } from 'react-icons/fa'

function Action() {
    const navigate = useNavigate()

    return (
        <section className="about-action-section">
            <div className="about-action-container">
                <div className="about-action-content">
                    <h2 className="about-action-title">Ready to Get Started?</h2>
                    <p className="about-action-subtitle">
                        Join our growing community of talented freelancers and clients today.
                    </p>
                    
                    <div className="about-action-buttons">
                        <button 
                            className="about-action-btn about-action-primary"
                            onClick={() => navigate('/freelancers')}
                        >
                            <FaUserTie />
                            <span>Find Talent</span>
                            <FaArrowRight className="about-btn-arrow" />
                        </button>
                        <button 
                            className="about-action-btn about-action-secondary"
                            onClick={() => navigate('/jobs')}
                        >
                            <FaBriefcase />
                            <span>Browse Jobs</span>
                            <FaArrowRight className="about-btn-arrow" />
                        </button>
                    </div>
                </div>

                {/* Decorative Elements */}
                <div className="about-action-decoration">
                    <div className="about-action-circle about-action-circle-1"></div>
                    <div className="about-action-circle about-action-circle-2"></div>
                    <div className="about-action-circle about-action-circle-3"></div>
                </div>
            </div>
        </section>
    )
}

export default Action
