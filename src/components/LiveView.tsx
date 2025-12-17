import { Video, Pause, Play, Maximize2, Settings, Circle } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";

export const LiveView = () => {
  const [isPlaying, setIsPlaying] = useState(true);

  const cameras = [
    { id: 1, name: "Main St & 1st Ave", status: "active", violations: 3 },
    { id: 2, name: "Oak Avenue", status: "active", violations: 1 },
    { id: 3, name: "Pine Road South", status: "active", violations: 0 },
    { id: 4, name: "Downtown Plaza", status: "offline", violations: 0 },
  ];

  return (
    <div className="space-y-6">
      {/* Main Live Feed */}
      <div className="glass-card overflow-hidden animate-scale-in">
        <div className="relative aspect-video bg-gradient-to-br from-secondary to-background">
          {/* Video placeholder with grid overlay */}
          <div 
            className="absolute inset-0 bg-grid-pattern opacity-20"
            style={{ backgroundSize: '30px 30px' }}
          />
          
          {/* Detection overlay simulation */}
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="text-center">
              <Video className="w-16 h-16 mx-auto text-primary/30 mb-4" />
              <p className="text-lg text-muted-foreground">Live Feed Preview</p>
              <p className="text-sm text-muted-foreground/60 mt-1">
                Connect a camera to start monitoring
              </p>
            </div>
          </div>

          {/* Detection boxes simulation */}
          <div className="absolute top-1/4 left-1/4 w-32 h-20 border-2 border-destructive rounded-md">
            <div className="absolute -top-6 left-0 bg-destructive text-destructive-foreground text-xs px-2 py-1 rounded">
              Car • 94%
            </div>
          </div>
          <div className="absolute top-1/3 right-1/4 w-24 h-16 border-2 border-warning rounded-md">
            <div className="absolute -top-6 left-0 bg-warning text-warning-foreground text-xs px-2 py-1 rounded">
              Van • 87%
            </div>
          </div>

          {/* Recording indicator */}
          <div className="absolute top-4 left-4 flex items-center gap-2 bg-background/80 backdrop-blur-sm rounded-full px-3 py-1.5">
            <Circle className="w-3 h-3 fill-destructive text-destructive animate-pulse" />
            <span className="text-xs font-medium text-foreground">REC</span>
          </div>

          {/* Camera info */}
          <div className="absolute top-4 right-4 bg-background/80 backdrop-blur-sm rounded-lg px-3 py-1.5">
            <span className="text-xs font-mono text-foreground">CAM-01 • Main St & 1st Ave</span>
          </div>

          {/* Timestamp */}
          <div className="absolute bottom-4 left-4 bg-background/80 backdrop-blur-sm rounded-lg px-3 py-1.5">
            <span className="text-xs font-mono text-muted-foreground">
              {new Date().toLocaleString()}
            </span>
          </div>

          {/* Stats overlay */}
          <div className="absolute bottom-4 right-4 flex gap-2">
            <div className="bg-background/80 backdrop-blur-sm rounded-lg px-3 py-1.5">
              <span className="text-xs text-muted-foreground">Violations: </span>
              <span className="text-xs font-bold text-destructive">3</span>
            </div>
            <div className="bg-background/80 backdrop-blur-sm rounded-lg px-3 py-1.5">
              <span className="text-xs text-muted-foreground">FPS: </span>
              <span className="text-xs font-mono text-success">30</span>
            </div>
          </div>
        </div>

        {/* Controls */}
        <div className="flex items-center justify-between p-4 border-t border-border/50">
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="icon"
              onClick={() => setIsPlaying(!isPlaying)}
            >
              {isPlaying ? (
                <Pause className="w-4 h-4" />
              ) : (
                <Play className="w-4 h-4" />
              )}
            </Button>
            <span className="text-sm text-muted-foreground">
              {isPlaying ? "Streaming" : "Paused"}
            </span>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="icon">
              <Settings className="w-4 h-4" />
            </Button>
            <Button variant="outline" size="icon">
              <Maximize2 className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </div>

      {/* Camera Grid */}
      <div>
        <h3 className="text-lg font-medium text-foreground mb-4">All Cameras</h3>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {cameras.map((camera) => (
            <div
              key={camera.id}
              className="glass-card p-4 cursor-pointer hover:border-primary/50 transition-all"
            >
              <div className="aspect-video bg-secondary/50 rounded-lg mb-3 relative overflow-hidden">
                <div className="absolute inset-0 flex items-center justify-center">
                  <Video className="w-8 h-8 text-muted-foreground/30" />
                </div>
                {camera.status === "active" && (
                  <div className="absolute top-2 left-2 flex items-center gap-1.5 bg-background/80 backdrop-blur-sm rounded-full px-2 py-1">
                    <div className="w-2 h-2 bg-success rounded-full animate-pulse" />
                    <span className="text-[10px] font-medium text-success">LIVE</span>
                  </div>
                )}
                {camera.status === "offline" && (
                  <div className="absolute top-2 left-2 flex items-center gap-1.5 bg-background/80 backdrop-blur-sm rounded-full px-2 py-1">
                    <div className="w-2 h-2 bg-muted-foreground rounded-full" />
                    <span className="text-[10px] font-medium text-muted-foreground">OFFLINE</span>
                  </div>
                )}
                {camera.violations > 0 && (
                  <div className="absolute top-2 right-2 bg-destructive text-destructive-foreground text-[10px] font-bold px-2 py-1 rounded-full">
                    {camera.violations}
                  </div>
                )}
              </div>
              <p className="text-sm font-medium text-foreground truncate">{camera.name}</p>
              <p className="text-xs text-muted-foreground mt-0.5">Camera #{camera.id}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
