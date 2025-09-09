
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
import { useAuth } from "@/contexts/AuthContext";

// All questions pool for Stock Market Basics
const allBasicsQuestions = [
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
  },
  {
    id: "q6",
    text: "When you buy one share of a company's stock, you become:",
    options: [
      "A partial owner of the company",
      "A lender to the company",
      "A company employee",
      "A mandatory board member"
    ],
    correctOption: 0,
    explanation: "Buying one share means you own a fraction of that company and share in its profits and risks."
  },
  {
    id: "q7",
    text: "Why do private companies typically decide to go public with an IPO?",
    options: [
      "To avoid taxes on profits",
      "To raise capital for growth and expansion",
      "To convert to a cooperative",
      "To limit the number of shareholders"
    ],
    correctOption: 1,
    explanation: "The primary reason a company launches an IPO is to raise funds for growth, expansion, and paying debts."
  },
  {
    id: "q8",
    text: "What happens during a 2-for-1 forward stock split?",
    options: [
      "Each existing share is split into 2 shares, halving the price of each share",
      "Number of shares is cut in half, doubling the price",
      "Total market value of your holding doubles",
      "Company issues extra shares as dividends"
    ],
    correctOption: 0,
    explanation: "In a forward stock split, the number of shares doubles but price halves, leaving the overall value unchanged."
  },
  {
    id: "q9",
    text: "Which type of risk can be reduced through diversification of a portfolio?",
    options: [
      "Systematic (market) risk",
      "Unsystematic (company-specific) risk",
      "Inflation risk",
      "Currency risk"
    ],
    correctOption: 1,
    explanation: "Diversification helps reduce unsystematic risk (company- or sector-specific), but not broad market risks."
  },
  {
    id: "q10",
    text: "Which order type allows you to specify the maximum price you are willing to pay when buying a stock?",
    options: [
      "Market order",
      "Stop order",
      "Limit order",
      "Fill-or-kill order"
    ],
    correctOption: 2,
    explanation: "A limit order lets you set the maximum buying price (or minimum selling price)."
  },
  {
    id: "q11",
    text: "Trading on margin means:",
    options: [
      "Borrowing funds from a broker to buy securities, thereby magnifying gains and losses",
      "Trading only government bonds",
      "Buying stocks with cash only",
      "Agreeing to hold a stock for at least one year"
    ],
    correctOption: 0,
    explanation: "Margin trading involves borrowing money from brokers to buy more shares than your cash allows."
  },
  {
    id: "q12",
    text: "The Nifty 50 index represents:",
    options: [
      "The 50 most actively traded global stocks",
      "50 large-cap Indian companies listed on NSE",
      "50 top-performing startups in India",
      "The 50 largest banks in India"
    ],
    correctOption: 1,
    explanation: "The Nifty 50 tracks 50 large-cap companies across sectors listed on the NSE."
  },
  {
    id: "q13",
    text: "What is the main role of SEBI in India?",
    options: [
      "To regulate and protect investors in the securities market",
      "To provide loans to listed companies",
      "To set interest rates for banks",
      "To issue government bonds"
    ],
    correctOption: 0,
    explanation: "SEBI (Securities and Exchange Board of India) regulates securities markets and safeguards investor interests."
  },
  {
    id: "q14",
    text: "Which of the following best describes an ETF (Exchange Traded Fund)?",
    options: [
      "A mutual fund that trades on stock exchanges like a stock",
      "A private loan issued by banks",
      "A type of government bond",
      "A company's retained earnings"
    ],
    correctOption: 0,
    explanation: "ETFs are investment funds traded on exchanges, combining features of mutual funds and stocks."
  },
  {
    id: "q15",
    text: "If Reliance Industries' share price is ₹2,500 and it has 6.8 billion shares outstanding, its market capitalization is approximately:",
    options: [
      "₹1.7 trillion",
      "₹17 trillion",
      "₹68 trillion",
      "₹170 trillion"
    ],
    correctOption: 1,
    explanation: "Market cap = Price × Outstanding shares = 2500 × 6.8B ≈ ₹17 trillion."
  },
  {
    id: "q16",
    text: "A stock with a beta greater than 1 indicates:",
    options: [
      "The stock is less volatile than the market",
      "The stock moves opposite to the market",
      "The stock is more volatile than the market",
      "The stock has no correlation with the market"
    ],
    correctOption: 2,
    explanation: "A beta >1 means the stock amplifies market movements, rising or falling more sharply."
  },
  {
    id: "q17",
    text: "What is short selling?",
    options: [
      "Selling a stock before you own it, hoping to buy it back later at a lower price",
      "Selling shares immediately after an IPO",
      "Selling stocks after a dividend is declared",
      "Selling only penny stocks"
    ],
    correctOption: 0,
    explanation: "Short selling involves borrowing shares, selling them, and repurchasing later at (hopefully) a lower price."
  },
  {
    id: "q18",
    text: "Which corporate action reduces the share price while keeping the market cap unchanged?",
    options: [
      "Dividend declaration",
      "Reverse stock split",
      "Stock split",
      "Bonus issue"
    ],
    correctOption: 2,
    explanation: "Stock splits increase share count, lowering per-share price but leaving market cap unchanged."
  },
  {
    id: "q19",
    text: "What does the term 'blue-chip stock' mean?",
    options: [
      "High-value government bonds",
      "Stocks of large, financially stable, and reputable companies",
      "Stocks that always pay dividends",
      "Technology sector stocks only"
    ],
    correctOption: 1,
    explanation: "Blue-chip stocks are well-established, financially sound companies with reliable performance."
  },
  {
    id: "q20",
    text: "Which financial statement shows a company's revenues and expenses?",
    options: [
      "Cash flow statement",
      "Balance sheet",
      "Income statement",
      "Equity statement"
    ],
    correctOption: 2,
    explanation: "The income statement (P&L) reports revenues, expenses, and profits over a period."
  },
  {
    id: "q21",
    text: "What is the role of a stock exchange?",
    options: [
      "To lend money to companies",
      "To provide a platform for buying and selling securities",
      "To decide which companies are profitable",
      "To regulate bank interest rates"
    ],
    correctOption: 1,
    explanation: "Exchanges provide infrastructure and platforms for investors to trade securities."
  },
  {
    id: "q22",
    text: "What does liquidity of a stock mean?",
    options: [
      "The speed at which it can be bought or sold without affecting price",
      "The company's total profits",
      "Its ability to pay dividends",
      "The stability of its stock price"
    ],
    correctOption: 0,
    explanation: "Liquidity measures how easily an asset can be converted to cash without price changes."
  },
  {
    id: "q23",
    text: "Which of these is an example of a defensive stock?",
    options: [
      "Tesla (EV manufacturer)",
      "Hindustan Unilever (consumer goods)",
      "Zomato (food delivery)",
      "Adani Ports (infrastructure)"
    ],
    correctOption: 1,
    explanation: "Consumer goods companies like HUL are defensive stocks, performing steadily even in downturns."
  },
  {
    id: "q24",
    text: "What does an index fund do?",
    options: [
      "Attempts to outperform the market",
      "Tracks and replicates a specific market index",
      "Only invests in IPOs",
      "Invests exclusively in government bonds"
    ],
    correctOption: 1,
    explanation: "Index funds mirror the performance of a market index like Nifty 50 or S&P 500."
  },
  {
    id: "q25",
    text: "What is meant by market volatility?",
    options: [
      "Changes in interest rates",
      "Fluctuations in stock prices and market indices",
      "Company earnings reports",
      "Government bond yields"
    ],
    correctOption: 1,
    explanation: "Volatility refers to how much and how quickly stock prices move up or down."
  },
  {
    id: "q26",
    text: "Which of these companies was added to the Nifty 50 index in 2023?",
    options: [
      "Adani Enterprises",
      "Paytm",
      "JSW Steel",
      "HDFC Life"
    ],
    correctOption: 0,
    explanation: "Adani Enterprises was included in the Nifty 50 index in 2023."
  },
  {
    id: "q27",
    text: "What is a circuit breaker in stock markets?",
    options: [
      "A limit placed to halt trading during extreme volatility",
      "A device used in stock exchange buildings",
      "A limit on dividend payouts",
      "An order to automatically sell stocks"
    ],
    correctOption: 0,
    explanation: "Circuit breakers temporarily halt trading when indices move beyond pre-set thresholds."
  },
  {
    id: "q28",
    text: "Which ratio measures how much a company earns relative to its share price?",
    options: [
      "Debt-to-equity ratio",
      "Current ratio",
      "Price-to-earnings (P/E) ratio",
      "Dividend yield ratio"
    ],
    correctOption: 2,
    explanation: "The P/E ratio compares a company's share price to its earnings per share."
  },
  {
    id: "q29",
    text: "Which of these best describes insider trading?",
    options: [
      "Legally buying stocks during an IPO",
      "Using non-public information to trade securities",
      "Government purchase of company shares",
      "Trading only blue-chip stocks"
    ],
    correctOption: 1,
    explanation: "Insider trading is the illegal practice of trading based on material non-public information."
  },
  {
    id: "q30",
    text: "Which index represents the top 30 companies listed on the Bombay Stock Exchange?",
    options: [
      "Nifty 50",
      "BSE Sensex",
      "Dow Jones",
      "Russell 2000"
    ],
    correctOption: 1,
    explanation: "The Sensex is the benchmark index of the BSE, comprising 30 top companies."
  }
];

