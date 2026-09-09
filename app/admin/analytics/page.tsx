'use client';

import { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';
import {
  getAnalyticsSummary,
  AnalyticsSummary,
  recordPageView,
} from '../../../data/analytics';
import { isAdmin } from '../../../data/users';

export default function AdminAnalyticsPage() {
  const [timeRange, setTimeRange] = useState<'today' | '7d' | '30d' | 'all'>('30d');
  const [data, setData] = useState<AnalyticsSummary | null>(null);
  const [hoveredPoint, setHoveredPoint] = useState<{
    date: string;
    label: string;
    pageviews: number;
    visitors: number;
    x: number;
    y1: number;
    y2: number;
  } | null>(null);
  const [activeTab, setActiveTab] = useState<'overview' | 'pages' | 'countries' | 'devices' | 'live'>('overview');
  const [isRefreshing, setIsRefreshing] = useState(false);

  const loadSummary = () => {
    setIsRefreshing(true);
    const summary = getAnalyticsSummary(timeRange);
    setData(summary);
    setTimeout(() => setIsRefreshing(false), 300);
  };

  useEffect(() => {
    loadSummary();

    const handleUpdate = () => {
      loadSummary();
    };

    window.addEventListener('mummabee_analytics_updated', handleUpdate);
    window.addEventListener('storage', handleUpdate);

    return () => {
      window.removeEventListener('mummabee_analytics_updated', handleUpdate);
      window.removeEventListener('storage', handleUpdate);
    };
  }, [timeRange]);

  // Simulate a test visit for demo/testing purposes
  const handleSimulateVisit = (sampleCountry: string, sampleCode: string, sampleFlag: string, page: string) => {
    recordPageView({
      path: page,
      title: page === '/' ? 'Homepage' : page.replace('/', '').replace(/-/g, ' ').toUpperCase(),
      country: sampleCountry,
      countryCode: sampleCode,
      flag: sampleFlag,
      device: Math.random() > 0.4 ? 'Mobile' : 'Desktop',
      os: Math.random() > 0.4 ? 'iOS' : 'Windows 11',
      browser: Math.random() > 0.4 ? 'Mobile Safari' : 'Chrome',
      referrer: 'Direct',
    });
    loadSummary();
  };

  // SVG Chart Calculations for Main Traffic Trend
  const chartConfig = useMemo(() => {
    if (!data || !data.dailyTrend.length) return null;
    const points = data.dailyTrend;
    const maxVal = Math.max(...points.map((p) => Math.max(p.pageviews, p.visitors)), 11);
    const width = 1000;
    const height = 260;
    const paddingX = 40;
    const paddingY = 30;
    const chartW = width - paddingX * 2;
    const chartH = height - paddingY * 2;

    const stepX = chartW / (points.length - 1 || 1);

    // Compute coordinate points
    const coords1 = points.map((p, i) => {
      const x = paddingX + i * stepX;
      const y = height - paddingY - (p.pageviews / maxVal) * chartH;
      return { x, y, ...p };
    });

    const coords2 = points.map((p, i) => {
      const x = paddingX + i * stepX;
      const y = height - paddingY - (p.visitors / maxVal) * chartH;
      return { x, y, ...p };
    });

    // Generate smooth SVG paths
    const makeSmoothPath = (pts: { x: number; y: number }[]) => {
      if (!pts.length) return '';
      let path = `M ${pts[0].x} ${pts[0].y}`;
      for (let i = 0; i < pts.length - 1; i++) {
        const curr = pts[i];
        const next = pts[i + 1];
        const cpX1 = curr.x + (next.x - curr.x) / 2;
        const cpY1 = curr.y;
        const cpX2 = curr.x + (next.x - curr.x) / 2;
        const cpY2 = next.y;
        path += ` C ${cpX1} ${cpY1}, ${cpX2} ${cpY2}, ${next.x} ${next.y}`;
      }
      return path;
    };

    const path1 = makeSmoothPath(coords1);
    const path2 = makeSmoothPath(coords2);

    // Area paths
    const area1 = `${path1} L ${coords1[coords1.length - 1].x} ${height - paddingY} L ${coords1[0].x} ${height - paddingY} Z`;
    const area2 = `${path2} L ${coords2[coords2.length - 1].x} ${height - paddingY} L ${coords2[0].x} ${height - paddingY} Z`;

    return {
      width,
      height,
      paddingX,
      paddingY,
      maxVal,
      coords1,
      coords2,
      path1,
      path2,
      area1,
      area2,
      points,
    };
  }, [data]);

  // Retention Curve Chart Calculation
  const retentionConfig = useMemo(() => {
    if (!data || !data.retentionCurve.length) return null;
    const pts = data.retentionCurve;
    const width = 450;
    const height = 180;
    const padX = 35;
    const padY = 25;
    const chartW = width - padX * 2;
    const chartH = height - padY * 2;
    const stepX = chartW / (pts.length - 1 || 1);

    const coords = pts.map((p, i) => ({
      x: padX + i * stepX,
      y: height - padY - (p.percentage / 100) * chartH,
      ...p,
    }));

    let path = `M ${coords[0].x} ${coords[0].y}`;
    for (let i = 0; i < coords.length - 1; i++) {
      path += ` L ${coords[i + 1].x} ${coords[i + 1].y}`;
    }

    return { width, height, coords, path, padX, padY };
  }, [data]);

  if (!isAdmin()) {
    return (
      <div className="min-h-[500px] flex items-center justify-center p-6 font-sans">
        <div className="bg-white max-w-md w-full rounded-3xl p-8 border border-red-200 shadow-card text-center space-y-4">
          <div className="w-14 h-14 rounded-2xl bg-red-50 text-red-500 border border-red-100 flex items-center justify-center mx-auto text-2xl">
            🚫
          </div>
          <div className="space-y-1">
            <span className="text-[10px] font-bold uppercase tracking-widest text-red-600 bg-red-50 px-2.5 py-0.5 rounded-full border border-red-200">
              HTTP 403 Forbidden
            </span>
            <h1 className="font-serif text-2xl font-bold text-[#683846] mt-2">
              Analytics Restricted
            </h1>
            <p className="text-xs text-[#332D2F]/75 leading-relaxed">
              System Analytics and Visitor Telemetry are strictly restricted to full-access Administrators. As an <strong>Assistant</strong>, you do not have permission to view visitor telemetry or system insights.
            </p>
          </div>
          <div className="pt-2">
            <Link
              href="/admin"
              className="inline-block px-6 py-2.5 bg-[#683846] text-white text-xs font-bold rounded-xl shadow-xs hover:bg-[#522b37] transition-all"
            >
              Return to Dashboard
            </Link>
          </div>
        </div>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="flex items-center justify-center min-h-[400px] text-[#B75B70]">
        <div className="flex flex-col items-center gap-2">
          <div className="w-8 h-8 border-2 border-[#B75B70] border-t-transparent rounded-full animate-spin" />
          <span className="text-xs text-[#332D2F]/60">Loading analytics data...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full bg-white text-[#332D2F] rounded-3xl p-5 sm:p-7 shadow-md border border-[#B75B70]/15 font-sans space-y-6">
      
      {/* Top Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-[#B75B70]/10">
        <div className="space-y-1">
          <div className="flex items-center gap-3">
            <h1 className="text-xl sm:text-2xl font-serif font-bold tracking-tight text-[#683846] flex items-center gap-2.5">
              <span>System Analytics & Insights</span>
            </h1>
            <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-[#683846]/10 text-[#683846] border border-[#683846]/20">
              <span className="w-1.5 h-1.5 rounded-full bg-[#683846] animate-pulse" />
              Live Tracking
            </span>
          </div>
          <p className="text-xs text-[#332D2F]/50">
            Real-time telemetry of visitor traffic, geographical locations, devices, and page activity.
          </p>
        </div>

        {/* Range Selector & Actions */}
        <div className="flex items-center gap-2.5">
          <div className="flex items-center bg-[#F8EDEF] border border-[#B75B70]/20 rounded-xl px-3 py-1.5 text-xs text-[#332D2F]">
            <span className="text-[#332D2F]/50 mr-2 text-[11px]">Range:</span>
            <select
              value={timeRange}
              onChange={(e) => setTimeRange(e.target.value as any)}
              className="bg-transparent text-[#683846] font-medium focus:outline-none cursor-pointer text-xs"
            >
              <option value="today">Today</option>
              <option value="7d">Last 7 Days</option>
              <option value="30d">Last 30 Days</option>
              <option value="all">All Time</option>
            </select>
          </div>

          <button
            onClick={loadSummary}
            disabled={isRefreshing}
            className="px-3 py-1.5 bg-[#683846] hover:bg-[#522b37] active:scale-95 text-xs font-semibold text-white rounded-xl border border-[#683846] transition-all flex items-center gap-1.5 cursor-pointer"
            title="Refresh analytics data"
          >
            <span className={isRefreshing ? 'animate-spin' : ''}>🔄</span>
            <span className="hidden sm:inline">Refresh</span>
          </button>
        </div>
      </div>

      {/* 4 Metric KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Card 1: Unique Visitors */}
        <div className="bg-[#F8EDEF] border border-[#B75B70]/15 rounded-2xl p-4 sm:p-5 flex items-start justify-between hover:border-[#B75B70]/30 transition-colors">
          <div className="space-y-1">
            <span className="text-[11px] font-bold uppercase tracking-wider text-[#332D2F]/50">
              UNIQUE VISITORS
            </span>
            <div className="text-2xl sm:text-3xl font-bold text-[#683846] tracking-tight">
              {data.uniqueVisitors}
            </div>
            <div className="text-xs font-medium text-[#B75B70]">
              {data.uniqueVisitorsChange}
            </div>
          </div>
          <div className="w-10 h-10 rounded-xl bg-[#683846]/10 border border-[#683846]/20 flex items-center justify-center text-[#683846] text-lg">
            👥
          </div>
        </div>

        {/* Card 2: Total Viewers (Pageviews) */}
        <div className="bg-[#F8EDEF] border border-[#B75B70]/15 rounded-2xl p-4 sm:p-5 flex items-start justify-between hover:border-[#B75B70]/30 transition-colors">
          <div className="space-y-1">
            <span className="text-[11px] font-bold uppercase tracking-wider text-[#332D2F]/50">
              TOTAL VIEWERS (PAGEVIEWS)
            </span>
            <div className="text-2xl sm:text-3xl font-bold text-[#683846] tracking-tight">
              {data.pageviews}
            </div>
            <div className="text-xs font-medium text-[#B75B70]">
              {data.pageviewsChange}
            </div>
          </div>
          <div className="w-10 h-10 rounded-xl bg-[#B75B70]/10 border border-[#B75B70]/20 flex items-center justify-center text-[#B75B70] text-lg">
            👁️
          </div>
        </div>

        {/* Card 3: Average Retention */}
        <div className="bg-[#F8EDEF] border border-[#B75B70]/15 rounded-2xl p-4 sm:p-5 flex items-start justify-between hover:border-[#B75B70]/30 transition-colors">
          <div className="space-y-1">
            <span className="text-[11px] font-bold uppercase tracking-wider text-[#332D2F]/50">
              AVERAGE RETENTION (DAY 1)
            </span>
            <div className="text-2xl sm:text-3xl font-bold text-[#683846] tracking-tight">
              {data.avgRetention}%
            </div>
            <div className="text-xs font-medium text-[#D7BB91]">
              Healthy retention
            </div>
          </div>
          <div className="w-10 h-10 rounded-xl bg-[#D7BB91]/15 border border-[#D7BB91]/25 flex items-center justify-center text-[#D7BB91] text-lg">
            ⏱️
          </div>
        </div>

        {/* Card 4: Order Conversion / Deals Clicked */}
        <div className="bg-[#F8EDEF] border border-[#B75B70]/15 rounded-2xl p-4 sm:p-5 flex items-start justify-between hover:border-[#B75B70]/30 transition-colors">
          <div className="space-y-1">
            <span className="text-[11px] font-bold uppercase tracking-wider text-[#332D2F]/50">
              ORDER CONVERSION RATE
            </span>
            <div className="text-2xl sm:text-3xl font-bold text-[#683846] tracking-tight">
              {data.conversionRate.toFixed(2)}%
            </div>
            <div className="text-xs font-medium text-[#332D2F]/40">
              0 orders placed
            </div>
          </div>
          <div className="w-10 h-10 rounded-xl bg-[#683846]/10 border border-[#683846]/20 flex items-center justify-center text-[#683846] text-lg">
            💲
          </div>
        </div>
      </div>

      {/* Main Chart: Traffic Trend (Pageviews & Unique Visitors) */}
      <div className="bg-white border border-[#B75B70]/10 rounded-2xl p-5 shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
          <h2 className="text-sm sm:text-base font-bold text-[#683846]">
            Traffic Trend (Pageviews &amp; Unique Visitors)
          </h2>

          {/* Legend */}
          <div className="flex items-center gap-5 text-xs">
            <div className="flex items-center gap-2 text-[#B75B70] font-medium">
              <span className="w-3.5 h-1 rounded-full bg-[#B75B70]" />
              <span>Pageviews</span>
            </div>
            <div className="flex items-center gap-2 text-[#683846] font-medium">
              <span className="w-3.5 h-1 rounded-full bg-[#683846]" />
              <span>Unique Visitors</span>
            </div>
          </div>
        </div>

        {/* SVG Curve Chart */}
        {chartConfig && (
          <div className="relative w-full overflow-x-auto">
            <div className="min-w-[680px]">
              <svg
                viewBox={`0 0 ${chartConfig.width} ${chartConfig.height}`}
                className="w-full h-auto overflow-visible select-none"
              >
                <defs>
                  <linearGradient id="plumGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#B75B70" stopOpacity="0.25" />
                    <stop offset="100%" stopColor="#B75B70" stopOpacity="0.0" />
                  </linearGradient>
                  <linearGradient id="deepPlumGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#683846" stopOpacity="0.20" />
                    <stop offset="100%" stopColor="#683846" stopOpacity="0.0" />
                  </linearGradient>
                </defs>

                {/* Horizontal Gridlines & Y-Axis values */}
                {[0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11].map((v) => {
                  const y = chartConfig.height - chartConfig.paddingY - (v / chartConfig.maxVal) * (chartConfig.height - chartConfig.paddingY * 2);
                  return (
                    <g key={v}>
                      <line
                        x1={chartConfig.paddingX}
                        y1={y}
                        x2={chartConfig.width - chartConfig.paddingX}
                        y2={y}
                        stroke="#B75B70"
                        strokeWidth="1"
                        strokeOpacity="0.1"
                        strokeDasharray={v === 0 ? 'none' : '4 4'}
                      />
                      <text
                        x={chartConfig.paddingX - 10}
                        y={y + 3.5}
                        fill="#332D2F"
                        fillOpacity="0.35"
                        fontSize="9"
                        textAnchor="end"
                        fontFamily="sans-serif"
                      >
                        {v}
                      </text>
                    </g>
                  );
                })}

                {/* Shaded Areas */}
                <path d={chartConfig.area1} fill="url(#plumGradient)" />
                <path d={chartConfig.area2} fill="url(#deepPlumGradient)" />

                {/* Lines */}
                <path
                  d={chartConfig.path1}
                  fill="none"
                  stroke="#B75B70"
                  strokeWidth="2.5"
                  strokeLinecap="round"
                />
                <path
                  d={chartConfig.path2}
                  fill="none"
                  stroke="#683846"
                  strokeWidth="2.5"
                  strokeLinecap="round"
                />

                {/* Data Points on Hover */}
                {chartConfig.coords1.map((p, i) => {
                  const p2 = chartConfig.coords2[i];
                  return (
                    <g
                      key={p.date}
                      className="cursor-pointer group"
                      onMouseEnter={() =>
                        setHoveredPoint({
                          date: p.date,
                          label: p.label,
                          pageviews: p.pageviews,
                          visitors: p2.visitors,
                          x: p.x,
                          y1: p.y,
                          y2: p2.y,
                        })
                      }
                      onMouseLeave={() => setHoveredPoint(null)}
                    >
                      {/* Invisible hover bar */}
                      <rect
                        x={p.x - 12}
                        y={chartConfig.paddingY}
                        width="24"
                        height={chartConfig.height - chartConfig.paddingY * 2}
                        fill="transparent"
                      />

                      {/* Point 1 (Pageviews) */}
                      <circle
                        cx={p.x}
                        cy={p.y}
                        r="3.5"
                        fill="#B75B70"
                        className="transition-transform group-hover:scale-150"
                      />

                      {/* Point 2 (Visitors) */}
                      <circle
                        cx={p2.x}
                        cy={p2.y}
                        r="3"
                        fill="#683846"
                        className="transition-transform group-hover:scale-150"
                      />

                      {/* X-axis date labels */}
                      {(i % 2 === 0 || i === chartConfig.coords1.length - 1) && (
                        <text
                          x={p.x}
                          y={chartConfig.height - 8}
                          fill="#332D2F"
                          fillOpacity="0.35"
                          fontSize="9"
                          textAnchor="middle"
                          fontFamily="sans-serif"
                        >
                          {p.label}
                        </text>
                      )}
                    </g>
                  );
                })}
              </svg>

              {/* Tooltip on hover */}
              {hoveredPoint && (
                <div
                  className="absolute z-30 pointer-events-none bg-white border border-[#B75B70]/20 shadow-xl rounded-xl px-3 py-2 text-xs text-[#332D2F]"
                  style={{
                    left: `${(hoveredPoint.x / chartConfig.width) * 100}%`,
                    top: '20px',
                    transform: 'translateX(-50%)',
                  }}
                >
                  <div className="font-semibold text-[#683846] border-b border-[#B75B70]/10 pb-1 mb-1 text-[11px]">
                    {hoveredPoint.label}
                  </div>
                  <div className="flex items-center gap-2 text-[#B75B70] text-xs">
                    <span>Pageviews:</span>
                    <span className="font-bold">{hoveredPoint.pageviews}</span>
                  </div>
                  <div className="flex items-center gap-2 text-[#683846] text-xs">
                    <span>Unique Visitors:</span>
                    <span className="font-bold">{hoveredPoint.visitors}</span>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Navigation Sub-Tabs */}
      <div className="flex items-center gap-2 border-b border-[#B75B70]/10 pb-2 overflow-x-auto text-xs font-medium">
        <button
          onClick={() => setActiveTab('overview')}
          className={`px-3.5 py-1.5 rounded-xl transition-all cursor-pointer ${
            activeTab === 'overview'
              ? 'bg-[#683846] text-white font-semibold'
              : 'text-[#332D2F]/50 hover:text-[#683846] hover:bg-[#F8EDEF]'
          }`}
        >
          📊 Retention &amp; Countries
        </button>
        <button
          onClick={() => setActiveTab('pages')}
          className={`px-3.5 py-1.5 rounded-xl transition-all cursor-pointer ${
            activeTab === 'pages'
              ? 'bg-[#683846] text-white font-semibold'
              : 'text-[#332D2F]/50 hover:text-[#683846] hover:bg-[#F8EDEF]'
          }`}
        >
          📄 Pages Visited ({data.topPages.length})
        </button>
        <button
          onClick={() => setActiveTab('countries')}
          className={`px-3.5 py-1.5 rounded-xl transition-all cursor-pointer ${
            activeTab === 'countries'
              ? 'bg-[#683846] text-white font-semibold'
              : 'text-[#332D2F]/50 hover:text-[#683846] hover:bg-[#F8EDEF]'
          }`}
        >
          🌍 Visitor Countries ({data.topCountries.length})
        </button>
        <button
          onClick={() => setActiveTab('devices')}
          className={`px-3.5 py-1.5 rounded-xl transition-all cursor-pointer ${
            activeTab === 'devices'
              ? 'bg-[#683846] text-white font-semibold'
              : 'text-[#332D2F]/50 hover:text-[#683846] hover:bg-[#F8EDEF]'
          }`}
        >
          📱 Devices &amp; Browsers
        </button>
        <button
          onClick={() => setActiveTab('live')}
          className={`px-3.5 py-1.5 rounded-xl transition-all flex items-center gap-1.5 cursor-pointer ${
            activeTab === 'live'
              ? 'bg-[#683846] text-white font-semibold'
              : 'text-[#332D2F]/50 hover:text-[#683846] hover:bg-[#F8EDEF]'
          }`}
        >
          <span className="w-2 h-2 rounded-full bg-[#B75B70] animate-pulse" />
          <span>Live Visitor Stream</span>
        </button>
      </div>

      {/* Tab: Overview (Retention Curve + Top Countries) */}
      {(activeTab === 'overview' || activeTab === 'countries') && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
          {/* Day 1 Retention Curve */}
          {activeTab === 'overview' && (
            <div className="lg:col-span-6 bg-[#F8EDEF] border border-[#B75B70]/15 rounded-2xl p-5 flex flex-col justify-between">
              <div>
                <h3 className="text-sm sm:text-base font-bold text-[#683846] mb-1">
                  Day 1 Retention Curve
                </h3>
                <p className="text-xs text-[#332D2F]/50 mb-3">
                  Percentage of returning readers across tracking intervals.
                </p>
              </div>

              {retentionConfig && (
                <div className="w-full">
                  <svg
                    viewBox={`0 0 ${retentionConfig.width} ${retentionConfig.height}`}
                    className="w-full h-auto overflow-visible select-none"
                  >
                    {/* Y-Axis lines */}
                    {[0, 20, 30, 40, 50, 60, 70, 80, 90, 100].map((v) => {
                      const y = retentionConfig.height - retentionConfig.padY - (v / 100) * (retentionConfig.height - retentionConfig.padY * 2);
                      return (
                        <g key={v}>
                          <line
                            x1={retentionConfig.padX}
                            y1={y}
                            x2={retentionConfig.width - 15}
                            y2={y}
                            stroke="#B75B70"
                            strokeWidth="1"
                            strokeOpacity="0.12"
                            strokeDasharray={v === 0 ? 'none' : '3 3'}
                          />
                          <text
                            x={retentionConfig.padX - 8}
                            y={y + 3}
                            fill="#332D2F"
                            fillOpacity="0.35"
                            fontSize="8"
                            textAnchor="end"
                          >
                            {v}
                          </text>
                        </g>
                      );
                    })}

                    {/* Step line in MummaBee gold */}
                    <path
                      d={retentionConfig.path}
                      fill="none"
                      stroke="#D7BB91"
                      strokeWidth="2"
                    />

                    {/* Nodes */}
                    {retentionConfig.coords.map((c, i) => (
                      <circle
                        key={i}
                        cx={c.x}
                        cy={c.y}
                        r="3"
                        fill="#D7BB91"
                      />
                    ))}
                  </svg>
                </div>
              )}
            </div>
          )}

          {/* Top Countries Horizontal Bars */}
          <div className={`${activeTab === 'countries' ? 'lg:col-span-12' : 'lg:col-span-6'} bg-[#F8EDEF] border border-[#B75B70]/15 rounded-2xl p-5`}>
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-sm sm:text-base font-bold text-[#683846] mb-1">
                  Top Countries
                </h3>
                <p className="text-xs text-[#332D2F]/50">
                  Where your visitors and readers are currently reading from.
                </p>
              </div>
              <span className="text-xs text-[#332D2F]/50 font-medium">
                {data.topCountries.length} countries recorded
              </span>
            </div>

            <div className="space-y-3.5 pt-1">
              {data.topCountries.map((c) => (
                <div key={c.country} className="space-y-1">
                  <div className="flex items-center justify-between text-xs">
                    <div className="flex items-center gap-2">
                      <span className="text-base">{c.flag}</span>
                      <span className="font-semibold text-[#332D2F]">{c.country}</span>
                    </div>
                    <div className="flex items-center gap-2 text-[#332D2F]/50 text-[11px]">
                      <span className="font-bold text-[#683846]">{c.visits} visits</span>
                      <span>({c.percentage}%)</span>
                    </div>
                  </div>

                  {/* Horizontal Bar */}
                  <div className="w-full h-2.5 bg-white rounded-full overflow-hidden border border-[#B75B70]/10">
                    <div
                      className="h-full bg-[#B75B70] rounded-full transition-all duration-700"
                      style={{ width: `${Math.min(c.percentage * 1.5 + 5, 100)}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Tab: Pages Visited Breakdown */}
      {activeTab === 'pages' && (
        <div className="bg-white border border-[#B75B70]/10 rounded-2xl p-5 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm sm:text-base font-bold text-[#683846]">
                Most Visited Pages &amp; Articles
              </h3>
              <p className="text-xs text-[#332D2F]/50">
                Detailed view count and visitor interest across all public routes.
              </p>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-[#332D2F]">
              <thead className="bg-[#F8EDEF] text-[11px] font-bold text-[#332D2F]/50 uppercase tracking-wider border-b border-[#B75B70]/10">
                <tr>
                  <th className="py-3 px-4">Page / Article Route</th>
                  <th className="py-3 px-4 text-right">Pageviews</th>
                  <th className="py-3 px-4 text-right">Unique Visitors</th>
                  <th className="py-3 px-4 text-right">Traffic Share</th>
                  <th className="py-3 px-4 text-center">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#B75B70]/5">
                {data.topPages.map((page) => (
                  <tr key={page.path} className="hover:bg-[#F8EDEF]/50 transition-colors">
                    <td className="py-3 px-4">
                      <div className="font-semibold text-[#683846]">{page.title}</div>
                      <div className="text-[11px] text-[#B75B70] font-mono mt-0.5">{page.path}</div>
                    </td>
                    <td className="py-3 px-4 text-right font-bold text-[#683846]">
                      {page.pageviews}
                    </td>
                    <td className="py-3 px-4 text-right text-[#B75B70] font-semibold">
                      {page.visitors}
                    </td>
                    <td className="py-3 px-4 text-right">
                      <span className="inline-block px-2 py-0.5 rounded-full text-[10px] font-semibold bg-[#683846]/10 text-[#683846] border border-[#683846]/15">
                        {page.percentage}%
                      </span>
                    </td>
                    <td className="py-3 px-4 text-center">
                      <Link
                        href={page.path}
                        target="_blank"
                        className="inline-flex items-center gap-1 text-[11px] text-[#332D2F]/40 hover:text-[#683846] transition-colors"
                      >
                        <span>View</span>
                        <span>↗</span>
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Tab: Devices & Operating Systems */}
      {activeTab === 'devices' && (
        <div className="space-y-5">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {data.deviceBreakdown.map((dev) => (
              <div
                key={dev.device}
                className="bg-[#F8EDEF] border border-[#B75B70]/15 rounded-2xl p-5 space-y-3"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <span className="text-2xl">{dev.icon}</span>
                    <span className="text-sm font-bold text-[#683846]">{dev.device}</span>
                  </div>
                  <span className="text-lg font-bold text-[#B75B70]">
                    {dev.percentage}%
                  </span>
                </div>

                <div className="w-full h-2 bg-white rounded-full overflow-hidden border border-[#B75B70]/10">
                  <div
                    className="h-full bg-[#B75B70] rounded-full"
                    style={{ width: `${dev.percentage}%` }}
                  />
                </div>

                <div className="text-[11px] text-[#332D2F]/50 flex items-center justify-between pt-1">
                  <span>{dev.count} total sessions</span>
                  <span className="font-semibold text-[#332D2F]/70">
                    {dev.device === 'Mobile' ? 'Smartphones' : dev.device === 'Desktop' ? 'Laptops & PCs' : 'iPads'}
                  </span>
                </div>
              </div>
            ))}
          </div>

          <div className="bg-[#F8EDEF] border border-[#B75B70]/15 rounded-2xl p-5">
            <h4 className="text-sm font-bold text-[#683846] mb-2">Device &amp; Platform Recommendations</h4>
            <p className="text-xs text-[#332D2F]/60 leading-relaxed">
              Based on your audience metrics, <strong className="text-[#B75B70]">{data.deviceBreakdown.find((d) => d.device === 'Mobile')?.percentage}%</strong> of all MummaBeeBlog visitors browse on mobile devices. All editorial articles, photography galleries, and discount codes are mobile-first responsive.
            </p>
          </div>
        </div>
      )}

      {/* Tab: Live Real-Time Visitor Stream */}
      {activeTab === 'live' && (
        <div className="bg-white border border-[#B75B70]/10 rounded-2xl p-5 shadow-sm space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h3 className="text-sm sm:text-base font-bold text-[#683846] flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-[#B75B70] animate-pulse" />
                Live Telemetry Log
              </h3>
              <p className="text-xs text-[#332D2F]/50">
                Latest 30 recorded visitor interactions with geographical coordinates and devices.
              </p>
            </div>

            {/* Simulation Quick Trigger */}
            <div className="flex items-center gap-2">
              <span className="text-[10px] text-[#332D2F]/40">Test Trigger:</span>
              <button
                onClick={() => handleSimulateVisit('United Arab Emirates', 'AE', '🇦🇪', '/uae-with-kids')}
                className="px-2.5 py-1 bg-[#F8EDEF] hover:bg-[#B75B70]/15 text-[#683846] rounded-lg text-[10px] font-semibold border border-[#B75B70]/20 cursor-pointer"
              >
                🇦🇪 UAE
              </button>
              <button
                onClick={() => handleSimulateVisit('Philippines', 'PH', '🇵🇭', '/')}
                className="px-2.5 py-1 bg-[#F8EDEF] hover:bg-[#B75B70]/15 text-[#683846] rounded-lg text-[10px] font-semibold border border-[#B75B70]/20 cursor-pointer"
              >
                🇵🇭 PH
              </button>
              <button
                onClick={() => handleSimulateVisit('United States', 'US', '🇺🇸', '/food')}
                className="px-2.5 py-1 bg-[#F8EDEF] hover:bg-[#B75B70]/15 text-[#683846] rounded-lg text-[10px] font-semibold border border-[#B75B70]/20 cursor-pointer"
              >
                🇺🇸 US
              </button>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-[#332D2F]">
              <thead className="bg-[#F8EDEF] text-[11px] font-bold text-[#332D2F]/50 uppercase tracking-wider border-b border-[#B75B70]/10">
                <tr>
                  <th className="py-3 px-4">Time</th>
                  <th className="py-3 px-4">Page Visited</th>
                  <th className="py-3 px-4">Country</th>
                  <th className="py-3 px-4">Device &amp; OS</th>
                  <th className="py-3 px-4">Browser</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#B75B70]/5">
                {data.recentVisitors.map((v) => {
                  const d = new Date(v.timestamp);
                  const timeFormatted = d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
                  const dateFormatted = d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
                  return (
                    <tr key={v.id} className="hover:bg-[#F8EDEF]/50 transition-colors">
                      <td className="py-3 px-4 whitespace-nowrap text-[#332D2F]/40 font-mono text-[11px]">
                        {dateFormatted} {timeFormatted}
                      </td>
                      <td className="py-3 px-4">
                        <Link
                          href={v.path}
                          target="_blank"
                          className="font-semibold text-[#683846] hover:text-[#B75B70] transition-colors block max-w-xs truncate"
                        >
                          {v.title || v.path}
                        </Link>
                        <span className="text-[10px] text-[#332D2F]/30 font-mono">{v.path}</span>
                      </td>
                      <td className="py-3 px-4 whitespace-nowrap">
                        <span className="mr-1.5 text-base">{v.flag}</span>
                        <span className="font-medium text-[#332D2F]">{v.country}</span>
                      </td>
                      <td className="py-3 px-4 whitespace-nowrap">
                        <span className="font-semibold text-[#683846]">
                          {v.device === 'Mobile' ? '📱 Mobile' : v.device === 'Tablet' ? '📟 Tablet' : '💻 Desktop'}
                        </span>
                        <span className="text-[10px] text-[#332D2F]/40 block">{v.os}</span>
                      </td>
                      <td className="py-3 px-4 whitespace-nowrap text-[#332D2F]/70">
                        {v.browser}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Quick Link to Content & Drafts History */}
      <div className="bg-white border border-[#B75B70]/15 rounded-3xl p-6 shadow-soft flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-[#F8EDEF] border border-[#B75B70]/20 flex items-center justify-center text-2xl shrink-0">
            📝
          </div>
          <div>
            <h3 className="font-serif text-base font-bold text-[#683846]">
              Content &amp; Drafts History
            </h3>
            <p className="text-xs text-[#332D2F]/60 mt-0.5">
              Review all editorial changes, published guides, active drafts in progress, and homepage updates.
            </p>
          </div>
        </div>
        <Link
          href="/admin/history"
          className="px-5 py-2.5 bg-[#683846] hover:bg-[#522b37] text-white rounded-full text-xs font-bold uppercase tracking-wider transition-all shadow-xs whitespace-nowrap"
        >
          Open History Log →
        </Link>
      </div>
    </div>
  );
}
