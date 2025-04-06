
import { useState, useEffect } from "react";
import { 
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Coins } from "lucide-react";
import confetti from "canvas-confetti";

interface LoginRewardProps {
  isFirstLogin: boolean;
  lastLoginDate: string | null;
}

const LoginReward = ({ isFirstLogin, lastLoginDate }: LoginRewardProps) => {
  const [showReward, setShowReward] = useState(false);
  const [rewardAmount, setRewardAmount] = useState(0);
  
  useEffect(() => {
    // Check if user should get a login reward
    const checkLoginReward = () => {
      if (isFirstLogin) {
        setRewardAmount(10000);
        setShowReward(true);
        return;
      }
      
      if (!lastLoginDate) return;
      
      const lastLogin = new Date(lastLoginDate);
      const today = new Date();
      
      // Reset hours, minutes, seconds and milliseconds for date comparison
      lastLogin.setHours(0, 0, 0, 0);
      today.setHours(0, 0, 0, 0);
      
      // Check if last login was before today
      if (lastLogin < today) {
        setRewardAmount(200);
        setShowReward(true);
      }
    };
    
    // Show the reward after a short delay
    setTimeout(() => {
      checkLoginReward();
    }, 1000);
  }, [isFirstLogin, lastLoginDate]);
  
  const handleClaimReward = () => {
    // Trigger confetti animation
    confetti({
      particleCount: 100,
      spread: 70,
      origin: { y: 0.6 }
    });
    
    // Close dialog after a delay
    setTimeout(() => {
      setShowReward(false);
    }, 2000);
    
    // Here you'd update the user's points in a real app
    // updateUserPoints(rewardAmount);
  };

  return (
    <Dialog open={showReward} onOpenChange={setShowReward}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-center text-2xl">
            {isFirstLogin ? "Welcome Bonus!" : "Daily Login Reward!"}
          </DialogTitle>
          <DialogDescription className="text-center">
            {isFirstLogin 
              ? "Thanks for joining LearnStocks! Here's some virtual currency to start your journey."
              : "Thanks for coming back! Here's your daily login reward."}
          </DialogDescription>
        </DialogHeader>
        
        <div className="flex flex-col items-center justify-center py-6">
          <div className="bg-learngreen-100 p-4 rounded-full mb-4">
            <Coins className="h-12 w-12 text-learngreen-600" />
          </div>
          <div className="text-3xl font-bold text-learngreen-700 animate-pulse-green">
            +₹{rewardAmount}
          </div>
          <p className="text-gray-600 mt-2">
            {isFirstLogin 
              ? "Start investing with your virtual currency"
              : "Keep logging in daily for more rewards!"}
          </p>
        </div>
        
        <DialogFooter>
          <Button 
            onClick={handleClaimReward} 
            className="w-full bg-learngreen-600 hover:bg-learngreen-700"
          >
            Claim Reward
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default LoginReward;
