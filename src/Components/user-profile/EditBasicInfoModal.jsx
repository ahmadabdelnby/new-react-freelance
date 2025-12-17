import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { FaTimes, FaEye, FaEyeSlash } from 'react-icons/fa';
import { updateBasicInfo } from '../../Services/Profile/ProfileSlice';
import SearchableCountrySelect from '../common/SearchableCountrySelect.jsx';
import './EditBasicInfoModal.css';

const EditBasicInfoModal = ({ isOpen, onClose, userData }) => {
    const dispatch = useDispatch();
    const { updating } = useSelector((state) => state.profile);
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const [showPasswordFields, setShowPasswordFields] = useState(false);
    const [categories, setCategories] = useState([]);

    const [formData, setFormData] = useState({
        first_name: '',
        last_name: '',
        username: '',
        email: '',
        password: '',
        confirmPassword: '',
        phone_number: '',
        gender: '',
        country: '',
        category: ''
    });

    useEffect(() => {
        if (userData) {
            setFormData({
                first_name: userData.first_name || '',
                last_name: userData.last_name || '',
                username: userData.username || '',
                email: userData.email || '',
                password: '',
                confirmPassword: '',
                phone_number: userData.phone_number || '',
                gender: userData.gender || '',
                country: userData.country || '',
                category: userData.category?._id || userData.category || ''
            });
        }
    }, [userData]);

    useEffect(() => {
        // Fetch categories
        const fetchCategories = async () => {
            try {
                const response = await fetch('http://localhost:3000/Freelancing/api/v1/categories');
                if (response.ok) {
                    const data = await response.json();
                    setCategories(data);
                }
            } catch (error) {
                console.error('Failed to fetch categories:', error);
            }
        };
        if (isOpen) {
            fetchCategories();
        }
    }, [isOpen]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        // Validate password if password fields are shown
        if (showPasswordFields) {
            if (!formData.password || !formData.confirmPassword) {
                alert('Please enter both password fields or cancel password change!');
                return;
            }
            if (formData.password !== formData.confirmPassword) {
                alert('Passwords do not match!');
                return;
            }
            if (formData.password.length < 8) {
                alert('Password must be at least 8 characters long!');
                return;
            }
        }

        // Build update payload
        const updateData = {
            first_name: formData.first_name,
            last_name: formData.last_name,
            phone_number: formData.phone_number,
            gender: formData.gender,
            country: formData.country,
            category: formData.category || null
        };

        // Only include password fields if user is changing password
        if (showPasswordFields && formData.password) {
            updateData.password = formData.password;
            updateData.confirmPassword = formData.confirmPassword;
        }

        try {
            await dispatch(updateBasicInfo(updateData)).unwrap();
            onClose();
            // Redux will automatically update the state, no need to reload
        } catch (error) {
            console.error('Failed to update profile:', error);
        }
    };

    if (!isOpen) return null;

    return (
        <div className="modal-overlay" onClick={onClose}>
            <div className="modal-content" onClick={(e) => e.stopPropagation()}>
                <div className="modal-header">
                    <h2>Edit Profile Information</h2>
                    <button className="close-btn" onClick={onClose}>
                        <FaTimes />
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="edit-form">
                    <div className="form-row">
                        <div className="form-group">
                            <label htmlFor="first_name">First Name *</label>
                            <input
                                type="text"
                                id="first_name"
                                name="first_name"
                                value={formData.first_name}
                                onChange={handleChange}
                                required
                                maxLength={100}
                            />
                        </div>

                        <div className="form-group">
                            <label htmlFor="last_name">Last Name *</label>
                            <input
                                type="text"
                                id="last_name"
                                name="last_name"
                                value={formData.last_name}
                                onChange={handleChange}
                                required
                                maxLength={100}
                            />
                        </div>
                    </div>

                    <div className="form-row">
                        <div className="form-group">
                            <label htmlFor="username">Username</label>
                            <input
                                type="text"
                                id="username"
                                name="username"
                                value={formData.username}
                                disabled
                                title="Username cannot be changed"
                            />
                        </div>

                        <div className="form-group">
                            <label htmlFor="email">Email</label>
                            <input
                                type="email"
                                id="email"
                                name="email"
                                value={formData.email}
                                disabled
                                title="Email cannot be changed"
                            />
                        </div>
                    </div>

                    {/* Change Password Button/Fields */}
                    {!showPasswordFields ? (
                        <button
                            type="button"
                            className="change-password-btn"
                            onClick={() => setShowPasswordFields(true)}
                        >
                            Change Password
                        </button>
                    ) : (
                        <>
                            <div className="password-section-header">
                                <h3>Change Password</h3>
                                <button
                                    type="button"
                                    className="cancel-password-btn"
                                    onClick={() => {
                                        setShowPasswordFields(false);
                                        setFormData(prev => ({
                                            ...prev,
                                            password: '',
                                            confirmPassword: ''
                                        }));
                                        setShowPassword(false);
                                        setShowConfirmPassword(false);
                                    }}
                                >
                                    Cancel
                                </button>
                            </div>

                            <div className="form-row">
                                <div className="form-group">
                                    <label htmlFor="password">New Password *</label>
                                    <div className="password-input-wrapper">
                                        <input
                                            type={showPassword ? 'text' : 'password'}
                                            id="password"
                                            name="password"
                                            value={formData.password}
                                            onChange={handleChange}
                                            placeholder="Enter new password (8+ characters)"
                                            minLength={8}
                                            required={showPasswordFields}
                                        />
                                        {formData.password && (
                                            <button
                                                type="button"
                                                className="password-toggle"
                                                onClick={() => setShowPassword(!showPassword)}
                                            >
                                                {showPassword ? <FaEyeSlash /> : <FaEye />}
                                            </button>
                                        )}
                                    </div>
                                </div>

                                <div className="form-group">
                                    <label htmlFor="confirmPassword">Confirm New Password *</label>
                                    <div className="password-input-wrapper">
                                        <input
                                            type={showConfirmPassword ? 'text' : 'password'}
                                            id="confirmPassword"
                                            name="confirmPassword"
                                            value={formData.confirmPassword}
                                            onChange={handleChange}
                                            placeholder="Confirm your new password"
                                            minLength={8}
                                            required={showPasswordFields}
                                        />
                                        {formData.confirmPassword && (
                                            <button
                                                type="button"
                                                className="password-toggle"
                                                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                            >
                                                {showConfirmPassword ? <FaEyeSlash /> : <FaEye />}
                                            </button>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </>
                    )}

                    <div className="form-row">
                        <div className="form-group">
                            <label htmlFor="phone_number">Phone Number *</label>
                            <input
                                type="tel"
                                id="phone_number"
                                name="phone_number"
                                value={formData.phone_number}
                                onChange={handleChange}
                                required
                                maxLength={20}
                            />
                        </div>

                        <div className="form-group">
                            <label htmlFor="gender">Gender *</label>
                            <select
                                id="gender"
                                name="gender"
                                value={formData.gender}
                                onChange={handleChange}
                                required
                            >
                                <option value="">Select Gender</option>
                                <option value="male">Male</option>
                                <option value="female">Female</option>
                            </select>
                        </div>
                    </div>

                    <div className="form-row">
                        <div className="form-group">
                            <label htmlFor="country">Country *</label>
                            <SearchableCountrySelect
                                name="country"
                                value={formData.country}
                                onChange={handleChange}
                                required
                            />
                        </div>

                        <div className="form-group">
                            <label htmlFor="category">Category</label>
                            <select
                                id="category"
                                name="category"
                                value={formData.category}
                                onChange={handleChange}
                            >
                                <option value="">Select Category</option>
                                {categories.map((cat) => (
                                    <option key={cat._id} value={cat._id}>
                                        {cat.name}
                                    </option>
                                ))}
                            </select>
                        </div>
                    </div>

                    <div className="form-actions">
                        <button
                            type="button"
                            className="cancel-btn"
                            onClick={onClose}
                            disabled={updating}
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            className="save-btn"
                            disabled={updating}
                        >
                            {updating ? 'Saving...' : 'Save Changes'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default EditBasicInfoModal;
