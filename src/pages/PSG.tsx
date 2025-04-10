
import React, { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import NavigationBar from "@/components/NavigationBar";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { Stock } from "@/types";
import { useNavigate } from "react-router-dom";
import { Loader2, ArrowUpCircle, ArrowDownCircle, TrendingUp, BarChart3 } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

const mockStocks: Stock[] = [
  {
    id: "RELIANCE",
    symbol: "RELIANCE",
    name: "Reliance Industries Ltd.",
    price: 2650,
    change: 45.50,
    changePercent: 1.75,
    volume: 7500000,
    marketCap: 17900000000,
    sector: "Energy",
  },
  {
    id: "TCS",
    symbol: "TCS",
    name: "Tata Consultancy Services Ltd.",
    price: 3250,
    change: 35.25,
    changePercent: 1.10,
    volume: 3200000,
    marketCap: 12000000000,
    sector: "IT",
  },
  {
    id: "INFY",
    symbol: "INFY",
    name: "Infosys Ltd.",
    price: 1450,
    change: -12.75,
    changePercent: -0.87,
    volume: 5100000,
    marketCap: 6100000000,
    sector: "IT",
  },
  {
    id: "HDFCBANK",
    symbol: "HDFCBANK",
    name: "HDFC Bank Ltd.",
    price: 1350,
    change: 17.25,
    changePercent: 1.29,
    volume: 3750000,
    marketCap: 7500000000,
    sector: "Banking",
  },
  {
    id: "ICICIBANK",
    symbol: "ICICIBANK",
    name: "ICICI Bank Ltd.",
    price: 920,
    change: -5.50,
    changePercent: -0.59,
    volume: 4200000,
    marketCap: 6400000000,
    sector: "Banking",
  },
];

interface UserProfileData {
  age?: number;
  experience?: string;
  riskTolerance?: string;
  investmentGoals?: string[];
  sectors?: string[];
}

const PSR = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(true);
  const [recommendations, setRecommendations] = useState<Stock[]>([]);
  const [userProfile, setUserProfile] = useState<UserProfileData>({});
  
  useEffect(() => {
    // Load data when component mounts
    const fetchData = async () => {
      if (!user) {
        toast.error("You need to log in to view recommendations");
        navigate("/login");
        return;
      }
      
      try {
        setIsLoading(true);
        
        // Fetch user profile data
        const { data: profileData, error: profileError } = await supabase
          .from('profiles')
          .select('age, experience, risk_tolerance, investment_goals')
          .eq('id', user.id)
          .single();
          
        if (profileError) {
          console.error("Error fetching profile:", profileError);
          toast.error("Failed to load your profile data");
          return;
        }
        
        // Fetch user sectors
        const { data: sectorData, error: sectorError } = await supabase
          .from('user_sectors')
          .select('sector')
          .eq('user_id', user.id);
          
        if (sectorError) {
          console.error("Error fetching sectors:", sectorError);
        }
        
        const sectors = sectorData?.map(item => item.sector) || [];
        
        setUserProfile({
          age: profileData?.age,
          experience: profileData?.experience,
          riskTolerance: profileData?.risk_tolerance,
          investmentGoals: profileData?.investment_goals || [],
          sectors: sectors
        });
        
        // Generate personalized recommendations
        const recommendedStocks = generateRecommendations(
          mockStocks, 
          profileData?.risk_tolerance || "Moderate",
          profileData?.experience || "Beginner",
          sectors
        );
        
        setRecommendations(recommendedStocks);
      } catch (err) {
        console.error("Error in fetchData:", err);
        toast.error("Something went wrong");
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchData();
  }, [user, navigate]);
  
  // Generate recommendations based on user profile
  const generateRecommendations = (
    stocks: Stock[], 
    riskTolerance: string, 
    experience: string,
    sectors: string[]
  ) => {
    // Filter by sectors if user has selected sectors
    let filteredStocks = stocks;
    if (sectors.length > 0) {
      filteredStocks = stocks.filter(stock => 
        sectors.includes(stock.sector)
      );
      
      // If no stocks match sectors, fall back to all stocks
      if (filteredStocks.length === 0) {
        filteredStocks = stocks;
      }
    }
    
    // Sort based on risk tolerance
    if (riskTolerance === "Conservative" || experience === "Beginner") {
      // For conservative or beginners, prefer stable stocks with low volatility
      filteredStocks.sort((a, b) => Math.abs(a.changePercent) - Math.abs(b.changePercent));
    } else if (riskTolerance === "Aggressive") {
      // For aggressive, prefer high volatility stocks with growth potential
      filteredStocks.sort((a, b) => Math.abs(b.changePercent) - Math.abs(a.changePercent));
    } else {
      // For moderate, prefer a mix
      filteredStocks.sort((a, b) => b.marketCap - a.marketCap);
    }
    
    return filteredStocks;
  };
  
  const getReasonForRecommendation = (stock: Stock) => {
    const reasons = [];
    
    if (userProfile.sectors?.includes(stock.sector)) {
      reasons.push(`Matches your interest in ${stock.sector}`);
    }
    
    if (userProfile.riskTolerance === "Conservative" && Math.abs(stock.changePercent) < 1) {
      reasons.push("Low volatility matches your conservative risk profile");
    } else if (userProfile.riskTolerance === "Aggressive" && stock.changePercent > 1) {
      reasons.push("Growth potential matches your aggressive risk profile");
    } else if (userProfile.riskTolerance === "Moderate") {
      reasons.push("Balanced risk-reward ratio");
    }
    
    if (stock.marketCap > 10000000000) {
      reasons.push("Large established company");
    }
    
    if (reasons.length === 0) {
      reasons.push("General market recommendation");
    }
    
    return reasons[0]; // Return the first reason
  };
  
  const getRiskLevel = (stock: Stock): "Low" | "Medium" | "High" => {
    const volatility = Math.abs(stock.changePercent);
    
    if (volatility < 1) return "Low";
    if (volatility < 2) return "Medium";
    return "High";
  };
  
  const getBadgeColor = (risk: "Low" | "Medium" | "High") => {
    switch (risk) {
      case "Low": return "bg-green-100 text-green-800";
      case "Medium": return "bg-yellow-100 text-yellow-800";
      case "High": return "bg-red-100 text-red-800";
      default: return "";
    }
  };
  
  return (
    <div className="min-h-screen bg-gray-50">
      <NavigationBar />
      
      <main className="container mx-auto px-4 py-6">
        <h1 className="text-2xl font-bold mb-6">Personal Stock Recommendations</h1>
        
        {isLoading ? (
          <div className="text-center py-12">
            <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4 text-learngreen-600" />
            <p>Analyzing your profile and generating recommendations...</p>
          </div>
        ) : (
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Your Investment Profile</CardTitle>
                <CardDescription>Recommendations are personalized based on this information</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="p-4 bg-gray-50 rounded-lg">
                    <p className="text-gray-500 text-sm">Risk Tolerance</p>
                    <p className="font-medium">{userProfile.riskTolerance || "Not specified"}</p>
                  </div>
                  <div className="p-4 bg-gray-50 rounded-lg">
                    <p className="text-gray-500 text-sm">Experience</p>
                    <p className="font-medium">{userProfile.experience || "Not specified"}</p>
                  </div>
                  <div className="p-4 bg-gray-50 rounded-lg">
                    <p className="text-gray-500 text-sm">Age</p>
                    <p className="font-medium">{userProfile.age || "Not specified"}</p>
                  </div>
                </div>
                
                <div className="mt-4">
                  <p className="text-gray-500 text-sm mb-2">Investment Goals</p>
                  <div className="flex flex-wrap gap-2">
                    {userProfile.investmentGoals && userProfile.investmentGoals.length > 0 ? (
                      userProfile.investmentGoals.map((goal) => (
                        <Badge key={goal} variant="outline">{goal}</Badge>
                      ))
                    ) : (
                      <p className="text-sm text-gray-500">No goals specified</p>
                    )}
                  </div>
                </div>
                
                <div className="mt-4">
                  <p className="text-gray-500 text-sm mb-2">Sectors of Interest</p>
                  <div className="flex flex-wrap gap-2">
                    {userProfile.sectors && userProfile.sectors.length > 0 ? (
                      userProfile.sectors.map((sector) => (
                        <Badge key={sector} className="bg-learngreen-100 text-learngreen-800 hover:bg-learngreen-200">{sector}</Badge>
                      ))
                    ) : (
                      <p className="text-sm text-gray-500">No sectors specified</p>
                    )}
                  </div>
                </div>
              </CardContent>
              <CardFooter>
                <Button 
                  variant="outline" 
                  className="w-full" 
                  onClick={() => navigate("/profile")}
                >
                  Update Profile
                </Button>
              </CardFooter>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle>
                  <div className="flex items-center">
                    <BarChart3 className="h-5 w-5 mr-2 text-learngreen-600" />
                    Recommended Stocks
                  </div>
                </CardTitle>
                <CardDescription>Based on your investment profile and interests</CardDescription>
              </CardHeader>
              <CardContent>
                {recommendations.length > 0 ? (
                  <div className="space-y-4">
                    {recommendations.map((stock) => {
                      const riskLevel = getRiskLevel(stock);
                      return (
                        <div key={stock.id} className="border rounded-lg p-4 hover:bg-gray-50 transition-colors">
                          <div className="flex justify-between items-start mb-2">
                            <div>
                              <h3 className="font-semibold text-lg">{stock.name}</h3>
                              <div className="flex items-center space-x-2">
                                <span className="text-sm font-medium">{stock.symbol}</span>
                                <Badge variant="outline">{stock.sector}</Badge>
                              </div>
                            </div>
                            <div className="text-right">
                              <div className="text-lg font-bold">₹{stock.price.toLocaleString()}</div>
                              <div className={`flex items-center ${stock.changePercent >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                                {stock.changePercent >= 0 ? (
                                  <ArrowUpCircle className="h-4 w-4 mr-1" />
                                ) : (
                                  <ArrowDownCircle className="h-4 w-4 mr-1" />
                                )}
                                <span>
                                  {Math.abs(stock.changePercent).toFixed(2)}%
                                </span>
                              </div>
                            </div>
                          </div>
                          
                          <div className="grid grid-cols-1 md:grid-cols-3 gap-2 mt-3">
                            <div>
                              <p className="text-xs text-gray-500">Why Recommended</p>
                              <p className="text-sm">{getReasonForRecommendation(stock)}</p>
                            </div>
                            <div>
                              <p className="text-xs text-gray-500">Market Cap</p>
                              <p className="text-sm">₹{(stock.marketCap / 1000000).toFixed(2)}M</p>
                            </div>
                            <div>
                              <p className="text-xs text-gray-500">Risk Level</p>
                              <Badge className={getBadgeColor(riskLevel)}>{riskLevel}</Badge>
                            </div>
                          </div>
                          
                          <div className="mt-3 flex justify-end">
                            <Button 
                              size="sm" 
                              className="bg-learngreen-600 hover:bg-learngreen-700"
                              onClick={() => navigate('/games', { state: { activeTab: 'simulator', selectedStock: stock.symbol } })}
                            >
                              <TrendingUp className="h-4 w-4 mr-1" /> Trade Now
                            </Button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <p>No recommendations available. Please update your profile.</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        )}
      </main>
    </div>
  );
};

export default PSR;
