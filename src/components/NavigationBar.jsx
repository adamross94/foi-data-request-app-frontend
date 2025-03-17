import React from 'react';
import { NavLink } from 'react-router-dom';

const NavigationBar = () => {
  return (
    <nav
      className="bg-nhs-blue text-white px-4 py-4 shadow"
      aria-label="Main Navigation"
    >
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        {/* Branding / Logo */}
        <div className="flex items-center space-x-2">
          {/* If you have an NHS logo, you could place an <img> tag here */}
          <span className="text-xl font-bold">NHS Internal</span>
          <span className="text-sm text-gray-100 whitespace-nowrap">
            FOI &amp; Data Requests
          </span>
        </div>

        {/* Navigation Links */}
        <div className="flex space-x-6 text-sm font-medium">
          <NavLink
            to="/"
            className={({ isActive }) =>
              isActive
                ? 'underline text-gray-200'
                : 'hover:text-gray-200 transition'
            }
          >
            Dashboard
          </NavLink>
          <NavLink
            to="/new-request"
            className={({ isActive }) =>
              isActive
                ? 'underline text-gray-200'
                : 'hover:text-gray-200 transition'
            }
          >
            New Request
          </NavLink>
          <NavLink
            to="/requests"
            className={({ isActive }) =>
              isActive
                ? 'underline text-gray-200'
                : 'hover:text-gray-200 transition'
            }
          >
            View Requests
          </NavLink>
        </div>
      </div>
    </nav>
  );
};

export default NavigationBar;
