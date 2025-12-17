import { pipeline, type ObjectDetectionPipeline, env } from '@xenova/transformers';

// Configure the transformers environment
env.allowLocalModels = false;
env.allowRemoteModels = true;
env.useBrowserCache = true;

// Vehicle class labels from COCO dataset
// These are the class names that we want to detect
const VEHICLE_CLASSES = [
  'car',
  'motorcycle',
  'airplane',
  'bus',
  'train',
  'truck',
  'boat',
  'bicycle'
];

/**
 * Check if a detected label is a vehicle
 */
function isVehicle(label: string): boolean {
  const normalizedLabel = label.toLowerCase().trim();
  return VEHICLE_CLASSES.some(vehicleClass => 
    normalizedLabel.includes(vehicleClass)
  );
}

/**
 * Calculate Intersection over Union (IoU) between two bounding boxes
 * @param box1 - First bounding box {xmin, ymin, xmax, ymax}
 * @param box2 - Second bounding box {xmin, ymin, xmax, ymax}
 * @returns IoU value between 0 and 1
 */
function calculateIoU(
  box1: { xmin: number; ymin: number; xmax: number; ymax: number },
  box2: { xmin: number; ymin: number; xmax: number; ymax: number }
): number {
  // Calculate intersection area
  const x1 = Math.max(box1.xmin, box2.xmin);
  const y1 = Math.max(box1.ymin, box2.ymin);
  const x2 = Math.min(box1.xmax, box2.xmax);
  const y2 = Math.min(box1.ymax, box2.ymax);
  
  const intersectionWidth = Math.max(0, x2 - x1);
  const intersectionHeight = Math.max(0, y2 - y1);
  const intersectionArea = intersectionWidth * intersectionHeight;
  
  // Calculate union area
  const box1Area = (box1.xmax - box1.xmin) * (box1.ymax - box1.ymin);
  const box2Area = (box2.xmax - box2.xmin) * (box2.ymax - box2.ymin);
  const unionArea = box1Area + box2Area - intersectionArea;
  
  // Return IoU
  return unionArea > 0 ? intersectionArea / unionArea : 0;
}

/**
 * Apply Non-Maximum Suppression to remove overlapping detections
 * @param detections - Array of detection results
 * @param iouThreshold - IoU threshold for considering boxes as overlapping (default: 0.5)
 * @returns Filtered array of detections
 */
function applyNMS(
  detections: DetectionResult[],
  iouThreshold: number = 0.5
): DetectionResult[] {
  if (detections.length === 0) return [];
  
  // Sort detections by confidence score (highest first)
  const sortedDetections = [...detections].sort((a, b) => b.score - a.score);
  
  const selectedDetections: DetectionResult[] = [];
  const suppressedIndices = new Set<number>();
  
  for (let i = 0; i < sortedDetections.length; i++) {
    if (suppressedIndices.has(i)) continue;
    
    const currentDetection = sortedDetections[i];
    selectedDetections.push(currentDetection);
    
    // Suppress all detections with high IoU with current detection
    for (let j = i + 1; j < sortedDetections.length; j++) {
      if (suppressedIndices.has(j)) continue;
      
      const otherDetection = sortedDetections[j];
      const iou = calculateIoU(currentDetection.box, otherDetection.box);
      
      // Suppress if IoU is above threshold and same class
      if (iou > iouThreshold && currentDetection.label === otherDetection.label) {
        suppressedIndices.add(j);
      }
    }
  }
  
  console.log(`NMS: Reduced from ${detections.length} to ${selectedDetections.length} detections`);
  console.log(`NMS: Suppressed ${suppressedIndices.size} overlapping detections`);
  
  return selectedDetections;
}

// Define types for our functions
interface DetectionResult {
  score: number;
  label: string;
  box: {
    xmin: number;
    ymin: number;
    xmax: number;
    ymax: number;
  };
}

interface TransformersAnalysisResult {
  file: string;
  success: boolean;
  data?: {
    count_objects: number;
    predictions: {
      image: {
        width: number;
        height: number;
      };
      predictions: Array<{
        width: number;
        height: number;
        x: number;
        y: number;
        confidence: number;
        class_id: number;
        class: string;
        detection_id: string;
      }>;
    };
  };
  error?: string;
}

let detector: ObjectDetectionPipeline | null = null;

/**
 * Initialize the object detection model
 * Using DETR (DEtection TRansformer) model from Hugging Face
 */
