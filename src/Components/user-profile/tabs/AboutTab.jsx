import React, { useEffect, useMemo, useState } from 'react';
import './AboutTab.css';
import { useDispatch, useSelector } from 'react-redux';
import { updateAboutMe, updateSkills } from '../../../Services/Profile/ProfileSlice';
import { API_ENDPOINTS } from '../../../Services/config';
import storage from '../../../Services/storage';

const AboutTab = ({ userData, isOwn }) => {
    const dispatch = useDispatch();
    const { updating } = useSelector((state) => state.profile);
    const [isEditingAbout, setIsEditingAbout] = useState(false);
    const [aboutText, setAboutText] = useState('');
    const [isEditingSkills, setIsEditingSkills] = useState(false);
    const [allSkills, setAllSkills] = useState([]);
    const [selectedSkillIds, setSelectedSkillIds] = useState([]);

    if (!userData) {
        return <div className="about-tab">Loading...</div>
    }

    useEffect(() => {
        setAboutText(userData.aboutMe || userData.about || '');
        const currentSkillIds = (userData.skills || []).map(s => s.skillId?._id || s._id).filter(Boolean);
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
                .then(r => r.json())
                .then(data => {
                    // handle both array or {skills}
                    const skills = Array.isArray(data) ? data : (data.skills || []);
                    setAllSkills(skills);
                })
                .catch(() => setAllSkills([]));
        }
    }, [isEditingSkills]);

    const onSaveAbout = () => {
        dispatch(updateAboutMe(aboutText)).then(() => setIsEditingAbout(false));
    };

    const onSaveSkills = () => {
        dispatch(updateSkills(selectedSkillIds)).then(() => setIsEditingSkills(false));
    };

    return (
        <div className="about-tab">
            {/* About Me Section */}
            <section className="about-section">
                <h3 className="section-title">About Me</h3>
                {!isEditingAbout ? (
                    <>
                        <p className="about-text">{userData.aboutMe || userData.about || 'No information provided yet.'}</p>
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
            {userData.skills && userData.skills.length > 0 && (
                <section className="about-section">
                    <h3 className="section-title">Skills</h3>
                    <div className="skills-container">
                        {userData.skills.map((skill, index) => (
                            <span key={skill._id || skill.skillId?._id || skill.name || `skill-${index}`} className="skill-tag">
                                {typeof skill === 'string' ? skill : skill.name || skill.skillId?.name}
                            </span>
                        ))}
                    </div>
                    {isOwn && (
                        <button className="edit-btn" onClick={() => setIsEditingSkills(true)}>Edit Skills</button>
                    )}
                </section>
            )}

            {/* Edit Skills Modal/Inline */}
            {isOwn && isEditingSkills && (
                <section className="about-section">
                    <h3 className="section-title">Edit Skills</h3>
                    <div className="skills-edit-list">
                        <div className="skills-list">
                            {allSkills.map(skill => (
                                <label key={skill._id} className="skill-select-item">
                                    <input
                                        type="checkbox"
                                        checked={selectedSkillIds.includes(skill._id)}
                                        onChange={(e) => {
                                            const checked = e.target.checked;
                                            setSelectedSkillIds(prev => {
                                                if (checked) return [...prev, skill._id];
                                                return prev.filter(id => id !== skill._id);
                                            });
                                        }}
                                    />
                                    <span>{skill.name}</span>
                                </label>
                            ))}
                        </div>
                        <div className="edit-actions">
                            <button className="save-btn" onClick={onSaveSkills} disabled={updating}>Save</button>
                            <button className="cancel-btn" onClick={() => setIsEditingSkills(false)} disabled={updating}>Cancel</button>
                        </div>
                    </div>
                </section>
            )}

            {/* Category & Specialty */}
            {(userData.category || userData.specialty) && (
                <section className="about-section">
                    <h3 className="section-title">Specialization</h3>
                    <div className="specialization-info">
                        {userData.category && (
                            <p><strong>Category:</strong> {userData.category.name || userData.category}</p>
                        )}
                        {userData.specialty && (
                            <p><strong>Specialty:</strong> {userData.specialty.name || userData.specialty}</p>
                        )}
                    </div>
                </section>
            )}
        </div>
    );
};

export default AboutTab;
