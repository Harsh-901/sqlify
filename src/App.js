import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import SQLEditorPage from './components/SQLEditorPage';
import LoginPage from './components/LoginPage';
import RegisterPage from './components/RegisterPage';
import HomePage from './components/HomePage';
import GamePage from './components/GamePage';
import SyntheticDataPage from './components/SyntheticDataPage'
import SQLChatbot from './components/SQLChatbot';
import Schema from './components/Schema'

const App = () => {
  return (
    <Routes>
      <Route path="/" element={<Navigate to="/login" />} />
      <Route path="/login" element={<LoginPage />} />
      <Route path="/register" element={<RegisterPage />} />
      <Route path="/homePage" element={<HomePage />} />
      <Route path="/sql-editor" element={<SQLEditorPage />} />
      <Route path="*" element={<Navigate to="/login" />} />
      <Route path="game" element={<GamePage />} /> 
      <Route path="/synthetic-data" element={<SyntheticDataPage />} />
      <Route path="/chat-bot" element={<SQLChatbot />} />
      <Route path="/schema" element={<Schema />} />
    </Routes>
  );
};

export default App;
