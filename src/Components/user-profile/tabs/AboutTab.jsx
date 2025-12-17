import React, { useEffect, useMemo, useState, useRef } from 'react';
import './AboutTab.css';
import { useDispatch, useSelector } from 'react-redux';
import { updateAboutMe, updateSkills } from '../../../Services/Profile/ProfileSlice';
import { API_ENDPOINTS } from '../../../Services/config';
import storage from '../../../Services/storage';
import { FaChevronDown } from 'react-icons/fa';

const AboutTab = ({ userData, isOwn, isEditMode }) => {
    const dispatch = useDispatch();
    const { updating } = useSelector((state) => state.profile);
    const [isEditingAbout, setIsEditingAbout] = useState(false);
    const [aboutText, setAboutText] = useState('');
    const [isEditingSkills, setIsEditingSkills] = useState(false);
    const [allSkills, setAllSkills] = useState([]);
    const [selectedSkillIds, setSelectedSkillIds] = useState([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [isDropdownOpen, setIsDropdownOpen] = useState(false);
    const dropdownRef = useRef(null);

    // Auto-enable editing when in edit mode
    useEffect(() => {
        if (isEditMode && !isEditingAbout) {
            setIsEditingAbout(true);
        }
    }, [isEditMode, isEditingAbout]);

    if (!userData) {
        return <div className="about-tab">Loading...</div>
    }

    useEffect(() => {
        setAboutText(userData.aboutMe || '');

        // Extract skill IDs - skills are now direct ObjectIds, not nested objects
        const currentSkillIds = (userData.skills || []).map(skill => {
            // If skill is populated (object with _id), get the _id
            if (typeof skill === 'object' && skill._id) {
                return skill._id;
            }
            // If skill is just an ID string
            return skill;
        }).filter(Boolean);

        setSelectedSkillIds(currentSkillIds);
    }, [userData]);

    useEffect(() => {
        // Load all skills for selection when editing
        if (isEditingSkills) {
            const token = storage.get('token');
            fetch(API_ENDPOINTS.SKILLS_ALL, {
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }
            })
                .then(response => response.json())
                .then(data => {
                    const skills = Array.isArray(data) ? data : (data.skills || []);
                    setAllSkills(skills);
                })
                .catch(() => setAllSkills([]));
        }
    }, [isEditingSkills]);

    // Close dropdown when clicking outside
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
                setIsDropdownOpen(false);
            }
        };

        if (isEditingSkills) {
            document.addEventListener('mousedown', handleClickOutside);
            return () => {
                document.removeEventListener('mousedown', handleClickOutside);
            };
        }
    }, [isEditingSkills]);

    const onSaveAbout = () => {
        dispatch(updateAboutMe(aboutText)).then(() => setIsEditingAbout(false));
    };

    const onSaveSkills = () => {
        dispatch(updateSkills(selectedSkillIds)).then(() => {
            setIsEditingSkills(false);
            setSearchTerm('');
            setIsDropdownOpen(false);
        });
    };

    const handleSkillAdd = (skillId) => {
        if (skillId && !selectedSkillIds.includes(skillId)) {
            setSelectedSkillIds(prev => [...prev, skillId]);
        }
        setSearchTerm('');
        setIsDropdownOpen(false);
    };

    const handleSkillRemove = (skillIdToRemove) => {
        setSelectedSkillIds(prev => prev.filter(id => id !== skillIdToRemove));
    };

    const handleSearchChange = (e) => {
        setSearchTerm(e.target.value);
        setIsDropdownOpen(true);
    };

    // Filter skills based on search term
    const filteredSkills = searchTerm
        ? allSkills.filter(skill =>
            skill.name.toLowerCase().includes(searchTerm.toLowerCase()) &&
            !selectedSkillIds.includes(skill._id)
        )
        : allSkills.filter(skill => !selectedSkillIds.includes(skill._id));

    const selectedSkillObjects = allSkills.filter(skill =>
        selectedSkillIds.includes(skill._id)
    );

    return (
        <div className="about-tab">
            {/* About Me Section */}
            <section className="about-section">
                <h3 className="section-title">About Me</h3>
                {!isEditingAbout ? (
                    <>
                        <p className="about-text">{userData.aboutMe || 'No information provided yet.'}</p>
                        {isOwn && (
                            <button className="edit-btn" onClick={() => setIsEditingAbout(true)}>Edit</button>
                        )}
                    </>
                ) : (
                    <div className="about-edit">
                        <textarea
                            value={aboutText}
                            onChange={(e) => setAboutText(e.target.value)}
                            rows={6}
                            className="about-textarea"
                            placeholder="Tell clients about your experience, strengths, and goals"
                        />
                        <div className="edit-actions">
                            <button className="save-btn" onClick={onSaveAbout} disabled={updating}>Save</button>
                            <button className="cancel-btn" onClick={() => setIsEditingAbout(false)} disabled={updating}>Cancel</button>
                        </div>
                    </div>
                )}
            </section>

            {/* Professional Goals Section */}
            {userData.goals && (
                <section className="about-section">
                    <h3 className="section-title">Professional Goals</h3>
                    <p className="about-text">{userData.goals}</p>
                </section>
            )}

            {/* Skills Section */}
            <section className="about-section">
                <h3 className="section-title">Skills</h3>
                {Array.isArray(userData.skills) && userData.skills.length > 0 ? (
                    <>
                        <div className="skills-container">
                            {userData.skills.map((skill, index) => {
                                // Skills are now direct ObjectIds that get populated to skill objects
                                const skillName = typeof skill === 'object' ? skill.name : skill;
                                const skillId = typeof skill === 'object' ? skill._id : skill;

                                return skillName ? (
                                    <span key={skillId || `skill-${index}`} className="skill-tag">
                                        {skillName}
                                    </span>
                                ) : null;
                            })}
                        </div>
                        {isOwn && (
                            <button className="edit-btn" onClick={() => setIsEditingSkills(true)}>Edit Skills</button>
                        )}
                    </>
                ) : (
                    <>
                        <p className="about-text">No skills added yet.</p>
                        {isOwn && (
                            <button className="edit-btn" onClick={() => setIsEditingSkills(true)}>Add Skills</button>
                        )}
                    </>
                )}
            </section>

            {/* Edit Skills Section */}
            {isOwn && isEditingSkills && (
                <section className="about-section">
                    <h3 className="section-title">Edit Skills</h3>
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
                                ? 'Add at least 1 skill'
                                : `${selectedSkillObjects.length} skill${selectedSkillObjects.length > 1 ? 's' : ''} selected`
                            }
                        </small>

                        <div className="edit-actions">
                            <button className="save-btn" onClick={onSaveSkills} disabled={updating || selectedSkillObjects.length === 0}>
                                Save
                            </button>
                            <button className="cancel-btn" onClick={() => {
                                setIsEditingSkills(false);
                                setSearchTerm('');
                                setIsDropdownOpen(false);
                            }} disabled={updating}>
                                Cancel
                            </button>
                        </div>
                    </div>
                </section>
            )}
        </div>
    );
};

export default AboutTab;
