
import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface BalanceState {
  balance: number;
  setBalance: (balance: number) => void;
  addToBalance: (amount: number) => void;
}

export const useBalanceStore = create<BalanceState>()(
  persist(
    (set) => ({
      balance: 10000, // Default starting balance
      setBalance: (balance: number) => set({ balance }),
      addToBalance: (amount: number) => set((state) => ({ balance: state.balance + amount })),
    }),
    {
      name: 'balance-storage', // unique name for localStorage
    }
  )
);
