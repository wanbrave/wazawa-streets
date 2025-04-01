import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Building2, MapPin } from "lucide-react";
import { Link } from "wouter";
import { Property } from "@shared/schema";
import { PropertyMetrics } from "./property-metrics";

interface PropertyCardProps {
  property: Property;
}

export function PropertyCard({ property }: PropertyCardProps) {
  const {
    id,
    title,
    location,
    city,
    price,
    bedrooms,
    type,
    imageUrl,
    fundingPercentage,
    propertyId,
    status,
    yearlyReturn,
    totalReturn,
    projectedYield,
  } = property;

  const getBadgeColor = (type: string) => {
    switch (type) {
      case "Balanced":
        return "bg-yellow-100 text-yellow-800";
      case "Capital Growth":
        return "bg-green-100 text-green-800";
      default:
        return "bg-blue-100 text-blue-800";
    }
  };

  return (
    <Card className="overflow-hidden h-full flex flex-col">
      <div className="relative h-48 overflow-hidden">
        <img src={imageUrl} alt={title} className="w-full h-full object-cover" />
        <div className="absolute top-3 left-3">
          <Badge variant="outline" className={`${getBadgeColor(type)} border-transparent`}>
            {type}
          </Badge>
        </div>
      </div>
      <CardContent className="p-4 flex-1 flex flex-col">
        <div className="mb-3">
          <div className="flex items-center gap-2 mb-1">
            <Badge variant="outline" className="border-gray-200 text-xs">
              {propertyId}
            </Badge>
            <Badge variant="outline" className="border-gray-200 text-xs">
              {status === "Rented" ? "Rented" : "Ready"}
            </Badge>
            <Badge variant="outline" className="border-gray-200 text-xs">
              {city}
            </Badge>
          </div>
          <h3 className="text-base font-medium">{title}</h3>
          <div className="flex items-center text-muted-foreground text-sm mt-1">
            <MapPin className="h-3.5 w-3.5 mr-1" />
            <span>{location}</span>
          </div>
        </div>
        
        <div className="text-xl font-semibold mb-3 text-primary">{price}</div>
        
        <div className="mb-4">
          <div className="flex justify-between text-sm mb-1">
            <span className="font-medium">{fundingPercentage}% funded</span>
          </div>
          <div className="h-1.5 w-full bg-gray-100 rounded-full overflow-hidden">
            <div 
              className="bg-primary h-full" 
              style={{ width: `${fundingPercentage}%` }}
            ></div>
          </div>
        </div>
        
        <PropertyMetrics 
          yearlyReturn={yearlyReturn} 
          totalReturn={totalReturn} 
          projectedYield={projectedYield}
        />
        
        <div className="mt-4">
          <Link href={`/property/${id}`}>
            <a className="w-full inline-flex justify-center bg-primary hover:bg-primary/90 text-white py-2 px-4 rounded-md transition">
              View Details
            </a>
          </Link>
        </div>
      </CardContent>
    </Card>
  );
}
