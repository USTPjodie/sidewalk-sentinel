import { useState, useCallback } from "react";
import { Upload, Image, Video, Wifi, X, FileVideo, FileImage } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";

type UploadType = "image" | "video" | "stream";

export const UploadPanel = () => {
  const [dragOver, setDragOver] = useState(false);
  const [selectedType, setSelectedType] = useState<UploadType>("image");
  const [files, setFiles] = useState<File[]>([]);
  const { toast } = useToast();

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    const droppedFiles = Array.from(e.dataTransfer.files);
    setFiles(prev => [...prev, ...droppedFiles]);
    toast({
      title: "Files added",
      description: `${droppedFiles.length} file(s) ready for analysis`,
    });
  }, [toast]);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const selectedFiles = Array.from(e.target.files);
      setFiles(prev => [...prev, ...selectedFiles]);
      toast({
        title: "Files added",
        description: `${selectedFiles.length} file(s) ready for analysis`,
      });
    }
  };

  const removeFile = (index: number) => {
    setFiles(prev => prev.filter((_, i) => i !== index));
  };

  const handleAnalyze = () => {
    toast({
      title: "Analysis started",
      description: "Processing your media for violations...",
    });
  };

  const uploadTypes = [
    { id: "image", label: "Image", icon: Image, accept: "image/jpeg,image/png" },
    { id: "video", label: "Video", icon: Video, accept: "video/mp4,video/quicktime" },
    { id: "stream", label: "Live Stream", icon: Wifi, accept: "" },
  ];

  return (
    <div className="glass-card p-6 animate-slide-up">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-xl font-semibold text-foreground">Upload Media</h2>
          <p className="text-sm text-muted-foreground mt-1">
            Upload images or videos for violation detection
          </p>
        </div>
        <div className="flex gap-2 bg-secondary/50 rounded-lg p-1">
          {uploadTypes.map((type) => (
            <button
              key={type.id}
              onClick={() => setSelectedType(type.id as UploadType)}
              className={`flex items-center gap-2 px-3 py-2 rounded-md text-sm font-medium transition-all ${
                selectedType === type.id
                  ? "bg-primary text-primary-foreground"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              <type.icon className="w-4 h-4" />
              {type.label}
            </button>
          ))}
        </div>
      </div>

      {selectedType === "stream" ? (
        <div className="border-2 border-dashed border-border/60 rounded-xl p-8 text-center">
          <Wifi className="w-12 h-12 mx-auto text-primary mb-4" />
          <h3 className="text-lg font-medium text-foreground mb-2">Live Stream</h3>
          <p className="text-sm text-muted-foreground mb-4">
            Connect to a live video feed for real-time detection
          </p>
          <div className="flex gap-4 justify-center items-center">
            <input
              type="text"
              placeholder="Enter stream URL (RTSP/WebRTC)"
              className="flex-1 max-w-md bg-secondary/50 border border-border rounded-lg px-4 py-2 text-sm text-foreground placeholder:text-muted-foreground outline-none focus:border-primary transition-colors"
            />
            <Button variant="glow">
              <Wifi className="w-4 h-4 mr-2" />
              Connect
            </Button>
          </div>
        </div>
      ) : (
        <>
          <div
            className={`upload-zone ${dragOver ? "dragging" : ""}`}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
          >
            <div className="text-center">
              <Upload className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
              <h3 className="text-lg font-medium text-foreground mb-2">
                Drag & drop your files here
              </h3>
              <p className="text-sm text-muted-foreground mb-4">
                or click to browse from your device
              </p>
              <input
                type="file"
                id="file-upload"
                className="hidden"
                multiple
                accept={uploadTypes.find(t => t.id === selectedType)?.accept}
                onChange={handleFileSelect}
              />
              <Button variant="outline" asChild>
                <label htmlFor="file-upload" className="cursor-pointer">
                  Browse Files
                </label>
              </Button>
              <p className="text-xs text-muted-foreground mt-4">
                Supported: {selectedType === "image" ? "JPG, PNG" : "MP4, MOV"} • Max 50MB
              </p>
            </div>
          </div>

          {files.length > 0 && (
            <div className="mt-6">
              <h4 className="text-sm font-medium text-foreground mb-3">
                Selected Files ({files.length})
              </h4>
              <div className="space-y-2">
                {files.map((file, index) => (
                  <div
                    key={index}
                    className="flex items-center justify-between bg-secondary/50 rounded-lg px-4 py-3"
                  >
                    <div className="flex items-center gap-3">
                      {file.type.startsWith("video") ? (
                        <FileVideo className="w-5 h-5 text-primary" />
                      ) : (
                        <FileImage className="w-5 h-5 text-primary" />
                      )}
                      <div>
                        <p className="text-sm font-medium text-foreground">{file.name}</p>
                        <p className="text-xs text-muted-foreground">
                          {(file.size / 1024 / 1024).toFixed(2)} MB
                        </p>
                      </div>
                    </div>
                    <button
                      onClick={() => removeFile(index)}
                      className="p-1 hover:bg-destructive/20 rounded-md transition-colors"
                    >
                      <X className="w-4 h-4 text-muted-foreground hover:text-destructive" />
                    </button>
                  </div>
                ))}
              </div>
              <Button variant="glow" className="w-full mt-4" onClick={handleAnalyze}>
                <Upload className="w-4 h-4 mr-2" />
                Analyze {files.length} File{files.length > 1 ? "s" : ""}
              </Button>
            </div>
          )}
        </>
      )}
    </div>
  );
};
