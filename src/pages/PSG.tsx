
import NavigationBar from "@/components/NavigationBar";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Info, ArrowUp, ArrowDown, RefreshCw } from "lucide-react";
import { StockSuggestion } from "@/types";
import { cn } from "@/lib/utils";

// Mock personalized stock suggestions
const mockSuggestions: StockSuggestion[] = [
  {
    stockId: "HDFCBANK",
    symbol: "HDFCBANK",
    name: "HDFC Bank Ltd.",
    currentPrice: 1350,
    reason: "Aligned with your risk preference (Medium) and consistent dividend history. Strong fundamentals make it a good long-term investment.",
    riskLevel: "Medium",
    potentialGain: 15.5,
  },
  {
    stockId: "SBIN",
    symbol: "SBIN",
    name: "State Bank of India",
    currentPrice: 520,
    reason: "Matches your interest in banking sector. Currently undervalued with strong potential for growth in the next 6-12 months.",
    riskLevel: "Medium",
    potentialGain: 18.2,
  },
  {
    stockId: "INFY",
    symbol: "INFY",
    name: "Infosys Ltd.",
    currentPrice: 1450,
    reason: "Fits your preference for stable growth stocks. Strong global presence and consistent performance make it ideal for your stated investment goals.",
    riskLevel: "Low",
    potentialGain: 12.8,
  },
  {
    stockId: "TATAMOTORS",
    symbol: "TATAMOTORS",
    name: "Tata Motors Ltd.",
    currentPrice: 545,
    reason: "Matches your interest in automotive sector and aligns with your higher risk tolerance preference for a portion of your portfolio.",
    riskLevel: "High",
    potentialGain: 25.3,
  },
];

const PSG = () => {
  // In a real app, we'd fetch user profile data from context/API
  const userProfile = {
    name: "John",
    riskTolerance: "Medium",
    experience: "Intermediate",
    investmentGoals: ["Long-term wealth building", "Learning about investments"],
  };
  
  return (
    <div className="min-h-screen bg-gray-50">
      <NavigationBar />
      
      <main className="container mx-auto px-4 py-6">
        <div className="flex justify-between items-start mb-6">
          <div>
            <h1 className="text-2xl font-bold mb-2">Personalized Stock Suggestions</h1>
            <p className="text-gray-600">
              Recommendations based on your profile and preferences
            </p>
          </div>
          <Button variant="outline" size="sm" className="flex items-center">
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh Suggestions
          </Button>
        </div>
        
        {/* User Profile Summary */}
        <Card className="mb-6">
          <CardHeader className="pb-2">
            <CardTitle>Your Investor Profile</CardTitle>
            <CardDescription>
              These suggestions are based on your profile information
            </CardDescription>
          </CardHeader>
          
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
              <div className="p-3 bg-gray-50 rounded-md">
                <div className="text-sm text-gray-500">Risk Tolerance</div>
                <div className="font-medium">{userProfile.riskTolerance}</div>
              </div>
              <div className="p-3 bg-gray-50 rounded-md">
                <div className="text-sm text-gray-500">Experience</div>
                <div className="font-medium">{userProfile.experience}</div>
              </div>
              <div className="p-3 bg-gray-50 rounded-md col-span-2">
                <div className="text-sm text-gray-500">Investment Goals</div>
                <div className="font-medium">{userProfile.investmentGoals.join(", ")}</div>
              </div>
            </div>
            
            <div className="flex items-center p-3 bg-learngreen-50 text-learngreen-700 rounded-md">
              <Info className="h-5 w-5 mr-2" />
              <div className="text-sm">
                Want more tailored suggestions? <a href="/profile-setup" className="underline font-medium">Update your profile</a>
              </div>
            </div>
          </CardContent>
        </Card>
        
        {/* Suggestions */}
        <h2 className="text-xl font-semibold mb-4">Suggested Stocks for You</h2>
        
        <div className="grid md:grid-cols-2 gap-4">
          {mockSuggestions.map((suggestion) => (
            <Card key={suggestion.stockId}>
              <CardHeader className="pb-2">
                <div className="flex justify-between">
                  <div>
                    <CardTitle>{suggestion.symbol}</CardTitle>
                    <CardDescription>{suggestion.name}</CardDescription>
                  </div>
                  <Badge className={cn(
                    suggestion.riskLevel === "Low" && "bg-green-100 text-green-700",
                    suggestion.riskLevel === "Medium" && "bg-amber-100 text-amber-700",
                    suggestion.riskLevel === "High" && "bg-red-100 text-red-700"
                  )}>
                    {suggestion.riskLevel} Risk
                  </Badge>
                </div>
              </CardHeader>
              
              <CardContent>
                <div className="flex justify-between mb-4">
                  <div>
                    <div className="text-sm text-gray-500">Current Price</div>
                    <div className="font-medium">₹{suggestion.currentPrice}</div>
                  </div>
                  <div className="text-right">
                    <div className="text-sm text-gray-500">Potential Gain</div>
                    <div className="text-green-600">+{suggestion.potentialGain.toFixed(1)}%</div>
                  </div>
                </div>
                
                <div className="p-3 bg-gray-50 rounded-md mb-4">
                  <div className="text-sm">
                    <span className="font-medium">Why this stock:</span> {suggestion.reason}
                  </div>
                </div>
                
                <div className="flex space-x-2">
                  <Button className="flex-1 bg-learngreen-600 hover:bg-learngreen-700">
                    View Details
                  </Button>
                  <Button variant="outline" className="flex-1">
                    Add to Watchlist
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
        
        {/* More Analysis */}
        <Card className="mt-8">
          <CardHeader>
            <CardTitle>Portfolio Recommendation</CardTitle>
            <CardDescription>
              Based on your profile, here's a suggested allocation
            </CardDescription>
          </CardHeader>
          
          <CardContent>
            <div className="grid grid-cols-3 gap-4 mb-6">
              <div className="p-3 border rounded-md text-center">
                <div className="font-medium text-xl mb-1">60%</div>
                <div className="text-sm text-gray-500">Low Risk Stocks</div>
                <div className="h-2 w-full bg-green-500 rounded-full mt-2" />
              </div>
              <div className="p-3 border rounded-md text-center">
                <div className="font-medium text-xl mb-1">30%</div>
                <div className="text-sm text-gray-500">Medium Risk Stocks</div>
                <div className="h-2 w-full bg-amber-500 rounded-full mt-2" />
              </div>
              <div className="p-3 border rounded-md text-center">
                <div className="font-medium text-xl mb-1">10%</div>
                <div className="text-sm text-gray-500">High Risk Stocks</div>
                <div className="h-2 w-full bg-red-500 rounded-full mt-2" />
              </div>
            </div>
            
            <Button className="w-full">View Detailed Portfolio Advice</Button>
          </CardContent>
        </Card>
      </main>
    </div>
  );
};

export default PSG;
