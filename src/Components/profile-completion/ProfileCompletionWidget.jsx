import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { getProfileCompletion } from '../../Services/Profile/ProfileSlice';
import { FaCheckCircle, FaTimesCircle, FaLightbulb } from 'react-icons/fa';
import './ProfileCompletion.css';

const ProfileCompletionWidget = () => {
    const dispatch = useDispatch();
    const { completion, loading } = useSelector((state) => state.profile);
    const { percentage, missingFields, suggestions } = completion;

    useEffect(() => {
        dispatch(getProfileCompletion());
    }, [dispatch]);

    if (loading) {
        return (
            <div className="profile-completion-widget loading">
                <div className="spinner-sm"></div>
            </div>
        );
    }

    const getCompletionColor = () => {
        if (percentage >= 80) return '#22c55e';
        if (percentage >= 50) return '#f59e0b';
        return '#ef4444';
    };

    const getCompletionStatus = () => {
        if (percentage === 100) return 'Complete!';
        if (percentage >= 80) return 'Almost there!';
        if (percentage >= 50) return 'Good progress';
        return 'Just started';
    };

    return (
        <div className="profile-completion-widget">
            <div className="completion-header">
                <h4>Profile Completion</h4>
                <span 
                    className="completion-percentage"
                    style={{ color: getCompletionColor() }}
                >
                    {percentage}%
                </span>
            </div>

            <div className="progress-bar-container">
                <div 
                    className="progress-bar-fill"
                    style={{ 
                        width: `${percentage}%`,
                        backgroundColor: getCompletionColor()
                    }}
                >
                    <span className="progress-status">{getCompletionStatus()}</span>
                </div>
            </div>

            {percentage < 100 && (
                <>
                    {missingFields && missingFields.length > 0 && (
                        <div className="missing-fields">
                            <h5><FaTimesCircle /> Missing Information</h5>
                            <ul>
                                {missingFields.map((field, index) => (
                                    <li key={`missing-${index}`}>{field}</li>
                                ))}
                            </ul>
                        </div>
                    )}

                    {suggestions && suggestions.length > 0 && (
                        <div className="completion-suggestions">
                            <h5><FaLightbulb /> Suggestions</h5>
                            <ul>
                                {suggestions.map((suggestion, index) => (
                                    <li key={`suggestion-${index}`}>{suggestion}</li>
                                ))}
                            </ul>
                        </div>
                    )}
                </>
            )}

            {percentage === 100 && (
                <div className="completion-success">
                    <FaCheckCircle /> Your profile is 100% complete!
                </div>
            )}
        </div>
    );
};

export default ProfileCompletionWidget;
