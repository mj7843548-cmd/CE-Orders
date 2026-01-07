
import React, { useState, useEffect } from 'react';
import { AppTab, Order, SellerEarning } from './types';
import Navigation from './components/Navigation';
import Home from './components/Home';
import OrdersList from './components/OrdersList';
import Analytics from './components/Analytics';
import SellerEarnings from './components/SellerEarnings';

const App: React.FC = () => {
  const [activeTab, setActiveTab] = useState<AppTab>('home');
  const [orders, setOrders] = useState<Order[]>([]);
  const [sellerEarnings, setSellerEarnings] = useState<SellerEarning[]>([]);
  const [categories, setCategories] = useState<string[]>(['reels bundle', 'CE Prime', 'Advertisement ON CE']);
  const [editingOrder, setEditingOrder] = useState<Order | null>(null);

  useEffect(() => {
    const savedOrders = localStorage.getItem('ce_orders');
    const savedCategories = localStorage.getItem('ce_categories');
    const savedEarnings = localStorage.getItem('ce_seller_earnings');
    if (savedOrders) setOrders(JSON.parse(savedOrders));
    if (savedCategories) setCategories(JSON.parse(savedCategories));
    if (savedEarnings) setSellerEarnings(JSON.parse(savedEarnings));
  }, []);

  useEffect(() => {
    localStorage.setItem('ce_orders', JSON.stringify(orders));
  }, [orders]);

  useEffect(() => {
    localStorage.setItem('ce_categories', JSON.stringify(categories));
  }, [categories]);

  useEffect(() => {
    localStorage.setItem('ce_seller_earnings', JSON.stringify(sellerEarnings));
  }, [sellerEarnings]);

  const addOrder = (order: Order) => {
    setOrders(prev => [order, ...prev]);
  };

  const updateOrder = (updatedOrder: Order) => {
    setOrders(prev => prev.map(o => o.id === updatedOrder.id ? updatedOrder : o));
    setEditingOrder(null);
  };

  const deleteOrder = (id: string) => {
    setOrders(prev => prev.filter(o => o.id !== id));
  };

  const importOrders = (newOrders: Order[]) => {
    setOrders(prev => [...newOrders, ...prev]);
  };

  const startEditing = (order: Order) => {
    setEditingOrder(order);
    setActiveTab('home');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const cancelEditing = () => {
    setEditingOrder(null);
  };

  const addCategory = (name: string) => {
    if (name && !categories.includes(name)) {
      setCategories(prev => [...prev, name]);
    }
  };

  // Seller Earning Actions
  const addSellerEarning = (earning: SellerEarning) => {
    setSellerEarnings(prev => [earning, ...prev]);
  };

  const updateSellerEarning = (updated: SellerEarning) => {
    setSellerEarnings(prev => prev.map(e => e.id === updated.id ? updated : e));
  };

  const deleteSellerEarning = (id: string) => {
    setSellerEarnings(prev => prev.filter(e => e.id !== id));
  };

  return (
    <div className="min-h-screen bg-slate-100 pb-12">
      <div className="w-full max-w-4xl mx-auto bg-white md:shadow-2xl md:my-6 md:rounded-[2.5rem] flex flex-col relative overflow-visible">
        
        {/* Top Header Section - Scrolls normally */}
        <div className="bg-[#27335c] text-white p-5 md:p-7 md:rounded-t-[2.5rem]">
          <h1 className="text-xl md:text-2xl font-black uppercase tracking-tight">CE Order Management</h1>
          <p className="text-slate-300 text-[10px] font-bold uppercase tracking-[0.2em]">Command Center</p>
        </div>

        {/* Sticky Menu Container - Only buttons stick */}
        <div className="sticky top-0 z-50 bg-[#27335c] p-3 md:px-7 md:py-4 shadow-lg border-t border-white/5">
          <Navigation 
            activeTab={activeTab} 
            onTabChange={(tab) => {
              setActiveTab(tab);
              if (tab !== 'home') setEditingOrder(null);
              // Avoid scrolling to absolute top if menu is already sticky
              const scrollOffset = window.innerWidth < 768 ? 80 : 120;
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }} 
          />
        </div>

        {/* Main Content Area */}
        <main className={`flex-1 p-4 md:p-10 ${activeTab === 'home' || activeTab === 'seller' ? 'pb-16 md:pb-24' : 'pb-8'}`}>
          {activeTab === 'home' && (
            <Home 
              onAddOrder={addOrder} 
              onUpdateOrder={updateOrder}
              editingOrder={editingOrder}
              onCancelEdit={cancelEditing}
              categories={categories} 
              onAddCategory={addCategory} 
            />
          )}
          {activeTab === 'orders' && (
            <OrdersList 
              orders={orders} 
              onDelete={deleteOrder} 
              onEdit={startEditing}
              onImport={importOrders}
            />
          )}
          {activeTab === 'analytics' && (
            <Analytics orders={orders} />
          )}
          {activeTab === 'seller' && (
            <SellerEarnings 
              earnings={sellerEarnings}
              onAdd={addSellerEarning}
              onUpdate={updateSellerEarning}
              onDelete={deleteSellerEarning}
            />
          )}
        </main>
      </div>
    </div>
  );
};

export default App;
