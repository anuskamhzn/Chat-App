// src/pages/EditProfile.jsx
import React, { useEffect, useState, useRef } from "react";
import axios from "axios";
import { useAuth } from "../../context/auth";
import { FaUser, FaComments, FaUserCircle, FaCaretDown, FaCaretUp, FaSignOutAlt, FaArrowLeft} from "react-icons/fa";
import { NavLink, useNavigate } from "react-router-dom";

const EditProfile = () => {
    const [auth, setAuth] = useAuth();
    const [user, setUser] = useState(null);
    const [form, setForm] = useState({ name: "", email: "", photo: "" });
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState(null);
    const [dropdownOpen, setDropdownOpen] = useState(false);
    const dropdownRef = useRef(null);
    const navigate = useNavigate();

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
                setForm({ name: data.name || "", email: data.email || "", photo: data.photo || "" });
            } catch (err) {
                setError(err.response?.data?.message || "Failed to load profile");
            } finally {
                setLoading(false);
            }
        };

        fetchUserInfo();
    }, [auth?.token]);

    const handleProfileClick = () => setDropdownOpen(false);
    const handleSignOutClick = () => {
        setAuth({ ...auth, user: null, token: "" });
        localStorage.removeItem("auth");
        setDropdownOpen(false);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!auth?.token) return;

        setSaving(true);
        try {
            const { data } = await axios.patch(
                `${process.env.REACT_APP_API}/api/auth/update`,
                form,
                {
                    headers: { Authorization: `Bearer ${auth.token}` },
                }
            );

            // Update auth context with fresh data
            setAuth({ ...auth, user: data });
            localStorage.setItem("auth", JSON.stringify({ ...auth, user: data }));

            // Go back to profile
            navigate("/profile");
        } catch (err) {
            setError(err.response?.data?.message || "Failed to save changes");
        } finally {
            setSaving(false);
        }
    };

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

    const userName = auth?.user?.name || "Guest";
    return (
        <div className="flex flex-col h-screen bg-gray-50">
            <div className="bg-gradient-to-r from-indigo-600 to-blue-600 text-white p-3 sm:p-4 shadow-md">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 sm:gap-0">
                    {/* Title + Back button */}
                    <div className="flex items-center gap-3">
                        <NavLink to="/chat">
                            <h1 className="text-lg sm:text-2xl font-bold">Chat Room</h1>
                        </NavLink>
                    </div>

                    {/* Counters & Profile */}
                    <div className="flex items-center justify-between sm:justify-end w-full sm:w-auto">
                        <div className="relative" ref={dropdownRef}>
                            <button
                                onClick={() => setDropdownOpen((prev) => !prev)}
                                className="flex items-center space-x-2 bg-gray-100 text-gray-700 hover:text-indigo-600 px-3 py-1.5 rounded-lg transition-colors duration-200"
                            >
                                <FaUserCircle className="text-xl text-indigo-500" />
                                <span className="font-medium text-sm hidden xs:inline">{userName}</span>
                                {dropdownOpen ? (
                                    <FaCaretUp className="text-indigo-500" />
                                ) : (
                                    <FaCaretDown className="text-indigo-500" />
                                )}
                            </button>

                            {dropdownOpen && (
                                <div className="absolute right-0 mt-2 w-52 bg-white rounded-xl shadow-2xl border border-gray-100 z-10">
                                    <div className="py-1">
                                        <NavLink to="/profile">
                                            <button
                                                onClick={handleProfileClick}
                                                className="w-full flex items-center px-4 py-3 text-sm text-gray-700 hover:bg-indigo-50 hover:text-indigo-600 transition-colors duration-150"
                                            >
                                                <FaUser className="mr-3 text-indigo-500" />
                                                Profile
                                            </button>
                                        </NavLink>
                                        <NavLink to="/login">
                                            <button
                                                onClick={handleSignOutClick}
                                                className="w-full flex items-center px-4 py-3 text-sm text-gray-700 hover:bg-indigo-50 hover:text-indigo-600 transition-colors duration-150"
                                            >
                                                <FaSignOutAlt className="mr-3 text-indigo-500" />
                                                Logout
                                            </button>
                                        </NavLink>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>

            {/* ---------- Main Content ---------- */}
            <main className="flex-1 p-4 sm:p-6 overflow-y-auto">
                <div className="max-w-2xl sm:max-w-3xl mx-auto bg-white shadow-xl rounded-xl overflow-hidden">
                    {/* Header with avatar */}
                    <div className="bg-gradient-to-r from-blue-500 to-blue-600 p-4 sm:p-6">
                        <div className="flex flex-col sm:flex-row items-center gap-4 sm:gap-6">
                            <div className="relative w-20 h-20 sm:w-28 sm:h-28 rounded-full bg-gray-200 overflow-hidden flex items-center justify-center shadow-md">
                                {form.photo ? (
                                    <img src={form.photo} alt="Avatar" className="w-full h-full object-cover" />
                                ) : (
                                    <span className="text-2xl sm:text-3xl font-bold text-gray-600">
                                        {form.name?.[0]?.toUpperCase() || "U"}
                                    </span>
                                )}
                            </div>
                            <div className="text-center sm:text-left">
                                <h1 className="text-xl sm:text-2xl font-bold text-white">Edit Profile</h1>
                                <p className="text-blue-100 text-sm sm:text-base mt-1">
                                    Update your personal information
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* Form */}
                    <form onSubmit={handleSubmit} className="p-4 sm:p-6 space-y-5">
                        {error && (
                            <div className="p-3 bg-red-50 border border-red-200 text-red-700 rounded-lg text-sm">
                                {error}
                            </div>
                        )}

                        {/* Name */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Name</label>
                            <input
                                type="text"
                                value={form.name}
                                onChange={(e) => setForm({ ...form, name: e.target.value })}
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                                required
                            />
                        </div>

                        {/* Email */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                            <input
                                type="email"
                                value={form.email}
                                readOnly
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-gray-100 cursor-not-allowed"
                            />

                        </div>

                        {/* Buttons */}
                        <div className="flex flex-col sm:flex-row gap-3 pt-4">
                            <button
                                type="submit"
                                disabled={saving}
                                className="flex-1 px-6 py-2 bg-blue-600 text-white rounded-lg shadow hover:bg-blue-700 transition-colors disabled:opacity-70"
                            >
                                {saving ? "Saving…" : "Save Changes"}
                            </button>

                            <NavLink to="/profile" className="flex-1">
                                <button
                                    type="button"
                                    className="w-full px-6 py-2 bg-gray-200 text-gray-700 rounded-lg shadow hover:bg-gray-300 transition-colors"
                                >
                                    Cancel
                                </button>
                            </NavLink>
                        </div>
                    </form>
                </div>
            </main>
        </div>
    );
};

export default EditProfile;