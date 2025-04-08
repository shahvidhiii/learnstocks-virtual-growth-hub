
import { useState } from "react";
import { Link } from "react-router-dom";
import {
  NavigationMenu,
  NavigationMenuContent,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  NavigationMenuTrigger,
} from "@/components/ui/navigation-menu";
import { cn } from "@/lib/utils";
import { BookOpen, ChevronDown, PieChart } from "lucide-react";

const MainMenu = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  return (
    <NavigationMenu>
      <NavigationMenuList>
        <NavigationMenuItem>
          <NavigationMenuTrigger onClick={() => setIsMenuOpen(!isMenuOpen)} className="text-learngreen-600">
            LearnStocks
          </NavigationMenuTrigger>
          <NavigationMenuContent>
            <ul className="grid w-[320px] gap-3 p-4 md:w-[400px] md:grid-cols-2">
              <li>
                <Link to="/diversification">
                  <NavigationMenuLink className={cn(
                    "block select-none space-y-1 rounded-md p-3 hover:bg-learngreen-50 hover:text-learngreen-700"
                  )}>
                    <div className="flex items-center">
                      <PieChart className="h-4 w-4 mr-2 text-learngreen-600" />
                      <div className="text-sm font-medium">Portfolio Diversification</div>
                    </div>
                    <p className="text-xs text-gray-500">
                      FDs, Gold, IPOs, NCDs, and Bonds
                    </p>
                  </NavigationMenuLink>
                </Link>
              </li>
              <li>
                <Link to="/learning">
                  <NavigationMenuLink className={cn(
                    "block select-none space-y-1 rounded-md p-3 hover:bg-learngreen-50 hover:text-learngreen-700"
                  )}>
                    <div className="flex items-center">
                      <BookOpen className="h-4 w-4 mr-2 text-learngreen-600" />
                      <div className="text-sm font-medium">Learning & Knowledge</div>
                    </div>
                    <p className="text-xs text-gray-500">
                      Courses and Webinars
                    </p>
                  </NavigationMenuLink>
                </Link>
              </li>
              <li className="col-span-2">
                <Link to="/more">
                  <NavigationMenuLink className={cn(
                    "block select-none space-y-1 rounded-md p-3 hover:bg-learngreen-50 hover:text-learngreen-700"
                  )}>
                    <div className="flex items-center">
                      <ChevronDown className="h-4 w-4 mr-2 text-learngreen-600" />
                      <div className="text-sm font-medium">More Options</div>
                    </div>
                    <p className="text-xs text-gray-500">
                      Account settings, help and more
                    </p>
                  </NavigationMenuLink>
                </Link>
              </li>
            </ul>
          </NavigationMenuContent>
        </NavigationMenuItem>
      </NavigationMenuList>
    </NavigationMenu>
  );
};

export default MainMenu;
