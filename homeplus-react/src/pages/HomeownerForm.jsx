import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import './HomeownerForm.css';
import { api } from "../api";

const HomeownerForm = () => {
  const navigate = useNavigate();
  const [userData, setUserData] = useState(null);
  const [formData, setFormData] = useState({
    propertyType: '',
    propertyValue: '',
    propertyAge: '',
    builtUpArea: '',
    street: '',
    city: '',
    state: '',
    pinCode: '',
    locality: '',
    notes: ''
  });
  
  const [selectedImprovements, setSelectedImprovements] = useState([]);
  const [images, setImages] = useState([]);
  const [dragOver, setDragOver] = useState(false);

  const availableUpdates = [
    "Kitchen Renovation", "Bathroom Upgrade", "Living Room Makeover",
    "Bedroom Enhancement", "Flooring Replacement", "Wall Painting",
    "Ceiling Work", "Electrical Upgrades", "Plumbing Improvements",
    "Balcony Renovation", "Terrace Waterproofing", "Window Replacement",
    "Door Upgrades", "Lighting Enhancement", "Air Conditioning Installation",
    "Modular Kitchen", "Wardrobes Installation", "False Ceiling",
    "Home Automation", "Security Systems"
  ];

  useEffect(() => {
    // Check if user is logged in
    const isLoggedIn = localStorage.getItem('isLoggedIn');
    if (!isLoggedIn) {
      navigate('/login?type=homeowner');
      return;
    }

    // Load user data
    const storedUserData = localStorage.getItem('userData');
    if (storedUserData) {
      setUserData(JSON.parse(storedUserData));
    }
  }, [navigate]);

  const handleInputChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleCheckboxChange = (improvement) => {
    if (selectedImprovements.includes(improvement)) {
      setSelectedImprovements(selectedImprovements.filter(i => i !== improvement));
    } else {
      setSelectedImprovements([...selectedImprovements, improvement]);
    }
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    setDragOver(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    setDragOver(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setDragOver(false);
    const files = Array.from(e.dataTransfer.files);
    handleFiles(files);
  };

  const handleFileSelect = (e) => {
    const files = Array.from(e.target.files);
    handleFiles(files);
  };

  const handleFiles = (files) => {
    files.forEach(file => {
      if (file.type.startsWith('image/')) {
        const reader = new FileReader();
        reader.onload = (e) => {
          setImages(prev => [...prev, { file, preview: e.target.result }]);
        };
        reader.readAsDataURL(file);
      }
    });
  };

  const removeImage = (index) => {
    setImages(images.filter((_, i) => i !== index));
  };

  const handleLogout = () => {
    localStorage.removeItem('isLoggedIn');
    localStorage.removeItem('userData');
    localStorage.removeItem('userType');
    localStorage.removeItem('userEmail');
    navigate('/');
  };

const handleSubmit = async (e) => {
  e.preventDefault();

  const storedUserData = localStorage.getItem("userData");
  const user = storedUserData ? JSON.parse(storedUserData) : null;
  const userEmail = localStorage.getItem("userEmail") || user?.email;

  if (!userEmail) {
    alert("User session missing email. Please login again.");
    navigate('/login?type=homeowner');
    return;
  }

  // ✅ Prepare data for backend
  const propertyData = {
    ...formData,
    propertyValue: parseFloat(formData.propertyValue),
    propertyAge: parseInt(formData.propertyAge, 10),
    builtUpArea: parseFloat(formData.builtUpArea),
    improvements: selectedImprovements,
    imageCount: images.length,
    ownerName: user?.fullName || "Homeowner",
    ownerEmail: userEmail,
  };

  try {
    const createdProperty = await api.createProperty(propertyData);
    const propertyForDashboard = {
      ...createdProperty,
      improvements: selectedImprovements,
    };

    // Keep dashboard and history in sync immediately after submission.
    localStorage.setItem(`propertyData_${userEmail}`, JSON.stringify(propertyForDashboard));

    const existingHistory = JSON.parse(localStorage.getItem(`homeownerHistory_${userEmail}`) || '[]');
    const submissionEntry = {
      id: `submission_${propertyForDashboard.id || Date.now()}`,
      action: 'Submission',
      details: `Property details submitted for ${propertyForDashboard.city || formData.city}`,
      timestamp: propertyForDashboard.submissionDate || new Date().toISOString(),
      propertyDetails: propertyForDashboard,
    };
    localStorage.setItem(
      `homeownerHistory_${userEmail}`,
      JSON.stringify([submissionEntry, ...existingHistory])
    );

    // ✅ Redirect after success
    navigate("/homeowner-dashboard");

  } catch (err) {
    console.error(err);
    alert("Submission failed");
  }
};

  return (
    <div className="homeowner-form-page">
      <nav>
        <Link to="/" className="logo">HomePlus</Link>
        <div className="user-info">
          <span>Welcome, {userData?.fullName || localStorage.getItem('userName') || 'Homeowner'}</span>
          <button className="logout-btn" onClick={handleLogout}>Logout</button>
        </div>
      </nav>

      <div className="form-container">
        <h1>Property Details Form</h1>
        <p className="form-subtitle">Help us understand your property better</p>

        <form onSubmit={handleSubmit}>
          {/* Basic Information */}
          <div className="form-section">
            <h2>Basic Information</h2>
            <div className="form-grid">
              <div className="form-group">
                <label>Property Type *</label>
                <select 
                  name="propertyType" 
                  value={formData.propertyType}
                  onChange={handleInputChange}
                  required
                >
                  <option value="">Select Type</option>
                  <option value="apartment">Apartment</option>
                  <option value="independent-house">Independent House</option>
                  <option value="villa">Villa</option>
                  <option value="plot">Plot</option>
                </select>
              </div>
              <div className="form-group">
                <label>Property Value (₹) *</label>
                <input 
                  type="number" 
                  name="propertyValue"
                  value={formData.propertyValue}
                  onChange={handleInputChange}
                  placeholder="e.g., 5000000" 
                  required 
                />
              </div>
              <div className="form-group">
                <label>Property Age (Years) *</label>
                <input 
                  type="number" 
                  name="propertyAge"
                  value={formData.propertyAge}
                  onChange={handleInputChange}
                  placeholder="e.g., 10" 
                  required 
                />
              </div>
              <div className="form-group">
                <label>Built-up Area (sq ft) *</label>
                <input 
                  type="number" 
                  name="builtUpArea"
                  value={formData.builtUpArea}
                  onChange={handleInputChange}
                  placeholder="e.g., 1200" 
                  required 
                />
              </div>
            </div>
          </div>

          {/* Property Address */}
          <div className="form-section">
            <h2>Property Address</h2>
            <div className="form-grid">
              <div className="form-group full-width">
                <label>Street Address *</label>
                <input 
                  type="text" 
                  name="street"
                  value={formData.street}
                  onChange={handleInputChange}
                  placeholder="Enter street address" 
                  required 
                />
              </div>
              <div className="form-group">
                <label>City *</label>
                <input 
                  type="text" 
                  name="city"
                  value={formData.city}
                  onChange={handleInputChange}
                  placeholder="Enter city" 
                  required 
                />
              </div>
              <div className="form-group">
                <label>State *</label>
                <input 
                  type="text" 
                  name="state"
                  value={formData.state}
                  onChange={handleInputChange}
                  placeholder="Enter state" 
                  required 
                />
              </div>
              <div className="form-group">
                <label>PIN Code *</label>
                <input 
                  type="text" 
                  name="pinCode"
                  value={formData.pinCode}
                  onChange={handleInputChange}
                  placeholder="Enter PIN code" 
                  required 
                />
              </div>
              <div className="form-group">
                <label>Locality</label>
                <input 
                  type="text" 
                  name="locality"
                  value={formData.locality}
                  onChange={handleInputChange}
                  placeholder="Enter locality" 
                />
              </div>
            </div>
          </div>

          {/* Property Images */}
          <div className="form-section">
            <h2>Property Images</h2>
            <div 
              className={`upload-area ${dragOver ? 'drag-over' : ''}`}
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
              onClick={() => document.getElementById('fileInput').click()}
            >
              <div className="upload-icon">📷</div>
              <p>Drag & drop images here or click to browse</p>
              <input 
                type="file" 
                id="fileInput"
                multiple 
                accept="image/*"
                onChange={handleFileSelect}
                style={{ display: 'none' }}
              />
            </div>
            {images.length > 0 && (
              <div className="image-preview-grid">
                {images.map((img, index) => (
                  <div key={index} className="image-preview">
                    <img src={img.preview} alt={`Preview ${index + 1}`} />
                    <button 
                      type="button" 
                      className="remove-btn"
                      onClick={(e) => {
                        e.stopPropagation();
                        removeImage(index);
                      }}
                    >
                      ×
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Desired Improvements */}
          <div className="form-section">
            <h2>Desired Improvements</h2>
            <div className="improvements-grid">
              {availableUpdates.map((improvement, index) => (
                <label key={index} className="checkbox-label">
                  <input 
                    type="checkbox" 
                    checked={selectedImprovements.includes(improvement)}
                    onChange={() => handleCheckboxChange(improvement)}
                  />
                  <span>{improvement}</span>
                </label>
              ))}
            </div>
          </div>

          {/* Additional Information */}
          <div className="form-section">
            <h2>Additional Information</h2>
            <div className="form-group">
              <label>Any specific requirements or notes?</label>
              <textarea 
                name="notes"
                value={formData.notes}
                onChange={handleInputChange}
                rows="5"
                placeholder="Tell us more about your requirements..."
              ></textarea>
            </div>
          </div>

          <button type="submit" className="submit-btn">Submit & View Dashboard</button>
        </form>
      </div>
    </div>
  );
};

export default HomeownerForm;
