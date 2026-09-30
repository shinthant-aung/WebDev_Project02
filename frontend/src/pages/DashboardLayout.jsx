import { useState } from 'react';
import { Outlet, Navigate, useLocation } from 'react-router-dom';
import Sidebar from '../components/Sidebar';
import { Search } from 'lucide-react';

export default function DashboardLayout() {
  const token = localStorage.getItem('token');
  const role = localStorage.getItem('role') || 'WAREHOUSE_STAFF';
  const location = useLocation();
  const [searchQuery, setSearchQuery] = useState('');

  if (!token) {
    return <Navigate to="/login" replace />;
  }

  const path = location.pathname;

  // Strict Segregation Enforcement
  if (role === 'WAREHOUSE_STAFF') {
    if (path.includes('shipments') || path.includes('customers')) {
      return <Navigate to="/dashboard" replace />;
    }
  }

  if (role === 'LOGISTICS_STAFF') {
    if (path.includes('products') || path.includes('inventory') || path.includes('warehouses')) {
      return <Navigate to="/dashboard" replace />;
    }
  }

  return (
    <div className="app-container">
      <Sidebar />
      <main className="main-content" style={{ display: 'flex', flexDirection: 'column', padding: 0 }}>
        {/* Main Content Area */}
        <div style={{ flex: 1, padding: '32px 40px 40px 40px', overflowY: 'auto', position: 'relative' }}>
          
          {/* Universal Search (Absolutely positioned to match H1 level) */}
          {path !== '/dashboard' && (
            <div style={{ position: 'absolute', top: '32px', right: '40px', width: '300px', zIndex: 10 }}>
              <Search size={18} style={{ position: 'absolute', left: '16px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-secondary)' }} />
              <input 
                type="text" 
                className="input-field" 
                style={{ 
                  marginBottom: 0, 
                  paddingLeft: '44px', 
                  borderRadius: '24px', 
                  backgroundColor: 'var(--bg-card)', 
                  border: '1px solid var(--border-color)',
                  height: '44px'
                }}
                placeholder="Search..." 
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
          )}

          <Outlet context={{ searchQuery }} />
        </div>
      </main>
    </div>
  );
}
