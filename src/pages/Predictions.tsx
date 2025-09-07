
import NavigationBar from "@/components/NavigationBar";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { TrendingUp, TrendingDown, BarChart2, ThumbsUp, AlertCircle, RefreshCw } from "lucide-react";
import { Prediction } from "@/types";
import { cn } from "@/lib/utils";
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import StockPriceCard from "@/components/StockPriceCard";

const DEFAULT_STOCKS = [
  'RELIANCE.NS', 'TCS.NS', 'INFY.NS', 'HDFCBANK.NS', 
  'ICICIBANK.NS', 'HINDUNILVR.NS', 'SBIN.NS', 'BHARTIARTL.NS'
];

interface StockPrice {
  symbol: string;
  name: string;
  price: number;
  change: number;
  changePercent: number;
}

const Predictions = () => {
  const [predictions, setPredictions] = useState<Prediction[]>([]);
  const [stockPrices, setStockPrices] = useState<StockPrice[]>([]);
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
    }
  };

  const fetchPredictions = async () => {
    try {
      setRefreshing(true);
      const { data, error } = await supabase.functions.invoke('stock-predictions', {
        body: {
          symbols: DEFAULT_STOCKS,
          days: 30
        }
      });

      if (error) {
        console.error('Error fetching predictions:', error);
        toast.error('Failed to fetch predictions');
        return;
      }

      if (data?.predictions) {
        setPredictions(data.predictions);
        toast.success('Predictions updated successfully');
      }
    } catch (error) {
      console.error('Error:', error);
      toast.error('Failed to fetch predictions');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const fetchAllData = async () => {
    setRefreshing(true);
    await Promise.all([fetchPredictions(), fetchStockPrices()]);
    setRefreshing(false);
  };

  useEffect(() => {
    fetchAllData();
    
    // Refresh stock prices every 2 minutes
    const interval = setInterval(fetchStockPrices, 120000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="min-h-screen bg-gray-50">
      <NavigationBar />
      
      <main className="container mx-auto px-4 py-6">
        <div className="flex justify-between items-center mb-2">
          <h1 className="text-2xl font-bold">Stock Predictions</h1>
          <Button 
            onClick={fetchAllData}
            disabled={refreshing}
            variant="outline"
            size="sm"
          >
            <RefreshCw className={cn("h-4 w-4 mr-2", refreshing && "animate-spin")} />
            {refreshing ? 'Updating...' : 'Refresh'}
          </Button>
        </div>
        <p className="text-gray-600 mb-6">
          AI-powered predictions based on real market data and technical analysis
        </p>
        
        {/* Current Stock Prices */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Live Stock Prices</CardTitle>
            <CardDescription>
              Real-time prices of major stocks (updates every 2 minutes)
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {stockPrices.map((stock) => (
                <StockPriceCard key={stock.symbol} stock={stock} />
              ))}
            </div>
          </CardContent>
        </Card>
        
        <div className="bg-learngreen-50 border border-learngreen-100 rounded-lg p-4 mb-6">
          <div className="flex items-start">
            <AlertCircle className="h-5 w-5 text-learngreen-600 mr-2 mt-0.5" />
            <div>
              <h3 className="font-medium text-learngreen-700">Disclaimer</h3>
              <p className="text-sm text-learngreen-600">
                These predictions are for educational purposes only. All investments involve risk.
                Past performance does not guarantee future results.
              </p>
            </div>
          </div>
        </div>
        
        {/* Predictions Tabs */}
        <Tabs defaultValue="all" className="w-full mb-8">
          <TabsList className="grid grid-cols-3 mb-6">
            <TabsTrigger value="all">All Predictions</TabsTrigger>
            <TabsTrigger value="bullish">Bullish</TabsTrigger>
            <TabsTrigger value="bearish">Bearish</TabsTrigger>
          </TabsList>
          
          <TabsContent value="all">
            {loading ? (
              <div className="grid md:grid-cols-2 gap-4">
                {[...Array(6)].map((_, i) => (
                  <Card key={i} className="animate-pulse">
                    <CardHeader className="pb-2">
                      <div className="h-4 bg-gray-200 rounded w-1/3"></div>
                      <div className="h-3 bg-gray-200 rounded w-2/3"></div>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-2">
                        <div className="h-3 bg-gray-200 rounded"></div>
                        <div className="h-3 bg-gray-200 rounded w-3/4"></div>
                        <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : (
              <div className="grid md:grid-cols-2 gap-4">
                {predictions.map((prediction) => (
                  <PredictionCard key={prediction.stockId} prediction={prediction} />
                ))}
              </div>
            )}
          </TabsContent>
          
          <TabsContent value="bullish">
            <div className="grid md:grid-cols-2 gap-4">
              {predictions
                .filter(p => p.predictedPrice > p.currentPrice)
                .map((prediction) => (
                  <PredictionCard key={prediction.stockId} prediction={prediction} />
                ))
              }
            </div>
          </TabsContent>
          
          <TabsContent value="bearish">
            <div className="grid md:grid-cols-2 gap-4">
              {predictions
                .filter(p => p.predictedPrice < p.currentPrice)
                .map((prediction) => (
                  <PredictionCard key={prediction.stockId} prediction={prediction} />
                ))
              }
            </div>
          </TabsContent>
        </Tabs>
        
        {/* AI Analysis */}
        <Card>
          <CardHeader>
            <CardTitle>Market Sentiment Analysis</CardTitle>
            <CardDescription>
              Overall market trend predictions based on AI analysis
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              <div className="flex items-center gap-4">
                <div className="bg-green-100 rounded-full p-3">
                  <ThumbsUp className="h-6 w-6 text-green-600" />
                </div>
                <div>
                  <h3 className="font-medium">Current Market Sentiment</h3>
                  <p className="text-sm text-gray-600">
                    The market is showing positive momentum with key sectors like Banking, IT, and Auto leading the gains.
                  </p>
                </div>
              </div>
              
              <div>
                <h3 className="font-medium mb-3">Sector Outlook</h3>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                  <div className="border rounded-lg p-3 text-center">
                    <div className="text-green-600 flex justify-center mb-1">
                      <TrendingUp className="h-5 w-5" />
                    </div>
                    <div className="font-medium">Banking</div>
                    <div className="text-xs text-gray-500">Strong Positive</div>
                  </div>
                  
                  <div className="border rounded-lg p-3 text-center">
                    <div className="text-amber-600 flex justify-center mb-1">
                      <BarChart2 className="h-5 w-5" />
                    </div>
                    <div className="font-medium">IT</div>
                    <div className="text-xs text-gray-500">Neutral</div>
                  </div>
                  
                  <div className="border rounded-lg p-3 text-center">
                    <div className="text-green-600 flex justify-center mb-1">
                      <TrendingUp className="h-5 w-5" />
                    </div>
                    <div className="font-medium">Pharma</div>
                    <div className="text-xs text-gray-500">Positive</div>
                  </div>
                  
                  <div className="border rounded-lg p-3 text-center">
                    <div className="text-red-600 flex justify-center mb-1">
                      <TrendingDown className="h-5 w-5" />
                    </div>
                    <div className="font-medium">Metal</div>
                    <div className="text-xs text-gray-500">Negative</div>
                  </div>
                </div>
              </div>
              
              <Button 
                className="w-full bg-learngreen-600 hover:bg-learngreen-700"
                onClick={fetchAllData}
                disabled={refreshing}
              >
                {refreshing ? 'Updating Analysis...' : 'Refresh Market Analysis'}
              </Button>
            </div>
          </CardContent>
        </Card>
      </main>
    </div>
  );
};

interface PredictionCardProps {
  prediction: Prediction;
}

const PredictionCard = ({ prediction }: PredictionCardProps) => {
  const isBullish = prediction.predictedPrice > prediction.currentPrice;
  const changePercent = ((prediction.predictedPrice - prediction.currentPrice) / prediction.currentPrice) * 100;
  const absChangePercent = Math.abs(changePercent);
  
  return (
    <Card>
      <CardHeader className="pb-2">
        <div className="flex justify-between">
          <div>
            <CardTitle>{prediction.symbol}</CardTitle>
            <CardDescription>{prediction.name}</CardDescription>
          </div>
          <Badge className={cn(
            isBullish ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"
          )}>
            {isBullish ? "Bullish" : "Bearish"}
          </Badge>
        </div>
      </CardHeader>
      <CardContent>
        <div className="flex justify-between mb-4">
          <div>
            <div className="text-sm text-gray-500">Current Price</div>
            <div className="font-medium">₹{prediction.currentPrice.toFixed(2)}</div>
          </div>
          <div className="text-center">
            <div className="text-sm text-gray-500">Predicted</div>
            <div className="font-medium">₹{prediction.predictedPrice.toFixed(2)}</div>
          </div>
          <div className="text-right">
            <div className="text-sm text-gray-500">Potential {isBullish ? "Gain" : "Loss"}</div>
            <div className={cn("font-semibold", isBullish ? "text-green-600" : "text-red-600")}>
              {isBullish ? "+" : ""}{changePercent.toFixed(2)}%
            </div>
          </div>
        </div>
        
        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span>Confidence</span>
            <span className="font-medium">{prediction.confidenceLevel}%</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div 
              className={cn(
                "h-2 rounded-full",
                prediction.confidenceLevel > 70 ? "bg-green-500" : 
                prediction.confidenceLevel > 50 ? "bg-amber-500" : "bg-red-500"
              )} 
              style={{ width: `${prediction.confidenceLevel}%` }}
            />
          </div>
        </div>
        
        <div className="mt-4">
          <div className="text-sm font-medium mb-2">Based on:</div>
          <ul className="list-disc list-inside text-sm text-gray-600 space-y-1">
            {prediction.reasonings.map((reason, index) => (
              <li key={index}>{reason}</li>
            ))}
          </ul>
        </div>
        
        <div className="mt-4 text-xs text-gray-500">
          Timeframe: {prediction.timeFrame}
        </div>
      </CardContent>
    </Card>
  );
};

export default Predictions;
