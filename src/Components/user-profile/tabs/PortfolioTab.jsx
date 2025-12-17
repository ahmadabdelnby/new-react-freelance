import React, { useState, useEffect, useRef } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { getMyPortfolioItems, getAllPortfolioItems, createPortfolioItem, updatePortfolioItem, deletePortfolioItem, likePortfolioItem } from '../../../Services/Portfolio/PortfolioSlice';
import { toast } from 'react-toastify';
import { FaPlus, FaEdit, FaTrash, FaTimes, FaUpload, FaTimesCircle, FaChevronDown, FaGithub, FaGlobe, FaChevronLeft, FaChevronRight, FaCalendar, FaEye, FaStar, FaFilter, FaHeart } from 'react-icons/fa';
import { API_ENDPOINTS } from '../../../Services/config';
import './PortfolioTab.css';

const PortfolioTab = ({ userId, isOwn }) => {
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const portfolioState = useSelector((state) => state.portfolio);
    const portfolio = Array.isArray(portfolioState?.items) ? portfolioState.items : [];
    const loading = portfolioState?.loading || false;
    const token = useSelector((state) => state.auth.token);
    const authUser = useSelector((state) => state.auth.user);
    const currentUserId = authUser?._id || authUser?.id;

    const [showModal, setShowModal] = useState(false);
    const [editingItem, setEditingItem] = useState(null);
    const [viewingItem, setViewingItem] = useState(null);
    const [currentImageIndex, setCurrentImageIndex] = useState(0);
    const [fullscreenImage, setFullscreenImage] = useState(null);
    const [formData, setFormData] = useState({
        title: '',
        description: '',
        githubUrl: '',
        liveUrl: '',
        skills: [],
        dateCompleted: '',
        images: []
    });
    const [errors, setErrors] = useState({});
    const [submitting, setSubmitting] = useState(false);
    const [availableSkills, setAvailableSkills] = useState([]);
    const [loadingSkills, setLoadingSkills] = useState(false);
    const [uploadingImages, setUploadingImages] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const [isDropdownOpen, setIsDropdownOpen] = useState(false);
    const [selectedSkillFilter, setSelectedSkillFilter] = useState('');
    const [showLikesModal, setShowLikesModal] = useState(false);
    const [likesUsers, setLikesUsers] = useState([]);
    const dropdownRef = useRef(null);

    useEffect(() => {
        if (isOwn) {
            // Fetch logged-in user's portfolio
            dispatch(getMyPortfolioItems());
        } else if (userId) {
            // Fetch specific user's portfolio by freelancerId
            dispatch(getAllPortfolioItems({ freelancerId: userId }));
        }
        fetchSkills();
    }, [dispatch, isOwn, userId]);

    // Close dropdown when clicking outside
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
                setIsDropdownOpen(false);
            }
        };

        if (showModal && isDropdownOpen) {
            document.addEventListener('mousedown', handleClickOutside);
            return () => {
                document.removeEventListener('mousedown', handleClickOutside);
            };
        }
    }, [showModal, isDropdownOpen]);

    const fetchSkills = async () => {
        setLoadingSkills(true);
        try {
            const response = await fetch(API_ENDPOINTS.SKILLS);
            const data = await response.json();
            setAvailableSkills(Array.isArray(data) ? data : []);
        } catch (error) {
            console.error('Failed to fetch skills:', error);
            toast.error('Failed to load skills');
        } finally {
            setLoadingSkills(false);
        }
    };

    const handleOpenModal = (item = null) => {
        if (item) {
            setEditingItem(item);
            setFormData({
                title: item.title,
                description: item.description,
                githubUrl: item.githubUrl || '',
                liveUrl: item.liveUrl || '',
                skills: item.skills.map(s => s._id || s),
                dateCompleted: item.dateCompleted?.split('T')[0] || '',
                images: item.images || []
            });
        } else {
            setEditingItem(null);
            setFormData({
                title: '',
                description: '',
                githubUrl: '',
                liveUrl: '',
                skills: [],
                dateCompleted: '',
                images: []
            });
        }
        setShowModal(true);
        setErrors({});
    };

    const handleCloseModal = () => {
        setShowModal(false);
        setEditingItem(null);
        setErrors({});
        setSearchTerm('');
        setIsDropdownOpen(false);
    };

    const handleViewDetails = (item) => {
        setViewingItem(item);
        setCurrentImageIndex(0);
        // Increment views
        incrementViews(item._id);
    };

    const incrementViews = async (itemId) => {
        try {
            const headers = {
                'Content-Type': 'application/json'
            };

            // Add token if available (for authenticated users)
            if (token) {
                headers['Authorization'] = `Bearer ${token}`;
            }

            await fetch(API_ENDPOINTS.INCREMENT_PORTFOLIO_VIEWS(itemId), {
                method: 'POST',
                headers: headers
            });
        } catch (error) {
            console.error('Failed to increment views:', error);
        }
    };

    const handleLike = async (item, e) => {
        if (e) e.stopPropagation(); // Prevent opening details modal

        // Check if user is logged in
        if (!token) {
            toast.warning('Please login to like projects');
            return;
        }

        // Check if user is the owner
        if (item.freelancer?._id === currentUserId || item.freelancer === currentUserId) {
            toast.info('You cannot like your own project');
            return;
        }

        try {
            // Check current like status
            const isLiked = item.likedBy?.some(id => String(id) === String(currentUserId));

            // Use Redux thunk for like action
            const result = await dispatch(likePortfolioItem(item._id)).unwrap();

            // If viewing details, update viewingItem immediately
            if (viewingItem && viewingItem._id === item._id) {
                setViewingItem(result);
            }

            toast.success(isLiked ? 'Project unliked successfully' : 'Project liked successfully');
        } catch (error) {
            console.error('Failed to like portfolio item:', error);
            toast.error(error || 'Failed to like item');
        }
    };

    const handleShowLikes = async (item, e) => {
        if (e) e.stopPropagation();

        if (!item.likedBy || item.likedBy.length === 0) {
            toast.info('No likes yet');
            return;
        }

        try {
            // Fetch user details for all likedBy IDs
            const userPromises = item.likedBy.map(async (userId) => {
                try {
                    const id = typeof userId === 'object' ? userId._id : userId;
                    const response = await fetch(`${API_ENDPOINTS.BASE_URL || 'http://localhost:3000'}/Freelancing/api/v1/users/${id}`);
                    if (response.ok) {
                        const data = await response.json();
                        // The API returns user data directly, not wrapped in { user: ... }
                        return data;
                    }
                } catch (err) {
                    console.error('Failed to fetch user:', userId, err);
                }
                return null;
            });

            const users = await Promise.all(userPromises);
            const validUsers = users.filter(user => user !== null && user !== undefined);

            if (validUsers.length === 0) {
                toast.info('Unable to load user information');
                return;
            }

            setLikesUsers(validUsers);
            setShowLikesModal(true);
        } catch (error) {
            console.error('Failed to fetch likes:', error);
            toast.error('Failed to load likes');
        }
    };

    const handleUserClick = (userId) => {
        setShowLikesModal(false); // Close the modal
        navigate(`/freelancer/${userId}`); // Navigate to user profile
    };

    const handleCloseDetails = () => {
        setViewingItem(null);
        setCurrentImageIndex(0);
    };

    const handlePrevImage = () => {
        if (viewingItem && viewingItem.images.length > 1) {
            setCurrentImageIndex((prev) =>
                prev === 0 ? viewingItem.images.length - 1 : prev - 1
            );
        }
    };

    const handleNextImage = () => {
        if (viewingItem && viewingItem.images.length > 1) {
            setCurrentImageIndex((prev) =>
                prev === viewingItem.images.length - 1 ? 0 : prev + 1
            );
        }
    };

    const handleOpenFullscreen = (imageUrl) => {
        setFullscreenImage(imageUrl);
    };

    const handleCloseFullscreen = () => {
        setFullscreenImage(null);
    };

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData({ ...formData, [name]: value });

        // Clear error when user starts typing
        if (errors[name]) {
            setErrors({ ...errors, [name]: '' });
        }
    };

    const handleSkillAdd = (skillId) => {
        if (skillId && !formData.skills.includes(skillId)) {
            if (formData.skills.length >= 10) {
                toast.warning('Maximum 10 skills allowed');
                return;
            }
            setFormData({ ...formData, skills: [...formData.skills, skillId] });
        }
        setSearchTerm('');
        setIsDropdownOpen(false);
        // Clear error when user selects skills
        if (errors.skills) {
            setErrors({ ...errors, skills: '' });
        }
    };

    const handleSkillRemove = (skillIdToRemove) => {
        setFormData({
            ...formData,
            skills: formData.skills.filter(id => id !== skillIdToRemove)
        });
    };

    const handleSearchChange = (e) => {
        setSearchTerm(e.target.value);
        setIsDropdownOpen(true);
    };

    // Filter portfolio items by selected skill
    const filteredPortfolio = selectedSkillFilter
        ? portfolio.filter(item =>
            item.skills.some(skill =>
                (typeof skill === 'object' ? skill._id : skill) === selectedSkillFilter
            )
        )
        : portfolio;

    // Get unique skills from portfolio for filter
    const portfolioSkills = [...new Map(
        portfolio.flatMap(item => item.skills)
            .filter(skill => typeof skill === 'object')
            .map(skill => [skill._id, skill])
    ).values()];

    // Filter skills based on search term
    const filteredSkills = searchTerm
        ? availableSkills.filter(skill =>
            skill.name.toLowerCase().includes(searchTerm.toLowerCase()) &&
            !formData.skills.includes(skill._id)
        )
        : availableSkills.filter(skill => !formData.skills.includes(skill._id));

    const selectedSkillObjects = availableSkills.filter(skill =>
        formData.skills.includes(skill._id)
    );

    const handleImageUpload = async (e) => {
        const files = Array.from(e.target.files);
        if (files.length === 0) return;

        if (formData.images.length + files.length > 5) {
            toast.warning('Maximum 5 images allowed per portfolio item');
            return;
        }

        setUploadingImages(true);
        try {
            const formDataUpload = new FormData();
            files.forEach(file => {
                // Backend expects 'portfolioImages' as field name
                formDataUpload.append('portfolioImages', file);
            });

            const response = await fetch(API_ENDPOINTS.UPLOAD_PORTFOLIO_IMAGES, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`
                },
                body: formDataUpload
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.message || 'Failed to upload images');
            }

            const newImages = [...formData.images, ...data.fileUrls];
            setFormData({ ...formData, images: newImages });
            toast.success(`${files.length} image(s) uploaded successfully`);

            // Clear error when user uploads images
            if (errors.images) {
                setErrors({ ...errors, images: '' });
            }
        } catch (error) {
            toast.error(error.message || 'Failed to upload images');
        } finally {
            setUploadingImages(false);
            e.target.value = ''; // Reset input
        }
    };

    const handleRemoveImage = (index) => {
        const newImages = formData.images.filter((_, i) => i !== index);
        setFormData({ ...formData, images: newImages });
    };

    const validateForm = () => {
        const newErrors = {};

        if (!formData.title || formData.title.trim().length < 3) {
            newErrors.title = 'Title must be at least 3 characters';
        }
        if (formData.title && formData.title.length > 100) {
            newErrors.title = 'Title must not exceed 100 characters';
        }

        if (!formData.description || formData.description.trim().length < 10) {
            newErrors.description = 'Description must be at least 10 characters';
        }
        if (formData.description && formData.description.length > 500) {
            newErrors.description = 'Description must not exceed 500 characters';
        }

        if (formData.githubUrl && formData.githubUrl.length > 255) {
            newErrors.githubUrl = 'GitHub URL is too long';
        }

        if (formData.liveUrl && formData.liveUrl.length > 255) {
            newErrors.liveUrl = 'Live URL is too long';
        }

        if (!formData.dateCompleted) {
            newErrors.dateCompleted = 'Date completed is required';
        }

        if (!formData.skills || formData.skills.length === 0) {
            newErrors.skills = 'At least one skill is required';
        }

        if (!formData.images || formData.images.length === 0) {
            newErrors.images = 'At least one image is required';
        }

        return newErrors;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        // Validate form
        const validationErrors = validateForm();
        if (Object.keys(validationErrors).length > 0) {
            setErrors(validationErrors);
            toast.error('Please fix the errors in the form');
            return;
        }

        if (portfolio.length >= 10 && !editingItem) {
            toast.warning('Maximum 10 portfolio items allowed');
            return;
        }

        setSubmitting(true);

        try {
            if (editingItem) {
                await dispatch(updatePortfolioItem({ itemId: editingItem._id, updates: formData })).unwrap();
                toast.success('Portfolio item updated successfully!');
            } else {
                await dispatch(createPortfolioItem(formData)).unwrap();
                toast.success('Portfolio item added successfully!');
            }
            handleCloseModal();
        } catch (error) {
            toast.error(error || 'Failed to save portfolio item');
        } finally {
            setSubmitting(false);
        }
    };

    const handleDelete = async (id) => {
        if (!window.confirm('Are you sure you want to delete this portfolio item?')) return;

        try {
            await dispatch(deletePortfolioItem(id)).unwrap();
            toast.success('Portfolio item deleted successfully!');
        } catch {
            toast.error('Failed to delete portfolio item');
        }
    };

    if (loading) {
        return <div className="portfolio-tab"><div className="text-center py-4">Loading portfolio...</div></div>;
    }

    return (
        <div className="portfolio-tab">
            <div className="portfolio-header">
                <div>
                    <h3 className="portfolio-title">Portfolio</h3>
                    <p className="portfolio-count">{portfolio.length} / 10 projects</p>
                </div>
                {isOwn && portfolio.length < 10 && (
                    <button className="btn btn-primary" onClick={() => handleOpenModal()}>
                        <FaPlus /> Add Project
                    </button>
                )}
            </div>

            {/* Skills Filter */}
            {portfolioSkills.length > 0 && (
                <div className="portfolio-filters">
                    <div className="filter-label">
                        <FaFilter /> Filter by Skill:
                    </div>
                    <select
                        className="skill-filter-select"
                        value={selectedSkillFilter}
                        onChange={(e) => setSelectedSkillFilter(e.target.value)}
                    >
                        <option value="">All Skills ({portfolio.length})</option>
                        {portfolioSkills.map(skill => {
                            const count = portfolio.filter(item =>
                                item.skills.some(s => (typeof s === 'object' ? s._id : s) === skill._id)
                            ).length;
                            return (
                                <option key={skill._id} value={skill._id}>
                                    {skill.name} ({count})
                                </option>
                            );
                        })}
                    </select>
                    {selectedSkillFilter && (
                        <button
                            className="clear-filter-btn"
                            onClick={() => setSelectedSkillFilter('')}
                        >
                            <FaTimes /> Clear
                        </button>
                    )}
                </div>
            )}

            {filteredPortfolio.length === 0 ? (
                <div className="empty-state">
                    <p>{isOwn ? 'No portfolio items yet. Add your first project!' : 'No portfolio items to display.'}</p>
                </div>
            ) : (
                <div className="portfolio-grid">
                    {filteredPortfolio.map((item) => (
                        <div key={item._id} className="portfolio-card">
                            {item.isFeatured && (
                                <div className="featured-badge">
                                    <FaStar /> Featured
                                </div>
                            )}
                            <div className="portfolio-image">
                                <img src={`${API_ENDPOINTS.BASE_URL || 'http://localhost:3000'}${item.images[0]}`} alt={item.title} />
                                <div className="portfolio-overlay">
                                    <div className="portfolio-actions">
                                        {item.githubUrl && (
                                            <a href={item.githubUrl} target="_blank" rel="noopener noreferrer" className="portfolio-link github" title="View GitHub Code">
                                                <FaGithub />
                                            </a>
                                        )}
                                        {item.liveUrl && (
                                            <a href={item.liveUrl} target="_blank" rel="noopener noreferrer" className="portfolio-link live" title="View Live Site">
                                                <FaGlobe />
                                            </a>
                                        )}
                                        {isOwn && (
                                            <>
                                                <button className="portfolio-link edit" onClick={() => handleOpenModal(item)} title="Edit">
                                                    <FaEdit />
                                                </button>
                                                <button className="portfolio-link delete" onClick={() => handleDelete(item._id)} title="Delete">
                                                    <FaTrash />
                                                </button>
                                            </>
                                        )}
                                    </div>
                                </div>
                            </div>
                            <div className="portfolio-content" onClick={() => handleViewDetails(item)} style={{ cursor: 'pointer' }}>
                                <h4 className="portfolio-project-title">{item.title}</h4>
                                {/* <p className="portfolio-description">
                                    {item.description.length > 60 
                                        ? `${item.description.substring(0, 60)}...` 
                                        : item.description}
                                </p> */}

                                {/* {item.dateCompleted && (
                                    <div className="portfolio-date">
                                        <FaCalendar />
                                        <span>{new Date(item.dateCompleted).toLocaleDateString('en-US', { year: 'numeric', month: 'short' })}</span>
                                    </div>
                                )} */}

                                {/* {item.skills && item.skills.length > 0 && (
                                    <div className="portfolio-tech">
                                        {item.skills.slice(0, 3).map((skill, index) => (
                                            <span key={skill._id || skill.name || `skill-${index}`} className="tech-badge">
                                                {typeof skill === 'object' ? skill.name : skill}
                                            </span>
                                        ))}
                                        {item.skills.length > 3 && (
                                            <span className="tech-badge more-skills">+{item.skills.length - 3}</span>
                                        )}
                                    </div>
                                )} */}

                                <div className="portfolio-stats">
                                    <span className="views-count">
                                        <FaEye /> {item.views || 0}
                                    </span>
                                    <button
                                        className="likes-btn"
                                        onClick={(e) => handleLike(item, e)}
                                        title={item.freelancer?._id === currentUserId || item.freelancer === currentUserId ? "You cannot like your own project" : "Like this project"}
                                        disabled={item.freelancer?._id === currentUserId || item.freelancer === currentUserId}
                                    >
                                        <FaHeart className={token && item.likedBy?.some(id => String(id) === String(currentUserId)) ? 'liked' : ''} />
                                        <span>{item.likes || 0}</span>
                                    </button>
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
                            <button className="close-btn" onClick={handleCloseModal}>
                                <FaTimes />
                            </button>
                        </div>
                        <form onSubmit={handleSubmit} className="portfolio-modal-body">
                            <div className="form-group">
                                <label>Project Title <span className="required-star">*</span></label>
                                <input
                                    type="text"
                                    name="title"
                                    value={formData.title}
                                    onChange={handleInputChange}
                                    className={`form-control ${errors.title ? 'input-error' : ''}`}
                                    placeholder="e.g., E-commerce Website"
                                    maxLength={100}
                                />
                                <div className="char-count">{formData.title.length}/100</div>
                                {errors.title && <div className="error-message">{errors.title}</div>}
                            </div>
                            <div className="form-group">
                                <label>Description <span className="required-star">*</span></label>
                                <textarea
                                    name="description"
                                    value={formData.description}
                                    onChange={handleInputChange}
                                    rows={4}
                                    className={`form-control ${errors.description ? 'input-error' : ''}`}
                                    placeholder="Describe your project, technologies used, and your role"
                                    maxLength={500}
                                />
                                <div className="char-count">{formData.description.length}/500</div>
                                {errors.description && <div className="error-message">{errors.description}</div>}
                            </div>

                            <div className="form-group">
                                <label>GitHub URL <span className="optional-badge">Optional</span></label>
                                <input
                                    type="url"
                                    name="githubUrl"
                                    value={formData.githubUrl}
                                    onChange={handleInputChange}
                                    className={`form-control ${errors.githubUrl ? 'input-error' : ''}`}
                                    placeholder="https://github.com/username/repo"
                                    maxLength={255}
                                />
                                {errors.githubUrl && <div className="error-message">{errors.githubUrl}</div>}
                            </div>

                            <div className="form-group">
                                <label>Live URL <span className="optional-badge">Optional</span></label>
                                <input
                                    type="url"
                                    name="liveUrl"
                                    value={formData.liveUrl}
                                    onChange={handleInputChange}
                                    className={`form-control ${errors.liveUrl ? 'input-error' : ''}`}
                                    placeholder="https://live-site.com"
                                    maxLength={255}
                                />
                                {errors.liveUrl && <div className="error-message">{errors.liveUrl}</div>}
                            </div>

                            {/* Skills Selector */}
                            <div className="form-group">
                                <label>Skills <span className="required-star">*</span></label>
                                {loadingSkills ? (
                                    <div className="text-muted">Loading skills...</div>
                                ) : (
                                    <div className="skills-edit-container">
                                        <div className="skills-input-wrapper" ref={dropdownRef}>
                                            <div className="skills-input-container">
                                                <input
                                                    type="text"
                                                    className="skills-search-input"
                                                    placeholder="Click to view all skills or type to search..."
                                                    value={searchTerm}
                                                    onChange={handleSearchChange}
                                                    onFocus={() => setIsDropdownOpen(true)}
                                                />
                                                <FaChevronDown
                                                    className={`dropdown-icon ${isDropdownOpen ? 'open' : ''}`}
                                                    onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                                                />
                                            </div>

                                            {/* Skills Dropdown */}
                                            {isDropdownOpen && (
                                                <div className="skills-dropdown">
                                                    {filteredSkills.length > 0 ? (
                                                        <>
                                                            {filteredSkills.slice(0, 15).map((skill) => (
                                                                <div
                                                                    key={skill._id}
                                                                    className="skill-option"
                                                                    onClick={() => handleSkillAdd(skill._id)}
                                                                >
                                                                    {skill.name}
                                                                </div>
                                                            ))}
                                                            {filteredSkills.length > 15 && (
                                                                <div className="skill-option-info">
                                                                    +{filteredSkills.length - 15} more skills available
                                                                </div>
                                                            )}
                                                        </>
                                                    ) : (
                                                        <div className="skill-option-empty">
                                                            {searchTerm ? 'No matching skills found' : 'All skills have been selected'}
                                                        </div>
                                                    )}
                                                </div>
                                            )}
                                        </div>

                                        {/* Selected Skills */}
                                        {selectedSkillObjects.length > 0 && (
                                            <div className="skills-tags">
                                                {selectedSkillObjects.map((skill) => (
                                                    <span key={skill._id} className="skill-tag-removable">
                                                        {skill.name}
                                                        <button
                                                            type="button"
                                                            className="skill-remove"
                                                            onClick={() => handleSkillRemove(skill._id)}
                                                            aria-label={`Remove ${skill.name}`}
                                                        >
                                                            ×
                                                        </button>
                                                    </span>
                                                ))}
                                            </div>
                                        )}
                                        <small className="form-hint">
                                            {selectedSkillObjects.length === 0
                                                ? 'Add at least 1 skill (max 10)'
                                                : `${selectedSkillObjects.length} skill${selectedSkillObjects.length > 1 ? 's' : ''} selected`
                                            }
                                        </small>
                                    </div>
                                )}
                                {errors.skills && <div className="error-message">{errors.skills}</div>}
                            </div>

                            {/* Image Upload */}
                            <div className="form-group">
                                <label>Project Images <span className="required-star">*</span></label>
                                <div className="image-upload-container">
                                    <input
                                        type="file"
                                        id="portfolio-images"
                                        accept="image/*"
                                        multiple
                                        onChange={handleImageUpload}
                                        disabled={uploadingImages || formData.images.length >= 5}
                                        style={{ display: 'none' }}
                                    />
                                    <label htmlFor="portfolio-images" className={`upload-btn ${uploadingImages || formData.images.length >= 5 ? 'disabled' : ''}`}>
                                        <FaUpload /> {uploadingImages ? 'Uploading...' : 'Upload Images'}
                                    </label>
                                    <span className="upload-hint">Max 5 images (JPG, PNG, GIF)</span>
                                </div>

                                {formData.images.length > 0 && (
                                    <div className="uploaded-images">
                                        {formData.images.map((image, index) => (
                                            <div key={index} className="uploaded-image-item">
                                                <img src={`${API_ENDPOINTS.BASE_URL || 'http://localhost:3000'}${image}`} alt={`Preview ${index + 1}`} />
                                                <button
                                                    type="button"
                                                    className="remove-image-btn"
                                                    onClick={() => handleRemoveImage(index)}
                                                    title="Remove image"
                                                >
                                                    <FaTimesCircle />
                                                </button>
                                            </div>
                                        ))}
                                    </div>
                                )}
                                {errors.images && <div className="error-message">{errors.images}</div>}
                            </div>

                            <div className="form-group">
                                <label>Date Completed <span className="required-star">*</span></label>
                                <input
                                    type="date"
                                    name="dateCompleted"
                                    value={formData.dateCompleted}
                                    onChange={handleInputChange}
                                    className={`form-control ${errors.dateCompleted ? 'input-error' : ''}`}
                                    max={new Date().toISOString().split('T')[0]}
                                />
                                {errors.dateCompleted && <div className="error-message">{errors.dateCompleted}</div>}
                            </div>
                            <div className="portfolio-modal-footer">
                                <button type="button" className="btn btn-secondary" onClick={handleCloseModal} disabled={submitting}>
                                    Cancel
                                </button>
                                <button type="submit" className="btn btn-primary" disabled={submitting}>
                                    {submitting ? 'Saving...' : (editingItem ? 'Update' : 'Add')}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Portfolio Details Modal */}
            {viewingItem && (
                <div className="portfolio-details-overlay" onClick={handleCloseDetails}>
                    <div className="portfolio-details-modal" onClick={(e) => e.stopPropagation()}>
                        <button className="details-close-btn" onClick={handleCloseDetails}>
                            <FaTimes />
                        </button>

                        {/* Image Slider */}
                        <div className="details-image-section">
                            <div className="details-image-slider">
                                <img
                                    src={`${API_ENDPOINTS.BASE_URL || 'http://localhost:3000'}${viewingItem.images[currentImageIndex]}`}
                                    alt={`${viewingItem.title} - Image ${currentImageIndex + 1}`}
                                    onClick={() => handleOpenFullscreen(viewingItem.images[currentImageIndex])}
                                    style={{ cursor: 'zoom-in' }}
                                />

                                {viewingItem.images.length > 1 && (
                                    <>
                                        <button className="slider-btn prev" onClick={handlePrevImage}>
                                            <FaChevronLeft />
                                        </button>
                                        <button className="slider-btn next" onClick={handleNextImage}>
                                            <FaChevronRight />
                                        </button>
                                        <div className="slider-indicators">
                                            {viewingItem.images.map((_, index) => (
                                                <span
                                                    key={index}
                                                    className={`indicator ${index === currentImageIndex ? 'active' : ''}`}
                                                    onClick={() => setCurrentImageIndex(index)}
                                                />
                                            ))}
                                        </div>
                                    </>
                                )}
                            </div>

                            {/* Image Thumbnails */}
                            {viewingItem.images.length > 1 && (
                                <div className="details-thumbnails">
                                    {viewingItem.images.map((image, index) => (
                                        <div
                                            key={index}
                                            className={`thumbnail ${index === currentImageIndex ? 'active' : ''}`}
                                            onClick={() => setCurrentImageIndex(index)}
                                        >
                                            <img
                                                src={`${API_ENDPOINTS.BASE_URL || 'http://localhost:3000'}${image}`}
                                                alt={`Thumbnail ${index + 1}`}
                                            />
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>

                        {/* Project Details */}
                        <div className="details-content-section">
                            <h2 className="details-title">{viewingItem.title}</h2>

                            <div className="details-meta">
                                <div className="meta-item">
                                    <FaCalendar />
                                    <span>{new Date(viewingItem.dateCompleted).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}</span>
                                </div>
                                <div className="meta-item">
                                    <FaEye />
                                    <span>{viewingItem.views || 0} views</span>
                                </div>
                                <div className="meta-item meta-item-likes">
                                    {!isOwn && (
                                        <FaHeart
                                            className={`like-icon ${token && viewingItem.likedBy?.some(id => String(id) === String(currentUserId)) ? 'liked' : ''}`}
                                            onClick={(e) => token ? handleLike(viewingItem, e) : toast.warning('Please login to like projects')}
                                            style={{ cursor: 'pointer' }}
                                            title={token ? (viewingItem.likedBy?.some(id => String(id) === String(currentUserId)) ? 'Unlike' : 'Like') : 'Login to like'}
                                        />
                                    )}
                                    {isOwn && <FaHeart className="like-icon" />}
                                    <span
                                        className="likes-count"
                                        onClick={(e) => handleShowLikes(viewingItem, e)}
                                        style={{ cursor: 'pointer', textDecoration: 'underline' }}
                                        title="Show who liked this"
                                    >
                                        {viewingItem.likes || 0} likes
                                    </span>
                                </div>
                            </div>

                            <div className="details-description">
                                <h3>Description</h3>
                                <p>{viewingItem.description}</p>
                            </div>

                            {viewingItem.skills && viewingItem.skills.length > 0 && (
                                <div className="details-skills">
                                    <h3>Technologies Used</h3>
                                    <div className="skills-list">
                                        {viewingItem.skills.map((skill, index) => (
                                            <span key={skill._id || skill.name || `skill-${index}`} className="skill-badge">
                                                {typeof skill === 'object' ? skill.name : skill}
                                            </span>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {(viewingItem.githubUrl || viewingItem.liveUrl) && (
                                <div className="details-links">
                                    <h3>Project Links</h3>
                                    <div className="links-buttons">
                                        {viewingItem.githubUrl && (
                                            <a
                                                href={viewingItem.githubUrl}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="detail-link-btn github"
                                            >
                                                <FaGithub /> View Source Code
                                            </a>
                                        )}
                                        {viewingItem.liveUrl && (
                                            <a
                                                href={viewingItem.liveUrl}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="detail-link-btn live"
                                            >
                                                <FaGlobe /> View Live Site
                                            </a>
                                        )}
                                    </div>
                                </div>
                            )}

                            {isOwn && (
                                <div className="details-actions">
                                    <button
                                        className="btn btn-secondary"
                                        onClick={() => {
                                            handleCloseDetails();
                                            handleOpenModal(viewingItem);
                                        }}
                                    >
                                        <FaEdit /> Edit Project
                                    </button>
                                    <button
                                        className="btn btn-danger"
                                        onClick={() => {
                                            handleCloseDetails();
                                            handleDelete(viewingItem._id);
                                        }}
                                    >
                                        <FaTrash /> Delete Project
                                    </button>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            )}

            {/* Fullscreen Image Viewer */}
            {fullscreenImage && (
                <div className="fullscreen-image-overlay" onClick={handleCloseFullscreen}>
                    <button className="fullscreen-close-btn" onClick={handleCloseFullscreen}>
                        <FaTimes />
                    </button>
                    <img
                        src={`${API_ENDPOINTS.BASE_URL || 'http://localhost:3000'}${fullscreenImage}`}
                        alt="Fullscreen view"
                        onClick={(e) => e.stopPropagation()}
                    />
                </div>
            )}

            {/* Likes Users Modal */}
            {showLikesModal && (
                <div className="likes-modal-overlay" onClick={() => setShowLikesModal(false)}>
                    <div className="likes-modal" onClick={(e) => e.stopPropagation()}>
                        <div className="likes-modal-header">
                            <h3>Liked by {likesUsers.length} {likesUsers.length === 1 ? 'user' : 'users'}</h3>
                            <button className="close-btn" onClick={() => setShowLikesModal(false)}>
                                <FaTimes />
                            </button>
                        </div>
                        <div className="likes-modal-body">
                            {likesUsers.length > 0 ? (
                                likesUsers.map((user) => {
                                    if (!user) return null;

                                    // Build image URL
                                    let imageUrl;
                                    if (user.profile_picture_url) {
                                        // If URL starts with http or https, use as is
                                        if (user.profile_picture_url.startsWith('http')) {
                                            imageUrl = user.profile_picture_url;
                                        } else {
                                            // Otherwise, prepend base URL
                                            const baseUrl = API_ENDPOINTS.BASE_URL || 'http://localhost:3000';
                                            imageUrl = user.profile_picture_url.startsWith('/')
                                                ? `${baseUrl}${user.profile_picture_url}`
                                                : `${baseUrl}/${user.profile_picture_url}`;
                                        }
                                    } else {
                                        // Default placeholder with green color
                                        imageUrl = 'https://via.placeholder.com/46/28a745/ffffff?text=' + (user.username?.[0]?.toUpperCase() || 'U');
                                    }

                                    return (
                                        <div
                                            key={user._id || user.id}
                                            className="like-user-item"
                                            onClick={() => handleUserClick(user._id || user.id)}
                                        >
                                            <img
                                                src={imageUrl}
                                                alt={user.username || 'User'}
                                                className="like-user-avatar"
                                                onError={(e) => {
                                                    e.target.onerror = null;
                                                    e.target.src = 'https://via.placeholder.com/46/28a745/ffffff?text=' + (user.username?.[0]?.toUpperCase() || 'U');
                                                }}
                                            />
                                            <div className="like-user-info">
                                                <span className="like-user-name">
                                                    {user.first_name && user.last_name
                                                        ? `${user.first_name} ${user.last_name}`
                                                        : user.username || 'Unknown User'}
                                                </span>
                                                <span className="like-user-username">@{user.username || 'unknown'}</span>
                                            </div>
                                        </div>
                                    );
                                })
                            ) : (
                                <div style={{ padding: '20px', textAlign: 'center', color: '#6c757d' }}>
                                    No users found
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default PortfolioTab;