async function initializeDetector(): Promise<ObjectDetectionPipeline> {
  if (detector) return detector;
  
  console.log('Initializing Transformers DETR model...');
  console.log('This may take a few moments on first load (downloading model)');
  
  try {
    // Use DETR ResNet-50 model for object detection
    // Using the Xenova optimized version which is pre-converted for browser use
    detector = await pipeline(
      'object-detection', 
      'Xenova/detr-resnet-50',
      {
        quantized: true, // Use quantized model for faster loading
      }
    );
    
    console.log('Model initialized successfully!');
    return detector;
  } catch (error) {
    console.error('Failed to initialize model:', error);
    throw new Error(
      'Failed to load detection model. Please check your internet connection and try again. ' +
      'Error: ' + (error instanceof Error ? error.message : String(error))
    );
  }
}

/**
 * Convert File to image URL for processing
 */
async function fileToDataURL(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = error => reject(error);
  });
}

/**
 * Get image dimensions from a File
 */
async function getImageDimensions(file: File): Promise<{ width: number; height: number }> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    const url = URL.createObjectURL(file);
    
    img.onload = () => {
      URL.revokeObjectURL(url);
      resolve({ width: img.width, height: img.height });
    };
    
    img.onerror = () => {
      URL.revokeObjectURL(url);
      reject(new Error('Failed to load image'));
    };
    
    img.src = url;
  });
}

/**
 * Analyze an image using Transformers.js DETR model
 * @param imageFile - The image file to analyze
 * @returns Promise with detection results
 */
export async function analyzeImageWithTransformers(imageFile: File): Promise<TransformersAnalysisResult['data']> {
  try {
    console.log('=== TRANSFORMERS DETECTION START ===');
    console.log('Image file:', {
      name: imageFile.name,
      type: imageFile.type,
      size: imageFile.size
    });
    
    // Initialize detector if not already done
    const model = await initializeDetector();
    
    // Get image dimensions
    const dimensions = await getImageDimensions(imageFile);
    console.log('Image dimensions:', dimensions);
    
    // Convert file to data URL
    const imageUrl = await fileToDataURL(imageFile);
    
    // Run object detection
    console.log('Running object detection...');
    const detections = await model(imageUrl, {
      threshold: 0.9, // Confidence threshold: 90% minimum
      percentage: false, // Return pixel coordinates
    }) as DetectionResult[];
    
    console.log(`Detected ${detections.length} objects (before filtering)`);
    console.log('Raw detections:', detections);
    
    // Filter to only include vehicles
    const vehicleDetections = detections.filter(detection => isVehicle(detection.label));
    
    console.log(`Filtered to ${vehicleDetections.length} vehicles (before confidence filter)`);
    
    // Additional confidence filter to ensure only high-confidence detections (>= 90%)
    const highConfidenceDetections = vehicleDetections.filter(detection => detection.score >= 0.9);
    
    console.log(`High confidence detections (>= 90%): ${highConfidenceDetections.length} vehicles`);
    
    // Apply Non-Maximum Suppression to remove overlapping detections
    const nmsDetections = applyNMS(highConfidenceDetections, 0.5); // IoU threshold of 0.5
    
    console.log(`Final count after NMS: ${nmsDetections.length} vehicles`);
    console.log('Final detections:', nmsDetections);
    
    // Convert to Roboflow-compatible format
    const predictions = nmsDetections.map((detection, index) => {
      const { box, label, score } = detection;
      
      // Convert box format from {xmin, ymin, xmax, ymax} to {x, y, width, height}
      const width = box.xmax - box.xmin;
      const height = box.ymax - box.ymin;
      const x = box.xmin + width / 2; // Center x
      const y = box.ymin + height / 2; // Center y
      
      return {
        width,
        height,
        x,
        y,
        confidence: score,
        class_id: index,
        class: label,
        detection_id: `transformers-${index}-${Date.now()}`,
      };
    });
    
    const result = {
      count_objects: nmsDetections.length, // Count only unique vehicles after NMS
      predictions: {
        image: dimensions,
        predictions,
      },
    };
    
    console.log('=== TRANSFORMERS DETECTION END ===');
    console.log('Final result:', result);
    
    return result;
  } catch (error: any) {
    console.error('Error in Transformers detection:', error);
    throw new Error(error?.message || 'Transformers detection failed');
  }
}

/**
 * Process multiple images for analysis using Transformers
 * @param imageFiles - Array of image files to analyze
 * @returns Promise with array of analysis results
 */
export async function analyzeImagesWithTransformers(
  imageFiles: File[]
): Promise<TransformersAnalysisResult[]> {
  try {
    const results = await Promise.all(
      imageFiles.map(async (file) => {
        try {
          const result = await analyzeImageWithTransformers(file);
          return { file: file.name, success: true, data: result };
        } catch (error: any) {
          const errorMessage = error?.message || 'Unknown error';
          console.error(`Error analyzing image ${file.name}:`, error);
          return { file: file.name, success: false, error: errorMessage };
        }
      })
    );
    
    return results;
  } catch (error: any) {
    console.error('Error analyzing images with Transformers:', error);
    throw new Error(error?.message || 'Batch analysis failed');
  }
}
