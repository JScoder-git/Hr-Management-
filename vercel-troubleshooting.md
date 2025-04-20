# Vercel Deployment Troubleshooting Guide

This guide will help you troubleshoot issues with deploying your Node.js application to Vercel.

## Common Issues and Solutions

### 1. 500 Internal Server Error (FUNCTION_INVOCATION_FAILED)

This error occurs when your serverless function crashes during execution. Common causes include:

#### a. Missing Dependencies

Make sure all required dependencies are listed in your package.json file.

**Solution:**
- Check your package.json file and ensure all dependencies are listed
- Try deploying with a minimal set of dependencies first

#### b. Environment Variables

Ensure all required environment variables are properly set in Vercel.

**Solution:**
- Go to Vercel dashboard > Project Settings > Environment Variables
- Add all required environment variables
- Make sure they're set for the Production environment

#### c. File System Operations

Vercel's serverless functions don't support persistent file system operations.

**Solution:**
- Remove any code that tries to write to the file system
- Use memory storage instead of disk storage for file uploads
- Consider using a cloud storage service like AWS S3 for file storage

#### d. Database Connection Issues

Problems connecting to your database can cause the function to crash.

**Solution:**
- Ensure your database connection string is correct
- Make sure your database allows connections from Vercel's IP addresses
- Add error handling around database connection code

### 2. Deployment Steps for Minimal Server

To isolate issues, deploy a minimal server first:

1. Create a minimal server.js file with basic functionality
2. Update vercel.json to use this minimal server
3. Deploy to Vercel
4. Test the minimal server
5. Gradually add back functionality to identify the issue

### 3. Verifying Deployment

To verify your deployment:

1. Visit the root URL of your deployment
2. Check the health endpoint response
3. Look at the Vercel deployment logs for any errors
4. Test API endpoints with a tool like Postman

### 4. Next Steps After Successful Minimal Deployment

Once your minimal server is deployed successfully:

1. Gradually add back routes and functionality
2. Test after each addition
3. When you find the problematic code, fix it
4. Deploy the full application

## Useful Vercel CLI Commands

```bash
# Install Vercel CLI
npm install -g vercel

# Login to Vercel
vercel login

# Deploy to development
vercel

# Deploy to production
vercel --prod

# Pull environment variables
vercel env pull

# View logs
vercel logs <deployment-url>
```

## Additional Resources

- [Vercel Documentation](https://vercel.com/docs)
- [Vercel Serverless Functions](https://vercel.com/docs/concepts/functions/serverless-functions)
- [Troubleshooting Vercel Deployments](https://vercel.com/guides/troubleshooting-vercel-deployments)
