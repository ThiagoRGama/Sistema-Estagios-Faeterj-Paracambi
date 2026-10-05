import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Home from './pages/Home';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Profile from './pages/Profile';
import Documents from './pages/Documents';
import Upload from './pages/Upload';
import Notifications from './pages/Notifications';
import Messages from './pages/Messages';
import Companies from './pages/Companies';
import Faq from './pages/Faq';
import AdminUsers from './pages/AdminUsers';
import Vacancies from './pages/Vacancies';
import Security from './pages/Security';
import Insurance from './pages/Insurance';
import StudentInsurance from './pages/StudentInsurance';
import DocsTemplate from './pages/DocsTemplate';
import Header from './components/Header';
import { AuthProvider } from './context/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';

const ProtectedShell = ({ children }) => (
  <ProtectedRoute>
    <div className="min-h-screen bg-slate-50">
      <Header />
      {children}
    </div>
  </ProtectedRoute>
);

const App = () => {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<Login />} />
          <Route path="/dashboard" element={<ProtectedShell><Dashboard /></ProtectedShell>} />
          <Route path="/profile" element={<ProtectedShell><Profile /></ProtectedShell>} />
          <Route path="/documents" element={<ProtectedShell><Documents /></ProtectedShell>} />
          <Route path="/upload" element={<ProtectedShell><Upload /></ProtectedShell>} />
          <Route path="/companies" element={<ProtectedShell><Companies /></ProtectedShell>} />
          <Route path="/vacancies" element={<ProtectedShell><Vacancies /></ProtectedShell>} />
          <Route path="/faq" element={<ProtectedShell><Faq /></ProtectedShell>} />
          <Route path="/notifications" element={<ProtectedShell><Notifications /></ProtectedShell>} />
          <Route path="/messages" element={<ProtectedShell><Messages /></ProtectedShell>} />
          <Route path="/admin/users" element={<ProtectedShell><AdminUsers /></ProtectedShell>} />
          <Route path="/security" element={<ProtectedShell><Security /></ProtectedShell>} />
          <Route path="/docs/:templateId" element={<ProtectedShell><DocsTemplate /></ProtectedShell>} />
          <Route path="/insurance" element={<ProtectedShell><Insurance /></ProtectedShell>} />
          <Route path="/student-insurance" element={<ProtectedShell><StudentInsurance /></ProtectedShell>} />
        </Routes>
      </Router>
    </AuthProvider>
  );
};

export default App;
