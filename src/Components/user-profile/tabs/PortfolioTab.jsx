import React, { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import { BASE_URL } from '../../../Services/config';
import logger from '../../../Services/logger';
import { toast } from 'react-toastify';
import storage from '../../../Services/storage';
import { FaExternalLinkAlt, FaPlus, FaEdit, FaTrash, FaTimes } from 'react-icons/fa';
import './PortfolioTab.css';

const PortfolioTab = () => {
    const { user } = useSelector((state) => state.auth);
    const [portfolio, setPortfolio] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [editingItem, setEditingItem] = useState(null);
    const [formData, setFormData] = useState({
        title: '',
        description: '',
        projectUrl: '',
        skills: [],
        dateCompleted: '',
        images: []
    });
    const [imageFiles, setImageFiles] = useState([]);
    const [submitting, setSubmitting] = useState(false);

    useEffect(() => {
        fetchPortfolio();
    }, []);

    const fetchPortfolio = async () => {
        try {
            const token = storage.get('token');
            const response = await fetch(`${BASE_URL}/portfolio?freelancerId=${user.id}`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            const data = await response.json();
            setPortfolio(data.portfolioItems || []);
        } catch (error) {
            logger.error('Error fetching portfolio:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleOpenModal = (item = null) => {
        if (item) {
            setEditingItem(item);
            setFormData({
                title: item.title,
                description: item.description,
                projectUrl: item.projectUrl || '',
                skills: item.skills.map(s => s._id || s),
                dateCompleted: item.dateCompleted?.split('T')[0] || '',
                images: item.images || []
            });
        } else {
            setEditingItem(null);
            setFormData({
                title: '',
                description: '',
                projectUrl: '',
                skills: [],
                dateCompleted: '',
                images: []
            });
            setImageFiles([]);
        }
        setShowModal(true);
    };

    const handleCloseModal = () => {
        setShowModal(false);
        setEditingItem(null);
        setImageFiles([]);
    };

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData({ ...formData, [name]: value });
    };

    const handleImageChange = (e) => {
        const files = Array.from(e.target.files);
        
        if (files.length > 5) {
            toast.warning('Maximum 5 images allowed');
            return;
        }

        // Validate file sizes
        for (let file of files) {
            if (file.size > 5 * 1024 * 1024) {
                toast.error('Each image must be less than 5MB');
                return;
            }
        }

        setImageFiles(files);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (portfolio.length >= 10 && !editingItem) {
            toast.warning('Maximum 10 portfolio items allowed');
            return;
        }

        setSubmitting(true);

        try {
            const token = storage.get('token');
            
            // For simplicity, submit JSON with image URLs
            // In production, you'd upload images first
            const dataToSubmit = {
                ...formData,
                images: editingItem ? formData.images : ['https://via.placeholder.com/400x300'] // Placeholder
            };

            if (editingItem) {
                const response = await fetch(`${BASE_URL}/portfolio/${editingItem._id}`, {
                    method: 'PUT',
                    headers: { 
                        'Authorization': `Bearer ${token}`,
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify(dataToSubmit)
                });
                const data = await response.json();
                if (!response.ok) throw new Error(data.message);
                toast.success('Portfolio item updated successfully!');
            } else {
                const response = await fetch(`${BASE_URL}/portfolio`, {
                    method: 'POST',
                    headers: { 
                        'Authorization': `Bearer ${token}`,
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify(dataToSubmit)
                });
                const data = await response.json();
                if (!response.ok) throw new Error(data.message);
                toast.success('Portfolio item added successfully!');
            }

            fetchPortfolio();
            handleCloseModal();
        } catch (error) {
            logger.error('Error submitting portfolio:', error);
            toast.error(error.message || 'Failed to save portfolio item');
        } finally {
            setSubmitting(false);
        }
    };

    const handleDelete = async (id) => {
        if (!window.confirm('Are you sure you want to delete this portfolio item?')) return;

        try {
            const token = storage.get('token');
            const response = await fetch(`${BASE_URL}/portfolio/${id}`, {
                method: 'DELETE',
                headers: { Authorization: `Bearer ${token}` }
            });
            const data = await response.json();
            if (!response.ok) throw new Error(data.message);
            toast.success('Portfolio item deleted successfully!');
            fetchPortfolio();
        } catch (error) {
            logger.error('Error deleting portfolio:', error);
            toast.error('Failed to delete portfolio item');
        }
    };

    if (loading) {
        return <div className="text-center py-4"><div className="spinner-border" role="status"></div></div>;
    }

    return (
        <div className="portfolio-tab">
            <div className="portfolio-header">
                <div>
                    <h3 className="portfolio-title">Portfolio</h3>
                    <p className="portfolio-count">{portfolio.length} / 10 projects</p>
                </div>
                {portfolio.length < 10 && (
                    <button className="btn btn-primary" onClick={() => handleOpenModal()}>
                        <FaPlus /> Add Project
                    </button>
                )}
            </div>

            {portfolio.length === 0 ? (
                <div className="empty-state">
                    <p>No portfolio items yet. Add your first project!</p>
                </div>
            ) : (
                <div className="portfolio-grid">
                    {portfolio.map((project) => (
                        <div key={project._id} className="portfolio-card">
                            <div className="portfolio-image">
                                <img src={project.images[0]} alt={project.title} />
                                <div className="portfolio-overlay">
                                    <div className="portfolio-actions">
                                        <button onClick={() => handleOpenModal(project)} className="portfolio-link">
                                            <FaEdit />
                                        </button>
                                        <button onClick={() => handleDelete(project._id)} className="portfolio-link delete">
                                            <FaTrash />
                                        </button>
                                        {project.projectUrl && (
                                            <a href={project.projectUrl} target="_blank" rel="noopener noreferrer" className="portfolio-link">
                                                <FaExternalLinkAlt />
                                            </a>
                                        )}
                                    </div>
                                </div>
                            </div>

                            <div className="portfolio-content">
                                <h4 className="portfolio-project-title">{project.title}</h4>
                                <p className="portfolio-description">{project.description}</p>

                                <div className="portfolio-tech">
                                    {project.skills?.map((skill, index) => (
                                        <span key={index} className="tech-badge">{skill.name || skill}</span>
                                    ))}
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* Add/Edit Modal */}
            {showModal && (
                <div className="portfolio-modal-overlay" onClick={handleCloseModal}>
                    <div className="portfolio-modal" onClick={(e) => e.stopPropagation()}>
                        <div className="portfolio-modal-header">
                            <h4>{editingItem ? 'Edit Portfolio Item' : 'Add Portfolio Item'}</h4>
                            <button className="modal-close-btn" onClick={handleCloseModal}>
                                <FaTimes />
                            </button>
                        </div>

                        <form onSubmit={handleSubmit} className="portfolio-form">
                            <div className="form-group">
                                <label>Title *</label>
                                <input
                                    type="text"
                                    name="title"
                                    value={formData.title}
                                    onChange={handleInputChange}
                                    required
                                    className="form-control"
                                />
                            </div>

                            <div className="form-group">
                                <label>Description *</label>
                                <textarea
                                    name="description"
                                    value={formData.description}
                                    onChange={handleInputChange}
                                    required
                                    rows="4"
                                    className="form-control"
                                />
                            </div>

                            <div className="form-group">
                                <label>Project URL</label>
                                <input
                                    type="url"
                                    name="projectUrl"
                                    value={formData.projectUrl}
                                    onChange={handleInputChange}
                                    className="form-control"
                                    placeholder="https://example.com"
                                />
                            </div>

                            <div className="form-group">
                                <label>Skills (comma separated) *</label>
                                <input
                                    type="text"
                                    name="skills"
                                    value={formData.skills.join(', ')}
                                    onChange={(e) => setFormData({ ...formData, skills: e.target.value.split(',').map(s => s.trim()) })}
                                    required
                                    className="form-control"
                                    placeholder="React, Node.js, MongoDB"
                                />
                            </div>

                            <div className="form-group">
                                <label>Completion Date *</label>
                                <input
                                    type="date"
                                    name="dateCompleted"
                                    value={formData.dateCompleted}
                                    onChange={handleInputChange}
                                    required
                                    className="form-control"
                                />
                            </div>

                            {!editingItem && (
                                <div className="form-group">
                                    <label>Images (Max 5, each less than 5MB)</label>
                                    <input
                                        type="file"
                                        accept="image/*"
                                        multiple
                                        onChange={handleImageChange}
                                        className="form-control"
                                    />
                                    {imageFiles.length > 0 && (
                                        <small className="text-muted">{imageFiles.length} file(s) selected</small>
                                    )}
                                </div>
                            )}

                            <div className="form-actions">
                                <button type="button" className="btn btn-secondary" onClick={handleCloseModal}>
                                    Cancel
                                </button>
                                <button type="submit" className="btn btn-primary" disabled={submitting}>
                                    {submitting ? 'Saving...' : editingItem ? 'Update' : 'Add'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default PortfolioTab;
