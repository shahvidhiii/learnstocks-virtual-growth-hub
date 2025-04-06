
import NavigationBar from "@/components/NavigationBar";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { PieChart, BookOpen, Medal, Calendar, PiggyBank, ArrowRight, Landmark, FileText } from "lucide-react";
import { Link } from "react-router-dom";
import { cn } from "@/lib/utils";

const More = () => {
  const categories = [
    {
      title: "Portfolio Diversification",
      description: "Explore alternative investment options beyond stocks",
      href: "/diversification",
      icon: PieChart,
      color: "bg-blue-100 text-blue-600",
      items: [
        { name: "Fixed Deposits", href: "/diversification/fd" },
        { name: "Gold Investments", href: "/diversification/gold" },
        { name: "IPOs", href: "/diversification/ipo" },
        { name: "Bonds & NCDs", href: "/diversification/bonds" },
      ]
    },
    {
      title: "Learning & Knowledge",
      description: "Educational resources to improve your investment skills",
      href: "/learning",
      icon: BookOpen,
      color: "bg-purple-100 text-purple-600",
      items: [
        { name: "Courses", href: "/learning/courses" },
        { name: "Webinars", href: "/learning/webinars" },
        { name: "Market Glossary", href: "/learning/glossary" },
        { name: "Investment Strategies", href: "/learning/strategies" },
      ]
    },
    {
      title: "Achievements",
      description: "Track your progress and unlock rewards",
      href: "/achievements",
      icon: Medal,
      color: "bg-amber-100 text-amber-600",
      items: [
        { name: "Badges", href: "/achievements/badges" },
        { name: "Leaderboard", href: "/achievements/leaderboard" },
        { name: "Challenges", href: "/achievements/challenges" },
        { name: "Rewards", href: "/achievements/rewards" },
      ]
    },
    {
      title: "Events",
      description: "Join upcoming financial events and webinars",
      href: "/events",
      icon: Calendar,
      color: "bg-green-100 text-green-600",
      items: [
        { name: "Upcoming Webinars", href: "/events/webinars" },
        { name: "Challenges", href: "/events/challenges" },
        { name: "Live Sessions", href: "/events/live" },
      ]
    },
  ];

  const featuredResources = [
    {
      title: "Introduction to Bonds",
      description: "Learn about government and corporate bonds",
      type: "Course",
      duration: "30 mins",
      image: "https://placehold.co/300x200/f0f4f8/a0aec0?text=Bonds+101"
    },
    {
      title: "Gold Investment Guide",
      description: "Different ways to invest in gold",
      type: "Guide",
      duration: "15 mins",
      image: "https://placehold.co/300x200/fff9e6/e6b400?text=Gold+Guide"
    },
    {
      title: "Understanding IPOs",
      description: "How to evaluate and invest in IPOs",
      type: "Webinar",
      duration: "45 mins",
      image: "https://placehold.co/300x200/e6f7ff/0099ff?text=IPO+Guide"
    },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      <NavigationBar />
      
      <main className="container mx-auto px-4 py-6">
        <h1 className="text-2xl font-bold mb-6">More Options</h1>
        
        {/* Categories Grid */}
        <div className="grid md:grid-cols-2 gap-6 mb-8">
          {categories.map((category) => (
            <Card key={category.title} className="overflow-hidden">
              <CardHeader>
                <div className="flex items-start">
                  <div className={cn("p-3 rounded-lg mr-4", category.color)}>
                    <category.icon className="h-6 w-6" />
                  </div>
                  <div>
                    <CardTitle>{category.title}</CardTitle>
                    <CardDescription>{category.description}</CardDescription>
                  </div>
                </div>
              </CardHeader>
              
              <CardContent>
                <ul className="grid grid-cols-2 gap-2">
                  {category.items.map((item) => (
                    <li key={item.name}>
                      <Link 
                        to={item.href} 
                        className="flex items-center p-2 rounded-md hover:bg-gray-100 transition-colors"
                      >
                        <ArrowRight className="h-4 w-4 mr-2 text-gray-500" />
                        <span>{item.name}</span>
                      </Link>
                    </li>
                  ))}
                </ul>
              </CardContent>
              
              <CardFooter className="bg-gray-50 border-t">
                <Link 
                  to={category.href}
                  className="w-full text-center text-sm font-medium text-learngreen-600 hover:text-learngreen-700"
                >
                  View All Options
                </Link>
              </CardFooter>
            </Card>
          ))}
        </div>
        
        {/* Featured Resources */}
        <h2 className="text-xl font-semibold mb-4">Featured Resources</h2>
        
        <div className="grid md:grid-cols-3 gap-4 mb-8">
          {featuredResources.map((resource) => (
            <Card key={resource.title} className="overflow-hidden">
              <img 
                src={resource.image} 
                alt={resource.title} 
                className="w-full h-40 object-cover"
              />
              <CardContent className="pt-4">
                <div className="flex items-center mb-2">
                  <Badge className="bg-learngreen-100 text-learngreen-700 mr-2">
                    {resource.type}
                  </Badge>
                  <span className="text-xs text-gray-500">{resource.duration}</span>
                </div>
                <h3 className="font-semibold mb-1">{resource.title}</h3>
                <p className="text-sm text-gray-600">{resource.description}</p>
              </CardContent>
              <CardFooter className="pt-0">
                <Link 
                  to="#"
                  className="text-sm font-medium text-learngreen-600 hover:text-learngreen-700 flex items-center"
                >
                  Start Learning
                  <ArrowRight className="h-4 w-4 ml-1" />
                </Link>
              </CardFooter>
            </Card>
          ))}
        </div>
        
        {/* Quick Links */}
        <h2 className="text-xl font-semibold mb-4">Quick Links</h2>
        
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Link to="/diversification/fd" className="p-4 bg-white border rounded-lg hover:shadow-md transition-shadow flex flex-col items-center text-center">
            <div className="bg-blue-100 p-3 rounded-full mb-2">
              <Landmark className="h-6 w-6 text-blue-600" />
            </div>
            <span className="font-medium">Fixed Deposits</span>
          </Link>
          
          <Link to="/diversification/gold" className="p-4 bg-white border rounded-lg hover:shadow-md transition-shadow flex flex-col items-center text-center">
            <div className="bg-amber-100 p-3 rounded-full mb-2">
              <PiggyBank className="h-6 w-6 text-amber-600" />
            </div>
            <span className="font-medium">Gold Investments</span>
          </Link>
          
          <Link to="/diversification/ipo" className="p-4 bg-white border rounded-lg hover:shadow-md transition-shadow flex flex-col items-center text-center">
            <div className="bg-green-100 p-3 rounded-full mb-2">
              <FileText className="h-6 w-6 text-green-600" />
            </div>
            <span className="font-medium">IPOs</span>
          </Link>
          
          <Link to="/diversification/bonds" className="p-4 bg-white border rounded-lg hover:shadow-md transition-shadow flex flex-col items-center text-center">
            <div className="bg-purple-100 p-3 rounded-full mb-2">
              <BookOpen className="h-6 w-6 text-purple-600" />
            </div>
            <span className="font-medium">Bonds & NCDs</span>
          </Link>
        </div>
      </main>
    </div>
  );
};

export default More;
