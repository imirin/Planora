# Planora Deployment Guide

## Backend Deployment (Render)

### 1. Prepare Backend
- Code is ready in `/server` folder
- Environment variables configured
- CORS properly set up
- Health check endpoint at `/health`

### 2. Create MongoDB Atlas Database
1. Go to [MongoDB Atlas](https://www.mongodb.com/cloud/atlas)
2. Create a new cluster (free tier)
3. Create a database user
4. Get connection string
5. Whitelist all IPs (0.0.0.0/0) for Render

### 3. Deploy to Render
1. Go to [Render](https://render.com)
2. Create New Web Service
3. Connect your GitHub repository
4. Configure:
   - **Root Directory**: `server`
   - **Build Command**: `npm install`
   - **Start Command**: `npm start`
   - **Environment**: Node
5. Add Environment Variables:
   - `MONGODB_URI`: Your MongoDB connection string
   - `JWT_SECRET`: A secure random string (generate with `openssl rand -base64 32`)
   - `CLIENT_URL`: Your Vercel frontend URL (e.g., `https://planora.vercel.app`)
6. Deploy

### 4. Get Backend URL
After deployment, note your Render URL (e.g., `https://planora-api.onrender.com`)

---

## Frontend Deployment (Vercel)

### 1. Prepare Frontend
- Code is ready in `/client` folder
- Vercel config created
- Uses `VITE_API_URL` environment variable

### 2. Deploy to Vercel
1. Go to [Vercel](https://vercel.com)
2. Import your GitHub repository
3. Configure:
   - **Framework Preset**: Vite
   - **Root Directory**: `client`
   - **Build Command**: `npm run build`
   - **Output Directory**: `dist`
4. Add Environment Variable:
   - `VITE_API_URL`: Your Render backend URL + `/api` (e.g., `https://planora-api.onrender.com/api`)
5. Deploy

---

## Environment Variables Summary

### Backend (Render)
```
PORT=5000
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/planora
JWT_SECRET=your_secure_jwt_secret
CLIENT_URL=https://your-frontend.vercel.app
```

### Frontend (Vercel)
```
VITE_API_URL=https://your-backend.onrender.com/api
```

---

## Post-Deployment Testing

### 1. Authentication Flow
- Register a new account
- Login with credentials
- Verify token persistence

### 2. Core Features
- Create a subject
- Add topics to subject
- Mark topics complete/incomplete
- Delete subjects and topics

### 3. Timer
- Start timer
- Complete a session
- Verify session saved to database
- Check dashboard updates

### 4. Dashboard
- Verify stats load correctly
- Check weekly chart displays
- Verify streak calculation
- Check heatmap loads

### 5. Mobile
- Test on mobile device
- Verify responsive design
- Test hamburger menu

---

## Troubleshooting

### CORS Errors
- Verify `CLIENT_URL` in backend matches your Vercel URL exactly
- Check for trailing slashes

### API Not Connecting
- Verify `VITE_API_URL` includes `/api` at the end
- Test API health endpoint: `https://your-backend.onrender.com/health`

### MongoDB Connection
- Check IP whitelist in MongoDB Atlas
- Verify connection string format
- Ensure password is URL-encoded if contains special characters

### Build Failures
- Check Node.js version (should be 18+)
- Verify all dependencies in package.json
- Check for syntax errors
