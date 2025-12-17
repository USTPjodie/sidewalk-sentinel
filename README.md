# Sidewalk Sentinel - Illegal Parking Detection System

## Project Info

**URL**: https://lovable.dev/projects/REPLACE_WITH_PROJECT_ID

## How can I edit this code?

There are several ways of editing your application.

**Use Lovable**

Simply visit the [Lovable Project](https://lovable.dev/projects/REPLACE_WITH_PROJECT_ID) and start prompting.

Changes made via Lovable will be committed automatically to this repo.

**Use your preferred IDE**

If you want to work locally using your own IDE, you can clone this repo and push changes. Pushed changes will also be reflected in Lovable.

The only requirement is having Node.js & npm installed - [install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating)

Follow these steps:

```sh
# Step 1: Clone the repository using the project's Git URL.
git clone <YOUR_GIT_URL>

# Step 2: Navigate to the project directory.
cd <YOUR_PROJECT_NAME>

# Step 3: Install the necessary dependencies.
npm i

# Step 4: Start the development server with auto-reloading and an instant preview.
npm run dev
```

**Edit a file directly in GitHub**

- Navigate to the desired file(s).
- Click the "Edit" button (pencil icon) at the top right of the file view.
- Make your changes and commit the changes.

**Use GitHub Codespaces**

- Navigate to the main page of your repository.
- Click on the "Code" button (green button) near the top right.
- Select the "Codespaces" tab.
- Click on "New codespace" to launch a new Codespace environment.
- Edit files directly within the Codespace and commit and push your changes once you're done.

## Technologies Used

This project is built with:

- Vite
- TypeScript
- React
- shadcn-ui
- Tailwind CSS
- Roboflow Inference API for object detection

## Roboflow Integration

This project uses Roboflow for detecting illegal parking violations in images. The integration includes:

1. **API Key Configuration**: The Roboflow API key is stored in the `.env` file as `VITE_ROBOFLOW_API_KEY`
2. **Inference Service**: Located in `src/lib/roboflowService.ts`, this service handles communication with the Roboflow API
3. **Image Analysis**: The UploadPanel component uses the service to analyze uploaded images

### Setting up Roboflow

1. Create a `.env` file in the root directory with your Roboflow API key:
   ```
   VITE_ROBOFLOW_API_KEY=your_api_key_here
   ```

2. The default API key provided in this project is for demonstration purposes only.

### API Usage

The application uses the Roboflow Workflows API to analyze images:

```javascript
const response = await fetch('https://serverless.roboflow.com/cpe/workflows/detect-count-and-visualize-3', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    api_key: 'YOUR_API_KEY',
    inputs: {
      "image": {"type": "url", "value": "IMAGE_URL"}
    }
  })
});
```

## How to Deploy

Simply open [Lovable](https://lovable.dev/projects/REPLACE_WITH_PROJECT_ID) and click on Share -> Publish.

## Custom Domain

Yes, you can connect a custom domain to your Lovable project!

To connect a domain, navigate to Project > Settings > Domains and click Connect Domain.

Read more here: [Setting up a custom domain](https://docs.lovable.dev/features/custom-domain#custom-domain)