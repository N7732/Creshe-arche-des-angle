import React, { useState, useEffect } from 'react';
import { Loader2 } from 'lucide-react';
import DashboardLayout from './DashboardLayout';

export default function AdminPortal() {
  const [session, setSession] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('authToken');
    const parentDataRaw = localStorage.getItem('parentData');
    
    // We check if the authToken exists. If they logged in as an admin from the unified UI, 
    // it will have set 'authToken' for backward compatibility.
    // We can also extract the user's email from parentData if it exists and they are admin.
    
    let userEmail = 'admin';
    if (parentDataRaw) {
      try {
        const parentData = JSON.parse(parentDataRaw);
        if (parentData.role === 'admin' || parentData.role === 'superadmin') {
          userEmail = parentData.email || 'admin';
        }
      } catch (e) {
        console.error("Error parsing parentData", e);
      }
    }

    if (token) {
      setSession({ user: { email: userEmail } });
    } else {
      // Not logged in or not admin, redirect to home to use the unified modal
      window.location.href = '/';
    }
    setLoading(false);
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-900">
        <Loader2 className="w-10 h-10 animate-spin text-indigo-500" />
      </div>
    );
  }

  if (!session) {
    return null; // The redirect will handle this
  }

  return <DashboardLayout session={session} />;
}
