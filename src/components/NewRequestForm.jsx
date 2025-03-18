// src/components/NewRequestForm.jsx
import React, { useState, useEffect, useRef, useContext } from 'react';
import ReactQuill from 'react-quill';
import axios from 'axios';
import 'react-quill/dist/quill.snow.css';
import { AuthContext } from '../context/AuthContext';

// Helper function to add working days (skipping weekends)
const addWorkingDays = (dateStr, days) => {
  let date = new Date(dateStr);
  let added = 0;
  while (added < days) {
    date.setDate(date.getDate() + 1);
    if (date.getDay() !== 0 && date.getDay() !== 6) {
      added++;
    }
  }
  return date;
};

// Format Date as YYYY-MM-DD
const formatDate = (d) => {
  const yyyy = d.getFullYear();
  let mm = d.getMonth() + 1;
  let dd = d.getDate();
  if (mm < 10) mm = '0' + mm;
  if (dd < 10) dd = '0' + dd;
  return `${yyyy}-${mm}-${dd}`;
};

// Generate a 4-digit FOI Case Reference
const generateFOIReference = () => {
  const randomNum = Math.floor(1000 + Math.random() * 9000); // Generates a 4-digit number
  return `FOI-${randomNum}`;
};

// Generate a 7-digit Audit Reference
const generateAuditReference = () => {
  const financialYear = new Date().getFullYear().toString().slice(2); // last two digits of the current year
  const randomNum = Math.floor(100 + Math.random() * 900); // Generates a 3-digit number
  return `${financialYear}${randomNum}`;
};

