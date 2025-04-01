import { useParams, Link } from "wouter";
import { Sidebar } from "@/components/sidebar";
import { MobileHeader } from "@/components/mobile-header";
import { PropertyMetrics } from "@/components/property-metrics";
import { useQuery } from "@tanstack/react-query";
import { Property } from "@shared/schema";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Slider } from "@/components/ui/slider";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  ArrowLeft, MapPin, Home, Building2, DollarSign, Info, Calculator,
  BadgeCheck, Clock, CalendarDays, BarChart3, Building, Map, FileText
} from "lucide-react";
import { 
  Tooltip, 
  TooltipContent, 
  TooltipProvider, 
  TooltipTrigger 
} from "@/components/ui/tooltip";

export default function PropertyDetails() {
  const { id } = useParams();
  const { data: property, isLoading } = useQuery<Property>({
    queryKey: [`/api/properties/${id}`],
  });

  if (isLoading) {
    return (
      <div className="min-h-screen flex">
        <Sidebar />
        <MobileHeader />
        
        <div className="flex-1 flex flex-col md:ml-0 pt-16 md:pt-0">
          <main className="flex-1 overflow-y-auto p-4 md:p-6 bg-neutral-100">
            <div className="max-w-5xl mx-auto">
              <div className="mb-6">
                <Skeleton className="h-8 w-64 mb-2" />
                <Skeleton className="h-4 w-40" />
              </div>
              
              <Skeleton className="h-80 w-full rounded-lg mb-6" />
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
                <Skeleton className="h-40 w-full rounded-lg" />
                <Skeleton className="h-40 w-full rounded-lg" />
                <Skeleton className="h-40 w-full rounded-lg" />
              </div>
              
              <div className="mb-6">
                <Skeleton className="h-6 w-40 mb-2" />
                <Skeleton className="h-24 w-full" />
              </div>
              
              <Skeleton className="h-12 w-full rounded-md" />
            </div>
          </main>
        </div>
      </div>
    );
  }

  if (!property) {
    return (
      <div className="min-h-screen flex">
        <Sidebar />
        <MobileHeader />
        
        <div className="flex-1 flex flex-col md:ml-0 pt-16 md:pt-0">
          <main className="flex-1 overflow-y-auto p-4 md:p-6 bg-neutral-100">
            <div className="max-w-5xl mx-auto text-center py-12">
              <h2 className="text-2xl font-bold text-gray-800 mb-2">Property Not Found</h2>
              <p className="text-gray-600 mb-6">The property you're looking for doesn't exist or has been removed.</p>
              <Link href="/" asChild>
                <Button>
                  <ArrowLeft className="mr-2 h-4 w-4" />
                  Back to Properties
                </Button>
              </Link>
            </div>
          </main>
        </div>
      </div>
    );
  }

  // Calculate additional metrics
  const priceNumeric = typeof property.price === 'string' 
    ? parseFloat(property.price.replace(/[^0-9.]/g, '')) 
    : property.price;
    
  const monthlyRentalIncome = (priceNumeric * (property.yearlyReturn / 100)) / 12;
  const fiveYearReturn = priceNumeric * ((1 + property.totalReturn / 100) ** 5 - 1);
  const estimatedMonthlyEarnings = monthlyRentalIncome * (property.projectedYield / 100);

  // Investment strategy descriptions
  const strategies = {
    balanced: "A combination of rental income, property management expertise, and capital appreciation.",
    rental: "Premium neighborhoods combined with prime location ensures high occupancy and rental income.",
    appreciation: "Major construction within 500m radius of the property increases its value appreciation."
  };

  return (
    <div className="min-h-screen flex">
      <Sidebar />
      <MobileHeader />
      
      <div className="flex-1 flex flex-col md:ml-0 pt-16 md:pt-0">
        <main className="flex-1 overflow-y-auto p-4 md:p-6 bg-gray-50">
          <div className="max-w-5xl mx-auto">
            <div className="flex flex-col md:flex-row mb-6 gap-6">
              {/* Left column - Property main info and image */}
              <div className="md:w-2/3">
                <Link 
                  href="/" 
                  className="inline-flex items-center text-gray-600 hover:text-gray-900 mb-4"
                >
                  <ArrowLeft className="mr-2 h-4 w-4" />
                  Back to Properties
                </Link>
                
                <h1 className="text-2xl font-bold text-gray-800 mb-2">{property.title}</h1>
                <div className="flex items-center text-gray-600 mb-4">
                  <MapPin className="h-4 w-4 mr-1" />
                  <span>{property.location}, {property.city}</span>
                </div>
                
                {/* Image gallery */}
                <div className="relative mb-4">
                  <div className="rounded-lg overflow-hidden mb-2">
                    <img 
                      src={property.imageUrl} 
                      alt={property.title}
                      className="w-full h-[300px] md:h-[400px] object-cover"
                    />
                  </div>
                  
                  {/* Thumbnail gallery */}
                  <div className="grid grid-cols-5 gap-2">
                    <div className="aspect-square rounded-md overflow-hidden">
                      <img src={property.imageUrl} alt="" className="object-cover w-full h-full" />
                    </div>
                    {/* Placeholder thumbnails */}
                    {[...Array(4)].map((_, i) => (
                      <div key={i} className="aspect-square bg-gray-200 rounded-md overflow-hidden">
                        <img 
                          src={`https://source.unsplash.com/random/300x300?property,interior&sig=${i}`} 
                          alt="" 
                          className="object-cover w-full h-full" 
                        />
                      </div>
                    ))}
                  </div>
                </div>
                
                {/* How it works section */}
                <div className="bg-white rounded-lg shadow-sm p-5 mb-6">
                  <h2 className="text-lg font-semibold mb-4">How it works</h2>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="flex items-start">
                      <div className="bg-green-100 rounded-full p-2 mr-3">
                        <BadgeCheck className="h-5 w-5 text-green-600" />
                      </div>
                      <div>
                        <h3 className="font-medium text-sm">Property managed professionally</h3>
                        <p className="text-xs text-gray-500 mt-1">Local property managers maintain your property</p>
                      </div>
                    </div>
                    <div className="flex items-start">
                      <div className="bg-blue-100 rounded-full p-2 mr-3">
                        <Clock className="h-5 w-5 text-blue-600" />
                      </div>
                      <div>
                        <h3 className="font-medium text-sm">Rentals paid on time</h3>
                        <p className="text-xs text-gray-500 mt-1">Rental collection and disbursement is automated</p>
                      </div>
                    </div>
                    <div className="flex items-start">
                      <div className="bg-purple-100 rounded-full p-2 mr-3">
                        <CalendarDays className="h-5 w-5 text-purple-600" />
                      </div>
                      <div>
                        <h3 className="font-medium text-sm">Predictable income</h3>
                        <p className="text-xs text-gray-500 mt-1">Monthly rental proceeds are sent to your wallet</p>
                      </div>
                    </div>
                  </div>
                </div>
                
                {/* Investment strategy */}
                <div className="bg-white rounded-lg shadow-sm p-5 mb-6">
                  <h2 className="text-lg font-semibold mb-4">Investment strategy</h2>
                  
                  <div className="mb-5 bg-amber-50 border border-amber-200 rounded-lg p-4">
                    <h3 className="font-medium text-amber-800 flex items-center">
                      <BarChart3 className="h-5 w-5 mr-2 text-amber-600" />
                      Balanced
                    </h3>
                    <p className="text-sm text-gray-700 mt-2">{strategies.balanced}</p>
                  </div>
                  
                  <div className="mb-5">
                    <h3 className="font-medium flex items-center mb-2">
                      <Building className="h-5 w-5 mr-2 text-blue-600" />
                      Premium neighborhood
                    </h3>
                    <p className="text-sm text-gray-600">
                      The area has a high density of expatriates and business travellers, ensuring consistent rental demand.
                    </p>
                  </div>
                  
                  <div>
                    <h3 className="font-medium flex items-center mb-2">
                      <Map className="h-5 w-5 mr-2 text-blue-600" />
                      Major construction within 500m
                    </h3>
                    <p className="text-sm text-gray-600">
                      A new commercial complex is under construction nearby, which is expected to improve property values in the area.
                    </p>
                  </div>
                </div>
                
                {/* Investment calculator */}
                <div className="bg-white rounded-lg shadow-sm p-5 mb-6">
                  <div className="flex items-center mb-4">
                    <h2 className="text-lg font-semibold">Investment calculator</h2>
                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger>
                          <Info className="h-4 w-4 text-gray-400 ml-2" />
                        </TooltipTrigger>
                        <TooltipContent>
                          <p className="text-xs max-w-xs">Estimate your potential returns based on investment amount and time period</p>
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                  </div>
                  
                  <div className="text-sm font-medium mb-4">
                    Projected returns over period of:
                    <span className="text-green-600 ml-1">5 years</span>
                  </div>
                  
                  <div className="flex flex-col md:flex-row mb-6 gap-4">
                    <div className="md:w-1/2">
                      {/* Sliders */}
                      <div className="mb-4">
                        <div className="flex justify-between mb-2">
                          <label className="text-sm">Investment amount</label>
                          <span className="text-sm font-medium">TZS 200,000</span>
                        </div>
                        <Slider defaultValue={[50]} max={100} step={1} className="mb-1" />
                      </div>
                      
                      <div className="mb-4">
                        <div className="flex justify-between mb-2">
                          <label className="text-sm">Annual rental yield</label>
                          <span className="text-sm font-medium">{property.projectedYield}%</span>
                        </div>
                        <Slider defaultValue={[property.projectedYield]} max={20} step={0.1} className="mb-1" />
                      </div>
                      
                      <div className="mb-4">
                        <div className="flex justify-between mb-2">
                          <label className="text-sm">Annual property value appreciation</label>
                          <span className="text-sm font-medium">5.7%</span>
                        </div>
                        <Slider defaultValue={[5.7]} max={10} step={0.1} className="mb-1" />
                      </div>
                      
                      <div>
                        <div className="flex justify-between mb-2">
                          <label className="text-sm">Annual maintenance + fees</label>
                          <span className="text-sm font-medium">2.4%</span>
                        </div>
                        <Slider defaultValue={[2.4]} max={5} step={0.1} className="mb-1" />
                      </div>
                    </div>
                    
                    <div className="md:w-1/2">
                      {/* Chart */}
                      <div className="border rounded-lg h-56 p-3 flex flex-col">
                        <div className="text-xs text-gray-500 mb-2">Returns over time (TZS)</div>
                        
                        <div className="flex-1 flex items-end">
                          {/* Bar chart */}
                          {[1, 2, 3, 4, 5].map((year) => (
                            <div key={year} className="flex-1 flex flex-col items-center">
                              <div className="w-full flex flex-col items-center">
                                <div className="w-4/5 bg-green-100 rounded-t-sm" style={{ height: `${10 + year * 12}px` }}></div>
                                <div className="w-4/5 bg-green-300 rounded-b-sm" style={{ height: `${8 + year * 9}px` }}></div>
                                <div className="w-4/5 bg-green-500" style={{ height: `${5 + year * 6}px` }}></div>
                                <div className="w-4/5 bg-gray-800" style={{ height: "20px" }}></div>
                              </div>
                              <div className="text-xs mt-1">Y{year}</div>
                            </div>
                          ))}
                        </div>
                        
                        {/* Legend */}
                        <div className="flex flex-wrap gap-x-4 gap-y-1 mt-2 text-xs">
                          <div className="flex items-center">
                            <div className="w-2 h-2 bg-green-500 mr-1"></div>
                            <span>Rental income</span>
                          </div>
                          <div className="flex items-center">
                            <div className="w-2 h-2 bg-green-300 mr-1"></div>
                            <span>Value appreciation</span>
                          </div>
                          <div className="flex items-center">
                            <div className="w-2 h-2 bg-green-100 mr-1"></div>
                            <span>Tax savings</span>
                          </div>
                          <div className="flex items-center">
                            <div className="w-2 h-2 bg-gray-800 mr-1"></div>
                            <span>Principal</span>
                          </div>
                        </div>
                      </div>
                      
                      {/* Summary stats */}
                      <div className="grid grid-cols-2 gap-2 mt-4">
                        <div className="border rounded p-2">
                          <div className="text-xs text-gray-500">Total return</div>
                          <div className="font-medium">TZS {Math.round(fiveYearReturn).toLocaleString()}</div>
                        </div>
                        <div className="border rounded p-2">
                          <div className="text-xs text-gray-500">Value appreciation</div>
                          <div className="font-medium">28.5%</div>
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  <div className="text-xs text-gray-500 italic">
                    * Return calculations are estimates and not guaranteed. Past performance is not indicative of future results.
                  </div>
                </div>
                
                {/* Property Overview */}
                <div className="bg-white rounded-lg shadow-sm p-5 mb-6">
                  <h2 className="text-lg font-semibold mb-4">Property Overview</h2>
                  <p className="text-sm text-gray-600 mb-4">
                    This {property.bedrooms} bedroom apartment in {property.location}, {property.city} offers an excellent investment opportunity with projected returns of {property.yearlyReturn.toFixed(2)}% annually. 
                  </p>
                  
                  <div className="border-t pt-4 mt-4">
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-y-3 gap-x-4 text-sm">
                      <div>
                        <div className="text-gray-500">Property Type</div>
                        <div className="font-medium">{property.type}</div>
                      </div>
                      <div>
                        <div className="text-gray-500">Bedrooms</div>
                        <div className="font-medium">{property.bedrooms}</div>
                      </div>
                      <div>
                        <div className="text-gray-500">Bathrooms</div>
                        <div className="font-medium">{property.bedrooms > 1 ? 2 : 1}</div>
                      </div>
                      <div>
                        <div className="text-gray-500">Floor area</div>
                        <div className="font-medium">112 sqm</div>
                      </div>
                      <div>
                        <div className="text-gray-500">Year built</div>
                        <div className="font-medium">2020</div>
                      </div>
                      <div>
                        <div className="text-gray-500">Parking</div>
                        <div className="font-medium">1 space</div>
                      </div>
                    </div>
                  </div>
                </div>
                
                {/* Leasing strategy */}
                <div className="bg-white rounded-lg shadow-sm p-5 mb-6">
                  <h2 className="text-lg font-semibold mb-4">Leasing strategy</h2>
                  
                  <div className="mb-4">
                    <h3 className="font-medium text-sm mb-2">Long term rental</h3>
                    <p className="text-sm text-gray-600">
                      The property will be rented on a long-term basis to provide consistent monthly returns to the investors.
                    </p>
                  </div>
                  
                  <table className="w-full text-sm border-collapse">
                    <tbody>
                      <tr className="border-b">
                        <td className="py-2 text-gray-500">Monthly income</td>
                        <td className="py-2 font-medium text-right">TZS {Math.round(monthlyRentalIncome).toLocaleString()}</td>
                      </tr>
                      <tr className="border-b">
                        <td className="py-2 text-gray-500">Yearly income</td>
                        <td className="py-2 font-medium text-right">TZS {Math.round(monthlyRentalIncome * 12).toLocaleString()}</td>
                      </tr>
                      <tr>
                        <td className="py-2 text-gray-500">Estimated monthly earnings*</td>
                        <td className="py-2 font-medium text-right text-green-600">TZS {Math.round(estimatedMonthlyEarnings).toLocaleString()}</td>
                      </tr>
                    </tbody>
                  </table>
                  
                  <p className="text-xs text-gray-500 italic mt-2">
                    * Earnings are calculated after property management fees, maintenance, and platform fees.
                  </p>
                </div>
                
                {/* Funding timeline */}
                <div className="bg-white rounded-lg shadow-sm p-5 mb-6">
                  <h2 className="text-lg font-semibold mb-4">Funding timeline</h2>
                  
                  <div className="flex mb-2">
                    <div className="w-6 h-6 rounded-full bg-green-500 flex items-center justify-center text-white text-xs">1</div>
                    <div className="ml-3">
                      <h3 className="font-medium text-sm">Listed for funding</h3>
                      <p className="text-xs text-gray-500">Property is available for investors to purchase shares</p>
                    </div>
                  </div>
                  
                  <div className="w-px h-5 bg-gray-300 ml-3"></div>
                  
                  <div className="flex mb-2">
                    <div className="w-6 h-6 rounded-full bg-gray-200 flex items-center justify-center text-gray-600 text-xs">2</div>
                    <div className="ml-3">
                      <h3 className="font-medium text-sm">Reservation and verification</h3>
                      <p className="text-xs text-gray-500">Documentation verified and prepared for transfer</p>
                    </div>
                  </div>
                  
                  <div className="w-px h-5 bg-gray-300 ml-3"></div>
                  
                  <div className="flex mb-2">
                    <div className="w-6 h-6 rounded-full bg-gray-200 flex items-center justify-center text-gray-600 text-xs">3</div>
                    <div className="ml-3">
                      <h3 className="font-medium text-sm">Onboarding and handover</h3>
                      <p className="text-xs text-gray-500">Property inspected and onboarded for management</p>
                    </div>
                  </div>
                  
                  <div className="w-px h-5 bg-gray-300 ml-3"></div>
                  
                  <div className="flex">
                    <div className="w-6 h-6 rounded-full bg-gray-200 flex items-center justify-center text-gray-600 text-xs">4</div>
                    <div className="ml-3">
                      <h3 className="font-medium text-sm">Rental disbursements begin</h3>
                      <p className="text-xs text-gray-500">First rental payment distributed to investors</p>
                    </div>
                  </div>
                </div>
                
                {/* Location */}
                <div className="bg-white rounded-lg shadow-sm p-5 mb-6">
                  <h2 className="text-lg font-semibold mb-4">Location</h2>
                  
                  <div className="rounded-lg overflow-hidden h-64 bg-gray-200 mb-4">
                    {/* Map placeholder */}
                    <img 
                      src="https://api.mapbox.com/styles/v1/mapbox/streets-v11/static/39.2083,6.7927,14,0/600x400?access_token=pk.eyJ1IjoiZXhhbXBsZXRva2VuIiwiYSI6ImNrbm8zeHQwYTBhbHgydnBndDRyNnpjZm0ifQ.dVVZ-qriJ6wIWPUxA8TGLA" 
                      alt="Map of property location" 
                      className="w-full h-full object-cover"
                    />
                  </div>
                  
                  <p className="text-sm text-gray-600">
                    {property.location}, {property.city}, Tanzania. Within walking distance to major amenities and retail centers. The neighborhood is well-established and features excellent transport links to other parts of the city.
                  </p>
                </div>
                
                {/* Documents */}
                <div className="bg-white rounded-lg shadow-sm p-5 mb-6">
                  <h2 className="text-lg font-semibold mb-4">Documents (4)</h2>
                  
                  <div className="space-y-3">
                    <div className="flex items-center justify-between p-3 border rounded-lg">
                      <div className="flex items-center">
                        <FileText className="h-5 w-5 text-blue-500 mr-3" />
                        <div>
                          <div className="font-medium text-sm">Title Deed Copy</div>
                          <div className="text-xs text-gray-500">PDF (645 KB)</div>
                        </div>
                      </div>
                      <Button variant="outline" size="sm">View</Button>
                    </div>
                    
                    <div className="flex items-center justify-between p-3 border rounded-lg">
                      <div className="flex items-center">
                        <FileText className="h-5 w-5 text-blue-500 mr-3" />
                        <div>
                          <div className="font-medium text-sm">Property Photos</div>
                          <div className="text-xs text-gray-500">ZIP (12.4 MB)</div>
                        </div>
                      </div>
                      <Button variant="outline" size="sm">View</Button>
                    </div>
                    
                    <div className="flex items-center justify-between p-3 border rounded-lg">
                      <div className="flex items-center">
                        <FileText className="h-5 w-5 text-blue-500 mr-3" />
                        <div>
                          <div className="font-medium text-sm">Property Valuation Report</div>
                          <div className="text-xs text-gray-500">PDF (1.7 MB)</div>
                        </div>
                      </div>
                      <Button variant="outline" size="sm">View</Button>
                    </div>
                    
                    <div className="flex items-center justify-between p-3 border rounded-lg">
                      <div className="flex items-center">
                        <FileText className="h-5 w-5 text-blue-500 mr-3" />
                        <div>
                          <div className="font-medium text-sm">Rental Projection Analysis</div>
                          <div className="text-xs text-gray-500">PDF (842 KB)</div>
                        </div>
                      </div>
                      <Button variant="outline" size="sm">View</Button>
                    </div>
                  </div>
                </div>
                
                {/* Have more questions? */}
                <div className="bg-white rounded-lg shadow-sm p-5 mb-6">
                  <div className="flex items-start">
                    <img 
                      src="https://ui-avatars.com/api/?name=John+Doe&background=0D8ABC&color=fff" 
                      alt="Advisor" 
                      className="w-12 h-12 rounded-full mr-4" 
                    />
                    <div>
                      <h2 className="font-medium">Have more questions about this property?</h2>
                      <p className="text-sm text-gray-600 mt-1">Our real estate advisors are here to help</p>
                      <Button variant="outline" className="mt-3">
                        Message us
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
              
              {/* Right column - Investment details and CTA */}
              <div className="md:w-1/3">
                <div className="sticky top-6">
                  <div className="bg-white rounded-lg shadow-sm p-5 mb-6">
                    <div className="flex justify-between items-baseline mb-4">
                      <h2 className="text-2xl font-bold">TZS {property.price}</h2>
                      <span className="text-sm text-gray-500">per share</span>
                    </div>
                    
                    <div className="border-t border-b py-4 mb-4">
                      <div className="flex justify-between items-center mb-1">
                        <div className="text-sm">Fund progress</div>
                        <div className="text-sm font-medium">{property.fundingPercentage}%</div>
                      </div>
                      <div className="h-2 w-full bg-gray-100 rounded-full overflow-hidden">
                        <div 
                          className="bg-green-500 h-full" 
                          style={{ width: `${property.fundingPercentage}%` }}
                        ></div>
                      </div>
                      <div className="flex justify-between text-xs text-gray-500 mt-1">
                        <div>{property.fundingPercentage > 0 ? 'TZS 320,000,000' : '0'}</div>
                        <div>TZS 1,823,000,000</div>
                      </div>
                    </div>
                    
                    <div className="space-y-3 mb-6">
                      <div className="flex justify-between">
                        <div className="text-gray-600 text-sm">Occupancy rate</div>
                        <div className="font-medium text-sm">95.4%</div>
                      </div>
                      <div className="flex justify-between">
                        <div className="text-gray-600 text-sm">Yearly return</div>
                        <div className="font-medium text-sm">{property.yearlyReturn}%</div>
                      </div>
                      <div className="flex justify-between">
                        <div className="text-gray-600 text-sm">Projected yield</div>
                        <div className="font-medium text-sm">{property.projectedYield}%</div>
                      </div>
                      <div className="flex justify-between">
                        <div className="text-gray-600 text-sm">Scheduled dividends</div>
                        <div className="font-medium text-sm">Monthly</div>
                      </div>
                    </div>
                    
                    <div className="mb-6">
                      <label className="block text-sm font-medium mb-1">Investment amount</label>
                      <div className="relative">
                        <span className="absolute inset-y-0 left-3 flex items-center text-gray-500">TZS</span>
                        <input 
                          type="text" 
                          value="250,000" 
                          className="w-full border rounded-md py-2 pl-12 pr-3 focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary"
                        />
                      </div>
                    </div>
                    
                    <Button className="w-full py-6 text-base font-semibold">
                      Invest Now
                    </Button>
                    
                    <div className="flex justify-center mt-4">
                      <button className="text-gray-500 text-sm flex items-center">
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4 mr-1">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12z" />
                        </svg>
                        Save
                      </button>
                      <button className="text-gray-500 text-sm flex items-center ml-6">
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4 mr-1">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M7.217 10.907a2.25 2.25 0 100 2.186m0-2.186c.18.324.283.696.283 1.093s-.103.77-.283 1.093m0-2.186l9.566-5.314m-9.566 7.5l9.566 5.314m0 0a2.25 2.25 0 103.935 2.186 2.25 2.25 0 00-3.935-2.186zm0-12.814a2.25 2.25 0 103.933-2.185 2.25 2.25 0 00-3.933 2.185z" />
                        </svg>
                        Share
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
