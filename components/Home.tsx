
import React, { useState, useEffect } from 'react';
import { Order } from '../types';
import { Plus, Check, Tag, Globe, MessageCircle, X, Calculator, Wallet, UserPlus, Mail, Phone, Hash, Star } from 'lucide-react';

interface HomeProps {
  onAddOrder: (order: Order) => void;
  onUpdateOrder: (order: Order) => void;
  editingOrder: Order | null;
  onCancelEdit: () => void;
  categories: string[];
  onAddCategory: (name: string) => void;
}

const Home: React.FC<HomeProps> = ({ 
  onAddOrder, 
  onUpdateOrder, 
  editingOrder, 
  onCancelEdit, 
  categories, 
  onAddCategory 
}) => {
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

  const [orderDate, setOrderDate] = useState(getKolkataTimeString());
  const [orderNumber, setOrderNumber] = useState('');
  const [customerName, setCustomerName] = useState('');
  const [email, setEmail] = useState('');
  const [mobileNumber, setMobileNumber] = useState('');
  const [orderAmount, setOrderAmount] = useState<number>(0);
  const [orderSource, setOrderSource] = useState<'Whatsapp' | 'Website'>('Website');
  const [isGstApplied, setIsGstApplied] = useState(false);
  const [walletAmount, setWalletAmount] = useState<number>(0);
  const [discountGiven, setDiscountGiven] = useState<number>(0);
  const [referralAmount, setReferralAmount] = useState<number>(0);
  const [applySellerShare, setApplySellerShare] = useState(false);
  const [platformFeePercent, setPlatformFeePercent] = useState<number>(10);
  const [selectedCategory, setSelectedCategory] = useState(categories[0] || '');
  const [newCategory, setNewCategory] = useState('');
  const [showAddCategory, setShowAddCategory] = useState(false);
  const [pgName, setPgName] = useState('None');
  const [pgRate, setPgRate] = useState(0);
  const [isPotential, setIsPotential] = useState(false);

  const [gstAmount, setGstAmount] = useState(0);
  const [totalAmountPaid, setTotalAmountPaid] = useState(0);
  const [sellerIncome, setSellerIncome] = useState(0);
  const [commissionAmount, setCommissionAmount] = useState(0);

  useEffect(() => {
    if (editingOrder) {
      setOrderDate(editingOrder.orderDate);
      setOrderNumber(editingOrder.orderNumber === 'UNTITLED' ? '' : editingOrder.orderNumber);
      setCustomerName(editingOrder.customerName === 'GUEST' ? '' : editingOrder.customerName);
      setEmail(editingOrder.email || '');
      setMobileNumber(editingOrder.mobileNumber || '');
      setOrderAmount(editingOrder.orderAmount);
      setOrderSource(editingOrder.orderSource);
      setIsGstApplied(editingOrder.isGstApplied);
      setWalletAmount(editingOrder.walletAmount || 0);
      setDiscountGiven(editingOrder.discountGiven || 0);
      setReferralAmount(editingOrder.referralAmount || 0);
      setApplySellerShare(editingOrder.applySellerShare);
      setPlatformFeePercent(editingOrder.platformFeePercent);
      setSelectedCategory(editingOrder.category);
      setPgName(editingOrder.pgName || 'None');
      setPgRate(editingOrder.pgRate || 0);
      setIsPotential(editingOrder.isPotential || false);
    } else {
      resetForm();
    }
  }, [editingOrder]);

  useEffect(() => {
    const netBase = Math.max(0, orderAmount - discountGiven);
    const gst = isGstApplied ? netBase * 0.18 : 0;
    setGstAmount(gst);
    
    const total = Math.max(0, (netBase - walletAmount) + gst);
    setTotalAmountPaid(total);

    if (applySellerShare) {
      const ceShareBeforeCosts = netBase * (platformFeePercent / 100);
      setCommissionAmount(ceShareBeforeCosts);
      setSellerIncome(Math.max(0, netBase - ceShareBeforeCosts));
    } else {
      setCommissionAmount(netBase);
      setSellerIncome(0);
    }
  }, [orderAmount, isGstApplied, walletAmount, discountGiven, referralAmount, applySellerShare, platformFeePercent]);

  const resetForm = () => {
    setOrderDate(getKolkataTimeString());
    setOrderNumber('');
    setCustomerName('');
    setEmail('');
    setMobileNumber('');
    setOrderAmount(0);
    setOrderSource('Website');
    setIsGstApplied(false);
    setWalletAmount(0);
    setDiscountGiven(0);
    setReferralAmount(0);
    setApplySellerShare(false);
    setPlatformFeePercent(10);
    setPgName('None');
    setPgRate(0);
    setIsPotential(false);
  };

  const handlePgChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const val = e.target.value;
    setPgName(val);
    if (val === 'PhonePe') setPgRate(0.0218);
    else if (val === 'Cashfree') setPgRate(0.018);
    else setPgRate(0);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const payload: Order = {
      id: editingOrder ? editingOrder.id : Date.now().toString(),
      orderDate: orderDate || getKolkataTimeString(),
      orderNumber: orderNumber || 'UNTITLED',
      customerName: customerName || 'GUEST',
      email,
      sellerName: 'Direct',
      mobileNumber: mobileNumber || '',
      orderAmount,
      orderSource,
      isGstApplied,
      gstAmount,
      walletAmount,
      discountGiven,
      referralAmount,
      totalAmountPaid,
      applySellerShare,
      platformFeePercent,
      commissionAmount,
      sellerIncome,
      category: selectedCategory || 'Uncategorized',
      pgName,
      pgRate,
      isPotential
    };
    if (editingOrder) onUpdateOrder(payload);
    else onAddOrder(payload);
    resetForm();
  };

  const handleAddCategory = () => {
    if (newCategory.trim()) {
      onAddCategory(newCategory.trim());
      setSelectedCategory(newCategory.trim());
      setNewCategory('');
      setShowAddCategory(false);
    }
  };

  return (
    <div className="animate-in fade-in duration-500 max-w-3xl mx-auto flex flex-col min-h-full pb-0">
      {editingOrder && (
        <div className="flex justify-end mb-4">
          <button onClick={onCancelEdit} className="flex items-center gap-1.5 px-4 py-2 bg-slate-100 text-slate-500 rounded-xl font-black text-[10px] uppercase tracking-widest hover:bg-slate-200 transition-all">
            <X size={14} /> Cancel Edit
          </button>
        </div>
      )}

      <form onSubmit={handleSubmit} className="flex-1 space-y-6 flex flex-col">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Order Date (IST)</label>
            <input type="datetime-local" value={orderDate} onChange={(e) => setOrderDate(e.target.value)} className="w-full p-3.5 bg-slate-50 border border-slate-200 rounded-2xl outline-none text-sm font-bold text-slate-700 focus:border-[#27335c] transition-colors" />
          </div>
          <div className="space-y-1.5">
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Customer Name</label>
            <input type="text" placeholder="Ex: John Doe" value={customerName} onChange={(e) => setCustomerName(e.target.value)} className="w-full p-3.5 bg-slate-50 border border-slate-200 rounded-2xl outline-none text-sm font-bold text-slate-700 focus:border-[#27335c] transition-colors" />
            <button 
              type="button"
              onClick={() => setIsPotential(!isPotential)}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-[9px] font-black uppercase tracking-widest border transition-all self-start mt-1 ${
                isPotential 
                ? 'bg-amber-100 border-amber-300 text-amber-700 shadow-sm' 
                : 'bg-white border-slate-200 text-slate-400'
              }`}
            >
              <Star size={10} fill={isPotential ? "currentColor" : "none"} />
              {isPotential ? 'Potential Tag' : 'Potential'}
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="space-y-1.5">
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1 flex items-center gap-1"><Hash size={10}/> Order Number</label>
            <input type="text" placeholder="#CE-0001" value={orderNumber} onChange={(e) => setOrderNumber(e.target.value)} className="w-full p-3.5 bg-slate-50 border border-slate-200 rounded-2xl outline-none text-sm font-bold text-slate-700 focus:border-[#27335c] transition-colors" />
          </div>
          <div className="space-y-1.5">
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1 flex items-center gap-1"><Phone size={10}/> Mobile Number</label>
            <input type="tel" placeholder="+91 00000 00000" value={mobileNumber} onChange={(e) => setMobileNumber(e.target.value)} className="w-full p-3.5 bg-slate-50 border border-slate-200 rounded-2xl outline-none text-sm font-bold text-slate-700 focus:border-[#27335c] transition-colors" />
          </div>
          <div className="space-y-1.5">
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1 flex items-center gap-1"><Mail size={10}/> Customer Email</label>
            <input type="email" placeholder="customer@example.com" value={email} onChange={(e) => setEmail(e.target.value)} className="w-full p-3.5 bg-slate-50 border border-slate-200 rounded-2xl outline-none text-sm font-bold text-slate-700 focus:border-[#27335c] transition-colors" />
          </div>
        </div>

        <div className="bg-slate-50 p-6 rounded-3xl border border-slate-200 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="text-[10px] font-black text-[#27335c] uppercase tracking-widest ml-1 flex items-center gap-1"><Calculator size={10} /> Order Amount</label>
              <div className="relative">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 font-bold">₹</span>
                <input type="number" step="any" value={orderAmount || ''} onChange={(e) => setOrderAmount(parseFloat(e.target.value) || 0)} className="w-full pl-8 p-4 bg-white border border-slate-200 rounded-2xl outline-none text-base font-black text-[#27335c] focus:border-[#27335c] transition-all shadow-sm" />
              </div>
            </div>
            <div className="space-y-2">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Discount Given</label>
              <div className="relative">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 font-bold">₹</span>
                <input type="number" step="any" value={discountGiven || ''} onChange={(e) => setDiscountGiven(parseFloat(e.target.value) || 0)} className="w-full pl-8 p-4 bg-white border border-slate-200 rounded-2xl outline-none text-base font-bold text-red-500 shadow-sm" />
              </div>
            </div>
            <div className="space-y-2">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1 flex items-center gap-1"><Wallet size={10} /> Wallet Amount Used</label>
              <div className="relative">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 font-bold">₹</span>
                <input type="number" step="any" value={walletAmount || ''} onChange={(e) => setWalletAmount(parseFloat(e.target.value) || 0)} className="w-full pl-8 p-4 bg-white border border-slate-200 rounded-2xl outline-none text-base font-bold text-indigo-500 shadow-sm" />
              </div>
            </div>
            <div className="space-y-2">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1 flex items-center gap-1"><UserPlus size={10} /> Referral (Affiliate Pay)</label>
              <div className="relative">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 font-bold">₹</span>
                <input type="number" step="any" value={referralAmount || ''} onChange={(e) => setReferralAmount(parseFloat(e.target.value) || 0)} className="w-full pl-8 p-4 bg-white border border-slate-200 rounded-2xl outline-none text-base font-bold text-amber-500 shadow-sm" />
              </div>
            </div>
          </div>
          
          <div className="flex flex-wrap gap-4 pt-2">
            <label className="flex items-center gap-3 cursor-pointer bg-white p-3 rounded-xl border border-slate-100 shadow-sm hover:border-[#27335c] transition-colors">
              <input type="checkbox" checked={isGstApplied} onChange={(e) => setIsGstApplied(e.target.checked)} className="w-5 h-5 rounded text-[#27335c]" />
              <div>
                <span className="text-xs font-black text-slate-700 uppercase block leading-none">18% GST</span>
                <span className="text-[8px] font-bold text-slate-400 uppercase mt-0.5">+ ₹{gstAmount.toFixed(2)}</span>
              </div>
            </label>
            <div className="flex-1">
              <select value={pgName} onChange={handlePgChange} className="w-full bg-white px-3 py-3 text-[10px] font-black text-indigo-700 uppercase border border-slate-100 rounded-xl outline-none shadow-sm cursor-pointer hover:border-indigo-200">
                <option value="None">Direct / No PG</option>
                <option value="PhonePe">PhonePe (2.18%)</option>
                <option value="Cashfree">Cashfree (1.8%)</option>
              </select>
            </div>
            <div className="flex gap-2">
                <button type="button" title="WhatsApp Source" onClick={() => setOrderSource('Whatsapp')} className={`p-3 rounded-xl border-2 transition-all ${orderSource === 'Whatsapp' ? 'bg-emerald-50 border-emerald-500 text-emerald-600 shadow-sm' : 'bg-white border-slate-100 text-slate-400'}`}><MessageCircle size={20}/></button>
                <button type="button" title="Website Source" onClick={() => setOrderSource('Website')} className={`p-3 rounded-xl border-2 transition-all ${orderSource === 'Website' ? 'bg-indigo-50 border-indigo-500 text-indigo-600 shadow-sm' : 'bg-white border-slate-100 text-slate-400'}`}><Globe size={20}/></button>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="p-5 bg-[#27335c] rounded-3xl text-white shadow-xl">
            <label className="text-[8px] font-black text-slate-300 uppercase tracking-widest mb-1 block">Customer Total Paid</label>
            <div className="text-2xl font-black">₹{totalAmountPaid.toFixed(2)}</div>
            <div className="text-[7px] text-white/50 uppercase mt-1">Final Payable Amount</div>
          </div>
          
          <div className={`p-5 rounded-3xl border transition-all relative ${applySellerShare ? 'bg-emerald-50 border-emerald-100 shadow-md' : 'bg-slate-50 border-slate-100 opacity-80'}`}>
            <div className="flex items-center justify-between mb-2">
              <label className="text-[8px] font-black text-emerald-600 uppercase tracking-widest block">Seller Share Split</label>
              <label className="flex items-center gap-1.5 cursor-pointer">
                <input 
                  type="checkbox" 
                  checked={applySellerShare} 
                  onChange={(e) => setApplySellerShare(e.target.checked)} 
                  className="w-4 h-4 rounded text-[#27335c]"
                />
                <span className="text-[7px] font-black text-[#27335c] uppercase">{applySellerShare ? 'Split On' : 'Split Off'}</span>
              </label>
            </div>
            <div className="text-2xl font-black text-emerald-800">
              ₹{applySellerShare ? sellerIncome.toFixed(2) : "0.00"}
            </div>
            {applySellerShare ? (
              <div className="mt-2 space-y-1">
                <label className="text-[8px] font-black text-emerald-600 uppercase">Platform Fee</label>
                <select 
                  value={platformFeePercent} 
                  onChange={(e) => setPlatformFeePercent(parseInt(e.target.value))} 
                  className="w-full bg-white px-2 py-2 text-[10px] font-black text-emerald-700 uppercase border border-emerald-100 rounded-xl outline-none"
                >
                  {Array.from({length: 21}, (_, i) => i).map(v => (
                    <option key={v} value={v}>{v}% Platform Fee</option>
                  ))}
                </select>
              </div>
            ) : (
              <div className="text-[7px] text-slate-400 font-bold uppercase mt-1">100% PROFIT TO CE</div>
            )}
          </div>
        </div>

        <div className="space-y-2 pb-6">
          <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1 flex items-center gap-1"><Tag size={12}/> Product Category</label>
          <div className="flex gap-2">
            <select value={selectedCategory} onChange={(e) => setSelectedCategory(e.target.value)} className="flex-1 p-4 bg-slate-50 border border-slate-200 rounded-2xl outline-none text-sm font-black text-slate-700 uppercase focus:border-[#27335c] shadow-sm">
              {categories.map((cat) => <option key={cat} value={cat}>{cat}</option>)}
            </select>
            <button type="button" onClick={() => setShowAddCategory(!showAddCategory)} className="p-4 bg-slate-50 border border-slate-200 rounded-2xl text-[#27335c] hover:bg-[#27335c] hover:text-white transition-all shadow-sm"><Plus size={20}/></button>
          </div>
          {showAddCategory && (
            <div className="flex gap-2 animate-in slide-in-from-top-2 duration-300">
              <input type="text" placeholder="New Category Name..." value={newCategory} onChange={(e) => setNewCategory(e.target.value)} className="flex-1 p-3 bg-white border-2 border-slate-100 rounded-xl outline-none text-sm font-bold" />
              <button type="button" onClick={handleAddCategory} className="px-6 py-2 bg-[#27335c] text-white rounded-xl text-[10px] font-black uppercase">Add</button>
            </div>
          )}
        </div>

        <div className="sticky bottom-0 z-50 -mx-4 -mb-4 p-4 bg-white/90 backdrop-blur-sm border-t border-slate-100 mt-auto">
          <button type="submit" className="w-full py-4 bg-[#27335c] text-white rounded-2xl font-black text-sm uppercase tracking-widest shadow-xl flex items-center justify-center gap-3 active:scale-[0.98] transition-all">
            <Check size={20} strokeWidth={3} /> {editingOrder ? 'Update Order Record' : 'Record Order Entry'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default Home;
