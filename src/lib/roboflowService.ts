import { InferenceHTTPClient } from "@roboflow/inference-sdk";

// Define types for our functions
interface AnalysisResult {
  file: string;
  success: boolean;
  data?: unknown;
  error?: string;
}

interface WorkflowResult {
  [key: string]: unknown;
}

// Initialize the Roboflow client using the proper factory method
const client = InferenceHTTPClient.init({
  apiKey: import.meta.env.VITE_ROBOFLOW_API_KEY || "dnx7yXt5SV23UV65kk4C", // Using your provided API key as fallback
  serverUrl: "https://serverless.roboflow.com"
});

/**
 * Convert a File object to a URL that can be accessed by the Roboflow API
 * @param file - The file to convert
 * @returns Promise with a URL string
 */
async function fileToUrl(file: File): Promise<string> {
  // For now, we'll convert the file to base64 and return a data URL
  // In a production environment, you might want to upload the file to a storage service
  // and return the public URL
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = error => reject(error);
  });
}

/**
 * Analyze an image for illegal parking violations
 * @param imageFile - The image file to analyze
 * @returns Promise with analysis results
 */
export async function analyzeImage(imageFile: File): Promise<WorkflowResult> {
  try {
    console.log('=== ROBOFLOW API CALL START ===');
    console.log('Image file:', {
      name: imageFile.name,
      type: imageFile.type,
      size: imageFile.size
    });
    
    // Convert the image file to a URL for sending to Roboflow
    const imageUrl = await fileToUrl(imageFile);
    console.log('Image data URL length:', imageUrl.length);
    console.log('Image data URL prefix:', imageUrl.substring(0, 50) + '...');
    
    const requestPayload = {
      api_key: import.meta.env.VITE_ROBOFLOW_API_KEY || "dnx7yXt5SV23UV65kk4C",
      inputs: {
        "image": {"type": "url", "value": imageUrl}
      }
    };
    
    console.log('Request payload structure:', {
      api_key: requestPayload.api_key.substring(0, 5) + '...',
      inputs: {
        image: {
          type: requestPayload.inputs.image.type,
          value_length: requestPayload.inputs.image.value.length
        }
      }
    });
    
    const endpoint = 'https://serverless.roboflow.com/cpe/workflows/detect-count-and-visualize-3';
    console.log('API Endpoint:', endpoint);
    
    // Call the Roboflow workflow API with the correct format
    const response = await fetch(endpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(requestPayload)
    });

    console.log('Response status:', response.status, response.statusText);
    console.log('Response headers:', Object.fromEntries(response.headers.entries()));

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      console.error('Error response data:', errorData);
      
      // Handle specific error cases
      if (response.status === 401) {
        throw new Error(
          "Unauthorized: Invalid or missing API key. Please check your Roboflow API key in the .env file."
        );
      } else if (response.status === 403) {
        throw new Error(
          "Forbidden: API key does not have permission to access this workflow."
        );
      } else if (response.status === 404) {
        throw new Error(
          "Not Found: The specified workflow does not exist or is not accessible."
        );
      } else if (response.status === 405) {
        throw new Error(
          "Method Not Allowed: The endpoint URL may be incorrect. Please verify the workflow URL format."
        );
      }
      
      throw new Error(
        `HTTP ${response.status}: ${errorData.message || response.statusText}`
      );
    }
    
    const result = await response.json();
    console.log('=== FULL API RESPONSE ===');
    console.log(JSON.stringify(result, null, 2));
    console.log('Type:', Array.isArray(result) ? 'Array' : typeof result);
    
    // Roboflow workflow returns an array with results
    // Unwrap if it's an array with single element
    let finalResult = result;
    if (Array.isArray(result) && result.length > 0) {
      console.log('API returned array, unwrapping first element');
      finalResult = result[0];
      console.log('Unwrapped result:', JSON.stringify(finalResult, null, 2));
    }
    
    console.log('=== API CALL END ===');
    
    return finalResult as WorkflowResult;
  } catch (error: any) {
    console.error("Error analyzing image:", error);
    // Provide more detailed error information
    let errorMessage = 'Unknown error';
    if (error?.message) {
      errorMessage = error.message;
    } else if (typeof error === 'string') {
      errorMessage = error;
    }
    throw new Error(errorMessage);
  }
}

/**
 * Process multiple images for analysis
 * @param imageFiles - Array of image files to analyze
 * @returns Promise with array of analysis results
 */
export async function analyzeImages(imageFiles: File[]): Promise<AnalysisResult[]> {
  try {
    const results = await Promise.all(
      imageFiles.map(async (file) => {
        try {
          const result = await analyzeImage(file);
          return { file: file.name, success: true, data: result };
        } catch (error: any) {
          let errorMessage = 'Unknown error';
          if (error?.message) {
            errorMessage = error.message;
          } else if (typeof error === 'string') {
            errorMessage = error;
          }
          console.error(`Error analyzing image ${file.name}:`, error);
          return { file: file.name, success: false, error: errorMessage };
        }
      })
    );
    
    return results;
  } catch (error: any) {
    console.error("Error analyzing images:", error);
    let errorMessage = 'Unknown error';
    if (error?.message) {
      errorMessage = error.message;
    } else if (typeof error === 'string') {
      errorMessage = error;
    }
    throw new Error(errorMessage);
  }
}