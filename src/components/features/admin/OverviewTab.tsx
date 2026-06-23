/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { 
  BarChart, Bar, LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell 
} from 'recharts';
import { TrendingUp, Package, AlertTriangle, Users } from 'lucide-react';
import { Product, Category, Order } from '../../../types';

/**
 * ============================================================================
 * JUNIOR DEVELOPER ACADEMY: OverviewTab Component
 * ============================================================================
 * What is this component's purpose?
 * It displays real-time aggregated metrics (Total Revenue, Active Products count,
 * out-of-stock items, and total clients data representation) alongside 
 * interactive charting overlays (Recharts Revenue curve and Category Pie chart).
 *
 * Incoming Prop Requirements:
 * - orders: All purchase lot records
 * - products: System products inventory
 * - categories: Categorized asset lists
 * - totalRevenue: Summed USD secure transactions total
 * - outOfStockCount: Total count of items on zero quantity checks
 * - monthlySalesChartData: Monthly series calculations for the sales index trend
 * - categoryShareChartData: Aggregation of product values per category
 * - COLORS: Visual theme palette list
 * - citizens: Client rosters
 * ============================================================================
 */

interface OverviewTabProps {
  orders: Order[];
  products: Product[];
  categories: Category[];
  totalRevenue: number;
  outOfStockCount: number;
  monthlySalesChartData: any[];
  categoryShareChartData: any[];
  COLORS: string[];
  citizens: any[];
}

