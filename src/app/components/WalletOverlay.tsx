import { X, Plus, ArrowDownToLine, TrendingUp, TrendingDown, Check } from "lucide-react";
import { motion } from "motion/react";
import { useState } from "react";

// Matches the interface in App.tsx
export interface Transaction {
  id: string;
  type: "credit" | "debit";
  description: string;
  amount: number;
  status: "success" | "pending" | "failed";
  date: string;
}

interface WalletOverlayProps {
  isOpen: boolean;
  onClose: () => void;
  balance: number;
  transactions: Transaction[];
  onWithdraw: (amount: number) => void;
  onAddMoney: (amount: number) => void;
}

export function WalletOverlay({ 
  isOpen, 
  onClose, 
  balance, 
  transactions, 
  onWithdraw, 
  onAddMoney 
}: WalletOverlayProps) {
  const [transactionMode, setTransactionMode] = useState<"none" | "add" | "withdraw">("none");
  const [amountInput, setAmountInput] = useState("");

  const handleTransactionSubmit = () => {
    const amount = parseFloat(amountInput);
    if (!amount || amount <= 0) return;
    
    if (transactionMode === "withdraw") {
        if (amount > balance) {
            alert("Insufficient balance!");
            return;
        }
        onWithdraw(amount);
    } else if (transactionMode === "add") {
        onAddMoney(amount);
    }

    setTransactionMode("none");
    setAmountInput("");
  };

  const handleCancel = () => {
    setTransactionMode("none");
    setAmountInput("");
  };

  if (!isOpen) return null;

  return (
    <>
      {/* Backdrop */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50"
        onClick={onClose}
      />

      {/* Overlay */}
      <motion.div
        initial={{ x: "100%" }}
        animate={{ x: 0 }}
        exit={{ x: "100%" }}
        transition={{ type: "spring", damping: 25, stiffness: 200 }}
        className="fixed top-0 right-0 h-full w-full md:w-[480px] bg-[var(--campus-bg)] border-l border-[var(--campus-border)] z-50 overflow-y-auto"
      >
        {/* Header */}
        <div className="sticky top-0 bg-[var(--campus-bg)] border-b border-[var(--campus-border)] px-6 py-4 flex items-center justify-between z-10">
          <h2 className="text-[var(--campus-text-primary)]">My Wallet</h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-[var(--campus-border)] rounded-full transition-colors"
          >
            <X className="w-5 h-5 text-[var(--campus-text-secondary)]" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {/* Balance Card */}
          <div className="bg-gradient-to-br from-[#2D7FF9] to-[#9D4EDD] rounded-2xl p-6 text-white transition-all">
            <p className="text-sm opacity-90 mb-2">Current Balance</p>
            <p className="text-4xl mb-6 font-bold">₹{balance.toLocaleString()}</p>
            
            {transactionMode === "none" ? (
              <div className="grid grid-cols-2 gap-3">
                <button 
                  onClick={() => setTransactionMode("add")}
                  className="bg-white/20 backdrop-blur-md hover:bg-white/30 py-3 rounded-xl flex items-center justify-center gap-2 transition-colors"
                >
                  <Plus className="w-5 h-5" />
                  <span>Add Money</span>
                </button>
                <button 
                  onClick={() => setTransactionMode("withdraw")}
                  className="bg-[#00F5D4]/20 backdrop-blur-md hover:bg-[#00F5D4]/30 py-3 rounded-xl flex items-center justify-center gap-2 transition-colors"
                >
                  <ArrowDownToLine className="w-5 h-5" />
                  <span>Withdraw</span>
                </button>
              </div>
            ) : (
              <div className="space-y-3">
                 <div className="flex justify-between items-center mb-1">
                    <span className="text-sm opacity-90">
                        {transactionMode === "add" ? "Add to Wallet" : "Withdraw to Bank"}
                    </span>
                 </div>
                 
                 <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-white/70">₹</span>
                    <input 
                      type="number"
                      autoFocus
                      placeholder="Enter amount"
                      value={amountInput}
                      onChange={(e) => setAmountInput(e.target.value)}
                      className="w-full bg-white/10 border border-white/20 rounded-xl py-2 pl-8 pr-4 text-white placeholder:text-white/50 focus:outline-none focus:bg-white/20"
                    />
                 </div>
                 
                 <div className="grid grid-cols-2 gap-3">
                   <button 
                     onClick={handleCancel}
                     className="bg-white/10 hover:bg-white/20 py-2 rounded-xl text-sm transition-colors"
                   >
                     Cancel
                   </button>
                   <button 
                     onClick={handleTransactionSubmit}
                     className={`text-black py-2 rounded-xl flex items-center justify-center gap-2 text-sm font-semibold transition-colors ${
                         transactionMode === "add" 
                         ? "bg-[#00F5D4] hover:bg-[#00F5D4]/90"
                         : "bg-[#FFD700] hover:bg-[#FFD700]/90"
                     }`}
                   >
                     <Check className="w-4 h-4" />
                     Confirm
                   </button>
                 </div>
              </div>
            )}
          </div>

          {/* Recent Transactions */}
          <div>
            <h3 className="text-[var(--campus-text-primary)] mb-4">Recent Transactions</h3>
            
            {/* Transaction List - Mobile Friendly */}
            <div className="bg-[var(--campus-card-bg)] rounded-xl border border-[var(--campus-border)] overflow-hidden">
              {transactions.length === 0 ? (
                <div className="p-8 text-center text-[var(--campus-text-secondary)]">
                  <p>No transactions yet.</p>
                </div>
              ) : (
                <div className="divide-y divide-[var(--campus-border)]">
                  {transactions.map((txn) => (
                    <div
                      key={txn.id}
                      className="flex items-center gap-3 p-4 hover:bg-[var(--campus-border)] transition-colors"
                    >
                      {/* Icon */}
                      <div
                        className={`p-2 rounded-xl shrink-0 ${
                          txn.type === "credit"
                            ? "bg-[#00F5D4]/10 text-[#00F5D4]"
                            : "bg-red-500/10 text-red-500"
                        }`}
                      >
                        {txn.type === "credit" ? (
                          <TrendingUp className="w-5 h-5" />
                        ) : (
                          <TrendingDown className="w-5 h-5" />
                        )}
                      </div>

                      {/* Info - Flexible Width */}
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-[var(--campus-text-primary)] truncate">
                          {txn.description}
                        </p>
                        <div className="flex items-center gap-2 text-xs text-[var(--campus-text-secondary)]">
                          <span>{txn.date}</span>
                          <span className="hidden sm:inline-block px-1.5 py-0.5 rounded bg-[var(--campus-border)] font-mono">
                            {txn.id}
                          </span>
                        </div>
                      </div>

                      {/* Amount & Status */}
                      <div className="text-right shrink-0">
                        <p
                          className={`text-sm font-semibold ${
                            txn.type === "credit" ? "text-[#00F5D4]" : "text-red-500"
                          }`}
                        >
                          {txn.type === "credit" ? "+" : "-"}₹{txn.amount}
                        </p>
                        <span className={`text-xs ${
                            txn.status === "success" ? "text-[#00F5D4]" : "text-yellow-500"
                        }`}>
                            {txn.status}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </motion.div>
    </>
  );
}