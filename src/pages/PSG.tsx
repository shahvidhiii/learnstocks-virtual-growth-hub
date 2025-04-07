
import React, { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import NavigationBar from "@/components/NavigationBar";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";

const PSG = () => {
  const { user } = useAuth();
  const [isLoading, setIsLoading] = useState(true);
  
  useEffect(() => {
    // Load data when component mounts
    const initDatabase = async () => {
      if (!user) return;
      
      try {
        setIsLoading(true);
        
        // Check if the increment_points function exists
        const { data: functionExists, error: checkError } = await supabase
          .rpc('function_exists', { function_name: 'increment_points' });
          
        if (checkError) {
          console.error("Error checking function:", checkError);
        }
        
        // If function doesn't exist, create it
        if (!functionExists) {
          const { error: createError } = await supabase.rpc('create_increment_points_function');
          
          if (createError) {
            console.error("Error creating function:", createError);
          }
        }
      } catch (err) {
        console.error("Error in initDatabase:", err);
      } finally {
        setIsLoading(false);
      }
    };
    
    initDatabase();
  }, [user]);
  
  return (
    <div className="min-h-screen bg-gray-50">
      <NavigationBar />
      
      <main className="container mx-auto px-4 py-6">
        <h1 className="text-2xl font-bold mb-6">Portfolio Strategy Generator</h1>
        
        {isLoading ? (
          <div className="text-center py-12">Loading...</div>
        ) : (
          <Tabs defaultValue="risk">
            <TabsList className="grid grid-cols-3 mb-6">
              <TabsTrigger value="risk">Risk Profile</TabsTrigger>
              <TabsTrigger value="goal">Investment Goals</TabsTrigger>
              <TabsTrigger value="strategy">Strategy</TabsTrigger>
            </TabsList>
            
            <TabsContent value="risk" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Risk Assessment</CardTitle>
                  <CardDescription>Determine your risk tolerance level</CardDescription>
                </CardHeader>
                <CardContent>
                  <p>Content for Risk Assessment</p>
                </CardContent>
              </Card>
            </TabsContent>
            
            <TabsContent value="goal">
              <Card>
                <CardHeader>
                  <CardTitle>Investment Goals</CardTitle>
                  <CardDescription>Define your investment objectives</CardDescription>
                </CardHeader>
                <CardContent>
                  <p>Content for Investment Goals</p>
                </CardContent>
              </Card>
            </TabsContent>
            
            <TabsContent value="strategy">
              <Card>
                <CardHeader>
                  <CardTitle>Portfolio Strategy</CardTitle>
                  <CardDescription>Your personalized investment strategy</CardDescription>
                </CardHeader>
                <CardContent>
                  <p>Content for Portfolio Strategy</p>
                </CardContent>
                <CardFooter>
                  <p className="text-sm text-gray-500">
                    This strategy is generated based on your risk profile and investment goals.
                  </p>
                </CardFooter>
              </Card>
            </TabsContent>
          </Tabs>
        )}
      </main>
    </div>
  );
};

export default PSG;
