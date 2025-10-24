import React, { useState, useEffect } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import './Analytics.css'; // Assuming a corresponding CSS file

// Mock data for demonstration
const mockAnalyticsData = {
  magazineTitle: "Q3 2025 Business Review",
  totalViews: 1245,
  totalDownloads: 320,
  engagementScore: 78,
  viewsByMonth: [
    { name: 'Jul', views: 400 },
    { name: 'Aug', views: 300 },
    { name: 'Sep', views: 545 },
  ],
  deviceDistribution: [
    { name: 'Desktop', value: 650, color: '#0088FE' },
    { name: 'Mobile', value: 450, color: '#00C49F' },
    { name: 'Tablet', value: 145, color: '#FFBB28' },
  ],
};

const Analytics = ({ magazineId }) => {
  const [analyticsData, setAnalyticsData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    // In a real application, this would be an API call to fetch analytics for a specific magazineId
    // For now, we use mock data
    setTimeout(() => {
      setAnalyticsData(mockAnalyticsData);
      setLoading(false);
    }, 1200);
  }, [magazineId]);

  if (loading) {
    return <div className="analytics-loading">Loading analytics data...</div>;
  }

  if (error) {
    return <div className="analytics-error">Error loading analytics: {error}</div>;
  }

  const { magazineTitle, totalViews, totalDownloads, engagementScore, viewsByMonth, deviceDistribution } = analyticsData;

  const RADIAN = Math.PI / 180;
  const renderCustomizedLabel = ({ cx, cy, midAngle, innerRadius, outerRadius, percent, index }) => {
    const radius = innerRadius + (outerRadius - innerRadius) * 0.5;
    const x = cx + radius * Math.cos(-midAngle * RADIAN);
    const y = cy + radius * Math.sin(-midAngle * RADIAN);

    return (
      <text x={x} y={y} fill="white" textAnchor={x > cx ? 'start' : 'end'} dominantBaseline="central">
        {`${(percent * 100).toFixed(0)}%`}
      </text>
    );
  };

  return (
    <div className="analytics-container">
      <header className="analytics-header">
        <h1>Analytics for: {magazineTitle}</h1>
        <p className="magazine-id">Magazine ID: {magazineId || 'N/A'}</p>
      </header>

      <section className="analytics-kpis">
        <div className="kpi-card">
          <span className="kpi-label">Total Views</span>
          <span className="kpi-value">{totalViews.toLocaleString()}</span>
        </div>
        <div className="kpi-card">
          <span className="kpi-label">Total Downloads</span>
          <span className="kpi-value">{totalDownloads.toLocaleString()}</span>
        </div>
        <div className="kpi-card">
          <span className="kpi-label">Engagement Score</span>
          <span className="kpi-value">{engagementScore}%</span>
        </div>
      </section>

      <section className="analytics-charts">
        <div className="chart-card">
          <h2>Views Over Time</h2>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={viewsByMonth} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Bar dataKey="views" fill="#8884d8" name="Views" />
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="chart-card">
          <h2>Device Distribution</h2>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={deviceDistribution}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={renderCustomizedLabel}
                outerRadius={100}
                fill="#8884d8"
                dataKey="value"
              >
                {deviceDistribution.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip formatter={(value) => value.toLocaleString()} />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </section>
    </div>
  );
};
