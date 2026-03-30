# 🅿️ ParkFlow — Peer-to-Peer Car Parking Marketplace

Welcome to ParkFlow! A platform to find, navigate, and pay for parking spots easily.

## 🚀 How to Run the Project (Very Easy)

Follow these simple steps:

1. **Open your Terminal (Mac/Linux) or Command Prompt/PowerShell (Windows)**
2. **Navigate to the ParkFlow folder:**
   ```bash
   cd /Users/siyran/Documents/Python/ParkFlow
   ```
3. **Run the start command:**
   ```bash
   npm start
   ```

**That's it!** 🎉 
This single command will:
1. Automatically install everything you need.
2. Start the built-in database (no need to install MongoDB!).
3. Automatically seed sample parking spots and test users.
4. Launch both the backend server and the frontend website.

Wait a few seconds, then open your browser and go to:
👉 **[http://localhost:5173](http://localhost:5173)**

---

### 🔑 Demo Accounts to Test

You can log in to test different perspectives. Use the password `password123` for all of them:

| Role | Email | Use it to... |
|------|-------|--------------|
| **Driver** | `amit@parkflow.com` | Search map, start parking session, view bill |
| **Owner** | `rajesh@parkflow.com` | View earnings, add new parking spots |
| **Admin** | `admin@parkflow.com` | View platform stats, approve parking spots |

---

## 🛠️ Tech Stack Details (For curious minds)
- **Frontend**: React, Vite, Tailwind CSS (Stunning UI)
- **Backend**: Node.js, Express
- **Database**: MongoDB (runs completely automatically thanks to `mongodb-memory-server`)
- **Maps**: Leaflet + OpenStreetMap (100% free)
- **Real-time**: Socket.io for live availability
