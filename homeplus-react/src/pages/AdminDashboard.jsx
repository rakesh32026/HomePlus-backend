import { useNavigate, Link } from 'react-router-dom';
import { useEffect, useState } from 'react';
import './AdminDashboard.css';
import { api } from "../api";
import { useAuthSession } from '../hooks/useAuthSession';

const ESTIMATION_LOCATION_OPTIONS = [
  { label: 'Prime city', value: 'prime-city' },
  { label: 'Normal area', value: 'normal-area' },
  { label: 'Remote area', value: 'remote-area' },
];

const ESTIMATION_AGE_OPTIONS = [
  { label: '0–5 years', value: '0-5' },
  { label: '5–15 years', value: '5-15' },
  { label: 'Above 15 years', value: 'above-15' },
];

const ESTIMATION_AMENITIES = [
  { label: 'Parking', value: 'parking' },
  { label: 'Security', value: 'security' },
  { label: 'Lift', value: 'lift' },
  { label: 'Garden / Balcony', value: 'garden-balcony' },
  { label: 'Smart Home', value: 'smart-home' },
];

const ESTIMATION_IMPROVEMENTS = [
  { label: 'Modular Kitchen', value: 'modular-kitchen' },
  { label: 'Interior Design', value: 'interior-design' },
  { label: 'Painting', value: 'painting' },
  { label: 'Flooring Upgrade', value: 'flooring-upgrade' },
  { label: 'Bathroom Upgrade', value: 'bathroom-upgrade' },
  { label: 'Solar Panels', value: 'solar-panels' },
];

const IMPROVEMENT_TO_AMENITIES = {
  'solar-panels': ['smart-home'],
  'modular-kitchen': ['security'],
  'bathroom-upgrade': [],
  'painting': [],
  'flooring-upgrade': ['garden-balcony'],
  'interior-design': ['smart-home'],
};

const normalizeSelectionKey = (value) =>
  String(value || '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, ' ')
    .trim();

const toValueLookup = (options) => {
  const lookup = {};
  options.forEach((option) => {
    lookup[normalizeSelectionKey(option.value)] = option.value;
    lookup[normalizeSelectionKey(option.label)] = option.value;
  });
  return lookup;
};

const IMPROVEMENT_VALUE_LOOKUP = {
  ...toValueLookup(ESTIMATION_IMPROVEMENTS),
  'kitchen renovation': 'modular-kitchen',
  'wall painting': 'painting',
  'flooring replacement': 'flooring-upgrade',
  'modular kitchen': 'modular-kitchen',
  'bathroom upgrade': 'bathroom-upgrade',
  'solar panels': 'solar-panels',
  'interior design': 'interior-design',
  'living room makeover': 'interior-design',
  'bedroom enhancement': 'interior-design',
  'wardrobes installation': 'interior-design',
  'false ceiling': 'interior-design',
  'lighting enhancement': 'interior-design',
  'door upgrades': 'interior-design',
  'window replacement': 'interior-design',
};

const AMENITY_VALUE_LOOKUP = {
  ...toValueLookup(ESTIMATION_AMENITIES),
  'garden balcony': 'garden-balcony',
  'smart home': 'smart-home',
};

const RAW_IMPROVEMENT_TO_AMENITIES = {
  'home automation': ['smart-home'],
  'security systems': ['security'],
  'balcony renovation': ['garden-balcony'],
  'modular kitchen': ['security'],
  'interior design': ['smart-home'],
  'solar panels': ['smart-home'],
};

const parseIncomingSelections = (values) => {
  if (Array.isArray(values)) return values;

  if (typeof values === 'string') {
    return values
      .split(/[|,]/)
      .map((item) => item.trim())
      .filter(Boolean);
  }

  if (values && typeof values === 'object') {
    return Object.keys(values).filter(Boolean);
  }

  return [];
};

const guessImprovementFromKeyword = (rawValue) => {
  const text = normalizeSelectionKey(rawValue);

  if (!text) return null;
  if (/(kitchen)/.test(text)) return 'modular-kitchen';
  if (/(bathroom)/.test(text)) return 'bathroom-upgrade';
  if (/(paint)/.test(text)) return 'painting';
  if (/(floor)/.test(text)) return 'flooring-upgrade';
  if (/(solar)/.test(text)) return 'solar-panels';
  if (/(interior|living room|bedroom|wardrobe|false ceiling|lighting|window|door|balcony|terrace)/.test(text)) return 'interior-design';

  return null;
};

const mapIncomingImprovements = (values) => {
  const parsedValues = parseIncomingSelections(values);

  const mapped = parsedValues
    .map((value) => IMPROVEMENT_VALUE_LOOKUP[normalizeSelectionKey(value)] || guessImprovementFromKeyword(value))
    .filter(Boolean);

  return Array.from(new Set(mapped));
};

const mapIncomingSelections = (values, lookup) => {
  const parsedValues = parseIncomingSelections(values);

  const mapped = parsedValues
    .map((value) => lookup[normalizeSelectionKey(value)])
    .filter(Boolean);

  return Array.from(new Set(mapped));
};

const formatRupees = (value) =>
  new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0,
  }).format(Number(value || 0));