const NewRequestForm = () => {
  const { auth } = useContext(AuthContext);
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    requestType: '',
    requestTitle: '',
    submissionDate: '',
    details: '',
    foiCaseRef: '',  // FOI Case Reference
    auditCaseRef: '', // Audit Case Reference
    responseDeadline: '',
    internalDeadline: '',
    auditPeriodFrom: '',
    auditPeriodTo: '',
    additionalParams: ''
  });
  const [attachments, setAttachments] = useState([]);
  const [previewHTML, setPreviewHTML] = useState('');
  const [toast, setToast] = useState('');
  const [toastVisible, setToastVisible] = useState(false);
  const quillRef = useRef(null);

  // Show a toast notification for 3 seconds
  const showToast = (message) => {
    setToast(message);
    setToastVisible(true);
    setTimeout(() => setToastVisible(false), 3000);
  };

  // Calculate deadlines when submissionDate or requestType changes
  useEffect(() => {
    // Automatically set today's date as the submission date when the form loads
    const today = new Date();
    setFormData(prev => ({
      ...prev,
      submissionDate: formatDate(today), // Set the current date
    }));

    // Auto-generate FOI and Audit references when the request type is selected
    if (formData.requestType === 'FOI' && !formData.foiCaseRef) {
      const newFOIReference = generateFOIReference();
      setFormData(prev => ({
        ...prev,
        foiCaseRef: newFOIReference,
      }));
    }

    if (formData.requestType === 'Audit' && !formData.auditCaseRef) {
      const newAuditReference = generateAuditReference();
      setFormData(prev => ({
        ...prev,
        auditCaseRef: newAuditReference,
      }));
    }
  }, [formData.requestType]);  // Re-run when the request type changes

  // Handle file drop and selection (if using file uploads)
  const handleFileDrop = (e) => {
    e.preventDefault();
    setAttachments(Array.from(e.dataTransfer.files));
  };
  const handleFileSelect = (e) => {
    setAttachments(Array.from(e.target.files));
  };

  // Pre-populate Quill editor based on template selection
  const handleTemplateChange = (e) => {
    const template = e.target.value;
    let content = '';
    if (template === 'FOI') {
      content = `<p><strong>FOI case ref:</strong> [Enter Case Ref]</p>
                 <p>The Trust has received a request under the Freedom of Information Act 2000. Please provide the following details:</p>
                 <ol>
                   <li>Data for 2024</li>
                   <li>Data for 2023</li>
                   <li>Data for previous years if applicable</li>
                 </ol>`;
    } else if (template === 'Audit') {
      content = `<p>For the audit request, please provide the following information:</p>
                 <ul>
                   <li>Patient PAS</li>
                   <li>Patient Name</li>
                   <li>Date of Attendance</li>
                   <li>Diagnosis</li>
                 </ul>`;
    } else if (template === 'Adhoc') {
      content = `<p>Please provide the data for the requested registry:</p>
                 <ul>
                   <li>PAS Number</li>
                   <li>Patient Name</li>
                   <li>Date of Surgery</li>
                   <li>Type of Surgery</li>
                   <li>Operating Surgeon</li>
                 </ul>`;
    }
    setFormData(prev => ({
      ...prev,
      details: content
    }));
  };

  // Generate a preview of the submission
  const generatePreview = () => {
    let preview = `<p><strong>Request Type:</strong> ${formData.requestType}</p>
                   <p><strong>Request Title:</strong> ${formData.requestTitle}</p>
                   <p><strong>Submission Date:</strong> ${formData.submissionDate}</p>`;
    if (formData.requestType === 'FOI') {
      preview += `<p><strong>FOI Case Reference:</strong> ${formData.foiCaseRef}</p>
                  <p><strong>Response Deadline:</strong> ${formData.responseDeadline}</p>
                  <p><strong>Internal Deadline:</strong> ${formData.internalDeadline}</p>`;
    }
    if (formData.requestType === 'Audit') {
      preview += `<p><strong>Audit Period:</strong> From ${formData.auditPeriodFrom} to ${formData.auditPeriodTo}</p>`;
    }
    if (formData.requestType === 'Adhoc') {
      preview += `<p><strong>Additional Parameters:</strong> ${formData.additionalParams}</p>`;
    }
    preview += `<p><strong>Request Details:</strong></p>${formData.details}`;
    setPreviewHTML(preview);
  };

  // Handle form submission with API integration
  const handleSubmit = async (e) => {
    e.preventDefault();

    // Check if user is authenticated
    if (!auth || !auth.token) {
      alert("You must be signed in to submit a request.");
      return;
    }

    try {
      // Assign FOI and Audit References automatically
      const newFOIReference = generateFOIReference();
      const newAuditReference = generateAuditReference();

      // Prepare submission data including references
      const submissionData = {
        requestType: formData.requestType,
        requestTitle: formData.requestTitle,
        submissionDate: formData.submissionDate,
        details: formData.details,
        foiCaseRef: newFOIReference,
        auditCaseRef: newAuditReference, // Assigning new audit reference
        responseDeadline: formData.responseDeadline,
        internalDeadline: formData.internalDeadline,
        auditPeriodFrom: formData.auditPeriodFrom,
        auditPeriodTo: formData.auditPeriodTo,
        additionalParams: formData.additionalParams,
        // Attachments can be handled separately if needed
      };

      // POST the request to your API endpoint, including the auth token in headers
      const response = await axios.post('https://foi-data-request-backend-88ad83e1d7ba.herokuapp.com/api/requests', submissionData, {
        headers: {
          Authorization: `Bearer ${auth.token}`,
          'Content-Type': 'application/json'
        }
      });

      showToast('Request submitted successfully!');
      // Reset form state after submission
      setFormData({
        requestType: '',
        requestTitle: '',
        submissionDate: '',
        details: '',
        foiCaseRef: '',
        auditCaseRef: '', // Reset audit reference
        responseDeadline: '',
        internalDeadline: '',
        auditPeriodFrom: '',
        auditPeriodTo: '',
        additionalParams: ''
      });
      setAttachments([]);
      setStep(1);
    } catch (error) {
      console.error('Submission error:', error.response ? error.response.data : error);
      alert(
        error.response && error.response.data && error.response.data.message
          ? error.response.data.message
          : 'Submission failed. Please try again.'
      );
    }
  };

  return (
    <main className="max-w-4xl mx-auto mt-10 px-4">
      <form onSubmit={handleSubmit} className="bg-white p-6 rounded shadow" noValidate aria-live="polite">
        {/* Step 1: Basic Information */}
        {step === 1 && (
          <div>
            <h2 className="text-2xl font-bold mb-4 text-nhs-dark-blue">Step 1: Basic Information</h2>
            <div className="mb-4">
              <label htmlFor="requestType" className="block font-semibold text-gray-700 mb-2">Request Type</label>
              <select
                id="requestType"
                value={formData.requestType}
                onChange={(e) => setFormData({ ...formData, requestType: e.target.value })}
                className="border border-gray-300 p-2 rounded w-full"
                required
              >
                <option value="">Select Request Type</option>
                <option value="FOI">FOI</option>
                <option value="Audit">Audit</option>
                <option value="Adhoc">Ad hoc</option>
              </select>
            </div>
            <div className="mb-4">
              <label htmlFor="requestTitle" className="block font-semibold text-gray-700 mb-2">Request Title</label>
              <input
                type="text"
                id="requestTitle"
                value={formData.requestTitle}
                onChange={(e) => setFormData({ ...formData, requestTitle: e.target.value })}
                className="border border-gray-300 p-2 rounded w-full"
                placeholder="e.g., Quarterly Data Analysis"
                required
              />
            </div>
            <div className="mb-4">
              <label htmlFor="submissionDate" className="block font-semibold text-gray-700 mb-2">Submission Date</label>
              <input
                type="date"
                id="submissionDate"
                value={formData.submissionDate}
                onChange={(e) => setFormData({ ...formData, submissionDate: e.target.value })}
                className="border border-gray-300 p-2 rounded w-full"
                required
              />
            </div>
            {/* Conditional Fields for FOI */}
            {formData.requestType === 'FOI' && (
              <div id="foiFields">
                <div className="mb-4">
                  <label htmlFor="foiCaseRef" className="block font-semibold text-gray-700 mb-2">FOI Case Reference</label>
                  <input
                    type="text"
                    id="foiCaseRef"
                    value={formData.foiCaseRef}
                    onChange={(e) => setFormData({ ...formData, foiCaseRef: e.target.value })}
                    className="border border-gray-300 p-2 rounded w-full"
                    placeholder="Enter FOI Case Reference"
                    readOnly
                  />
                </div>
                <div className="mb-4">
                  <label htmlFor="responseDeadline" className="block font-semibold text-gray-700 mb-2">Response Deadline</label>
                  <input
                    type="date"
                    id="responseDeadline"
                    value={formData.responseDeadline}
                    readOnly
                    className="border border-gray-300 p-2 rounded w-full"
                  />
                  <p className="text-xs text-gray-500">Calculated as 10 working days from submission date.</p>
                </div>
                <div className="mb-4">
                  <label htmlFor="internalDeadline" className="block font-semibold text-gray-700 mb-2">Internal Deadline</label>
                  <input
                    type="date"
                    id="internalDeadline"
                    value={formData.internalDeadline}
                    readOnly
                    className="border border-gray-300 p-2 rounded w-full"
                  />
                  <p className="text-xs text-gray-500">Calculated as 20 working days from submission date minus internal processing time.</p>
                </div>
              </div>
            )}
            {/* Conditional Fields for Audit */}
            {formData.requestType === 'Audit' && (
              <div id="auditFields">
                <div className="mb-4">
                  <label htmlFor="auditPeriodFrom" className="block font-semibold text-gray-700 mb-2">Audit Period - From</label>
                  <input
                    type="date"
                    id="auditPeriodFrom"
                    value={formData.auditPeriodFrom}
                    onChange={(e) => setFormData({ ...formData, auditPeriodFrom: e.target.value })}
                    className="border border-gray-300 p-2 rounded w-full"
                  />
                </div>
                <div className="mb-4">
                  <label htmlFor="auditPeriodTo" className="block font-semibold text-gray-700 mb-2">Audit Period - To</label>
                  <input
                    type="date"
                    id="auditPeriodTo"
                    value={formData.auditPeriodTo}
                    onChange={(e) => setFormData({ ...formData, auditPeriodTo: e.target.value })}
                    className="border border-gray-300 p-2 rounded w-full"
                  />
                </div>
              </div>
            )}
            {/* Conditional Fields for Adhoc */}
            {formData.requestType === 'Adhoc' && (
              <div id="adhocFields">
                <div className="mb-4">
                  <label htmlFor="additionalParams" className="block font-semibold text-gray-700 mb-2">Additional Parameters</label>
                  <input
                    type="text"
                    id="additionalParams"
                    value={formData.additionalParams}
                    onChange={(e) => setFormData({ ...formData, additionalParams: e.target.value })}
                    className="border border-gray-300 p-2 rounded w-full"
                    placeholder="e.g., specify registry details"
                  />
                </div>
              </div>
            )}
            <div className="flex justify-end">
              <button
                type="button"
                onClick={() => {
                  if (!formData.requestType || !formData.requestTitle || !formData.submissionDate) {
                    alert('Please fill in all required fields in Step 1.');
                    return;
                  }
                  showToast("Step 1 saved.");
                  setStep(2);
                }}
                className="bg-nhs-blue text-white px-4 py-2 rounded hover:bg-nhs-dark-blue transition"
              >
                Next
              </button>
            </div>
          </div>
        )}
        {/* Step 2: Request Details */}
        {step === 2 && (
          <div>
            <h2 className="text-2xl font-bold mb-4 text-nhs-dark-blue">Step 2: Request Details</h2>
            <div className="mb-4">
              <label htmlFor="templateSelect" className="block font-semibold text-gray-700 mb-2">Select Template (Optional)</label>
              <select
                id="templateSelect"
                onChange={handleTemplateChange}
                className="border border-gray-300 p-2 rounded w-full"
              >
                <option value="">No Template</option>
                <option value="FOI">FOI Request Template</option>
                <option value="Audit">Audit Request Template</option>
                <option value="Adhoc">Ad hoc Request Template</option>
              </select>
            </div>
            <div className="mb-4">
              <label className="block font-semibold text-gray-700 mb-2">Request Details</label>
              <ReactQuill
                ref={quillRef}
                theme="snow"
                value={formData.details}
                onChange={(value) => setFormData({ ...formData, details: value })}
              />
            </div>
            <div className="flex justify-between">
              <button
                type="button"
                onClick={() => setStep(1)}
                className="bg-gray-500 text-white px-4 py-2 rounded hover:bg-gray-600 transition"
              >
                Previous
              </button>
              <button
                type="button"
                onClick={() => {
                  if (!formData.details || formData.details.trim() === '' || formData.details === '<p><br></p>') {
                    alert('Please provide details for your request.');
                    return;
                  }
                  generatePreview();
                  setStep(3);
                }}
                className="bg-nhs-blue text-white px-4 py-2 rounded hover:bg-nhs-dark-blue transition"
              >
                Next
              </button>
            </div>
          </div>
        )}
        {/* Step 3: Attachments & Preview */}
        {step === 3 && (
          <div>
            <h2 className="text-2xl font-bold mb-4 text-nhs-dark-blue">Step 3: Attachments & Preview</h2>
            <div className="mb-4">
              <label htmlFor="attachments" className="block font-semibold text-gray-700 mb-2">Attachments</label>
              <div
                id="dropArea"
                className="border border-dashed border-gray-300 p-4 rounded w-full text-center cursor-pointer"
                onClick={() => document.getElementById('attachments').click()}
                onDragOver={(e) => { e.preventDefault(); e.currentTarget.classList.add('drag-over'); }}
                onDragLeave={(e) => { e.preventDefault(); e.currentTarget.classList.remove('drag-over'); }}
                onDrop={handleFileDrop}
              >
                <p className="text-gray-500">Drag &amp; drop files here, or click to select files.</p>
                <input
                  type="file"
                  id="attachments"
                  name="attachments"
                  className="hidden"
                  multiple
                  onChange={handleFileSelect}
                />
              </div>
              <div id="fileList" className="mt-2">
                {attachments.map((file, index) => (
                  <p key={index} className="text-sm text-gray-700">{file.name}</p>
                ))}
              </div>
              <p className="text-xs text-gray-500">Allowed file types: PDF, DOCX, JPEG. Max size per file: 5MB.</p>
            </div>
            <div className="mb-4">
              <h3 className="text-xl font-semibold text-nhs-dark-blue mb-2">Preview Your Submission</h3>
              <div id="preview" className="p-4 border border-gray-300 rounded bg-gray-50" dangerouslySetInnerHTML={{ __html: previewHTML }}></div>
            </div>
            <div className="flex justify-between">
              <button
                type="button"
                onClick={() => setStep(2)}
                className="bg-gray-500 text-white px-4 py-2 rounded hover:bg-gray-600 transition"
              >
                Previous
              </button>
              <button
                type="submit"
                className="bg-nhs-blue text-white px-4 py-2 rounded hover:bg-nhs-dark-blue transition"
              >
                Submit Request
              </button>
            </div>
          </div>
        )}
      </form>
      {toastVisible && (
        <div id="toast" className="fixed bottom-4 right-4 bg-green-500 text-white px-4 py-2 rounded" role="alert" aria-live="assertive">
          {toast}
        </div>
      )}
    </main>
  );
};

export default NewRequestForm;

