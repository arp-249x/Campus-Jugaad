import { useState, useEffect } from "react";
import { ThemeProvider } from "./components/ThemeContext";
import { ToastProvider, useToast } from "./components/ToastContext";
import { Navigation } from "./components/Navigation";
import { MobileTopBar } from "./components/MobileTopBar";
import { BottomNavigation } from "./components/BottomNavigation";
import { TaskMasterView } from "./components/TaskMasterView";
import { HeroView } from "./components/HeroView";
import { DashboardView } from "./components/DashboardView";
import { LeaderboardView } from "./components/LeaderboardView";
import { ActiveQuestBar } from "./components/ActiveQuestBar";
import { MobileMenu } from "./components/MobileMenu";
import { WalletOverlay } from "./components/WalletOverlay";
import { NotificationPanel } from "./components/NotificationPanel";
import { Footer } from "./components/Footer";

// Define Quest interface with OTP
export interface Quest {
  title: string;
  description: string;
  reward: number;
  xp: number;
  urgency: "low" | "medium" | "urgent";
  deadline: string;
  location?: string;
  highlighted?: boolean;
  isMyQuest?: boolean;
  otp: string; // Added OTP field
}

export interface Transaction {
  id: string;
  type: "credit" | "debit";
  description: string;
  amount: number;
  status: "success" | "pending" | "failed";
  date: string;
}

