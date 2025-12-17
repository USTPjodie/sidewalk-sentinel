import { useState, useCallback, useRef, useEffect } from "react";
import { Upload, Image, Video, Wifi, X, FileVideo, FileImage, CheckCircle, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { analyzeImages } from "@/lib/roboflowService";

type UploadType = "image" | "video" | "stream";

interface AnalysisResultData {
  file: string;
  success: boolean;
  data?: any;
  error?: string;
  fileUrl?: string;
}

export const UploadPanel = () => {
  const [dragOver, setDragOver] = useState(false);
  const [selectedType, setSelectedType] = useState<UploadType>("image");
  const [files, setFiles] = useState<File[]>([]);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisResults, setAnalysisResults] = useState<AnalysisResultData[]>([]);
  const canvasRefs = useRef<{ [key: string]: HTMLCanvasElement | null }>({});
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

  // Draw bounding boxes on canvas
  useEffect(() => {
    analysisResults.forEach((result) => {
      if (result.success && result.fileUrl && result.data) {
        const canvas = canvasRefs.current[result.file];
        if (!canvas) {
          console.warn('Canvas not found for:', result.file);
          return;
        }

        const ctx = canvas.getContext('2d');
        if (!ctx) {
          console.warn('Could not get canvas context for:', result.file);
          return;
        }

        const img = new window.Image();
        img.onload = () => {
          // Set canvas size to match image
          canvas.width = img.width;
          canvas.height = img.height;
          
          // Draw the original image first
          ctx.drawImage(img, 0, 0);
          
          console.log('=== CANVAS DRAWING START ===');
          console.log('Drawing on canvas for:', result.file);
          console.log('Canvas dimensions:', canvas.width, 'x', canvas.height);
          console.log('API Response data:', JSON.stringify(result.data, null, 2));
          
          // Extract outputs from the workflow response
          // Check both root level and nested outputs
          const outputs = result.data.outputs || result.data;
          
          console.log('Outputs structure:', JSON.stringify(outputs, null, 2));
          
          // Check if there's a pre-rendered visualization from Roboflow
          // Check root level first (your structure: { output_image: {...} })
          const outputImage = result.data.output_image || outputs.output_image;
          
          if (outputImage && outputImage.value) {
            console.log('Found output_image, loading visualization...');
            const vizData = outputImage.value;
            const vizImg = new window.Image();
            
            vizImg.onload = () => {
              console.log('Visualization image loaded successfully!');
              console.log('Viz image dimensions:', vizImg.width, 'x', vizImg.height);
              // Draw the visualization image (already has bounding boxes)
              ctx.clearRect(0, 0, canvas.width, canvas.height);
              ctx.drawImage(vizImg, 0, 0, canvas.width, canvas.height);
              console.log('=== VISUALIZATION DRAWN ===');
            };
            
            vizImg.onerror = (error) => {
              console.error('Failed to load visualization image:', error);
              console.error('Viz data prefix:', vizData.substring(0, 100));
            };
            
            // Handle base64 with or without data URI prefix
            vizImg.src = vizData.startsWith('data:') 
              ? vizData 
              : `data:image/jpeg;base64,${vizData}`;
            return;
          } else if (outputs.visualization || outputs.visualisation) {
            console.log('Found visualization field, loading...');
            const vizData = outputs.visualization || outputs.visualisation;
            const vizImg = new window.Image();
            
            vizImg.onload = () => {
              console.log('Visualization loaded successfully!');
              // Draw the visualization image (already has bounding boxes)
              ctx.clearRect(0, 0, canvas.width, canvas.height);
              ctx.drawImage(vizImg, 0, 0, canvas.width, canvas.height);
              console.log('=== VISUALIZATION DRAWN ===');
            };
            
            vizImg.onerror = () => {
              console.error('Failed to load visualization image');
            };
            
            // Handle base64 with or without data URI prefix
            vizImg.src = vizData.startsWith('data:') 
              ? vizData 
              : `data:image/jpeg;base64,${vizData}`;
            return;
          }
          
          console.log('No pre-rendered visualization found, drawing bounding boxes manually...');
          
          // If no visualization, draw bounding boxes manually
          let predictions: any[] = [];
          
          console.log('Checking outputs.predictions:', outputs.predictions);
          console.log('Is predictions an object?', typeof outputs.predictions === 'object');
          console.log('Is predictions an array?', Array.isArray(outputs.predictions));
          
          if (outputs.predictions && typeof outputs.predictions === 'object' && !Array.isArray(outputs.predictions)) {
            console.log('predictions is an object, checking for nested predictions array');
            console.log('outputs.predictions.predictions:', outputs.predictions.predictions);
            console.log('Is nested predictions an array?', Array.isArray(outputs.predictions.predictions));
          }
          
          // Handle the specific structure from detect-count-and-visualize workflow
          // Structure: { predictions: { image: {...}, predictions: [...] } }
          // IMPORTANT: Check for double-nested structure FIRST
          if (outputs.predictions && 
              typeof outputs.predictions === 'object' && 
              !Array.isArray(outputs.predictions) &&
              outputs.predictions.predictions && 
              Array.isArray(outputs.predictions.predictions)) {
            predictions = outputs.predictions.predictions;
            console.log('✓ Found predictions in outputs.predictions.predictions, count:', predictions.length);
          } else if (outputs.predictions && Array.isArray(outputs.predictions)) {
            predictions = outputs.predictions;
            console.log('✓ Found predictions in outputs.predictions (direct array), count:', predictions.length);
          } else if (Array.isArray(outputs)) {
            predictions = outputs;
            console.log('✓ Found predictions as direct array, count:', predictions.length);
          } else if (outputs.detections && Array.isArray(outputs.detections)) {
            predictions = outputs.detections;
            console.log('✓ Found predictions in outputs.detections, count:', predictions.length);
          } else {
            // Check for nested outputs structure - workflows may have multiple output keys
            console.log('No standard structure found, scanning all keys...');
            const keys = Object.keys(outputs);
            for (const key of keys) {
              const value = outputs[key];
              // Look for arrays of objects with detection properties
              if (Array.isArray(value) && value.length > 0) {
                const firstItem = value[0];
                if (firstItem && typeof firstItem === 'object' && 
                    (firstItem.class || firstItem.x !== undefined || firstItem.bbox)) {
                  predictions = value;
                  console.log(`✓ Found predictions in outputs.${key}, count:`, predictions.length);
                  break;
                }
              }
            }
          }
          
          console.log('Total predictions to draw:', predictions.length);
          console.log('Predictions array:', predictions);
          
          if (predictions.length === 0) {
            console.warn('No predictions found to draw!');
            console.log('=== CANVAS DRAWING END (NO PREDICTIONS) ===');
            return;
          }
          
          // Draw each prediction
          predictions.forEach((prediction: any, index: number) => {
            console.log(`Drawing prediction ${index + 1}/${predictions.length}:`, JSON.stringify(prediction, null, 2));
            
            // Handle different coordinate formats
            let x, y, width, height;
            
            if (prediction.x !== undefined && prediction.y !== undefined) {
              // Center-based coordinates (Roboflow format)
              x = prediction.x - (prediction.width || 0) / 2;
              y = prediction.y - (prediction.height || 0) / 2;
              width = prediction.width || 0;
              height = prediction.height || 0;
              console.log(`  Coords (center): center=(${prediction.x}, ${prediction.y}), box=(${x}, ${y}, ${width}, ${height})`);
            } else if (prediction.bbox) {
              // Bounding box format [x, y, width, height]
              [x, y, width, height] = prediction.bbox;
              console.log(`  Coords (bbox):`, { x, y, width, height });
            } else if (prediction.box) {
              // Alternative box format
              const box = prediction.box;
              x = box.x1 || box.xmin || 0;
              y = box.y1 || box.ymin || 0;
              width = (box.x2 || box.xmax || 0) - x;
              height = (box.y2 || box.ymax || 0) - y;
              console.log(`  Coords (box):`, { x, y, width, height });
            } else {
              console.warn('Unknown prediction format, skipping:', prediction);
              return;
            }
            
            // Draw bounding box with thick red line
            ctx.strokeStyle = '#ef4444';
            ctx.lineWidth = 4;
            ctx.strokeRect(x, y, width, height);
            console.log(`  Drew box at (${x}, ${y}) with size ${width}x${height}`);
            
            // Add semi-transparent fill
            ctx.fillStyle = 'rgba(239, 68, 68, 0.1)';
            ctx.fillRect(x, y, width, height);
            
            // Prepare label text
            const className = prediction.class || prediction.label || prediction.name || 'Detection';
            const confidence = prediction.confidence || prediction.score || 0;
            // Handle both decimal (0-1) and percentage (0-100) formats
            const confidencePercent = confidence > 1 ? confidence : confidence * 100;
            const label = `${className} ${confidencePercent.toFixed(1)}%`;
            
            // Draw label background
            ctx.font = 'bold 16px Arial';
            const textMetrics = ctx.measureText(label);
            const textWidth = textMetrics.width;
            const textHeight = 20;
            
            // Position label above box, or below if too close to top
            const labelY = y > 30 ? y - 5 : y + height + 25;
            
            ctx.fillStyle = '#ef4444';
            ctx.fillRect(x, labelY - textHeight, textWidth + 12, textHeight + 6);
            
            // Draw label text
            ctx.fillStyle = 'white';
            ctx.fillText(label, x + 6, labelY - 4);
            console.log(`  Drew label "${label}" at y=${labelY}`);
          });
          
          console.log('=== CANVAS DRAWING END (SUCCESS) ===');
        };
        
        img.onerror = (error) => {
          console.error('Failed to load image:', result.fileUrl, error);
        };
        
        img.src = result.fileUrl;
      }
    });
  }, [analysisResults]);

  const handleAnalyze = async () => {
    if (files.length === 0) {
      toast({
        title: "No files selected",
        description: "Please select at least one image for analysis",
        variant: "destructive",
      });
      return;
    }

    setIsAnalyzing(true);
    
    try {
      toast({
        title: "Analysis started",
        description: "Processing your media for violations...",
      });

      // Filter only image files for analysis
      const imageFiles = files.filter(file => file.type.startsWith("image/"));
      
      if (imageFiles.length === 0) {
        toast({
          title: "No images found",
          description: "Please select image files for analysis",
          variant: "destructive",
        });
        setIsAnalyzing(false);
        return;
      }

      const results = await analyzeImages(imageFiles);
      
      console.log('=== RAW ANALYSIS RESULTS ===');
      console.log('Results from API:', JSON.stringify(results, null, 2));
      
      // Create file URLs for displaying images
      // IMPORTANT: Preserve the full API response data structure
      const resultsWithUrls = results.map((result, index) => {
        console.log(`Result ${index}:`, result);
        return {
          ...result,
          fileUrl: URL.createObjectURL(imageFiles[index])
        };
      });
      
      console.log('=== RESULTS WITH URLS ===');
      console.log('Results with URLs:', JSON.stringify(resultsWithUrls, null, 2));
      
      setAnalysisResults(resultsWithUrls);
      
      // Check if all analyses were successful
      const successfulAnalyses = results.filter(result => result.success);
      const failedAnalyses = results.filter(result => !result.success);
      
      if (successfulAnalyses.length > 0) {
        toast({
          title: "Analysis complete",
          description: `Successfully analyzed ${successfulAnalyses.length} image(s). Found potential violations.`,
        });
      }
      
      if (failedAnalyses.length > 0) {
        // Create a detailed error message
        let errorDetails = "";
        if (failedAnalyses.length <= 3) {
          errorDetails = failedAnalyses.map(failure => 
            `${failure.file}: ${failure.error}`
          ).join("\n");
        } else {
          errorDetails = `${failedAnalyses.length} files failed to process. Check console for details.`;
        }
        
        // Check if this is an API key issue
        const isAuthError = failedAnalyses.some(failure => 
          failure.error?.includes("Unauthorized") || 
          failure.error?.includes("API key")
        );
        
        toast({
          title: isAuthError ? "Authentication Error" : "Analysis partially failed",
          description: isAuthError 
            ? "Invalid or missing API key. Please check your Roboflow API key in the .env file." 
            : `${failedAnalyses.length} image(s) failed to process.\n${errorDetails}`,
          variant: isAuthError ? "destructive" : "destructive",
        });
      }
      
      console.log("Analysis results:", results);
    } catch (error: any) {
      // Handle authentication errors specifically
      const errorMessage = error?.message || "An unknown error occurred during analysis";
      const isAuthError = errorMessage.includes("Unauthorized") || errorMessage.includes("API key");
      
      toast({
        title: isAuthError ? "Authentication Error" : "Analysis failed",
        description: isAuthError 
          ? "Invalid or missing API key. Please check your Roboflow API key in the .env file." 
          : errorMessage,
        variant: "destructive",
      });
    } finally {
      setIsAnalyzing(false);
    }
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
              <Button 
                variant="glow" 
                className="w-full mt-4" 
                onClick={handleAnalyze}
                disabled={isAnalyzing}
              >
                {isAnalyzing ? (
                  <>
                    <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin mr-2"></div>
                    Analyzing...
                  </>
                ) : (
                  <>
                    <Upload className="w-4 h-4 mr-2" />
                    Analyze {files.length} File{files.length > 1 ? "s" : ""}
                  </>
                )}
              </Button>
            </div>
          )}
        </>
      )}

      {/* Analysis Results Section */}
      {analysisResults.length > 0 && (
        <div className="mt-8 space-y-6">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold text-foreground">Analysis Results</h3>
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                setAnalysisResults([]);
                setFiles([]);
              }}
            >
              Clear Results
            </Button>
          </div>

          <div className="grid grid-cols-1 gap-6">
            {analysisResults.map((result, index) => (
              <div
                key={index}
                className="glass-card p-4 space-y-4"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    {result.success ? (
                      <CheckCircle className="w-5 h-5 text-success" />
                    ) : (
                      <AlertCircle className="w-5 h-5 text-destructive" />
                    )}
                    <span className="font-medium text-foreground">{result.file}</span>
                  </div>
                  {result.success && result.data && (
                    <div className="flex items-center gap-3">
                      {/* Show count_objects if available from Roboflow */}
                      {(() => {
                        console.log('=== COUNT DISPLAY DEBUG ===');
                        console.log('result.data:', result.data);
                        console.log('result.data type:', typeof result.data);
                        console.log('result.data keys:', result.data ? Object.keys(result.data) : 'null');
                        
                        const outputs = result.data.outputs || result.data;
                        console.log('outputs:', outputs);
                        console.log('outputs keys:', outputs ? Object.keys(outputs) : 'null');
                        
                        // count_objects might be at root level or in outputs
                        const count = outputs.count_objects || result.data.count_objects;
                        
                        console.log('Count debug:', {
                          count,
                          'outputs.count_objects': outputs.count_objects,
                          'data.count_objects': result.data.count_objects,
                          'typeof count': typeof count,
                          'full outputs': outputs
                        });
                        
                        if (count !== undefined && count !== null) {
                          return (
                            <div className="flex items-center gap-2 bg-primary/10 px-3 py-1 rounded-full">
                              <span className="text-sm font-semibold text-primary">{Number(count)} objects detected</span>
                            </div>
                          );
                        }
                        
                        // Fallback to counting predictions
                        let predictions: any[] = [];
                        
                        // Handle double-nested predictions structure
                        if (outputs.predictions && outputs.predictions.predictions && Array.isArray(outputs.predictions.predictions)) {
                          predictions = outputs.predictions.predictions;
                        } else if (outputs.predictions && Array.isArray(outputs.predictions)) {
                          predictions = outputs.predictions;
                        } else if (Array.isArray(outputs)) {
                          predictions = outputs;
                        } else if (outputs.detections) {
                          predictions = outputs.detections;
                        } else {
                          const keys = Object.keys(outputs);
                          for (const key of keys) {
                            const value = outputs[key];
                            if (Array.isArray(value) && value.length > 0) {
                              const firstItem = value[0];
                              if (firstItem && typeof firstItem === 'object' && 
                                  (firstItem.class || firstItem.x !== undefined || firstItem.bbox)) {
                                predictions = value;
                                break;
                              }
                            }
                          }
                        }
                        
                        return (
                          <div className="text-sm text-muted-foreground">
                            {predictions.length} detection(s)
                          </div>
                        );
                      })()}
                    </div>
                  )}
                </div>

                {result.success && result.fileUrl ? (
                  <div className="space-y-3">
                    <div className="relative overflow-hidden rounded-lg border border-border">
                      <canvas
                        ref={(el) => {
                          if (el) canvasRefs.current[result.file] = el;
                        }}
                        className="w-full h-auto"
                      />
                    </div>

                    {/* Detection Details */}
                    {result.data && (() => {
                      const outputs = result.data.outputs || result.data;
                      
                      // Try to find predictions in the same way as canvas drawing
                      let predictions: any[] = [];
                      
                      // Handle double-nested predictions structure
                      if (outputs.predictions && outputs.predictions.predictions && Array.isArray(outputs.predictions.predictions)) {
                        predictions = outputs.predictions.predictions;
                      } else if (outputs.predictions && Array.isArray(outputs.predictions)) {
                        predictions = outputs.predictions;
                      } else if (Array.isArray(outputs)) {
                        predictions = outputs;
                      } else if (outputs.detections) {
                        predictions = outputs.detections;
                      } else {
                        const keys = Object.keys(outputs);
                        for (const key of keys) {
                          const value = outputs[key];
                          if (Array.isArray(value) && value.length > 0) {
                            const firstItem = value[0];
                            if (firstItem && typeof firstItem === 'object' && 
                                (firstItem.class || firstItem.x !== undefined || firstItem.bbox)) {
                              predictions = value;
                              break;
                            }
                          }
                        }
                      }
                      
                      const totalCount = outputs.count_objects || result.data.count_objects || predictions.length;
                      
                      console.log('Total count debug:', {
                        totalCount,
                        'outputs.count_objects': outputs.count_objects,
                        'data.count_objects': result.data.count_objects,
                        'predictions.length': predictions.length
                      });
                      
                      if (predictions.length > 0) {
                        return (
                          <div className="space-y-2">
                            <div className="flex items-center justify-between">
                              <h4 className="text-sm font-semibold text-foreground">Detections:</h4>
                              <span className="text-xs text-muted-foreground">Total: {totalCount}</span>
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                              {predictions.map((pred: any, i: number) => (
                                <div
                                  key={i}
                                  className="bg-secondary/50 rounded-lg p-3 text-sm"
                                >
                                  <div className="flex items-center justify-between">
                                    <span className="font-medium text-foreground">
                                      {pred.class || pred.label || pred.name || `Object ${i + 1}`}
                                    </span>
                                    <span className="text-primary font-semibold">
                                      {(() => {
                                        const conf = pred.confidence || pred.score || 0;
                                        // Handle both decimal (0-1) and percentage (0-100) formats
                                        const confPercent = conf > 1 ? conf : conf * 100;
                                        return `${confPercent.toFixed(1)}%`;
                                      })()}
                                    </span>
                                  </div>
                                  {pred.x !== undefined && (
                                    <div className="text-xs text-muted-foreground mt-1">
                                      Position: ({Math.round(pred.x)}, {Math.round(pred.y)})
                                    </div>
                                  )}
                                </div>
                              ))}
                            </div>
                          </div>
                        );
                      }
                      return null;
                    })()}
                  </div>
                ) : (
                  <div className="text-sm text-destructive">
                    Error: {result.error || 'Analysis failed'}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};