// Helper function to get daily questions (5 random questions per day)
const getDailyQuestions = (userId?: string) => {
  const today = new Date().toDateString();
  const storageKey = userId ? `dailyQuestions_basics_${today}_${userId}` : `dailyQuestions_basics_${today}`;
  
  let dailyQuestions = localStorage.getItem(storageKey);
  
  if (!dailyQuestions) {
    // Generate 5 random questions for today
    const shuffled = [...allBasicsQuestions].sort(() => 0.5 - Math.random());
    const selected = shuffled.slice(0, 5);
    localStorage.setItem(storageKey, JSON.stringify(selected));
    return selected;
  }
  
  return JSON.parse(dailyQuestions);
};

// Mock quiz data with daily limit
const mockQuizzes: Quiz[] = [
  {
    id: "basics",
    title: "Stock Market Basics",
    description: "Test your knowledge of fundamental stock market concepts (5 questions per day)",
    points: 500,
    questions: getDailyQuestions()
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
  const { user } = useAuth();
  
  useEffect(() => {
    // Handle incoming navigation requests
    if (location.state?.activeTab) {
      setActiveCategory(location.state.activeTab);
    }
  }, [location.state]);
  
  const handleStartQuiz = (quiz: Quiz) => {
    // Check daily limit for basics quiz
    if (quiz.id === "basics") {
      const today = new Date().toDateString();
      const completedToday = user ? localStorage.getItem(`quiz_completed_basics_${today}_${user.id}`) === "true" : false;
      
      if (completedToday) {
        toast.info("You've already completed today's Stock Market Basics challenge! Come back tomorrow for new questions. 📅");
        return;
      }
      
      const updatedQuiz = {
        ...quiz,
        questions: getDailyQuestions(user?.id)
      };
      setSelectedQuiz(updatedQuiz);
    } else {
      setSelectedQuiz(quiz);
    }
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
              {mockQuizzes.map((quiz) => {
                const isDailyBasics = quiz.id === "basics";
                const today = new Date().toDateString();
                const completedToday = isDailyBasics && user ? localStorage.getItem(`quiz_completed_basics_${today}_${user.id}`) === "true" : false;
                const isCompleted = completedQuizzes.includes(quiz.id) || completedToday;
                
                return (
                  <Card key={quiz.id} className={isCompleted ? "border-learngreen-200" : ""}>
                    <CardHeader>
                      <div className="flex justify-between">
                        <CardTitle>{quiz.title}</CardTitle>
                        {isCompleted && (
                          <Badge variant="outline" className="bg-learngreen-100 text-learngreen-700 border-learngreen-200">
                            {completedToday ? "Completed Today" : "Completed"}
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
                      {isDailyBasics && completedToday && (
                        <div className="mt-2 text-xs text-orange-600 bg-orange-50 p-2 rounded">
                          Come back tomorrow for 5 new questions! 📅
                        </div>
                      )}
                    </CardContent>
                    
                    <CardFooter>
                      <Button 
                        onClick={() => handleStartQuiz(quiz)}
                        className="w-full bg-learngreen-600 hover:bg-learngreen-700"
                        disabled={completedToday}
                      >
                        {completedToday ? "Completed Today" : isCompleted ? "Play Again" : "Start Quiz"}
                      </Button>
                    </CardFooter>
                  </Card>
                );
              })}
              
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
        <DialogContent className="sm:max-w-[800px] max-h-[90vh] overflow-y-auto bg-white z-50">
          <DialogHeader className="p-6 pb-4 border-b">
            <DialogTitle>{selectedQuiz?.title}</DialogTitle>
          </DialogHeader>
          {selectedQuiz && (
            <div className="p-6 pt-4">
              <StockQuiz quiz={selectedQuiz} onComplete={handleQuizComplete} />
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Games;
