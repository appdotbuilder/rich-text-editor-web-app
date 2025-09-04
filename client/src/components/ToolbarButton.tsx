import { Button } from '@/components/ui/button';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';

interface ToolbarButtonProps {
  icon: React.ReactNode;
  onClick: () => void;
  tooltip: string;
  isActive?: boolean;
  disabled?: boolean;
  className?: string;
}

export function ToolbarButton({ icon, onClick, tooltip, isActive = false, disabled = false, className = '' }: ToolbarButtonProps) {
  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <Button
            size="sm"
            variant="ghost"
            onClick={onClick}
            disabled={disabled}
            className={`p-2 h-8 w-8 transition-all duration-200 hover:bg-blue-100 hover:text-blue-700 ${
              isActive 
                ? 'bg-blue-100 text-blue-700' 
                : 'text-gray-600 hover:text-gray-900'
            } ${disabled ? 'opacity-50 cursor-not-allowed' : ''} ${className}`}
          >
            {icon}
          </Button>
        </TooltipTrigger>
        <TooltipContent side="bottom" className="text-xs">
          {tooltip}
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}