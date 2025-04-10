
import { useState, useEffect } from "react";
import NavigationBar from "@/components/NavigationBar";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Check, Info, TrendingUp, TrendingDown, ShieldCheck } from "lucide-react";
import { Stock, StockSuggestion } from "@/types";
import StockCard from "@/components/StockCard";
import { getPersonalizedRecommendations, getRiskLevel } from "@/utils/stockRecommender";
import { cn } from "@/lib/utils";

// Mock user profile - in a real app this would come from a user context or store
const mockUserProfile = {
  name: "Investor",
  age: 30,
  experience: "Intermediate" as const,
  riskTolerance: "Medium" as const,
  investmentHorizon: "medium-term" as const,
  sectorPreferences: ["Banking", "Technology"],
  currentPortfolio: ["INFY", "HDFCBANK"] // Stocks the user already owns
};

// Mock stocks data
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
    sector: "Technology",
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
    sector: "Technology",
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
  {
    id: "TATAMOTORS",
    symbol: "TATAMOTORS",
    name: "Tata Motors Ltd.",
    price: 545,
    change: 12.75,
    changePercent: 2.40,
    volume: 9800000,
    marketCap: 3300000000,
    sector: "Automotive",
  },
  {
    id: "BAJFINANCE",
    symbol: "BAJFINANCE",
    name: "Bajaj Finance Ltd.",
    price: 7120,
    change: -85.40,
    changePercent: -1.19,
    volume: 1900000,
    marketCap: 4300000000,
    sector: "Finance",
  },
  {
    id: "SUNPHARMA",
    symbol: "SUNPHARMA",
    name: "Sun Pharmaceutical Industries Ltd.",
    price: 1125,
    change: 22.80,
    changePercent: 2.07,
    volume: 2800000,
    marketCap: 5200000000,
    sector: "Pharmaceuticals",
  },
  {
    id: "ITC",
    symbol: "ITC",
    name: "ITC Ltd.",
    price: 395,
    change: 1.75,
    changePercent: 0.45,
    volume: 6200000,
    marketCap: 4900000000,
    sector: "FMCG",
  },
  {
    id: "HINDUNILVR",
    symbol: "HINDUNILVR",
    name: "Hindustan Unilever Ltd.",
    price: 2490,
    change: -12.40,
    changePercent: -0.50,
    volume: 1500000,
    marketCap: 5800000000,
    sector: "FMCG",
  },
];

