// src/App.jsx
import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import SignIn from './components/SignIn';
import SignUp from './components/SignUp';
import Dashboard from './components/Dashboard';
import NewRequestForm from './components/NewRequestForm';
import RequestsTable from './components/RequestsTable';
import ProtectedRoute from './components/ProtectedRoute';
import NavigationBar from './components/NavigationBar';

const App = () => {
  return (
    <Router>
      <NavigationBar />
      <Routes>
        <Route path="/signin" element={<SignIn />} />
        <Route path="/signup" element={<SignUp />} />
        <Route path="/" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
        <Route path="/new-request" element={<ProtectedRoute><NewRequestForm /></ProtectedRoute>} />
        <Route path="/requests" element={<ProtectedRoute><RequestsTable /></ProtectedRoute>} />
      </Routes>
    </Router>
  );
};

export default App;
