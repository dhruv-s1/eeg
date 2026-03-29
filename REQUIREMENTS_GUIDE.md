# ✅ Requirements.txt Setup Guide

## 📋 What's in requirements.txt

Your project depends on the following packages (with versions):

### **Core Dependencies**
- **Flask** 2.3.3 - Web framework
- **Werkzeug** 2.3.7 - Security utilities & WSGI implementation
- **Jinja2** 3.1.2 - Template engine (included with Flask)
- **MarkupSafe** 2.1.3 - Safe markups for templates
- **click** 8.1.7 - Command line interface (included with Flask)
- **itsdangerous** 2.1.2 - Data signing (included with Flask)

### **Database & ORM**
- **SQLAlchemy** 2.0.21 - SQL toolkit & ORM
- **Flask-SQLAlchemy** 3.0.5 - Flask extension for SQLAlchemy

### **Authentication**
- **Flask-Login** 0.6.2 - User session management

### **Utility**
- **python-dotenv** 1.0.0 - Load environment variables from .env files

---

## 🚀 How to Install Dependencies

### **Option 1: Fresh Installation (Recommended)**

#### **Windows (Command Prompt or PowerShell):**
```bash
cd "c:\Users\admin\Downloads\EEG App"
pip install -r requirements.txt
```

#### **macOS/Linux:**
```bash
cd ~/path/to/EEG\ App
pip install -r requirements.txt
```

### **Option 2: Using Virtual Environment (Best Practice)**

#### **Create Virtual Environment:**
```bash
# Windows
python -m venv venv
venv\Scripts\activate

# macOS/Linux
python3 -m venv venv
source venv/bin/activate
```

#### **Install Requirements:**
```bash
pip install -r requirements.txt
```

---

## ✨ Verification

### **Check Installation:**
```bash
pip list
```

You should see:
```
Flask                 2.3.3
Flask-Login           0.6.2
Flask-SQLAlchemy      3.0.5
Werkzeug              2.3.7
SQLAlchemy            2.0.21
python-dotenv         1.0.0
Jinja2                3.1.2
MarkupSafe            2.1.3
click                 8.1.7
itsdangerous          2.1.2
```

### **Test Import:**
```bash
python -c "import flask; print(f'Flask {flask.__version__} installed successfully!')"
```

---

## 🔄 Update Dependencies

### **Update All Packages:**
```bash
pip install --upgrade -r requirements.txt
```

### **Update Specific Package:**
```bash
pip install --upgrade Flask
```

---

## 💾 Generate requirements.txt (if needed)

If you add new packages and want to update requirements.txt:

```bash
pip freeze > requirements.txt
```

---

## 🗂️ File Structure

```
EEG App/
├── app.py                 (Main Flask application)
├── requirements.txt       (NEW - All dependencies)
├── templates/             (HTML files)
├── static/               (CSS, JS files)
└── users.db              (Database - auto-created)
```

---

## 🧪 Test Your Setup

### **1. Install Requirements:**
```bash
pip install -r requirements.txt
```

### **2. Run Flask App:**
```bash
python app.py
```

### **3. Expected Output:**
```
 * Running on http://127.0.0.1:5000
 * Debug mode: on
```

### **4. Test in Browser:**
Visit: `http://localhost:5000`

You should see the landing page with:
- Login button
- Sign Up button
- Features section
- Stats section

---

## 🔐 Production Considerations

For production deployment, consider adding:

### **Web Server:**
```
gunicorn==21.2.0
```

### **CORS Support (if using separate frontend):**
```
Flask-Cors==4.0.0
```

### **Environment Variables:**
Create a `.env` file:
```
FLASK_ENV=production
SECRET_KEY=your-secret-key-here
DATABASE_URL=sqlite:///users.db
```

Load in your app:
```python
from dotenv import load_dotenv
load_dotenv()
```

---

## 📊 Version Information

### **Compatibility Matrix**

| Component | Version | Status |
|-----------|---------|--------|
| Flask | 2.3.3 | ✅ Stable |
| SQLAlchemy | 2.0.21 | ✅ Latest Stable |
| Flask-Login | 0.6.2 | ✅ Latest Stable |
| Flask-SQLAlchemy | 3.0.5 | ✅ Latest Compatible |
| Python | 3.8+ | ✅ Recommended |

---

## ⚠️ Troubleshooting

### **Issue: "No module named 'flask'"**
```bash
# Solution:
pip install -r requirements.txt
```

### **Issue: Version Conflict**
```bash
# Clear and reinstall:
pip uninstall -r requirements.txt -y
pip install -r requirements.txt
```

### **Issue: Virtual Environment Not Activated**
```bash
# Windows:
venv\Scripts\activate

# macOS/Linux:
source venv/bin/activate
```

### **Issue: Permission Denied (macOS/Linux)**
```bash
# Use user install:
pip install --user -r requirements.txt
```

---

## 🚀 Quick Start Checklist

- [x] requirements.txt created with all dependencies
- [ ] Install: `pip install -r requirements.txt`
- [ ] Run: `python app.py`
- [ ] Test: Visit `http://localhost:5000`
- [ ] Sign up with test account
- [ ] Login with username or email
- [ ] Test mobile responsiveness

---

## 📝 Notes

- **SQLite** is used for local development (no additional setup needed)
- **For production**, consider using PostgreSQL or MySQL
- **Virtual environment** is highly recommended for project isolation
- **Python 3.8+** is required for compatibility

---

## ✅ You're All Set!

Your dependency management is now complete. Simply run:

```bash
pip install -r requirements.txt
python app.py
```

And your Flask app is ready to go! 🚀

