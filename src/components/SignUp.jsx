// src/components/SignUp.jsx
import React, { useState, useContext } from 'react';
import axios from 'axios';
import { AuthContext } from '../context/AuthContext';

const SignUp = () => {
  const [form, setForm] = useState({
    username: '',
    email: '',
    password: '',
    role: 'requestor',
    name: '',
    department: ''
  });
  const { signIn } = useContext(AuthContext);

  // Set your backend endpoints here:
  const signUpUrl = 'https://foi-data-request-backend-88ad83e1d7ba.herokuapp.com/api/auth/signup';
  const signInUrl = 'https://foi-data-request-backend-88ad83e1d7ba.herokuapp.com/api/auth/signin';

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      // Use the full URL for signup
      const response = await axios.post(signUpUrl, form, { withCredentials: true });
      if (response.status === 201) {
        // After sign-up, automatically sign in using the full URL for sign in
        const signInResponse = await axios.post(signInUrl, {
          username: form.username,
          password: form.password
        });
        signIn(signInResponse.data.token, signInResponse.data.user);
      }
    } catch (error) {
      console.error('Sign-up error:', error.response ? error.response.data : error);
      alert('Sign-up failed. Please check your details and try again.');
    }
  };

  return (
    <form onSubmit={handleSubmit} className="max-w-md mx-auto bg-white p-6 rounded shadow">
      <h2 className="text-2xl font-bold mb-4">Sign Up</h2>
      <input
        type="text"
        placeholder="Username"
        value={form.username}
        onChange={(e) => setForm({ ...form, username: e.target.value })}
        required
        className="border p-2 rounded w-full mb-2"
      />
      <input
        type="email"
        placeholder="Email"
        value={form.email}
        onChange={(e) => setForm({ ...form, email: e.target.value })}
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
      <select
        value={form.role}
        onChange={(e) => setForm({ ...form, role: e.target.value })}
        className="border p-2 rounded w-full mb-2"
      >
        <option value="requestor">Requestor</option>
        <option value="administrator">Administrator</option>
        <option value="reviewer">Reviewer</option>
      </select>
      <input
        type="text"
        placeholder="Full Name"
        value={form.name}
        onChange={(e) => setForm({ ...form, name: e.target.value })}
        className="border p-2 rounded w-full mb-2"
      />
      <input
        type="text"
        placeholder="Department (optional)"
        value={form.department}
        onChange={(e) => setForm({ ...form, department: e.target.value })}
        className="border p-2 rounded w-full mb-2"
      />
      <button type="submit" className="bg-nhs-blue text-white px-4 py-2 rounded hover:bg-nhs-dark-blue">
        Sign Up
      </button>
    </form>
  );
};

export default SignUp;
