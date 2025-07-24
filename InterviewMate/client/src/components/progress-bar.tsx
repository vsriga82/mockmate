interface ProgressBarProps {
  current: number;
  total: number;
  className?: string;
}

export default function ProgressBar({ current, total, className = "" }: ProgressBarProps) {
  const percentage = Math.round((current / total) * 100);
  
  return (
    <div className={`space-y-2 ${className}`}>
      <div className="flex justify-between text-sm text-primary-100">
        <span>Progress</span>
        <span>{percentage}% Complete</span>
      </div>
      <div className="w-full bg-primary-400 rounded-full h-2">
        <div 
          className="bg-white h-2 rounded-full transition-all duration-500"
          style={{ width: `${percentage}%` }}
        />
      </div>
    </div>
  );
}
