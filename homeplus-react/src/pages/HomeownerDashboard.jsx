import { useEffect, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import './HomeownerDashboard.css';
import { api } from "../api";
import { useAuthSession } from '../hooks/useAuthSession';

const HomeownerDashboard = () => {
  const navigate = useNavigate();
  const { session, isAuthenticated, hasRole, clearSession } = useAuthSession();
  const [propertyData, setPropertyData] = useState(null);
  const [userData, setUserData] = useState(null);
  const [homeownerHistory, setHomeownerHistory] = useState([]);
  const [activeTab, setActiveTab] = useState('overview');
  const [showProfileModal, setShowProfileModal] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [editFormData, setEditFormData] = useState({
    fullName: '',
    phone: ''
  });

  const mapPropertiesToHistory = (properties) => {
    const entries = [];

    properties.forEach((property) => {
      entries.push({
        id: `submission_${property.id}`,
        action: 'Submission',
        details: `Property details submitted for ${property.city || 'your location'}`,
        timestamp: property.submissionDate || new Date().toISOString(),
        propertyDetails: property,
      });

      if (property.adminEstimate) {
        entries.push({
          id: `estimate_${property.id}`,
          action: 'Estimate Received',
          details: `Your property has been estimated at ₹${Number(
            property.adminEstimate.estimatedNewValue || 0
          ).toLocaleString('en-IN')}`,
          timestamp: property.adminEstimate.estimatedDate || property.submissionDate || new Date().toISOString(),
          propertyDetails: property,
          estimateData: property.adminEstimate,
        });
      }
    });

    return entries.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
  };

  // Format property type for display
  const formatPropertyType = (type) => {
    if (!type) return 'Not specified';
    const typeMap = {
      'apartment': 'Apartment',
      'independent-house': 'Independent House',
      'villa': 'Villa',
      'plot': 'Plot'
    };
    return typeMap[type] || type;
  };

  const getImprovementsList = (property) => {
    if (!property) return [];

    if (Array.isArray(property.improvements)) {
      return property.improvements.filter(Boolean);
    }

    if (typeof property.improvements === 'string' && property.improvements.trim()) {
      return property.improvements
        .split(/[|,]/)
        .map((item) => item.trim())
        .filter(Boolean);
    }

    if (property.adminEstimate?.improvementCosts && typeof property.adminEstimate.improvementCosts === 'object') {
      return Object.keys(property.adminEstimate.improvementCosts).filter(Boolean);
    }

    return [];
  };

  useEffect(() => {
    if (!isAuthenticated || !hasRole('homeowner')) {
      navigate('/login?type=homeowner');
      return;
    }

    if (session.userData) {
      const savedProfile = JSON.parse(localStorage.getItem(`profile_${(session.userEmail || '').toLowerCase()}`) || '{}');
      const savedPhoneByEmail = localStorage.getItem(`phone_${(session.userEmail || '').toLowerCase()}`) || '';
      setUserData({
        ...session.userData,
        fullName: session.userData.fullName || savedProfile.fullName || localStorage.getItem('userName') || '',
        phone: session.userData.phone || savedProfile.phone || savedPhoneByEmail || localStorage.getItem('userPhone') || ''
      });
    }

    // Load property data (per user email)
    const userEmail = session.userEmail;
    const userPropertyData = localStorage.getItem(`propertyData_${userEmail}`);
    if (userPropertyData) {
      setPropertyData(JSON.parse(userPropertyData));
    } else {
      // Fallback to generic propertyData
      const data = localStorage.getItem('propertyData');
      if (data) {
        setPropertyData(JSON.parse(data));
      }
    }

    if (userEmail) {
      api.getUserProperties(userEmail)
        .then((data) => {
          if (Array.isArray(data) && data.length > 0) {
            const sorted = [...data].sort((a, b) => {
              return new Date(b.submissionDate || 0) - new Date(a.submissionDate || 0);
            });
            const latest = sorted[0];
            const fallbackDataRaw = localStorage.getItem(`propertyData_${userEmail}`) || localStorage.getItem('propertyData');
            let fallbackData = null;
            if (fallbackDataRaw) {
              try {
                fallbackData = JSON.parse(fallbackDataRaw);
              } catch {
                fallbackData = null;
              }
            }

            const fallbackImprovements = Array.isArray(fallbackData?.improvements)
              ? fallbackData.improvements
              : [];

            const historyData = JSON.parse(localStorage.getItem(`homeownerHistory_${userEmail}`) || '[]');
            const latestSubmission = historyData.find((entry) => entry?.action === 'Submission');
            const historyImprovements = Array.isArray(latestSubmission?.propertyDetails?.improvements)
              ? latestSubmission.propertyDetails.improvements
              : [];

            setPropertyData({
              ...latest,
              improvements:
                getImprovementsList(latest).length > 0
                  ? latest.improvements
                  : (fallbackImprovements.length > 0 ? fallbackImprovements : historyImprovements),
            });
          }
        })
        .catch(() => {
          // Keep UI usable if API call fails.
        });
    }

    if (userEmail) {
      api.getUserPropertyHistory(userEmail)
        .then((data) => {
          if (Array.isArray(data) && data.length > 0) {
            setHomeownerHistory(data);
          }
        })
        .catch(() => {
          if (userEmail) {
            const data = localStorage.getItem(`propertyData_${userEmail}`) || localStorage.getItem('propertyData');
            if (data) {
              try {
                const parsed = JSON.parse(data);
                const list = Array.isArray(parsed) ? parsed : [parsed];
                setHomeownerHistory(mapPropertiesToHistory(list));
              } catch {
                // Ignore malformed fallback data.
              }
            }
          }
        });
    }

    // Fallback history only when API data is unavailable.
    if (userEmail) {
      const history = JSON.parse(localStorage.getItem(`homeownerHistory_${userEmail}`) || '[]');
      if (history.length > 0) {
        setHomeownerHistory((current) => (current.length > 0 ? current : history));
      }
    }
  }, [navigate, isAuthenticated, hasRole, session.userData, session.userEmail]);

  const handleLogout = () => {
    api.logout();
    clearSession();
    navigate('/');
  };

  const handleEditClick = () => {
    setEditFormData({
      fullName: userData?.fullName || localStorage.getItem('userName') || '',
      phone:
        userData?.phone ||
        localStorage.getItem(`phone_${(session.userEmail || '').toLowerCase()}`) ||
        localStorage.getItem('userPhone') ||
        ''
    });
    setIsEditMode(true);
  };

  const handleEditChange = (e) => {
    const { name, value } = e.target;
    setEditFormData((prev) => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSaveProfile = () => {
    if (!editFormData.fullName.trim()) {
      alert('Full name is required');
      return;
    }

    const updatedUserData = {
      ...(userData || {}),
      fullName: editFormData.fullName.trim(),
      phone: editFormData.phone.trim()
    };

    setUserData(updatedUserData);
    localStorage.setItem('userName', updatedUserData.fullName);
    localStorage.setItem('userPhone', updatedUserData.phone);
    if (session.userEmail) {
      localStorage.setItem(`phone_${session.userEmail.toLowerCase()}`, updatedUserData.phone);
    }
    localStorage.setItem('userData', JSON.stringify(updatedUserData));

    if (session.userEmail) {
      localStorage.setItem(
        `profile_${session.userEmail.toLowerCase()}`,
        JSON.stringify({
          fullName: updatedUserData.fullName,
          phone: updatedUserData.phone,
          role: 'HOMEOWNER'
        })
      );
    }

    setIsEditMode(false);
    alert('Profile updated successfully');
  };

  const handleCancelEdit = () => {
    setIsEditMode(false);
  };

  const getStatusMessage = () => {
    if (propertyData?.adminEstimate || propertyData?.status === 'Estimated') {
      return { text: 'Estimate Received', class: 'status-estimated' };
    } else if (propertyData?.status === 'Approved') {
      return { text: 'Approved - Awaiting Estimate', class: 'status-approved' };
    } else if (propertyData?.status === 'Rejected') {
      return { text: 'Rejected', class: 'status-rejected' };
    } else {
      return { text: 'Pending Review', class: 'status-pending' };
    }
  };

  return (
    <div className="dashboard-page">
      <nav>
        <Link to="/" className="logo">HomePlus</Link>
        <div className="user-info">
          <button className="profile-btn" onClick={() => setShowProfileModal(true)}>👤 Profile</button>
          <span>Welcome, {userData?.fullName || localStorage.getItem('userName') || 'Homeowner'}</span>
          <button className="history-nav-btn" onClick={() => setActiveTab('history')}>📜 History</button>
          <button className="logout-btn" onClick={handleLogout}>Logout</button>
        </div>
      </nav>

      <div className="dashboard-container">
        <h1>My Dashboard</h1>
        <p className="subtitle">Track your property improvement journey</p>

        {propertyData && (
          <div className={`submission-status ${getStatusMessage().class}`}>
            <span className="status-label">Submission Status:</span>
            <span className="status-value">{getStatusMessage().text}</span>
          </div>
        )}

        {propertyData?.adminEstimate && (
          <div className="estimate-notification">
            <strong>Your property is estimated.</strong>
            <span>
              Estimated New Value: ₹{Number(propertyData.adminEstimate.estimatedNewValue || 0).toLocaleString('en-IN')}
            </span>
            <span>
              Total Improvement Cost: ₹{Number(propertyData.adminEstimate.totalCost || 0).toLocaleString('en-IN')}
            </span>
          </div>
        )}

        <div className="tabs-container">
          <button 
            className={`tab-btn ${activeTab === 'overview' ? 'active' : ''}`}
            onClick={() => setActiveTab('overview')}
          >
            📊 Overview
          </button>
          <button 
            className={`tab-btn ${activeTab === 'history' ? 'active' : ''}`}
            onClick={() => setActiveTab('history')}
          >
            📜 History
          </button>
        </div>

        {activeTab === 'overview' && (
          <>
            <div className="stats-grid primary-stats">
              <div className="stat-card">
                <div className="stat-icon">🏠</div>
                <h3>Property Type</h3>
                <p>{formatPropertyType(propertyData?.propertyType)}</p>
              </div>
              <div className="stat-card">
                <div className="stat-icon">💰</div>
                <h3>Property Value</h3>
                <p>{propertyData?.propertyValue ? `₹${Number(propertyData.propertyValue).toLocaleString('en-IN')}` : 'Not specified'}</p>
              </div>
              <div className="stat-card">
                <div className="stat-icon">📐</div>
                <h3>Built-up Area</h3>
                <p>{propertyData?.builtUpArea ? `${Number(propertyData.builtUpArea).toLocaleString('en-IN')} sq ft` : 'Not specified'}</p>
              </div>
              <div className="stat-card">
                <div className="stat-icon">📅</div>
                <h3>Property Age</h3>
                <p>{propertyData?.propertyAge ? `${propertyData.propertyAge} years` : 'Not specified'}</p>
              </div>
            </div>

            {propertyData?.city && (
              <div className="property-location">
                <div className="location-icon">📍</div>
                <span>{propertyData.street && `${propertyData.street}, `}{propertyData.city}{propertyData.state && `, ${propertyData.state}`}{propertyData.pinCode && ` - ${propertyData.pinCode}`}</span>
              </div>
            )}

            <div className="stats-grid secondary-stats">
              <div className="stat-card small">
                <div className="stat-icon">🎯</div>
                <h3>Selected Improvements</h3>
                <p>{getImprovementsList(propertyData).length}</p>
              </div>
            </div>

            {getImprovementsList(propertyData).length > 0 && (
              <div className="section">
                <h2>Your Selected Improvements</h2>
                <div className="improvements-list">
                  {getImprovementsList(propertyData).map((improvement, index) => (
                    <div key={index} className="improvement-item">
                      <span className="checkmark">✓</span>
                      <span>{improvement}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </>
        )}

        {activeTab === 'history' && (
          <div className="section">
            <h2>Your Activity History</h2>
            {homeownerHistory.length === 0 ? (
              <div className="empty-state">
                <div className="empty-icon">📜</div>
                <h3>No History Yet</h3>
                <p>Your activity and updates will appear here</p>
              </div>
            ) : (
              <div className="history-list">
                {homeownerHistory.map(entry => (
                  <div key={entry.id} className={`history-item ${entry.action === 'Estimate Received' ? 'history-item-expanded' : ''}`}>
                    <div className="history-icon">
                      {entry.action === 'Estimate Received' ? '💰' : entry.action === 'Submission' ? '📋' : '📌'}
                    </div>
                    <div className="history-content">
                      <div className="history-action">{entry.action}</div>
                      <div className="history-details">{entry.details}</div>
                      
                      {entry.propertyDetails && (
                        <div className="history-property-details">
                          <div className="history-property-header">Property Details:</div>
                          <div className="history-property-grid">
                            <span><strong>Type:</strong> {formatPropertyType(entry.propertyDetails.propertyType)}</span>
                            <span><strong>Location:</strong> {entry.propertyDetails.city}{entry.propertyDetails.state && `, ${entry.propertyDetails.state}`}</span>
                            {entry.propertyDetails.propertyValue && (
                              <span><strong>Value:</strong> ₹{parseInt(entry.propertyDetails.propertyValue).toLocaleString('en-IN')}</span>
                            )}
                            {entry.propertyDetails.builtUpArea && (
                              <span><strong>Area:</strong> {entry.propertyDetails.builtUpArea} sq ft</span>
                            )}
                          </div>
                          {getImprovementsList(entry.propertyDetails).length > 0 && (
                            <div className="history-improvements">
                              <strong>Improvements:</strong> {getImprovementsList(entry.propertyDetails).join(', ')}
                            </div>
                          )}
                        </div>
                      )}

                      {entry.estimateData && (
                        <div className="history-estimate-summary">
                          <div className="estimate-mini-card">
                            <span className="label">Total Cost</span>
                            <span className="value">₹{parseInt(entry.estimateData.totalCost).toLocaleString('en-IN')}</span>
                          </div>
                          <div className="estimate-mini-card">
                            <span className="label">Value Increase</span>
                            <span className="value">{entry.estimateData.valueIncreasePercent}%</span>
                          </div>
                          <div className="estimate-mini-card">
                            <span className="label">New Value</span>
                            <span className="value">₹{parseInt(entry.estimateData.estimatedNewValue).toLocaleString('en-IN')}</span>
                          </div>
                        </div>
                      )}

                      <div className="history-time">{new Date(entry.timestamp).toLocaleString()}</div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        <div className="action-section">
          <Link to="/" className="btn btn-primary">Explore Platform</Link>
          {propertyData ? (
            <Link to="/homeowner-form" className="btn btn-secondary">➕ Add Another Property</Link>
          ) : (
            <Link to="/homeowner-form" className="btn btn-secondary">Add Property Details</Link>
          )}
        </div>
      </div>

      {/* Profile Modal */}
      {showProfileModal && (
        <div className="modal-overlay" onClick={() => setShowProfileModal(false)}>
          <div className="modal-content profile-modal" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Your Profile</h2>
              <button className="close-btn" onClick={() => setShowProfileModal(false)}>×</button>
            </div>
            <div className="modal-body">
              <div className="profile-section">
                <div className="profile-avatar">
                  <span className="avatar-icon">👤</span>
                </div>
                <div className="profile-info">
                  <div className="profile-item">
                    <label>Full Name</label>
                    <span>{userData?.fullName || localStorage.getItem('userName') || 'Not provided'}</span>
                  </div>
                  <div className="profile-item">
                    <label>Email</label>
                    <span>{userData?.email || session.userEmail || 'Not provided'}</span>
                  </div>
                  <div className="profile-item">
                    <label>Phone</label>
                    <span>{userData?.phone || localStorage.getItem('userPhone') || 'Not provided'}</span>
                  </div>
                  <div className="profile-item">
                    <label>Account Type</label>
                    <span className="account-type-badge">Homeowner</span>
                  </div>
                </div>
              </div>

              {isEditMode && (
                <div className="profile-edit-section">
                  <h3>Edit Profile</h3>
                  <div className="edit-form-group">
                    <label>Full Name *</label>
                    <input
                      type="text"
                      name="fullName"
                      value={editFormData.fullName}
                      onChange={handleEditChange}
                      placeholder="Enter your full name"
                      className="edit-input"
                    />
                  </div>
                  <div className="edit-form-group">
                    <label>Phone Number</label>
                    <input
                      type="tel"
                      name="phone"
                      value={editFormData.phone}
                      onChange={handleEditChange}
                      placeholder="Enter your phone number"
                      className="edit-input"
                    />
                  </div>
                </div>
              )}

              {propertyData && (
                <div className="profile-section">
                  <h3>Latest Property Info</h3>
                  <div className="profile-item">
                    <label>Property Type</label>
                    <span>{formatPropertyType(propertyData?.propertyType)}</span>
                  </div>
                  <div className="profile-item">
                    <label>Location</label>
                    <span>{propertyData?.city}{propertyData?.state && `, ${propertyData.state}`}</span>
                  </div>
                  <div className="profile-item">
                    <label>Property Value</label>
                    <span>₹{propertyData?.propertyValue ? Number(propertyData.propertyValue).toLocaleString('en-IN') : 'Not specified'}</span>
                  </div>
                </div>
              )}
            </div>
            <div className="modal-footer">
              {isEditMode ? (
                <>
                  <button className="btn btn-primary" onClick={handleSaveProfile}>💾 Save Changes</button>
                  <button className="btn btn-secondary" onClick={handleCancelEdit}>Cancel</button>
                </>
              ) : (
                <>
                  <button className="btn btn-primary" onClick={handleEditClick}>✏️ Edit Profile</button>
                  <button className="btn btn-secondary" onClick={() => setShowProfileModal(false)}>Close</button>
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default HomeownerDashboard;
