import { Button } from "@/components/ui/button";
import { useState } from "react";

interface PropertyFilterTabsProps {
  onFilterChange: (filter: 'Available' | 'Funded' | 'Exited') => void;
  activeFilter: 'Available' | 'Funded' | 'Exited';
}

export function PropertyFilterTabs({ onFilterChange, activeFilter }: PropertyFilterTabsProps) {
  return (
    <div className="inline-flex rounded-md shadow-sm">
      <Button
        variant={activeFilter === "Available" ? "default" : "outline"}
        className={`rounded-l-md ${activeFilter === "Available" ? "" : "text-gray-700 bg-white"}`}
        onClick={() => onFilterChange("Available")}
      >
        Available
      </Button>
      <Button
        variant={activeFilter === "Funded" ? "default" : "outline"}
        className={`rounded-none ${activeFilter === "Funded" ? "" : "text-gray-700 bg-white"}`}
        onClick={() => onFilterChange("Funded")}
      >
        Funded
      </Button>
      <Button
        variant={activeFilter === "Exited" ? "default" : "outline"}
        className={`rounded-r-md ${activeFilter === "Exited" ? "" : "text-gray-700 bg-white"}`}
        onClick={() => onFilterChange("Exited")}
      >
        Exited
      </Button>
    </div>
  );
}
