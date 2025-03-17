import React, { useState, useEffect, useContext } from 'react';
import axios from 'axios';
import { Link, useNavigate } from 'react-router-dom'; // Import Link and useNavigate for routing
import { AuthContext } from '../context/AuthContext';

const RequestsTable = () => {
  // State variables for requests and various filtering/sorting functionalities
  const [requests, setRequests] = useState([]);
  const [filteredRequests, setFilteredRequests] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterType, setFilterType] = useState('');
  const [filterStatus, setFilterStatus] = useState('');
  const [bulkStatus, setBulkStatus] = useState('');
  const [selectAll, setSelectAll] = useState(false);
  const [selectedIndices, setSelectedIndices] = useState([]);
  const [sortConfig, setSortConfig] = useState({ key: '', asc: true });
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 3;
  const [lastUpdated, setLastUpdated] = useState(new Date());
  const [modalVisible, setModalVisible] = useState(false);
  const [modalData, setModalData] = useState(null);

  const { auth } = useContext(AuthContext);
  const navigate = useNavigate(); // Initialize useNavigate for programmatic redirection

  // Function to fetch requests from the API
  const fetchRequests = async () => {
    try {
      const res = await axios.get('http://localhost:5000/api/requests', {
        headers: { Authorization: `Bearer ${auth.token}` }
      });
      setRequests(res.data.requests);
      setLastUpdated(new Date());
    } catch (error) {
      console.error('Error fetching requests:', error.response ? error.response.data : error);
    }
  };

  // Initial data load and polling every 15 seconds
  useEffect(() => {
    fetchRequests();
    const interval = setInterval(() => {
      fetchRequests();
    }, 15000);
    return () => clearInterval(interval);
  }, [auth.token]);

  // Filter and sort whenever criteria or requests change
  useEffect(() => {
    let updated = [...requests];
    if (searchQuery) {
      updated = updated.filter(req =>
        req.requestTitle.toLowerCase().includes(searchQuery.toLowerCase()) ||
        req.requestType.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }
    if (filterType) {
      updated = updated.filter(req => req.requestType === filterType);
    }
    if (filterStatus) {
      updated = updated.filter(req => req.status === filterStatus);
    }
    if (sortConfig.key) {
      updated.sort((a, b) => {
        if (a[sortConfig.key] < b[sortConfig.key]) return sortConfig.asc ? -1 : 1;
        if (a[sortConfig.key] > b[sortConfig.key]) return sortConfig.asc ? 1 : -1;
        return 0;
      });
    }
    setFilteredRequests(updated);
    setCurrentPage(1);
  }, [searchQuery, filterType, filterStatus, sortConfig, requests]);

  // Pagination and current data slice
  const totalPages = Math.ceil(filteredRequests.length / pageSize);
  const currentData = filteredRequests.slice((currentPage - 1) * pageSize, currentPage * pageSize);

  // Select all rows functionality
  useEffect(() => {
    if (selectAll) {
      const indices = currentData.map((_, idx) => (currentPage - 1) * pageSize + idx);
      setSelectedIndices(indices);
    } else {
      setSelectedIndices([]);
    }
  }, [selectAll, currentData, currentPage]);

  // Toggle individual row selection
  const toggleRowSelection = (globalIndex) => {
    setSelectedIndices(prev =>
      prev.includes(globalIndex)
        ? prev.filter(i => i !== globalIndex)
        : [...prev, globalIndex]
    );
  };

  // Apply bulk update for selected requests
  const applyBulkUpdate = async () => {
    if (!bulkStatus) {
      alert("Please select a status to update.");
      return;
    }

    try {
      const selectedRequests = requests.filter((_, idx) => selectedIndices.includes(idx));
      await axios.patch('http://localhost:5000/api/requests/bulk', {
        status: bulkStatus,
        ids: selectedRequests.map(req => req.id)
      }, {
        headers: { Authorization: `Bearer ${auth.token}` }
      });

      // Update requests locally after successful API call
      setRequests(prev =>
        prev.map((req) => (selectedIndices.includes(req.id) ? { ...req, status: bulkStatus } : req))
      );
      setSelectedIndices([]);
      setSelectAll(false);
    } catch (error) {
      console.error('Bulk update error:', error);
    }
  };

  // Export filtered requests to CSV
  const exportCSV = () => {
    let csvContent = "data:text/csv;charset=utf-8,Request Type,Title,Request Date,Deadline,Status\n";
    filteredRequests.forEach(req => {
      csvContent += `${req.requestType},${req.requestTitle},${req.submissionDate},${req.responseDeadline},${req.status}\n`;
    });
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", "requests_export.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Sorting handler
  const handleSort = (key) => {
    setSortConfig(prev => ({
      key,
      asc: prev.key === key ? !prev.asc : true
    }));
  };

  // Open modal to edit request
  const openModal = (globalIndex) => {
    const data = filteredRequests.find((_, idx) => (currentPage - 1) * pageSize + idx === globalIndex);
    setModalData(data);
    setModalVisible(true);
  };

  // Save request update after modal edit
  const saveModalUpdate = async (newStatus) => {
    try {
      await axios.patch(`http://localhost:5000/api/requests/${modalData.id}`, { status: newStatus }, {
        headers: { Authorization: `Bearer ${auth.token}` }
      });
      // Update request locally after successful API call
      setRequests(prev =>
        prev.map(req => (req.id === modalData.id ? { ...req, status: newStatus } : req))
      );
      setModalVisible(false);
    } catch (error) {
      console.error('Error saving request update:', error);
    }
  };

  // Helper function to determine status class for styling
  const getStatusClass = (status) => {
    if (status === "Pending") return "bg-red-100";
    if (status === "In Progress") return "bg-yellow-100";
    if (status === "Completed") return "bg-green-100";
    if (status === "Unable to complete") return "bg-gray-200";
    return "";
  };

  return (
    <main className="max-w-7xl mx-auto mt-10 px-4">
      <div className="bg-white p-6 rounded shadow">
        <h1 className="text-2xl font-bold mb-4 text-nhs-dark-blue">All Requests</h1>
        <p className="mb-4 text-gray-600 text-sm">Last Updated: {lastUpdated.toLocaleString()}</p>

        {/* Search, Filter, Export Section */}
        <div className="mb-4 flex flex-col md:flex-row md:items-center md:justify-between space-y-2 md:space-y-0">
          <input 
            type="text" 
            placeholder="Search requests..." 
            className="border border-gray-300 p-2 rounded w-full md:w-1/3"
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            aria-label="Search requests"
          />
          <div className="flex space-x-2">
            <select
              className="border border-gray-300 p-2 rounded"
              value={filterType}
              onChange={e => setFilterType(e.target.value)}
              aria-label="Filter by Request Type"
              title="Filter by Request Type"
            >
              <option value="">All Request Types</option>
              <option value="FOI">FOI</option>
              <option value="Ad-hoc Data">Ad-hoc Data</option>
              <option value="Audit">Audit</option>
            </select>
            <select
              className="border border-gray-300 p-2 rounded"
              value={filterStatus}
              onChange={e => setFilterStatus(e.target.value)}
              aria-label="Filter by Request Status"
              title="Filter by Request Status"
            >
              <option value="">All Statuses</option>
              <option value="Pending">Pending</option>
              <option value="In Progress">In Progress</option>
              <option value="Completed">Completed</option>
              <option value="Unable to complete">Unable to complete</option>
            </select>
          </div>
          <button 
            onClick={exportCSV} 
            className="bg-nhs-blue text-white px-4 py-2 rounded hover:bg-nhs-dark-blue transition"
            aria-label="Export CSV"
          >
            Export CSV
          </button>
        </div>

        {/* Bulk Operations */}
        <div className="mb-4 flex items-center space-x-4">
          <label className="inline-flex items-center">
            <input 
              type="checkbox" 
              className="form-checkbox" 
              checked={selectAll} 
              onChange={e => setSelectAll(e.target.checked)} 
              aria-label="Select All"
            />
            <span className="ml-2">Select All</span>
          </label>
          <select 
            className="border border-gray-300 p-2 rounded" 
            value={bulkStatus} 
            onChange={e => setBulkStatus(e.target.value)}
            aria-label="Bulk Update Status"
          >
            <option value="">Bulk Update Status</option>
            <option value="Pending">Pending</option>
            <option value="In Progress">In Progress</option>
            <option value="Completed">Completed</option>
            <option value="Unable to complete">Unable to complete</option>
          </select>
          <button 
            onClick={applyBulkUpdate} 
            className="bg-yellow-500 text-white px-4 py-2 rounded hover:bg-yellow-600 transition"
            aria-label="Apply Bulk Update"
          >
            Apply Bulk Update
          </button>
        </div>

        {/* Requests Table */}
        <div className="overflow-x-auto">
          <table className="min-w-full bg-white" id="requestsTable">
            <thead>
              <tr>
                <th className="py-3 px-2 border-b text-left text-sm font-semibold text-gray-700">
                  <input 
                    type="checkbox" 
                    checked={selectAll} 
                    onChange={e => setSelectAll(e.target.checked)} 
                    aria-label="Select all rows"
                  />
                </th>
                <th 
                  className="py-3 px-4 border-b text-left text-sm font-semibold text-gray-700 cursor-pointer"
                  onClick={() => handleSort('requestType')}
                  title="Sort by Request Type"
                >
                  Request Type
                </th>
                <th 
                  className="py-3 px-4 border-b text-left text-sm font-semibold text-gray-700 cursor-pointer"
                  onClick={() => handleSort('requestTitle')}
                  title="Sort by Title"
                >
                  Title
                </th>
                <th 
                  className="py-3 px-4 border-b text-left text-sm font-semibold text-gray-700 cursor-pointer"
                  onClick={() => handleSort('submissionDate')}
                  title="Sort by Request Date"
                >
                  Request Date
                </th>
                <th 
                  className="py-3 px-4 border-b text-left text-sm font-semibold text-gray-700 cursor-pointer"
                  onClick={() => handleSort('responseDeadline')}
                  title="Sort by Deadline"
                >
                  Deadline
                </th>
                <th className="py-3 px-4 border-b text-left text-sm font-semibold text-gray-700">
                  Status
                </th>
                <th className="py-3 px-4 border-b text-left text-sm font-semibold text-gray-700">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody>
              {currentData.map((req, idx) => {
                const globalIndex = (currentPage - 1) * pageSize + idx;
                const statusClass = getStatusClass(req.status);
                return (
                  <tr key={globalIndex} className="border-b">
                    <td className="py-2 px-2 text-gray-700">
                      <input 
                        type="checkbox" 
                        className="rowCheckbox" 
                        checked={selectedIndices.includes(globalIndex)}
                        onChange={() => toggleRowSelection(globalIndex)}
                        aria-label="Select row"
                      />
                    </td>
                    <td className="py-2 px-4 text-gray-700">{req.requestType}</td>
                    <td className="py-2 px-4 text-gray-700">{req.requestTitle}</td>
                    <td className="py-2 px-4 text-gray-700">{req.submissionDate}</td>
                    <td className="py-2 px-4 text-gray-700">{req.responseDeadline}</td>
                    <td className={`py-2 px-4 text-gray-700 ${statusClass}`}>{req.status}</td>
                    <td className="py-2 px-4 text-gray-700">
                      <button 
                        className="bg-nhs-blue text-white px-3 py-1 rounded hover:bg-nhs-dark-blue transition"
                        onClick={() => openModal(globalIndex)}
                        title="Update Request"
                      >
                        Update
                      </button>
                      <button 
                        className="ml-2 bg-gray-500 text-white px-3 py-1 rounded hover:bg-gray-600 transition"
                        onClick={() => setRequests(prev => prev.map((r, i) => 
                          i === globalIndex ? { ...r, showDetails: !r.showDetails } : r
                        ))}
                        title="Toggle Details"
                      >
                        Details
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* Pagination Controls */}
        <div className="mt-4 flex items-center justify-between">
          <button 
            onClick={() => { if (currentPage > 1) setCurrentPage(currentPage - 1); }}
            className="bg-gray-500 text-white px-4 py-2 rounded hover:bg-gray-600 transition"
            aria-label="Previous Page"
          >
            Previous
          </button>
          <span className="text-gray-700">Page {currentPage} of {totalPages}</span>
          <button 
            onClick={() => { if (currentPage < totalPages) setCurrentPage(currentPage + 1); }}
            className="bg-gray-500 text-white px-4 py-2 rounded hover:bg-gray-600 transition"
            aria-label="Next Page"
          >
            Next
          </button>
        </div>
      </div>

            {/* Data Protection and Security Notice */}
            <section className="mt-6 bg-nhs-light-blue p-4 rounded shadow">
        <p className="text-sm text-nhs-dark-blue">
          This system adheres to NHS data protection and security standards to ensure the safe handling of all requests.
        </p>
      </section>

      {/* Modal for Updating Request */}
      {modalVisible && modalData && (
        <div
          className="fixed inset-0 bg-gray-900 bg-opacity-50 flex items-center justify-center"
          role="dialog"
          aria-modal="true"
        >
          <div className="bg-white rounded-lg p-6 w-11/12 md:w-1/2">
            <h2 className="text-2xl font-bold mb-4">Update Request</h2>
            <div>
              <p><strong>Request Type:</strong> {modalData.requestType}</p>
              <p><strong>Title:</strong> {modalData.requestTitle}</p>
              <p><strong>Request Date:</strong> {modalData.submissionDate}</p>
              <p><strong>Deadline:</strong> {modalData.responseDeadline}</p>
              <p><strong>Current Status:</strong> {modalData.status}</p>
              <label htmlFor="modalStatusInput" className="block font-semibold mt-2">Update Status</label>
              <select
                id="modalStatusInput"
                className="border border-gray-300 p-2 rounded w-full"
                defaultValue={modalData.status}
              >
                <option value="Pending">Pending</option>
                <option value="In Progress">In Progress</option>
                <option value="Completed">Completed</option>
                <option value="Unable to complete">Unable to complete</option>
              </select>
            </div>
            <div className="flex justify-end mt-4">
              <button
                onClick={() => setModalVisible(false)}
                className="bg-gray-500 text-white px-4 py-2 rounded mr-2"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  const newStatus = document.getElementById('modalStatusInput').value;
                  saveModalUpdate(newStatus);
                }}
                className="bg-nhs-blue text-white px-4 py-2 rounded"
              >
                Save
              </button>
            </div>
          </div>
        </div>
      )}

    </main>
  );
};

export default RequestsTable;

