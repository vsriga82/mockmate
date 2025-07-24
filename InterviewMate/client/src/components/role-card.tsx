import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Role } from "@/types";
import { Clock, Users, Star, Heart, Briefcase, TrendingUp, CheckCircle } from "lucide-react";

interface RoleCardProps {
  roleKey: string;
  role: Role;
  onSelect: (roleKey: string) => void;
  isLoading?: boolean;
}

const iconMap = {
  "lightbulb": "💡",
  "chart-bar": "📊", 
  "bug": "🐛",
  "handshake": "🤝",
  "cogs": "⚙️"
};

const popularityIcons = {
  "Most Popular": Star,
  "High Demand": TrendingUp,
  "Beginner Friendly": CheckCircle,
  "People-Focused": Heart,
  "Career Switcher Friendly": Briefcase
};

export default function RoleCard({ roleKey, role, onSelect, isLoading }: RoleCardProps) {
  const Icon = popularityIcons[role.popularity as keyof typeof popularityIcons] || Star;
  
  const getColorClasses = (color: string) => {
    switch (color) {
      case 'primary':
        return {
          gradient: 'from-blue-500 to-blue-600',
          button: 'bg-primary-500 hover:bg-primary-600'
        };
      case 'accent':
        return {
          gradient: 'from-orange-500 to-orange-600',
          button: 'bg-accent-500 hover:bg-accent-600'
        };
      case 'success':
        return {
          gradient: 'from-green-500 to-green-600',
          button: 'bg-success-500 hover:bg-success-600'
        };
      case 'purple':
        return {
          gradient: 'from-purple-500 to-purple-600',
          button: 'bg-purple-500 hover:bg-purple-600'
        };
      case 'indigo':
        return {
          gradient: 'from-indigo-500 to-indigo-600',
          button: 'bg-indigo-500 hover:bg-indigo-600'
        };
      default:
        return {
          gradient: 'from-blue-500 to-blue-600',
          button: 'bg-primary-500 hover:bg-primary-600'
        };
    }
  };

  const colorClasses = getColorClasses(role.color);

  return (
    <Card className="bg-white border border-gray-200 rounded-2xl p-8 hover:shadow-material-lg transition-all duration-300 cursor-pointer group hover:-translate-y-1">
      <CardContent className="p-0 space-y-6">
        <div className={`w-16 h-16 bg-gradient-to-br ${colorClasses.gradient} rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform text-2xl`}>
          {iconMap[role.icon as keyof typeof iconMap] || "💼"}
        </div>
        
        <div className="space-y-3">
          <h3 className="text-xl font-bold text-gray-900">{role.title}</h3>
          <p className="text-gray-600 leading-relaxed">
            {role.description}
          </p>
        </div>
        
        <div className="space-y-3">
          <div className="flex items-center text-sm text-gray-500">
            <Clock className="w-4 h-4 mr-2" />
            <span>{role.duration}</span>
          </div>
          <div className="flex items-center text-sm text-gray-500">
            <Users className="w-4 h-4 mr-2" />
            <span>Perfect for freshers</span>
          </div>
          <div className={`flex items-center text-sm ${
            role.color === 'accent' ? 'text-accent-600' :
            role.color === 'success' ? 'text-success-600' :
            role.color === 'purple' ? 'text-purple-600' :
            role.color === 'indigo' ? 'text-indigo-600' :
            'text-primary-600'
          }`}>
            <Icon className="w-4 h-4 mr-2" />
            <span>{role.popularity}</span>
          </div>
        </div>
        
        <Button 
          className={`w-full py-3 rounded-xl font-semibold transition-colors ${colorClasses.button}`}
          onClick={() => onSelect(roleKey)}
          disabled={isLoading}
        >
          {isLoading ? "Starting..." : "Start Practice"}
        </Button>
      </CardContent>
    </Card>
  );
}
