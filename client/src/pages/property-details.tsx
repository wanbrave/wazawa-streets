import { useParams, Link } from "wouter";
import { Sidebar } from "@/components/sidebar";
import { MobileHeader } from "@/components/mobile-header";
import { PropertyMetrics } from "@/components/property-metrics";
import { useQuery } from "@tanstack/react-query";
import { Property } from "@shared/schema";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { ArrowLeft, MapPin, Home, Building2, DollarSign } from "lucide-react";

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
            <div className="max-w-4xl mx-auto">
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
            <div className="max-w-4xl mx-auto text-center py-12">
              <h2 className="text-2xl font-bold text-gray-800 mb-2">Property Not Found</h2>
              <p className="text-gray-600 mb-6">The property you're looking for doesn't exist or has been removed.</p>
              <Link href="/">
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

  return (
    <div className="min-h-screen flex">
      <Sidebar />
      <MobileHeader />
      
      <div className="flex-1 flex flex-col md:ml-0 pt-16 md:pt-0">
        <main className="flex-1 overflow-y-auto p-4 md:p-6 bg-neutral-100">
          <div className="max-w-4xl mx-auto">
            <div className="mb-6">
              <Link href="/">
                <a className="inline-flex items-center text-gray-600 hover:text-gray-900 mb-4">
                  <ArrowLeft className="mr-2 h-4 w-4" />
                  Back to Properties
                </a>
              </Link>
              <h1 className="text-2xl font-bold text-gray-800 mb-2">{property.title}</h1>
              <div className="flex items-center text-gray-600">
                <MapPin className="h-4 w-4 mr-1" />
                <span>{property.location}, {property.city}</span>
              </div>
            </div>

            <div className="rounded-lg overflow-hidden mb-6">
              <img 
                src={property.imageUrl} 
                alt={property.title}
                className="w-full h-80 object-cover"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
              <div className="bg-white p-4 rounded-lg shadow-sm">
                <div className="flex items-center mb-2">
                  <Home className="h-5 w-5 text-gray-500 mr-2" />
                  <h3 className="font-medium">Property Details</h3>
                </div>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Type</span>
                    <span className="font-medium">{property.bedrooms} Bedroom</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">ID</span>
                    <span className="font-medium">#{property.propertyId}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Status</span>
                    <Badge variant="outline" className="font-normal">
                      {property.status === "Rented" ? "Rented" : "Ready"}
                    </Badge>
                  </div>
                </div>
              </div>
              
              <div className="bg-white p-4 rounded-lg shadow-sm">
                <div className="flex items-center mb-2">
                  <Building2 className="h-5 w-5 text-gray-500 mr-2" />
                  <h3 className="font-medium">Investment Type</h3>
                </div>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Category</span>
                    <Badge variant="outline" className="font-normal">{property.type}</Badge>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Fund Progress</span>
                    <span className="font-medium">{property.fundingPercentage}%</span>
                  </div>
                  <div className="h-1.5 w-full bg-gray-100 rounded-full overflow-hidden mt-1">
                    <div 
                      className="bg-primary h-full" 
                      style={{ width: `${property.fundingPercentage}%` }}
                    ></div>
                  </div>
                </div>
              </div>
              
              <div className="bg-white p-4 rounded-lg shadow-sm">
                <div className="flex items-center mb-2">
                  <DollarSign className="h-5 w-5 text-gray-500 mr-2" />
                  <h3 className="font-medium">Financial Returns</h3>
                </div>
                <PropertyMetrics 
                  yearlyReturn={property.yearlyReturn} 
                  totalReturn={property.totalReturn} 
                  projectedYield={property.projectedYield}
                />
                <div className="mt-4 pt-2 border-t">
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">Price</span>
                    <span className="font-semibold text-xl text-primary">{property.price}</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-white p-6 rounded-lg shadow-sm mb-6">
              <h3 className="font-medium text-lg mb-4">About This Property</h3>
              <p className="text-gray-600">
                This {property.bedrooms} bedroom apartment in {property.location}, {property.city} offers an excellent investment opportunity with projected returns of {property.yearlyReturn.toFixed(2)}% annually. Currently {property.fundingPercentage}% funded, this {property.type} property is ideal for investors looking for stable income and potential capital appreciation.
              </p>
              <p className="text-gray-600 mt-4">
                The property is {property.status === "Rented" ? "already rented with reliable tenants" : "ready for immediate rental"}, located in a prime area with excellent amenities and transport links.
              </p>
            </div>

            <Button className="w-full py-6 text-lg">
              Invest Now
            </Button>
          </div>
        </main>
      </div>
    </div>
  );
}
