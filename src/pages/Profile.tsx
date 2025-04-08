
import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { toast } from "sonner";
import { Avatar } from "@/components/ui/avatar";
import { UserCircle, Camera, Save } from "lucide-react";
import NavigationBar from "@/components/NavigationBar";
import { supabase } from "@/integrations/supabase/client";

const Profile = () => {
  const { user } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [profileData, setProfileData] = useState({
    name: "",
    email: "",
    age: "",
    experience: "",
    riskTolerance: "",
  });
  
  useEffect(() => {
    const fetchProfileData = async () => {
      if (!user) return;
      
      try {
        setIsLoading(true);
        
        // Initialize with user metadata
        setProfileData(prevState => ({
          ...prevState,
          name: user.user_metadata?.full_name || "",
          email: user.email || "",
        }));
        
        // Get additional profile data from database
        const { data, error } = await supabase
          .from('profiles')
          .select('age, experience, risk_tolerance')
          .eq('id', user.id)
          .single();
          
        if (error) {
          console.error("Error fetching profile:", error);
          throw error;
        }
        
        if (data) {
          setProfileData(prevState => ({
            ...prevState,
            age: data.age?.toString() || "",
            experience: data.experience || "",
            riskTolerance: data.risk_tolerance || "",
          }));
        }
      } catch (error) {
        console.error("Failed to load profile data:", error);
        toast.error("Failed to load your profile data.");
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchProfileData();
  }, [user]);
  
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setProfileData(prevState => ({
      ...prevState,
      [name]: value
    }));
  };
  
  const handleSelectChange = (name: string, value: string) => {
    setProfileData(prevState => ({
      ...prevState,
      [name]: value
    }));
  };
  
  const handleSaveProfile = async () => {
    if (!user) return;
    
    try {
      setIsSaving(true);
      
      // Update profile in database
      const { error } = await supabase
        .from('profiles')
        .update({
          name: profileData.name,
          age: profileData.age ? parseInt(profileData.age) : null,
          experience: profileData.experience,
          risk_tolerance: profileData.riskTolerance,
          profile_completed: true
        })
        .eq('id', user.id);
        
      if (error) throw error;
      
      // Update user metadata if name has changed
      if (profileData.name !== user.user_metadata?.full_name) {
        const { error: updateError } = await supabase.auth.updateUser({
          data: { full_name: profileData.name }
        });
        
        if (updateError) throw updateError;
      }
      
      toast.success("Profile updated successfully");
    } catch (error: any) {
      console.error("Failed to update profile:", error);
      toast.error(error.message || "Failed to update profile");
    } finally {
      setIsSaving(false);
    }
  };
  
  return (
    <div className="min-h-screen bg-gray-50">
      <NavigationBar />
      <div className="container mx-auto px-4 py-8 max-w-md">
        <h1 className="text-2xl font-bold mb-6">Your Profile</h1>
        
        <Card className="mb-8">
          <CardHeader>
            <div className="flex items-center justify-center mb-4">
              <div className="relative">
                <Avatar className="h-24 w-24 border-2 border-learngreen-200">
                  <UserCircle className="h-24 w-24 text-gray-400" />
                </Avatar>
                <button className="absolute bottom-0 right-0 bg-learngreen-600 text-white p-1.5 rounded-full border-2 border-white">
                  <Camera className="h-4 w-4" />
                </button>
              </div>
            </div>
            <CardTitle className="text-center">{profileData.name || "Your Name"}</CardTitle>
            <CardDescription className="text-center">{profileData.email}</CardDescription>
          </CardHeader>
          
          <CardContent>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name">Full Name</Label>
                <Input
                  id="name"
                  name="name"
                  value={profileData.name}
                  onChange={handleInputChange}
                  disabled={isLoading}
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  value={profileData.email}
                  disabled={true}
                  className="bg-gray-50"
                />
                <p className="text-xs text-gray-500">Email cannot be changed</p>
              </div>
              
              <Separator className="my-4" />
              
              <div className="space-y-2">
                <Label htmlFor="age">Age</Label>
                <Input
                  id="age"
                  name="age"
                  type="number"
                  value={profileData.age}
                  onChange={handleInputChange}
                  disabled={isLoading}
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="experience">Investment Experience</Label>
                <Select 
                  value={profileData.experience} 
                  onValueChange={(value) => handleSelectChange("experience", value)}
                  disabled={isLoading}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select experience level" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="beginner">Beginner</SelectItem>
                    <SelectItem value="intermediate">Intermediate</SelectItem>
                    <SelectItem value="advanced">Advanced</SelectItem>
                    <SelectItem value="expert">Expert</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="riskTolerance">Risk Tolerance</Label>
                <Select 
                  value={profileData.riskTolerance} 
                  onValueChange={(value) => handleSelectChange("riskTolerance", value)}
                  disabled={isLoading}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select risk tolerance" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="conservative">Conservative</SelectItem>
                    <SelectItem value="moderate">Moderate</SelectItem>
                    <SelectItem value="aggressive">Aggressive</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardContent>
          
          <CardFooter>
            <Button 
              className="w-full bg-learngreen-600 hover:bg-learngreen-700" 
              onClick={handleSaveProfile}
              disabled={isSaving || isLoading}
            >
              {isSaving ? "Saving..." : (
                <>
                  <Save className="mr-2 h-4 w-4" />
                  Save Profile
                </>
              )}
            </Button>
          </CardFooter>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle>Account Statistics</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-gray-600">Trading Level</span>
                <span className="font-semibold">Level 3</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Quizzes Completed</span>
                <span className="font-semibold">5</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Successful Trades</span>
                <span className="font-semibold">12</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Total Return</span>
                <span className="font-semibold text-green-600">+8.75%</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Member Since</span>
                <span className="font-semibold">April 2023</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Profile;
