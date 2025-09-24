# Deployment Guide - Innovation Hub

This guide covers various deployment options for the Innovation Hub frontend application.

## 🚀 Quick Deploy Options

### Vercel (Recommended)

1. **Install Vercel CLI**
   ```bash
   npm i -g vercel
   ```

2. **Deploy**
   ```bash
   vercel
   ```

3. **Environment Variables**
   Set in Vercel dashboard:
   ```
   REACT_APP_API_URL=https://your-api-domain.com
   REACT_APP_ENVIRONMENT=production
   ```

### Netlify

1. **Build the project**
   ```bash
   npm run build
   ```

2. **Deploy via Netlify CLI**
   ```bash
   npm install -g netlify-cli
   netlify deploy --prod --dir=build
   ```

3. **Or drag & drop**
   - Go to [Netlify](https://netlify.com)
   - Drag the `build` folder to deploy

### GitHub Pages

1. **Install gh-pages**
   ```bash
   npm install --save-dev gh-pages
   ```

2. **Add to package.json**
   ```json
   {
     "homepage": "https://yourusername.github.io/incubation",
     "scripts": {
       "predeploy": "npm run build",
       "deploy": "gh-pages -d build"
     }
   }
   ```

3. **Deploy**
   ```bash
   npm run deploy
   ```

## 🐳 Docker Deployment

### Dockerfile
```dockerfile
# Build stage
FROM node:18-alpine as build
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production
COPY . .
RUN npm run build

# Production stage
FROM nginx:alpine
COPY --from=build /app/build /usr/share/nginx/html
COPY nginx.conf /etc/nginx/nginx.conf
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
```

### nginx.conf
```nginx
events {
    worker_connections 1024;
}

http {
    include /etc/nginx/mime.types;
    default_type application/octet-stream;

    server {
        listen 80;
        server_name localhost;
        root /usr/share/nginx/html;
        index index.html;

        location / {
            try_files $uri $uri/ /index.html;
        }

        location /static/ {
            expires 1y;
            add_header Cache-Control "public, immutable";
        }
    }
}
```

### Build and Run
```bash
docker build -t innovation-hub .
docker run -p 80:80 innovation-hub
```

## ☁️ AWS Deployment

### S3 + CloudFront

1. **Build the project**
   ```bash
   npm run build
   ```

2. **Upload to S3**
   ```bash
   aws s3 sync build/ s3://your-bucket-name --delete
   ```

3. **Configure CloudFront**
   - Create distribution
   - Set origin to S3 bucket
   - Configure error pages for SPA routing

### AWS Amplify

1. **Install Amplify CLI**
   ```bash
   npm install -g @aws-amplify/cli
   ```

2. **Initialize**
   ```bash
   amplify init
   ```

3. **Add hosting**
   ```bash
   amplify add hosting
   ```

4. **Deploy**
   ```bash
   amplify publish
   ```

## 🔧 Environment Configuration

### Environment Variables

Create `.env.production` file:
```env
REACT_APP_API_URL=https://api.yourdomain.com
REACT_APP_ENVIRONMENT=production
REACT_APP_SENTRY_DSN=your-sentry-dsn
REACT_APP_ANALYTICS_ID=your-analytics-id
```

### Build Optimization

1. **Analyze Bundle Size**
   ```bash
   npm install --save-dev webpack-bundle-analyzer
   npm run build
   npx webpack-bundle-analyzer build/static/js/*.js
   ```

2. **Optimize Images**
   - Use WebP format when possible
   - Implement lazy loading
   - Compress images before deployment

3. **Enable Gzip Compression**
   Configure your server to enable gzip compression for static assets.

## 🔒 Security Considerations

### Content Security Policy

Add to your HTML head:
```html
<meta http-equiv="Content-Security-Policy" content="
  default-src 'self';
  script-src 'self' 'unsafe-inline';
  style-src 'self' 'unsafe-inline' fonts.googleapis.com;
  font-src 'self' fonts.gstatic.com;
  img-src 'self' data: https:;
  connect-src 'self' https://api.yourdomain.com;
">
```

### HTTPS Configuration

Ensure your deployment platform supports HTTPS:
- Vercel: Automatic HTTPS
- Netlify: Automatic HTTPS
- AWS CloudFront: Configure SSL certificate
- Custom server: Use Let's Encrypt

## 📊 Monitoring & Analytics

### Error Tracking

1. **Install Sentry**
   ```bash
   npm install @sentry/react
   ```

2. **Configure in src/index.js**
   ```javascript
   import * as Sentry from "@sentry/react";
   
   Sentry.init({
     dsn: process.env.REACT_APP_SENTRY_DSN,
     environment: process.env.REACT_APP_ENVIRONMENT,
   });
   ```

### Performance Monitoring

1. **Web Vitals**
   ```javascript
   import { getCLS, getFID, getFCP, getLCP, getTTFB } from 'web-vitals';
   
   getCLS(console.log);
   getFID(console.log);
   getFCP(console.log);
   getLCP(console.log);
   getTTFB(console.log);
   ```

2. **Google Analytics**
   ```bash
   npm install gtag
   ```

## 🔄 CI/CD Pipeline

### GitHub Actions

Create `.github/workflows/deploy.yml`:
```yaml
name: Deploy to Production

on:
  push:
    branches: [ main ]

jobs:
  deploy:
    runs-on: ubuntu-latest
    
    steps:
    - uses: actions/checkout@v2
    
    - name: Setup Node.js
      uses: actions/setup-node@v2
      with:
        node-version: '18'
        cache: 'npm'
    
    - name: Install dependencies
      run: npm ci
    
    - name: Run tests
      run: npm test -- --coverage --watchAll=false
    
    - name: Build
      run: npm run build
      env:
        REACT_APP_API_URL: ${{ secrets.REACT_APP_API_URL }}
    
    - name: Deploy to Vercel
      uses: amondnet/vercel-action@v20
      with:
        vercel-token: ${{ secrets.VERCEL_TOKEN }}
        vercel-org-id: ${{ secrets.ORG_ID }}
        vercel-project-id: ${{ secrets.PROJECT_ID }}
        vercel-args: '--prod'
```

## 🚨 Troubleshooting

### Common Issues

1. **Routing Issues on Static Hosts**
   - Configure redirects for SPA routing
   - Ensure all routes redirect to index.html

2. **Environment Variables Not Loading**
   - Ensure variables start with `REACT_APP_`
   - Restart development server after adding variables

3. **Build Failures**
   - Check for TypeScript errors
   - Ensure all dependencies are installed
   - Clear node_modules and reinstall

4. **Performance Issues**
   - Enable code splitting
   - Implement lazy loading
   - Optimize images and assets

### Health Checks

Create a health check endpoint:
```javascript
// In your main component
useEffect(() => {
  // Report app health to monitoring service
  fetch('/api/health', { method: 'POST' });
}, []);
```

## 📝 Post-Deployment Checklist

- [ ] Verify all routes work correctly
- [ ] Test authentication flow
- [ ] Check responsive design on various devices
- [ ] Validate form submissions
- [ ] Test dark/light mode toggle
- [ ] Verify API connections
- [ ] Check error handling
- [ ] Test notification system
- [ ] Validate file uploads
- [ ] Check performance metrics
- [ ] Verify security headers
- [ ] Test accessibility features

---

For additional support, refer to the main README.md or create an issue in the repository.
