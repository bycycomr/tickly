import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

interface ProtectedRouteProps {
  children: JSX.Element;
  requireRole?: string;
}

export default function ProtectedRoute({ children, requireRole }: ProtectedRouteProps) {
  const { user, token, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  if (!token || !user) {
    return <Navigate to="/login" replace />;
  }

  if (requireRole && !user.roles?.includes(requireRole)) {
    return <Navigate to="/dashboard" replace />;
  }

  return children;
}

