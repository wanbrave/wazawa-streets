import { PropertyCard } from "./property-card";
import { Property } from "@shared/schema";
import { useQuery } from "@tanstack/react-query";
import { Skeleton } from "@/components/ui/skeleton";

interface PropertyGridProps {
  filter: 'Available' | 'Funded' | 'Exited';
}

export function PropertyGrid({ filter }: PropertyGridProps) {
  const { data: properties, isLoading } = useQuery<Property[]>({
    queryKey: ['/api/properties', filter],
  });

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {[...Array(6)].map((_, i) => (
          <div key={i} className="overflow-hidden rounded-lg shadow-sm">
            <Skeleton className="h-48 w-full" />
            <div className="p-4">
              <Skeleton className="h-6 w-3/4 mb-2" />
              <Skeleton className="h-4 w-1/2 mb-4" />
              <Skeleton className="h-4 w-full mb-2" />
              <div className="grid grid-cols-3 gap-2 mb-4">
                <Skeleton className="h-10 w-full" />
                <Skeleton className="h-10 w-full" />
                <Skeleton className="h-10 w-full" />
              </div>
              <Skeleton className="h-9 w-full" />
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (!properties || properties.length === 0) {
    return (
      <div className="text-center py-10">
        <h3 className="text-lg font-medium">No properties found</h3>
        <p className="text-muted-foreground">Try changing your filter or check back later.</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {properties.map((property) => (
        <PropertyCard key={property.id} property={property} />
      ))}
    </div>
  );
}
