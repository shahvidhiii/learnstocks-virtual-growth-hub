
import { useState } from "react";
import NavigationBar from "@/components/NavigationBar";
import StockCard from "@/components/StockCard";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Search as SearchIcon } from "lucide-react";
import { Stock } from "@/types";

// Mock data
const mockStocks: Stock[] = [
  // Reusing the mock stocks from Home.tsx
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
  // Add more stocks
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
    id: "WIPRO",
    symbol: "WIPRO",
    name: "Wipro Ltd.",
    price: 410,
    change: 3.75,
    changePercent: 0.92,
    volume: 4300000,
    marketCap: 2200000000,
    sector: "IT",
  },
];

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
  const [searchResults, setSearchResults] = useState<Stock[]>([]);
  const [hasSearched, setHasSearched] = useState(false);
  
  const handleSearch = () => {
    if (!searchQuery) return;
    
    // Filter stocks based on search query
    const results = mockStocks.filter((stock) => 
      stock.symbol.toLowerCase().includes(searchQuery.toLowerCase()) ||
      stock.name.toLowerCase().includes(searchQuery.toLowerCase())
    );
    
    setSearchResults(results);
    setHasSearched(true);
  };
  
  return (
    <div className="min-h-screen bg-gray-50">
      <NavigationBar />
      
      <main className="container mx-auto px-4 py-6">
        <h1 className="text-2xl font-bold mb-6">Search Investments</h1>
        
        {/* Search Bar */}
        <div className="bg-white rounded-lg shadow p-4 mb-6">
          <div className="flex gap-2">
            <Input
              placeholder="Search for stocks, mutual funds, ETFs..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleSearch()}
              className="flex-1"
            />
            <Button 
              onClick={handleSearch}
              className="bg-learngreen-600 hover:bg-learngreen-700"
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
                  <StockCard key={stock.id} stock={stock} />
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
        
        {/* Browse Categories */}
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <Tabs defaultValue="stocks">
            <TabsList className="w-full grid grid-cols-3">
              <TabsTrigger value="stocks">Stocks</TabsTrigger>
              <TabsTrigger value="mutual-funds">Mutual Funds</TabsTrigger>
              <TabsTrigger value="etfs">ETFs</TabsTrigger>
            </TabsList>
            
            <TabsContent value="stocks" className="p-4">
              <h3 className="font-medium mb-4">Popular Stocks</h3>
              <div className="grid gap-4">
                {mockStocks.slice(0, 5).map((stock) => (
                  <StockCard key={stock.id} stock={stock} />
                ))}
              </div>
              <Button variant="outline" className="w-full mt-4">View All Stocks</Button>
            </TabsContent>
            
            <TabsContent value="mutual-funds" className="p-4">
              <h3 className="font-medium mb-4">Popular Mutual Funds</h3>
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
