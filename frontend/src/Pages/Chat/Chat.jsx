import React, { useState, useEffect, useRef } from 'react';
import { FaUser, FaComments, FaUserCircle, FaCaretDown, FaCaretUp, FaSignOutAlt } from 'react-icons/fa';
import { NavLink } from 'react-router-dom';
import { useAuth } from '../../context/auth';
import io from 'socket.io-client'; // Add this import

const Chat = () => {
  const formatTime = (date) =>
    date.toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true,
    });

  const [messages, setMessages] = useState([]);
  const [inputText, setInputText] = useState('');
  const [users, setUsers] = useState(0); // Start at 0, update from socket
  const [chatCount, setChatCount] = useState(0); // Start at 0, update from socket
  const messagesEndRef = useRef(null);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);
  const [auth, setAuth] = useAuth();

  // Socket connection
  const socketRef = useRef(null);

  const socket = socketRef.current;

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const getInitials = (name) => {
    if (!name || name === 'Unknown' || name === 'Deleted User') return 'DU'; // Fallback initials
    return name
      .split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  const getSenderColor = (sender) => {
    const colors = {
      System: 'bg-gray-500',
      You: 'bg-green-500',
      User1: 'bg-blue-500',
    };
    return colors[sender] || 'bg-purple-500';
  };

  // Socket connection and event listeners
  useEffect(() => {
    const token = auth?.token || localStorage.getItem('auth')?.token; // Get token from context or localStorage
    if (!token) {
      console.error('No auth token found. Please log in.');
      return;
    }

    // Connect to Socket.IO server
    socketRef.current = io(`${process.env.REACT_APP_API}`, {
      auth: { token }, // Pass JWT for authentication
    });

    const socket = socketRef.current;

    socket.on('connect', () => {
      console.log('Socket connected:', socket.id);
    });

    socket.on('connect_error', (err) => {
      console.error('Socket connection error:', err.message);
    });

    // Load chat history on connect
    socket.on('chatHistory', (history) => {
      const formattedHistory = history.map((msg) => ({
        id: msg._id || Date.now() + Math.random(),
        text: msg.content,
        sender: msg.sender?.name || 'Deleted User',
        senderId: msg.sender?._id || null,  // NEW: Store ID for real-time updates
        timestamp: formatTime(new Date(msg.timestamp || msg.createdAt)),
        color: msg.sender?._id === auth.user?._id ? 'bg-green-500' : 'bg-purple-500',
      }));
      setMessages(formattedHistory);
      setChatCount(history.length);
    });

    // New message received
    socket.on('newMessage', (msg) => {
      const newMsg = {
        id: msg._id || Date.now() + Math.random(),
        text: msg.content,
        sender: msg.sender?.name || 'Deleted User',
        senderId: msg.sender?._id || null,  // NEW: Store ID
        timestamp: formatTime(new Date(msg.timestamp || msg.createdAt)),
        color: msg.sender?._id === auth.user?._id ? 'bg-green-500' : 'bg-purple-500',
      };
      setMessages((prev) => [...prev, newMsg]);
      setChatCount((prev) => prev + 1);
    });

    // NEW: Listen for user join - add system message
    socket.on('userJoined', ({ username }) => {
      const safeUsername = username || 'Unknown User';
      const systemMsg = {
        id: `join-${Date.now()}`,
        text: `${safeUsername} joined the chat.`,
        sender: 'System',
        timestamp: formatTime(new Date()),
        color: 'bg-gray-500',
      };
      setMessages((prev) => [...prev, systemMsg]);
    });

    // NEW: Listen for user leave - add system message
    socket.on('userLeft', ({ username }) => {
      const safeUsername = username || 'Unknown User';
      const systemMsg = {
        id: `leave-${Date.now()}`,
        text: `${safeUsername} left the chat.`,
        sender: 'System',
        timestamp: formatTime(new Date()),
        color: 'bg-gray-500',
      };
      setMessages((prev) => [...prev, systemMsg]);
    });

    // NEW: Listen for user deletion - update local messages in real-time
    socket.on('userDeleted', ({ userId }) => {
      setMessages((prev) =>
        prev.map((message) =>
          message.senderId === userId
            ? {
              ...message,
              sender: 'Deleted User',
              senderId: null,  // Orphan locally
              color: 'bg-purple-500',  // Treat as "other" user
            }
            : message
        )
      );
      console.log(`Updated messages for deleted user: ${userId}`);
    });

    // Update user count
    socket.on('userCountUpdate', (count) => {
      setUsers(count);
    });

    // Update chat count (for consistency, though newMessage also updates)
    socket.on('chatCountUpdate', (count) => {
      setChatCount(count);
    });

    // Error handling
    socket.on('messageError', (err) => {
      console.error('Message error:', err.message);
      // Optionally add error message to UI
    });

    // Cleanup on unmount
    return () => {
      if (socket) {
        socket.disconnect();
        console.log('Socket disconnected');
      }
    };
  }, [auth?.token, auth?.user?._id]); // Reconnect if auth changes

  const handleSendMessage = () => {
    if (inputText.trim() && socketRef.current) {
      socketRef.current.emit('sendMessage', { content: inputText.trim() });
      setInputText('');
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const handleProfileClick = () => {
    setDropdownOpen(false);
  };

  const handleSignOutClick = () => {
    setAuth({
      ...auth,
      user: null,
      token: '',
    });
    localStorage.removeItem('auth');
    setDropdownOpen(false);
    // Disconnect socket on logout
    if (socketRef.current) {
      socketRef.current.disconnect();
    }
  };

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target)
      ) {
        setDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Safely get the logged-in user's name
  const userName = auth?.user?.name || 'Guest';

  return (
    <div className="flex flex-col h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-gradient-to-r from-indigo-600 to-blue-600 text-white p-3 sm:p-4 shadow-md">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 sm:gap-0">
          {/* Title */}
          <h1 className="text-lg sm:text-2xl font-bold">Chat Room</h1>

          {/* Counters & Profile – mobile: counters left, profile right */}
          <div className="flex items-center justify-between sm:justify-end w-full sm:w-auto">
            {/* Counters */}
            <div className="flex items-center space-x-3 sm:space-x-4 text-xs sm:text-sm">
              <span className="flex items-center">
                <FaUser className="w-3 h-3 sm:w-4 sm:h-4 mr-1" />
                <span className="font-semibold">{users}</span>
              </span>
              <span className="flex items-center">
                <FaComments className="w-3 h-3 sm:w-4 sm:h-4 mr-1" />
                <span className="font-semibold mr-2">{chatCount}</span>
              </span>
            </div>

            {/* Profile Dropdown */}
            <div className="relative" ref={dropdownRef}>
              <button
                onClick={() => setDropdownOpen((prev) => !prev)}
                className="flex items-center space-x-2 bg-gray-100 text-gray-700 hover:text-indigo-600 px-3 py-1.5 rounded-lg transition-colors duration-200"
              >
                <FaUserCircle className="text-xl text-indigo-500" />
                <span className="font-medium text-sm hidden xs:inline">
                  {userName}
                </span>
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

      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto p-3 sm:p-4 space-y-3 sm:space-y-4 bg-gray-100">
        {messages.map((message) => (
          message.sender === 'System' ? (
            // Special rendering for system messages (centered, no avatar)
            <div key={message.id} className="flex justify-center animate-fadeIn">
              <div className="px-4 py-2 bg-gray-300 text-gray-700 rounded-full text-xs sm:text-sm shadow-sm max-w-md">
                <span>{message.text}</span>
                <span className="ml-2 opacity-70">({message.timestamp})</span>
              </div>
            </div>
          ) : (
            // Normal user message
            <div
              key={message.id}
              className={`flex ${message.sender === userName ? 'justify-end' : 'justify-start'
                } animate-fadeIn`}
            >
              <div
                className={`flex items-end gap-2 ${message.sender === userName ? 'flex-row-reverse' : ''
                  } max-w-[85%] sm:max-w-md`}
              >
                {/* Avatar */}
                <div
                  className={`flex-shrink-0 rounded-full flex items-center justify-center text-white text-xs sm:text-sm font-semibold shadow-md ${message.sender === userName
                    ? 'w-7 h-7 sm:w-10 sm:h-10'
                    : 'w-8 h-8 sm:w-10 sm:h-10'
                    } ${message.color || getSenderColor(message.sender)}`}
                >
                  {getInitials(message.sender)}
                </div>

                {/* Message Bubble */}
                <div
                  className={`px-3 py-2 sm:px-4 sm:py-3 rounded-2xl shadow-md text-sm sm:text-base break-words ${message.sender === userName
                    ? 'bg-indigo-500 text-white rounded-br-none'
                    : 'bg-white text-gray-900 border border-gray-200 rounded-bl-none'
                    }`}
                >
                  <p>{message.text}</p>
                  <div
                    className={`flex items-center justify-between mt-1 text-xs opacity-70 ${message.sender === userName ? 'flex-row-reverse' : ''
                      }`}
                  >
                    {message.sender !== userName && (
                      <span className="font-medium mr-2 truncate max-w-[80px] sm:max-w-none">
                        {message.sender}
                      </span>
                    )}
                    <span>{message.timestamp}</span>
                  </div>
                </div>
              </div>
            </div>
          )
        ))}
        <div ref={messagesEndRef} />
      </div>

      {/* Input Area */}
      <div className="bg-white border-t border-gray-200 p-3 sm:p-4 shadow-md">
        <div className="flex space-x-2">
          <textarea
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            onKeyDown={handleKeyPress}
            placeholder="Type a message..."
            className="flex-1 min-w-0 border border-gray-300 rounded-xl px-3 py-2 sm:px-4 sm:py-3 text-sm sm:text-base focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent resize-none"
            rows={1}
            style={{ maxHeight: '100px' }}
          />
          <button
            onClick={handleSendMessage}
            disabled={!inputText.trim() || !socketRef.current}
            className="bg-indigo-600 hover:bg-indigo-700 disabled:bg-gray-400 text-white p-2 sm:px-6 sm:py-3 rounded-xl transition-colors font-medium flex items-center justify-center whitespace-nowrap"
          >
            <svg
              className="w-5 h-5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M13 5l7 7-7 7M5 5l7 7-7 7"
              />
            </svg>
            <span className="hidden sm:inline ml-1">Send</span>
          </button>
        </div>
      </div>

      {/* Global Styles */}
      <style jsx>{`
        @keyframes fadeIn {
          from {
            opacity: 0;
            transform: translateY(10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        .animate-fadeIn {
          animation: fadeIn 0.3s ease-out;
        }
        textarea {
          min-height: 40px;
          line-height: 1.4;
        }
        .overflow-y-auto::-webkit-scrollbar {
          display: none;
        }
        .overflow-y-auto {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
      `}</style>
    </div>
  );
};

export default Chat;