import React, { useState, useEffect } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/auth';
import { FaFacebookF, FaGoogle, FaTwitter, FaLinkedinIn, FaGithub, FaBars, FaTimes } from "react-icons/fa";

const Homepage = () => {
    const navigate = useNavigate();
    const [isLoggedIn, setIsLoggedIn] = useState(false);
    const [auth, setAuth] = useAuth();
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

    // Check if token exists in localStorage
    useEffect(() => {
        const storedData = localStorage.getItem('auth');
        if (storedData) {
            const parsedData = JSON.parse(storedData);
            if (parsedData.token && parsedData.user) {
                setIsLoggedIn(true);
                setAuth(parsedData);
            }
        }
    }, []);

    // Handle navigation to the register page
    const handleSignUpClick = () => {
        navigate('/register');
    };

    // Handle sign out logic
    const handleSignOutClick = () => {
        localStorage.removeItem('auth');
        setIsLoggedIn(false);
        navigate('/'); // Redirect to homepage
    };

    // Handle navigation to dashboard
    const handleDashboardClick = () => {
        navigate('/chat');
    };

    const toggleMobileMenu = () => {
        setIsMobileMenuOpen(!isMobileMenuOpen);
    };

    const socialLinks = [
        { icon: FaFacebookF, href: "#" },
        { icon: FaTwitter, href: "#" },
        { icon: FaGoogle, href: "#" },
        { icon: FaLinkedinIn, href: "#" },
        { icon: FaGithub, href: "#" },
    ];

    const footerLinks = [
        { text: "About", href: "#" },
        { text: "Features", href: "#" },
        { text: "Blog", href: "#" },
        { text: "Pricing", href: "#" },
        { text: "Partners", href: "#" },
        { text: "Help", href: "#" },
        { text: "Terms", href: "#" },
    ];

    const navLinks = [
        { text: "Home", href: "/" },
        { text: "About", href: "#about" },
        { text: "Feature", href: "#features" },
    ];

    if (isLoggedIn && auth?.user) {
        navLinks.push({ text: "Chat", href: "/chat", onClick: handleDashboardClick });
    }

    return (
        <div className="font-sans">
            {/* Navbar */}
            <nav className="flex justify-between items-center p-6 bg-white border-b shadow-sm">
                <NavLink to="/" className="text-2xl font-bold text-blue-600">
                    Chatly
                </NavLink>

                {/* Desktop Links */}
                <ul className="hidden md:flex space-x-6">
                    {navLinks.map((link, index) => (
                        link.onClick ? (
                            <li key={index}>
                                <button
                                    onClick={link.onClick}
                                    className="text-gray-600 hover:text-blue-600 transition-colors"
                                >
                                    {link.text}
                                </button>
                            </li>
                        ) : (
                            <li key={index}>
                                {link.href.startsWith('#') ? (
                                    <a href={link.href} className="text-gray-600 hover:text-blue-600 transition-colors">
                                        {link.text}
                                    </a>
                                ) : (
                                    <NavLink to={link.href} className="text-gray-600 hover:text-blue-600 transition-colors">
                                        {link.text}
                                    </NavLink>
                                )}
                            </li>
                        )
                    ))}
                </ul>

                {/* Desktop Buttons */}
                <div className="hidden md:flex items-center space-x-4">
                    {isLoggedIn ? (
                        <>
                            <button
                                onClick={handleDashboardClick}
                                className="px-4 py-2 text-blue-600 font-medium hover:text-blue-700 transition-colors"
                            >
                                Start Chatting
                            </button>
                            <button
                                onClick={handleSignOutClick}
                                className="px-4 py-2 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition-colors"
                            >
                                Sign Out
                            </button>
                        </>
                    ) : (
                        <NavLink
                            to="/login"
                            className="px-4 py-2 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition-colors"
                        >
                            Login
                        </NavLink>
                    )}
                </div>

                {/* Mobile Hamburger */}
                <button className="md:hidden text-gray-600 hover:text-blue-600 transition-colors" onClick={toggleMobileMenu}>
                    {isMobileMenuOpen ? <FaTimes className="w-6 h-6" /> : <FaBars className="w-6 h-6" />}
                </button>
            </nav>

            {/* Mobile Menu */}
            {isMobileMenuOpen && (
                <div className="md:hidden bg-white border-b shadow-sm px-6 py-4">
                    <ul className="flex flex-col space-y-4">
                        {navLinks.map((link, index) => (
                            link.onClick ? (
                                <li key={index}>
                                    <button
                                        onClick={() => {
                                            link.onClick();
                                            toggleMobileMenu();
                                        }}
                                        className="text-gray-600 hover:text-blue-600 transition-colors w-full text-left"
                                    >
                                        {link.text}
                                    </button>
                                </li>
                            ) : (
                                <li key={index}>
                                    {link.href.startsWith('#') ? (
                                        <a
                                            href={link.href}
                                            onClick={toggleMobileMenu}
                                            className="text-gray-600 hover:text-blue-600 transition-colors block"
                                        >
                                            {link.text}
                                        </a>
                                    ) : (
                                        <NavLink
                                            to={link.href}
                                            onClick={toggleMobileMenu}
                                            className="text-gray-600 hover:text-blue-600 transition-colors block"
                                        >
                                            {link.text}
                                        </NavLink>
                                    )}
                                </li>
                            )
                        ))}
                        {isLoggedIn ? (
                            <>
                                <button
                                    onClick={() => {
                                        handleDashboardClick();
                                        toggleMobileMenu();
                                    }}
                                    className="px-4 py-2 text-blue-600 font-medium hover:text-blue-700 transition-colors w-full text-left"
                                >
                                    Start Chatting
                                </button>
                                <button
                                    onClick={() => {
                                        handleSignOutClick();
                                        toggleMobileMenu();
                                    }}
                                    className="px-4 py-2 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition-colors w-full"
                                >
                                    Sign Out
                                </button>
                            </>
                        ) : (
                            <NavLink
                                to="/login"
                                onClick={toggleMobileMenu}
                                className="px-4 py-2 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition-colors block"
                            >
                                Login
                            </NavLink>
                        )}
                    </ul>
                </div>
            )}

            {/* Main Content */}
            <main className="container mx-auto px-6 py-16">
                <div className="flex flex-col lg:flex-row items-center gap-8">
                    {/* Left Content */}
                    <div className="flex-1 text-left max-w-2xl pl-8">
                        <h1 className="text-4xl lg:text-5xl font-bold text-gray-900 mb-6">
                            Connect Instantly, Chat Effortlessly
                        </h1>
                        <p className="text-lg text-gray-600 mb-8">
                            Chatly brings real-time messaging to your fingertips. Whether it's personal conversations or team collaborations, Chatly keeps you connected with seamless, secure chats.
                        </p>
                        {!isLoggedIn && (
                            <div className="flex flex-wrap gap-4">
                                <button
                                    onClick={handleSignUpClick}
                                    className="px-6 py-3 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 transition-colors inline-flex items-center gap-2"
                                >
                                    Start Chatting Now
                                </button>
                            </div>
                        )}
                    </div>

                    {/* Right Content - Chat Image */}
                    <div className="flex-1">
                        <img
                            src="https://a.storyblok.com/f/231922/1726x1041/f2a68d4de1/real-time-chat-cover-image.jpg/m/0x0"
                            alt="Real-time chat interface"
                            className="w-full rounded-xl shadow-lg"
                        />
                    </div>
                </div>
            </main>

            {/* About Section */}
            <section id="about" className="relative py-24 overflow-hidden bg-gradient-to-br from-blue-50 to-indigo-50">
                <div className="relative max-w-6xl mx-auto px-4">
                    <div className="text-center mb-12">
                        <h2 className="text-4xl font-bold text-gray-900 mb-4">
                            About Chatly
                        </h2>
                        <div className="w-20 h-1 bg-blue-600 mx-auto rounded-full" />
                    </div>

                    <div className="flex flex-col lg:flex-row justify-between items-center gap-16">
                        {/* Left Column: Content */}
                        <div className="lg:w-1/2">
                            <h3 className="text-2xl font-semibold text-gray-900 mb-6">Seamless Real-Time Conversations</h3>
                            <p className="text-lg text-gray-600 leading-relaxed mb-6">
                                Chatly is a powerful real-time chat application for dynamic, real-time conversations that keep everyone in sync.
                            </p>
                            <p className="text-lg text-gray-600 leading-relaxed mb-6">
                                Collaborate effortlessly with live updates for messages and user joins, all in an intuitive interface.
                            </p>
                            <p className="text-lg text-gray-600 leading-relaxed">
                                Stay connected, track chat counts, and manage users with ease—Chatly makes communication simple and engaging.
                            </p>
                        </div>

                        {/* Right Column: Image */}
                        <div className="lg:w-1/2">
                            <img
                                src="https://ik.imagekit.io/ably/ghost/prod/2023/01/build-a-realtime-chat-app-from-scratch--1-.png?tr=w-1728,q-50"
                                alt="Team chatting on devices"
                                className="w-full rounded-xl shadow-lg"
                            />
                        </div>
                    </div>
                </div>
            </section>

            {/* Features Section */}
            <section id="features" className="bg-white py-20">
                <div className="max-w-6xl mx-auto px-4">
                    <div className="text-center mb-12">
                        <h2 className="text-4xl font-bold text-gray-900 mb-4">Key Features</h2>
                        <div className="w-20 h-1 bg-blue-600 mx-auto rounded-full" />
                    </div>
                    <div className="grid md:grid-cols-3 gap-8">
                        <div className="text-center p-6 rounded-xl bg-blue-50 hover:bg-blue-100 transition-colors">
                            <img
                                src="https://static.vecteezy.com/system/resources/previews/007/644/926/non_2x/flash-design-with-chat-messages-on-the-smart-phone-screen-design-element-illustration-vector.jpg"
                                alt="Real-time messaging icon"
                                className="w-16 h-16 mx-auto mb-4 rounded-full bg-white p-2 shadow-md"
                            />
                            <h3 className="text-xl font-semibold text-gray-900 mb-2">Real-Time Messaging</h3>
                            <p className="text-gray-600">Experience lightning-fast conversations with instant message delivery and live notifications for every update.</p>
                        </div>
                        <div className="text-center p-6 rounded-xl bg-green-50 hover:bg-green-100 transition-colors">
                            <img
                                src="https://www.viber.com/app/uploads/SecurityHeader-e1653402773789.jpeg"
                                alt="Secure chat icon"
                                className="w-16 h-16 mx-auto mb-4 rounded-full bg-white p-2 shadow-md"
                            />
                            <h3 className="text-xl font-semibold text-gray-900 mb-2">Secure & Private</h3>
                            <p className="text-gray-600">Robust user verification and end-to-end encryption keep your conversations safe and confidential.</p>
                        </div>
                        <div className="text-center p-6 rounded-xl bg-purple-50 hover:bg-purple-100 transition-colors">
                            <img
                                src="https://zen-marketing-zopim.s3.amazonaws.com/images/a029caee-analytics-05-small.png"
                                alt="Analytics icon"
                                className="w-16 h-16 mx-auto mb-4 rounded-full bg-white p-2 shadow-md"
                            />
                            <h3 className="text-xl font-semibold text-gray-900 mb-2">Chat Analytics</h3>
                            <p className="text-gray-600">Monitor your chat activity, track user engagement, and gain insights into conversation trends effortlessly.</p>
                        </div>
                    </div>
                </div>
            </section>

            {/* Footer */}
            <footer className="bg-white border-t border-gray-200">
                <div className="container mx-auto px-6 py-12">
                    <div className="flex flex-col items-center">
                        <div className="flex gap-6 mb-8">
                            {socialLinks.map((link, index) => {
                                const Icon = link.icon;
                                return (
                                    <a
                                        key={index}
                                        href={link.href}
                                        className="text-gray-600 hover:text-blue-600 transition-colors"
                                    >
                                        <Icon className="w-5 h-5" />
                                    </a>
                                );
                            })}
                        </div>
                        <nav className="flex flex-wrap justify-center gap-x-8 gap-y-4 mb-8">
                            {footerLinks.map((link, index) => (
                                <a
                                    key={index}
                                    href={link.href}
                                    className="text-sm text-gray-600 hover:text-blue-600 transition-colors"
                                >
                                    {link.text}
                                </a>
                            ))}
                        </nav>
                        <div className="text-center text-sm text-gray-600">
                            <p>&copy; 2025 Chatly. All rights reserved.</p>
                        </div>
                    </div>
                </div>
            </footer>
        </div>
    );
}

export default Homepage;