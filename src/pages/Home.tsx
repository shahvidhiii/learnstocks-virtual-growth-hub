import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import NavigationBar from "@/components/NavigationBar";
import StockCard from "@/components/StockCard";
import { PortfolioChart } from "@/components/PortfolioChart";
import LoginReward from "@/components/LoginReward";
import { Stock, Portfolio } from "@/types";
import { Coins, Briefcase, ArrowUp, ArrowDown } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";

const mockPortfolio: Portfolio = {
  userId: "user1",
  cash: 5000,
  holdings: [
    {
      stockId: "RELIANCE",
      symbol: "RELIANCE",
      name: "Reliance Industries Ltd.",
      quantity: 10,
      avgBuyPrice: 2500,
      currentPrice: 2650,
      value: 26500,
      change: 1500,
      changePercent: 6.00,
    },
    {
      stockId: "TCS",
      symbol: "TCS",
      name: "Tata Consultancy Services Ltd.",
      quantity: 5,
      avgBuyPrice: 3200,
      currentPrice: 3250,
      value: 16250,
      change: 250,
      changePercent: 1.56,
    },
    {
      stockId: "HDFC",
      symbol: "HDFCBANK",
      name: "HDFC Bank Ltd.",
      quantity: 15,
      avgBuyPrice: 1400,
      currentPrice: 1350,
      value: 20250,
      change: -750,
      changePercent: -3.57,
    },
  ],
  totalValue: 68000,
  dailyChange: 1200,
  dailyChangePercent: 1.79,
};

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

