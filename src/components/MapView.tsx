import { MapPin, AlertTriangle } from "lucide-react";

export const MapView = () => {
  const hotspots = [
    { id: 1, name: "Downtown Core", violations: 156, lat: 40.7128, lng: -74.006 },
    { id: 2, name: "Commercial District", violations: 89, lat: 40.7282, lng: -73.7949 },
    { id: 3, name: "Residential Zone A", violations: 45, lat: 40.7614, lng: -73.9776 },
    { id: 4, name: "Industrial Area", violations: 23, lat: 40.6892, lng: -74.0445 },
  ];

  return (
    <div className="glass-card overflow-hidden animate-scale-in">
      <div className="p-6 border-b border-border/50">
        <h2 className="text-xl font-semibold text-foreground">Violation Map</h2>
        <p className="text-sm text-muted-foreground mt-1">
          Geographic distribution of parking violations
        </p>
      </div>

      {/* Map placeholder */}
      <div className="relative aspect-[16/9] bg-secondary/30">
        <div 
          className="absolute inset-0 bg-grid-pattern opacity-10"
          style={{ backgroundSize: '40px 40px' }}
        />
        
        {/* Simulated map background */}
        <div className="absolute inset-0 bg-gradient-radial from-primary/5 via-transparent to-transparent" />
        
        {/* Hotspot markers */}
        {hotspots.map((spot, index) => {
          const left = 20 + index * 20;
          const top = 30 + (index % 2) * 30;
          return (
            <div
              key={spot.id}
              className="absolute transform -translate-x-1/2 -translate-y-1/2 group cursor-pointer"
              style={{ left: `${left}%`, top: `${top}%` }}
            >
              {/* Pulse ring */}
              <div 
                className="absolute inset-0 w-12 h-12 -ml-3 -mt-3 rounded-full animate-ping"
                style={{ 
                  backgroundColor: spot.violations > 100 
                    ? 'hsl(0 72% 51% / 0.3)' 
                    : spot.violations > 50 
                    ? 'hsl(38 92% 50% / 0.3)'
                    : 'hsl(142 71% 45% / 0.3)',
                  animationDuration: '2s'
                }}
              />
              
              {/* Marker */}
              <div 
                className={`relative w-6 h-6 rounded-full flex items-center justify-center shadow-lg transition-transform group-hover:scale-125 ${
                  spot.violations > 100 
                    ? 'bg-destructive' 
                    : spot.violations > 50 
                    ? 'bg-warning'
                    : 'bg-success'
                }`}
              >
                <MapPin className="w-3 h-3 text-background" />
              </div>

              {/* Tooltip */}
              <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
                <div className="glass-card px-3 py-2 rounded-lg whitespace-nowrap">
                  <p className="text-sm font-medium text-foreground">{spot.name}</p>
                  <p className="text-xs text-muted-foreground">
                    {spot.violations} violations
                  </p>
                </div>
              </div>
            </div>
          );
        })}

        {/* Map placeholder text */}
        <div className="absolute bottom-4 left-4 bg-background/80 backdrop-blur-sm rounded-lg px-4 py-2">
          <p className="text-xs text-muted-foreground">
            Connect Mapbox API for interactive map
          </p>
        </div>
      </div>

      {/* Hotspots list */}
      <div className="p-6 border-t border-border/50">
        <h3 className="text-sm font-medium text-foreground mb-4">Top Violation Hotspots</h3>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {hotspots.map((spot) => (
            <div
              key={spot.id}
              className="flex items-center gap-3 p-3 rounded-lg bg-secondary/30 hover:bg-secondary/50 transition-colors cursor-pointer"
            >
              <div className={`p-2 rounded-lg ${
                spot.violations > 100 
                  ? 'bg-destructive/20' 
                  : spot.violations > 50 
                  ? 'bg-warning/20'
                  : 'bg-success/20'
              }`}>
                <AlertTriangle className={`w-4 h-4 ${
                  spot.violations > 100 
                    ? 'text-destructive' 
                    : spot.violations > 50 
                    ? 'text-warning'
                    : 'text-success'
                }`} />
              </div>
              <div>
                <p className="text-sm font-medium text-foreground">{spot.name}</p>
                <p className="text-xs text-muted-foreground">{spot.violations} violations</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
