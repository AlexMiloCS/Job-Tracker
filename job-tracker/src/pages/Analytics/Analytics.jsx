import { useState } from 'react';
import { FaChartBar, FaChartPie, FaChartLine } from 'react-icons/fa';
import FunnelAnalytics from '../../components/FunnelAnalytics/FunnelAnalytics';
import './Analytics.css';

export default function Analytics() {
  const [activeTab, setActiveTab] = useState('funnel');

  return (
    <div className="analytics-page">
      <aside className="analytics-sidebar">
        <h2 className="analytics-sidebar-title">Metrics</h2>
        <nav className="analytics-sidebar-nav">
          <button 
            className={`analytics-sidebar-nav-item ${activeTab === 'funnel' ? 'active' : ''}`}
            onClick={() => setActiveTab('funnel')}
          >
            <FaChartBar className="analytics-sidebar-icon" />
            Hiring Funnel
          </button>
          <button 
            className={`analytics-sidebar-nav-item disabled`}
            disabled
            title="Coming Soon"
          >
            <FaChartPie className="analytics-sidebar-icon" />
            Time to Hire
          </button>
          <button 
            className={`analytics-sidebar-nav-item disabled`}
            disabled
            title="Coming Soon"
          >
            <FaChartLine className="analytics-sidebar-icon" />
            Source Quality
          </button>
        </nav>
      </aside>

      <section className="analytics-content">
        <div className="analytics-header">
          <h1>Analytics Dashboard</h1>
          <p className="analytics-subtitle">Track your hiring pipeline and identify bottlenecks.</p>
        </div>

        <div className="analytics-grid">
          {activeTab === 'funnel' && <FunnelAnalytics />}
          {/* Future widgets can go here based on activeTab */}
        </div>
      </section>
    </div>
  );
}
