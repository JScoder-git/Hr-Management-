# Install Vercel CLI if not already installed
Write-Host "Installing Vercel CLI..."
npm install -g vercel

# Deploy Backend
Write-Host "Deploying Backend..."
Set-Location -Path .\backend

# Login to Vercel (if not already logged in)
vercel login

# Deploy to Vercel
vercel --prod `
  -e NODE_ENV=production `
  -e PORT=5000 `
  -e MONGO_URI="mongodb+srv://serrkasahil:21bcs2757@psquare.pkppvwi.mongodb.net/?retryWrites=true&w=majority&appName=Psquare" `
  -e JWT_SECRET="70ed976c0f2cbbe50a7e26f8f9b0182057a9a06021e1ab32cd5639ab1a4449fb" `
  -e JWT_EXPIRE="30d"

# Get the deployment URL (this is simplified and may need adjustment)
$backendOutput = vercel ls --prod -j
$backendUrl = "https://psquare-hrms-backend.vercel.app" # Default fallback
if ($backendOutput -match '"url":"([^"]*)"') {
    $backendUrl = $matches[1]
}
Write-Host "Backend deployed to: $backendUrl"

# Deploy Frontend
Write-Host "Deploying Frontend..."
Set-Location -Path ..\frontend

# Deploy to Vercel
vercel --prod `
  -e REACT_APP_API_URL="$backendUrl"

# Get the frontend URL
$frontendOutput = vercel ls --prod -j
$frontendUrl = "https://psquare-hrms-frontend.vercel.app" # Default fallback
if ($frontendOutput -match '"url":"([^"]*)"') {
    $frontendUrl = $matches[1]
}

Write-Host "Deployment complete!"
Write-Host "Frontend URL: $frontendUrl"
Write-Host "Backend URL: $backendUrl"
