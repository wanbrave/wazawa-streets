import { Link, useLocation } from "wouter";
import { Home, Briefcase, Award, Wallet, User, Building2, Settings } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useAuth } from "@/hooks/use-auth";

interface SidebarProps {
  isMobile?: boolean;
  onClose?: () => void;
}

export function Sidebar({ isMobile, onClose }: SidebarProps) {
  const [location] = useLocation();
  const { user, logoutMutation } = useAuth();

  const handleLogout = () => {
    logoutMutation.mutate();
  };

  // Base nav items for all users
  const baseNavItems = [
    { href: "/dashboard", label: "Properties", icon: <Home className="h-5 w-5 mr-3" /> },
    { href: "/portfolio", label: "Portfolio", icon: <Briefcase className="h-5 w-5 mr-3" /> },
    { href: "/wallet", label: "Wallet", icon: <Wallet className="h-5 w-5 mr-3" /> },
    { href: "/profile", label: "Profile", icon: <User className="h-5 w-5 mr-3" /> },
  ];
  
  // Add admin item if user has admin role
  const navItems = user?.role === 'admin' 
    ? [...baseNavItems, { href: "/admin", label: "Admin", icon: <Settings className="h-5 w-5 mr-3" /> }]
    : baseNavItems;

  const mobileClasses = isMobile
    ? "fixed inset-0 z-50 flex flex-col w-full bg-white overflow-y-auto"
    : "hidden md:flex md:flex-col md:sticky md:top-0 md:left-0 md:h-screen w-64 bg-white shadow-sm";

  return (
    <div className={mobileClasses}>
      <div className="p-4 border-b flex items-center justify-between">
        <div className="flex items-center">
          <Building2 className="h-6 w-6 mr-2 text-primary" />
          <h1 className="text-2xl font-bold text-gray-800">Wazawa St.</h1>
        </div>
        {isMobile && (
          <Button variant="ghost" size="icon" onClick={onClose}>
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
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </Button>
        )}
      </div>

      <nav className="flex-1 px-2 py-4 space-y-1">
        {navItems.map((item) => {
          const isActive = location === item.href;
          return (
            <Link 
              key={item.href} 
              href={item.href} 
              onClick={isMobile ? onClose : undefined}
              className={`flex items-center px-4 py-3 rounded-md ${
                isActive
                  ? "text-gray-800 bg-gray-200"
                  : "text-gray-600 hover:bg-gray-200"
              }`}
            >
              {item.icon}
              {item.label}
            </Link>
          );
        })}
      </nav>

      <div className="p-4 border-t">
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <Avatar className="h-8 w-8 mr-3">
              <AvatarImage src={`https://ui-avatars.com/api/?name=${user?.username || 'User'}`} />
              <AvatarFallback>{user?.username?.charAt(0) || 'U'}</AvatarFallback>
            </Avatar>
            <div>
              <p className="text-sm font-medium text-gray-800">{user?.username || 'User'}</p>
              <p className="text-xs text-gray-500">{user?.role === 'admin' ? 'Administrator' : 'Investor'}</p>
            </div>
          </div>
          <Button variant="ghost" size="sm" onClick={handleLogout}>
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth={1.5}
              stroke="currentColor"
              className="w-5 h-5"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M15.75 9V5.25A2.25 2.25 0 0013.5 3h-6a2.25 2.25 0 00-2.25 2.25v13.5A2.25 2.25 0 007.5 21h6a2.25 2.25 0 002.25-2.25V15m3 0l3-3m0 0l-3-3m3 3H9"
              />
            </svg>
          </Button>
        </div>
      </div>
    </div>
  );
}
