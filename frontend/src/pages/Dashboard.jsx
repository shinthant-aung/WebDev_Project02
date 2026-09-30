import { useQuery } from '@tanstack/react-query';
import { Box, Warehouse, Truck, Layers, Users, AlertTriangle, CheckCircle } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

const fetchStats = async () => {
  const res = await fetch('/api/stats');
  if (!res.ok) throw new Error('Failed to fetch stats');
  return res.json();
};

const StatCard = ({ title, value, icon, color }) => (
  <div className="glass-panel" style={{ flex: 1, display: 'flex', alignItems: 'center', gap: '20px' }}>
    <div style={{ backgroundColor: `${color}20`, padding: '16px', borderRadius: '12px', color: color }}>
      {icon}
    </div>
    <div>
      <div style={{ color: 'var(--text-secondary)', fontSize: '14px', marginBottom: '4px' }}>{title}</div>
      <div style={{ fontSize: '32px', fontWeight: 'bold' }}>{value}</div>
    </div>
  </div>
);

const StatusIndicator = ({ error }) => (
  <div style={{ 
    display: 'flex', alignItems: 'center', gap: '10px', padding: '8px 16px', 
    backgroundColor: 'var(--bg-card)', borderRadius: '20px', 
    border: `1px solid ${error ? 'var(--danger)' : 'var(--success)'}`,
    boxShadow: `0 0 10px ${error ? 'rgba(239, 68, 68, 0.2)' : 'rgba(34, 197, 94, 0.2)'}`
  }}>
    <div style={{ 
      width: '10px', height: '10px', borderRadius: '50%', 
      backgroundColor: error ? 'var(--danger)' : 'var(--success)',
      boxShadow: `0 0 8px ${error ? 'var(--danger)' : 'var(--success)'}`
    }}></div>
    <span style={{ fontSize: '14px', fontWeight: '600', color: error ? 'var(--danger)' : 'var(--success)' }}>
      {error ? 'System Offline / Error' : 'System Operational'}
    </span>
  </div>
);

export default function Dashboard() {
  const role = localStorage.getItem('role') || 'WAREHOUSE_STAFF';
  const { data, isLoading, error } = useQuery({
    queryKey: ['stats'],
    queryFn: fetchStats,
    refetchInterval: 5000
  });

  const stats = data?.data || { products: 0, warehouses: 0, customers: 0, totalStock: 0, lowStockCount: 0, pendingShipments: 0, inTransitShipments: 0, deliveredShipments: 0, chartData: [] };

  if (isLoading) return <div style={{ padding: '32px' }}>Loading dashboard data...</div>;

  const renderAdminDashboard = () => (
    <>
      <div style={{ display: 'flex', gap: '24px', marginBottom: '40px' }}>
        <StatCard title="Total Products" value={stats.products} icon={<Box size={32} />} color="#3b82f6" />
        <StatCard title="Active Warehouses" value={stats.warehouses} icon={<Warehouse size={32} />} color="#8b5cf6" />
        <StatCard title="Pending Shipments" value={stats.pendingShipments} icon={<Truck size={32} />} color="#f59e0b" />
      </div>
      <div className="glass-panel">
        <h2 style={{ marginBottom: '24px' }}>Live Shipment Distribution</h2>
        <div style={{ height: '350px', width: '100%' }}>
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={stats.chartData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#334155" vertical={false} />
              <XAxis dataKey="name" stroke="#94a3b8" tick={{ fill: '#94a3b8' }} axisLine={false} tickLine={false} />
              <YAxis stroke="#94a3b8" tick={{ fill: '#94a3b8' }} axisLine={false} tickLine={false} allowDecimals={false} />
              <Tooltip cursor={{ fill: 'rgba(255,255,255,0.05)' }} contentStyle={{ backgroundColor: '#1e293b', border: '1px solid #334155', borderRadius: '8px', color: '#f8fafc' }} itemStyle={{ color: '#3b82f6', fontWeight: 'bold' }} />
              <Bar dataKey="count" name="Total Shipments" fill="#3b82f6" radius={[4, 4, 0, 0]} barSize={40} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </>
  );

  const renderWarehouseDashboard = () => (
    <>
      <div style={{ display: 'flex', gap: '24px', marginBottom: '40px' }}>
        <StatCard title="Total Units in Stock" value={stats.totalStock} icon={<Layers size={32} />} color="#3b82f6" />
        <StatCard title="Unique Products" value={stats.products} icon={<Box size={32} />} color="#8b5cf6" />
        <StatCard title="Low Stock Alerts (<50)" value={stats.lowStockCount} icon={<AlertTriangle size={32} />} color={stats.lowStockCount > 0 ? "#ef4444" : "#22c55e"} />
      </div>
      <div className="glass-panel">
        <h2 style={{ marginBottom: '16px' }}>Warehouse Operations Overview</h2>
        <p style={{ color: 'var(--text-secondary)', lineHeight: '1.6' }}>
          Welcome to the Warehouse Control Center. You are currently managing {stats.totalStock} units of inventory across our facilities. 
          {stats.lowStockCount > 0 ? ` Please review the ${stats.lowStockCount} items that are running low on stock.` : ' All inventory levels are healthy.'}
          Navigate to the Products or Inventory tabs on the left to add new stock or manage catalog details.
        </p>
      </div>
    </>
  );

  const renderLogisticsDashboard = () => (
    <>
      <div style={{ display: 'flex', gap: '24px', marginBottom: '40px' }}>
        <StatCard title="Action Required (Pending)" value={stats.pendingShipments} icon={<AlertTriangle size={32} />} color="#ef4444" />
        <StatCard title="Currently In Transit" value={stats.inTransitShipments} icon={<Truck size={32} />} color="#f59e0b" />
        <StatCard title="Successfully Delivered" value={stats.deliveredShipments} icon={<CheckCircle size={32} />} color="#22c55e" />
      </div>
      <div className="glass-panel" style={{ marginBottom: '24px' }}>
        <h2 style={{ marginBottom: '16px' }}>Logistics & Delivery Overview</h2>
        <p style={{ color: 'var(--text-secondary)', lineHeight: '1.6' }}>
          Welcome to the Logistics Control Center. You currently have {stats.pendingShipments} shipments awaiting processing and {stats.inTransitShipments} shipments on the road. 
          Use the Shipments tab to update delivery statuses in real-time, or the Customers tab to manage our {stats.customers} active client profiles.
        </p>
      </div>
    </>
  );

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '40px' }}>
        <div>
          <h1 style={{ marginBottom: '8px' }}>
            {role === 'ADMIN' ? 'Executive Overview' : role === 'WAREHOUSE_STAFF' ? 'Warehouse Hub' : 'Logistics Hub'}
          </h1>
          <p style={{ color: 'var(--text-secondary)' }}>Live metrics from your Nexus Logistics network.</p>
        </div>
        <StatusIndicator error={error} />
      </div>

      {error && <div style={{ padding: '16px', backgroundColor: 'rgba(239, 68, 68, 0.1)', color: 'var(--danger)', borderRadius: '8px', marginBottom: '32px', border: '1px solid var(--danger)' }}>Error loading stats: {error.message}</div>}

      {role === 'ADMIN' && renderAdminDashboard()}
      {role === 'WAREHOUSE_STAFF' && renderWarehouseDashboard()}
      {role === 'LOGISTICS_STAFF' && renderLogisticsDashboard()}
    </div>
  );
}
