import { useState } from 'react';
import { useSelector } from 'react-redux';
import { FaChevronDown, FaCheckCircle, FaExclamationTriangle, FaFilter, FaChartBar, FaChartPie } from 'react-icons/fa';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import './FunnelAnalytics.css';

export default function FunnelAnalytics() {
  const { items: jobs } = useSelector((state) => state.jobs);
  const isDarkMode = useSelector((state) => state.theme.isDarkMode);
  const [viewMode, setViewMode] = useState('funnel');

  // 1. Data Aggregation (Cumulative Funnel)
  const totalApplied = jobs.length;
  const totalPhoneScreens = jobs.filter(job => 
    ['Phone Screen', 'Technical', 'Offer'].includes(job.status) || !!job.datePhoneScreen || !!job.dateTechnical || !!job.dateOffer
  ).length;
  const totalTechnical = jobs.filter(job => 
    ['Technical', 'Offer'].includes(job.status) || !!job.dateTechnical || !!job.dateOffer
  ).length;
  const totalOffers = jobs.filter(job => job.status === 'Offer' || !!job.dateOffer).length;

  // 2. Conversion Math (rounded to 1 decimal, defaulting to 0)
  const calculateRate = (numerator, denominator) => {
    if (denominator === 0) return 0;
    return Number(((numerator / denominator) * 100).toFixed(1));
  };

  const resumeRate = calculateRate(totalPhoneScreens, totalApplied);
  const cultureFitRate = calculateRate(totalTechnical, totalPhoneScreens);
  const competencyRate = calculateRate(totalOffers, totalTechnical);

  // 4. Actionable Insights Engine
  let diagnosticMessage = 'Need more data to generate insights. Keep applying!';
  let isHealthy = false;

  if (totalApplied > 0) {
    if (resumeRate < 10 && totalApplied > 10) {
      diagnosticMessage = 'Bottleneck: Resume/Application. Your resume is not passing the ATS. Stop applying and rewrite your resume to better match job descriptions.';
    } else if (cultureFitRate < 40 && totalPhoneScreens > 3) {
      diagnosticMessage = 'Bottleneck: Initial Screening. Your resume is great, but you are losing them on the first call. Practice your elevator pitch and behavioral questions.';
    } else if (competencyRate < 50 && totalTechnical > 2) {
      diagnosticMessage = 'Bottleneck: Technical Execution. You are highly hirable, but your technical execution needs polish. Spend time doing mock interviews or take-home assessments.';
    } else if (resumeRate >= 10 && cultureFitRate >= 40 && competencyRate >= 50) {
      isHealthy = true;
      diagnosticMessage = 'Your pipeline is healthy! Keep up the momentum.';
    } else {
      diagnosticMessage = 'Your pipeline is forming. Keep gathering data to unlock targeted insights.';
    }
  }

  const chartData = [
    { name: 'Applied', value: totalApplied, color: '#3b82f6' },
    { name: 'Phone Screen', value: totalPhoneScreens, color: '#f59e0b' },
    { name: 'Technical', value: totalTechnical, color: '#6366f1' },
    { name: 'Offer', value: totalOffers, color: '#10b981' }
  ];

  const getWidth = (count) => {
    if (totalApplied === 0) return '0%';
    return `${Math.max((count / totalApplied) * 100, 10)}%`;
  };

  const CustomTooltip = ({ active, payload }) => {
    if (active && payload && payload.length) {
      return (
        <div className="chart-tooltip">
          <p className="tooltip-label">{payload[0].payload.name}</p>
          <p className="tooltip-value">{payload[0].value} Candidates</p>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="funnel-card">
      <div className="funnel-header">
        <h2 className="funnel-title">Hiring Funnel Analytics</h2>
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
      
      <div className="chart-container">
        {viewMode === 'funnel' && (
          <div className="funnel-visuals">
            <div className="funnel-stage">
              <div className="funnel-bar" style={{ width: '100%', backgroundColor: '#3b82f6' }}>
                <span className="stage-label">Applied</span>
                <span className="stage-count">{totalApplied}</span>
              </div>
            </div>
            <div className="funnel-connector">
              <span className="conversion-badge"><FaChevronDown /> {resumeRate}% conversion</span>
            </div>
            <div className="funnel-stage">
              <div className="funnel-bar" style={{ width: getWidth(totalPhoneScreens), backgroundColor: '#f59e0b' }}>
                <span className="stage-label">Phone Screen</span>
                <span className="stage-count">{totalPhoneScreens}</span>
              </div>
            </div>
            <div className="funnel-connector">
              <span className="conversion-badge"><FaChevronDown /> {cultureFitRate}% conversion</span>
            </div>
            <div className="funnel-stage">
              <div className="funnel-bar" style={{ width: getWidth(totalTechnical), backgroundColor: '#6366f1' }}>
                <span className="stage-label">Technical</span>
                <span className="stage-count">{totalTechnical}</span>
              </div>
            </div>
            <div className="funnel-connector">
              <span className="conversion-badge"><FaChevronDown /> {competencyRate}% conversion</span>
            </div>
            <div className="funnel-stage">
              <div className="funnel-bar" style={{ width: getWidth(totalOffers), backgroundColor: '#10b981' }}>
                <span className="stage-label">Offer</span>
                <span className="stage-count">{totalOffers}</span>
              </div>
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

        {viewMode === 'pie' && (
          <div className="pie-view">
            <div className="pie-chart-wrapper" style={{ width: '50%', height: 300 }}>
              <ResponsiveContainer>
                <PieChart>
                  <Pie
                    data={chartData}
                    cx="50%"
                    cy="50%"
                    innerRadius={70}
                    outerRadius={100}
                    paddingAngle={5}
                    dataKey="value"
                  >
                    {chartData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} stroke="none" />
                    ))}
                  </Pie>
                  <Tooltip content={<CustomTooltip />} />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className="pie-legend">
              <h4 className="legend-title">Conversion Rates</h4>
              <div className="legend-item">
                <span className="legend-dot" style={{ backgroundColor: '#f59e0b' }}></span>
                <span className="legend-text">Resume Rate: <strong>{resumeRate}%</strong></span>
              </div>
              <div className="legend-item">
                <span className="legend-dot" style={{ backgroundColor: '#6366f1' }}></span>
                <span className="legend-text">Culture Fit Rate: <strong>{cultureFitRate}%</strong></span>
              </div>
              <div className="legend-item">
                <span className="legend-dot" style={{ backgroundColor: '#10b981' }}></span>
                <span className="legend-text">Competency Rate: <strong>{competencyRate}%</strong></span>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Diagnostics Engine */}
      <div className={`diagnostics-section ${isHealthy ? 'healthy' : 'warning'}`}>
        <h3 className="diagnostics-title">
          {isHealthy ? <FaCheckCircle className="icon-success" /> : <FaExclamationTriangle className="icon-warning" />}
          Diagnostics
        </h3>
        <p className="diagnostics-message">{diagnosticMessage}</p>
      </div>
    </div>
  );
}
