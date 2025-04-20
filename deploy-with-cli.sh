#!/bin/bash

# Install Vercel CLI if not already installed
echo "Installing Vercel CLI..."
npm install -g vercel

# Deploy Backend
echo "Deploying Backend..."
cd backend

# Login to Vercel (if not already logged in)
vercel login

# Deploy to Vercel
vercel --prod \
  -e NODE_ENV=production \
  -e PORT=5000 \
  -e MONGO_URI="mongodb+srv://serrkasahil:21bcs2757@psquare.pkppvwi.mongodb.net/?retryWrites=true&w=majority&appName=Psquare" \
  -e JWT_SECRET="70ed976c0f2cbbe50a7e26f8f9b0182057a9a06021e1ab32cd5639ab1a4449fb" \
  -e JWT_EXPIRE="30d"

# Get the deployment URL
BACKEND_URL=$(vercel ls --prod -j | grep -o '"url":"[^"]*"' | head -1 | sed 's/"url":"\(.*\)"/\1/')
echo "Backend deployed to: $BACKEND_URL"

# Deploy Frontend
echo "Deploying Frontend..."
cd ../frontend

# Deploy to Vercel
vercel --prod \
  -e REACT_APP_API_URL="$BACKEND_URL"

echo "Deployment complete!"
echo "Frontend URL: $(vercel ls --prod -j | grep -o '"url":"[^"]*"' | head -1 | sed 's/"url":"\(.*\)"/\1/')"
echo "Backend URL: $BACKEND_URL"
