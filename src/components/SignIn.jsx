// src/components/SignIn.jsx
import React, { useState, useContext } from 'react';
import axios from 'axios';
import { AuthContext } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';

const SignIn = () => {
  const [form, setForm] = useState({ username: '', password: '' });
  const { signIn } = useContext(AuthContext);
  const navigate = useNavigate();

  // Set your backend endpoint for sign in
  const signInUrl = 'https://foi-data-app-backend-sql-504a640fbdc3.herokuapp.com/api/auth/signin';

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      // Use the full URL for sign in
      const response = await axios.post(signInUrl, form, { withCredentials: true });
      signIn(response.data.token, response.data.user);
      navigate('/dashboard'); // Redirect after successful sign in
    } catch (error) {
      console.error('Sign-in error:', error.response ? error.response.data : error);
      alert('Invalid credentials. Please try again.');
    }
  };

  return (
    <form onSubmit={handleSubmit} className="max-w-md mx-auto bg-white p-6 rounded shadow">
      <h2 className="text-2xl font-bold mb-4">Sign In</h2>
      <input
        type="text"
        placeholder="Username"
        value={form.username}
        onChange={(e) => setForm({ ...form, username: e.target.value })}
        required
        className="border p-2 rounded w-full mb-2"
      />
      <input
        type="password"
        placeholder="Password"
        value={form.password}
        onChange={(e) => setForm({ ...form, password: e.target.value })}
        required
        className="border p-2 rounded w-full mb-2"
      />
      <button type="submit" className="bg-nhs-blue text-white px-4 py-2 rounded hover:bg-nhs-dark-blue">
        Sign In
      </button>
    </form>
  );
};

export default SignIn;
