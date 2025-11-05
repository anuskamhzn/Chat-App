import React from 'react';
import { Route, Routes, NavLink, Router } from 'react-router-dom';
import { Toaster } from "react-hot-toast";

import Homepage from './Pages/Homepage';
import Login from './Pages/Auth/Login';
import Register from './Pages/Auth/Registration';
import Chat from './Pages/Chat/Chat';

const App = () => {
  return (
    <div className="App">
      <Toaster />
      <Routes>
        <Route path="/" element={<Homepage />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/chat" element={<Chat />} />

      </Routes>
    </div>
  );
};

export default App;
