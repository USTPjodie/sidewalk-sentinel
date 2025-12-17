// Simple test script to check Roboflow API connectivity
import { InferenceHTTPClient } from "@roboflow/inference-sdk";

console.log("Testing Roboflow API connectivity...");

// @ts-expect-error: Constructor is private but accessible at runtime
const client = new InferenceHTTPClient();
client.apiKey = "dnx7yXt5SV23UV65kk4C";
client.serverUrl = "https://serverless.roboflow.com";

console.log("Client initialized with API key:", client.apiKey ? "YES" : "NO");
console.log("Server URL:", client.serverUrl);

// Test the connection
client.listWorkflows("cpe")
  .then(workflows => {
    console.log("Successfully connected to Roboflow!");
    console.log("Available workflows:", workflows);
  })
  .catch(error => {
    console.error("Failed to connect to Roboflow:");
    console.error("Error:", error.message);
    if (error.response) {
      console.error("Response status:", error.response.status);
      console.error("Response data:", error.response.data);
    }
  });