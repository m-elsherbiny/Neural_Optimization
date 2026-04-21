import {
  Target, Home, Car, Plane, GraduationCap, PiggyBank,
  Heart, Smartphone, Laptop, Dumbbell, Baby, Briefcase,
  type LucideIcon
} from 'lucide-react';

const ICON_MAP: Record<string, LucideIcon> = {
  'target': Target,
  'home': Home,
  'car': Car,
  'plane': Plane,
  'graduation-cap': GraduationCap,
  'piggy-bank': PiggyBank,
  'heart': Heart,
  'smartphone': Smartphone,
  'laptop': Laptop,
  'dumbbell': Dumbbell,
  'baby': Baby,
  'briefcase': Briefcase,
};

export function getGoalIcon(iconId: string): LucideIcon {
  return ICON_MAP[iconId] || Target;
}
