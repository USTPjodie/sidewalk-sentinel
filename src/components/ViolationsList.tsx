import { MapPin, Clock, Car, AlertTriangle, Eye, MoreVertical } from "lucide-react";
import { Button } from "@/components/ui/button";

interface Violation {
  id: string;
  location: string;
  time: string;
  vehicleType: string;
  duration: string;
  severity: "high" | "medium" | "low";
  status: "detected" | "verified" | "resolved";
  confidence: number;
  blockage: number;
}

const mockViolations: Violation[] = [
  {
    id: "V-001",
    location: "123 Main Street",
    time: "2 mins ago",
    vehicleType: "SUV",
    duration: "15 mins",
    severity: "high",
    status: "detected",
    confidence: 0.94,
    blockage: 78,
  },
  {
    id: "V-002",
    location: "456 Oak Avenue",
    time: "8 mins ago",
    vehicleType: "Sedan",
    duration: "32 mins",
    severity: "medium",
    status: "verified",
    confidence: 0.87,
    blockage: 45,
  },
  {
    id: "V-003",
    location: "789 Pine Road",
    time: "15 mins ago",
    vehicleType: "Truck",
    duration: "8 mins",
    severity: "low",
    status: "resolved",
    confidence: 0.92,
    blockage: 22,
  },
  {
    id: "V-004",
    location: "321 Elm Street",
    time: "23 mins ago",
    vehicleType: "Van",
    duration: "45 mins",
    severity: "high",
    status: "detected",
    confidence: 0.89,
    blockage: 85,
  },
  {
    id: "V-005",
    location: "654 Cedar Lane",
    time: "31 mins ago",
    vehicleType: "Motorcycle",
    duration: "12 mins",
    severity: "low",
    status: "verified",
    confidence: 0.76,
    blockage: 15,
  },
];

const severityConfig = {
  high: { label: "High", class: "high" },
  medium: { label: "Medium", class: "medium" },
  low: { label: "Low", class: "low" },
};

const statusConfig = {
  detected: { label: "Detected", color: "text-destructive", bg: "bg-destructive/10" },
  verified: { label: "Verified", color: "text-warning", bg: "bg-warning/10" },
  resolved: { label: "Resolved", color: "text-success", bg: "bg-success/10" },
};

export const ViolationsList = () => {
  return (
    <div className="glass-card overflow-hidden animate-slide-up">
      <div className="flex items-center justify-between p-6 border-b border-border/50">
        <div>
          <h2 className="text-xl font-semibold text-foreground">Recent Violations</h2>
          <p className="text-sm text-muted-foreground mt-1">
            Live feed of detected parking violations
          </p>
        </div>
        <div className="flex items-center gap-2">
          <div className="pulse-dot mr-2">
            <span className="sr-only">Live</span>
          </div>
          <span className="text-sm text-success font-medium">Live</span>
        </div>
      </div>

      <div className="divide-y divide-border/50">
        {mockViolations.map((violation, index) => (
          <div
            key={violation.id}
            className="p-4 hover:bg-secondary/30 transition-colors animate-fade-in"
            style={{ animationDelay: `${index * 50}ms` }}
          >
            <div className="flex items-start gap-4">
              {/* Thumbnail placeholder */}
              <div className="w-20 h-14 rounded-lg bg-secondary/50 flex items-center justify-center flex-shrink-0 overflow-hidden">
                <div className="w-full h-full bg-gradient-to-br from-primary/20 to-accent/20 flex items-center justify-center">
                  <Car className="w-6 h-6 text-primary/50" />
                </div>
              </div>

              {/* Content */}
              <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-mono text-xs text-muted-foreground">
                        {violation.id}
                      </span>
                      <span className={`violation-badge ${severityConfig[violation.severity].class}`}>
                        {severityConfig[violation.severity].label}
                      </span>
                      <span className={`text-xs px-2 py-0.5 rounded-full ${statusConfig[violation.status].bg} ${statusConfig[violation.status].color}`}>
                        {statusConfig[violation.status].label}
                      </span>
                    </div>
                    <div className="flex items-center gap-4 text-sm">
                      <span className="flex items-center gap-1.5 text-foreground">
                        <MapPin className="w-3.5 h-3.5 text-muted-foreground" />
                        {violation.location}
                      </span>
                      <span className="flex items-center gap-1.5 text-muted-foreground">
                        <Clock className="w-3.5 h-3.5" />
                        {violation.time}
                      </span>
                    </div>
                  </div>

                  <Button variant="ghost" size="icon" className="flex-shrink-0">
                    <MoreVertical className="w-4 h-4" />
                  </Button>
                </div>

                {/* Stats */}
                <div className="flex items-center gap-6 mt-3 text-xs">
                  <div className="flex items-center gap-1.5">
                    <Car className="w-3.5 h-3.5 text-muted-foreground" />
                    <span className="text-muted-foreground">Vehicle:</span>
                    <span className="text-foreground font-medium">{violation.vehicleType}</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <Clock className="w-3.5 h-3.5 text-muted-foreground" />
                    <span className="text-muted-foreground">Duration:</span>
                    <span className="text-foreground font-medium">{violation.duration}</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <AlertTriangle className="w-3.5 h-3.5 text-muted-foreground" />
                    <span className="text-muted-foreground">Blockage:</span>
                    <span className="text-foreground font-medium">{violation.blockage}%</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <Eye className="w-3.5 h-3.5 text-muted-foreground" />
                    <span className="text-muted-foreground">Confidence:</span>
                    <span className="text-primary font-medium">{Math.round(violation.confidence * 100)}%</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="p-4 border-t border-border/50 text-center">
        <Button variant="ghost" className="text-primary hover:text-primary">
          View All Violations
        </Button>
      </div>
    </div>
  );
};