const Home = () => {
  const [isFirstLogin, setIsFirstLogin] = useState(false);
  const [lastLoginDate, setLastLoginDate] = useState<string | null>(null);
  const [userPoints, setUserPoints] = useState(0);
  const [portfolio, setPortfolio] = useState<Portfolio>(mockPortfolio);
  const [trendingStocks, setTrendingStocks] = useState<Stock[]>(mockStocks);
  const [selectedTab, setSelectedTab] = useState("portfolio");
  const [isLoading, setIsLoading] = useState(true);
  const { user } = useAuth();
  
  const fetchUserData = async () => {
    if (!user) return;
    
    try {
      setIsLoading(true);
      const { data, error } = await supabase
        .from('profiles')
        .select('points, last_login_date, profile_completed')
        .eq('id', user.id)
        .single();
      
      if (error) {
        console.error("Error fetching user data:", error);
        toast.error("Failed to load your profile data");
        return;
      }
      
      if (data) {
        setUserPoints(data.points || 10000);
        setLastLoginDate(data.last_login_date);
        setIsFirstLogin(!data.profile_completed);
      }
    } catch (err) {
      console.error("Error in fetchUserData:", err);
    } finally {
      setIsLoading(false);
    }
  };
  
  useEffect(() => {
    fetchUserData();
    
    if (user) {
      const pointsChannel = supabase
        .channel('profile-changes')
        .on('postgres_changes', 
          {
            event: 'UPDATE',
            schema: 'public',
            table: 'profiles',
            filter: `id=eq.${user.id}`
          }, 
          (payload) => {
            if (payload.new && payload.new.points) {
              setUserPoints(payload.new.points);
            }
          }
        )
        .subscribe();
      
      return () => {
        supabase.removeChannel(pointsChannel);
      };
    }
  }, [user]);
  
  return (
    <div className="min-h-screen bg-gray-50">
      <NavigationBar />
      
      <LoginReward isFirstLogin={isFirstLogin} lastLoginDate={lastLoginDate} />
      
      <main className="container mx-auto px-4 py-6">
        <div className="mb-6 bg-white rounded-lg shadow p-4 flex justify-between items-center">
          <div className="flex items-center">
            <div className="bg-learngreen-100 p-3 rounded-full mr-4">
              <Coins className="h-6 w-6 text-learngreen-600" />
            </div>
            <div>
              <h2 className="text-xl font-semibold">Your Balance</h2>
              <p className="text-3xl font-bold text-learngreen-700">{isLoading ? "Loading..." : `₹${userPoints.toLocaleString()}`}</p>
            </div>
          </div>
          <Button className="bg-learngreen-600 hover:bg-learngreen-700">Add More Points</Button>
        </div>
        
        <div className="mb-6">
          <Tabs 
            value={selectedTab} 
            onValueChange={setSelectedTab}
            className="w-full"
          >
            <TabsList className="grid grid-cols-2 mb-6">
              <TabsTrigger value="portfolio">Portfolio</TabsTrigger>
              <TabsTrigger value="trading">Trading</TabsTrigger>
            </TabsList>
            
            <TabsContent value="portfolio" className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <PortfolioChart
                  title="Portfolio Value"
                  value={portfolio.totalValue}
                  change={portfolio.dailyChange}
                  changePercent={portfolio.dailyChangePercent}
                />
                
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle>Available Cash</CardTitle>
                    <div className="text-2xl font-bold">₹{portfolio.cash.toFixed(2)}</div>
                    <div className="text-sm text-gray-500">Available for trading</div>
                  </CardHeader>
                  <CardContent className="pt-0">
                    <Button className="w-full bg-learngreen-600 hover:bg-learngreen-700 mt-2">Trade Now</Button>
                  </CardContent>
                </Card>
                
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle>Holdings</CardTitle>
                    <div className="text-2xl font-bold">{portfolio.holdings.length}</div>
                    <div className="text-sm text-gray-500">Stocks in portfolio</div>
                  </CardHeader>
                  <CardContent className="pt-0">
                    <Button variant="outline" className="w-full mt-2">View Details</Button>
                  </CardContent>
                </Card>
              </div>
              
              <Card>
                <CardHeader>
                  <CardTitle>Your Holdings</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {portfolio.holdings.map((holding) => (
                      <div key={holding.stockId} className="flex justify-between items-center p-3 border rounded-md">
                        <div>
                          <div className="font-medium">{holding.symbol}</div>
                          <div className="text-sm text-gray-500">{holding.name}</div>
                        </div>
                        <div className="text-center">
                          <div className="font-medium">{holding.quantity} shares</div>
                          <div className="text-sm text-gray-500">Avg: ₹{holding.avgBuyPrice}</div>
                        </div>
                        <div className="text-right">
                          <div className="font-medium">₹{holding.value.toFixed(2)}</div>
                          <div className={holding.change >= 0 ? "text-green-600" : "text-red-600"}>
                            {holding.change >= 0 ? (
                              <span className="flex items-center">
                                <ArrowUp className="h-3 w-3 mr-1" />
                                {holding.changePercent.toFixed(2)}%
                              </span>
                            ) : (
                              <span className="flex items-center">
                                <ArrowDown className="h-3 w-3 mr-1" />
                                {Math.abs(holding.changePercent).toFixed(2)}%
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
            
            <TabsContent value="trading" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Stock Market</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex justify-between items-center mb-4">
                    <h3 className="font-medium text-lg">Trending Stocks</h3>
                    <Button variant="outline" size="sm">View All</Button>
                  </div>
                  
                  <ScrollArea className="h-[400px] pr-4">
                    <div className="space-y-3">
                      {trendingStocks.map((stock) => (
                        <StockCard
                          key={stock.id}
                          stock={stock}
                          onSelect={(stock) => {
                            console.log("Selected stock:", stock);
                          }}
                        />
                      ))}
                    </div>
                  </ScrollArea>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader>
                  <CardTitle>Recent Trades</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-center py-8 text-gray-500">
                    <Briefcase className="h-12 w-12 mx-auto mb-2 opacity-30" />
                    <p>You haven't made any trades yet.</p>
                    <p className="mt-1">Start trading to see your history here!</p>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </main>
    </div>
  );
};

export default Home;
