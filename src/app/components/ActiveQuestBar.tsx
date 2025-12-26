import { Clock, CheckCircle2, X, ShieldCheck } from "lucide-react";
import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "./ui/dialog";
import { InputOTP, InputOTPGroup, InputOTPSlot } from "./ui/input-otp";
import { Button } from "./ui/button";

interface ActiveQuest {
  title: string;
  location?: string;
  duration: number; // in seconds
  otp: string; // The correct OTP for this quest
}

interface ActiveQuestBarProps {
  quest: ActiveQuest | null;
  onComplete?: () => void;
  onDismiss?: () => void;
}

export function ActiveQuestBar({ quest, onComplete, onDismiss }: ActiveQuestBarProps) {
  const [timeLeft, setTimeLeft] = useState(0);
  const [isVerificationOpen, setIsVerificationOpen] = useState(false);
  const [otpValue, setOtpValue] = useState("");
  const [error, setError] = useState(false);

  useEffect(() => {
    if (quest) {
      setTimeLeft(quest.duration);
    }
  }, [quest]);

  useEffect(() => {
    if (timeLeft <= 0 || !quest) return;

    const timer = setInterval(() => {
      setTimeLeft((prev) => Math.max(0, prev - 1));
    }, 1000);

    return () => clearInterval(timer);
  }, [timeLeft, quest]);

  const formatTime = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    return `${hours.toString().padStart(2, "0")}:${minutes
      .toString()
      .padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
  };

  const handleVerify = () => {
    if (otpValue === quest?.otp) {
      setIsVerificationOpen(false);
      setOtpValue("");
      setError(false);
      onComplete?.();
    } else {
      setError(true);
      // Shake animation or visual feedback could be added here
      setTimeout(() => setError(false), 2000);
    }
  };

  if (!quest) return null;

  return (
    <>
      <div className="fixed bottom-0 md:bottom-0 left-0 right-0 z-40 bg-gradient-to-r from-[#2D7FF9] to-[#9D4EDD] border-t border-white/20 shadow-2xl shadow-[#2D7FF9]/30 backdrop-blur-xl animate-in slide-in-from-bottom duration-500 mb-16 md:mb-0">
        <div className="max-w-[1600px] mx-auto px-4 md:px-8 py-3 md:py-4">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 sm:gap-4">
            {/* Left: Quest Info */}
            <div className="flex items-center gap-3 min-w-0 flex-1">
              <div className="flex items-center gap-2 text-white min-w-0">
                <span className="hidden sm:inline text-sm opacity-80">Active Quest:</span>
                <span className="font-medium truncate">{quest.title}</span>
                {quest.location && (
                  <span className="hidden md:inline text-sm opacity-80">→ {quest.location}</span>
                )}
              </div>
            </div>

            {/* Center: Timer */}
            <div className="flex items-center gap-2 bg-black/20 backdrop-blur-sm px-3 md:px-4 py-2 rounded-lg border border-white/20">
              <Clock className="w-4 h-4 text-white" />
              <span className="text-white font-mono text-sm md:text-base">{formatTime(timeLeft)}</span>
            </div>

            {/* Right: Action Buttons */}
            <div className="flex items-center gap-2">
              <button
                onClick={() => setIsVerificationOpen(true)}
                className="flex items-center gap-2 px-3 md:px-4 py-2 bg-[#00F5D4] hover:bg-[#00F5D4]/90 text-black rounded-lg transition-all hover:scale-105 active:scale-95"
              >
                <CheckCircle2 className="w-4 h-4" />
                <span className="hidden sm:inline">Verify & Complete</span>
                <span className="sm:hidden">Verify</span>
              </button>
              <button
                onClick={onDismiss}
                className="p-2 hover:bg-white/10 rounded-lg transition-colors"
                aria-label="Close"
              >
                <X className="w-4 h-4 text-white" />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Verification Dialog */}
      <Dialog open={isVerificationOpen} onOpenChange={setIsVerificationOpen}>
        <DialogContent className="sm:max-w-md bg-[var(--campus-card-bg)] border-[var(--campus-border)]">
          <DialogHeader>
            <div className="mx-auto bg-[#00F5D4]/10 p-3 rounded-full mb-2">
              <ShieldCheck className="w-8 h-8 text-[#00F5D4]" />
            </div>
            <DialogTitle className="text-center text-[var(--campus-text-primary)]">Verify Completion</DialogTitle>
            <DialogDescription className="text-center text-[var(--campus-text-secondary)]">
              Ask the Task Master for the 4-digit OTP to confirm the job is done and release funds.
            </DialogDescription>
          </DialogHeader>
          
          <div className="flex flex-col items-center justify-center py-6 space-y-4">
            <InputOTP
              maxLength={4}
              value={otpValue}
              onChange={setOtpValue}
            >
              <InputOTPGroup>
                <InputOTPSlot index={0} className="border-[var(--campus-border)] text-[var(--campus-text-primary)]" />
                <InputOTPSlot index={1} className="border-[var(--campus-border)] text-[var(--campus-text-primary)]" />
                <InputOTPSlot index={2} className="border-[var(--campus-border)] text-[var(--campus-text-primary)]" />
                <InputOTPSlot index={3} className="border-[var(--campus-border)] text-[var(--campus-text-primary)]" />
              </InputOTPGroup>
            </InputOTP>
            
            {error && (
              <p className="text-red-500 text-sm animate-pulse">Incorrect OTP. Please try again.</p>
            )}
          </div>

          <DialogFooter className="sm:justify-center">
            <Button
              type="button"
              onClick={handleVerify}
              disabled={otpValue.length !== 4}
              className="w-full bg-[#00F5D4] text-black hover:bg-[#00F5D4]/90"
            >
              Verify Code
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}