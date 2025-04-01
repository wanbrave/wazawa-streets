import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Sidebar } from "./sidebar";
import { Globe } from "lucide-react";

export function MobileHeader() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  return (
    <>
      <div className="md:hidden bg-white w-full fixed top-0 left-0 z-10 border-b border-gray-200">
        <div className="flex items-center justify-between p-4">
          <div className="flex items-center">
            <h1 className="text-xl font-bold text-gray-800">stake</h1>
            <div className="ml-4 flex items-center text-sm">
              <Globe className="h-4 w-4 mr-1" />
              <span>EN</span>
            </div>
          </div>
          <Button
            variant="ghost"
            size="icon"
            className="text-gray-500 focus:outline-none"
            onClick={() => setIsSidebarOpen(true)}
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth={1.5}
              stroke="currentColor"
              className="w-6 h-6"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5"
              />
            </svg>
          </Button>
        </div>
      </div>
      
      {isSidebarOpen && (
        <Sidebar isMobile onClose={() => setIsSidebarOpen(false)} />
      )}
    </>
  );
}
