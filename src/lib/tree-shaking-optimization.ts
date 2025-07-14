// Tree shaking optimization utilities
// This file helps optimize bundle size by ensuring proper tree shaking

// Re-export commonly used utilities with explicit imports
// This helps bundlers understand what's actually being used

// Date-fns optimized exports
export { format } from "date-fns/format";
export { parseISO } from "date-fns/parseISO";
export { isValid } from "date-fns/isValid";
export { addDays } from "date-fns/addDays";
export { subDays } from "date-fns/subDays";
export { startOfDay } from "date-fns/startOfDay";
export { endOfDay } from "date-fns/endOfDay";

// Lucide React optimized exports (most commonly used icons)
export {
  Calendar,
  CalendarIcon,
  Loader2,
  ChevronDown,
  ChevronUp,
  ChevronLeft,
  ChevronRight,
  Search,
  Menu,
  X,
  Home,
  User,
  Settings,
  Bell,
  Mail,
  Phone,
  MapPin,
  Clock,
  Download,
  Upload,
  Edit,
  Trash2,
  Plus,
  Minus,
  Check,
  AlertCircle,
  Info,
  Eye,
  EyeOff,
  Copy,
  ExternalLink,
  ArrowLeft,
  ArrowRight,
  ArrowUp,
  ArrowDown,
} from "lucide-react";

// Zod optimized exports
export { z } from "zod";

// React Hook Form optimized exports
export { useForm, Controller } from "react-hook-form";
export { zodResolver } from "@hookform/resolvers/zod";

// Note: createOptimizedDynamicImport function removed to eliminate require() calls
// Use the withDynamicImport function from @/components/ui/dynamic-wrapper instead

// Bundle analysis helper
export function analyzeBundleSize() {
  if (typeof window !== "undefined" && process.env.NODE_ENV === "development") {
    console.log("Bundle analysis available in development mode");

    // Log performance metrics
    if (window.performance) {
      const navigation = window.performance.getEntriesByType(
        "navigation"
      )[0] as PerformanceNavigationTiming;
      console.log("Page Load Performance:", {
        domContentLoaded:
          navigation.domContentLoadedEventEnd -
          navigation.domContentLoadedEventStart,
        loadComplete: navigation.loadEventEnd - navigation.loadEventStart,
        totalTime: navigation.loadEventEnd - navigation.fetchStart,
      });
    }
  }
}

// Initialize bundle analysis in development
if (typeof window !== "undefined" && process.env.NODE_ENV === "development") {
  window.addEventListener("load", analyzeBundleSize);
}
