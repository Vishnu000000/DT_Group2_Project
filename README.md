Distributed Trust – AI Model Training Data (Group 2)

Team Members & Roles

Name                  | Roll No     | Role
----------------------|-------------|----------------------------------
Vishnu Vardhan        | CS24M022    | Project Lead / Deployment
Dinesh Naik Katravath | CS24M017    | Smart Contract & Token Developer
Dinesh Kumar S        | CS24M018    | Backend & IPFS Developer
Lokesh Talamala       | CS24M023    | Frontend Developer (React.js)

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
git clone https://github.com/Vishnu000000/DT_Group2_Project.git
cd DT_Group2_Project
```

------------------------------------------------------------

Member-Specific Setup Instructions

💾 Dinesh Naik Katravath – Smart Contract Developer
```
npm install --save-dev hardhat
npx hardhat compile
```
- Work inside: contracts/, scripts/, test/

☁️ Dinesh Kumar S – Backend & IPFS Developer
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
After setup, go to roadmap/week1.md to view your Week 1 goals and tasks.
