import { Send, X, Phone, Minus, Sparkles, Loader2, Paperclip, Image as ImageIcon, WifiOff } from "lucide-react";
import { useState, useEffect, useRef } from "react";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar";
import { GoogleGenerativeAI } from "@google/generative-ai";

interface Message {
  id: string;
  sender: "user" | "taskmaster";
  text: string;
  timestamp: Date;
}

interface ChatInterfaceProps {
  isOpen: boolean;
  onClose: () => void;
  questTitle: string;
  questLocation?: string;
  questReward?: number;
  secretOTP: string;
}

export function ChatInterface({ isOpen, onClose, questTitle, questLocation, questReward, secretOTP }: ChatInterfaceProps) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputValue, setInputValue] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [isOfflineMode, setIsOfflineMode] = useState(false);
  
  const scrollRef = useRef<HTMLDivElement>(null);
  const chatSession = useRef<any>(null);

  // --- 1. Initialize Gemini ---
  useEffect(() => {
    if (isOpen && !chatSession.current) {
      const apiKey = import.meta.env.VITE_GEMINI_API_KEY;
      
      // Initial Welcome Message
      const initialMsg = `Hey! Thanks for picking up "${questTitle}". I'm at ${questLocation || 'the location'}. Let me know when you're close!`;
      addMessage("taskmaster", initialMsg);

      if (!apiKey) {
        console.warn("No API Key found. Switching to Simulation Mode.");
        setIsOfflineMode(true);
        return;
      }

      try {
        const genAI = new GoogleGenerativeAI(apiKey);
        
        // UPDATED: Using "gemini-2.5-flash" as requested
        const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

        const promptContext = `
          INSTRUCTIONS:
          You are acting as the "Task Master" on the CampusJugaad app.
          You posted a quest: "${questTitle}" at "${questLocation || "Campus Center"}".
          Reward: ₹${questReward || 0}.
          
          The user (Hero) has accepted your quest.
          YOUR SECRET OTP IS: [ ${secretOTP} ]
          
          RULES:
          1. Be friendly, casual, and act like a college student.
          2. Keep responses short (under 2 sentences).
          3. DO NOT reveal the OTP at the start.
          4. ONLY reveal the OTP when the user explicitly says they have "completed", "finished", or "done" the task.
          5. If they ask for the OTP before finishing, tell them to finish the job first.
          
          Start the conversation now.
        `;

        chatSession.current = model.startChat({
            history: [
              {
                role: "user",
                parts: [{ text: promptContext }],
              },
              {
                role: "model",
                parts: [{ text: initialMsg }],
              },
            ],
          });
      } catch (e) {
          console.error("Chat Init Error, switching to offline:", e);
          setIsOfflineMode(true);
      }
    }
  }, [isOpen, questTitle, questLocation, secretOTP]);

  // Scroll to bottom
  useEffect(() => {
    if (scrollRef.current) scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
  }, [messages, isTyping, isOpen, isMinimized]);

  const addMessage = (sender: "user" | "taskmaster", text: string) => {
    const newMessage: Message = {
      id: Math.random().toString(36).substr(2, 9),
      sender,
      text,
      timestamp: new Date(),
    };
    setMessages((prev) => [...prev, newMessage]);
  };

  // --- FALLBACK SIMULATION LOGIC (Wizard of Oz) ---
  const generateOfflineReply = (text: string) => {
    const lower = text.toLowerCase();
    if (lower.includes("otp") || lower.includes("code")) {
        if (lower.includes("done") || lower.includes("finish") || lower.includes("complete")) {
            return `Awesome! Here is the OTP: ${secretOTP}. Thanks a ton!`;
        }
        return "I can't give the OTP yet. Please finish the task first!";
    }
    if (lower.includes("done") || lower.includes("finished") || lower.includes("completed")) {
        return `Great job! verify it using this OTP: ${secretOTP}`;
    }
    if (lower.includes("where") || lower.includes("location")) {
        return `I'm at ${questLocation}. Look for the guy in the black hoodie.`;
    }
    if (lower.includes("money") || lower.includes("cash") || lower.includes("pay")) {
        return `The ₹${questReward} is already in escrow. You'll get it instantly after OTP verification.`;
    }
    const generics = [
        "Sounds good!",
        "Okay, hurry up please!",
        "Cool, see you soon.",
        "Perfect.",
        "Thanks for helping out!"
    ];
    return generics[Math.floor(Math.random() * generics.length)];
  };

  const handleSend = async () => {
    if (!inputValue.trim()) return;

    const userText = inputValue;
    addMessage("user", userText);
    setInputValue("");
    setIsTyping(true);

    // 1. Try Real AI (gemini-2.5-flash)
    if (!isOfflineMode && chatSession.current) {
        try {
            const result = await chatSession.current.sendMessage(userText);
            const response = await result.response;
            setIsTyping(false);
            addMessage("taskmaster", response.text());
            return;
        } catch (error) {
            console.error("API Error (Quota/Network). Switching to Offline Mode.", error);
            setIsOfflineMode(true);
            // Fall through to offline logic below
        }
    }

    // 2. Fallback to Offline Logic
    setTimeout(() => {
        setIsTyping(false);
        const reply = generateOfflineReply(userText);
        addMessage("taskmaster", reply);
    }, 1500); // Fake delay
  };

  if (!isOpen) return null;

  if (isMinimized) {
    return (
      <div 
        onClick={() => setIsMinimized(false)}
        className="fixed bottom-24 right-4 z-50 bg-[#2D7FF9] text-white p-3 rounded-full shadow-lg cursor-pointer hover:scale-110 transition-transform animate-bounce border-2 border-white"
      >
        <Avatar className="h-10 w-10 border-2 border-white">
          <AvatarImage src="/placeholder-avatar.jpg" />
          <AvatarFallback className="text-black bg-white">TM</AvatarFallback>
        </Avatar>
      </div>
    );
  }

  return (
    <div className="fixed bottom-20 right-4 md:bottom-24 md:right-8 w-[95vw] md:w-[380px] h-[600px] md:h-[500px] bg-[var(--campus-card-bg)] backdrop-blur-xl border border-[var(--campus-border)] rounded-2xl shadow-2xl flex flex-col z-50 animate-in slide-in-from-bottom-10 fade-in duration-300 overflow-hidden font-sans">
      
      {/* Header */}
      <div className="flex items-center justify-between p-3 border-b border-[var(--campus-border)] bg-[#2D7FF9]/10">
        <div className="flex items-center gap-3">
          <div className="relative">
            <Avatar className="h-10 w-10 border-2 border-[#2D7FF9]">
              <AvatarImage src="/placeholder-avatar.jpg" />
              <AvatarFallback className="bg-[#2D7FF9] text-white">TM</AvatarFallback>
            </Avatar>
            <span className={`absolute bottom-0 right-0 w-3 h-3 border-2 border-[var(--campus-card-bg)] rounded-full ${isOfflineMode ? 'bg-yellow-500' : 'bg-green-500'}`}></span>
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="font-bold text-[var(--campus-text-primary)] text-sm">Task Master</h3>
              {isOfflineMode ? (
                 <span className="text-[10px] bg-yellow-500/20 text-yellow-500 px-1.5 py-0.5 rounded flex items-center gap-1" title="Using Offline Simulation">
                    <WifiOff className="w-2 h-2" /> Sim
                 </span>
              ) : (
                 <span className="text-[10px] bg-[#2D7FF9]/20 text-[#2D7FF9] px-1.5 py-0.5 rounded flex items-center gap-1">
                    <Sparkles className="w-2 h-2" /> AI
                 </span>
              )}
            </div>
            <p className="text-xs text-[var(--campus-text-secondary)] opacity-80">Online</p>
          </div>
        </div>
        <div className="flex items-center gap-1">
          <Button variant="ghost" size="icon" onClick={() => setIsMinimized(true)} className="h-8 w-8 hover:bg-white/10 text-[var(--campus-text-secondary)]">
            <Minus className="w-4 h-4" />
          </Button>
          <Button variant="ghost" size="icon" onClick={onClose} className="h-8 w-8 hover:bg-red-500/20 text-[var(--campus-text-secondary)] hover:text-red-500">
            <X className="w-4 h-4" />
          </Button>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4" ref={scrollRef}>
        {messages.map((msg) => (
          <div key={msg.id} className={`flex ${msg.sender === "user" ? "justify-end" : "justify-start"}`}>
            <div className={`max-w-[80%] px-4 py-2 rounded-2xl text-sm shadow-sm ${
                msg.sender === "user" 
                  ? "bg-[#2D7FF9] text-white rounded-tr-none" 
                  : "bg-[var(--campus-surface)] border border-[var(--campus-border)] text-[var(--campus-text-primary)] rounded-tl-none"
              }`}>
              {msg.text}
              <div className={`text-[9px] mt-1 opacity-70 ${msg.sender === "user" ? "text-blue-100" : "text-[var(--campus-text-secondary)]"}`}>
                {msg.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              </div>
            </div>
          </div>
        ))}
        {isTyping && (
          <div className="flex justify-start">
             <div className="bg-[var(--campus-surface)] px-4 py-3 rounded-2xl rounded-tl-none border border-[var(--campus-border)] flex gap-1 items-center">
               <Loader2 className="w-4 h-4 animate-spin text-[#2D7FF9]" />
               <span className="text-xs text-[var(--campus-text-secondary)]">Task Master is typing...</span>
             </div>
          </div>
        )}
      </div>

      {/* Input Area */}
      <div className="p-3 border-t border-[var(--campus-border)] bg-[var(--campus-bg)]">
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="icon" className="h-9 w-9 text-[var(--campus-text-secondary)] hover:bg-[var(--campus-border)] rounded-full">
            <Paperclip className="w-4 h-4" />
          </Button>
          <div className="flex-1 relative">
            <Input 
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSend()}
              placeholder="Type a message..."
              className="w-full bg-[var(--campus-surface)] border-none focus-visible:ring-1 focus-visible:ring-[#2D7FF9] text-[var(--campus-text-primary)] pr-10 rounded-full"
              disabled={isTyping}
            />
            <Button 
              variant="ghost" 
              size="icon" 
              className="absolute right-1 top-1/2 -translate-y-1/2 h-7 w-7 text-[var(--campus-text-secondary)] hover:bg-transparent"
            >
              <ImageIcon className="w-4 h-4" />
            </Button>
          </div>
          <Button 
            onClick={handleSend}
            disabled={!inputValue.trim() || isTyping}
            className="h-9 w-9 rounded-full bg-[#2D7FF9] hover:bg-[#2D7FF9]/90 text-white p-0 flex items-center justify-center shadow-lg shadow-blue-500/20"
          >
            <Send className="w-4 h-4 ml-0.5" />
          </Button>
        </div>
      </div>
    </div>
  );
}