export default function OverviewTab({
  orders,
  products,
  categories,
  totalRevenue,
  outOfStockCount,
  monthlySalesChartData,
  categoryShareChartData,
  COLORS,
  citizens = []
}: OverviewTabProps) {
  return (
    <div className="flex flex-col gap-8">
      
      {/* Header section */}
      <div className="flex justify-between items-baseline border-b border-neutral-200 pb-5">
        <div>
          <span className="text-[10px] tracking-widest text-[#C9A96E] uppercase font-bold">Store Statistics</span>
          <h1 className="text-2xl font-light tracking-tight mt-1 font-serif text-neutral-900">Dashboard Overview</h1>
        </div>
        <span className="text-xs font-mono text-neutral-400 bg-white border border-neutral-100 px-3.5 py-1.5 rounded shadow-sm">
          Status: Live Data Connected
        </span>
      </div>

      {/* Metric grid blocks */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        
        <div className="bg-white border border-neutral-100 rounded p-5 shadow-sm flex items-center justify-between">
          <div>
            <span className="text-[10px] uppercase font-mono tracking-widest text-neutral-400">Total Revenue</span>
            <p className="text-2xl font-light text-neutral-900 mt-1 font-serif">${totalRevenue}.00</p>
          </div>
          <div className="p-2.5 bg-yellow-500/10 text-yellow-600 rounded">
            <TrendingUp className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-white border border-neutral-100 rounded p-5 shadow-sm flex items-center justify-between">
          <div>
            <span className="text-[10px] uppercase font-mono tracking-widest text-neutral-400">Active Products</span>
            <p className="text-2xl font-light text-neutral-900 mt-1 font-serif">{products.filter(p => p.isActive).length} items</p>
          </div>
          <div className="p-2.5 bg-neutral-500/10 text-neutral-600 rounded">
            <Package className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-white border border-neutral-100 rounded p-5 shadow-sm flex items-center justify-between">
          <div>
            <span className="text-[10px] uppercase font-mono tracking-widest text-neutral-400">Low Stock Items</span>
            <p className="text-2xl font-semibold text-red-650 mt-1 font-serif">{outOfStockCount} items</p>
          </div>
          <div className="p-2.5 bg-red-500/10 text-red-600 rounded">
            <AlertTriangle className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-white border border-neutral-100 rounded p-5 shadow-sm flex items-center justify-between">
          <div>
            <span className="text-[10px] uppercase font-mono tracking-widest text-[#737373] font-bold">Registered Citizens</span>
            <p className="text-2xl font-light text-neutral-900 mt-1 font-serif">{citizens.length} dossiers</p>
          </div>
          <div className="p-2.5 bg-zinc-500/10 text-zinc-650 rounded">
            <Users className="w-5 h-5" />
          </div>
        </div>

      </div>

      {/* Recharts Analytics blocks */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
        {/* Sales line graph block */}
        <div className="lg:col-span-8 bg-white border border-neutral-150 p-6 rounded shadow-sm">
          <h3 className="text-xs uppercase tracking-widest font-bold text-neutral-900 mb-6 font-mono border-b border-neutral-100 pb-2.5">
            Revenue Progression curve
          </h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={monthlySalesChartData}>
                <XAxis dataKey="name" stroke="#A3A3A3" fontSize={10} />
                <YAxis stroke="#A3A3A3" fontSize={10} />
                <Tooltip formatter={(value) => [`$${value}`, 'Sales']} />
                <Line type="monotone" dataKey="Sales" stroke="#C9A96E" strokeWidth={2.5} activeDot={{ r: 8 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Category pie chart block */}
        <div className="lg:col-span-4 bg-white border border-neutral-150 p-6 rounded shadow-sm flex flex-col justify-between">
          <h3 className="text-xs uppercase tracking-widest font-bold text-neutral-900 mb-4 font-mono border-b border-neutral-100 pb-2.5">
            Asset Value Category Allocation
          </h3>
          <div className="h-44 relative flex items-center justify-center">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={categoryShareChartData}
                  cx="50%"
                  cy="50%"
                  innerRadius={50}
                  outerRadius={75}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {categoryShareChartData.map((entry, index: number) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip formatter={(value) => [`$${value}`, 'Value']} />
              </PieChart>
            </ResponsiveContainer>
          </div>
          {/* Custom list description keys */}
          <div className="flex flex-wrap gap-2 text-[9px] font-mono mt-4">
            {categoryShareChartData.map((entry, index: number) => (
              <div key={entry.name} className="flex items-center gap-1 bg-neutral-50 border border-neutral-150 px-2 py-1 rounded">
                <span className="w-1.5 h-1.5 rounded-full inline-block" style={{ backgroundColor: COLORS[index % COLORS.length] }} />
                <span className="text-neutral-500 font-bold uppercase">{entry.name}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Recent Orders Overview table */}
      <div className="bg-white border border-neutral-100 p-6 rounded shadow-sm">
        <h3 className="text-xs uppercase tracking-widest font-bold text-neutral-900 mb-6 font-mono border-b border-neutral-100 pb-2.5 flex items-center justify-between">
          <span>Core Orders logs register</span>
          <span className="text-[10px] text-[#A3A3A3]">({orders.length} orders total)</span>
        </h3>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs bg-white">
            <thead>
              <tr className="border-b border-neutral-150 text-[10px] font-mono uppercase tracking-widest text-[#737373] bg-neutral-50">
                <th className="p-3">Order ID</th>
                <th className="p-3">Client</th>
                <th className="p-3">Settlement</th>
                <th className="p-3">Method</th>
                <th className="p-3 text-center">Fulfillment</th>
              </tr>
            </thead>
            <tbody>
              {orders.slice(0, 5).map((ord) => (
                <tr key={ord.id} className="border-b border-neutral-100 hover:bg-neutral-50/50">
                  <td className="p-3 font-mono font-bold">{ord.id}</td>
                  <td className="p-3 truncate max-w-[150px]">{ord.customerName}</td>
                  <td className="p-3 font-serif font-light">${ord.total}.00</td>
                  <td className="p-3 text-[10px] font-mono text-zinc-400">Stripe Live</td>
                  <td className="p-3 text-center">
                    <span className={`px-2 py-0.5 rounded text-[9px] font-bold font-mono inline-block ${
                      ord.status === 'DELIVERED' ? 'bg-emerald-50 text-emerald-700 border border-emerald-100' :
                      ord.status === 'SHIPPED' ? 'bg-indigo-50 text-indigo-750 border border-indigo-150' :
                      ord.status === 'PROCESSING' ? 'bg-amber-50 text-amber-700 border border-amber-100' :
                      'bg-neutral-100 text-neutral-600'
                    }`}>
                      {ord.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  );
}
