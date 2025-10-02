# 🚀 SAHAAYAK - Collaborator Setup Guide

## 📋 Prerequisites

### System Requirements
- **Node.js** (v16 or higher) - [Download here](https://nodejs.org/)
- **npm** (comes with Node.js) or **yarn**
- **Git** - [Download here](https://git-scm.com/)
- **Code Editor** (VS Code recommended)

### Verify Installation
```bash
# Check Node.js version
node --version

# Check npm version
npm --version

# Check Git version
git --version
```

## 🛠️ Quick Setup (5 Minutes)

### 1. Clone the Repository
```bash
# Clone the project
git clone https://github.com/sarthakPatil96K/sahaayak-prtal.git
cd sahaayak-portal
```

### 2. Install Dependencies
```bash
# Install all dependencies (both frontend and backend)
npm run install:all

# Or install manually:
# Backend dependencies
cd backend
npm install

# Frontend dependencies  
cd ../frontend
npm install
```

### 3. Environment Setup

**Backend Environment** (`backend/.env`):
```env
PORT=8080
NODE_ENV=development
```

**Frontend Environment** (`frontend/.env`):
```env
REACT_APP_API_URL=http://localhost:3000
```

### 4. Start Development Servers

**Option A: Start Both Together** (Recommended)
```bash
# From project root - starts both frontend and backend
npm run dev
```

**Option B: Start Separately**
```bash
# Terminal 1 - Backend
cd backend
npm run dev

# Terminal 2 - Frontend
cd frontend
npm start
```

### 5. Verify Setup
- **Backend**: Open http://localhost:8080/api
- **Frontend**: Open http://localhost:3000
- You should see the SAHAAYAK homepage!

## 🎯 Development Workflow

### Branch Strategy
```bash
# Create feature branch
git checkout -b feature/your-feature-name

# Or bugfix branch
git checkout -b fix/issue-description
```

### Making Changes
1. **Always start from latest main**
   ```bash
   git checkout main
   git pull origin main
   git checkout -b feature/your-feature
   ```

2. **Make your changes**
3. **Test thoroughly**
4. **Commit with clear messages**
   ```bash
   git add .
   git commit -m "feat: add grievance redressal module
   
   - Implement multi-step grievance form
   - Add backend API endpoints
   - Create officer view for grievances
   - Add email notifications"
   ```

5. **Push and create PR**
   ```bash
   git push origin feature/your-feature
   # Then create Pull Request on GitHub
   ```

## 📁 Project Structure Explained

```
sahaayak-portal/
├── 📂 frontend/                 # React Application
│   ├── 📂 public/              # Static assets
│   ├── 📂 src/
│   │   ├── 📂 components/      # Reusable components
│   │   │   ├── 📂 Layout/     # Navbar, Footer
│   │   │   ├── 📂 Forms/      # MultiStepForm, etc.
│   │   │   └── ApplicationDetailsModal.js
│   │   ├── 📂 pages/          # Main pages
│   │   │   ├── Home.js
│   │   │   ├── VictimRegistration.js
│   │   │   ├── OfficerDashboard.js
│   │   │   ├── InterCasteMarriage.js
│   │   │   ├── TrackApplication.js
│   │   │   └── HelpSupport.js
│   │   ├── 📂 services/       # API calls
│   │   │   └── api.js
│   │   ├── App.js             # Main app component
│   │   └── index.js           # Entry point
│   └── package.json
├── 📂 backend/                 # Express API
│   ├── 📂 src/
│   │   ├── 📂 routes/         # API routes
│   │   │   ├── applications.js
│   │   │   └── intercasteMarriage.js
│   │   ├── server.js          # Server setup
│   │   └── seedData.js        # Demo data
│   └── package.json
└── README.md
```

## 🔧 Common Development Tasks

### Adding a New Page
1. Create component in `frontend/src/pages/`
2. Add route in `frontend/src/App.js`
3. Update navigation in `frontend/src/components/Layout/Navbar.js`

### Adding a New API Endpoint
1. Create/update route in `backend/src/routes/`
2. Test with Thunder Client or Postman
3. Update frontend service in `frontend/src/services/api.js`

### Styling Components
- Use **Tailwind CSS** classes
- Follow existing design patterns
- Ensure **responsive design**

## 🐛 Debugging Guide

### Common Issues & Solutions

**Backend not starting?**
```bash
# Check if port 5000 is free
lsof -i :5000

# Kill process if needed
kill -9 $(lsof -t -i:5000)
```

**Frontend build errors?**
```bash
# Clear cache and reinstall
cd frontend
rm -rf node_modules package-lock.json
npm install
```

**API connection issues?**
- Check if backend is running on port 5000
- Verify `REACT_APP_API_URL` in frontend/.env
- Check browser console for CORS errors

### Debugging Tools
- **Browser DevTools** (F12) - Console, Network tabs
- **VS Code Debugger** - Set breakpoints
- **Thunder Client** - API testing
- **React DevTools** - Component inspection

## 🧪 Testing Your Changes

### Manual Testing Checklist
- [ ] Form submissions work
- [ ] API calls succeed
- [ ] Responsive design on mobile
- [ ] Officer dashboard functions
- [ ] Application tracking works
- [ ] No console errors

### Test Data
**Victim Application:**
- Name: Test User
- Aadhaar: 123456789012
- Incident Type: Discrimination

**Marriage Application:**
- Husband: Raj Kumar
- Wife: Priya Singh  
- Caste: SC + General

## 📞 Getting Help

### When You're Stuck
1. **Check existing code** - Similar features might already exist
2. **Read documentation** - Check README and code comments
3. **Ask team members** - Discord/Slack/Teams
4. **Create issue** - If it's a bug or feature request

### Communication Channels
- **GitHub Issues** - Bug reports and feature requests
- **Pull Requests** - Code reviews and discussions
- **Team Chat** - Quick questions and coordination

## 🚀 Deployment Ready Checklist

Before submitting PR:
- [ ] Code follows project structure
- [ ] No console errors
- [ ] Responsive design tested
- [ ] API endpoints working
- [ ] No sensitive data committed
- [ ] README updated if needed
- [ ] Tested on multiple browsers

## 💡 Pro Tips

### VS Code Extensions (Recommended)
- **ES7+ React/Redux/React-Native snippets**
- **Auto Rename Tag**
- **Tailwind CSS IntelliSense**
- **Thunder Client** (API testing)
- **GitLens**

### Development Shortcuts
```bash
# Quick restart backend
cd backend && npm run dev

# Quick restart frontend  
cd frontend && npm start

# Check application status
curl http://localhost:8080/api/health
```

### Git Best Practices
```bash
# Before starting work
git pull origin main

# Meaningful commit messages
git commit -m "feat: add user authentication
- Implement JWT token system
- Add login/logout functionality
- Secure API endpoints"

# Keep commits focused and small
```

---

**🎉 You're all set! Happy coding!**

Need immediate help? Contact the team lead or create a discussion in GitHub!