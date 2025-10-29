import { useEffect, useState, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useNavigate } from "react-router-dom";
import NavigationBar from "@/components/NavigationBar";
import StockCard from "@/components/StockCard";
import mockStocks from "@/data/mockStocks";
import TradeDialog from "@/components/TradeDialog";
import { usePortfolioStore } from "@/stores/portfolioStore";
import { PortfolioChart } from "@/components/PortfolioChart";
import LoginReward from "@/components/LoginReward";
import { Stock, Portfolio } from "@/types";
import { Coins, Briefcase, ArrowUp, ArrowDown } from "lucide-react";
import LiveBadge from "@/components/LiveBadge";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";
import { useBalanceStore } from "@/stores/balanceStore";
import useLivePrices from "@/hooks/useLivePrices";





const Home = () => {
  const navigate = useNavigate();
  const [isFirstLogin, setIsFirstLogin] = useState(false);
  const [lastLoginDate, setLastLoginDate] = useState<string | null>(null);
  const { balance, setBalance } = useBalanceStore();
  const [userPoints, setUserPoints] = useState(0);
  const [trendingStocks, setTrendingStocks] = useState<Stock[]>(mockStocks);
  const holdings = usePortfolioStore((s) => s.holdings);
  const trades = usePortfolioStore((s) => s.trades);
  const history = usePortfolioStore((s) => s.history);
  const addHistoryPoint = usePortfolioStore((s) => s.addHistoryPoint);
  const sellStock = usePortfolioStore((s) => s.sellStock);
  const { prices, fetchPrices, setSymbols } = useLivePrices([], 5000);
  const [isSellDialogOpen, setIsSellDialogOpen] = useState(false);
  const [selectedHolding, setSelectedHolding] = useState<any | null>(null);
  const [selectedSellStock, setSelectedSellStock] = useState<Stock | null>(null);
  const [selectedTab, setSelectedTab] = useState("portfolio");
  const [holdingsView, setHoldingsView] = useState<"invested" | "returns" | "contribution" | "price">("invested");
  const [isLoading, setIsLoading] = useState(true);
  const { user } = useAuth();

  useEffect(() => {
    // balance is managed by balanceStore; just ensure UI updates
  }, [balance]);

  const fetchUserData = useCallback(async () => {
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
        const userPoints = data.points || 10000;
        setUserPoints(userPoints);
        // Initialize balance from server only once per user to avoid overwriting local trades
        const initKey = `balance_initialized_${user.id}`;
        const alreadyInit = localStorage.getItem(initKey);
        if (!alreadyInit) {
          setBalance(userPoints);
          localStorage.setItem(initKey, '1');
        }
        setLastLoginDate(data.last_login_date);
        setIsFirstLogin(!data.profile_completed);
      }
    } catch (err) {
      console.error("Error in fetchUserData:", err);
    } finally {
      setIsLoading(false);
    }
  }, [user, setBalance]);
  
  const handleTradeNow = () => {
    navigate('/games', { state: { activeTab: 'simulator' } });
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
            if (payload.new && payload.new.points !== undefined) {
              const updatedPoints = payload.new.points || 0;
              setUserPoints(updatedPoints);
              // Only update local balance from remote changes if balance wasn't initialized locally
              const initKey = `balance_initialized_${user.id}`;
              const alreadyInit = localStorage.getItem(initKey);
              if (!alreadyInit) {
                setBalance(updatedPoints);
                localStorage.setItem(initKey, '1');
              }
            }
          }
        )
        .subscribe();
      
      return () => {
        supabase.removeChannel(pointsChannel);
      };
    }
  }, [user, fetchUserData, setBalance]);

  // set symbols to fetch: holdings + trending
  useEffect(() => {
    const syms = Array.from(new Set([
      ...holdings.map(h => `${h.symbol}.NS`),
      ...trendingStocks.map(s => `${s.symbol}.NS`),
    ]));
    setSymbols(syms);
  }, [holdings, trendingStocks]);

  // Periodically snapshot portfolio value into history (every 60s)
  useEffect(() => {
    const takeSnapshot = () => {
      try {
        const portfolio = usePortfolioStore.getState();
        const balanceNow = useBalanceStore.getState().balance;
        const combined = usePortfolioStore.getState();
        // use currently polled prices from hook
        const currentPrices = prices || {};
        const totalValue = balanceNow + portfolio.holdings.reduce((s, h) => {
          const p = currentPrices[h.symbol]?.price ?? (mockStocks.find((m) => m.id === h.stockId)?.price ?? h.avgBuyPrice);
          return s + h.quantity * p;
        }, 0);
        usePortfolioStore.getState().addHistoryPoint(totalValue);
      } catch (err) {
        console.error('Failed to snapshot portfolio history', err);
      }
    };

    const id = setInterval(takeSnapshot, 60000);
    // take an immediate snapshot as well
    takeSnapshot();
    return () => clearInterval(id);
  }, [prices]);

  return (
    <div className="min-h-screen bg-gray-50">
      <NavigationBar />
      
      <LoginReward 
        isFirstLogin={isFirstLogin} 
        lastLoginDate={lastLoginDate} 
      />
      
      <main className="container mx-auto px-4 py-6">
        <div className="mb-6 bg-white rounded-lg shadow p-4 flex justify-between items-center">
          <div className="flex items-center">
            <div className="bg-learngreen-100 p-3 rounded-full mr-4">
              <Coins className="h-6 w-6 text-learngreen-600" />
            </div>
            <div>
              <h2 className="text-xl font-semibold">Your Balance</h2>
              <p className="text-3xl font-bold text-learngreen-700">{isLoading ? "Loading..." : `₹${balance.toLocaleString()}`}</p>
            </div>
          </div>
          <Button className="bg-learngreen-600 hover:bg-learngreen-700" onClick={handleTradeNow}>Add More Points</Button>
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
                    {
                      (() => {
                        const portfolioValue = balance + holdings.reduce((s, h) => {
                          const live = prices[h.symbol];
                          const currentPrice = live ? live.price : (mockStocks.find((m) => m.id === h.stockId)?.price ?? h.avgBuyPrice);
                          return s + h.quantity * currentPrice;
                        }, 0);

                        // map stored history into chart-friendly labels
                        const chartData = history && history.length > 0 ? history.map((pt) => ({ date: new Date(pt.date).toLocaleTimeString(), value: pt.value })) : undefined;

                        let change = 0;
                        let changePct = 0;
                        if (history && history.length >= 2) {
                          const last = history[history.length - 1].value;
                          const prev = history[history.length - 2].value;
                          change = last - prev;
                          changePct = prev !== 0 ? (change / prev) * 100 : 0;
                        }

                        return (
                          <div className="relative">
                            <div className="absolute right-3 top-3 z-10">
                              <LiveBadge isLive={Object.keys(prices || {}).length > 0} />
                            </div>
                            <PortfolioChart
                              title="Portfolio Value"
                              value={portfolioValue}
                              change={change}
                              changePercent={changePct}
                              data={chartData}
                            />
                          </div>
                        );
                      })()
                    }
                
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle>Available Cash</CardTitle>
                    <div className="text-2xl font-bold">₹{balance.toFixed(2)}</div>
                    <div className="text-sm text-gray-500">Available for trading</div>
                  </CardHeader>
                  <CardContent className="pt-0">
                    <Button className="w-full bg-learngreen-600 hover:bg-learngreen-700 mt-2" onClick={handleTradeNow}>Trade Now</Button>
                  </CardContent>
                </Card>
                
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle>Holdings</CardTitle>
                    <div className="text-2xl font-bold">{holdings.length}</div>
                    <div className="text-sm text-gray-500">Stocks in portfolio</div>
                  </CardHeader>
                  <CardContent className="pt-0">
                    <Button variant="outline" className="w-full mt-2" onClick={() => navigate('/games', { state: { activeTab: 'simulator' } })}>Trade</Button>
                  </CardContent>
                </Card>
              </div>
              
              <Card>
                <CardHeader>
                  <CardTitle>Your Holdings</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex gap-2 mb-4">
                    {[
                      { key: 'invested', label: 'Current (Invested)' },
                      { key: 'returns', label: 'Returns (%)' },
                      { key: 'contribution', label: 'Contribution (Current)' },
                      { key: 'price', label: 'Price (1D%)' },
                    ].map((v) => (
                      <button
                        key={v.key}
                        aria-pressed={holdingsView === v.key}
                        className={`px-3 py-1 rounded-full border ${holdingsView === (v.key as any) ? 'bg-learngreen-600 text-white' : 'bg-white text-gray-700'}`}
                        onClick={() => setHoldingsView(v.key as any)}
                      >
                        {v.label}
                      </button>
                    ))}
                  </div>
                  <div className="space-y-4">
                    {holdings.length === 0 && (
                      <div className="text-center text-gray-500 py-6">You have no holdings yet. Buy stocks from the Trading tab.</div>
                    )}

                    {holdings.map((holding) => {
                      const live = prices[holding.symbol];
                      const mock = mockStocks.find((m) => m.id === holding.stockId) as Stock | undefined;
                      const currentPrice = live ? live.price : (mock ? mock.price : holding.avgBuyPrice);
                      const currentChange = live ? live.change ?? 0 : mock ? mock.change ?? 0 : 0;
                      const value = holding.quantity * currentPrice;
                      const pnl = value - holding.quantity * holding.avgBuyPrice;
                      const pnlPct = (pnl / (holding.quantity * holding.avgBuyPrice)) * 100;
                      const totalHoldingsValue = holdings.reduce((s, h) => {
                        const m = mockStocks.find((x) => x.id === h.stockId);
                        const price = prices[h.symbol]?.price ?? (m ? m.price : h.avgBuyPrice);
                        return s + price * h.quantity;
                      }, 0);
                      const sharePercent = totalHoldingsValue > 0 ? (value / totalHoldingsValue) * 100 : 0;

                      return (
                        <div key={holding.stockId} className="p-3 border rounded-md">
                          <div className="flex justify-between items-center">
                            <div>
                              <div className="font-medium">{holding.symbol}</div>
                              <div className="text-sm text-gray-500">{holding.name}</div>
                            </div>

                            <div className="text-right">
                              {holdingsView === 'invested' && (
                                <>
                                  <div className="font-semibold text-lg">₹{value.toFixed(2)}</div>
                                  <div className="text-sm text-gray-500">{holding.quantity} Qty • Avg ₹{holding.avgBuyPrice.toFixed(2)}</div>
                                </>
                              )}

                              {holdingsView === 'returns' && (
                                <div className={pnl >= 0 ? 'text-green-600' : 'text-red-600'}>
                                  <div className="font-medium">{pnl >= 0 ? '+' : '-'}₹{Math.abs(pnl).toFixed(2)}</div>
                                  <div className="text-sm">{pnlPct.toFixed(2)}%</div>
                                </div>
                              )}

                              {holdingsView === 'contribution' && (
                                <div className="w-36">
                                  <div className="text-sm text-gray-500">{sharePercent.toFixed(1)}%</div>
                                  <div className="h-2 bg-gray-200 rounded mt-1 overflow-hidden">
                                    <div className="h-2 bg-learngreen-600" style={{ width: `${sharePercent}%` }} />
                                  </div>
                                  <div className="text-xs text-gray-500 mt-1">₹{value.toFixed(2)}</div>
                                </div>
                              )}

                              {holdingsView === 'price' && (
                                <div className="text-right">
                                  <div className="font-medium">₹{currentPrice.toFixed(2)}</div>
                                  <div className={`text-sm ${currentChange >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                                    {currentChange >= 0 ? '+' : ''}{currentChange.toFixed(2)} ({live?.changePercent?.toFixed(2) ?? (mock?.changePercent ?? 0).toFixed(2)}%)
                                  </div>
                                </div>
                              )}
                            </div>
                          </div>

                          <div className="mt-3 flex justify-end">
                            <Button size="sm" variant="outline" onClick={async () => {
                              // fetch fresh price before opening sell dialog
                              const symNs = `${holding.symbol}.NS`;
                              const fetched = await fetchPrices([symNs]);
                              const liveFetched = fetched[holding.symbol] || prices[holding.symbol];
                              const priceToUse = liveFetched ? liveFetched.price : (mock ? mock.price : holding.avgBuyPrice);
                              const stockObj: Stock = {
                                id: holding.stockId,
                                symbol: holding.symbol,
                                name: holding.name,
                                price: priceToUse,
                                change: liveFetched?.change ?? (mock?.change ?? 0),
                                changePercent: liveFetched?.changePercent ?? (mock?.changePercent ?? 0),
                                volume: mock?.volume ?? 0,
                                marketCap: mock?.marketCap ?? 0,
                                sector: mock?.sector ?? "",
                              };
                              setSelectedHolding(holding);
                              setSelectedSellStock(stockObj);
                              setIsSellDialogOpen(true);
                            }}>Sell</Button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </CardContent>
              </Card>
              <TradeDialog
                open={isSellDialogOpen}
                onOpenChange={setIsSellDialogOpen}
                stock={selectedSellStock}
                action="sell"
                onConfirm={(qty) => {
                  if (!selectedHolding) return;
                  (async () => {
                    const symNs = `${selectedHolding.symbol}.NS`;
                    const fetched = await fetchPrices([symNs]);
                    const live = fetched[selectedHolding.symbol] || prices[selectedHolding.symbol];
                    const priceToUse = live ? live.price : (mockStocks.find((m) => m.id === selectedHolding.stockId)?.price ?? selectedHolding.avgBuyPrice);
                    const ok = sellStock(selectedHolding.stockId, qty, priceToUse);
                    if (ok) toast.success(`Sold ${qty} ${selectedHolding.symbol} @ ₹${priceToUse.toFixed(2)}`);
                    else toast.error('Sell failed: invalid qty');
                      // append a history snapshot after successful sell
                      if (ok) {
                        try {
                          const combined = { ...(prices || {}), ...(fetched || {}) };
                          const portfolio = usePortfolioStore.getState();
                          const balanceNow = useBalanceStore.getState().balance;
                          const totalValue = balanceNow + portfolio.holdings.reduce((s, h) => {
                            const p = combined[h.symbol]?.price ?? (mockStocks.find((m) => m.id === h.stockId)?.price ?? h.avgBuyPrice);
                            return s + h.quantity * p;
                          }, 0);
                          usePortfolioStore.getState().addHistoryPoint(totalValue);
                        } catch (err) {
                          console.error('Failed to append history point after sell', err);
                        }
                      }
                      setIsSellDialogOpen(false);
                      setSelectedHolding(null);
                  })();
                }}
              />
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