
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Checkbox } from "@/components/ui/checkbox";
import { Slider } from "@/components/ui/slider";
import { Progress } from "@/components/ui/progress";
import { toast } from "sonner";

const ProfileSetup = () => {
  const navigate = useNavigate();
  const [currentStep, setCurrentStep] = useState(1);
  const [progress, setProgress] = useState(25);
  
  // Profile form data
  const [name, setName] = useState("");
  const [age, setAge] = useState("");
  const [experience, setExperience] = useState<string | undefined>();
  const [riskTolerance, setRiskTolerance] = useState(50); // Slider value 0-100
  const [investmentGoals, setInvestmentGoals] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const handleNextStep = () => {
    if (currentStep === 1 && (!name || !age)) {
      toast.error("Please fill out all fields");
      return;
    }

    if (currentStep === 2 && !experience) {
      toast.error("Please select your experience level");
      return;
    }

    if (currentStep === 4) {
      handleSubmitProfile();
      return;
    }

    setCurrentStep(currentStep + 1);
    setProgress((currentStep + 1) * 25);
  };

  const handlePreviousStep = () => {
    setCurrentStep(currentStep - 1);
    setProgress((currentStep - 1) * 25);
  };

  const handleInvestmentGoalToggle = (goal: string) => {
    if (investmentGoals.includes(goal)) {
      setInvestmentGoals(investmentGoals.filter(g => g !== goal));
    } else {
      setInvestmentGoals([...investmentGoals, goal]);
    }
  };

  const handleSubmitProfile = () => {
    setIsLoading(true);

    // Simulate API call to save profile
    setTimeout(() => {
      // Data that would be sent to your backend
      const profileData = {
        name,
        age: parseInt(age),
        experience,
        riskTolerance: riskTolerance < 33 ? "Low" : riskTolerance < 66 ? "Medium" : "High",
        investmentGoals,
        points: 10000, // Initial points for new users
        lastLoginDate: new Date().toISOString(),
      };

      console.log("Profile data to be saved:", profileData);
      
      toast.success("Profile setup complete! Welcome to LearnStocks");
      navigate("/home");
      setIsLoading(false);
    }, 1500);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-learngreen-50 p-4">
      <Card className="w-full max-w-lg">
        <CardHeader>
          <CardTitle className="text-2xl text-center">Profile Setup</CardTitle>
          <CardDescription className="text-center">
            Help us personalize your experience
          </CardDescription>
          <Progress value={progress} className="mt-4" />
        </CardHeader>
        
        <CardContent>
          {currentStep === 1 && (
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name">Full Name</Label>
                <Input 
                  id="name" 
                  value={name} 
                  onChange={(e) => setName(e.target.value)} 
                  placeholder="Your full name" 
                  required 
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="age">Age</Label>
                <Input 
                  id="age" 
                  type="number" 
                  value={age} 
                  onChange={(e) => setAge(e.target.value)} 
                  placeholder="Your age" 
                  min="18" 
                  max="100" 
                  required 
                />
              </div>
            </div>
          )}
          
          {currentStep === 2 && (
            <div className="space-y-4">
              <div>
                <h3 className="font-medium text-lg mb-3">Investment Experience</h3>
                <p className="text-gray-500 mb-4">Select your level of experience in stock market investing</p>
                
                <RadioGroup value={experience} onValueChange={setExperience}>
                  <div className="flex items-center space-x-2 mb-3">
                    <RadioGroupItem value="Beginner" id="beginner" />
                    <Label htmlFor="beginner" className="font-normal">Beginner - New to investing</Label>
                  </div>
                  <div className="flex items-center space-x-2 mb-3">
                    <RadioGroupItem value="Intermediate" id="intermediate" />
                    <Label htmlFor="intermediate" className="font-normal">Intermediate - Some investment experience</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="Advanced" id="advanced" />
                    <Label htmlFor="advanced" className="font-normal">Advanced - Experienced investor</Label>
                  </div>
                </RadioGroup>
              </div>
            </div>
          )}
          
          {currentStep === 3 && (
            <div className="space-y-6">
              <div>
                <h3 className="font-medium text-lg mb-3">Risk Tolerance</h3>
                <p className="text-gray-500 mb-4">How much risk are you comfortable taking?</p>
                
                <div className="space-y-4">
                  <Slider
                    defaultValue={[50]}
                    max={100}
                    step={1}
                    value={[riskTolerance]}
                    onValueChange={(value) => setRiskTolerance(value[0])}
                    className="mb-2"
                  />
                  <div className="flex justify-between text-sm">
                    <span>Low Risk</span>
                    <span>Medium Risk</span>
                    <span>High Risk</span>
                  </div>
                </div>
              </div>
            </div>
          )}
          
          {currentStep === 4 && (
            <div className="space-y-4">
              <h3 className="font-medium text-lg mb-3">Investment Goals</h3>
              <p className="text-gray-500 mb-4">Select all that apply to you</p>
              
              <div className="space-y-2">
                <div className="flex items-center space-x-2">
                  <Checkbox 
                    id="goal1" 
                    checked={investmentGoals.includes("Wealth Building")} 
                    onCheckedChange={() => handleInvestmentGoalToggle("Wealth Building")} 
                  />
                  <Label htmlFor="goal1" className="font-normal">Long-term wealth building</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <Checkbox 
                    id="goal2" 
                    checked={investmentGoals.includes("Retirement")} 
                    onCheckedChange={() => handleInvestmentGoalToggle("Retirement")} 
                  />
                  <Label htmlFor="goal2" className="font-normal">Retirement planning</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <Checkbox 
                    id="goal3" 
                    checked={investmentGoals.includes("Short Term Gains")} 
                    onCheckedChange={() => handleInvestmentGoalToggle("Short Term Gains")} 
                  />
                  <Label htmlFor="goal3" className="font-normal">Short-term gains</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <Checkbox 
                    id="goal4" 
                    checked={investmentGoals.includes("Learning")} 
                    onCheckedChange={() => handleInvestmentGoalToggle("Learning")} 
                  />
                  <Label htmlFor="goal4" className="font-normal">Learning about investments</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <Checkbox 
                    id="goal5" 
                    checked={investmentGoals.includes("Other")} 
                    onCheckedChange={() => handleInvestmentGoalToggle("Other")} 
                  />
                  <Label htmlFor="goal5" className="font-normal">Other goals</Label>
                </div>
              </div>
            </div>
          )}
        </CardContent>
        
        <CardFooter className="flex justify-between">
          <Button 
            variant="outline" 
            onClick={handlePreviousStep}
            disabled={currentStep === 1}
          >
            Back
          </Button>
          <Button 
            onClick={handleNextStep}
            className="bg-learngreen-600 hover:bg-learngreen-700"
            disabled={isLoading}
          >
            {currentStep === 4 
              ? (isLoading ? "Setting Up Your Account..." : "Complete Setup")
              : "Continue"}
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
};

export default ProfileSetup;