// PSG - Personal Stock Guidance page
const PSG = () => {
  const [recommendations, setRecommendations] = useState<StockSuggestion[]>([]);
  const [selectedStock, setSelectedStock] = useState<StockSuggestion | null>(null);
  const [userPreferences, setUserPreferences] = useState({
    risk: mockUserProfile.riskTolerance,
    horizon: mockUserProfile.investmentHorizon,
    sectors: mockUserProfile.sectorPreferences,
  });
  
  useEffect(() => {
    // Generate recommendations based on user profile
    generateRecommendations();
  }, [userPreferences]);
  
  const generateRecommendations = () => {
    // Use our new recommendation engine
    const recResults = getPersonalizedRecommendations(mockStocks, {
      risk: userPreferences.risk as 'Low' | 'Medium' | 'High',
      horizon: userPreferences.horizon as 'short-term' | 'medium-term' | 'long-term',
      sectors: userPreferences.sectors,
      currentPortfolio: mockUserProfile.currentPortfolio,
      age: mockUserProfile.age
    });
    
    // Convert to StockSuggestion type for compatibility with existing UI
    const suggestions: StockSuggestion[] = recResults.map(rec => {
      const potentialGain = rec.stock.change > 0 
        ? rec.stock.changePercent 
        : rec.score > 3 ? 5 + Math.random() * 10 : 2 + Math.random() * 5;
      
      return {
        stockId: rec.stock.id,
        symbol: rec.stock.symbol,
        name: rec.stock.name,
        currentPrice: rec.stock.price,
        reason: rec.reasonings[0] || "Based on your investment profile",
        riskLevel: getRiskLevel(rec.stock),
        potentialGain: parseFloat(potentialGain.toFixed(2)),
        score: rec.score,
        reasonings: rec.reasonings
      };
    });
    
    setRecommendations(suggestions);
  };
  
  const handleStockSelect = (stock: StockSuggestion) => {
    setSelectedStock(stock);
  };
  
  return (
    <div className="min-h-screen bg-gray-50">
      <NavigationBar />
      
      <main className="container mx-auto px-4 py-6">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold">Personal Stock Guidance</h1>
            <p className="text-gray-600">Stock recommendations tailored to your profile</p>
          </div>
          
          <Button 
            variant="outline" 
            className="mt-2 md:mt-0"
            onClick={generateRecommendations}
          >
            Refresh Recommendations
          </Button>
        </div>
        
        {/* User Profile Summary */}
        <Card className="mb-6">
          <CardHeader className="pb-2">
            <CardTitle>Your Investment Profile</CardTitle>
            <CardDescription>
              Recommendations are based on these preferences
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-gray-50 p-4 rounded-md">
                <div className="text-sm text-gray-500">Risk Tolerance</div>
                <div className="flex items-center mt-1">
                  <div className={cn(
                    "w-3 h-3 rounded-full mr-2",
                    userPreferences.risk === "Low" ? "bg-green-500" : 
                    userPreferences.risk === "Medium" ? "bg-amber-500" : "bg-red-500"
                  )}></div>
                  <div className="font-medium">{userPreferences.risk}</div>
                </div>
              </div>
              
              <div className="bg-gray-50 p-4 rounded-md">
                <div className="text-sm text-gray-500">Investment Horizon</div>
                <div className="font-medium mt-1">
                  {userPreferences.horizon === "short-term" ? "Short Term (< 1 year)" :
                   userPreferences.horizon === "medium-term" ? "Medium Term (1-5 years)" :
                   "Long Term (5+ years)"}
                </div>
              </div>
              
              <div className="bg-gray-50 p-4 rounded-md">
                <div className="text-sm text-gray-500">Sector Preferences</div>
                <div className="flex flex-wrap gap-1 mt-1">
                  {userPreferences.sectors.map(sector => (
                    <Badge key={sector} variant="outline">{sector}</Badge>
                  ))}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
        
        {/* Recommendations Tabs */}
        <Tabs defaultValue="all" className="mb-6">
          <TabsList className="mb-4">
            <TabsTrigger value="all">All Recommendations</TabsTrigger>
            <TabsTrigger value="low-risk">Low Risk</TabsTrigger>
            <TabsTrigger value="high-potential">High Potential</TabsTrigger>
          </TabsList>
          
          <TabsContent value="all">
            <div className="grid gap-4">
              {recommendations.map((stock) => (
                <RecommendationCard 
                  key={stock.stockId} 
                  recommendation={stock} 
                  onSelect={() => handleStockSelect(stock)}
                />
              ))}
              
              {recommendations.length === 0 && (
                <div className="text-center py-8">
                  <p className="text-gray-500">No recommendations available. Try adjusting your preferences.</p>
                </div>
              )}
            </div>
          </TabsContent>
          
          <TabsContent value="low-risk">
            <div className="grid gap-4">
              {recommendations
                .filter(stock => stock.riskLevel === "Low")
                .map((stock) => (
                  <RecommendationCard 
                    key={stock.stockId} 
                    recommendation={stock} 
                    onSelect={() => handleStockSelect(stock)}
                  />
                ))
              }
              
              {recommendations.filter(stock => stock.riskLevel === "Low").length === 0 && (
                <div className="text-center py-8">
                  <p className="text-gray-500">No low-risk recommendations available.</p>
                </div>
              )}
            </div>
          </TabsContent>
          
          <TabsContent value="high-potential">
            <div className="grid gap-4">
              {recommendations
                .filter(stock => stock.potentialGain > 5)
                .map((stock) => (
                  <RecommendationCard 
                    key={stock.stockId} 
                    recommendation={stock} 
                    onSelect={() => handleStockSelect(stock)}
                  />
                ))
              }
              
              {recommendations.filter(stock => stock.potentialGain > 5).length === 0 && (
                <div className="text-center py-8">
                  <p className="text-gray-500">No high-potential recommendations available.</p>
                </div>
              )}
            </div>
          </TabsContent>
        </Tabs>
        
        {/* Selected Stock Dialog */}
        {selectedStock && (
          <Dialog>
            <DialogTrigger asChild>
              <Button variant="outline" className="hidden">Open Dialog</Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[500px]">
              <DialogHeader>
                <DialogTitle>{selectedStock.name} ({selectedStock.symbol})</DialogTitle>
              </DialogHeader>
              
              <div className="space-y-4 py-4">
                <div className="flex justify-between">
                  <div>Current Price</div>
                  <div className="font-semibold">₹{selectedStock.currentPrice}</div>
                </div>
                
                <div>
                  <div className="mb-2">Why we recommend this stock:</div>
                  <ul className="list-disc list-inside space-y-1">
                    {selectedStock.reasonings?.map((reason, index) => (
                      <li key={index} className="text-sm text-gray-600">{reason}</li>
                    ))}
                  </ul>
                </div>
                
                <div className="flex items-center">
                  <ShieldCheck className={cn(
                    "mr-2 h-4 w-4",
                    selectedStock.riskLevel === "Low" ? "text-green-500" : 
                    selectedStock.riskLevel === "Medium" ? "text-amber-500" : "text-red-500"
                  )} />
                  <span className="text-sm">
                    {selectedStock.riskLevel} Risk Level
                  </span>
                </div>
                
                <div className="flex items-center">
                  <TrendingUp className="mr-2 h-4 w-4 text-green-500" />
                  <span className="text-sm">
                    Potential Gain: +{selectedStock.potentialGain}% (estimated)
                  </span>
                </div>
                
                <div className="bg-learngreen-50 p-3 rounded-md text-sm text-learngreen-700 flex items-start">
                  <Info className="h-4 w-4 mr-2 mt-0.5 text-learngreen-500" />
                  <div>
                    This is a simulated recommendation. Always do your own research before investing.
                  </div>
                </div>
              </div>
              
              <div className="flex justify-end gap-2">
                <Button variant="outline">Add to Watchlist</Button>
                <Button>Invest (Simulation)</Button>
              </div>
            </DialogContent>
          </Dialog>
        )}
      </main>
    </div>
  );
};