const AdminDashboard = () => {
  const navigate = useNavigate();
  const { session, isAuthenticated, hasRole, clearSession } = useAuthSession();
  const [userData, setUserData] = useState(null);
  const [propertySubmissions, setPropertySubmissions] = useState([]);
  const [selectedProperty, setSelectedProperty] = useState(null);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [showEstimateModal, setShowEstimateModal] = useState(false);
  const [showEstimationModal, setShowEstimationModal] = useState(false);
  const [adminHistory, setAdminHistory] = useState([]);
  const [activeTab, setActiveTab] = useState('submissions');
  const [estimateData, setEstimateData] = useState({
    improvementCosts: {},
    totalCost: '',
    valueIncreasePercent: '',
    estimatedNewValue: '',
    adminNotes: ''
  });
  const [estimationForm, setEstimationForm] = useState({
    propertyTitle: '',
    locationType: '',
    areaSqFt: '',
    basePricePerSqFt: '',
    propertyAgeBand: '',
    amenities: [],
    improvements: [],
  });
  const [estimationResult, setEstimationResult] = useState(null);
  const [estimationLoading, setEstimationLoading] = useState(false);
  const [estimationError, setEstimationError] = useState('');
  const [estimationSuccess, setEstimationSuccess] = useState('');
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalProperties: 0,
    completed: 0,
    inProgress: 0
  });

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

  const normalizeProperty = (property) => ({
    ...property,
    ownerName:
      property.ownerName ||
      (property.ownerEmail ? property.ownerEmail.split('@')[0] : 'Homeowner'),
    submissionDate: property.submissionDate || new Date().toISOString(),
  });

  const updateStats = (submissions) => {
    const totalProperties = submissions.length;
    const uniqueUsers = new Set(submissions.map((s) => s.ownerEmail).filter(Boolean)).size;
    const pendingCount = submissions.filter((s) => s.status === 'Pending Review').length;
    const approvedCount = submissions.filter(
      (s) => s.status === 'Approved' || s.status === 'Estimated'
    ).length;

    setStats({
      totalUsers: uniqueUsers,
      totalProperties,
      completed: approvedCount,
      inProgress: pendingCount,
    });
  };

  useEffect(() => {
    if (!isAuthenticated || !hasRole('admin')) {
      navigate('/login?type=admin');
      return;
    }

    if (session.userData) {
      setUserData(session.userData);
    }

    const initializeDashboard = async () => {
      await loadPropertySubmissions();
      loadAdminHistory();
    };

    initializeDashboard();
  }, [navigate, isAuthenticated, hasRole, session.userData]);

  const loadPropertySubmissionsFromLocal = () => {
    const submissions = [];
    const keys = Object.keys(localStorage);
    
    keys.forEach(key => {
      if (key.startsWith('propertySubmission_')) {
        try {
          const submission = JSON.parse(localStorage.getItem(key));
          submissions.push({
            ...submission,
            id: key,
            submissionDate: submission.submissionDate || new Date().toISOString()
          });
        } catch (e) {
          console.error('Error parsing submission:', e);
        }
      }
    });

    submissions.sort((a, b) => new Date(b.submissionDate) - new Date(a.submissionDate));
    setPropertySubmissions(submissions);
    updateStats(submissions);
  };

  const loadPropertySubmissions = async () => {
    try {
      const data = await api.getAllProperties();
      const normalized = (Array.isArray(data) ? data : [])
        .map(normalizeProperty)
        .sort((a, b) => new Date(b.submissionDate) - new Date(a.submissionDate));

      setPropertySubmissions(normalized);
      updateStats(normalized);
    } catch (error) {
      loadPropertySubmissionsFromLocal();
    }
  };

  const loadAdminHistory = () => {
    const history = JSON.parse(localStorage.getItem('adminHistory') || '[]');
    setAdminHistory(history);
  };

  const addToHistory = (action, propertyOwner, details) => {
    const history = JSON.parse(localStorage.getItem('adminHistory') || '[]');
    const newEntry = {
      id: Date.now(),
      action,
      propertyOwner,
      details,
      timestamp: new Date().toISOString(),
      adminEmail: userData?.email || localStorage.getItem('userEmail')
    };
    history.unshift(newEntry);
    localStorage.setItem('adminHistory', JSON.stringify(history.slice(0, 50)));
    setAdminHistory(history.slice(0, 50));
  };

  const handleRefresh = async () => {
    await loadPropertySubmissions();
    loadAdminHistory();
  };



const handleApprove = async (submissionId) => {
  try {
    await api.approveProperty(submissionId);

    // Optional: history log (frontend only)
    const submission = propertySubmissions.find(s => s.id === submissionId);
    if (submission) {
      addToHistory(
        'Approved',
        submission.ownerName,
        `Approved property submission for ${submission.city}`
      );
    }

    // ✅ Refresh data (BEST PRACTICE)
    await loadPropertySubmissions();

  } catch (err) {
    console.error(err);
    alert("Failed to approve property");
  }
};

