
import { useState, useEffect } from "react";
import { useLocation } from "react-router-dom";
import NavigationBar from "@/components/NavigationBar";
import StockQuiz from "@/components/StockQuiz";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { GamepadIcon, Trophy, BookOpen, Brain, Timer } from "lucide-react";
import { toast } from "sonner";
import { Quiz } from "@/types";
import { useBalanceStore } from "@/stores/balanceStore";

// Mock quiz data
const mockQuizzes: Quiz[] = [
  {
    id: "basics",
    title: "Stock Market Basics",
    description: "Test your knowledge of fundamental stock market concepts",
    points: 500,
    questions: [
      {
        id: "q1",
        text: "What is a stock?",
        options: [
          "A type of bond issued by companies",
          "A unit of ownership in a company",
          "A loan given to a company",
          "A government security"
        ],
        correctOption: 1,
        explanation: "A stock represents a share of ownership in a company and entitles the holder to a portion of the company's assets and earnings."
      },
      {
        id: "q2",
        text: "What is a bull market?",
        options: [
          "A market where stock prices are falling",
          "A market dominated by aggressive trading",
          "A market where stock prices are rising",
          "A market with high volatility"
        ],
        correctOption: 2,
        explanation: "A bull market is characterized by a sustained rise in market prices, typically 20% or more from recent lows."
      },
      {
        id: "q3",
        text: "What is a dividend?",
        options: [
          "A fee charged by brokers",
          "A portion of profits paid to shareholders",
          "The difference between buy and sell price",
          "A type of market order"
        ],
        correctOption: 1,
        explanation: "A dividend is a distribution of a portion of a company's earnings to its shareholders as decided by the board of directors."
      },
      {
        id: "q4",
        text: "What does P/E ratio stand for?",
        options: [
          "Profit/Earnings ratio",
          "Price/Earnings ratio",
          "Potential/Expected ratio",
          "Performance/Efficiency ratio"
        ],
        correctOption: 1,
        explanation: "Price-to-Earnings (P/E) ratio is a valuation ratio of a company's current share price compared to its per-share earnings."
      },
      {
        id: "q5",
        text: "What is market capitalization?",
        options: [
          "The total value of a company's assets",
          "The total value of a company's outstanding shares",
          "The maximum price of a stock in the past year",
          "The total debt of a company"
        ],
        correctOption: 1,
        explanation: "Market capitalization (or market cap) is the total value of a company's outstanding shares of stock, calculated by multiplying the stock price by the number of outstanding shares."
      }
    ]
  },
  {
    id: "technical",
    title: "Technical Analysis",
    description: "Learn about charts, patterns, and technical indicators",
    points: 750,
    questions: [
      {
        id: "t1",
        text: "What is a moving average?",
        options: [
          "The average price of a stock over a specific period",
          "The difference between opening and closing prices",
          "The highest price achieved in a day",
          "The total volume of trades for a stock"
        ],
        correctOption: 0,
        explanation: "A moving average is a calculation used to analyze data points by creating a series of averages of different subsets of the full data set, typically to smoothen price action over time."
      },
      // More technical analysis questions would be added here
      {
        id: "t2",
        text: "What pattern is formed when a stock's price reaches new lows twice with a moderate recovery in between?",
        options: [
          "Head and Shoulders",
          "Double Bottom",
          "Double Top",
          "Cup and Handle"
        ],
        correctOption: 1,
        explanation: "A Double Bottom is a chart pattern where a stock's price reaches a low, rebounds, and then touches the same low again before moving higher, forming a 'W' shape."
      }
    ]
  }
];

