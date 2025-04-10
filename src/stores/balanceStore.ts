
import { create } from 'zustand';

interface BalanceState {
  balance: number;
  setBalance: (balance: number) => void;
  addToBalance: (amount: number) => void;
}

export const useBalanceStore = create<BalanceState>((set) => ({
  balance: 10000, // Default starting balance
  setBalance: (balance: number) => set({ balance }),
  addToBalance: (amount: number) => set((state) => ({ balance: state.balance + amount })),
}));
