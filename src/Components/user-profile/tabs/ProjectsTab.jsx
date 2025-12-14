import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { getMyContracts } from '../../../Services/Contracts/ContractsSlice';
import { FaCalendarAlt, FaDollarSign, FaCheckCircle } from 'react-icons/fa';
import './ProjectsTab.css';

const ProjectsTab = ({ userId }) => {
    const dispatch = useDispatch();
    const { contracts, loading } = useSelector((state) => state.contracts);

    useEffect(() => {
        if (userId) {
            dispatch(getMyContracts());
        }
    }, [userId, dispatch]);

    const completedContracts = contracts?.filter(c => c.status === 'completed') || [];

    if (loading) {
        return <div className="projects-tab">Loading projects...</div>;
    }

    return (
        <div className="projects-tab">
            <div className="projects-header">
                <h3 className="projects-title">Completed Projects</h3>
                <p className="projects-count">{completedContracts.length} projects</p>
            </div>

            <div className="projects-list">
                {completedContracts.length === 0 ? (
                    <p className="no-projects">No completed projects yet.</p>
                ) : (
                    completedContracts.map((contract) => (
                        <div key={contract._id} className="project-card">
                            <div className="project-header">
                                <h4 className="project-title">{contract.job?.title || 'Project'}</h4>
                                <span className={`project-status ${contract.status}`}>
                                    <FaCheckCircle className="status-icon" />
                                    {contract.status}
                                </span>
                            </div>

                            <p className="project-description">{contract.description || contract.job?.description || 'No description available'}</p>

                            <div className="project-details">
                                <div className="project-detail-item">
                                    <FaDollarSign className="detail-icon" />
                                    <span className="detail-label">Amount:</span>
                                    <span className="detail-value">${contract.agreedAmount}</span>
                                </div>

                                <div className="project-detail-item">
                                    <FaCalendarAlt className="detail-icon" />
                                    <span className="detail-label">Started:</span>
                                    <span className="detail-value">{new Date(contract.startDate).toLocaleDateString()}</span>
                                </div>

                                {contract.completedAt && (
                                    <div className="project-detail-item">
                                        <FaCalendarAlt className="detail-icon" />
                                        <span className="detail-label">Completed:</span>
                                        <span className="detail-value">{new Date(contract.completedAt).toLocaleDateString()}</span>
                                    </div>
                                )}
                            </div>

                            {contract.job?.skills && contract.job.skills.length > 0 && (
                                <div className="project-technologies">
                                    {contract.job.skills.map((skill, index) => (
                                        <span key={skill._id || skill.name || `skill-${index}`} className="tech-tag">
                                            {typeof skill === 'string' ? skill : skill.name}
                                        </span>
                                    ))}
                                </div>
                            )}
                        </div>
                    ))
                )}
            </div>
        </div>
    );
};

export default ProjectsTab;
