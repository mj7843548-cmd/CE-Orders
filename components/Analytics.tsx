
import React, { useState, useMemo } from 'react';
import { Order } from '../types';
import { TrendingUp, Wallet, ShoppingCart, Activity, ShieldCheck, Banknote, MessageCircle, Globe, ChevronDown, Percent, PieChart, Calendar, UserPlus, Star, Filter } from 'lucide-react';

interface AnalyticsProps {
  orders: Order[];
}

type Period = 'all' | 'today' | 'yesterday' | 'thisWeek' | 'lastMonth' | 'thisMonth' | 'custom';
type SourceFilter = 'all' | 'Whatsapp' | 'Website';
type PotentialFilter = 'all' | 'confirmed' | 'potential';

const Analytics: React.FC<AnalyticsProps> = ({ orders }) => {
  const [period, setPeriod] = useState<Period>('all');
  const [sourceFilter, setSourceFilter] = useState<SourceFilter>('all');
  const [potentialFilter, setPotentialFilter] = useState<PotentialFilter>('all');
  const [customRange, setCustomRange] = useState({ start: '', end: '' });

  const filteredOrders = useMemo(() => {
    const now = new Date();
    const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime();
    
    return orders.filter(o => {
      // 1. Time Filter
      const orderDate = new Date(o.orderDate).getTime();
      let isInPeriod = true;
      switch (period) {
        case 'today':
          isInPeriod = orderDate >= todayStart;
          break;
        case 'yesterday': {
          const yesterdayStart = todayStart - 86400000;
          isInPeriod = orderDate >= yesterdayStart && orderDate < todayStart;
          break;
        }
        case 'thisWeek': {
          const day = now.getDay();
          const diff = now.getDate() - day + (day === 0 ? -6 : 1);
          const mondayStart = new Date(new Date(now).setDate(diff)).setHours(0,0,0,0);
          isInPeriod = orderDate >= mondayStart;
          break;
        }
        case 'thisMonth': {
          const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1).getTime();
          isInPeriod = orderDate >= startOfMonth;
          break;
        }
        case 'lastMonth': {
          const startOfLastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1).getTime();
          const endOfLastMonth = new Date(now.getFullYear(), now.getMonth(), 0, 23, 59, 59).getTime();
          isInPeriod = orderDate >= startOfLastMonth && orderDate <= endOfLastMonth;
          break;
        }
        case 'custom': {
          if (!customRange.start || !customRange.end) return true;
          const start = new Date(customRange.start).getTime();
          const end = new Date(customRange.end).setHours(23, 59, 59, 999);
          isInPeriod = orderDate >= start && orderDate <= end;
          break;
        }
        default:
          isInPeriod = true;
      }

      // 2. Source Filter
      const isInSource = sourceFilter === 'all' || o.orderSource === sourceFilter;

      // 3. Potential Filter
      let isInPotentialStatus = true;
      if (potentialFilter === 'confirmed') isInPotentialStatus = !o.isPotential;
      else if (potentialFilter === 'potential') isInPotentialStatus = !!o.isPotential;

      return isInPeriod && isInSource && isInPotentialStatus;
    });
  }, [orders, period, sourceFilter, potentialFilter, customRange]);

  const stats = useMemo(() => {
    const totalOrders = filteredOrders.length;
    const totalRevenue = filteredOrders.reduce((sum, o) => sum + o.totalAmountPaid, 0);
    
    // User requested AOV based on (order amount - discount)
    const grossMinusDiscount = filteredOrders.reduce((sum, o) => sum + (o.orderAmount - o.discountGiven), 0);
    const avgOrder = totalOrders > 0 ? grossMinusDiscount / totalOrders : 0;
    
    const sellerIncome = filteredOrders.reduce((sum, o) => sum + (o.sellerIncome || 0), 0);
    const totalGst = filteredOrders.reduce((sum, o) => sum + (o.gstAmount || 0), 0);
    const totalReferrals = filteredOrders.reduce((sum, o) => sum + (o.referralAmount || 0), 0);
    const totalPgCharges = filteredOrders.reduce((sum, o) => sum + (o.totalAmountPaid * (o.pgRate || 0)), 0);
    
    const netCeProfit = totalRevenue - totalGst - totalPgCharges - totalReferrals - sellerIncome;

    const whatsappRevenue = filteredOrders
      .filter(o => o.orderSource === 'Whatsapp')
      .reduce((sum, o) => sum + o.totalAmountPaid, 0);
      
    const websiteRevenue = filteredOrders
      .filter(o => o.orderSource === 'Website')
      .reduce((sum, o) => sum + o.totalAmountPaid, 0);

    const categoryMap = new Map<string, number>();
    filteredOrders.forEach(o => {
      const cat = o.category || 'Uncategorized';
      categoryMap.set(cat, (categoryMap.get(cat) || 0) + o.totalAmountPaid);
    });

    const categoryShare = Array.from(categoryMap.entries())
      .map(([name, value]) => ({ 
        name, 
        value, 
        percent: totalRevenue > 0 ? (value / totalRevenue) * 100 : 0 
      }))
      .sort((a, b) => b.value - a.value);

    return { 
      totalRevenue, totalOrders, avgOrder, sellerIncome, totalGst, 
      totalReferrals, totalPgCharges, netCeProfit,
      whatsappRevenue, websiteRevenue, categoryShare 
    };
  }, [filteredOrders]);

  return (
    <div className="space-y-6 pb-10 animate-in fade-in duration-500 max-w-5xl mx-auto">
      {/* Filter Bar */}
      <div className="bg-white p-3 md:p-5 rounded-3xl border border-slate-100 shadow-sm space-y-4">
        {/* Changed grid-cols-1 to grid-cols-3 to keep them in one row on mobile */}
        <div className="grid grid-cols-3 gap-1.5 md:gap-4">
          <div className="space-y-1 md:space-y-1.5">
            <label className="text-[7px] md:text-[10px] font-black text-slate-400 uppercase tracking-tight md:tracking-widest ml-1 flex items-center gap-0.5 md:gap-1">
              <Calendar size={8} className="md:w-[10px] md:h-[10px]" /> Time
            </label>
            <div className="relative">
              <select
                value={period}
                onChange={(e) => setPeriod(e.target.value as Period)}
                className="w-full appearance-none bg-slate-50 border border-slate-200 p-2 md:p-3.5 rounded-xl md:rounded-2xl text-[8px] md:text-[10px] font-black uppercase tracking-tight md:tracking-widest text-[#27335c] focus:border-[#27335c] outline-none transition-all shadow-sm"
              >
                <option value="all">History</option>
                <option value="today">Today</option>
                <option value="yesterday">Y'day</option>
                <option value="thisWeek">Week</option>
                <option value="thisMonth">Month</option>
                <option value="lastMonth">L.Month</option>
                <option value="custom">Custom</option>
              </select>
              <ChevronDown className="absolute right-2 md:right-4 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" size={10} />
            </div>
          </div>

          <div className="space-y-1 md:space-y-1.5">
            <label className="text-[7px] md:text-[10px] font-black text-slate-400 uppercase tracking-tight md:tracking-widest ml-1 flex items-center gap-0.5 md:gap-1">
              <Globe size={8} className="md:w-[10px] md:h-[10px]" /> Stream
            </label>
            <div className="relative">
              <select
                value={sourceFilter}
                onChange={(e) => setSourceFilter(e.target.value as SourceFilter)}
                className="w-full appearance-none bg-slate-50 border border-slate-200 p-2 md:p-3.5 rounded-xl md:rounded-2xl text-[8px] md:text-[10px] font-black uppercase tracking-tight md:tracking-widest text-[#27335c] focus:border-[#27335c] outline-none transition-all shadow-sm"
              >
                <option value="all">All</option>
                <option value="Whatsapp">WA</option>
                <option value="Website">Web</option>
              </select>
              <ChevronDown className="absolute right-2 md:right-4 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" size={10} />
            </div>
          </div>

          <div className="space-y-1 md:space-y-1.5">
            <label className="text-[7px] md:text-[10px] font-black text-slate-400 uppercase tracking-tight md:tracking-widest ml-1 flex items-center gap-0.5 md:gap-1">
              <Star size={8} className="md:w-[10px] md:h-[10px]" /> Status
            </label>
            <div className="relative">
              <select
                value={potentialFilter}
                onChange={(e) => setPotentialFilter(e.target.value as PotentialFilter)}
                className="w-full appearance-none bg-slate-50 border border-slate-200 p-2 md:p-3.5 rounded-xl md:rounded-2xl text-[8px] md:text-[10px] font-black uppercase tracking-tight md:tracking-widest text-[#27335c] focus:border-[#27335c] outline-none transition-all shadow-sm"
              >
                <option value="all">All</option>
                <option value="confirmed">Conf.</option>
                <option value="potential">Poten.</option>
              </select>
              <ChevronDown className="absolute right-2 md:right-4 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" size={10} />
            </div>
          </div>
        </div>

        {period === 'custom' && (
          <div className="grid grid-cols-2 gap-4 pt-2 animate-in slide-in-from-top-2">
            <div className="space-y-1">
              <span className="text-[8px] font-black text-slate-400 uppercase ml-1">Start Date</span>
              <input type="date" value={customRange.start} onChange={(e) => setCustomRange({...customRange, start: e.target.value})} className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold outline-none" />
            </div>
            <div className="space-y-1">
              <span className="text-[8px] font-black text-slate-400 uppercase ml-1">End Date</span>
              <input type="date" value={customRange.end} onChange={(e) => setCustomRange({...customRange, end: e.target.value})} className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold outline-none" />
            </div>
          </div>
        )}
      </div>

      {/* Hero: Net CE Profit - SHORTENED HEIGHT */}
      <div className="bg-[#27335c] p-6 md:p-8 rounded-[2rem] border border-white/10 shadow-2xl relative overflow-hidden group">
        <div className="relative z-10 flex flex-col items-center text-center">
          <div className="flex items-center gap-2 text-indigo-300 mb-1">
             <ShieldCheck size={20} strokeWidth={3} />
             <h2 className="text-[10px] font-black uppercase tracking-[0.3em]">Net CE Profit</h2>
          </div>
          <h1 className="text-4xl md:text-5xl font-black text-white">₹{stats.netCeProfit.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</h1>
          <p className="text-[8px] font-bold text-indigo-300 uppercase tracking-widest mt-2 opacity-60">Clean Earnings after all costs</p>
        </div>
        <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full -mr-24 -mt-24 blur-3xl group-hover:scale-125 transition-transform duration-1000"></div>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-3xl border border-slate-100 shadow-sm flex flex-col items-center text-center">
          <div className="p-3 bg-indigo-50 text-indigo-600 rounded-2xl mb-3">
            <ShoppingCart size={20} strokeWidth={2.5} />
          </div>
          <div className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Total Orders</div>
          <div className="text-lg font-black text-indigo-700">{stats.totalOrders}</div>
        </div>

        <div className="bg-white p-5 rounded-3xl border border-slate-100 shadow-sm flex flex-col items-center text-center">
          <div className="p-3 bg-slate-50 text-slate-600 rounded-2xl mb-3">
            <Activity size={20} strokeWidth={2.5} />
          </div>
          <div className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Avg. Order Value</div>
          <div className="text-lg font-black text-slate-700">₹{stats.avgOrder.toLocaleString(undefined, {maximumFractionDigits: 0})}</div>
        </div>

        <div className="bg-white p-5 rounded-3xl border border-slate-100 shadow-sm flex flex-col items-center text-center group">
          <div className="p-3 bg-emerald-50 text-emerald-600 rounded-2xl mb-3 group-hover:scale-110 transition-transform">
            <Wallet size={20} strokeWidth={2.5} />
          </div>
          <div className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Seller Income</div>
          <div className="text-lg font-black text-emerald-700">₹{stats.sellerIncome.toLocaleString()}</div>
        </div>

        <div className="bg-white p-5 rounded-3xl border border-slate-100 shadow-sm flex flex-col items-center text-center group">
          <div className="p-3 bg-amber-50 text-amber-600 rounded-2xl mb-3 group-hover:scale-110 transition-transform">
            <Banknote size={20} strokeWidth={2.5} />
          </div>
          <div className="text-[9px] font-black text-slate-400 uppercase tracking-widest">GST Collected</div>
          <div className="text-lg font-black text-amber-700">₹{stats.totalGst.toLocaleString()}</div>
        </div>

        <div className="bg-white p-5 rounded-3xl border border-slate-100 shadow-sm flex flex-col items-center text-center group">
          <div className="p-3 bg-emerald-100 text-emerald-700 rounded-2xl mb-3 group-hover:scale-110 transition-transform">
            <MessageCircle size={20} strokeWidth={2.5} />
          </div>
          <div className="text-[9px] font-black text-slate-400 uppercase tracking-widest">WhatsApp Rev.</div>
          <div className="text-lg font-black text-emerald-800">₹{stats.whatsappRevenue.toLocaleString()}</div>
        </div>

        <div className="bg-white p-5 rounded-3xl border border-slate-100 shadow-sm flex flex-col items-center text-center group">
          <div className="p-3 bg-indigo-100 text-indigo-700 rounded-2xl mb-3 group-hover:scale-110 transition-transform">
            <Globe size={20} strokeWidth={2.5} />
          </div>
          <div className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Website Rev.</div>
          <div className="text-lg font-black text-indigo-800">₹{stats.websiteRevenue.toLocaleString()}</div>
        </div>

        <div className="bg-red-50 p-5 rounded-3xl border border-red-100 shadow-sm flex flex-col items-center text-center group">
          <div className="p-3 bg-white text-red-600 rounded-2xl mb-3 group-hover:scale-110 transition-transform">
            <Percent size={20} strokeWidth={2.5} />
          </div>
          <div className="text-[9px] font-black text-red-400 uppercase tracking-widest">PG Charges (Cost)</div>
          <div className="text-lg font-black text-red-800">₹{stats.totalPgCharges.toLocaleString(undefined, {maximumFractionDigits: 2})}</div>
        </div>

        <div className="bg-amber-100 p-5 rounded-3xl border border-amber-200 shadow-inner flex flex-col items-center text-center group">
          <div className="p-3 bg-white text-amber-600 rounded-2xl mb-3 group-hover:rotate-12 transition-transform">
            <UserPlus size={20} strokeWidth={2.5} />
          </div>
          <div className="text-[9px] font-black text-amber-600 uppercase tracking-widest">Referral Payout</div>
          <div className="text-lg font-black text-amber-800">₹{stats.totalReferrals.toLocaleString()}</div>
        </div>
      </div>

      <div className="bg-white p-8 rounded-[2rem] border border-slate-100 shadow-sm">
        <div className="flex items-center gap-3 mb-8">
           <div className="p-2.5 bg-amber-50 text-amber-600 rounded-xl">
             <PieChart size={20} />
           </div>
           <div>
              <h3 className="text-sm font-black text-[#27335c] uppercase tracking-widest">Product Distribution</h3>
              <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">Gross value by category</p>
           </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
          <div className="space-y-5">
            {stats.categoryShare.length === 0 ? (
              <p className="text-center text-slate-300 font-black text-[10px] uppercase py-10">No category data</p>
            ) : stats.categoryShare.map(cat => (
              <div key={cat.name} className="flex flex-col gap-2">
                 <div className="flex justify-between items-center text-[10px] font-black uppercase tracking-tight">
                    <span className="text-slate-600 truncate max-w-[200px]">{cat.name}</span>
                    <span className="text-[#27335c]">₹{cat.value.toLocaleString()}</span>
                 </div>
                 <div className="w-full h-3 bg-slate-50 rounded-full overflow-hidden border border-slate-100 relative">
                    <div className="h-full bg-gradient-to-r from-[#27335c] to-indigo-400 rounded-full transition-all duration-1000 ease-out" style={{ width: `${cat.percent}%` }}></div>
                 </div>
                 <div className="flex justify-end">
                    <span className="text-[8px] font-bold text-slate-400 uppercase tracking-widest">{cat.percent.toFixed(1)}% CONTRIBUTION</span>
                 </div>
              </div>
            ))}
          </div>

          <div className="bg-slate-50 rounded-3xl p-6 flex flex-col justify-center border border-slate-100">
             <div className="space-y-4 text-center md:text-left">
                <div>
                   <h4 className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">Total Gross (Paid)</h4>
                   <p className="text-2xl font-black text-[#27335c]">₹{stats.totalRevenue.toLocaleString()}</p>
                </div>
                <div className="h-px bg-slate-200 w-full"></div>
                <div>
                   <h4 className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">Primary Engine</h4>
                   <p className="text-xs font-black text-[#27335c] uppercase">{stats.categoryShare[0]?.name || 'No Sales'}</p>
                </div>
             </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Analytics;
