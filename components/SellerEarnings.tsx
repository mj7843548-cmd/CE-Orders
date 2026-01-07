
import React, { useState, useMemo } from 'react';
import { SellerEarning } from '../types';
import { 
  Users, 
  Wallet, 
  CheckCircle2, 
  Clock, 
  Plus, 
  Search, 
  Edit2, 
  Trash2, 
  Save, 
  X,
  StickyNote,
  CreditCard,
  Filter,
  ChevronDown,
  TrendingUp,
  Landmark
} from 'lucide-react';

interface SellerEarningsProps {
  earnings: SellerEarning[];
  onAdd: (earning: SellerEarning) => void;
  onUpdate: (earning: SellerEarning) => void;
  onDelete: (id: string) => void;
}

type ListFilter = 'all' | 'paid' | 'unpaid';

const SellerEarnings: React.FC<SellerEarningsProps> = ({ earnings, onAdd, onUpdate, onDelete }) => {
  const getKolkataTimeString = () => {
    const now = new Date();
    const formatter = new Intl.DateTimeFormat('en-GB', {
      timeZone: 'Asia/Kolkata',
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      hour12: false,
    });
    
    const parts = formatter.formatToParts(now);
    const p = (type: string) => parts.find(part => part.type === type)?.value;
    return `${p('year')}-${p('month')}-${p('day')}T${p('hour')}:${p('minute')}`;
  };

  const [sellerName, setSellerName] = useState('');
  const [payoutAmount, setPayoutAmount] = useState<number>(0);
  const [status, setStatus] = useState<'Paid' | 'Unpaid'>('Unpaid');
  const [date, setDate] = useState(getKolkataTimeString());
  const [notes, setNotes] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [listFilter, setListFilter] = useState<ListFilter>('unpaid');
  const [editingId, setEditingId] = useState<string | null>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!sellerName.trim()) return;

    const payload: SellerEarning = {
      id: editingId || Date.now().toString(),
      sellerName,
      payoutAmount,
      status,
      date: date || getKolkataTimeString(),
      notes
    };

    if (editingId) {
      onUpdate(payload);
      setEditingId(null);
    } else {
      onAdd(payload);
    }
    resetForm();
  };

  const resetForm = () => {
    setSellerName('');
    setPayoutAmount(0);
    setStatus('Unpaid');
    setDate(getKolkataTimeString());
    setNotes('');
  };

  const handleEdit = (item: SellerEarning) => {
    setEditingId(item.id);
    setSellerName(item.sellerName);
    setPayoutAmount(item.payoutAmount);
    setStatus(item.status);
    setDate(item.date);
    setNotes(item.notes);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleMarkAsPaid = (item: SellerEarning) => {
    onUpdate({ ...item, status: 'Paid' });
  };

  const filteredEarnings = useMemo(() => {
    return earnings.filter(e => {
      const matchesSearch = e.sellerName.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesFilter = 
        listFilter === 'all' ? true :
        listFilter === 'paid' ? e.status === 'Paid' :
        e.status === 'Unpaid';
      return matchesSearch && matchesFilter;
    });
  }, [earnings, searchTerm, listFilter]);

  const stats = useMemo(() => {
    const uniqueSellers = new Set(earnings.map(e => e.sellerName.toLowerCase()));
    const unpaidEntries = earnings.filter(e => e.status === 'Unpaid');
    const paidEntries = earnings.filter(e => e.status === 'Paid');
    
    const unpaidBalance = unpaidEntries.reduce((sum, e) => sum + e.payoutAmount, 0);
    const paidBalance = paidEntries.reduce((sum, e) => sum + e.payoutAmount, 0);
    
    return {
      totalSellers: uniqueSellers.size,
      paidCount: paidEntries.length,
      unpaidCount: unpaidEntries.length,
      unpaidBalance,
      paidBalance,
      totalPayout: unpaidBalance + paidBalance
    };
  }, [earnings]);

  return (
    <div className="space-y-8 animate-in fade-in duration-500 max-w-4xl mx-auto flex flex-col min-h-full">
      {/* Entry Form */}
      <div className="bg-white p-6 md:p-8 rounded-[2rem] border border-slate-100 shadow-sm overflow-hidden flex flex-col">
        <div className="flex items-center gap-3 mb-8">
          <div className="p-3 bg-slate-100 text-[#27335c] rounded-2xl shadow-inner">
            <Users size={24} strokeWidth={3} />
          </div>
          <div>
            <h2 className="text-xl font-black uppercase tracking-tight text-[#27335c]">
              {editingId ? 'Edit Payout' : 'Seller Payout Entry'}
            </h2>
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Manage seller commissions</p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6 flex flex-col flex-1">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-1.5">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Seller Name</label>
              <div className="relative">
                <Users size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
                <input 
                  type="text" 
                  placeholder="Ex: Marketing Hub"
                  value={sellerName}
                  onChange={(e) => setSellerName(e.target.value)}
                  className="w-full pl-11 pr-4 py-3.5 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-2 focus:ring-[#27335c] outline-none text-sm font-bold text-slate-700"
                  required
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Payout Amount</label>
              <div className="relative">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 font-bold">₹</span>
                <input 
                  type="number" 
                  value={payoutAmount || ''}
                  onChange={(e) => setPayoutAmount(parseFloat(e.target.value) || 0)}
                  className="w-full pl-8 pr-4 py-3.5 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-2 focus:ring-[#27335c] outline-none text-sm font-black text-[#27335c]"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Payment Status</label>
              <div className="relative">
                <CreditCard size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
                <select 
                  value={status}
                  onChange={(e) => setStatus(e.target.value as 'Paid' | 'Unpaid')}
                  className="w-full pl-11 pr-4 py-3.5 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-2 focus:ring-[#27335c] outline-none text-sm font-black text-slate-700 uppercase"
                >
                  <option value="Unpaid">Unpaid</option>
                  <option value="Paid">Paid</option>
                </select>
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Date & Time</label>
              <input 
                type="datetime-local" 
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="w-full p-3.5 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-2 focus:ring-[#27335c] outline-none text-sm font-bold text-slate-700"
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Notes (Optional)</label>
            <div className="relative">
              <StickyNote size={16} className="absolute left-4 top-4 text-slate-400" />
              <textarea 
                placeholder="Payment details, reference numbers etc..."
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                className="w-full pl-11 pr-4 py-3.5 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-2 focus:ring-[#27335c] outline-none text-sm font-medium text-slate-600 min-h-[100px]"
              />
            </div>
          </div>

          {/* Sticky Action Button Container */}
          <div className="sticky bottom-0 z-50 -mx-6 -mb-6 md:-mx-8 md:-mb-8 p-4 bg-white/95 backdrop-blur-md border-t border-slate-100 mt-auto">
            <div className="flex gap-3 max-w-4xl mx-auto">
              <button
                type="submit"
                className="flex-1 py-4 bg-[#27335c] text-white rounded-2xl font-black text-sm uppercase tracking-[0.2em] shadow-xl hover:brightness-110 active:scale-95 transition-all flex items-center justify-center gap-2"
              >
                {editingId ? <Save size={18} /> : <Plus size={18} />}
                {editingId ? 'Update Payout' : 'Add Seller Payout'}
              </button>
              {editingId && (
                <button
                  type="button"
                  onClick={() => { setEditingId(null); resetForm(); }}
                  className="px-6 bg-slate-100 text-slate-500 rounded-2xl font-black text-xs uppercase hover:bg-slate-200 transition-all"
                >
                  <X size={18} />
                </button>
              )}
            </div>
          </div>
        </form>
      </div>

      {/* Stats Summary Grid */}
      <div className="space-y-4">
        {/* Row 1: Counts */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-white p-5 rounded-[1.5rem] border border-slate-100 shadow-sm flex items-center gap-4">
            <div className="p-3 bg-slate-100 text-[#27335c] rounded-xl">
              <Users size={20} />
            </div>
            <div>
              <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest">Total Sellers</p>
              <h4 className="text-lg font-black text-[#27335c]">{stats.totalSellers}</h4>
            </div>
          </div>
          <div className="bg-emerald-50 p-5 rounded-[1.5rem] border border-emerald-100 shadow-sm flex items-center gap-4">
            <div className="p-3 bg-white rounded-xl text-emerald-600 shadow-sm">
              <CheckCircle2 size={20} />
            </div>
            <div>
              <p className="text-[8px] font-black text-emerald-600 uppercase tracking-widest">Paid Sellers</p>
              <h4 className="text-lg font-black text-emerald-800">{stats.paidCount}</h4>
            </div>
          </div>
          <div className="bg-amber-50 p-5 rounded-[1.5rem] border border-amber-100 shadow-sm flex items-center gap-4">
            <div className="p-3 bg-white rounded-xl text-amber-600 shadow-sm">
              <Clock size={20} />
            </div>
            <div>
              <p className="text-[8px] font-black text-amber-600 uppercase tracking-widest">Unpaid Sellers</p>
              <h4 className="text-lg font-black text-amber-800">{stats.unpaidCount}</h4>
            </div>
          </div>
        </div>

        {/* Row 2: Financials */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-[#27335c] p-5 rounded-[1.5rem] border border-white/10 shadow-lg flex items-center gap-4 group">
            <div className="p-3 bg-white/10 text-white rounded-xl group-hover:scale-110 transition-transform">
              <TrendingUp size={20} />
            </div>
            <div>
              <p className="text-[8px] font-black text-slate-300 uppercase tracking-widest">Total Payout</p>
              <h4 className="text-lg font-black text-white">₹{stats.totalPayout.toLocaleString()}</h4>
            </div>
          </div>
          <div className="bg-emerald-600 p-5 rounded-[1.5rem] border border-emerald-500 shadow-lg flex items-center gap-4 group">
            <div className="p-3 bg-white/10 text-white rounded-xl group-hover:scale-110 transition-transform">
              <CheckCircle2 size={20} />
            </div>
            <div>
              <p className="text-[8px] font-black text-emerald-100 uppercase tracking-widest">Paid Balance</p>
              <h4 className="text-lg font-black text-white">₹{stats.paidBalance.toLocaleString()}</h4>
            </div>
          </div>
          <div className="bg-amber-600 p-5 rounded-[1.5rem] border border-amber-500 shadow-lg flex items-center gap-4 group">
            <div className="p-3 bg-white/10 text-white rounded-xl group-hover:scale-110 transition-transform">
              <Clock size={20} />
            </div>
            <div>
              <p className="text-[8px] font-black text-amber-100 uppercase tracking-widest">Unpaid Balance</p>
              <h4 className="text-lg font-black text-white">₹{stats.unpaidBalance.toLocaleString()}</h4>
            </div>
          </div>
        </div>
      </div>

      {/* Search and Filter */}
      <div className="space-y-4">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="relative flex-1">
            <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
            <input 
              type="text" 
              placeholder="Search seller by name..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-11 pr-4 py-4 bg-white border-2 border-slate-50 rounded-2xl focus:border-[#27335c] outline-none text-sm font-black text-[#27335c] uppercase tracking-tight shadow-sm transition-all"
            />
          </div>

          <div className="relative group w-full md:w-48">
             <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none">
              <Filter size={14} strokeWidth={3} />
            </div>
            <select
              value={listFilter}
              onChange={(e) => setListFilter(e.target.value as ListFilter)}
              className="w-full appearance-none bg-white border-2 border-slate-50 hover:border-[#27335c] p-4 pl-10 pr-10 rounded-2xl text-[10px] font-black uppercase tracking-widest text-[#27335c] focus:ring-0 outline-none transition-all cursor-pointer shadow-sm"
            >
              <option value="all">All Sellers</option>
              <option value="unpaid">Unpaid Only</option>
              <option value="paid">Paid Only</option>
            </select>
            <div className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none group-hover:text-[#27335c] transition-colors">
              <ChevronDown size={14} strokeWidth={3} />
            </div>
          </div>
        </div>

        {filteredEarnings.length === 0 ? (
          <div className="text-center py-12 bg-white rounded-3xl border-2 border-dashed border-slate-100">
            <p className="text-slate-400 font-bold text-xs uppercase tracking-widest">No payout records found</p>
          </div>
        ) : (
          <div className="space-y-3">
            {filteredEarnings.map((item) => (
              <div key={item.id} className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm hover:border-[#27335c]/30 transition-all flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="flex items-center gap-4">
                  <div className={`w-12 h-12 rounded-xl flex items-center justify-center font-black text-lg ${item.status === 'Paid' ? 'bg-emerald-100 text-emerald-600' : 'bg-amber-100 text-amber-600'}`}>
                    {item.sellerName.charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <div className="flex items-center gap-2 mb-0.5">
                      <h3 className="font-black text-slate-800 uppercase tracking-tight">{item.sellerName}</h3>
                      <span className={`text-[8px] font-black px-2 py-0.5 rounded-full uppercase tracking-widest ${item.status === 'Paid' ? 'bg-emerald-500 text-white' : 'bg-amber-500 text-white'}`}>
                        {item.status}
                      </span>
                    </div>
                    <div className="flex items-center gap-3 text-[10px] text-slate-400 font-bold uppercase tracking-widest">
                      <span>{new Date(item.date).toLocaleDateString()}</span>
                      <span className="w-1 h-1 bg-slate-200 rounded-full"></span>
                      <span>₹{item.payoutAmount.toLocaleString()}</span>
                    </div>
                    {item.notes && <p className="text-[10px] text-slate-500 mt-1 italic line-clamp-1">"{item.notes}"</p>}
                  </div>
                </div>

                <div className="flex items-center gap-2 md:gap-3">
                  {item.status === 'Unpaid' && (
                    <button 
                      onClick={() => handleMarkAsPaid(item)}
                      className="flex-1 md:flex-none flex items-center justify-center gap-2 px-4 py-2 bg-emerald-50 text-emerald-600 rounded-xl font-black text-[9px] uppercase tracking-widest hover:bg-emerald-600 hover:text-white transition-all shadow-sm"
                    >
                      <CheckCircle2 size={14} /> Mark Paid
                    </button>
                  )}
                  <button 
                    onClick={() => handleEdit(item)}
                    className="p-2.5 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-xl transition-all"
                  >
                    <Edit2 size={16} />
                  </button>
                  <button 
                    onClick={() => { if(confirm('Delete record?')) onDelete(item.id); }}
                    className="p-2.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-xl transition-all"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default SellerEarnings;
