import { ArrowUpDown, ListFilter, MapPin, Key } from "lucide-react";
import { QuestCard } from "./QuestCard";
import { useState } from "react";
import { ToastNotification } from "./ToastNotification";
import { SkeletonLoader } from "./SkeletonLoader";
import { EmptyState } from "./EmptyState";

interface Quest {
  title: string;
  description: string;
  reward: number;
  xp: number;
  urgency: "low" | "medium" | "urgent";
  deadline: string;
  location?: string;
  highlighted?: boolean;
  isMyQuest?: boolean;
  otp: string; // Added OTP
}

interface HeroViewProps {
  quests: Quest[];
  onAcceptQuest?: (quest: Quest) => void;
}

export function HeroView({ quests, onAcceptQuest }: HeroViewProps) {
  const [showToast, setShowToast] = useState(false);
  const [acceptedQuest, setAcceptedQuest] = useState<Quest | null>(null);
  const [acceptedQuestIds, setAcceptedQuestIds] = useState<Set<string>>(new Set());
  const [isLoading, setIsLoading] = useState(false);
  const [showEmpty, setShowEmpty] = useState(false);

  const handleAcceptQuest = (quest: Quest, index: number) => {
    setAcceptedQuest(quest);
    setShowToast(true);
    setAcceptedQuestIds(prev => new Set(prev).add(quest.title));
    onAcceptQuest?.(quest);
  };

  const handleRefresh = () => {
    setIsLoading(true);
    setTimeout(() => setIsLoading(false), 2000);
  };

  const handleClearFilters = () => {
    setShowEmpty(false);
  };

  return (
    <div className="min-h-screen pt-16 md:pt-28 pb-20 md:pb-16 px-4 md:px-8 bg-[var(--campus-bg)]">
      <div className="max-w-[1600px] mx-auto">
        {/* Hero Section */}
        <div className="text-center mb-8 md:mb-12">
          <h1 className="mb-4 text-2xl md:text-4xl lg:text-5xl">
            Ready to Be a{" "}
            <span className="bg-gradient-to-r from-[#2D7FF9] to-[#9D4EDD] bg-clip-text text-transparent">
              Campus Hero?
            </span>
          </h1>
          <p className="text-[var(--campus-text-secondary)] text-base md:text-lg lg:text-xl">
            Accept quests, earn rewards, level up your campus life.
          </p>
        </div>

        {/* Filter Bar */}
        <div className="flex flex-wrap items-center gap-3 md:gap-4 mb-8">
          <div className="flex items-center gap-2 bg-[var(--campus-card-bg)] backdrop-blur-md rounded-xl px-3 md:px-4 py-2 md:py-3 border border-[var(--campus-border)] cursor-pointer hover:bg-opacity-80 transition-colors text-sm md:text-base">
            <ArrowUpDown className="w-4 h-4 text-[var(--campus-text-secondary)]" />
            <span className="text-[var(--campus-text-primary)]">Sort by: Highest Pay</span>
          </div>
          <div className="flex items-center gap-2 bg-[var(--campus-card-bg)] backdrop-blur-md rounded-xl px-3 md:px-4 py-2 md:py-3 border border-[var(--campus-border)] cursor-pointer hover:bg-opacity-80 transition-colors text-sm md:text-base">
            <ListFilter className="w-4 h-4 text-[var(--campus-text-secondary)]" />
            <span className="text-[var(--campus-text-primary)]">Filter: Urgent</span>
          </div>
          <div className="flex items-center gap-2 bg-[var(--campus-card-bg)] backdrop-blur-md rounded-xl px-3 md:px-4 py-2 md:py-3 border border-[var(--campus-border)] cursor-pointer hover:bg-opacity-80 transition-colors text-sm md:text-base">
            <MapPin className="w-4 h-4 text-[var(--campus-text-secondary)]" />
            <span className="text-[var(--campus-text-primary)]">Location: Hostels</span>
          </div>

          <div className="ml-auto flex items-center gap-4 md:gap-6 text-sm md:text-base">
            <div className="text-center">
              <div className="text-[var(--campus-text-secondary)] text-xs md:text-sm">Available Quests</div>
              <div className="text-[var(--campus-text-primary)]">{quests.length}</div>
            </div>
            <div className="text-center">
              <div className="text-[var(--campus-text-secondary)] text-xs md:text-sm">Total Rewards</div>
              <div className="text-[#00F5D4]">
                ₹{quests.reduce((sum, q) => sum + q.reward, 0)}
              </div>
            </div>
          </div>
        </div>

        {isLoading && <SkeletonLoader />}

        {showEmpty && !isLoading && (
          <EmptyState
            onRefresh={handleRefresh}
            onClearFilters={handleClearFilters}
          />
        )}

        {!isLoading && !showEmpty && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {quests.map((quest, index) => (
              <div key={index} className="relative group">
                <QuestCard 
                  {...quest} 
                  onAccept={() => handleAcceptQuest(quest, index)}
                  isAccepted={acceptedQuestIds.has(quest.title)}
                />
                
                {/* PROTOTYPE: OTP Badge */}
                <div className="absolute top-4 left-4 z-10">
                   <div className="flex items-center gap-1 bg-black/70 backdrop-blur-md px-2 py-1 rounded text-xs font-mono text-[#00F5D4] border border-[#00F5D4]/30">
                     <Key className="w-3 h-3" />
                     <span>{quest.otp}</span>
                   </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <ToastNotification
        isVisible={showToast}
        title={acceptedQuest?.title || ""}
        location={acceptedQuest?.location}
        onClose={() => setShowToast(false)}
      />
    </div>
  );
}
