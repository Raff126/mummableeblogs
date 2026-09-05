'use client';

import { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';
import {
  getAnalyticsSummary,
  AnalyticsSummary,
  recordPageView,
} from '../../../data/analytics';

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

  if (!data) {
    return (
      <div className="flex items-center justify-center min-h-[400px] text-gray-400">
        <div className="flex flex-col items-center gap-2">
          <div className="w-8 h-8 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin" />
          <span className="text-xs">Loading analytics data...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full bg-[#0B111E] text-slate-100 rounded-3xl p-5 sm:p-7 shadow-2xl border border-slate-800/80 font-sans space-y-6">
      
      {/* Top Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-800">
        <div className="space-y-1">
          <div className="flex items-center gap-3">
            <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-white flex items-center gap-2.5">
              <span>System Analytics &amp; Insights</span>
            </h1>
            <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-emerald-500/15 text-emerald-400 border border-emerald-500/30">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
              Live Tracking
            </span>
          </div>
          <p className="text-xs text-slate-400">
            Real-time telemetry of visitor traffic, geographical locations, devices, and page activity.
          </p>
        </div>

        {/* Range Selector & Actions */}
        <div className="flex items-center gap-2.5">
          <div className="flex items-center bg-slate-900 border border-slate-700/80 rounded-xl px-3 py-1.5 text-xs text-slate-200">
            <span className="text-slate-400 mr-2 text-[11px]">Range:</span>
            <select
              value={timeRange}
              onChange={(e) => setTimeRange(e.target.value as any)}
              className="bg-transparent text-white font-medium focus:outline-none cursor-pointer text-xs"
            >
              <option value="today" className="bg-slate-900 text-white">Today</option>
              <option value="7d" className="bg-slate-900 text-white">Last 7 Days</option>
              <option value="30d" className="bg-slate-900 text-white">Last 30 Days</option>
              <option value="all" className="bg-slate-900 text-white">All Time</option>
            </select>
          </div>

          <button
            onClick={loadSummary}
            disabled={isRefreshing}
            className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 active:scale-95 text-xs font-semibold text-slate-200 rounded-xl border border-slate-700 transition-all flex items-center gap-1.5"
            title="Refresh analytics data"
          >
            <span className={isRefreshing ? 'animate-spin' : ''}>🔄</span>
            <span className="hidden sm:inline">Refresh</span>
          </button>
        </div>
      </div>

      {/* 4 Metric KPI Cards (Matching Screenshot) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Card 1: Unique Visitors */}
        <div className="bg-[#131D2F] border border-slate-800 rounded-2xl p-4 sm:p-5 flex items-start justify-between shadow-soft hover:border-slate-700 transition-colors">
          <div className="space-y-1">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
              UNIQUE VISITORS
            </span>
            <div className="text-2xl sm:text-3xl font-bold text-white tracking-tight">
              {data.uniqueVisitors}
            </div>
            <div className="text-xs font-medium text-rose-400">
              {data.uniqueVisitorsChange}
            </div>
          </div>
          <div className="w-10 h-10 rounded-xl bg-purple-500/10 border border-purple-500/25 flex items-center justify-center text-purple-400 text-lg">
            👥
          </div>
        </div>

        {/* Card 2: Total Viewers (Pageviews) */}
        <div className="bg-[#131D2F] border border-slate-800 rounded-2xl p-4 sm:p-5 flex items-start justify-between shadow-soft hover:border-slate-700 transition-colors">
          <div className="space-y-1">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
              TOTAL VIEWERS (PAGEVIEWS)
            </span>
            <div className="text-2xl sm:text-3xl font-bold text-white tracking-tight">
              {data.pageviews}
            </div>
            <div className="text-xs font-medium text-emerald-400">
              {data.pageviewsChange}
            </div>
          </div>
          <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/25 flex items-center justify-center text-emerald-400 text-lg">
            👁️
          </div>
        </div>

        {/* Card 3: Average Retention */}
        <div className="bg-[#131D2F] border border-slate-800 rounded-2xl p-4 sm:p-5 flex items-start justify-between shadow-soft hover:border-slate-700 transition-colors">
          <div className="space-y-1">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
              AVERAGE RETENTION (DAY 1)
            </span>
            <div className="text-2xl sm:text-3xl font-bold text-white tracking-tight">
              {data.avgRetention}%
            </div>
            <div className="text-xs font-medium text-amber-400">
              Healthy retention
            </div>
          </div>
          <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/25 flex items-center justify-center text-amber-400 text-lg">
            ⏱️
          </div>
        </div>

        {/* Card 4: Order Conversion / Deals Clicked */}
        <div className="bg-[#131D2F] border border-slate-800 rounded-2xl p-4 sm:p-5 flex items-start justify-between shadow-soft hover:border-slate-700 transition-colors">
          <div className="space-y-1">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
              ORDER CONVERSION RATE
            </span>
            <div className="text-2xl sm:text-3xl font-bold text-white tracking-tight">
              {data.conversionRate.toFixed(2)}%
            </div>
            <div className="text-xs font-medium text-slate-400">
              0 orders placed
            </div>
          </div>
          <div className="w-10 h-10 rounded-xl bg-rose-500/10 border border-rose-500/25 flex items-center justify-center text-rose-400 text-lg">
            💲
          </div>
        </div>
      </div>

      {/* Main Chart: Traffic Trend (Pageviews & Unique Visitors) */}
      <div className="bg-[#131D2F] border border-slate-800 rounded-2xl p-5 shadow-soft">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
          <h2 className="text-sm sm:text-base font-bold text-white">
            Traffic Trend (Pageviews &amp; Unique Visitors)
          </h2>

          {/* Legend */}
          <div className="flex items-center gap-5 text-xs">
            <div className="flex items-center gap-2 text-emerald-400 font-medium">
              <span className="w-3.5 h-1 rounded-full bg-emerald-400" />
              <span>Pageviews</span>
            </div>
            <div className="flex items-center gap-2 text-purple-400 font-medium">
              <span className="w-3.5 h-1 rounded-full bg-purple-400" />
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
                  <linearGradient id="emeraldGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#10B981" stopOpacity="0.32" />
                    <stop offset="100%" stopColor="#10B981" stopOpacity="0.0" />
                  </linearGradient>
                  <linearGradient id="purpleGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#8B5CF6" stopOpacity="0.25" />
                    <stop offset="100%" stopColor="#8B5CF6" stopOpacity="0.0" />
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
                        stroke="#1E293B"
                        strokeWidth="1"
                        strokeDasharray={v === 0 ? 'none' : '4 4'}
                      />
                      <text
                        x={chartConfig.paddingX - 10}
                        y={y + 3.5}
                        fill="#64748B"
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
                <path d={chartConfig.area1} fill="url(#emeraldGradient)" />
                <path d={chartConfig.area2} fill="url(#purpleGradient)" />

                {/* Lines */}
                <path
                  d={chartConfig.path1}
                  fill="none"
                  stroke="#10B981"
                  strokeWidth="2.5"
                  strokeLinecap="round"
                />
                <path
                  d={chartConfig.path2}
                  fill="none"
                  stroke="#8B5CF6"
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
                        fill="#10B981"
                        className="transition-transform group-hover:scale-150"
                      />

                      {/* Point 2 (Visitors) */}
                      <circle
                        cx={p2.x}
                        cy={p2.y}
                        r="3"
                        fill="#8B5CF6"
                        className="transition-transform group-hover:scale-150"
                      />

                      {/* X-axis date labels */}
                      {(i % 2 === 0 || i === chartConfig.coords1.length - 1) && (
                        <text
                          x={p.x}
                          y={chartConfig.height - 8}
                          fill="#64748B"
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
                  className="absolute z-30 pointer-events-none bg-slate-900 border border-slate-700 shadow-xl rounded-xl px-3 py-2 text-xs text-white"
                  style={{
                    left: `${(hoveredPoint.x / chartConfig.width) * 100}%`,
                    top: '20px',
                    transform: 'translateX(-50%)',
                  }}
                >
                  <div className="font-semibold text-slate-300 border-b border-slate-700 pb-1 mb-1 text-[11px]">
                    {hoveredPoint.label}
                  </div>
                  <div className="flex items-center gap-2 text-emerald-400 text-xs">
                    <span>Pageviews:</span>
                    <span className="font-bold">{hoveredPoint.pageviews}</span>
                  </div>
                  <div className="flex items-center gap-2 text-purple-400 text-xs">
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
      <div className="flex items-center gap-2 border-b border-slate-800 pb-2 overflow-x-auto text-xs font-medium">
        <button
          onClick={() => setActiveTab('overview')}
          className={`px-3.5 py-1.5 rounded-xl transition-all ${
            activeTab === 'overview'
              ? 'bg-slate-800 text-white font-semibold'
              : 'text-slate-400 hover:text-white hover:bg-slate-800/50'
          }`}
        >
          📊 Retention &amp; Countries
        </button>
        <button
          onClick={() => setActiveTab('pages')}
          className={`px-3.5 py-1.5 rounded-xl transition-all ${
            activeTab === 'pages'
              ? 'bg-slate-800 text-white font-semibold'
              : 'text-slate-400 hover:text-white hover:bg-slate-800/50'
          }`}
        >
          📄 Pages Visited ({data.topPages.length})
        </button>
        <button
          onClick={() => setActiveTab('countries')}
          className={`px-3.5 py-1.5 rounded-xl transition-all ${
            activeTab === 'countries'
              ? 'bg-slate-800 text-white font-semibold'
              : 'text-slate-400 hover:text-white hover:bg-slate-800/50'
          }`}
        >
          🌍 Visitor Countries ({data.topCountries.length})
        </button>
        <button
          onClick={() => setActiveTab('devices')}
          className={`px-3.5 py-1.5 rounded-xl transition-all ${
            activeTab === 'devices'
              ? 'bg-slate-800 text-white font-semibold'
              : 'text-slate-400 hover:text-white hover:bg-slate-800/50'
          }`}
        >
          📱 Devices &amp; Browsers
        </button>
        <button
          onClick={() => setActiveTab('live')}
          className={`px-3.5 py-1.5 rounded-xl transition-all flex items-center gap-1.5 ${
            activeTab === 'live'
              ? 'bg-slate-800 text-white font-semibold'
              : 'text-slate-400 hover:text-white hover:bg-slate-800/50'
          }`}
        >
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
          <span>Live Visitor Stream</span>
        </button>
      </div>

      {/* Tab: Overview (Retention Curve + Top Countries matching screenshot) */}
      {(activeTab === 'overview' || activeTab === 'countries') && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
          {/* Day 1 Retention Curve (Matching screenshot) */}
          {activeTab === 'overview' && (
            <div className="lg:col-span-6 bg-[#131D2F] border border-slate-800 rounded-2xl p-5 shadow-soft flex flex-col justify-between">
              <div>
                <h3 className="text-sm sm:text-base font-bold text-white mb-1">
                  Day 1 Retention Curve
                </h3>
                <p className="text-xs text-slate-400 mb-3">
                  Percentage of returning readers across tracking intervals.
                </p>
              </div>

              {retentionConfig && (
                <div className="w-full">
                  <svg
                    viewBox={`0 0 ${retentionConfig.width} ${retentionConfig.height}`}
                    className="w-full h-auto overflow-visible select-none"
                  >
                    {/* Y-Axis lines: 0, 20, 40, 60, 80, 100 */}
                    {[0, 20, 30, 40, 50, 60, 70, 80, 90, 100].map((v) => {
                      const y = retentionConfig.height - retentionConfig.padY - (v / 100) * (retentionConfig.height - retentionConfig.padY * 2);
                      return (
                        <g key={v}>
                          <line
                            x1={retentionConfig.padX}
                            y1={y}
                            x2={retentionConfig.width - 15}
                            y2={y}
                            stroke="#1E293B"
                            strokeWidth="1"
                            strokeDasharray={v === 0 ? 'none' : '3 3'}
                          />
                          <text
                            x={retentionConfig.padX - 8}
                            y={y + 3}
                            fill="#64748B"
                            fontSize="8"
                            textAnchor="end"
                          >
                            {v}
                          </text>
                        </g>
                      );
                    })}

                    {/* Step line in Amber */}
                    <path
                      d={retentionConfig.path}
                      fill="none"
                      stroke="#F59E0B"
                      strokeWidth="2"
                    />

                    {/* Nodes */}
                    {retentionConfig.coords.map((c, i) => (
                      <circle
                        key={i}
                        cx={c.x}
                        cy={c.y}
                        r="3"
                        fill="#F59E0B"
                      />
                    ))}
                  </svg>
                </div>
              )}
            </div>
          )}

          {/* Top Countries Horizontal Bars (Matching screenshot) */}
          <div className={`${activeTab === 'countries' ? 'lg:col-span-12' : 'lg:col-span-6'} bg-[#131D2F] border border-slate-800 rounded-2xl p-5 shadow-soft`}>
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-sm sm:text-base font-bold text-white mb-1">
                  Top Countries
                </h3>
                <p className="text-xs text-slate-400">
                  Where your visitors and readers are currently reading from.
                </p>
              </div>
              <span className="text-xs text-slate-400 font-medium">
                {data.topCountries.length} countries recorded
              </span>
            </div>

            <div className="space-y-3.5 pt-1">
              {data.topCountries.map((c) => (
                <div key={c.country} className="space-y-1">
                  <div className="flex items-center justify-between text-xs">
                    <div className="flex items-center gap-2">
                      <span className="text-base">{c.flag}</span>
                      <span className="font-semibold text-slate-200">{c.country}</span>
                    </div>
                    <div className="flex items-center gap-2 text-slate-400 text-[11px]">
                      <span className="font-bold text-white">{c.visits} visits</span>
                      <span>({c.percentage}%)</span>
                    </div>
                  </div>

                  {/* Horizontal Bar */}
                  <div className="w-full h-2.5 bg-slate-800 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-emerald-400 rounded-full transition-all duration-700"
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
        <div className="bg-[#131D2F] border border-slate-800 rounded-2xl p-5 shadow-soft space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm sm:text-base font-bold text-white">
                Most Visited Pages &amp; Articles
              </h3>
              <p className="text-xs text-slate-400">
                Detailed view count and visitor interest across all public routes.
              </p>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-300">
              <thead className="bg-slate-900/60 text-[11px] font-bold text-slate-400 uppercase tracking-wider border-b border-slate-800">
                <tr>
                  <th className="py-3 px-4">Page / Article Route</th>
                  <th className="py-3 px-4 text-right">Pageviews</th>
                  <th className="py-3 px-4 text-right">Unique Visitors</th>
                  <th className="py-3 px-4 text-right">Traffic Share</th>
                  <th className="py-3 px-4 text-center">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {data.topPages.map((page) => (
                  <tr key={page.path} className="hover:bg-slate-800/40 transition-colors">
                    <td className="py-3 px-4">
                      <div className="font-semibold text-white">{page.title}</div>
                      <div className="text-[11px] text-emerald-400 font-mono mt-0.5">{page.path}</div>
                    </td>
                    <td className="py-3 px-4 text-right font-bold text-white">
                      {page.pageviews}
                    </td>
                    <td className="py-3 px-4 text-right text-purple-400 font-semibold">
                      {page.visitors}
                    </td>
                    <td className="py-3 px-4 text-right">
                      <span className="inline-block px-2 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                        {page.percentage}%
                      </span>
                    </td>
                    <td className="py-3 px-4 text-center">
                      <Link
                        href={page.path}
                        target="_blank"
                        className="inline-flex items-center gap-1 text-[11px] text-slate-400 hover:text-white transition-colors"
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
                className="bg-[#131D2F] border border-slate-800 rounded-2xl p-5 shadow-soft space-y-3"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <span className="text-2xl">{dev.icon}</span>
                    <span className="text-sm font-bold text-white">{dev.device}</span>
                  </div>
                  <span className="text-lg font-bold text-emerald-400">
                    {dev.percentage}%
                  </span>
                </div>

                <div className="w-full h-2 bg-slate-800 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-emerald-400 rounded-full"
                    style={{ width: `${dev.percentage}%` }}
                  />
                </div>

                <div className="text-[11px] text-slate-400 flex items-center justify-between pt-1">
                  <span>{dev.count} total sessions</span>
                  <span className="font-semibold text-slate-300">
                    {dev.device === 'Mobile' ? 'Smartphones' : dev.device === 'Desktop' ? 'Laptops & PCs' : 'iPads'}
                  </span>
                </div>
              </div>
            ))}
          </div>

          <div className="bg-[#131D2F] border border-slate-800 rounded-2xl p-5 shadow-soft">
            <h4 className="text-sm font-bold text-white mb-2">Device &amp; Platform Recommendations</h4>
            <p className="text-xs text-slate-400 leading-relaxed">
              Based on your audience metrics, <strong className="text-emerald-400">{data.deviceBreakdown.find((d) => d.device === 'Mobile')?.percentage}%</strong> of all MummaBeeBlog visitors browse on mobile devices. All editorial articles, photography galleries, and discount codes are mobile-first responsive.
            </p>
          </div>
        </div>
      )}

      {/* Tab: Live Real-Time Visitor Stream */}
      {activeTab === 'live' && (
        <div className="bg-[#131D2F] border border-slate-800 rounded-2xl p-5 shadow-soft space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h3 className="text-sm sm:text-base font-bold text-white flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                Live Telemetry Log
              </h3>
              <p className="text-xs text-slate-400">
                Latest 30 recorded visitor interactions with geographical coordinates and devices.
              </p>
            </div>

            {/* Simulation Quick Trigger */}
            <div className="flex items-center gap-2">
              <span className="text-[10px] text-slate-400">Test Trigger:</span>
              <button
                onClick={() => handleSimulateVisit('United Arab Emirates', 'AE', '🇦🇪', '/uae-with-kids')}
                className="px-2.5 py-1 bg-slate-800 hover:bg-slate-700 text-white rounded-lg text-[10px] font-semibold border border-slate-700"
              >
                🇦🇪 UAE
              </button>
              <button
                onClick={() => handleSimulateVisit('Philippines', 'PH', '🇵🇭', '/')}
                className="px-2.5 py-1 bg-slate-800 hover:bg-slate-700 text-white rounded-lg text-[10px] font-semibold border border-slate-700"
              >
                🇵🇭 PH
              </button>
              <button
                onClick={() => handleSimulateVisit('United States', 'US', '🇺🇸', '/food')}
                className="px-2.5 py-1 bg-slate-800 hover:bg-slate-700 text-white rounded-lg text-[10px] font-semibold border border-slate-700"
              >
                🇺🇸 US
              </button>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-300">
              <thead className="bg-slate-900/60 text-[11px] font-bold text-slate-400 uppercase tracking-wider border-b border-slate-800">
                <tr>
                  <th className="py-3 px-4">Time</th>
                  <th className="py-3 px-4">Page Visited</th>
                  <th className="py-3 px-4">Country</th>
                  <th className="py-3 px-4">Device &amp; OS</th>
                  <th className="py-3 px-4">Browser</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {data.recentVisitors.map((v) => {
                  const d = new Date(v.timestamp);
                  const timeFormatted = d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
                  const dateFormatted = d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
                  return (
                    <tr key={v.id} className="hover:bg-slate-800/40 transition-colors">
                      <td className="py-3 px-4 whitespace-nowrap text-slate-400 font-mono text-[11px]">
                        {dateFormatted} {timeFormatted}
                      </td>
                      <td className="py-3 px-4">
                        <Link
                          href={v.path}
                          target="_blank"
                          className="font-semibold text-white hover:text-emerald-400 transition-colors block max-w-xs truncate"
                        >
                          {v.title || v.path}
                        </Link>
                        <span className="text-[10px] text-slate-500 font-mono">{v.path}</span>
                      </td>
                      <td className="py-3 px-4 whitespace-nowrap">
                        <span className="mr-1.5 text-base">{v.flag}</span>
                        <span className="font-medium text-slate-200">{v.country}</span>
                      </td>
                      <td className="py-3 px-4 whitespace-nowrap">
                        <span className="font-semibold text-white">
                          {v.device === 'Mobile' ? '📱 Mobile' : v.device === 'Tablet' ? '📟 Tablet' : '💻 Desktop'}
                        </span>
                        <span className="text-[10px] text-slate-400 block">{v.os}</span>
                      </td>
                      <td className="py-3 px-4 whitespace-nowrap text-slate-300">
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

    </div>
  );
}
