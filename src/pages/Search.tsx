import { useState, useEffect } from "react";
import NavigationBar from "@/components/NavigationBar";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Search as SearchIcon, RefreshCw } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { cn } from "@/lib/utils";
import StockPriceCard from "@/components/StockPriceCard";

const DEFAULT_STOCKS = [
  'RELIANCE.NS', 'TCS.NS', 'INFY.NS', 'HDFCBANK.NS', 
  'ICICIBANK.NS', 'HINDUNILVR.NS', 'SBIN.NS', 'BHARTIARTL.NS',
  'ITC.NS', 'KOTAKBANK.NS'
];

interface StockPrice {
  symbol: string;
  name: string;
  price: number;
  change: number;
  changePercent: number;
}

const mockMutualFunds = [
  {
    id: "HDFC_MIDCAP",
    symbol: "HDFCMIDCAP",
    name: "HDFC Mid-Cap Opportunities Fund",
    price: 92.45,
    change: 0.75,
    changePercent: 0.82,
    category: "Mid Cap",
    riskLevel: "Moderate",
  },
  {
    id: "AXIS_BLUECHIP",
    symbol: "AXISBLUECHIP",
    name: "Axis Bluechip Fund",
    price: 45.20,
    change: 0.32,
    changePercent: 0.71,
    category: "Large Cap",
    riskLevel: "Low",
  },
  {
    id: "MIRAE_EMERGING",
    symbol: "MIRAEEMERG",
    name: "Mirae Asset Emerging Bluechip Fund",
    price: 87.50,
    change: -0.42,
    changePercent: -0.48,
    category: "Large & Mid Cap",
    riskLevel: "Moderate",
  },
];

const mockETFs = [
  {
    id: "NIFTYBEES",
    symbol: "NIFTYBEES",
    name: "Nippon India ETF Nifty BeES",
    price: 213.75,
    change: 1.25,
    changePercent: 0.59,
    category: "Index ETF",
    aum: "3200 Cr",
  },
  {
    id: "BANKBEES",
    symbol: "BANKBEES",
    name: "Nippon India ETF Bank BeES",
    price: 378.90,
    change: -2.30,
    changePercent: -0.60,
    category: "Sectoral ETF",
    aum: "1520 Cr",
  },
];

