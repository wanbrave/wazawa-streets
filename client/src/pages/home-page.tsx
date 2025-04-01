import { useState } from "react";
import { Sidebar } from "@/components/sidebar";
import { MobileHeader } from "@/components/mobile-header";
import { PropertyFilterTabs } from "@/components/property-filter-tabs";
import { PropertyGrid } from "@/components/property-grid";
import { useAuth } from "@/hooks/use-auth";

export default function HomePage() {
  const [activeFilter, setActiveFilter] = useState<'Available' | 'Funded' | 'Exited'>('Available');
  const { user } = useAuth();

  return (
    <div className="min-h-screen flex">
      <Sidebar />
      <MobileHeader />
      
      <div className="flex-1 flex flex-col md:ml-0 pt-16 md:pt-0">
        <main className="flex-1 overflow-y-auto p-4 md:p-6 bg-neutral-100">
          <div className="mb-8">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-6">
              <h2 className="text-2xl font-bold text-gray-800">Properties</h2>
              <div className="mt-3 md:mt-0">
                <PropertyFilterTabs 
                  activeFilter={activeFilter} 
                  onFilterChange={(filter) => setActiveFilter(filter)} 
                />
              </div>
            </div>
            
            <PropertyGrid filter={activeFilter} />
          </div>
        </main>
      </div>
    </div>
  );
}
