import React, { useEffect, useState, useRef } from "react";
import axios from "axios";
import { useAuth } from "../../context/auth";
import {
  FaUser,
  FaComments,
  FaUserCircle,
  FaCaretDown,
  FaCaretUp,
  FaSignOutAlt,
  FaTrashAlt,
} from 'react-icons/fa';
import { NavLink, useNavigate } from 'react-router-dom';

const Profile = () => {
  const [auth, setAuth] = useAuth();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const dropdownRef = useRef(null);
  const navigate = useNavigate();

  const handleProfileClick = () => setDropdownOpen(false);

  const handleSignOutClick = () => {
    setAuth({ ...auth, user: null, token: '' });
    localStorage.removeItem('auth');
    setDropdownOpen(false);
    navigate('/login');
  };

  const handleDeleteAccount = async () => {
    if (!auth?.token) return;

    setDeleting(true);
    try {
      await axios.delete(
        `${process.env.REACT_APP_API}/api/auth/delete`,
        {
          headers: { Authorization: `Bearer ${auth.token}` },
        }
      );

      // Clear auth
      setAuth({ user: null, token: '' });
      localStorage.removeItem('auth');

      // Redirect
      navigate('/login');
    } catch (err) {
      setError(err.response?.data?.message || "Failed to delete account");
      setShowDeleteModal(false);
    } finally {
      setDeleting(false);
    }
  };

  useEffect(() => {
    const fetchUserInfo = async () => {
      if (!auth?.token) {
        setLoading(false);
        return;
      }

      try {
        setError(null);
        const { data } = await axios.get(
          `${process.env.REACT_APP_API}/api/auth/user-info`,
          {
            headers: { Authorization: `Bearer ${auth.token}` },
          }
        );
        setUser(data);
      } catch (err) {
        setError(err.response?.data?.message || "Failed to load profile");
      } finally {
        setLoading(false);
      }
    };

    fetchUserInfo();
  }, [auth?.token]);

  if (!auth?.token) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-100">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-4 border-blue-600 mx-auto mb-4" />
          <p className="text-gray-600 text-sm sm:text-base">You are not logged in.</p>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="flex min-h-screen bg-gray-50">
        <main className="flex-1 p-4 sm:p-6">
          <div className="max-w-2xl sm:max-w-3xl mx-auto bg-white shadow-lg rounded-xl p-6 sm:p-8">
            <div className="h-8 w-1/2 bg-gray-200 rounded animate-pulse mb-6" />
            <div className="space-y-4">
              {[...Array(3)].map((_, i) => (
                <div key={i} className="flex items-center p-4 bg-gray-50 rounded-lg">
                  <div className="w-24 h-5 bg-gray-200 rounded animate-pulse" />
                  <div className="flex-1 h-5 bg-gray-200 rounded animate-pulse ml-4" />
                </div>
              ))}
            </div>
          </div>
        </main>
      </div>
    );
  }

  if (error && !user) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-100">
        <div className="max-w-md w-full bg-red-50 border border-red-200 text-red-700 px-6 py-4 rounded-lg shadow-md text-center">
          <strong className="block mb-1 text-lg">Error</strong>
          <p className="text-sm sm:text-base">{error}</p>
        </div>
      </div>
    );
  }

  const userName = auth?.user?.name || 'Guest';

  return (
    <div className="flex flex-col h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-gradient-to-r from-indigo-600 to-blue-600 text-white p-3 sm:p-4 shadow-md">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 sm:gap-0">
          <NavLink to='/chat'>
            <h1 className="text-lg sm:text-2xl font-bold">Chat Room</h1>
          </NavLink>

          <div className="flex items-center justify-between sm:justify-end w-full sm:w-auto">
            <div className="relative" ref={dropdownRef}>
              <button
                onClick={() => setDropdownOpen(prev => !prev)}
                className="flex items-center space-x-2 bg-gray-100 text-gray-700 hover:text-indigo-600 px-3 py-1.5 rounded-lg transition-colors duration-200"
              >
                <FaUserCircle className="text-xl text-indigo-500" />
                <span className="font-medium text-sm hidden xs:inline">{userName}</span>
                {dropdownOpen ? <FaCaretUp className="text-indigo-500" /> : <FaCaretDown className="text-indigo-500" />}
              </button>

              {dropdownOpen && (
                <div className="absolute right-0 mt-2 w-52 bg-white rounded-xl shadow-2xl border border-gray-100 z-10">
                  <div className="py-1">
                    <NavLink to="/profile">
                      <button onClick={handleProfileClick} className="w-full flex items-center px-4 py-3 text-sm text-gray-700 hover:bg-indigo-50 hover:text-indigo-600 transition-colors duration-150">
                        <FaUser className="mr-3 text-indigo-500" /> Profile
                      </button>
                    </NavLink>
                    <NavLink to="/login">
                      <button onClick={handleSignOutClick} className="w-full flex items-center px-4 py-3 text-sm text-gray-700 hover:bg-indigo-50 hover:text-indigo-600 transition-colors duration-150">
                        <FaSignOutAlt className="mr-3 text-indigo-500" /> Logout
                      </button>
                    </NavLink>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <main className="flex-1 p-4 sm:p-6">
        <div className="max-w-2xl sm:max-w-3xl mx-auto bg-white shadow-xl rounded-xl overflow-hidden">
          {/* Profile Header */}
          <div className="bg-gradient-to-r from-blue-500 to-blue-600 p-4 sm:p-6">
            <div className="flex flex-col sm:flex-row items-center gap-4 sm:gap-6">
              <div className="relative w-20 h-20 sm:w-28 sm:h-28 rounded-full bg-gray-200 overflow-hidden flex items-center justify-center shadow-md transition-transform hover:scale-105">
                {user?.photo ? (
                  <img src={user.photo} alt="User Avatar" className="w-full h-full object-cover" />
                ) : (
                  <span className="text-2xl sm:text-3xl font-bold text-gray-600">
                    {user?.initials || user?.name?.[0]?.toUpperCase() || "U"}
                  </span>
                )}
              </div>
              <div className="text-center sm:text-left">
                <h1 className="text-xl sm:text-2xl font-bold text-white">
                  {user?.name || "User Profile"}
                </h1>
                <p className="text-blue-100 text-sm sm:text-base mt-1">Manage your account details</p>
              </div>
            </div>
          </div>

          {/* Body */}
          <div className="p-4 sm:p-6 bg-white/80 backdrop-blur-sm">
            <div className="space-y-3 sm:space-y-4">
              {[
                { label: "Name", value: user?.name },
                { label: "Email", value: user?.email },
              ].map((item, idx) => (
                <div
                  key={idx}
                  className="flex flex-col sm:flex-row items-start sm:items-center p-3 sm:p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                >
                  <strong className="w-full sm:w-28 font-semibold text-gray-700 mb-1 sm:mb-0">
                    {item.label}:
                  </strong>
                  <span className="text-gray-900 text-sm sm:text-base break-all">
                    {item.value || "—"}
                  </span>
                </div>
              ))}
            </div>

            <div className="mt-6 flex flex-col sm:flex-row gap-3">
              <NavLink to="/edit-profile" className="flex-1">
                <button className="w-full px-6 py-2 bg-blue-600 text-white rounded-lg shadow hover:bg-blue-700 transition-colors">
                  Edit Profile
                </button>
              </NavLink>

              <button
                onClick={() => setShowDeleteModal(true)}
                className="flex-1 px-6 py-2 bg-red-600 text-white rounded-lg shadow hover:bg-red-700 transition-colors flex items-center justify-center gap-2"
              >
                <FaTrashAlt className="text-sm" />
                Delete Account
              </button>
            </div>
            <NavLink to="/chat" className="flex-1">
              <button className="w-full px-6 py-2 mt-4 bg-indigo-600 text-white rounded-lg shadow hover:bg-indigo-700 transition-colors">
                Go to Chat
              </button>
            </NavLink>
          </div>
        </div>
      </main>

      {/* Delete Confirmation Modal */}
      {showDeleteModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50 overflow-y-auto">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-md mx-auto p-5 sm:p-6 animate-in fade-in zoom-in duration-200">
            {/* Header */}
            <div className="flex items-center gap-3 mb-4">
              <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-full bg-red-100 flex items-center justify-center flex-shrink-0">
                <FaTrashAlt className="text-red-600 text-base sm:text-lg" />
              </div>
              <h3 className="text-lg sm:text-xl font-semibold text-gray-900">Delete Account?</h3>
            </div>

            {/* Warning Message */}
            <p className="text-sm sm:text-base text-gray-600 mb-5 sm:mb-6 leading-relaxed">
              This action <strong>cannot be undone</strong>. All your data, messages, and account will be permanently deleted.
            </p>

            {/* Error Message (if any) */}
            {error && (
              <p className="text-xs sm:text-sm text-red-600 bg-red-50 p-2.5 rounded mb-4">{error}</p>
            )}

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-3">
              <button
                onClick={() => setShowDeleteModal(false)}
                disabled={deleting}
                className="flex-1 px-4 py-2.5 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors text-sm sm:text-base font-medium"
              >
                Cancel
              </button>
              <button
                onClick={handleDeleteAccount}
                disabled={deleting}
                className="flex-1 px-4 py-2.5 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors disabled:opacity-70 flex items-center justify-center gap-2 text-sm sm:text-base font-medium"
              >
                {deleting ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    Deleting...
                  </>
                ) : (
                  "Delete Permanently"
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Profile;