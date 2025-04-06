
import NavigationBar from "@/components/NavigationBar";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { TrendingUp, TrendingDown, BarChart2, ThumbsUp, AlertCircle } from "lucide-react";
import { Prediction } from "@/types";
import { cn } from "@/lib/utils";

// Mock predictions
const mockPredictions: Prediction[] = [
  {
    stockId: "RELIANCE",
    symbol: "RELIANCE",
    name: "Reliance Industries Ltd.",
    currentPrice: 2650,
    predictedPrice: 2850,
    confidenceLevel: 75,
    timeFrame: "1 month",
    reasonings: [
      "Strong revenue growth in retail segment",
      "Expansion of digital services",
      "Positive market sentiment",
    ],
  },
  {
    stockId: "INFY",
    symbol: "INFY",
    name: "Infosys Ltd.",
    currentPrice: 1450,
    predictedPrice: 1380,
    confidenceLevel: 65,
    timeFrame: "2 weeks",
    reasonings: [
      "Pressure on IT spending due to global economic concerns",
      "Reduced profit margin projections",
      "Increasing competition in the sector",
    ],
  },
  {
    stockId: "ICICIBANK",
    symbol: "ICICIBANK",
    name: "ICICI Bank Ltd.",
    currentPrice: 920,
    predictedPrice: 980,
    confidenceLevel: 80,
    timeFrame: "3 weeks",
    reasonings: [
      "Strong loan growth in retail segment",
      "Improving asset quality metrics",
      "Favorable interest rate environment",
    ],
  },
  {
    stockId: "TATAMOTORS",
    symbol: "TATAMOTORS",
    name: "Tata Motors Ltd.",
    currentPrice: 545,
    predictedPrice: 590,
    confidenceLevel: 70,
    timeFrame: "1 month",
    reasonings: [
      "Increasing demand for EV models",
      "Recovery in global automotive market",
      "New product launches planned",
    ],
  },
];

const Predictions = () => {
  return (
    <div className="min-h-screen bg-gray-50">
      <NavigationBar />
      
      <main className="container mx-auto px-4 py-6">
        <h1 className="text-2xl font-bold mb-2">Stock Predictions</h1>
        <p className="text-gray-600 mb-6">
          AI-powered predictions to help guide your investment decisions
        </p>
        
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
            <div className="grid md:grid-cols-2 gap-4">
              {mockPredictions.map((prediction) => (
                <PredictionCard key={prediction.stockId} prediction={prediction} />
              ))}
            </div>
          </TabsContent>
          
          <TabsContent value="bullish">
            <div className="grid md:grid-cols-2 gap-4">
              {mockPredictions
                .filter(p => p.predictedPrice > p.currentPrice)
                .map((prediction) => (
                  <PredictionCard key={prediction.stockId} prediction={prediction} />
                ))
              }
            </div>
          </TabsContent>
          
          <TabsContent value="bearish">
            <div className="grid md:grid-cols-2 gap-4">
              {mockPredictions
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
              
              <Button className="w-full bg-learngreen-600 hover:bg-learngreen-700">
                View Detailed Market Analysis
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
            <div className="font-medium">₹{prediction.currentPrice}</div>
          </div>
          <div className="text-center">
            <div className="text-sm text-gray-500">Predicted</div>
            <div className="font-medium">₹{prediction.predictedPrice}</div>
          </div>
          <div className="text-right">
            <div className="text-sm text-gray-500">Potential {isBullish ? "Gain" : "Loss"}</div>
            <div className={isBullish ? "text-green-600" : "text-red-600"}>
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
