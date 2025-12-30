import React, { useState, useEffect } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { toast } from 'react-toastify'
import { parseCV, clearCVData, updateBasicInfo, fetchMyProfile } from '../../Services/Profile/ProfileSlice'
import { setUser } from '../../Services/Authentication/AuthSlice'
import storage from '../../Services/storage'
import { FaFileUpload, FaTimes, FaCheckCircle, FaSpinner, FaFilePdf } from 'react-icons/fa'
import './CVUploadModal.css'

const CVUploadModal = ({ isOpen, onClose, onCVDataExtracted }) => {
    const dispatch = useDispatch()
    const { parseCVLoading, cvData, error, updating } = useSelector((state) => state.profile)
    const { user } = useSelector((state) => state.auth)
    const [selectedFile, setSelectedFile] = useState(null)
    const [isDragging, setIsDragging] = useState(false)

    useEffect(() => {
        if (cvData && !updating) {
            // Log CV data for debugging
            console.log('✅ CV Data Received:', cvData);
            console.log('📄 Full Name:', cvData.fullName);
            console.log('📧 Email:', cvData.email);
            console.log('📱 Phone:', cvData.phone);
            console.log('💼 Skills:', cvData.skills);
            console.log('📝 Summary:', cvData.summary);
            
            // Auto-update profile with CV data
            updateProfileWithCVData(cvData)
        }
    }, [cvData])

    useEffect(() => {
        if (error && !parseCVLoading) {
            toast.error(error)
        }
    }, [error, parseCVLoading])

    const updateProfileWithCVData = async (cvData) => {
        try {
            console.log('🔄 Starting profile update with CV data...');
            
            // Parse fullName into first_name and last_name
            let firstName = user?.first_name || ''
            let lastName = user?.last_name || ''
            
            if (cvData.fullName) {
                const nameParts = cvData.fullName.trim().split(' ')
                if (nameParts.length >= 2) {
                    firstName = nameParts[0]
                    lastName = nameParts.slice(1).join(' ')
                } else if (nameParts.length === 1) {
                    firstName = nameParts[0]
                }
                console.log('👤 Parsed Name - First:', firstName, 'Last:', lastName);
            }

            // Create aboutMe from summary or skills
            let aboutMe = user?.aboutMe || ''
            if (cvData.summary) {
                aboutMe = cvData.summary
            } else if (cvData.skills && Array.isArray(cvData.skills) && cvData.skills.length > 0) {
                aboutMe = `Experienced professional with expertise in ${cvData.skills.slice(0, 5).join(', ')}.`
            }

            // Prepare update data
            const updateData = {
                first_name: firstName,
                last_name: lastName,
                phone_number: cvData.phone || user?.phone_number,
                aboutMe: aboutMe
            }

            console.log('📦 Update Data to be sent:', updateData);

            // Don't update email as it's usually unique and verified
            // Email can only be viewed but not changed

            // Dispatch update action
            const result = await dispatch(updateBasicInfo(updateData))
            console.log('🔄 Update Result:', result);

            if (result.type === 'profile/updateBasicInfo/fulfilled') {
                console.log('✅ Profile update successful!');
                
                // Update auth user state
                const updatedUser = { ...user, ...updateData }
                dispatch(setUser(updatedUser))
                storage.setJSON('user', updatedUser)

                // Refresh profile to get latest data
                await dispatch(fetchMyProfile())

                toast.success('Profile updated successfully with CV data!')
                
                // Notify parent if needed
                if (onCVDataExtracted) {
                    onCVDataExtracted(cvData)
                }

                // Close modal and reload page to show changes
                handleClose()
                
                // Force page reload to show updated data
                setTimeout(() => {
                    console.log('🔄 Reloading page to show updated data...');
                    window.location.reload()
                }, 500)
            } else {
                console.error('❌ Profile update failed:', result);
                toast.error('Failed to update profile with CV data')
            }
        } catch (error) {
            console.error('❌ Error updating profile:', error)
            toast.error('Failed to update profile with CV data')
        }
    }

    const handleClose = () => {
        setSelectedFile(null)
        dispatch(clearCVData())
        onClose()
    }

    const handleFileSelect = (file) => {
        // Validate file type
        if (file.type !== 'application/pdf') {
            toast.error('Only PDF files are supported')
            return
        }

        // Validate file size (max 10MB)
        if (file.size > 10 * 1024 * 1024) {
            toast.error('File size must be less than 10MB')
            return
        }

        setSelectedFile(file)
    }

    const handleFileChange = (e) => {
        const file = e.target.files[0]
        if (file) {
            handleFileSelect(file)
        }
    }

    const handleDragOver = (e) => {
        e.preventDefault()
        setIsDragging(true)
    }

    const handleDragLeave = (e) => {
        e.preventDefault()
        setIsDragging(false)
    }

    const handleDrop = (e) => {
        e.preventDefault()
        setIsDragging(false)
        const file = e.dataTransfer.files[0]
        if (file) {
            handleFileSelect(file)
        }
    }

    const handleUpload = async () => {
        if (!selectedFile) {
            toast.error('Please select a CV file first')
            return
        }

        await dispatch(parseCV(selectedFile))
    }

    const formatFileSize = (bytes) => {
        if (bytes < 1024) return bytes + ' B'
        if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(2) + ' KB'
        return (bytes / (1024 * 1024)).toFixed(2) + ' MB'
    }

    if (!isOpen) return null

    return (
        <div className="cv-upload-modal-overlay" onClick={handleClose}>
            <div className="cv-upload-modal-content" onClick={(e) => e.stopPropagation()}>
                <div className="cv-upload-modal-header">
                    <h2>Upload Your CV</h2>
                    <button className="cv-upload-modal-close" onClick={handleClose} disabled={parseCVLoading}>
                        <FaTimes />
                    </button>
                </div>

                <div className="cv-upload-modal-body">
                    <p className="cv-upload-description">
                        Upload your CV (PDF format) and we'll automatically extract your information to fill your profile.
                    </p>

                    <div
                        className={`cv-upload-dropzone ${isDragging ? 'dragging' : ''} ${selectedFile ? 'has-file' : ''}`}
                        onDragOver={handleDragOver}
                        onDragLeave={handleDragLeave}
                        onDrop={handleDrop}
                        onClick={() => !selectedFile && document.getElementById('cv-file-input').click()}
                    >
                        {!selectedFile ? (
                            <>
                                <FaFileUpload className="cv-upload-icon" />
                                <p className="cv-upload-text">
                                    Drag & drop your CV here, or click to browse
                                </p>
                                <p className="cv-upload-hint">PDF files only (Max 10MB)</p>
                            </>
                        ) : (
                            <div className="cv-upload-file-info">
                                <FaFilePdf className="cv-file-icon" />
                                <div className="cv-file-details">
                                    <p className="cv-file-name">{selectedFile.name}</p>
                                    <p className="cv-file-size">{formatFileSize(selectedFile.size)}</p>
                                </div>
                                {!parseCVLoading && (
                                    <button
                                        className="cv-file-remove"
                                        onClick={(e) => {
                                            e.stopPropagation()
                                            setSelectedFile(null)
                                        }}
                                    >
                                        <FaTimes />
                                    </button>
                                )}
                            </div>
                        )}
                    </div>

                    <input
                        id="cv-file-input"
                        type="file"
                        accept=".pdf,application/pdf"
                        onChange={handleFileChange}
                        style={{ display: 'none' }}
                        disabled={parseCVLoading}
                    />

                    {parseCVLoading && (
                        <div className="cv-upload-loading">
                            <FaSpinner className="cv-loading-spinner" />
                            <p>Analyzing your CV... This may take a few moments.</p>
                        </div>
                    )}

                    {updating && (
                        <div className="cv-upload-loading">
                            <FaSpinner className="cv-loading-spinner" />
                            <p>Updating your profile with CV data...</p>
                        </div>
                    )}
                </div>

                <div className="cv-upload-modal-footer">
                    <button
                        className="cv-upload-btn-cancel"
                        onClick={handleClose}
                        disabled={parseCVLoading || updating}
                    >
                        Cancel
                    </button>
                    <button
                        className="cv-upload-btn-upload"
                        onClick={handleUpload}
                        disabled={!selectedFile || parseCVLoading || updating}
                    >
                        {parseCVLoading || updating ? (
                            <>
                                <FaSpinner className="btn-spinner" />
                                {parseCVLoading ? 'Processing...' : 'Updating...'}
                            </>
                        ) : (
                            <>
                                <FaCheckCircle />
                                Parse & Update CV
                            </>
                        )}
                    </button>
                </div>
            </div>
        </div>
    )
}

export default CVUploadModal