function AppContent() {
  const [activeTab, setActiveTab] = useState("post");
  // Active quest now includes OTP for verification
  const [activeQuest, setActiveQuest] = useState<{
    title: string;
    location?: string;
    duration: number;
    reward: number;
    otp: string;
  } | null>(null);
  
  const [showMobileMenu, setShowMobileMenu] = useState(false);
  const [showWalletOverlay, setShowWalletOverlay] = useState(false);
  const [showNotificationPanel, setShowNotificationPanel] = useState(false);
  const { showToast } = useToast();

  // --- 1. Load Data ---
  
  const [quests, setQuests] = useState<Quest[]>(() => {
    const savedQuests = localStorage.getItem("campus_jugaad_quests");
    if (savedQuests) return JSON.parse(savedQuests);
    return [
      {
        title: "Hold Canteen Line Spot",
        description: "Stand in the lunch queue for me for 20 mins.",
        reward: 150,
        xp: 50,
        urgency: "medium",
        deadline: "Today, 2 PM",
        location: "Main Canteen",
        otp: "1234",
      },
      {
        title: "Deliver Lab Coat ASAP",
        description: "Forgot my coat at Hostel 4. Need it at Chem Lab now!",
        reward: 250,
        xp: 75,
        urgency: "urgent",
        deadline: "In 30 Mins",
        location: "Hostel 4 → Chem Lab",
        otp: "5678",
      },
      {
        title: "Tutoring Session: Calculus II",
        description: "2-hour session to prep for midterm exam.",
        reward: 600,
        xp: 200,
        urgency: "low",
        deadline: "Tomorrow, 5 PM",
        location: "Library",
        highlighted: true,
        otp: "9012",
      },
      {
        title: "Print Assignment",
        description: "Print 10 pages and deliver to Block A, Room 204.",
        reward: 100,
        xp: 30,
        urgency: "medium",
        deadline: "Today, 4 PM",
        location: "Block A",
        otp: "3456",
      },
    ];
  });

  const [balance, setBalance] = useState(() => {
    const savedBalance = localStorage.getItem("campus_jugaad_balance");
    return savedBalance ? parseFloat(savedBalance) : 450;
  });

  const [transactions, setTransactions] = useState<Transaction[]>(() => {
    const savedTxns = localStorage.getItem("campus_jugaad_transactions");
    if (savedTxns) return JSON.parse(savedTxns);
    return [
      {
        id: "TXN-1021",
        type: "credit",
        description: "Welcome Bonus",
        amount: 50,
        status: "success",
        date: "Joined",
      },
    ];
  });

  // --- 2. Persistence ---
  useEffect(() => {
    localStorage.setItem("campus_jugaad_quests", JSON.stringify(quests));
  }, [quests]);

  useEffect(() => {
    localStorage.setItem("campus_jugaad_balance", balance.toString());
  }, [balance]);

  useEffect(() => {
    localStorage.setItem("campus_jugaad_transactions", JSON.stringify(transactions));
  }, [transactions]);

  // --- 3. Transaction Helper ---
  const addTransaction = (type: "credit" | "debit", description: string, amount: number) => {
    const newTxn: Transaction = {
      id: `TXN-${Math.floor(Math.random() * 10000)}`,
      type,
      description,
      amount,
      status: "success",
      date: new Date().toLocaleString('en-US', { 
        month: 'short', 
        day: 'numeric', 
        hour: 'numeric', 
        minute: '2-digit',
        hour12: true 
      }),
    };
    setTransactions(prev => [newTxn, ...prev]);
  };

  // --- 4. Action Handlers ---

  const addQuest = (newQuestData: Omit<Quest, "otp">) => {
    // Escrow Logic: Deduct money immediately upon posting
    if (balance < newQuestData.reward) {
      showToast("error", "Insufficient Balance", "Add money to your wallet to post this quest.");
      return;
    }

    // Generate 4 digit OTP
    const generatedOTP = Math.floor(1000 + Math.random() * 9000).toString();

    const newQuest: Quest = {
      ...newQuestData,
      otp: generatedOTP
    };

    setBalance(prev => prev - newQuest.reward);
    addTransaction("debit", `Escrow Hold: ${newQuest.title}`, newQuest.reward);
    
    setQuests((prevQuests) => [newQuest, ...prevQuests]);
    setActiveTab("find");
  };

  const handleAcceptQuest = (quest: Quest) => {
    setActiveQuest({
      title: quest.title,
      location: quest.location,
      duration: 7185,
      reward: quest.reward,
      otp: quest.otp,
    });
  };

  const handleCompleteQuest = () => {
    if (activeQuest) {
      // Payout Logic: Hero gets the money
      setBalance((prevBalance) => prevBalance + activeQuest.reward);
      addTransaction("credit", `Quest Reward: ${activeQuest.title}`, activeQuest.reward);
      
      showToast("success", "Quest Completed!", `OTP Verified! ₹${activeQuest.reward} added to wallet.`);
      setActiveQuest(null);
    }
  };

  const handleWithdraw = (amount: number) => {
    if (balance >= amount) {
      setBalance((prev) => prev - amount);
      addTransaction("debit", "Withdrawal to Bank", amount);
      showToast("success", "Withdrawal Successful", `₹${amount} transferred to your bank account.`);
    } else {
      showToast("error", "Insufficient Funds", "You don't have enough balance to withdraw that amount.");
    }
  };

  const handleAddMoney = (amount: number) => {
    setBalance((prev) => prev + amount);
    addTransaction("credit", "Added to Wallet", amount);
    showToast("success", "Money Added", `₹${amount} added to your wallet successfully.`);
  };

  return (
    <div className="min-h-screen bg-[var(--campus-bg)] relative overflow-x-hidden transition-colors duration-300">
      <div className="dark:block hidden fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-[#2D7FF9]/20 rounded-full blur-[120px] animate-pulse"></div>
        <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-[#9D4EDD]/20 rounded-full blur-[120px] animate-pulse" style={{ animationDelay: '1s' }}></div>
      </div>

      <div className="relative z-10 flex flex-col min-h-screen">
        <Navigation 
          activeTab={activeTab} 
          onTabChange={setActiveTab}
          onMenuClick={() => setShowMobileMenu(true)}
          onWalletClick={() => setShowWalletOverlay(true)}
          onNotificationClick={() => setShowNotificationPanel(true)}
          balance={balance}
        />
        
        <MobileTopBar 
          onMenuClick={() => setShowMobileMenu(true)}
          onWalletClick={() => setShowWalletOverlay(true)}
          onNotificationClick={() => setShowNotificationPanel(true)}
          balance={balance}
        />

        {/* Pass balance to TaskMaster for validation */}
        {activeTab === "post" && <TaskMasterView addQuest={addQuest} balance={balance} />}
        {activeTab === "find" && <HeroView quests={quests} onAcceptQuest={handleAcceptQuest} />}
        {activeTab === "dashboard" && <DashboardView />}
        {activeTab === "leaderboard" && <LeaderboardView />}

        <Footer />

        <BottomNavigation activeTab={activeTab} onTabChange={setActiveTab} />
      </div>

      {activeQuest && (
        <ActiveQuestBar 
          quest={activeQuest}
          onComplete={handleCompleteQuest}
          onDismiss={() => setActiveQuest(null)}
        />
      )}

      <MobileMenu
        isOpen={showMobileMenu}
        onClose={() => setShowMobileMenu(false)}
        activeTab={activeTab}
        onTabChange={setActiveTab}
      />

      <WalletOverlay
        isOpen={showWalletOverlay}
        onClose={() => setShowWalletOverlay(false)}
        balance={balance}
        transactions={transactions}
        onWithdraw={handleWithdraw}
        onAddMoney={handleAddMoney}
      />

      <NotificationPanel
        isOpen={showNotificationPanel}
        onClose={() => setShowNotificationPanel(false)}
      />
    </div>
  );
}

export default function App() {
  return (
    <ThemeProvider>
      <ToastProvider>
        <AppContent />
      </ToastProvider>
    </ThemeProvider>
  );
}