const Games = () => {
  const location = useLocation();
  const initialCategory = location.state?.activeTab || "quizzes";
  
  const [selectedQuiz, setSelectedQuiz] = useState<Quiz | null>(null);
  const [isQuizDialogOpen, setIsQuizDialogOpen] = useState(false);
  const [completedQuizzes, setCompletedQuizzes] = useState<string[]>([]);
  const [totalPoints, setTotalPoints] = useState(0);
  const [activeCategory, setActiveCategory] = useState<string>(initialCategory);
  const { balance, addToBalance } = useBalanceStore();
  
  useEffect(() => {
    // Handle incoming navigation requests
    if (location.state?.activeTab) {
      setActiveCategory(location.state.activeTab);
    }
  }, [location.state]);
  
  const handleStartQuiz = (quiz: Quiz) => {
    setSelectedQuiz(quiz);
    setIsQuizDialogOpen(true);
  };
  
  const handleQuizComplete = (score: number) => {
    if (!selectedQuiz) return;
    
    // Calculate points based on score percentage
    const earnedPoints = Math.round((score / selectedQuiz.questions.length) * selectedQuiz.points);
    
    // Update completed quizzes and total points
    if (!completedQuizzes.includes(selectedQuiz.id)) {
      setCompletedQuizzes([...completedQuizzes, selectedQuiz.id]);
    }
    
    setTotalPoints(totalPoints + earnedPoints);
    addToBalance(earnedPoints); // Add to the global balance
    toast.success(`You earned ${earnedPoints} points!`);
    
    // Close dialog after a delay
    setTimeout(() => {
      setIsQuizDialogOpen(false);
      setSelectedQuiz(null);
    }, 3000);
  };

  const handleOpenSimulator = () => {
    setActiveCategory("simulator");
    toast.info("Trading simulator loading...");
  };

  const handleOpenChallenges = () => {
    setActiveCategory("challenges");
    toast.info("Market challenges loading...");
  };
  
  const handleCompleteSimulation = () => {
    const simulationPoints = 500;
    addToBalance(simulationPoints);
    toast.success(`Simulation points added: ${simulationPoints}!`);
  };
  
  return (
    <div className="min-h-screen bg-gray-50">
      <NavigationBar />
      
      <main className="container mx-auto px-4 py-6">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold">Games & Quizzes</h1>
          <div className="bg-learngreen-100 px-4 py-2 rounded-md flex items-center">
            <Trophy className="h-5 w-5 text-learngreen-600 mr-2" />
            <span className="font-semibold text-learngreen-700">{totalPoints} Points Earned</span>
          </div>
        </div>
        
        {/* Games Categories */}
        <div className="grid md:grid-cols-3 gap-6 mb-8">
          <Card className={activeCategory === "quizzes" ? "border-learngreen-500 shadow-md" : ""}>
            <CardHeader className="pb-2">
              <div className="flex justify-center mb-2">
                <div className="bg-learngreen-100 p-3 rounded-full">
                  <BookOpen className="h-6 w-6 text-learngreen-600" />
                </div>
              </div>
              <CardTitle className="text-center">Knowledge Quizzes</CardTitle>
              <CardDescription className="text-center">
                Test your stock market knowledge
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-center text-sm text-gray-600 mb-2">
                Complete quizzes to earn points and expand your knowledge
              </p>
            </CardContent>
            <CardFooter className="pt-0">
              <Button 
                className="w-full bg-learngreen-600 hover:bg-learngreen-700"
                onClick={() => setActiveCategory("quizzes")}
              >
                Explore Quizzes
              </Button>
            </CardFooter>
          </Card>
          
          <Card className={activeCategory === "simulator" ? "border-learngreen-500 shadow-md" : ""}>
            <CardHeader className="pb-2">
              <div className="flex justify-center mb-2">
                <div className="bg-learngreen-100 p-3 rounded-full">
                  <Brain className="h-6 w-6 text-learngreen-600" />
                </div>
              </div>
              <CardTitle className="text-center">Trading Simulator</CardTitle>
              <CardDescription className="text-center">
                Practice with virtual money
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-center text-sm text-gray-600 mb-2">
                Learn to trade without risking real money
              </p>
            </CardContent>
            <CardFooter className="pt-0">
              <Button 
                className="w-full bg-learngreen-600 hover:bg-learngreen-700"
                onClick={handleOpenSimulator}
              >
                Start Trading
              </Button>
            </CardFooter>
          </Card>
          
          <Card className={activeCategory === "challenges" ? "border-learngreen-500 shadow-md" : ""}>
            <CardHeader className="pb-2">
              <div className="flex justify-center mb-2">
                <div className="bg-learngreen-100 p-3 rounded-full">
                  <Timer className="h-6 w-6 text-learngreen-600" />
                </div>
              </div>
              <CardTitle className="text-center">Market Challenges</CardTitle>
              <CardDescription className="text-center">
                Timed market prediction games
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-center text-sm text-gray-600 mb-2">
                Predict market movements in real-time and compete with others
              </p>
            </CardContent>
            <CardFooter className="pt-0">
              <Button 
                className="w-full bg-learngreen-600 hover:bg-learngreen-700"
                onClick={handleOpenChallenges}
              >
                Join Challenge
              </Button>
            </CardFooter>
          </Card>
        </div>
        
        {/* Content based on selected category */}
        {activeCategory === "quizzes" && (
          <div>
            <h2 className="text-xl font-semibold mb-4">Available Quizzes</h2>
            
            <div className="grid md:grid-cols-2 gap-4">
              {mockQuizzes.map((quiz) => (
                <Card key={quiz.id} className={completedQuizzes.includes(quiz.id) ? "border-learngreen-200" : ""}>
                  <CardHeader>
                    <div className="flex justify-between">
                      <CardTitle>{quiz.title}</CardTitle>
                      {completedQuizzes.includes(quiz.id) && (
                        <Badge variant="outline" className="bg-learngreen-100 text-learngreen-700 border-learngreen-200">
                          Completed
                        </Badge>
                      )}
                    </div>
                    <CardDescription>{quiz.description}</CardDescription>
                  </CardHeader>
                  
                  <CardContent>
                    <div className="flex justify-between text-sm">
                      <span>Questions: {quiz.questions.length}</span>
                      <span className="font-semibold text-learngreen-700">{quiz.points} points</span>
                    </div>
                  </CardContent>
                  
                  <CardFooter>
                    <Button 
                      onClick={() => handleStartQuiz(quiz)}
                      className="w-full bg-learngreen-600 hover:bg-learngreen-700"
                    >
                      {completedQuizzes.includes(quiz.id) ? "Play Again" : "Start Quiz"}
                    </Button>
                  </CardFooter>
                </Card>
              ))}
              
              {/* Coming Soon Placeholder */}
              <Card className="opacity-70 border-dashed">
                <CardHeader>
                  <CardTitle>More Quizzes Coming Soon</CardTitle>
                  <CardDescription>
                    New quizzes are added every week
                  </CardDescription>
                </CardHeader>
                <CardContent className="flex justify-center py-6">
                  <GamepadIcon className="h-16 w-16 text-gray-300" />
                </CardContent>
                <CardFooter>
                  <Button disabled className="w-full">Coming Soon</Button>
                </CardFooter>
              </Card>
            </div>
          </div>
        )}

        {activeCategory === "simulator" && (
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Trading Simulator</CardTitle>
                <CardDescription>Practice trading with virtual money</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="p-6 space-y-4">
                  <div className="bg-learngreen-50 p-4 rounded-md">
                    <h3 className="font-semibold text-learngreen-700 mb-2">Your Portfolio</h3>
                    <div className="flex justify-between items-center">
                      <span>Available Balance:</span>
                      <span className="font-bold">₹{balance.toLocaleString()}</span>
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <h3 className="font-semibold">Popular Stocks</h3>
                    {["RELIANCE", "TCS", "HDFC", "INFY", "ICICI"].map((stock, index) => (
                      <div key={stock} className="flex justify-between items-center p-3 border rounded-md">
                        <span>{stock}</span>
                        <div className="space-x-2">
                          <Button size="sm" variant="outline" className="border-green-500 text-green-700">Buy</Button>
                          <Button size="sm" variant="outline" className="border-red-500 text-red-700">Sell</Button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </CardContent>
              <CardFooter>
                <Button 
                  className="w-full bg-learngreen-600" 
                  onClick={handleCompleteSimulation}
                >
                  Complete Practice Session (+500 points)
                </Button>
              </CardFooter>
            </Card>
          </div>
        )}

        {activeCategory === "challenges" && (
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Market Prediction Challenge</CardTitle>
                <CardDescription>Predict market movements in real-time</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="p-6 space-y-6">
                  <div className="bg-blue-50 p-4 rounded-md border border-blue-100">
                    <h3 className="font-semibold text-blue-700 mb-2">Today's Challenge</h3>
                    <p>Predict whether the following stocks will close higher or lower by the end of the trading day.</p>
                  </div>
                  
                  <div className="space-y-4">
                    {["NIFTY50", "BANKNIFTY", "SENSEX", "RELIANCE", "TCS"].map((item, index) => (
                      <div key={item} className="border p-4 rounded-md">
                        <div className="flex justify-between items-center mb-3">
                          <span className="font-semibold">{item}</span>
                          <span className={index % 2 === 0 ? "text-green-600" : "text-red-600"}>
                            {index % 2 === 0 ? "+1.2%" : "-0.8%"}
                          </span>
                        </div>
                        <div className="flex space-x-2">
                          <Button variant="outline" className="flex-1 border-green-500 hover:bg-green-50">
                            Higher
                          </Button>
                          <Button variant="outline" className="flex-1 border-red-500 hover:bg-red-50">
                            Lower
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </CardContent>
              <CardFooter>
                <Button className="w-full bg-learngreen-600" onClick={() => toast.success("Challenge completed! +750 points")}>
                  Submit Predictions
                </Button>
              </CardFooter>
            </Card>
          </div>
        )}
      </main>
      
      {/* Quiz Dialog */}
      <Dialog open={isQuizDialogOpen} onOpenChange={setIsQuizDialogOpen}>
        <DialogContent className="sm:max-w-[800px] p-0">
          <DialogHeader className="p-6 pb-0">
            <DialogTitle>{selectedQuiz?.title}</DialogTitle>
          </DialogHeader>
          {selectedQuiz && (
            <div className="p-6">
              <StockQuiz quiz={selectedQuiz} onComplete={handleQuizComplete} />
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Games;
