
📦 Distributed Trust – AI Model Training Data (Group 2)

👥 Team Members & Roles

Name                  | Roll No     | Role
----------------------|-------------|----------------------------------
Vishnu Vardhan        | CS24M022    | Project Lead / Deployment
Dinesh Kumar S        | CS24M017    | Smart Contract & Token Developer
Dinesh Naik Katravath | CS24M018    | Backend & IPFS Developer
Lokesh Talamala       | CS24M023    | Frontend Developer

------------------------------------------------------------

⚙️ Common Setup Instructions (All Members)

🔧 1. Install Git
- Download: https://git-scm.com/
- Use 64-bit version with default settings

🧱 2. Install Node.js & npm
- Download LTS version: https://nodejs.org/
- Verify:
```
node -v
npm -v
```

📁 3. Clone the GitHub Repository
```
git clone https://github.com/<your-username-or-org>/DT_Group2_Project.git
cd DT_Group2_Project
npm install
```

------------------------------------------------------------

🧩 Member-Specific Setup Instructions

💾 Dinesh Kumar S – Smart Contract Developer
```
npm install --save-dev hardhat
npx hardhat compile
```
- Work inside: contracts/, scripts/, test/

☁️ Dinesh Naik Katravath – Backend & IPFS Developer
```
cd backend
npm init -y
npm install express ipfs-http-client multer cors
```
- Work inside: backend/

🎨 Lokesh Talamala – Frontend Developer
```
npx create-react-app frontend
cd frontend
npm install ethers bootstrap
```
- Work inside: frontend/

------------------------------------------------------------

📎 Next Step:
After setup, go to plan/week1.md to view your Week 1 goals and tasks.
