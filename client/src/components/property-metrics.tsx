import { ArrowTrendingUp, Calendar, ArrowUpRight } from "lucide-react";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

interface PropertyMetricsProps {
  yearlyReturn: number;
  totalReturn: number;
  projectedYield: number;
}

export function PropertyMetrics({ yearlyReturn, totalReturn, projectedYield }: PropertyMetricsProps) {
  return (
    <div className="grid grid-cols-3 gap-2">
      <TooltipProvider>
        <div className="text-center">
          <Tooltip>
            <TooltipTrigger asChild>
              <div>
                <p className="text-sm font-semibold text-gray-800">{totalReturn.toFixed(2)}%</p>
                <p className="text-xs text-gray-500">5 year total return</p>
              </div>
            </TooltipTrigger>
            <TooltipContent>
              <p>Expected return over 5 years</p>
            </TooltipContent>
          </Tooltip>
        </div>
        
        <div className="text-center">
          <Tooltip>
            <TooltipTrigger asChild>
              <div>
                <p className="text-sm font-semibold text-gray-800">{yearlyReturn.toFixed(2)}%</p>
                <p className="text-xs text-gray-500">Yearly investment return</p>
              </div>
            </TooltipTrigger>
            <TooltipContent>
              <p>Expected annual return on investment</p>
            </TooltipContent>
          </Tooltip>
        </div>
        
        <div className="text-center">
          <Tooltip>
            <TooltipTrigger asChild>
              <div>
                <p className="text-sm font-semibold text-gray-800">{projectedYield.toFixed(2)}%</p>
                <p className="text-xs text-gray-500">Projected net yield</p>
              </div>
            </TooltipTrigger>
            <TooltipContent>
              <p>Expected net yield after expenses</p>
            </TooltipContent>
          </Tooltip>
        </div>
      </TooltipProvider>
    </div>
  );
}
