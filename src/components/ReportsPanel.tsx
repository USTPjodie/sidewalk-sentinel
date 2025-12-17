import { FileText, Download, Calendar, Filter } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useState } from "react";

export const ReportsPanel = () => {
  const [dateRange, setDateRange] = useState("week");

  const reports = [
    { id: 1, name: "Weekly Violation Summary", date: "Dec 10, 2024", type: "PDF", size: "2.4 MB" },
    { id: 2, name: "Monthly Analytics Report", date: "Dec 1, 2024", type: "PDF", size: "5.1 MB" },
    { id: 3, name: "Hotspot Analysis Q4", date: "Nov 30, 2024", type: "CSV", size: "1.2 MB" },
    { id: 4, name: "Enforcement Metrics", date: "Nov 25, 2024", type: "PDF", size: "3.8 MB" },
  ];

  return (
    <div className="space-y-6">
      {/* Report Generator */}
      <div className="glass-card p-6 animate-scale-in">
        <h2 className="text-xl font-semibold text-foreground mb-4">Generate Report</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="text-sm text-muted-foreground mb-2 block">Report Type</label>
            <select className="w-full bg-secondary/50 border border-border rounded-lg px-4 py-2.5 text-sm text-foreground outline-none focus:border-primary transition-colors">
              <option>Violation Summary</option>
              <option>Analytics Report</option>
              <option>Hotspot Analysis</option>
              <option>Enforcement Metrics</option>
            </select>
          </div>
          <div>
            <label className="text-sm text-muted-foreground mb-2 block">Date Range</label>
            <div className="flex gap-2">
              {["day", "week", "month"].map((range) => (
                <button
                  key={range}
                  onClick={() => setDateRange(range)}
                  className={`flex-1 px-3 py-2.5 rounded-lg text-sm font-medium transition-all ${
                    dateRange === range
                      ? "bg-primary text-primary-foreground"
                      : "bg-secondary/50 text-muted-foreground hover:text-foreground"
                  }`}
                >
                  {range.charAt(0).toUpperCase() + range.slice(1)}
                </button>
              ))}
            </div>
          </div>
          <div>
            <label className="text-sm text-muted-foreground mb-2 block">Format</label>
            <div className="flex gap-2">
              <button className="flex-1 px-3 py-2.5 rounded-lg text-sm font-medium bg-primary text-primary-foreground">
                PDF
              </button>
              <button className="flex-1 px-3 py-2.5 rounded-lg text-sm font-medium bg-secondary/50 text-muted-foreground hover:text-foreground transition-all">
                CSV
              </button>
            </div>
          </div>
        </div>
        <div className="flex justify-end mt-6">
          <Button variant="glow">
            <FileText className="w-4 h-4 mr-2" />
            Generate Report
          </Button>
        </div>
      </div>

      {/* Recent Reports */}
      <div className="glass-card overflow-hidden animate-slide-up">
        <div className="flex items-center justify-between p-6 border-b border-border/50">
          <div>
            <h2 className="text-xl font-semibold text-foreground">Recent Reports</h2>
            <p className="text-sm text-muted-foreground mt-1">
              Previously generated reports
            </p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" size="sm">
              <Calendar className="w-4 h-4 mr-2" />
              Date
            </Button>
            <Button variant="outline" size="sm">
              <Filter className="w-4 h-4 mr-2" />
              Filter
            </Button>
          </div>
        </div>

        <div className="divide-y divide-border/50">
          {reports.map((report, index) => (
            <div
              key={report.id}
              className="flex items-center justify-between p-4 hover:bg-secondary/30 transition-colors animate-fade-in"
              style={{ animationDelay: `${index * 50}ms` }}
            >
              <div className="flex items-center gap-4">
                <div className="p-3 rounded-lg bg-primary/10">
                  <FileText className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <p className="text-sm font-medium text-foreground">{report.name}</p>
                  <div className="flex items-center gap-3 mt-1">
                    <span className="text-xs text-muted-foreground">{report.date}</span>
                    <span className="text-xs px-2 py-0.5 rounded bg-secondary text-secondary-foreground">
                      {report.type}
                    </span>
                    <span className="text-xs text-muted-foreground">{report.size}</span>
                  </div>
                </div>
              </div>
              <Button variant="ghost" size="sm">
                <Download className="w-4 h-4 mr-2" />
                Download
              </Button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