const Search = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [stockPrices, setStockPrices] = useState<StockPrice[]>([]);
  const [searchResults, setSearchResults] = useState<StockPrice[]>([]);
  const [hasSearched, setHasSearched] = useState(false);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchStockPrices = async () => {
    try {
      const { data, error } = await supabase.functions.invoke('stock-prices', {
        body: {
          symbols: DEFAULT_STOCKS
        }
      });

      if (error) {
        console.error('Error fetching stock prices:', error);
        return;
      }

      if (data?.prices) {
        setStockPrices(data.prices);
      }
    } catch (error) {
      console.error('Error fetching stock prices:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await fetchStockPrices();
    setRefreshing(false);
  };

  const handleSearch = () => {
    if (!searchQuery) return;
    
    // Filter stocks based on search query
    const results = stockPrices.filter((stock) => 
      stock.symbol.toLowerCase().includes(searchQuery.toLowerCase()) ||
      stock.name.toLowerCase().includes(searchQuery.toLowerCase())
    );
    
    setSearchResults(results);
    setHasSearched(true);
  };

  useEffect(() => {
    fetchStockPrices();
    
    // Refresh stock prices every 2 minutes
    const interval = setInterval(fetchStockPrices, 120000);
    return () => clearInterval(interval);
  }, []);
  
  return (
    <div className="min-h-screen bg-gray-50">
      <NavigationBar />
      
      <main className="container mx-auto px-4 py-6">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold">Search Investments</h1>
          <Button 
            onClick={handleRefresh}
            disabled={refreshing}
            variant="outline"
            size="sm"
          >
            <RefreshCw className={cn("h-4 w-4 mr-2", refreshing && "animate-spin")} />
            {refreshing ? 'Updating...' : 'Refresh'}
          </Button>
        </div>
        
        {/* Search Bar */}
        <div className="bg-white rounded-lg shadow p-4 mb-6">
          <div className="flex gap-2">
            <Input
              placeholder="Search for stocks by symbol or name..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleSearch()}
              className="flex-1"
            />
            <Button 
              onClick={handleSearch}
              className="bg-learngreen-600 hover:bg-learngreen-700"
              disabled={loading}
            >
              <SearchIcon className="h-4 w-4 mr-2" /> Search
            </Button>
          </div>
        </div>
        
        {/* Search Results */}
        {hasSearched && (
          <div className="mb-8">
            <h2 className="text-xl font-semibold mb-4">Search Results</h2>
            
            {searchResults.length > 0 ? (
              <div className="grid gap-4">
                {searchResults.map((stock) => (
                  <StockPriceCard key={stock.symbol} stock={stock} />
                ))}
              </div>
            ) : (
              <div className="text-center p-8 bg-white rounded-lg shadow">
                <div className="text-gray-500">No results found for "{searchQuery}"</div>
                <div className="text-sm text-gray-400 mt-2">Try another search term or browse categories below</div>
              </div>
            )}
          </div>
        )}
        
        {/* Live Stock Prices */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Live Stock Prices</CardTitle>
            <CardDescription>
              Real-time prices of major stocks (updates every 2 minutes)
            </CardDescription>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {[...Array(8)].map((_, i) => (
                  <Card key={i} className="animate-pulse">
                    <CardContent className="p-4">
                      <div className="space-y-2">
                        <div className="h-4 bg-gray-200 rounded w-2/3"></div>
                        <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                        <div className="h-3 bg-gray-200 rounded w-1/3"></div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {stockPrices.map((stock) => (
                  <StockPriceCard key={stock.symbol} stock={stock} />
                ))}
              </div>
            )}
          </CardContent>
        </Card>
        
        {/* Browse Categories */}
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <Tabs defaultValue="stocks">
            <TabsList className="w-full grid grid-cols-3">
              <TabsTrigger value="stocks">Stocks</TabsTrigger>
              <TabsTrigger value="mutual-funds">Mutual Funds</TabsTrigger>
              <TabsTrigger value="etfs">ETFs</TabsTrigger>
            </TabsList>
            
            <TabsContent value="stocks" className="p-4">
              <h3 className="font-medium mb-4">Popular Stocks (Real-time Data)</h3>
              <div className="grid gap-4">
                {loading ? (
                  [...Array(5)].map((_, i) => (
                    <Card key={i} className="animate-pulse">
                      <CardContent className="p-4">
                        <div className="space-y-2">
                          <div className="h-4 bg-gray-200 rounded"></div>
                          <div className="h-3 bg-gray-200 rounded w-3/4"></div>
                        </div>
                      </CardContent>
                    </Card>
                  ))
                ) : (
                  stockPrices.slice(0, 5).map((stock) => (
                    <StockPriceCard key={stock.symbol} stock={stock} />
                  ))
                )}
              </div>
              <Button 
                variant="outline" 
                className="w-full mt-4"
                onClick={() => setHasSearched(false)}
              >
                View All Stocks Above
              </Button>
            </TabsContent>
            
            <TabsContent value="mutual-funds" className="p-4">
              <h3 className="font-medium mb-4">Popular Mutual Funds</h3>
              <p className="text-sm text-gray-500 mb-4">
                Note: Mutual fund data is currently static. Real-time integration coming soon.
              </p>
              <div className="grid gap-4">
                {mockMutualFunds.map((fund) => (
                  <div key={fund.id} className="border p-4 rounded-lg">
                    <div className="flex justify-between items-start">
                      <div>
                        <h4 className="font-medium">{fund.name}</h4>
                        <div className="text-sm text-gray-500">{fund.category} | Risk: {fund.riskLevel}</div>
                      </div>
                      <div className="text-right">
                        <div className="font-medium">₹{fund.price}</div>
                        <div className={fund.change >= 0 ? "text-green-600" : "text-red-600"}>
                          {fund.change >= 0 ? "+" : ""}{fund.changePercent.toFixed(2)}%
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
              <Button variant="outline" className="w-full mt-4">View All Mutual Funds</Button>
            </TabsContent>
            
            <TabsContent value="etfs" className="p-4">
              <h3 className="font-medium mb-4">Popular ETFs</h3>
              <p className="text-sm text-gray-500 mb-4">
                Note: ETF data is currently static. Real-time integration coming soon.
              </p>
              <div className="grid gap-4">
                {mockETFs.map((etf) => (
                  <div key={etf.id} className="border p-4 rounded-lg">
                    <div className="flex justify-between items-start">
                      <div>
                        <h4 className="font-medium">{etf.name}</h4>
                        <div className="text-sm text-gray-500">{etf.category} | AUM: {etf.aum}</div>
                      </div>
                      <div className="text-right">
                        <div className="font-medium">₹{etf.price}</div>
                        <div className={etf.change >= 0 ? "text-green-600" : "text-red-600"}>
                          {etf.change >= 0 ? "+" : ""}{etf.changePercent.toFixed(2)}%
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
              <Button variant="outline" className="w-full mt-4">View All ETFs</Button>
            </TabsContent>
          </Tabs>
        </div>
      </main>
    </div>
  );
};

export default Search;