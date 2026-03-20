
export interface ITransaction {
  _id: string;
  type: 'refund' | 'payment' | 'cancellation' | 'other';
  amount: number;
  date: string | Date;
  description?: string;
  bookingId?: string;
  status?: "pending" | "completed" | "paid";

}
export interface TransactionDTO {
  transactionId: string;
  type: string;
  amount: number;
  date: Date;
  description?: string;
  bookingId?: string;
  status?: "pending" | "completed" | "paid";
}

export interface IWalletData {
  balance: number;
  transactions: ITransaction[];
}
export interface IOwnerWalletData {
  balance: number;
  pendingBalance: number;
  totalEarnings: number;
  totalWithdrawn: number;
  // payoutEnabled: boolean;
  lastPayout: number;
  transactions: ITransaction[];
}

export interface IWalletResponse {
  data: {
    wallet: {
      balance: number;
      transactions: ITransaction[];
    };
    total: number;
    page: number;
    limit: number;
  };
}
export interface IOwnerWalletResponse {
  data: {
    wallet: {
      balance: number;
       pendingBalance: number;
  totalEarnings: number;
  totalWithdrawn: number;
 
  lastPayout: number;
      transactions: ITransaction[];
    };
    total: number;
    page: number;
    limit: number;
     payoutStatus: boolean;
  };
}


export interface WalletSummary {
  totalEarnings: number;
  availableBalance: number;
  pendingBalance: number;
  lastPayout?: number;
  // payoutEnabled: boolean;
}

export interface WalletTransaction {
  _id: string;
  bookingId: string;
  amount: number;
  status: "pending" | "available" | "paid";
  createdAt: string;
}