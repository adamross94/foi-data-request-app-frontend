// src/components/Dashboard.jsx
import React, { useState, useEffect, useContext } from 'react';
import { Bar, Pie, Line, Doughnut } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  PointElement,
  LineElement,
  ArcElement
} from 'chart.js';
import axios from 'axios';
import { AuthContext } from '../context/AuthContext';

// Register ChartJS components
ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  PointElement,
  LineElement,
  ArcElement
);

const Dashboard = () => {
  const { auth } = useContext(AuthContext);
  const [requests, setRequests] = useState([]);
  const [lastUpdated, setLastUpdated] = useState(new Date());

  // Fetch live requests from your API
  const fetchRequests = async () => {
    try {
      const res = await axios.get('https://foi-data-request-backend-88ad83e1d7ba.herokuapp.com/api/requests', {
        headers: { Authorization: `Bearer ${auth.token}` }
      });
      setRequests(res.data.requests);
      setLastUpdated(new Date());
    } catch (error) {
      console.error('Error fetching requests:', error.response ? error.response.data : error);
    }
  };

  useEffect(() => {
    fetchRequests();
    const interval = setInterval(() => {
      fetchRequests();
    }, 15000);
    return () => clearInterval(interval);
  }, [auth.token]);

  // Aggregate data by request type and status
  const aggregateData = () => {
    const aggregated = {
      FOI: { pending: 0, inProgress: 0, completed: 0 },
      'Ad-hoc Data': { pending: 0, inProgress: 0, completed: 0 },
      Audit: { pending: 0, inProgress: 0, completed: 0 }
    };

    requests.forEach((req) => {
      if (aggregated[req.requestType]) {
        if (req.status === 'Pending') {
          aggregated[req.requestType].pending++;
        } else if (req.status === 'In Progress') {
          aggregated[req.requestType].inProgress++;
        } else if (req.status === 'Completed') {
          aggregated[req.requestType].completed++;
        }
      }
    });

    return aggregated;
  };

  const aggregatedData = aggregateData();

  // Compute overall insights
  const computeInsights = () => {
    const totalFOI =
      aggregatedData.FOI.pending +
      aggregatedData.FOI.inProgress +
      aggregatedData.FOI.completed;
    const totalAdhoc =
      aggregatedData['Ad-hoc Data'].pending +
      aggregatedData['Ad-hoc Data'].inProgress +
      aggregatedData['Ad-hoc Data'].completed;
    const totalAudit =
      aggregatedData.Audit.pending +
      aggregatedData.Audit.inProgress +
      aggregatedData.Audit.completed;
    const overall = totalFOI + totalAdhoc + totalAudit;
    return { totalFOI, totalAdhoc, totalAudit, overall };
  };

  const insights = computeInsights();

  // Chart data setups
  const barData = {
    labels: ['Pending', 'In Progress', 'Completed'],
    datasets: [
      {
        label: 'FOI Requests',
        backgroundColor: '#005EB8',
        data: [
          aggregatedData.FOI.pending,
          aggregatedData.FOI.inProgress,
          aggregatedData.FOI.completed
        ]
      },
      {
        label: 'Ad-hoc Data Requests',
        backgroundColor: '#E8F2F9',
        data: [
          aggregatedData['Ad-hoc Data'].pending,
          aggregatedData['Ad-hoc Data'].inProgress,
          aggregatedData['Ad-hoc Data'].completed
        ]
      },
      {
        label: 'Audit Requests',
        backgroundColor: '#003087',
        data: [
          aggregatedData.Audit.pending,
          aggregatedData.Audit.inProgress,
          aggregatedData.Audit.completed
        ]
      }
    ]
  };

  const pieData = {
    labels: ['FOI', 'Ad-hoc Data', 'Audit'],
    datasets: [
      {
        data: [insights.totalFOI, insights.totalAdhoc, insights.totalAudit],
        backgroundColor: ['#005EB8', '#E8F2F9', '#003087']
      }
    ]
  };

  const lineData = {
    labels: ['Pending', 'In Progress', 'Completed'],
    datasets: [
      {
        label: 'FOI Trend',
        borderColor: '#005EB8',
        fill: false,
        data: [
          aggregatedData.FOI.pending,
          aggregatedData.FOI.inProgress,
          aggregatedData.FOI.completed
        ]
      },
      {
        label: 'Ad-hoc Trend',
        borderColor: '#E8F2F9',
        fill: false,
        data: [
          aggregatedData['Ad-hoc Data'].pending,
          aggregatedData['Ad-hoc Data'].inProgress,
          aggregatedData['Ad-hoc Data'].completed
        ]
      },
      {
        label: 'Audit Trend',
        borderColor: '#003087',
        fill: false,
        data: [
          aggregatedData.Audit.pending,
          aggregatedData.Audit.inProgress,
          aggregatedData.Audit.completed
        ]
      }
    ]
  };

  const completionData = (() => {
    const overallCompleted =
      aggregatedData.FOI.completed +
      aggregatedData['Ad-hoc Data'].completed +
      aggregatedData.Audit.completed;
    const overallTotal = insights.overall;
    const percentage = overallTotal > 0 ? ((overallCompleted / overallTotal) * 100).toFixed(1) : 0;
    return { overallCompleted, overallTotal, percentage };
  })();

  const doughnutData = {
    labels: ['Completed', 'Remaining'],
    datasets: [
      {
        data: [completionData.overallCompleted, completionData.overallTotal - completionData.overallCompleted],
        backgroundColor: ['#003087', '#E8F2F9']
      }
    ]
  };

  return (
    <main className="max-w-7xl mx-auto mt-10 px-4">
      <h1 className="text-2xl font-bold mb-4 text-nhs-dark-blue">
        Welcome to the FOI &amp; Data Request Dashboard
      </h1>
      <p className="mb-6 text-gray-700">
        This dashboard provides an overview of current requests, quick statistics, and links to manage FOI, ad-hoc data, and audit requests.
        <span className="text-sm italic">(Authorized Personnel Only)</span>
      </p>

      {/* Insights Summary */}
      <section id="insightSummary" className="mt-6 p-4 bg-white rounded shadow" aria-live="polite">
        <p className="text-lg font-semibold">Overall Requests: {insights.overall}</p>
        <p>
          FOI: {insights.totalFOI} | Ad-hoc Data: {insights.totalAdhoc} | Audit: {insights.totalAudit}
        </p>
      </section>

      {/* Charts Grid */}
      <section id="chartsGrid" className="mt-10 grid grid-cols-1 md:grid-cols-2 gap-6" aria-label="Charts Grid">
        {/* Bar Chart */}
        <div className="bg-white p-4 rounded shadow chart-container">
          <h2 className="text-lg font-semibold mb-2 text-nhs-dark-blue">Requests by Status (Bar)</h2>
          <Bar
            data={barData}
            options={{
              responsive: true,
              plugins: {
                legend: { position: 'top' },
                title: { display: true, text: 'Requests by Status' }
              },
              scales: { y: { beginAtZero: true, ticks: { precision: 0 } } }
            }}
          />
        </div>
        {/* Pie Chart */}
        <div className="bg-white p-4 rounded shadow chart-container">
          <h2 className="text-lg font-semibold mb-2 text-nhs-dark-blue">Distribution by Request Type (Pie)</h2>
          <Pie
            data={pieData}
            options={{
              responsive: true,
              plugins: {
                legend: { position: 'bottom' },
                title: { display: true, text: 'Distribution by Request Type' }
              }
            }}
          />
        </div>
        {/* Line Chart */}
        <div className="bg-white p-4 rounded shadow chart-container">
          <h2 className="text-lg font-semibold mb-2 text-nhs-dark-blue">Trend Analysis (Line)</h2>
          <Line
            data={lineData}
            options={{
              responsive: true,
              plugins: {
                legend: { position: 'top' },
                title: { display: true, text: 'Trend Analysis' }
              },
              scales: { y: { beginAtZero: true, ticks: { precision: 0 } } }
            }}
          />
        </div>
        {/* Doughnut Chart */}
        <div className="bg-white p-4 rounded shadow chart-container">
          <h2 className="text-lg font-semibold mb-2 text-nhs-dark-blue">Overall Completion (Doughnut)</h2>
          <Doughnut
            data={doughnutData}
            options={{
              responsive: true,
              plugins: {
                legend: { position: 'bottom' },
                title: { display: true, text: `Overall Completion: ${completionData.percentage}%` }
              }
            }}
          />
        </div>
      </section>
    </main>
  );
};

export default Dashboard;
