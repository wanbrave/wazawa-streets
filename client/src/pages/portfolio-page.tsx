import { useAuth } from "@/hooks/use-auth";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
  CircleDollarSign, Landmark, PercentCircle, TrendingUp, 
  Building2, Calculator, Clock, Info, Home 
} from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { Property } from "@shared/schema";
import { Sidebar } from "@/components/sidebar";
import { MobileHeader } from "@/components/mobile-header";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

// Type for portfolio item
type PortfolioItem = {
  id: number;
  userId: number;
  propertyId: number;
  investmentAmount: number;
  dateInvested: string;
  shares: number;
  status: string;
  property: Property;
};

export default function PortfolioPage() {
  const { user } = useAuth();
  const currentDate = new Date();
  const currentMonth = currentDate.toLocaleString('default', { month: 'short' });
  const currentYear = currentDate.getFullYear();

  // Fetch portfolio data
  const { data: portfolioItems, isLoading } = useQuery({
    queryKey: ["/api/portfolio"],
    queryFn: async () => {
      const res = await fetch("/api/portfolio");
      if (!res.ok) throw new Error("Failed to fetch portfolio data");
      return res.json();
    },
  });

  // Calculate portfolio stats
  const calculateStats = () => {
    if (!portfolioItems || portfolioItems.length === 0) {
      return {
        totalInvested: 0,
        totalShares: 0,
        totalMonthlyIncome: 0,
        totalRentalIncome: 0,
        totalAppreciation: 0,
        propertyCount: 0,
        occupancyRate: 0,
        annualRentalYield: 0,
        investedThisYear: 0,
        annualLimit: 367000,
        availableToInvest: 367000
      };
    }

    const totalInvested = portfolioItems.reduce(
      (sum: number, item: PortfolioItem) => sum + item.investmentAmount,
      0
    );
    const totalShares = portfolioItems.reduce(
      (sum: number, item: PortfolioItem) => sum + item.shares,
      0
    );
    
    // Calculated values based on investment amounts
    const totalMonthlyIncome = totalInvested * 0.008; // Assuming 8% annual return distributed monthly
    const totalRentalIncome = totalInvested * 0.09; // 9% annual rental income
    const totalAppreciation = totalInvested * 0.04; // 4% annual appreciation
    
    // Filter investments made in the current year
    const investedThisYear = portfolioItems
      .filter(item => new Date(item.dateInvested).getFullYear() === currentYear)
      .reduce((sum, item) => sum + item.investmentAmount, 0);
    
    const annualLimit = 367000; // Example annual limit in TZS
    const availableToInvest = Math.max(0, annualLimit - investedThisYear);

    const occupancyRate = portfolioItems.length > 0 ? 95 : 0; // Example occupancy rate
    const annualRentalYield = portfolioItems.length > 0 ? 8.5 : 0; // Example annual rental yield

    return {
      totalInvested,
      totalShares,
      totalMonthlyIncome,
      totalRentalIncome,
      totalAppreciation,
      propertyCount: portfolioItems.length,
      occupancyRate,
      annualRentalYield,
      investedThisYear,
      annualLimit,
      availableToInvest
    };
  };

  const stats = calculateStats();

  return (
    <div className="min-h-screen flex">
      <Sidebar />
      <MobileHeader />
      
      <div className="flex-1 flex flex-col md:ml-0 pt-16 md:pt-0">
        <main className="flex-1 overflow-y-auto p-4 md:p-6 bg-gray-50">
          <div className="flex flex-col gap-6">
            {/* Portfolio Value */}
            <Card className="border-0 shadow-sm">
              <CardContent className="p-6">
                <div className="flex items-center gap-2 mb-1">
                  <p className="text-sm font-medium text-gray-600">Portfolio value</p>
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger>
                        <Info className="h-4 w-4 text-gray-400" />
                      </TooltipTrigger>
                      <TooltipContent>
                        <p className="text-xs">The total value of your real estate investments</p>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                </div>
                <h1 className="text-3xl font-bold">TZS {stats.totalInvested.toLocaleString()}</h1>
              </CardContent>
            </Card>

            {/* Key Financials */}
            <div>
              <h2 className="text-xl font-semibold mb-4">Key financials</h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Card className="border-0 shadow-sm">
                  <CardContent className="pt-6">
                    <div className="flex items-center mb-2 gap-2">
                      <Calculator className="h-5 w-5 text-emerald-500" />
                      <p className="text-sm font-medium text-gray-600">Monthly income</p>
                      <TooltipProvider>
                        <Tooltip>
                          <TooltipTrigger>
                            <Info className="h-4 w-4 text-gray-400" />
                          </TooltipTrigger>
                          <TooltipContent>
                            <p className="text-xs">Your estimated monthly rental income</p>
                          </TooltipContent>
                        </Tooltip>
                      </TooltipProvider>
                    </div>
                    <div className="text-xl font-bold">TZS {Math.round(stats.totalMonthlyIncome).toLocaleString()}</div>
                    <p className="text-xs text-gray-500 mt-1">{currentMonth} {currentYear}</p>
                  </CardContent>
                </Card>
                
                <Card className="border-0 shadow-sm">
                  <CardContent className="pt-6">
                    <div className="flex items-center mb-2 gap-2">
                      <Building2 className="h-5 w-5 text-emerald-500" />
                      <p className="text-sm font-medium text-gray-600">Total rental income</p>
                      <TooltipProvider>
                        <Tooltip>
                          <TooltipTrigger>
                            <Info className="h-4 w-4 text-gray-400" />
                          </TooltipTrigger>
                          <TooltipContent>
                            <p className="text-xs">The total rental income earned from your properties</p>
                          </TooltipContent>
                        </Tooltip>
                      </TooltipProvider>
                    </div>
                    <div className="text-xl font-bold">TZS {Math.round(stats.totalRentalIncome).toLocaleString()}</div>
                    <p className="text-xs text-gray-500 mt-1">as of {currentMonth} {currentYear}</p>
                  </CardContent>
                </Card>
                
                <Card className="border-0 shadow-sm">
                  <CardContent className="pt-6">
                    <div className="flex items-center mb-2 gap-2">
                      <TrendingUp className="h-5 w-5 text-emerald-500" />
                      <p className="text-sm font-medium text-gray-600">Total appreciation</p>
                      <TooltipProvider>
                        <Tooltip>
                          <TooltipTrigger>
                            <Info className="h-4 w-4 text-gray-400" />
                          </TooltipTrigger>
                          <TooltipContent>
                            <p className="text-xs">The appreciation in value of your property portfolio</p>
                          </TooltipContent>
                        </Tooltip>
                      </TooltipProvider>
                    </div>
                    <div className="text-xl font-bold">TZS {Math.round(stats.totalAppreciation).toLocaleString()}</div>
                    <p className="text-xs text-gray-500 mt-1">as of {currentMonth} {currentYear}</p>
                  </CardContent>
                </Card>
              </div>
            </div>

            {/* Quick Insights & Investment Limit */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Quick Insights */}
              <div>
                <h2 className="text-xl font-semibold mb-4">Quick insights</h2>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <Card className="border-0 shadow-sm">
                    <CardContent className="p-4">
                      <div className="flex items-center mb-2">
                        <Home className="h-5 w-5 text-blue-500 mr-2" />
                        <p className="text-sm">Number of properties</p>
                      </div>
                      <p className="text-xl font-bold">{stats.propertyCount}</p>
                    </CardContent>
                  </Card>
                  
                  <Card className="border-0 shadow-sm">
                    <CardContent className="p-4">
                      <div className="flex items-center mb-2">
                        <Building2 className="h-5 w-5 text-blue-500 mr-2" />
                        <p className="text-sm">Occupancy rate</p>
                        <TooltipProvider>
                          <Tooltip>
                            <TooltipTrigger>
                              <Info className="h-4 w-4 text-gray-400 ml-1" />
                            </TooltipTrigger>
                            <TooltipContent>
                              <p className="text-xs">The percentage of your properties that are occupied</p>
                            </TooltipContent>
                          </Tooltip>
                        </TooltipProvider>
                      </div>
                      <p className="text-xl font-bold">{stats.occupancyRate}%</p>
                    </CardContent>
                  </Card>
                  
                  <Card className="border-0 shadow-sm">
                    <CardContent className="p-4">
                      <div className="flex items-center mb-2">
                        <TrendingUp className="h-5 w-5 text-blue-500 mr-2" />
                        <p className="text-sm">Annual rental yield</p>
                        <TooltipProvider>
                          <Tooltip>
                            <TooltipTrigger>
                              <Info className="h-4 w-4 text-gray-400 ml-1" />
                            </TooltipTrigger>
                            <TooltipContent>
                              <p className="text-xs">The annual return on your investments from rental income</p>
                            </TooltipContent>
                          </Tooltip>
                        </TooltipProvider>
                      </div>
                      <p className="text-xl font-bold">{stats.annualRentalYield}%</p>
                    </CardContent>
                  </Card>
                </div>
              </div>
              
              {/* Annual Investment Limit */}
              <div>
                <div className="flex items-center">
                  <h2 className="text-xl font-semibold mb-4">Annual investment limit</h2>
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger>
                        <Info className="h-4 w-4 text-gray-400 ml-2 mb-4" />
                      </TooltipTrigger>
                      <TooltipContent>
                        <p className="text-xs">The maximum amount you can invest in real estate per year</p>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                </div>
                
                <Card className="border-0 shadow-sm">
                  <CardContent className="p-6">
                    <div className="mb-4">
                      <p className="text-sm text-gray-500 mb-1">{Math.round((stats.investedThisYear / stats.annualLimit) * 100)}% of limit used</p>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div 
                          className="bg-green-500 h-2 rounded-full" 
                          style={{ width: `${Math.min(100, Math.round((stats.investedThisYear / stats.annualLimit) * 100))}%` }}>
                        </div>
                      </div>
                    </div>
                    
                    <div className="space-y-2">
                      <div className="flex justify-between items-center">
                        <p className="text-sm">Annual limit</p>
                        <p className="text-sm font-semibold">TZS {stats.annualLimit.toLocaleString()}</p>
                      </div>
                      <div className="flex justify-between items-center">
                        <div className="flex items-center">
                          <span className="inline-block w-2 h-2 bg-green-500 rounded-full mr-2"></span>
                          <p className="text-sm">Invested in the last 12 months</p>
                        </div>
                        <p className="text-sm">TZS {Math.round(stats.investedThisYear).toLocaleString()}</p>
                      </div>
                      <div className="flex justify-between items-center">
                        <div className="flex items-center">
                          <span className="inline-block w-2 h-2 bg-blue-500 rounded-full mr-2"></span>
                          <p className="text-sm">Available to invest</p>
                        </div>
                        <p className="text-sm font-semibold">TZS {Math.round(stats.availableToInvest).toLocaleString()}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>

            {/* My Stakes */}
            <div>
              <h2 className="text-xl font-semibold mb-4">My Stakes</h2>
              
              <Card className="border-0 shadow-sm">
                <CardContent className="p-0">
                  <div className="grid grid-cols-5 gap-4 p-4 border-b font-medium text-gray-600 text-sm">
                    <div>Property</div>
                    <div>Location</div>
                    <div>Investment value</div>
                    <div>Total rental income</div>
                    <div>Status</div>
                  </div>
                  
                  {isLoading ? (
                    <div className="text-center py-12">
                      <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
                      <p className="mt-4 text-gray-600">Loading your portfolio...</p>
                    </div>
                  ) : portfolioItems?.length > 0 ? (
                    <div>
                      {portfolioItems.map((item: PortfolioItem) => (
                        <div key={item.id} className="grid grid-cols-5 gap-4 p-4 border-b text-sm">
                          <div className="font-medium">{item.property.title}</div>
                          <div>{item.property.location}</div>
                          <div>TZS {item.investmentAmount.toLocaleString()}</div>
                          <div>TZS {Math.round(item.investmentAmount * 0.09).toLocaleString()}</div>
                          <div>
                            <Badge className={`
                              ${item.status === 'active' ? 'bg-green-100 text-green-800' : 
                                item.status === 'pending' ? 'bg-amber-100 text-amber-800' : 
                                'bg-blue-100 text-blue-800'}
                              rounded-md px-2 py-1
                            `}>
                              {item.status.charAt(0).toUpperCase() + item.status.slice(1)}
                            </Badge>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="flex flex-col items-center justify-center py-20">
                      <Clock className="h-12 w-12 text-gray-300 mb-4" />
                      <p className="text-center text-lg font-medium">No investments found</p>
                      <p className="text-center text-gray-500 mt-1 max-w-md">
                        Make the most of our secondary listings and buy shares at a great discount. Available on the mobile app only.
                      </p>
                      <p className="text-center text-gray-500 mt-4">
                        Don't miss out on this opportunity.
                      </p>
                      <div className="mt-8">
                        <p className="text-sm text-gray-600 mb-1">Next window</p>
                        <p className="font-medium">5 May 2025, 23:00</p>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}