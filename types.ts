
export interface Order {
  id: string;
  orderDate: string;
  orderNumber: string;
  customerName: string;
  email: string;
  sellerName: string;
  mobileNumber: string;
  orderAmount: number;
  isGstApplied: boolean;
  gstAmount: number;
  walletAmount: number;
  discountGiven: number;
  referralAmount: number;
  totalAmountPaid: number;
  applySellerShare: boolean; // Renamed from applyPlatformFee for clarity
  platformFeePercent: number;
  commissionAmount: number;
  sellerIncome: number;
  category: string;
  orderSource: 'Whatsapp' | 'Website';
  pgName: string;
  pgRate: number;
  isPotential: boolean; // Track if order is in "Potential" status
}

export interface SellerEarning {
  id: string;
  sellerName: string;
  payoutAmount: number;
  status: 'Paid' | 'Unpaid';
  date: string;
  notes: string;
}

export type AppTab = 'home' | 'orders' | 'analytics' | 'seller';
