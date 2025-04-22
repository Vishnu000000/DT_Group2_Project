# 📅 Week 2 Plan – Group 2: Distributed Trust (April 15–20)

**Objective:**  
Complete backend upload API, kick off smart contract coding, and scaffold the frontend.

## 👥 Team Roles

| Name                  | Roll No     | Role                             |
|-----------------------|-------------|----------------------------------|
| **Vishnu Vardhan**    | CS24M022    | Project Lead / Coordinator       |
| Dinesh Naik Katravath | CS24M018    | Smart Contract Developer         |
| Dinesh Kumar S        | CS24M017    | Backend & IPFS Developer         |
| Lokesh Talamala       | CS24M023    | Frontend Developer               |

---

## 🧑‍🚀 Project Lead – Vishnu Vardhan  
- ☑️ Schedule a quick kickoff call and summarize this plan  
- ☑️ Review each PR and merge when green‑lit  
- ☑️ Update `README.md` with any URL or branch changes  
- ☑️ Keep the team on track with a brief daily standup note  
- 🔐 Ensure `PINATA_KEY`, `PINATA_SECRET`, and RPC endpoints are set in `.env`  
- 📊 Prepare a one‑pager status dashboard summarizing progress  

---

## 💾 Smart Contract Developer – Dinesh Naik Katravath 
- 📝 Initialize Hardhat (if not done) and compile:  
  ```bash
  npm install --save-dev hardhat
  npx hardhat compile
  ```  
- 🚀 Begin `TraindataRegistry.sol` (or extend `IPFSUpload.sol`):  
  - `uploadDataset(cid, metadata)`  
  - `getDataset(id)`  
- 👉 Write a minimal deployment script in `scripts/`  
- 🧪 Run a local test:  
  ```bash
  npx hardhat test
  ```  

---

## ☁️ Backend & IPFS Developer –  Dinesh Kumar S  
- 🔒 Finalize `upload.js` Pinata flow and log CID  
- 🔄 Add Express route in `backend/index.js`:  
  ```js
  app.post('/upload', upload.single('file'), async (req, res) => {
    // pin to IPFS, return { cid }
  });
  ```  
- 🧪 Write a quick API test (Jest or Mocha) asserting CID response  
- 📝 Document the endpoint in `docs/api.md`  
- ✅ Push to `ipfs-backend` branch  

---

## 🎨 Frontend Developer – Lokesh Talamala  
- 🌱 Scaffold React app:  
  ```bash
  npx create-react-app frontend
  cd frontend
  npm install ethers axios
  ```  
- 📄 Create a static **Upload** page with:  
  - File selector + metadata fields  
  - “Connect Wallet” button  
- 🚧 No backend hookup yet—just UI skeleton  
- ✅ Push to `frontend-dev` branch  

---

## 📌 Deliverables by April 23 EOD 
- ✅ Backend API: `/upload` working with IPFS  
- ✅ Smart contract stub compiled & deploy script ready  
- ✅ Frontend skeleton with basic pages and wallet connect  
- ✅ All branches pushed and PRs opened for review
