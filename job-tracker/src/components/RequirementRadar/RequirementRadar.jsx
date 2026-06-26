import React, { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';
import './RequirementRadar.css';

const RequirementRadar = () => {
  const [requirements, setRequirements] = useState([]);
  const [kValue, setKValue] = useState(5);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const token = useSelector((state) => state.auth.token);
  const isDarkMode = useSelector((state) => state.theme?.isDarkMode);

  useEffect(() => {
    const fetchRequirements = async () => {
      setLoading(true);
      setError(null);
      try {
        const response = await fetch(`${import.meta.env.VITE_API_URL}/analytics/requirements`, {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        if (!response.ok) {
          throw new Error('Failed to fetch analytics');
        }
        const data = await response.json();
        setRequirements(data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    if (token) {
      fetchRequirements();
    }
  }, [token]);

  const handleKValueChange = (e) => {
    const val = e.target.value;
    setKValue(val === 'All' ? requirements.length : parseInt(val));
  };

  const displayData = requirements.slice(0, kValue === 'All' ? requirements.length : kValue);

  // Styling based on dark mode
  const chartFillColor = isDarkMode ? '#4f46e5' : '#3b82f6';
  const axisTextColor = isDarkMode ? '#a1a1aa' : '#64748b';
  const tooltipBgColor = isDarkMode ? '#1e1e1e' : '#ffffff';
  const tooltipTextColor = isDarkMode ? '#ffffff' : '#000000';

  if (loading) return <div className="radar-loading">Loading Radar...</div>;
  if (error) return <div className="radar-error">Error: {error}</div>;

  return (
    <div className="requirement-radar-container">
      <div className="radar-header">
        <h3>Requirement Radar 📡</h3>
        <div className="radar-controls">
          <label htmlFor="kValueSelect">Top Skills:</label>
          <select 
            id="kValueSelect" 
            value={kValue === requirements.length ? 'All' : kValue} 
            onChange={handleKValueChange}
            className="radar-select"
          >
            <option value={5}>5</option>
            <option value={10}>10</option>
            <option value={15}>15</option>
            <option value="All">All</option>
          </select>
        </div>
      </div>
      
      {requirements.length === 0 ? (
        <p className="radar-empty">No job requirements found yet. Add some to your saved jobs!</p>
      ) : (
        <div className="radar-chart-wrapper">
          <ResponsiveContainer width="100%" height={300}>
            <BarChart
              layout="vertical"
              data={displayData}
              margin={{ top: 10, right: 30, left: 40, bottom: 5 }}
            >
              <XAxis type="number" hide />
              <YAxis 
                type="category" 
                dataKey="name" 
                tick={{ fill: axisTextColor, fontSize: 12 }} 
                width={100}
                axisLine={false}
                tickLine={false}
              />
              <Tooltip 
                cursor={{ fill: isDarkMode ? '#2d3748' : '#e2e8f0' }}
                contentStyle={{ 
                  backgroundColor: tooltipBgColor, 
                  color: tooltipTextColor,
                  border: `1px solid ${isDarkMode ? '#333' : '#ddd'}`,
                  borderRadius: '8px'
                }}
              />
              <Bar 
                dataKey="count" 
                fill={chartFillColor} 
                radius={[0, 4, 4, 0]} 
                barSize={24}
              />
            </BarChart>
          </ResponsiveContainer>
        </div>
      )}
    </div>
  );
};

export default RequirementRadar;
