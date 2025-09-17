# 🚀 Deployment Guide

## Cost Management
**⚠️ IMPORTANT: Vercel deployments cost money! Only deploy when necessary.**

## Development Workflow

### 1. Local Development
```bash
# Start local development
npm run dev

# Make your changes...
# Test locally at http://localhost:3000
```

### 2. Update Development (No Cost)
```bash
# Commit and push changes without deploying
./dev-update.sh "Your commit message here"

# Or with default message
./dev-update.sh
```

### 3. Deploy to Production (Costs Money!)
```bash
# Only run this when you specifically want to deploy
./deploy.sh
```

## Current Status
- ✅ **Document Upload Area**: Added to course management
- ✅ **RAG Integration**: Ready for company documents
- ✅ **Tabbed Interface**: Courses and Documents tabs
- ✅ **Drag & Drop**: File upload with progress tracking

## Live URLs
- **Production**: https://operator-skills-hub-v4.vercel.app
- **Development**: Local only (no auto-deploy)

## Features Added
1. **Document Upload Area** in Course Management
   - Drag & drop file upload
   - Support for PDF, DOC, DOCX, TXT, images
   - RAG processing integration
   - Progress tracking and status indicators

2. **Tabbed Interface**
   - Courses tab (existing functionality)
   - Company Documents tab (new upload area)

3. **RAG Integration**
   - Documents processed for AI content generation
   - Vector embedding simulation
   - Context-aware content creation

## Next Steps
- Test document upload functionality
- Verify RAG integration works
- Add real document processing (when needed)
- Deploy only when ready for production

## Cost-Saving Tips
- Use `./dev-update.sh` for regular updates
- Only use `./deploy.sh` for production releases
- Test thoroughly locally before deploying
- Consider using Vercel's free tier limits
