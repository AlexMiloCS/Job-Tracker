import { useState } from 'react';
import { useSelector } from 'react-redux';
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer, BarChart, Bar, XAxis, YAxis } from 'recharts';
import { FaInfoCircle, FaFilter, FaChartBar, FaChartPie, FaChevronDown } from 'react-icons/fa';
import './StatusBreakdown.css';

export default function StatusBreakdown() {
  const { items: jobs } = useSelector((state) => state.jobs);
  const isDarkMode = useSelector((state) => state.theme.isDarkMode);
  const [viewMode, setViewMode] = useState('pie');

  // Helper to find the latest date of a job
  const getLatestDate = (job) => {
    const dates = [
      job.dateApplied,
      job.datePhoneScreen,
      job.dateTechnical,
      job.dateOffer,
      job.dateRejected,
      job.updatedAt,
      job.createdAt
    ].filter(Boolean).map(d => new Date(d).getTime());
    
    return dates.length > 0 ? Math.max(...dates) : Date.now();
  };

  const thirtyDaysMs = 30 * 24 * 60 * 60 * 1000;
  const now = Date.now();

  let activeCount = 0;
  let interviewingCount = 0;
  let offersCount = 0;
  let rejectedCount = 0;
  let ghostedCount = 0;

  jobs.forEach(job => {
    const isStale = (now - getLatestDate(job)) > thirtyDaysMs;

    if (job.status === 'Rejected') {
      rejectedCount++;
    } else if (job.status === 'Offer') {
      offersCount++;
    } else if (job.status === 'Ghosted') {
      ghostedCount++;
    } else if (isStale) {
      ghostedCount++;
    } else if (['Phone Screen', 'Technical', 'Manager Interview'].includes(job.status)) {
      interviewingCount++;
    } else {
      // Applied, Pending, In Progress, Saved, etc.
      activeCount++;
    }
  });

  const totalApplications = jobs.length;
  const closedCount = rejectedCount + ghostedCount;
  const totalActive = activeCount + interviewingCount + offersCount;

  const rejectionRate = totalApplications > 0 ? ((rejectedCount / totalApplications) * 100).toFixed(1) : 0;
  const closedRate = totalApplications > 0 ? ((closedCount / totalApplications) * 100).toFixed(1) : 0;
  const activeRate = totalApplications > 0 ? ((totalActive / totalApplications) * 100).toFixed(1) : 0;

  let highestActiveStage = 'Active/Pending';
  if (offersCount > 0) highestActiveStage = 'Offers';
  else if (interviewingCount > 0) highestActiveStage = 'Interviewing';
  else if (activeCount > 0) highestActiveStage = 'Active/Pending';
  else highestActiveStage = 'None';

  const chartData = [
    { name: 'Active/Pending', value: activeCount, color: '#3b82f6' },      // Blue
    { name: 'Interviewing', value: interviewingCount, color: '#8b5cf6' },  // Purple
    { name: 'Offers', value: offersCount, color: '#10b981' },              // Emerald
    { name: 'Rejected', value: rejectedCount, color: '#ef4444' },          // Red
    { name: 'Ghosted/Stale', value: ghostedCount, color: '#64748b' }       // Slate
  ].filter(item => item.value > 0);

  const CustomTooltip = ({ active, payload }) => {
    if (active && payload && payload.length) {
      return (
        <div className="status-tooltip">
          <p className="tooltip-label">{payload[0].payload.name}</p>
          <p className="tooltip-value">{payload[0].value} Applications</p>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="status-breakdown-card">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
        <h2 className="status-title" style={{ margin: 0 }}>Pipeline Status Breakdown</h2>
        <div className="view-toggle">
          <button 
            className={`toggle-btn ${viewMode === 'funnel' ? 'active' : ''}`}
            onClick={() => setViewMode('funnel')}
            title="Funnel View"
          >
            <FaFilter />
          </button>
          <button 
            className={`toggle-btn ${viewMode === 'bar' ? 'active' : ''}`}
            onClick={() => setViewMode('bar')}
            title="Bar Chart"
          >
            <FaChartBar />
          </button>
          <button 
            className={`toggle-btn ${viewMode === 'pie' ? 'active' : ''}`}
            onClick={() => setViewMode('pie')}
            title="Pie Chart"
          >
            <FaChartPie />
          </button>
        </div>
      </div>
      
      <div className="status-chart-area" style={{ marginBottom: '32px', minHeight: '350px' }}>
        {viewMode === 'pie' && (
          <div className="status-content">
            <div className="status-chart-container">
              <ResponsiveContainer width="100%" height={250}>
                <PieChart>
                  <Pie
                    data={chartData}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={90}
                    paddingAngle={4}
                    dataKey="value"
                    stroke="none"
                  >
                    {chartData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip content={<CustomTooltip />} />
                </PieChart>
              </ResponsiveContainer>
            </div>

            <div className="status-legend-container">
              <ul className="status-legend-list">
                {chartData.map((item, index) => (
                  <li key={index} className="status-legend-item">
                    <span className="legend-color-dot" style={{ backgroundColor: item.color }}></span>
                    <span className="legend-label">{item.name}</span>
                    <span className="legend-count">({item.value})</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        )}

        {viewMode === 'bar' && (
          <div style={{ width: '100%', height: 350 }}>
            <ResponsiveContainer>
              <BarChart data={chartData} margin={{ top: 20, right: 30, left: 0, bottom: 5 }}>
                <XAxis dataKey="name" stroke={isDarkMode ? "#cbd5e1" : "#475569"} fontSize={12} tickLine={false} axisLine={false} />
                <YAxis stroke={isDarkMode ? "#cbd5e1" : "#475569"} fontSize={12} tickLine={false} axisLine={false} />
                <Tooltip content={<CustomTooltip />} cursor={{ fill: isDarkMode ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.05)' }} />
                <Bar dataKey="value" radius={[6, 6, 0, 0]}>
                  {chartData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        )}

        {viewMode === 'funnel' && (
          <div className="funnel-visuals" style={{ paddingTop: '20px' }}>
             {chartData.map((stage, index) => (
               <div key={stage.name}>
                 <div className="funnel-stage">
                   <div className="funnel-bar" style={{ width: `${Math.max((stage.value / totalApplications) * 100, 10)}%`, backgroundColor: stage.color }}>
                     <span className="stage-label">{stage.name}</span>
                     <span className="stage-count">{stage.value}</span>
                   </div>
                 </div>
                 {index < chartData.length - 1 && (
                   <div className="funnel-connector" style={{ margin: '8px auto' }}>
                     <span className="conversion-badge" style={{ backgroundColor: 'transparent', padding: 0 }}><FaChevronDown style={{ color: 'var(--text-secondary)' }} /></span>
                   </div>
                 )}
               </div>
             ))}
          </div>
        )}
      </div>

      <div className="status-insights">
        <FaInfoCircle className="insights-icon" />
        <div className="insights-text">
          <p className="insights-primary">
            <strong>Total Rejection Rate: {rejectionRate}%</strong>
          </p>
          <p className="insights-secondary">
            Out of your total pipeline, <strong>{closedRate}%</strong> of applications are currently closed/rejected, while <strong>{activeRate}%</strong> remain active. 
            Your primary pool of active momentum is in the <strong>{highestActiveStage}</strong> stage.
          </p>
        </div>
      </div>
    </div>
  );
}