interface RecommendationCardProps {
  recommendation: StockSuggestion;
  onSelect: () => void;
}

const RecommendationCard = ({ recommendation, onSelect }: RecommendationCardProps) => {
  return (
    <Card className="hover:shadow-md transition-shadow cursor-pointer" onClick={onSelect}>
      <CardContent className="p-4">
        <div className="flex justify-between items-start">
          <div>
            <div className="font-medium text-lg">{recommendation.symbol}</div>
            <div className="text-sm text-gray-600">{recommendation.name}</div>
            
            <div className="mt-2">
              <Badge className={cn(
                "inline-flex items-center text-xs",
                recommendation.riskLevel === "Low" ? "bg-green-100 text-green-800" : 
                recommendation.riskLevel === "Medium" ? "bg-amber-100 text-amber-800" : 
                "bg-red-100 text-red-800"
              )}>
                {recommendation.riskLevel} Risk
              </Badge>
            </div>
          </div>
          
          <div className="text-right">
            <div className="font-medium">₹{recommendation.currentPrice}</div>
            <div className="text-green-600 flex items-center justify-end text-sm">
              <TrendingUp className="h-3 w-3 mr-1" />
              <span>+{recommendation.potentialGain}%</span>
            </div>
          </div>
        </div>
        
        <div className="mt-3">
          <div className="text-xs text-gray-500">Why recommended:</div>
          <div className="text-sm flex items-center mt-1">
            <Check className="h-3 w-3 mr-1 text-green-500" />
            {recommendation.reason}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default PSG;

