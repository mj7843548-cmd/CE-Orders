
import React, { useState, useMemo, useRef } from 'react';
import { Order } from '../types';
import { Search, Globe, MessageCircle, Eye, Users, Star, Download, Upload, Trash2, Edit2, Info, Calculator } from 'lucide-react';

interface OrdersListProps {
  orders: Order[];
  onDelete: (id: string) => void;
  onEdit: (order: Order) => void;
  onImport: (orders: Order[]) => void;
}

const OrdersList: React.FC<OrdersListProps> = ({ orders, onDelete, onEdit, onImport }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const filteredOrders = useMemo(() => {
    return orders.filter(o => 
      (o.customerName?.toLowerCase() || '').includes(searchTerm.toLowerCase()) ||
      (o.sellerName?.toLowerCase() || '').includes(searchTerm.toLowerCase()) ||
      (o.orderNumber?.toLowerCase() || '').includes(searchTerm.toLowerCase())
    );
  }, [orders, searchTerm]);

  const searchStats = useMemo(() => {
    if (!searchTerm) return null;
    const count = filteredOrders.length;
    const revenue = filteredOrders.reduce((sum, o) => sum + o.totalAmountPaid, 0);
    return { count, revenue };
  }, [filteredOrders, searchTerm]);

  const exportToCSV = () => {
    if (orders.length === 0) return;
    const headers = [
      'Order Date', 'Order Number', 'Customer Name', 'Email', 'Mobile', 
      'Order Amount', 'Discount', 'GST Amount', 'Wallet Amount', 
      'Referral Amount', 'Total Paid', 'Category', 'Source', 'Potential'
    ];
    
    const rows = orders.map(o => [
      o.orderDate, o.orderNumber, o.customerName, o.email, o.mobileNumber,
      o.orderAmount, o.discountGiven, o.gstAmount, o.walletAmount,
      o.referralAmount, o.totalAmountPaid, o.category, o.orderSource, o.isPotential ? 'Yes' : 'No'
    ]);

    const csvContent = [
      headers.join(','),
      ...rows.map(e => e.join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `ce_orders_${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleImportCSV = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const text = event.target?.result as string;
      const lines = text.split('\n');
      const importedOrders: Order[] = [];

      for (let i = 1; i < lines.length; i++) {
        const line = lines[i].trim();
        if (!line) continue;
        const cols = line.split(',');
        
        importedOrders.push({
          id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
          orderDate: cols[0] || new Date().toISOString(),
          orderNumber: cols[1] || 'Imported',
          customerName: cols[2] || 'Guest',
          email: cols[3] || '',
          mobileNumber: cols[4] || '',
          orderAmount: parseFloat(cols[5]) || 0,
          discountGiven: parseFloat(cols[6]) || 0,
          gstAmount: parseFloat(cols[7]) || 0,
          walletAmount: parseFloat(cols[8]) || 0,
          referralAmount: parseFloat(cols[9]) || 0,
          totalAmountPaid: parseFloat(cols[10]) || 0,
          category: cols[11] || 'Uncategorized',
          orderSource: (cols[12] as any) || 'Website',
          isPotential: cols[13] === 'Yes',
          isGstApplied: parseFloat(cols[7]) > 0,
          applySellerShare: false,
          platformFeePercent: 10,
          commissionAmount: parseFloat(cols[5]) || 0,
          sellerIncome: 0,
          sellerName: 'Direct',
          pgName: 'None',
          pgRate: 0
        });
      }

      if (importedOrders.length > 0) {
        onImport(importedOrders);
        alert(`Successfully imported ${importedOrders.length} orders.`);
      }
    };
    reader.readAsText(file);
    e.target.value = '';
  };

  return (
    <div className="animate-in fade-in duration-500 max-w-4xl mx-auto px-1">
      <div className="flex flex-col md:flex-row gap-3 mb-6">
        <div className="relative flex-1">
          <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
          <input 
            type="text" 
            placeholder="Search customer, seller, or order ID..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-11 pr-4 py-3.5 bg-white border-2 border-slate-100 rounded-2xl focus:border-[#27335c] outline-none text-sm font-black text-[#27335c] uppercase tracking-tight shadow-sm"
          />
        </div>
        <div className="flex gap-2">
          <button 
            onClick={() => fileInputRef.current?.click()}
            className="flex items-center gap-2 px-4 py-3.5 bg-slate-100 text-[#27335c] rounded-2xl font-black text-[10px] uppercase tracking-widest hover:bg-slate-200 transition-all shadow-sm"
            title="Import CSV"
          >
            <Upload size={16} /> <span className="hidden md:inline">Import</span>
          </button>
          <input type="file" ref={fileInputRef} onChange={handleImportCSV} accept=".csv" className="hidden" />
          <button 
            onClick={exportToCSV}
            className="flex items-center gap-2 px-4 py-3.5 bg-[#27335c] text-white rounded-2xl font-black text-[10px] uppercase tracking-widest hover:brightness-110 transition-all shadow-sm"
            title="Export CSV"
          >
            <Download size={16} /> <span className="hidden md:inline">Export</span>
          </button>
        </div>
      </div>

      {searchStats && (
        <div className="bg-[#27335c] text-white rounded-[1.5rem] p-6 mb-6 shadow-xl flex flex-col md:flex-row items-center justify-between animate-in slide-in-from-top-2 gap-4">
          <div className="flex-1 md:border-r border-white/10 md:pr-6 w-full text-center md:text-left">
             <span className="text-[10px] font-black text-slate-300 uppercase tracking-widest block mb-1">Search Analytics</span>
             <h4 className="text-base font-black uppercase truncate">Results for: "{searchTerm}"</h4>
          </div>
          <div className="px-8 md:border-r border-white/10 text-center shrink-0">
             <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest block">Total Orders</span>
             <h4 className="text-2xl font-black">{searchStats.count}</h4>
          </div>
          <div className="pl-8 text-center md:text-right shrink-0">
             <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest block">Total Revenue</span>
             <h4 className="text-2xl font-black text-emerald-400">₹{searchStats.revenue.toLocaleString()}</h4>
          </div>
        </div>
      )}

      <div className="space-y-3">
        {filteredOrders.length === 0 ? (
          <div className="text-center py-16 bg-white rounded-3xl border-2 border-dashed border-slate-100">
            <h3 className="text-slate-400 font-black text-[10px] uppercase tracking-widest">No order entries found</h3>
          </div>
        ) : (
          filteredOrders.map((order) => (
            <div key={order.id} className={`bg-white border rounded-[1.5rem] overflow-hidden transition-all ${expandedId === order.id ? 'border-[#27335c] shadow-lg' : 'border-slate-100 hover:border-slate-300'}`}>
              <div className="flex items-center justify-between p-4 md:p-5 gap-4">
                <div className="flex items-center gap-4 flex-1 min-w-0 cursor-pointer" onClick={() => setExpandedId(expandedId === order.id ? null : order.id)}>
                  <div className="w-10 h-10 rounded-xl bg-slate-50 flex items-center justify-center text-[#27335c] shrink-0 relative">
                    {order.orderSource === 'Whatsapp' ? <MessageCircle size={18} /> : <Globe size={18} />}
                    {order.isPotential && (
                      <div className="absolute -top-1 -right-1 bg-amber-500 w-3 h-3 rounded-full border-2 border-white animate-pulse"></div>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                       <span className="text-[8px] font-black text-slate-400 uppercase">{order.orderNumber}</span>
                       {order.isPotential && (
                         <span className="text-[7px] font-black text-amber-600 bg-amber-50 px-1.5 py-0.5 rounded-full uppercase tracking-tighter border border-amber-200">Potential Entry</span>
                       )}
                    </div>
                    <h3 className="text-sm font-black text-slate-800 truncate uppercase">{order.customerName}</h3>
                    <div className="text-[8px] font-bold text-slate-400 uppercase flex items-center gap-1 mt-0.5">
                       {new Date(order.orderDate).toLocaleDateString()} • {order.category}
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <div className="text-right">
                    <div className="text-sm font-black text-[#27335c] leading-none">₹{order.totalAmountPaid.toFixed(0)}</div>
                    <div className="text-[7px] font-black text-slate-400 uppercase mt-1">Total Paid</div>
                  </div>
                  <button onClick={() => setExpandedId(expandedId === order.id ? null : order.id)} className={`p-2 rounded-xl transition-all ${expandedId === order.id ? 'bg-[#27335c] text-white' : 'bg-slate-50 text-[#27335c]'}`}>
                    <Eye size={16}/>
                  </button>
                </div>
              </div>
              
              {expandedId === order.id && (
                <div className="px-5 pb-5 pt-2 border-t border-slate-50 animate-in slide-in-from-top-2">
                  <div className="bg-slate-50 rounded-2xl p-5 mb-4 mt-2 space-y-4 border border-slate-100 shadow-inner">
                    <div className="flex items-center justify-between border-b border-slate-200 pb-2">
                      <h4 className="text-[10px] font-black text-[#27335c] uppercase tracking-widest flex items-center gap-1.5">
                        <Calculator size={12}/> Financial Logic Breakdown
                      </h4>
                      <div className="text-[8px] font-bold text-slate-400 uppercase">Entry Key: {order.id}</div>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-y-3 gap-x-12">
                      <div className="space-y-2">
                        <div className="flex justify-between items-center">
                          <span className="text-[10px] font-bold text-slate-500 uppercase">Order Amount:</span>
                          <span className="text-[10px] font-black text-slate-800">₹{order.orderAmount.toFixed(2)}</span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-[10px] font-bold text-red-500 uppercase">(-) Discount Given:</span>
                          <span className="text-[10px] font-black text-red-600">₹{order.discountGiven.toFixed(2)}</span>
                        </div>
                        
                        {/* THE REQUESTED AOV LOGIC DISPLAY */}
                        <div className="flex justify-between items-center p-2 bg-indigo-100 rounded-xl border border-indigo-200">
                          <span className="text-[10px] font-black text-indigo-700 uppercase">AOV Basis (Amt - Disc):</span>
                          <span className="text-[11px] font-black text-indigo-900">₹{(order.orderAmount - order.discountGiven).toFixed(2)}</span>
                        </div>

                        <div className="flex justify-between items-center">
                          <span className="text-[10px] font-bold text-indigo-400 uppercase">(-) Wallet Deduction:</span>
                          <span className="text-[10px] font-black text-indigo-500">₹{order.walletAmount.toFixed(2)}</span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-[10px] font-bold text-slate-500 uppercase">(+) 18% GST Amount:</span>
                          <span className="text-[10px] font-black text-slate-800">₹{order.gstAmount.toFixed(2)}</span>
                        </div>
                      </div>

                      <div className="space-y-2">
                        <div className="flex justify-between items-center bg-[#27335c] p-2.5 rounded-xl text-white shadow-md">
                          <span className="text-[10px] font-black uppercase">Customer Net Paid:</span>
                          <span className="text-sm font-black">₹{order.totalAmountPaid.toFixed(2)}</span>
                        </div>
                        <div className="flex justify-between items-center pt-2 border-t border-slate-200">
                          <span className="text-[10px] font-bold text-emerald-600 uppercase">CE Profit (Platform):</span>
                          <span className="text-[10px] font-black text-emerald-700">₹{order.commissionAmount.toFixed(2)}</span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-[10px] font-bold text-slate-500 uppercase">Seller Share Paid:</span>
                          <span className="text-[10px] font-black text-slate-800">₹{order.sellerIncome.toFixed(2)}</span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-[10px] font-bold text-amber-600 uppercase">(-) Affiliate Referral:</span>
                          <span className="text-[10px] font-black text-amber-700">₹{order.referralAmount.toFixed(2)}</span>
                        </div>
                        {order.pgName !== 'None' && (
                          <div className="flex justify-between items-center">
                            <span className="text-[10px] font-bold text-red-400 uppercase">(-) {order.pgName} Gateway:</span>
                            <span className="text-[10px] font-black text-red-500">₹{(order.totalAmountPaid * order.pgRate).toFixed(2)}</span>
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="flex flex-wrap gap-2 mt-4 pt-3 border-t border-slate-200">
                       <div className="px-3 py-1.5 bg-white border border-slate-200 rounded-xl text-[9px] font-black uppercase tracking-tight text-slate-500">
                          Fee Split: {order.applySellerShare ? order.platformFeePercent : 0}%
                       </div>
                       <div className="px-3 py-1.5 bg-white border border-slate-200 rounded-xl text-[9px] font-black uppercase tracking-tight text-slate-500">
                          Agent: {order.sellerName || 'Direct'}
                       </div>
                       <div className="px-3 py-1.5 bg-white border border-slate-200 rounded-xl text-[9px] font-black uppercase tracking-tight text-slate-500">
                          Category: {order.category}
                       </div>
                    </div>
                  </div>

                  <div className="flex justify-end gap-3 mt-4">
                    <button onClick={() => onEdit(order)} className="flex items-center gap-1.5 px-6 py-2.5 bg-indigo-50 text-indigo-600 rounded-xl font-black text-[10px] uppercase tracking-widest hover:bg-indigo-600 hover:text-white transition-all">
                      <Edit2 size={14}/> Edit Order
                    </button>
                    <button onClick={() => { if(confirm('Permanently delete this entry?')) onDelete(order.id); }} className="flex items-center gap-1.5 px-6 py-2.5 bg-red-50 text-red-500 rounded-xl font-black text-[10px] uppercase tracking-widest hover:bg-red-500 hover:text-white transition-all">
                      <Trash2 size={14}/> Delete
                    </button>
                  </div>
                </div>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default OrdersList;
