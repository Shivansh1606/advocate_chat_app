text
# 🚀 Legal Chat System - PythonAnywhere Deployment Guide

## 📋 Prerequisites
- PythonAnywhere account (Free tier works)
- Basic understanding of file uploads

## 🗂️ File Structure (Upload These)
/home/yourusername/mysite/
├── app.py
├── database.py
├── requirements.txt
├── templates/
│ ├── base.html
│ ├── index.html
│ ├── chat.html
│ ├── video_call.html
│ ├── meeting.html
│ └── admin_dashboard.html
└── static/
├── css/
│ └── style.css
└── js/
├── main.js
└── webrtc.js

text

## 🔧 Step-by-Step Deployment

### Step 1: Upload Files
1. **Login** to PythonAnywhere Dashboard
2. Go to **Files** tab
3. Navigate to `/home/yourusername/mysite/`
4. **Upload** all project files maintaining folder structure
5. **Create** folders: `templates/` and `static/css/`, `static/js/`

### Step 2: Install Dependencies
1. Open **Bash console** from Dashboard
2. Run commands:
cd /home/yourusername/mysite
pip3.10 install --user flask

text

### Step 3: Create Web App
1. Go to **Web** tab in Dashboard
2. Click **"Create a new web app"**
3. Choose **Python 3.10**
4. Select **Flask** framework
5. Set path: `/home/yourusername/mysite/`

### Step 4: Configure WSGI
1. In **Web** tab, click on **WSGI configuration file** link
2. **Replace** entire content with:

import sys
import os

project_home = '/home/yourusername/mysite' # ← Change 'yourusername'
if project_home not in sys.path:
sys.path.insert(0, project_home)

os.chdir(project_home)

from app import app as application

if name == "main":
application.run()

text

### Step 5: Static Files Configuration
1. In **Web** tab, scroll to **Static files** section
2. **Add** new static file mapping:
   - **URL:** `/static/`
   - **Directory:** `/home/yourusername/mysite/static/`

### Step 6: Reload Web App
1. In **Web** tab, click **"Reload yourusername.pythonanywhere.com"**
2. Wait for green checkmark
3. Click **URL** to visit your site

## 🧪 Testing Your Deployment

### Test 1: Landing Page
- Visit: `https://yourusername.pythonanywhere.com`
- ✅ Should load landing page with advocates

### Test 2: Chat System  
- Enter your name
- Click on any advocate
- ✅ Should open chat interface

### Test 3: Video Call
- From chat page, click "Video Call" 
- Allow camera/microphone
- ✅ Should show video interface

### Test 4: Meeting Booking
- From chat page, click "Meeting"
- Fill form and submit
- ✅ Should show confirmation

### Test 5: Admin Dashboard
- Visit: `https://yourusername.pythonanywhere.com/admin`
- ✅ Should show meetings and clients

## 🔍 Database Verification

### Check Database Creation
1. Open **Files** tab
2. Navigate to `/home/yourusename/mysite/`
3. ✅ Should see `chat.db` file (created automatically)

### Test Database Operations
1. **Register** a client from landing page
2. **Book** a meeting
3. **Send** chat messages
4. **Check** admin dashboard for data

## 🛠️ Troubleshooting

### Problem: 500 Internal Server Error
**Solution:**
1. Check **Error logs** in Web tab
2. Verify all files uploaded correctly
3. Check WSGI configuration username
4. Ensure Flask is installed: `pip3.10 install --user flask`

### Problem: Static Files Not Loading
**Solution:**
1. Verify **Static files** mapping in Web tab
2. Check folder structure: `/static/css/style.css`
3. **Reload** web app

### Problem: Database Not Working
**Solution:**
1. Check file permissions in Files tab
2. Verify `/home/yourusername/mysite/chat.db` exists
3. Check console logs for database errors

### Problem: Video Call Not Working
**Solution:**
1. Ensure **HTTPS** (PythonAnywhere provides this)
2. Allow camera/microphone in browser
3. Test on different browsers
4. Check browser console for errors

## 🔐 Security Notes

### For Production Use:
1. **Change** secret key in `app.py`
2. **Set** `DEBUG = False`
3. **Add** input validation
4. **Implement** user authentication
5. **Add** rate limiting

### Environment Variables:
In app.py, replace:
app.secret_key = 'advocate-chat-secret-2025'

With:
app.secret_key = os.environ.get('SECRET_KEY', 'fallback-key')

text

## 📊 Performance Tips

### Database Optimization:
- SQLite handles 100+ concurrent users
- Database auto-creates indexes
- Regular cleanup of old messages

### File Upload Limits:
- PythonAnywhere: 100MB per file
- Project size: ~2MB total
- Plenty of space for expansion

## 🎯 URLs After Deployment

| Page | URL |
|------|-----|
| **Home** | `https://yourusername.pythonanywhere.com` |
| **Chat** | `https://yourusername.pythonanywhere.com/chat?advocate=adv1` |
| **Video Call** | `https://yourusername.pythonanywhere.com/video-call/adv1` |
| **Meeting** | `https://yourusername.pythonanywhere.com/meeting?advocate=adv1` |
| **Admin** | `https://yourusername.pythonanywhere.com/admin` |
| **Health Check** | `https://yourusername.pythonanywhere.com/health` |

## ✅ Success Checklist

- [ ] All files uploaded to correct folders
- [ ] Flask installed via pip3.10
- [ ] WSGI file configured with correct username  
- [ ] Static files mapping added
- [ ] Web app reloaded successfully
- [ ] Landing page loads
- [ ] Chat system works
- [ ] Video call interface opens
- [ ] Meeting booking works
- [ ] Admin dashboard accessible
- [ ] Database creating entries

## 🎉 You're Live!

Your legal chat system is now deployed and accessible worldwide at:
**`https://yourusername.pythonanywhere.com`**

Share this URL with clients and colleagues to start using the system!
