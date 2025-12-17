import { useState } from "react";
import { Header } from "@/components/Header";
import { StatsGrid } from "@/components/StatsGrid";
import { UploadPanel } from "@/components/UploadPanel";
import { AnalyticsCharts } from "@/components/AnalyticsCharts";
import { ViolationsList } from "@/components/ViolationsList";
import { LiveView } from "@/components/LiveView";
import { MapView } from "@/components/MapView";
import { ReportsPanel } from "@/components/ReportsPanel";
import { SummaryBar } from "@/components/SummaryBar";

interface Detection {
  id: string;
  fileName: string;
  imageUrl: string;
  vehicleType: string;
  confidence: number;
  timestamp: string;
  count: number;
  detectionMethod: 'roboflow' | 'transformers';
}

const Index = () => {
  const [activeTab, setActiveTab] = useState("live");
  const [detections, setDetections] = useState<Detection[]>([]);

  const renderContent = () => {
    switch (activeTab) {
      case "live":
        return <LiveView />;
      case "upload":
        return <UploadPanel onDetectionsUpdate={setDetections} />;
      case "analytics":
        return <AnalyticsCharts />;
      case "map":
        return <MapView />;
      case "reports":
        return <ReportsPanel />;
      default:
        return <LiveView />;
    }
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Background grid pattern */}
      <div 
        className="fixed inset-0 bg-grid-pattern opacity-[0.02] pointer-events-none"
        style={{ backgroundSize: '40px 40px' }}
      />
      
      {/* Gradient overlay */}
      <div className="fixed inset-0 bg-gradient-radial from-primary/5 via-transparent to-transparent pointer-events-none" />
      
      <Header activeTab={activeTab} onTabChange={setActiveTab} />
      
      <main className="container mx-auto px-6 py-6 pb-24">
        {/* Stats Grid - Always visible */}
        <div className="mb-6">
          <StatsGrid />
        </div>

        {/* Main Content Area */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Primary Content - Takes 2 columns on large screens */}
          <div className="lg:col-span-2">
            {renderContent()}
          </div>

          {/* Sidebar - Violations List */}
          <div className="lg:col-span-1">
            <ViolationsList detections={detections} />
          </div>
        </div>
      </main>

      <SummaryBar />
    </div>
  );
};

export default Index;
