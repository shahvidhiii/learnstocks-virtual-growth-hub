import React, { useState, useEffect } from 'react';
import { useAuth } from "@/contexts/AuthContext";
import { UserProfile, StockSuggestion } from '@/types';
import { supabase } from '@/integrations/supabase/client';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Sparkles } from "lucide-react";
import NavigationBar from "@/components/NavigationBar";
import { toast } from "sonner";

const PSG = () => {
  const { user } = useAuth();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [suggestions, setSuggestions] = useState<StockSuggestion[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadData = async () => {
      if (!user) return;

      try {
        setIsLoading(true);
        // Fetch user profile
        const { data: profileData, error: profileError } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', user.id)
          .single();

        if (profileError) {
          console.error("Error fetching profile:", profileError);
          toast.error("Failed to load profile data.");
          return;
        }

        if (!profileData) {
          toast.error("Profile data not found.");
          return;
        }

        setProfile(profileData as UserProfile);

        // Fetch stock suggestions
        const { data: suggestionsData, error: suggestionsError } = await supabase
          .from('stock_suggestions')
          .select('*');

        if (suggestionsError) {
          console.error("Error fetching stock suggestions:", suggestionsError);
          toast.error("Failed to load stock suggestions.");
          return;
        }

        setSuggestions(suggestionsData as StockSuggestion[]);
      } finally {
        setIsLoading(false);
      }
    };

    loadData();
  }, [user]);

  // Fix the comparison by ensuring exact string literal types
  const getRiskLevel = (profile: UserProfile): 'Low' | 'Medium' | 'High' => {
    if (profile.riskTolerance === 'Low') return 'Low';
    if (profile.riskTolerance === 'Medium') return 'Medium';
    return 'High';
  };

  const getInvestmentHorizon = (profile: UserProfile): 'short-term' | 'medium-term' | 'long-term' => {
    if (profile.investmentHorizon === 'short-term') return 'short-term';
    if (profile.investmentHorizon === 'medium-term') return 'medium-term';
    return 'long-term';
  };

  const calculateScore = (suggestion: StockSuggestion, profile: UserProfile | null): number => {
    if (!profile) return 0;

    let score = 0;

    // Reward suggestions matching risk tolerance
    if (suggestion.riskLevel === getRiskLevel(profile)) {
      score += 50;
    }

    // Reward suggestions with high potential gain
    if (suggestion.potentialGain > 0.1) {
      score += 30;
    }

    // Add points based on sector preferences
    if (profile.sectorPreferences && profile.sectorPreferences.length > 0) {
      if (profile.sectorPreferences.includes(suggestion.sector)) {
        score += 20;
      }
    }

    return score;
  };

  const getTopSuggestions = (): StockSuggestion[] => {
    if (!profile) return [];

    // Assign scores to each suggestion
    const scoredSuggestions = suggestions.map(suggestion => ({
      ...suggestion,
      score: calculateScore(suggestion, profile),
    }));

    // Sort suggestions by score in descending order
    scoredSuggestions.sort((a, b) => (b.score || 0) - (a.score || 0));

    // Return top 3 suggestions
    return scoredSuggestions.slice(0, 3);
  };

  if (isLoading) {
    return <div className="flex items-center justify-center h-screen">Loading personalized suggestions...</div>;
  }

  if (!profile) {
    return <div className="flex items-center justify-center h-screen">No profile data found.</div>;
  }

  const topSuggestions = getTopSuggestions();

  return (
    <div className="min-h-screen bg-gray-50">
      <NavigationBar />
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-2xl font-bold mb-6">
          <Sparkles className="inline-block mr-2 h-6 w-6 align-middle" />
          Personalized Stock Suggestions
        </h1>
        {topSuggestions.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {topSuggestions.map((suggestion) => (
              <Card key={suggestion.stockId}>
                <CardHeader>
                  <CardTitle>{suggestion.name}</CardTitle>
                  <CardDescription>{suggestion.symbol}</CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-gray-500 mb-2">Reason: {suggestion.reason}</p>
                  <div className="flex items-center justify-between mb-3">
                    <span>Current Price:</span>
                    <span className="font-semibold">${suggestion.currentPrice.toFixed(2)}</span>
                  </div>
                  <div className="flex items-center justify-between mb-3">
                    <span>Risk Level:</span>
                    <Badge variant="secondary">{suggestion.riskLevel}</Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span>Potential Gain:</span>
                    <span className="font-semibold">{(suggestion.potentialGain * 100).toFixed(2)}%</span>
                  </div>
                </CardContent>
                {suggestion.score !== undefined && (
                  <div className="p-4 border-t">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">Match Score:</span>
                      <span className="font-semibold">{suggestion.score}</span>
                    </div>
                  </div>
                )}
              </Card>
            ))}
          </div>
        ) : (
          <div className="text-center">
            <p className="text-gray-600">No personalized suggestions found.</p>
            <p className="text-gray-500">Please complete your profile to get personalized stock suggestions.</p>
            <Button onClick={() => toast.message("TODO: Redirect to profile page")}>
              Complete Profile
            </Button>
          </div>
        )}
      </div>
    </div>
  );
};

export default PSG;
