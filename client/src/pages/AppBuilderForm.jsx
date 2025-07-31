import React, { useState, useEffect } from 'react';
import axios from '../services/api';
import { 
  CloudArrowUpIcon as CloudUploadIcon, 
  PlusIcon, 
  TrashIcon, 
  CheckIcon as CheckCircleIcon,
  ExclamationTriangleIcon as ExclamationCircleIcon,
  DocumentArrowDownIcon as DocumentDownloadIcon,
  Cog6ToothIcon as CogIcon,
  CircleStackIcon as DatabaseIcon
} from '@heroicons/react/24/outline';
import LoadingSpinner from '../components/LoadingSpinner';
import Notification from '../components/Notification';
import ProgressBar from '../components/ProgressBar';

function AppBuilderForm() {
  // Form states
  const [formData, setFormData] = useState({
    studyId: '',
    changesetId: '',
    modelInfo: {
      name: '',
      displayName: ''
    },
    dashboardId: ''
  });

  // File upload states
  const [file, setFile] = useState(null);
  const [selectedFileName, setSelectedFileName] = useState('');
  const [isFileUploaded, setIsFileUploaded] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [isUploading, setIsUploading] = useState(false);

  // Database states
  const [objectClasses, setObjectClasses] = useState([]);
  const [isLoadingClasses, setIsLoadingClasses] = useState(false);

  // Objects and properties
  const [objects, setObjects] = useState([
    {
      childObjectName: '',
      childClassName: '',
      childClassLangId: '',
      childClassId: '',
      parentClassLangId: 1,
      parentObjectName: 'System',
      properties: [{ propertyLangId: '', type: '0' }]
    }
  ]);

  // Available properties for each object
  const [availableProperties, setAvailableProperties] = useState({});

  // Configuration states
  const [config, setConfig] = useState({
    isInputEditable: true,
    isRunAllowed: true,
    allowOutputSelections: true,
    horizonEnabled: true
  });

  const [runConfig, setRunConfig] = useState({
  engineVersion: '10.0 R07',
  operatingSystem: 'Linux',
    cores: 16,
    memory: '128GB'
  });

  // UI states
  const [activeStep, setActiveStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [generatedConfig, setGeneratedConfig] = useState(null);
  const [error, setError] = useState('');

  const steps = [
    { id: 1, name: 'Basic Info', description: 'Study and model information' },
    { id: 2, name: 'Database', description: 'Upload reference database' },
    { id: 3, name: 'Objects', description: 'Configure objects and properties' },
    { id: 4, name: 'Run Config', description: 'Engine and resource settings' },
    { id: 5, name: 'Generate', description: 'Create JSON configuration' }
  ];

  // Handle file upload
  const handleFileUpload = async () => {
    if (!file) {
      setError('Please select a file first');
      return;
    }

    setIsUploading(true);
    setError('');
    setUploadProgress(0);

    const formData = new FormData();
    formData.append('file', file);

    try {
      const response = await axios.post('/api/upload-reference-db', formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        },
        onUploadProgress: (progressEvent) => {
          const progress = Math.round((progressEvent.loaded * 100) / progressEvent.total);
          setUploadProgress(progress);
        }
      });

      setIsFileUploaded(true);
      setError('');
      
      // Load object classes after successful upload
      await loadObjectClasses();
      
    } catch (err) {
      setError(err.response?.data?.error || 'File upload failed');
      setIsFileUploaded(false);
    } finally {
      setIsUploading(false);
      setUploadProgress(0);
    }
  };

  // Load object classes from database
  const loadObjectClasses = async () => {
    if (!isFileUploaded) return;

    setIsLoadingClasses(true);
    try {
      const response = await axios.post('/api/getObjectClasses', {
        dbPath: './uploads/references.db'
      });
      setObjectClasses(response.data.objectClasses);
    } catch (err) {
      setError('Failed to load object classes');
    } finally {
      setIsLoadingClasses(false);
    }
  };

  // Get class IDs for objects
  const getClassIds = async (childObjectName, childClassName) => {
    try {
      const response = await axios.post('/api/getClassIds', {
        childObjectName,
        childClassName,
        parentObjectName: 'System',
        dbPath: './uploads/references.db'
      });
      return response.data;
    } catch (err) {
      throw new Error(err.response?.data?.error || 'Failed to get class IDs');
    }
  };

  // Get properties for a class
  const getProperties = async (childClassId, parentClassId = 1) => {
    try {
      const response = await axios.post('/api/getProperties', {
        childClassId,
        parentClassId,
        dbPath: './uploads/references.db'
      });
      return response.data.properties;
    } catch (err) {
      throw new Error(err.response?.data?.error || 'Failed to get properties');
    }
  };

  // Handle object changes
  const handleObjectChange = async (objIndex, field, value) => {
    const updated = [...objects];
    updated[objIndex][field] = value;
    setObjects(updated);

    // Auto-fetch class IDs when both child object name and child class name are entered
    if ((field === 'childObjectName' || field === 'childClassName') && isFileUploaded) {
      const obj = updated[objIndex];
      if (obj.childObjectName && obj.childClassName) {
        try {
          const classData = await getClassIds(obj.childObjectName, obj.childClassName);
          updated[objIndex].childClassLangId = classData.childClassLangId;
          updated[objIndex].childClassId = classData.childClassId;
          updated[objIndex].parentClassLangId = classData.parentClassLangId;
          setObjects(updated);
          
          // Fetch properties for this object
          await fetchPropertiesForObject(objIndex);
        } catch (err) {
          console.log('Could not fetch class IDs:', err.message);
        }
      }
    }
  };

  // Handle property changes
  const handlePropertyChange = (objIndex, propIndex, field, value) => {
    const updated = [...objects];
    updated[objIndex].properties[propIndex][field] = value;
    setObjects(updated);
  };

  // Add new object
  const handleAddObject = () => {
    setObjects([
      ...objects,
      {
        childObjectName: '',
        childClassName: '',
        childClassLangId: '',
        childClassId: '',
        parentClassLangId: 1,
        parentObjectName: 'System',
        properties: [{ propertyLangId: '', type: '0' }]
      }
    ]);
  };

  // Delete object
  const handleDeleteObject = (objIndex) => {
    const updated = [...objects];
    updated.splice(objIndex, 1);
    setObjects(updated);
  };

  // Add property to object
  const handleAddProperty = (objIndex) => {
    const updated = [...objects];
    updated[objIndex].properties.push({ propertyLangId: '', type: '0' });
    setObjects(updated);
  };

  // Fetch properties for an object
  const fetchPropertiesForObject = async (objIndex) => {
    const obj = objects[objIndex];
    if (obj.childClassId && isFileUploaded) {
      try {
        const properties = await getProperties(obj.childClassId, obj.parentClassLangId);
        setAvailableProperties(prev => ({
          ...prev,
          [objIndex]: properties
        }));
        return properties;
      } catch (err) {
        console.log('Could not fetch properties:', err.message);
        setAvailableProperties(prev => ({
          ...prev,
          [objIndex]: []
        }));
        return [];
      }
    }
    return [];
  };

  // Delete property
  const handleDeleteProperty = (objIndex, propIndex) => {
    const updated = [...objects];
    updated[objIndex].properties.splice(propIndex, 1);
    setObjects(updated);
  };

  // Generate configuration
  const handleGenerateConfig = async () => {
    setIsSubmitting(true);
    setError('');

    try {
      const response = await axios.post('/api/create-configuration', {
        studyId: formData.studyId,
        changesetId: formData.changesetId,
        modelInfo: formData.modelInfo,
        dashboardId: formData.dashboardId,
        objects: objects,
        runConfiguration: {
          engineVersion: runConfig.engineVersion,
          operatingSystem: runConfig.operatingSystem,
          cores: runConfig.cores,
          memory: runConfig.memory
        },
        dbPath: './uploads/references.db'
      });

      setGeneratedConfig(response.data);
      setActiveStep(5);
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to generate configuration');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Download configuration
  const handleDownload = async (fileName) => {
    try {
      const response = await axios.get(`/api/download/${fileName}`, {
        responseType: 'blob'
      });
      
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', fileName);
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (err) {
      setError('Failed to download configuration');
    }
  };

  // Reset all form data to initial state
  const resetForm = async () => {
    // Show confirmation dialog
    const confirmed = window.confirm(
      'Are you sure you want to reset everything? This will delete the uploaded database and clear all form data.'
    );
    
    if (!confirmed) {
      return;
    }

    try {
      // Delete uploaded database file
      if (isFileUploaded) {
        await axios.delete('/api/delete-uploaded-db');
      }
    } catch (err) {
      console.log('Could not delete uploaded database:', err.message);
    }

    // Reset all form states
    setFormData({
      studyId: '',
      changesetId: '',
      modelInfo: {
        name: '',
        displayName: ''
      },
      dashboardId: ''
    });

    setFile(null);
    setSelectedFileName('');
    setIsFileUploaded(false);
    setUploadProgress(0);
    setIsUploading(false);

    setObjectClasses([]);
    setIsLoadingClasses(false);

    setObjects([
      {
        childObjectName: '',
        childClassName: '',
        childClassLangId: '',
        childClassId: '',
        parentClassLangId: 1,
        parentObjectName: 'System',
        properties: [{ propertyLangId: '', type: '0' }]
      }
    ]);

    setConfig({
      isInputEditable: true,
      isRunAllowed: true,
      allowOutputSelections: true,
      horizonEnabled: true
    });

    setRunConfig({
      engineVersion: '10.0 R07',
      operatingSystem: 'Linux',
      cores: 16,
      memory: '128GB'
    });

    setActiveStep(1);
    setIsSubmitting(false);
    setGeneratedConfig(null);
    setError('');
    setAvailableProperties({});

    // Show success message
    alert('Form reset successfully! You can now start a new configuration.');
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex justify-between items-center mb-4">
            <div></div>
            <div>
              <h1 className="text-4xl font-bold text-gray-900 mb-2">
                JSON Config Generator for PLEXOS Apps
              </h1>
              {/* <p className="text-lg text-gray-600">
                Create professional JSON configurations for your PLEXOS applications
              </p> */}
            </div>
            <button
              type="button"
              onClick={resetForm}
              className="bg-red-600 text-white px-4 py-2 rounded-md hover:bg-red-700 text-sm"
              title="Reset all data and start over"
            >
              Reset All
            </button>
          </div>
        </div>

        {/* Progress Steps */}
        <div className="mb-8">
          <nav aria-label="Progress">
            <ol className="flex items-center justify-center">
              {steps.map((step, stepIdx) => (
                <li key={step.name} className={`relative ${stepIdx !== steps.length - 1 ? 'pr-8 sm:pr-20' : ''} ${stepIdx !== 0 ? 'pl-8 sm:pl-20' : ''}`}>
                  <div className="absolute inset-0 flex items-center" aria-hidden="true">
                    {stepIdx !== 0 && (
                      <div className={`h-0.5 w-full ${stepIdx < activeStep ? 'bg-blue-600' : 'bg-gray-300'}`} />
                    )}
                  </div>
                  <div className={`relative flex h-8 w-8 items-center justify-center rounded-full ${
                    step.id < activeStep ? 'bg-blue-600' : step.id === activeStep ? 'bg-blue-600' : 'bg-gray-300'
                  }`}>
                    {step.id < activeStep ? (
                      <CheckCircleIcon className="h-5 w-5 text-white" />
                    ) : (
                      <span className={`text-sm font-medium ${step.id === activeStep ? 'text-white' : 'text-gray-500'}`}>
                        {step.id}
                      </span>
                    )}
                  </div>
                  <div className="absolute top-10 left-1/2 transform -translate-x-1/2">
                    <span className={`text-xs font-medium ${step.id === activeStep ? 'text-blue-600' : 'text-gray-500'}`}>
                      {step.name}
                    </span>
                  </div>
                </li>
              ))}
            </ol>
          </nav>
        </div>

        {/* Error Display */}
        {error && (
          <div className="mb-6">
            <Notification
              type="error"
              message={error}
              onClose={() => setError('')}
            />
          </div>
        )}

        {/* Form Content */}
        <div className="bg-white shadow-xl rounded-lg">
          {/* Step 1: Basic Information */}
          {activeStep === 1 && (
            <div className="p-8">
              <div className="mb-6">
                <h2 className="text-2xl font-semibold text-gray-900 mb-4">Basic Information</h2>
                <p className="text-gray-600">Enter your study and model information</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Study ID
                  </label>
                  <input
                    type="text"
                    value={formData.studyId}
                    onChange={(e) => setFormData({ ...formData, studyId: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Enter Study ID"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Changeset ID
                  </label>
                  <input
                    type="text"
                    value={formData.changesetId}
                    onChange={(e) => setFormData({ ...formData, changesetId: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Enter Changeset ID"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Model Name
                  </label>
                  <input
                    type="text"
                    value={formData.modelInfo.name}
                    onChange={(e) => setFormData({ 
                      ...formData, 
                      modelInfo: { ...formData.modelInfo, name: e.target.value }
                    })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Enter Model Name"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Model Display Name
                  </label>
                  <input
                    type="text"
                    value={formData.modelInfo.displayName}
                    onChange={(e) => setFormData({ 
                      ...formData, 
                      modelInfo: { ...formData.modelInfo, displayName: e.target.value }
                    })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Enter Display Name"
                  />
                </div>

                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Dashboard ID
                  </label>
                  <input
                    type="text"
                    value={formData.dashboardId}
                    onChange={(e) => setFormData({ ...formData, dashboardId: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Enter Dashboard ID"
                  />
                </div>
              </div>

              <div className="mt-8 flex justify-end">
                <button
                  type="button"
                  onClick={() => setActiveStep(2)}
                  disabled={!formData.studyId || !formData.changesetId || !formData.modelInfo.name || !formData.dashboardId}
                  className="bg-blue-600 text-white px-6 py-2 rounded-md hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed"
                >
                  Next
                </button>
              </div>
            </div>
          )}

          {/* Step 2: Database Upload */}
          {activeStep === 2 && (
            <div className="p-8">
              <div className="mb-6">
                <h2 className="text-2xl font-semibold text-gray-900 mb-4">Database Upload</h2>
                <p className="text-gray-600">Upload your reference database file</p>
              </div>

              <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center">
                <DatabaseIcon className="mx-auto h-12 w-12 text-gray-400" />
                <div className="mt-4">
          <input
            type="file"
                    onChange={(e) => {
              setFile(e.target.files[0]);
              setSelectedFileName(e.target.files[0]?.name || '');
              setIsFileUploaded(false);
            }}
            accept=".db"
                    className="hidden"
                    id="file-upload"
                  />
                  <label
                    htmlFor="file-upload"
                    className="cursor-pointer bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700"
                  >
                    Choose Database File
                  </label>
                </div>
                {selectedFileName && (
                  <p className="mt-2 text-sm text-gray-600">Selected: {selectedFileName}</p>
                )}
              </div>

          {selectedFileName && !isFileUploaded && (
                <div className="mt-6">
            <button
              type="button"
              onClick={handleFileUpload}
                    disabled={isUploading}
                    className="w-full bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700 disabled:bg-gray-300"
                  >
                                         {isUploading ? (
                       <div className="w-full">
                         <LoadingSpinner size="sm" text={`Uploading... ${uploadProgress}%`} />
                         <ProgressBar progress={uploadProgress} className="mt-2" />
                       </div>
                     ) : (
                       <div className="flex items-center justify-center">
                         <CloudUploadIcon className="h-5 w-5 mr-2" />
                         Upload Database
                       </div>
                     )}
            </button>
                </div>
          )}

          {isFileUploaded && (
                 <div className="mt-6">
                   <Notification
                     type="success"
                     message="Database uploaded successfully!"
                   />
                 </div>
               )}

              <div className="mt-8 flex justify-between">
                <button
                  type="button"
                  onClick={() => setActiveStep(1)}
                  className="bg-gray-300 text-gray-700 px-6 py-2 rounded-md hover:bg-gray-400"
                >
                  Previous
                </button>
                <button
                  type="button"
                  onClick={() => setActiveStep(3)}
                  disabled={!isFileUploaded}
                  className="bg-blue-600 text-white px-6 py-2 rounded-md hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed"
                >
                  Next
                </button>
              </div>
            </div>
          )}

          {/* Step 3: Objects Configuration */}
          {activeStep === 3 && (
            <div className="p-8">
              <div className="mb-6">
                <h2 className="text-2xl font-semibold text-gray-900 mb-4">Objects Configuration</h2>
                <p className="text-gray-600">Configure objects and their properties</p>
              </div>

              <div className="space-y-6">
                {objects.map((obj, objIndex) => (
                  <div key={objIndex} className="border border-gray-200 rounded-lg p-6 bg-gray-50">
                    <div className="flex justify-between items-center mb-4">
                      <h3 className="text-lg font-medium text-gray-900">Object {objIndex + 1}</h3>
                      <button
                        type="button"
                        onClick={() => handleDeleteObject(objIndex)}
                        className="text-red-600 hover:text-red-800"
                      >
                        <TrashIcon className="h-5 w-5" />
                      </button>
        </div>

                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Child Object Name
                        </label>
                        <input
                          type="text"
                          value={obj.childObjectName}
                          onChange={(e) => handleObjectChange(objIndex, 'childObjectName', e.target.value)}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                          placeholder="Enter child object name"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Child Class Name
                        </label>
                        <input
                          type="text"
                          value={obj.childClassName}
                          onChange={(e) => handleObjectChange(objIndex, 'childClassName', e.target.value)}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                          placeholder="Enter child class name"
                        />
                      </div>
                    </div>

                    <div className="mb-4">
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Parent Object Name
                      </label>
                      <input
                        type="text"
                        value={obj.parentObjectName}
                        onChange={(e) => handleObjectChange(objIndex, 'parentObjectName', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="System (default)"
                      />
                      <p className="text-xs text-gray-500 mt-1">Default: System (editable if needed)</p>
                    </div>

                    <div className="mb-4">
                      <h4 className="text-md font-medium text-gray-900 mb-2">Properties</h4>
                      <div className="space-y-2">
                                    {obj.properties.map((prop, propIndex) => (
                          <div key={propIndex} className="flex gap-2">
                            <select
                              value={prop.propertyLangId}
                              onChange={(e) => handlePropertyChange(objIndex, propIndex, 'propertyLangId', e.target.value)}
                              className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                            >
                              <option value="">Select Property</option>
                              {availableProperties[objIndex]?.map((property) => (
                                <option key={property.PropertyLangID} value={property.PropertyLangID}>
                                  {property.Name}
                                </option>
                              ))}
                            </select>
                            <select
                              value={prop.type}
                              onChange={(e) => handlePropertyChange(objIndex, propIndex, 'type', e.target.value)}
                              className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                            >
                              <option value="0">Text Field</option>
                              <option value="1">File Picker</option>
                            </select>
                            <button
                              type="button"
                              onClick={() => handleDeleteProperty(objIndex, propIndex)}
                              className="px-3 py-2 text-red-600 hover:text-red-800"
                            >
                              <TrashIcon className="h-4 w-4" />
                            </button>
                          </div>
                        ))}
                      </div>
                      <button
                        type="button"
                        onClick={() => handleAddProperty(objIndex)}
                        className="mt-2 text-blue-600 hover:text-blue-800 text-sm"
                      >
                        <PlusIcon className="h-4 w-4 inline mr-1" />
                        Add Property
                      </button>
                    </div>
          </div>
        ))}

                <button
                  type="button"
                  onClick={handleAddObject}
                  className="w-full border-2 border-dashed border-gray-300 rounded-lg p-4 text-gray-600 hover:text-gray-800 hover:border-gray-400"
                >
                  <PlusIcon className="h-5 w-5 inline mr-2" />
                  Add Object
                </button>
      </div>

              <div className="mt-8 flex justify-between">
                <button
                  type="button"
                  onClick={() => setActiveStep(2)}
                  className="bg-gray-300 text-gray-700 px-6 py-2 rounded-md hover:bg-gray-400"
                >
                  Previous
                </button>
                <button
                  type="button"
                  onClick={() => setActiveStep(4)}
                  className="bg-blue-600 text-white px-6 py-2 rounded-md hover:bg-blue-700"
                >
                  Next
                </button>
              </div>
            </div>
          )}

          {/* Step 4: Run Configuration */}
          {activeStep === 4 && (
            <div className="p-8">
              <div className="mb-6">
                <h2 className="text-2xl font-semibold text-gray-900 mb-4">Run Configuration</h2>
                <p className="text-gray-600">Configure engine and resource settings</p>
      </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Engine Version
                  </label>
        <select 
          value={runConfig.engineVersion} 
                    onChange={(e) => setRunConfig({ ...runConfig, engineVersion: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="11.0 R02">11.0 R02</option>
          <option value="11.0 R01">11.0 R01</option>
          <option value="10.0 R08">10.0 R08</option>
          <option value="10.0 R07">10.0 R07</option>
          <option value="10.0 R06">10.0 R06</option>
          <option value="10.0 R05">10.0 R05</option>
        </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Operating System
                  </label>
        <select 
          value={runConfig.operatingSystem} 
                    onChange={(e) => setRunConfig({ ...runConfig, operatingSystem: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="Linux">Linux</option>
          <option value="Windows">Windows</option>
        </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    CPU Cores
                  </label>
          <select
                    value={runConfig.cores}
                    onChange={(e) => setRunConfig({ ...runConfig, cores: Number(e.target.value) })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value={2}>2 Cores</option>
            <option value={4}>4 Cores</option>
            <option value={8}>8 Cores</option>
            <option value={16}>16 Cores</option>
            <option value={20}>20 Cores</option>
            <option value={32}>32 Cores</option>
            <option value={48}>48 Cores</option>
            <option value={64}>64 Cores</option>
          </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Memory
                  </label>
          <select
                    value={runConfig.memory}
                    onChange={(e) => setRunConfig({ ...runConfig, memory: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="16GB">16 GB</option>
            <option value="32GB">32 GB</option>
            <option value="64GB">64 GB</option>
            <option value="128GB">128 GB</option>
            <option value="160GB">160 GB</option>
            <option value="256GB">256 GB</option>
            <option value="384GB">384 GB</option>
            <option value="512GB">512 GB</option>
          </select>
        </div>
      </div>

              <div className="mt-8 flex justify-between">
                <button
                  type="button"
                  onClick={() => setActiveStep(3)}
                  className="bg-gray-300 text-gray-700 px-6 py-2 rounded-md hover:bg-gray-400"
                >
                  Previous
                </button>
                <button
                  type="button"
                  onClick={handleGenerateConfig}
                  disabled={isSubmitting}
                  className="bg-green-600 text-white px-6 py-2 rounded-md hover:bg-green-700 disabled:bg-gray-300"
                >
                                     {isSubmitting ? (
                     <LoadingSpinner size="sm" text="Generating..." />
                   ) : (
                     'Generate Configuration'
                   )}
                </button>
              </div>
            </div>
          )}

          {/* Step 5: Success */}
          {activeStep === 5 && generatedConfig && (
            <div className="p-8">
              <div className="text-center mb-8">
                <CheckCircleIcon className="mx-auto h-16 w-16 text-green-500 mb-4" />
                <h2 className="text-2xl font-semibold text-gray-900 mb-2">Configuration Generated!</h2>
                <p className="text-gray-600">Your JSON configuration has been created successfully.</p>
              </div>

              <div className="bg-gray-50 rounded-lg p-6 mb-6">
                <h3 className="text-lg font-medium text-gray-900 mb-4">Configuration Details</h3>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="font-medium">File Name:</span> {generatedConfig.fileName}
                  </div>
                  <div>
                    <span className="font-medium">Study ID:</span> {formData.studyId}
                  </div>
                  <div>
                    <span className="font-medium">Objects:</span> {objects.length}
                  </div>
                  <div>
                    <span className="font-medium">Engine:</span> {runConfig.engineVersion}
                  </div>
                </div>
              </div>

              <div className="flex justify-center space-x-4">
                <button
                  type="button"
                  onClick={() => handleDownload(generatedConfig.fileName)}
                  className="bg-blue-600 text-white px-6 py-2 rounded-md hover:bg-blue-700 flex items-center"
                >
                  <DocumentDownloadIcon className="h-5 w-5 mr-2" />
                  Download Configuration
                </button>
                <button
                  type="button"
                  onClick={resetForm}
                  className="bg-gray-300 text-gray-700 px-6 py-2 rounded-md hover:bg-gray-400"
                >
                  Create New Configuration
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default AppBuilderForm;
