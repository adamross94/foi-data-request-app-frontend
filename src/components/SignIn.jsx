import React, { useState, useContext } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom'; // Import useNavigate for redirecting after sign-in
import { AuthContext } from '../context/AuthContext'; // Import the AuthContext to handle user authentication

const SignIn = () => {
  const [form, setForm] = useState({ username: '', password: '' });
  const { signIn } = useContext(AuthContext); // Get signIn function from AuthContext
  const navigate = useNavigate(); // Initialize useNavigate for programmatic redirection

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      // Send sign-in data to backend API for authentication
      const response = await axios.post('https://foi-data-app-backend-sql-504a640fbdc3.herokuapp.com/signin', form);

      // Store the token and user information using context
      signIn(response.data.token, response.data.user);

      // Redirect the user to the dashboard after successful login
      navigate('/dashboard'); // Redirect after successful login
    } catch (error) {
      console.error('Sign-in error:', error.response ? error.response.data : error);
      alert('Invalid credentials. Please try again.'); // Show error message on failure
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