const handleReject = async (submissionId) => {
  try {
    await api.rejectProperty(submissionId);

    // Optional: history log
    const submission = propertySubmissions.find(s => s.id === submissionId);
    if (submission) {
      addToHistory(
        'Rejected',
        submission.ownerName,
        `Rejected property submission for ${submission.city}`
      );
    }

    // ✅ Refresh data properly (NO reload)
    await loadPropertySubmissions();

  } catch (err) {
    console.error(err);
    alert("Failed to reject property");
  }
};

  const handleViewDetails = (property) => {
    setSelectedProperty(property);
    setShowDetailsModal(true);
  };

  const handleOpenEstimate = (property) => {
    setSelectedProperty(property);
    const costs = {};
    property.improvements?.forEach(imp => {
      costs[imp] = '';
    });
    setEstimateData({
      improvementCosts: costs,
      totalCost: '',
      valueIncreasePercent: '',
      estimatedNewValue: '',
      adminNotes: ''
    });
    setShowEstimateModal(true);
  };

  const openEstimationFromProperty = (property) => {
    setSelectedProperty(property);

    // Auto-fill estimation form from property details
    const propertyTitle = `${formatPropertyType(property.propertyType)} in ${property.city}`;
    const areaSqFt = property.builtUpArea || '';
    const propertyValue = parseInt(property.propertyValue) || 0;
    const basePricePerSqFt = areaSqFt && propertyValue ? Math.round(propertyValue / areaSqFt) : '';

    // Infer property age band from property.propertyAge
    let propertyAgeBand = '';
    if (property.propertyAge) {
      const age = parseInt(property.propertyAge);
      if (age <= 5) propertyAgeBand = '0-5';
      else if (age <= 15) propertyAgeBand = '5-15';
      else propertyAgeBand = 'above-15';
    }

    // Infer location type from property details (if available in property.locationType)
    let locationType = property.locationType || 'prime-city';

    // Map homeowner-entered selections to estimation option values.
    const rawImprovements = parseIncomingSelections(
      property.improvements && parseIncomingSelections(property.improvements).length > 0
        ? property.improvements
        : (property.adminEstimate?.improvementCosts || [])
    );
    const mappedImprovements = mapIncomingImprovements(rawImprovements);
    const mappedAmenities = mapIncomingSelections(property.amenities || [], AMENITY_VALUE_LOOKUP);

    // Derive amenities from selected improvements so modal reflects homeowner intent.
    const derivedAmenities = mappedImprovements.flatMap((improvement) => IMPROVEMENT_TO_AMENITIES[improvement] || []);
    const derivedAmenitiesFromRaw = rawImprovements.flatMap(
      (rawImprovement) => RAW_IMPROVEMENT_TO_AMENITIES[normalizeSelectionKey(rawImprovement)] || []
    );
    const finalAmenities = Array.from(new Set([...mappedAmenities, ...derivedAmenities, ...derivedAmenitiesFromRaw]));

    setEstimationForm({
      propertyTitle: propertyTitle,
      locationType: locationType,
      areaSqFt: areaSqFt.toString(),
      basePricePerSqFt: basePricePerSqFt.toString(),
      propertyAgeBand: propertyAgeBand,
      amenities: finalAmenities,
      improvements: mappedImprovements,
    });

    setEstimationResult(null);
    setEstimationError('');
    setEstimationSuccess('');
    setShowEstimationModal(true);
  };

  const handleEstimateChange = (field, value) => {
    setEstimateData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleEstimationChange = (field, value) => {
    setEstimationForm(prev => ({
      ...prev,
      [field]: value,
    }));
    setEstimationError('');
    setEstimationSuccess('');
  };

  // Mapping of amenities to improvements that complement them
  const AMENITIES_TO_IMPROVEMENTS = {
    'smart-home': ['solar-panels', 'interior-design'],
    'security': ['modular-kitchen'],
    'garden-balcony': ['flooring-upgrade', 'interior-design'],
    'parking': [],
    'lift': [],
  };

  const toggleEstimationSelection = (field, value) => {
    setEstimationForm(prev => {
      const currentValues = prev[field] || [];
      const nextValues = currentValues.includes(value)
        ? currentValues.filter((item) => item !== value)
        : [...currentValues, value];

      // Auto-update related field based on selection
      let updatedForm = { ...prev, [field]: nextValues };

      if (field === 'improvements') {
        // When improvement is toggled, auto-update amenities
        const newAmenities = new Set([...prev.amenities] || []);
        
        if (nextValues.includes(value)) {
          // Adding an improvement - add related amenities
          const relatedAmenities = IMPROVEMENT_TO_AMENITIES[value] || [];
          relatedAmenities.forEach(amenity => newAmenities.add(amenity));
        } else {
          // Removing an improvement - check if amenity should be removed
          const relatedAmenities = IMPROVEMENT_TO_AMENITIES[value] || [];
          relatedAmenities.forEach(amenity => {
            // Only remove if no other improvement needs this amenity
            const stillNeeded = nextValues.some(imp => 
              (IMPROVEMENT_TO_AMENITIES[imp] || []).includes(amenity)
            );
            if (!stillNeeded) {
              newAmenities.delete(amenity);
            }
          });
        }
        updatedForm.amenities = Array.from(newAmenities);
      }

      if (field === 'amenities') {
        // When amenity is toggled, auto-update improvements
        const newImprovements = new Set([...prev.improvements] || []);
        
        if (nextValues.includes(value)) {
          // Adding an amenity - suggest related improvements
          const relatedImprovements = AMENITIES_TO_IMPROVEMENTS[value] || [];
          relatedImprovements.forEach(imp => newImprovements.add(imp));
        } else {
          // Removing an amenity - check if improvement should be removed
          const relatedImprovements = AMENITIES_TO_IMPROVEMENTS[value] || [];
          relatedImprovements.forEach(imp => {
            // Only remove if no other amenity needs this improvement
            const stillNeeded = nextValues.some(amenity => 
              (AMENITIES_TO_IMPROVEMENTS[amenity] || []).includes(imp)
            );
            if (!stillNeeded) {
              newImprovements.delete(imp);
            }
          });
        }
        updatedForm.improvements = Array.from(newImprovements);
      }

      return updatedForm;
    });
    setEstimationError('');
    setEstimationSuccess('');
  };

  const validateEstimationForm = () => {
    if (!estimationForm.propertyTitle.trim()) return 'Property title is required';
    if (!estimationForm.locationType) return 'Location type is required';
    if (!estimationForm.areaSqFt || Number(estimationForm.areaSqFt) <= 0) return 'Area must be greater than 0';
    if (!estimationForm.basePricePerSqFt || Number(estimationForm.basePricePerSqFt) <= 0) return 'Base price per sq.ft must be greater than 0';
    if (!estimationForm.propertyAgeBand) return 'Property age is required';
    return '';
  };

  const resetEstimationForm = () => {
    setEstimationForm({
      propertyTitle: '',
      locationType: '',
      areaSqFt: '',
      basePricePerSqFt: '',
      propertyAgeBand: '',
      amenities: [],
      improvements: [],
    });
    setEstimationResult(null);
    setEstimationError('');
    setEstimationSuccess('');
  };

  const handleCalculateEstimation = async (e) => {
    e.preventDefault();

    const validationMessage = validateEstimationForm();
    if (validationMessage) {
      setEstimationError(validationMessage);
      return;
    }

    setEstimationLoading(true);
    setEstimationError('');
    setEstimationSuccess('');

    try {
      const payload = {
        propertyTitle: estimationForm.propertyTitle.trim(),
        locationType: estimationForm.locationType,
        areaSqFt: Number(estimationForm.areaSqFt),
        basePricePerSqFt: Number(estimationForm.basePricePerSqFt),
        propertyAgeBand: estimationForm.propertyAgeBand,
        amenities: estimationForm.amenities,
        improvements: estimationForm.improvements,
      };

      const response = await api.calculatePropertyEstimation(payload);
      setEstimationResult(response);
      setEstimationSuccess('Estimation calculated successfully');
    } catch (error) {
      setEstimationResult(null);
      setEstimationError(error.message || 'Failed to calculate estimation');
    } finally {
      setEstimationLoading(false);
    }
  };

  const handleSaveEstimationResult = async () => {
    if (!estimationResult || !selectedProperty) {
      alert('No estimation result to save');
      return;
    }

    try {
      // Prepare estimate payload from calculation result
      const estimatePayload = {
        propertyId: selectedProperty.id,
        totalCost: estimationResult.improvedPropertyValue - estimationResult.currentPropertyValue,
        valueIncreasePercent: ((estimationResult.improvedPropertyValue - estimationResult.currentPropertyValue) / estimationResult.currentPropertyValue * 100).toFixed(2),
        estimatedNewValue: estimationResult.improvedPropertyValue,
        adminNotes: `Calculated Estimation: ${estimationResult.recommendationMessage}`
      };

      // Save the estimate to backend
      await api.saveEstimate(selectedProperty.id, estimatePayload);

      alert('Estimation saved successfully! Homeowner will see the update on their dashboard.');

      // Update localStorage for homeowner if applicable
      const homeownerEmail = selectedProperty.ownerEmail;
      const updatedSubmission = {
        ...selectedProperty,
        adminEstimate: {
          totalCost: estimatePayload.totalCost,
          valueIncreasePercent: estimatePayload.valueIncreasePercent,
          estimatedNewValue: estimatePayload.estimatedNewValue,
          adminNotes: estimatePayload.adminNotes
        },
        status: 'Estimated'
      };

      // Save to homeowner's property data
      const homeownerPropertyData = JSON.parse(localStorage.getItem('propertyData') || '{}');
      if (homeownerPropertyData.ownerEmail === homeownerEmail || homeownerPropertyData.id === selectedProperty.id) {
        homeownerPropertyData.adminEstimate = updatedSubmission.adminEstimate;
        homeownerPropertyData.status = 'Estimated';
        localStorage.setItem('propertyData', JSON.stringify(homeownerPropertyData));
      }

      // Save to homeowner-specific estimates
      const homeownerEstimates = JSON.parse(localStorage.getItem(`estimates_${homeownerEmail}`) || '[]');
      homeownerEstimates.unshift({
        submissionId: selectedProperty.id,
        ...updatedSubmission.adminEstimate,
        propertyType: selectedProperty.propertyType,
        city: selectedProperty.city,
        estimatedDate: new Date().toISOString()
      });
      localStorage.setItem(`estimates_${homeownerEmail}`, JSON.stringify(homeownerEstimates.slice(0, 10)));

      // Add history entry for homeowner
      const homeownerHistory = JSON.parse(localStorage.getItem(`homeownerHistory_${homeownerEmail}`) || '[]');
      homeownerHistory.unshift({
        id: Date.now(),
        action: 'Estimate Received',
        details: `Your property has been estimated. New value: ₹${Number(estimationResult.improvedPropertyValue).toLocaleString('en-IN')}`,
        propertyDetails: selectedProperty,
        estimateData: updatedSubmission.adminEstimate,
        timestamp: new Date().toISOString()
      });
      localStorage.setItem(`homeownerHistory_${homeownerEmail}`, JSON.stringify(homeownerHistory.slice(0, 50)));

      // Add to admin history
      addToHistory('Estimation Saved', selectedProperty.ownerName, `Estimated value: ₹${Number(estimationResult.improvedPropertyValue).toLocaleString('en-IN')}`);

      // Close modal and refresh
      setShowEstimationModal(false);
      setEstimationResult(null);
      resetEstimationForm();
      await loadPropertySubmissions();

    } catch (err) {
      console.error(err);
      alert('Error saving estimation');
    }
  };

  const handleImprovementCostChange = (improvement, value) => {
    setEstimateData(prev => ({
      ...prev,
      improvementCosts: {
        ...prev.improvementCosts,
        [improvement]: value
      }
    }));
  };

  const calculateTotalCost = () => {
    const total = Object.values(estimateData.improvementCosts)
      .reduce((sum, cost) => sum + (parseInt(cost) || 0), 0);
    setEstimateData(prev => ({ ...prev, totalCost: total.toString() }));
  };

  const calculateNewValue = () => {
    if (selectedProperty?.propertyValue && estimateData.valueIncreasePercent) {
      const currentValue = parseInt(selectedProperty.propertyValue);
      const increasePercent = parseFloat(estimateData.valueIncreasePercent);
      const newValue = Math.round(currentValue * (1 + increasePercent / 100));
      setEstimateData(prev => ({ ...prev, estimatedNewValue: newValue.toString() }));
    }
  };
const handleSaveEstimate = async () => {
  if (!selectedProperty || !selectedProperty.id) {
    alert("No property selected");
    return;
  }

  try {
    const estimatePayload = {
      propertyId: selectedProperty.id,
      totalCost: parseFloat(estimateData.totalCost || 0),
      valueIncreasePercent: parseFloat(estimateData.valueIncreasePercent || 0),
      estimatedNewValue: parseFloat(estimateData.estimatedNewValue || 0),
      adminNotes: estimateData.adminNotes || "",
    };

    console.log("Sending:", estimatePayload);

    await api.saveEstimate(selectedProperty.id, estimatePayload);

    alert("Estimate saved successfully!");

    // Update localStorage with estimate
    const updatedSubmission = {
      ...selectedProperty,
      adminEstimate: {
        totalCost: estimateData.totalCost,
        valueIncreasePercent: estimateData.valueIncreasePercent,
        estimatedNewValue: estimateData.estimatedNewValue,
        improvementCosts: estimateData.improvementCosts,
        adminNotes: estimateData.adminNotes
      },
      status: 'Estimated'
    };

    localStorage.setItem(selectedProperty.id, JSON.stringify(updatedSubmission));

    // Update homeowner's property data if it's their current submission
    const homeownerEmail = selectedProperty.ownerEmail;
    const homeownerPropertyData = JSON.parse(localStorage.getItem('propertyData') || '{}');
    if (homeownerPropertyData.ownerEmail === homeownerEmail) {
      homeownerPropertyData.adminEstimate = updatedSubmission.adminEstimate;
      homeownerPropertyData.status = 'Estimated';
      localStorage.setItem('propertyData', JSON.stringify(homeownerPropertyData));
    }

    // Save to homeowner-specific estimates
    const homeownerEstimates = JSON.parse(localStorage.getItem(`estimates_${homeownerEmail}`) || '[]');
    homeownerEstimates.unshift({
      submissionId: selectedProperty.id,
      ...updatedSubmission.adminEstimate,
      propertyType: selectedProperty.propertyType,
      city: selectedProperty.city
    });
    localStorage.setItem(`estimates_${homeownerEmail}`, JSON.stringify(homeownerEstimates));

    // Add homeowner history entry with property details
    const homeownerHistory = JSON.parse(localStorage.getItem(`homeownerHistory_${homeownerEmail}`) || '[]');
    homeownerHistory.unshift({
      id: Date.now(),
      action: 'Estimate Received',
      details: `Admin provided cost estimate: ₹${parseInt(estimateData.totalCost).toLocaleString('en-IN')} with ${estimateData.valueIncreasePercent}% value increase`,
      propertyDetails: {
        propertyType: selectedProperty.propertyType,
        city: selectedProperty.city,
        state: selectedProperty.state,
        propertyValue: selectedProperty.propertyValue,
        builtUpArea: selectedProperty.builtUpArea,
        improvements: selectedProperty.improvements
      },
      estimateData: {
        totalCost: estimateData.totalCost,
        valueIncreasePercent: estimateData.valueIncreasePercent,
        estimatedNewValue: estimateData.estimatedNewValue,
        improvementCosts: estimateData.improvementCosts
      },
      timestamp: new Date().toISOString()
    });
    localStorage.setItem(`homeownerHistory_${homeownerEmail}`, JSON.stringify(homeownerHistory.slice(0, 50)));

    addToHistory('Estimate Provided', selectedProperty.ownerName, `Total: ₹${parseInt(estimateData.totalCost).toLocaleString('en-IN')}, Value Increase: ${estimateData.valueIncreasePercent}%`);

    setShowEstimateModal(false);
    await loadPropertySubmissions();
    alert('Estimate saved and sent to homeowner successfully!');

  } catch (err) {
    console.error(err);
    alert("Error saving estimate");
  }
};

  const handleLogout = () => {
    clearSession();
    navigate('/');
  };

  const statsDisplay = [
    { icon: '👥', label: 'Total Users', value: stats.totalUsers },
    { icon: '🏠', label: 'Properties', value: stats.totalProperties },
    { icon: '✅', label: 'Approved', value: stats.completed },
    { icon: '⏳', label: 'Pending', value: stats.inProgress }
  ];

  return (
    <div className="admin-dashboard-page">
      <nav>
        <Link to="/" className="logo">HomePlus</Link>
        <div className="user-info">
          <span>👤 {userData?.fullName || userData?.email || 'Administrator'}</span>
          <button className="logout-btn" onClick={handleLogout}>Logout</button>
        </div>
      </nav>

      <div className="admin-container">
        <div className="header-section">
          <h1>Admin Dashboard</h1>
          <p className="subtitle">Manage properties and homeowner requests</p>
        </div>

        <div className="stats-grid">
          {statsDisplay.map((stat, index) => (
            <div key={index} className="stat-card">
              <div className="stat-icon">{stat.icon}</div>
              <div className="stat-details">
                <h3>{stat.label}</h3>
                <p>{stat.value}</p>
              </div>
            </div>
          ))}
        </div>

        <div className="tabs-container">
          <button 
            className={`tab-btn ${activeTab === 'submissions' ? 'active' : ''}`}
            onClick={() => setActiveTab('submissions')}
          >
            📋 Property Submissions
          </button>
          <button 
            className={`tab-btn ${activeTab === 'history' ? 'active' : ''}`}
            onClick={() => setActiveTab('history')}
          >
            📜 History
          </button>
        </div>

        {activeTab === 'submissions' && (
          <div className="section">
            <div className="section-header">
              <h2>Property Submissions</h2>
              <button className="refresh-btn" onClick={handleRefresh}>🔄 Refresh</button>
            </div>
            
            {propertySubmissions.length === 0 ? (
              <div className="empty-state">
                <div className="empty-icon">📭</div>
                <h3>No Property Submissions Yet</h3>
                <p>Waiting for homeowners to submit their property details</p>
              </div>
            ) : (
              <div className="table-container">
                <table className="properties-table">
                  <thead>
                    <tr>
                      <th>Owner</th>
                      <th>Property Type</th>
                      <th>Value (₹)</th>
                      <th>Location</th>
                      <th>Status</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {propertySubmissions.map(property => (
                      <tr key={property.id}>
                        <td>
                          <div className="owner-info">
                            <div className="owner-name">{property.ownerName}</div>
                            <div className="owner-email">{property.ownerEmail}</div>
                          </div>
                        </td>
                        <td>{formatPropertyType(property.propertyType)}</td>
                        <td>₹{parseInt(property.propertyValue).toLocaleString('en-IN')}</td>
                        <td>{property.city}, {property.state}</td>
                        <td>
                          <span className={`status-badge ${(property.status || 'Pending Review').toLowerCase().replace(' ', '-')}`}>
                            {property.status || 'Pending Review'}
                          </span>
                        </td>
                        <td>
                          <div className="action-buttons">
                            {(property.status === 'Approved' || property.status === 'Estimated') && (
                              <button 
                                className="action-btn details-btn" 
                                onClick={() => handleViewDetails(property)}
                                title="View Details"
                              >
                                VIEW DETAILS
                              </button>
                            )}
                            {property.status === 'Approved' && (
                              <button 
                                className="action-btn estimate-btn" 
                                onClick={() => openEstimationFromProperty(property)}
                                title="Provide Estimate"
                              >
                                💰 ESTIMATE
                              </button>
                            )}
                            {property.status !== 'Approved' && property.status !== 'Estimated' && (
                              <>
                                <button 
                                  className="action-btn approve-btn" 
                                  onClick={() => handleApprove(property.id)}
                                  title="Approve"
                                >
                                  ✓
                                </button>
                                <button 
                                  className="action-btn reject-btn" 
                                  onClick={() => handleReject(property.id)}
                                  title="Reject"
                                >
                                  ✗
                                </button>
                              </>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {activeTab === 'history' && (
          <div className="section">
            <div className="section-header">
              <h2>Admin Activity History</h2>
            </div>
            {adminHistory.length === 0 ? (
              <div className="empty-state">
                <div className="empty-icon">📜</div>
                <h3>No History Yet</h3>
                <p>Your actions will appear here</p>
              </div>
            ) : (
              <div className="history-list">
                {adminHistory.map(entry => (
                  <div key={entry.id} className="history-item">
                    <div className="history-icon">
                      {entry.action === 'Approved' ? '✅' : entry.action === 'Rejected' ? '❌' : '💰'}
                    </div>
                    <div className="history-content">
                      <div className="history-action">{entry.action}</div>
                      <div className="history-owner">{entry.propertyOwner}</div>
                      <div className="history-details">{entry.details}</div>
                      <div className="history-time">{new Date(entry.timestamp).toLocaleString()}</div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        <div className="quick-actions-section">
          <h2>Quick Actions</h2>
          <div className="actions-grid">
            <button className="action-card" onClick={() => setActiveTab('submissions')}>
              <span className="action-icon">📋</span>
              <span>View Submissions</span>
            </button>
            <button className="action-card" onClick={() => setActiveTab('history')}>
              <span className="action-icon">📜</span>
              <span>View History</span>
            </button>
            <button className="action-card" onClick={handleRefresh}>
              <span className="action-icon">🔄</span>
              <span>Refresh Data</span>
            </button>
            <button className="action-card">
              <span className="action-icon">📊</span>
              <span>Analytics</span>
            </button>
          </div>
        </div>
      </div>

      {/* Details Modal */}
      {showDetailsModal && selectedProperty && (
        <div className="modal-overlay" onClick={() => setShowDetailsModal(false)}>
          <div className="modal-content details-modal" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Property Details</h2>
              <button className="close-btn" onClick={() => setShowDetailsModal(false)}>×</button>
            </div>
            <div className="modal-body">
              <div className="detail-section">
                <h3>Owner Information</h3>
                <div className="detail-grid">
                  <div className="detail-item">
                    <label>Name</label>
                    <span>{selectedProperty.ownerName}</span>
                  </div>
                  <div className="detail-item">
                    <label>Email</label>
                    <span>{selectedProperty.ownerEmail}</span>
                  </div>
                </div>
              </div>

              <div className="detail-section">
                <h3>Basic Information</h3>
                <div className="detail-grid">
                  <div className="detail-item">
                    <label>Property Type</label>
                    <span>{formatPropertyType(selectedProperty.propertyType)}</span>
                  </div>
                  <div className="detail-item">
                    <label>Property Value</label>
                    <span>₹{parseInt(selectedProperty.propertyValue).toLocaleString('en-IN')}</span>
                  </div>
                  <div className="detail-item">
                    <label>Property Age</label>
                    <span>{selectedProperty.propertyAge} years</span>
                  </div>
                  <div className="detail-item">
                    <label>Built-up Area</label>
                    <span>{selectedProperty.builtUpArea} sq ft</span>
                  </div>
                </div>
              </div>

              <div className="detail-section">
                <h3>Property Address</h3>
                <div className="detail-grid">
                  <div className="detail-item full-width">
                    <label>Street</label>
                    <span>{selectedProperty.street || 'Not provided'}</span>
                  </div>
                  <div className="detail-item">
                    <label>City</label>
                    <span>{selectedProperty.city}</span>
                  </div>
                  <div className="detail-item">
                    <label>State</label>
                    <span>{selectedProperty.state}</span>
                  </div>
                  <div className="detail-item">
                    <label>PIN Code</label>
                    <span>{selectedProperty.pinCode || 'Not provided'}</span>
                  </div>
                  <div className="detail-item">
                    <label>Locality</label>
                    <span>{selectedProperty.locality || 'Not provided'}</span>
                  </div>
                </div>
              </div>

              <div className="detail-section">
                <h3>Desired Improvements ({selectedProperty.improvements?.length || 0})</h3>
                <div className="improvements-grid">
                  {selectedProperty.improvements?.map((imp, index) => (
                    <div key={index} className="improvement-tag">{imp}</div>
                  ))}
                </div>
              </div>

              {selectedProperty.notes && (
                <div className="detail-section">
                  <h3>Additional Notes</h3>
                  <p className="notes-text">{selectedProperty.notes}</p>
                </div>
              )}

              {selectedProperty.adminEstimate && (
                <div className="detail-section estimate-section">
                  <h3>Admin Estimate</h3>
                  <div className="detail-grid">
                    <div className="detail-item">
                      <label>Total Cost</label>
                      <span className="highlight">₹{parseInt(selectedProperty.adminEstimate.totalCost).toLocaleString('en-IN')}</span>
                    </div>
                    <div className="detail-item">
                      <label>Value Increase</label>
                      <span className="highlight">{selectedProperty.adminEstimate.valueIncreasePercent}%</span>
                    </div>
                    <div className="detail-item">
                      <label>Estimated New Value</label>
                      <span className="highlight">₹{parseInt(selectedProperty.adminEstimate.estimatedNewValue).toLocaleString('en-IN')}</span>
                    </div>
                  </div>
                  {selectedProperty.adminEstimate.adminNotes && (
                    <div className="detail-item full-width">
                      <label>Admin Notes</label>
                      <span>{selectedProperty.adminEstimate.adminNotes}</span>
                    </div>
                  )}
                </div>
              )}
            </div>
            <div className="modal-footer">
              {selectedProperty.status === 'Approved' && !selectedProperty.adminEstimate && (
                <button className="btn btn-primary" onClick={() => { setShowDetailsModal(false); handleOpenEstimate(selectedProperty); }}>
                  Provide Estimate
                </button>
              )}
              <button className="btn btn-secondary" onClick={() => setShowDetailsModal(false)}>Close</button>
            </div>
          </div>
        </div>
      )}

      {/* Estimate Modal */}
      {showEstimateModal && selectedProperty && (
        <div className="modal-overlay" onClick={() => setShowEstimateModal(false)}>
          <div className="modal-content estimate-modal" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Provide Cost Estimate</h2>
              <button className="close-btn" onClick={() => setShowEstimateModal(false)}>×</button>
            </div>
            <div className="modal-body">
              <div className="estimate-info">
                <p><strong>Property:</strong> {formatPropertyType(selectedProperty.propertyType)} in {selectedProperty.city}</p>
                <p><strong>Owner:</strong> {selectedProperty.ownerName}</p>
                <p><strong>Current Value:</strong> ₹{parseInt(selectedProperty.propertyValue).toLocaleString('en-IN')}</p>
              </div>

              <div className="estimate-section">
                <h3>Cost for Each Improvement</h3>
                <div className="improvement-costs">
                  {selectedProperty.improvements?.map((improvement, index) => (
                    <div key={index} className="cost-input-group">
                      <label>{improvement}</label>
                      <div className="cost-input">
                        <span>₹</span>
                        <input
                          type="number"
                          placeholder="Enter cost"
                          value={estimateData.improvementCosts[improvement] || ''}
                          onChange={(e) => handleImprovementCostChange(improvement, e.target.value)}
                        />
                      </div>
                    </div>
                  ))}
                </div>
                <button className="btn btn-secondary calculate-btn" onClick={calculateTotalCost}>
                  Calculate Total Cost
                </button>
              </div>

              <div className="estimate-section">
                <h3>Value Estimation</h3>
                <div className="estimate-grid">
                  <div className="estimate-input-group">
                    <label>Total Improvement Cost (₹)</label>
                    <input
                      type="number"
                      value={estimateData.totalCost}
                      onChange={(e) => handleEstimateChange('totalCost', e.target.value)}
                      placeholder="Total cost"
                    />
                  </div>
                  <div className="estimate-input-group">
                    <label>Value Increase (%)</label>
                    <input
                      type="number"
                      step="0.1"
                      value={estimateData.valueIncreasePercent}
                      onChange={(e) => handleEstimateChange('valueIncreasePercent', e.target.value)}
                      placeholder="e.g., 15"
                    />
                  </div>
                  <button className="btn btn-secondary calculate-btn" onClick={calculateNewValue}>
                    Calculate New Value
                  </button>
                  <div className="estimate-input-group">
                    <label>Estimated New Property Value (₹)</label>
                    <input
                      type="number"
                      value={estimateData.estimatedNewValue}
                      onChange={(e) => handleEstimateChange('estimatedNewValue', e.target.value)}
                      placeholder="New value"
                    />
                  </div>
                </div>
              </div>

              <div className="estimate-section">
                <h3>Additional Notes</h3>
                <textarea
                  rows="3"
                  value={estimateData.adminNotes}
                  onChange={(e) => handleEstimateChange('adminNotes', e.target.value)}
                  placeholder="Any additional notes for the homeowner..."
                />
              </div>
            </div>
            <div className="modal-footer">
              <button className="btn btn-primary" onClick={handleSaveEstimate}>
                💾 Save & Update to Homeowner
              </button>
              <button className="btn btn-secondary" onClick={() => setShowEstimateModal(false)}>Cancel</button>
            </div>
          </div>
        </div>
      )}

      {/* Estimation Modal - Auto-filled from Property */}
      {showEstimationModal && selectedProperty && (
        <div className="modal-overlay" onClick={() => setShowEstimationModal(false)}>
          <div className="modal-content estimation-modal-large" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Property Value Estimation</h2>
              <button className="close-btn" onClick={() => setShowEstimationModal(false)}>×</button>
            </div>
            <div className="modal-body">
              {estimationError && (
                <div className="alert alert-error estimation-alert">
                  <span className="alert-icon">⚠️</span>
                  {estimationError}
                </div>
              )}

              {estimationSuccess && (
                <div className="alert alert-success estimation-alert">
                  <span className="alert-icon">✓</span>
                  {estimationSuccess}
                </div>
              )}

              <div className="estimation-info-box">
                <p><strong>Property:</strong> {selectedProperty.ownerName} - {formatPropertyType(selectedProperty.propertyType)} in {selectedProperty.city}</p>
                <p><strong>Current Value:</strong> ₹{parseInt(selectedProperty.propertyValue).toLocaleString('en-IN')} | <strong>Area:</strong> {selectedProperty.builtUpArea} sq.ft</p>
              </div>

              <form className="estimation-form" onSubmit={handleCalculateEstimation}>
                <div className="estimation-grid">
                  <div className="form-field">
                    <label>Property Name / Title *</label>
                    <input
                      type="text"
                      value={estimationForm.propertyTitle}
                      onChange={(e) => handleEstimationChange('propertyTitle', e.target.value)}
                      placeholder="e.g., Green Villa"
                    />
                  </div>

                  <div className="form-field">
                    <label>Location Type *</label>
                    <select
                      value={estimationForm.locationType}
                      onChange={(e) => handleEstimationChange('locationType', e.target.value)}
                    >
                      <option value="">Select location type</option>
                      {ESTIMATION_LOCATION_OPTIONS.map((option) => (
                        <option key={option.value} value={option.value}>{option.label}</option>
                      ))}
                    </select>
                  </div>

                  <div className="form-field">
                    <label>Area (sq.ft) *</label>
                    <input
                      type="number"
                      min="0"
                      step="0.01"
                      value={estimationForm.areaSqFt}
                      onChange={(e) => handleEstimationChange('areaSqFt', e.target.value)}
                      placeholder="e.g., 1200"
                    />
                  </div>

                  <div className="form-field">
                    <label>Base Price per sq.ft *</label>
                    <input
                      type="number"
                      min="0"
                      step="0.01"
                      value={estimationForm.basePricePerSqFt}
                      onChange={(e) => handleEstimationChange('basePricePerSqFt', e.target.value)}
                      placeholder="e.g., 4500"
                    />
                  </div>

                  <div className="form-field">
                    <label>Property Age *</label>
                    <select
                      value={estimationForm.propertyAgeBand}
                      onChange={(e) => handleEstimationChange('propertyAgeBand', e.target.value)}
                    >
                      <option value="">Select age band</option>
                      {ESTIMATION_AGE_OPTIONS.map((option) => (
                        <option key={option.value} value={option.value}>{option.label}</option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="estimation-options">
                  <div className="estimation-option-group">
                    <h3>Amenities</h3>
                    <div className="checkbox-grid">
                      {ESTIMATION_AMENITIES.map((amenity) => (
                        <label key={amenity.value} className="checkbox-pill">
                          <input
                            type="checkbox"
                            checked={estimationForm.amenities.includes(amenity.value)}
                            onChange={() => toggleEstimationSelection('amenities', amenity.value)}
                          />
                          <span>{amenity.label}</span>
                        </label>
                      ))}
                    </div>
                  </div>

                  <div className="estimation-option-group">
                    <h3>Improvements</h3>
                    <div className="checkbox-grid">
                      {ESTIMATION_IMPROVEMENTS.map((improvement) => (
                        <label key={improvement.value} className="checkbox-pill">
                          <input
                            type="checkbox"
                            checked={estimationForm.improvements.includes(improvement.value)}
                            onChange={() => toggleEstimationSelection('improvements', improvement.value)}
                          />
                          <span>{improvement.label}</span>
                        </label>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="estimation-actions">
                  <button className="submit-estimation-btn" type="submit" disabled={estimationLoading}>
                    {estimationLoading ? 'Calculating...' : 'Calculate Estimation'}
                  </button>
                </div>
              </form>

              {estimationResult && (
                <div className="estimation-results">
                  <h3>Estimation Result</h3>
                  <div className="result-grid">
                    <div className="result-card">
                      <span className="result-label">Base Price</span>
                      <span className="result-value">{formatRupees(estimationResult.basePrice)}</span>
                    </div>
                    <div className="result-card">
                      <span className="result-label">Location Percentage</span>
                      <span className="result-value">{estimationResult.locationPercentage}%</span>
                    </div>
                    <div className="result-card">
                      <span className="result-label">Age Percentage</span>
                      <span className="result-value">{estimationResult.agePercentage}%</span>
                    </div>
                    <div className="result-card">
                      <span className="result-label">Total Amenities</span>
                      <span className="result-value">{estimationResult.totalAmenitiesPercentage}%</span>
                    </div>
                    <div className="result-card">
                      <span className="result-label">Total Improvements</span>
                      <span className="result-value">{estimationResult.totalImprovementsPercentage}%</span>
                    </div>
                    <div className="result-card highlight">
                      <span className="result-label">Current Property Value</span>
                      <span className="result-value">{formatRupees(estimationResult.currentPropertyValue)}</span>
                    </div>
                    <div className="result-card highlight">
                      <span className="result-label">Improved Property Value</span>
                      <span className="result-value">{formatRupees(estimationResult.improvedPropertyValue)}</span>
                    </div>
                    <div className="result-card highlight">
                      <span className="result-label">Estimated Value Increase</span>
                      <span className="result-value">{formatRupees(estimationResult.estimatedValueIncrease)}</span>
                    </div>
                  </div>

                  <div className="result-summary-table">
                    <div className="summary-row">
                      <span>Property</span>
                      <strong>{estimationResult.propertyTitle}</strong>
                    </div>
                    <div className="summary-row">
                      <span>Location Type</span>
                      <strong>{estimationResult.locationType}</strong>
                    </div>
                    <div className="summary-row">
                      <span>Property Age</span>
                      <strong>{estimationResult.propertyAgeBand}</strong>
                    </div>
                    <div className="summary-row">
                      <span>Recommendation</span>
                      <strong>{estimationResult.recommendationMessage}</strong>
                    </div>
                  </div>
                </div>
              )}
            </div>
            <div className="modal-footer">
              {estimationResult && (
                <button className="btn btn-primary" onClick={handleSaveEstimationResult}>
                  💾 Save Estimation & Update Homeowner
                </button>
              )}
              <button className="btn btn-secondary" onClick={() => setShowEstimationModal(false)}>Close</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminDashboard;
