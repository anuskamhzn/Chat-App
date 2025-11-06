import React from 'react';
import { Route, Routes, NavLink, Router } from 'react-router-dom';
import { Toaster } from "react-hot-toast";

import Homepage from './Pages/Homepage';
import Login from './Pages/Auth/Login';
import Register from './Pages/Auth/Registration';
import Chat from './Pages/Chat/Chat';
import PrivateRoute from './components/Routes/PrivateRoute';
import Profile from './Pages/User/Profile';
import EditProfile from './Pages/User/EditProfile';

const App = () => {
  return (
    <div className="App">
      <Toaster />
      <Routes>
        <Route path="/" element={<Homepage />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        {/* Protected routes */}
        <Route element={<PrivateRoute />}>
          <Route path="/chat" element={<Chat />} />
          <Route path="/profile" element={<Profile />} />
          <Route path="/edit-profile" element={<EditProfile />} />
        </Route>

      </Routes>
    </div>
  );
};

export default App;
