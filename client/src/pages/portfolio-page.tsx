import { useAuth } from "@/hooks/use-auth";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { CircleDollarSign, Landmark, PercentCircle, TrendingUp } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { Property } from "@shared/schema";
import { Sidebar } from "@/components/sidebar";
import { MobileHeader } from "@/components/mobile-header";

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
        avgYearlyReturn: 0,
        propertyCount: 0
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
    const totalYearlyReturn = portfolioItems.reduce(
      (sum: number, item: PortfolioItem) => sum + item.property.yearlyReturn,
      0
    );
    const avgYearlyReturn = 
      portfolioItems.length > 0 ? totalYearlyReturn / portfolioItems.length : 0;

    return {
      totalInvested,
      totalShares,
      avgYearlyReturn,
      propertyCount: portfolioItems.length
    };
  };

  const stats = calculateStats();

  return (
    <div className="min-h-screen flex">
      <Sidebar />
      <MobileHeader />
      
      <div className="flex-1 flex flex-col md:ml-0 pt-16 md:pt-0">
        <main className="flex-1 overflow-y-auto p-4 md:p-6 bg-neutral-100">
          <div className="flex flex-col gap-8">
            <div>
              <h1 className="text-3xl font-bold mb-2">My Portfolio</h1>
              <p className="text-muted-foreground">
                Track and manage your real estate investments
              </p>
            </div>

        {/* Portfolio Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Total Invested
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {isLoading ? "Loading..." : `TZS ${stats.totalInvested.toLocaleString()}`}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Total Shares
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {isLoading ? "Loading..." : stats.totalShares.toLocaleString()}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Avg. Yearly Return
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {isLoading ? "Loading..." : `${stats.avgYearlyReturn.toFixed(2)}%`}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Properties
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {isLoading ? "Loading..." : stats.propertyCount}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Portfolio Items */}
        <Card>
          <CardHeader>
            <CardTitle>My Investments</CardTitle>
            <CardDescription>Your active real estate investments</CardDescription>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="text-center py-4">Loading investments...</div>
            ) : portfolioItems?.length > 0 ? (
              <div className="space-y-6">
                {portfolioItems.map((item: PortfolioItem) => (
                  <div key={item.id} className="rounded-lg border p-4">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div className="md:col-span-2">
                        <div className="flex items-center gap-2 mb-2">
                          <h3 className="text-lg font-semibold">{item.property.title}</h3>
                          <Badge variant="outline">{item.status}</Badge>
                        </div>
                        <p className="text-sm text-muted-foreground mb-4">
                          {item.property.location}, {item.property.city}
                        </p>
                        <div className="grid grid-cols-2 gap-4">
                          <div className="flex items-center gap-2">
                            <CircleDollarSign className="h-4 w-4 text-muted-foreground" />
                            <div className="text-sm">
                              <p className="font-medium">Investment</p>
                              <p>TZS {item.investmentAmount.toLocaleString()}</p>
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            <Landmark className="h-4 w-4 text-muted-foreground" />
                            <div className="text-sm">
                              <p className="font-medium">Shares</p>
                              <p>{item.shares.toLocaleString()}</p>
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            <TrendingUp className="h-4 w-4 text-muted-foreground" />
                            <div className="text-sm">
                              <p className="font-medium">Yearly Return</p>
                              <p>{item.property.yearlyReturn}%</p>
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            <PercentCircle className="h-4 w-4 text-muted-foreground" />
                            <div className="text-sm">
                              <p className="font-medium">Projected Yield</p>
                              <p>{item.property.projectedYield}%</p>
                            </div>
                          </div>
                        </div>
                      </div>
                      <div className="flex flex-col justify-between">
                        <div>
                          <p className="text-sm font-medium">Investment Date</p>
                          <p className="text-sm text-muted-foreground">
                            {formatDistanceToNow(new Date(item.dateInvested), { addSuffix: true })}
                          </p>
                        </div>
                        <div className="mt-4 md:mt-0">
                          <p className="text-sm font-medium">Property Type</p>
                          <p className="text-sm text-muted-foreground">{item.property.type}</p>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <h3 className="text-lg font-medium mb-2">No investments yet</h3>
                <p className="text-muted-foreground mb-6">
                  Explore available properties and start building your portfolio.
                </p>
              </div>
            )}
          </CardContent>
        </Card>
          </div>
        </main>
      </div>
    </div>
  );
}