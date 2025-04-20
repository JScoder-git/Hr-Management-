# Deploying to Vercel

This guide will help you deploy your HR Management System to Vercel.

## Prerequisites

1. A Vercel account (sign up at https://vercel.com)
2. Git repository with your code (optional but recommended)

## Backend Deployment

1. Go to the [Vercel Dashboard](https://vercel.com/dashboard)
2. Click on "Add New..." and select "Project"
3. Import your Git repository or upload your backend folder
4. Configure the project with the following settings:
   - Project name: psquare-hrms-backend
   - Framework preset: Node.js
   - Root directory: backend
   - Build command: npm install
   - Output directory: .
   - Install command: npm install
   - Development command: npm run dev

5. In the Environment Variables section, add the following variables:
   - NODE_ENV: production
   - PORT: 5000
   - MONGO_URI: mongodb+srv://serrkasahil:21bcs2757@psquare.pkppvwi.mongodb.net/?retryWrites=true&w=majority&appName=Psquare
   - JWT_SECRET: 70ed976c0f2cbbe50a7e26f8f9b0182057a9a06021e1ab32cd5639ab1a4449fb
   - JWT_EXPIRE: 30d

6. Click "Deploy" and wait for the deployment to complete
7. Note the deployment URL (e.g., https://psquare-hrms-backend.vercel.app)

## Frontend Deployment

1. After deploying the backend, go back to the Vercel dashboard
2. Click on "Add New..." and select "Project"
3. Import your Git repository or upload your frontend folder
4. Configure the project with the following settings:
   - Project name: psquare-hrms-frontend
   - Framework preset: Create React App
   - Root directory: frontend
   - Build command: npm run build
   - Output directory: build
   - Install command: npm install
   - Development command: npm start

5. In the Environment Variables section, add:
   - REACT_APP_API_URL: [Your Backend URL] (e.g., https://psquare-hrms-backend.vercel.app)

6. Click "Deploy" and wait for the deployment to complete

## Verifying Your Deployment

1. Once both deployments are complete, visit your frontend URL
2. Try logging in and using the application
3. Check the Network tab in your browser's developer tools to ensure API calls are going to your backend URL

## Troubleshooting

If you encounter any issues:

1. Check the Vercel deployment logs for errors
2. Ensure all environment variables are correctly set
3. Verify that your backend URL is correctly configured in the frontend
4. Check CORS settings in your backend to ensure it accepts requests from your frontend domain

## Updating Your Deployment

To update your deployment:

1. Make changes to your code
2. Push to your Git repository (if using Git integration)
3. Vercel will automatically redeploy your application
4. Alternatively, you can manually redeploy from the Vercel dashboard

## Additional Resources

- [Vercel Documentation](https://vercel.com/docs)
- [Create React App Deployment](https://create-react-app.dev/docs/deployment/)
- [Node.js Deployment on Vercel](https://vercel.com/guides/deploying-nodejs-with-vercel)
