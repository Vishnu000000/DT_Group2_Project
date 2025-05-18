
📅 Week 1 Plan – Group 2: Distributed Trust (April 9–14)

This document defines the Week 1 objectives and individual responsibilities for all team members.

------------------------------------------------------------

👥 Team Roles

Name                  | Roll No     | Role
----------------------|-------------|----------------------------------
Vishnu Vardhan        | CS24M022    | Frontend Developer and Project Lead / Deployment
Dinesh Naik Katravath | CS24M017    | Smart Contract & Token Developer
Dinesh Kumar S        | CS24M018    | Backend & IPFS Developer
------------------------------------------------------------

🎯 Week 1 Objective

Kickstart the project with smart contract setup, IPFS backend integration, and frontend environment.

------------------------------------------------------------

🧑‍🚀 Vishnu Vardhan – Deployment

Responsibilities:
- Create GitHub repository & folder structure
- Set up Hardhat project and deploy `TraindataRegistry.sol`
- Write `README.md` and `week1.md`
- Push deployed contract and project scaffolding
- Guide team, review pull requests, manage integration

------------------------------------------------------------

💾 Dinesh Naik Katravath – Smart Contract Developer

Responsibilities:
- Extend `TraindataRegistry.sol`:
  - Include fields: IPFS CID, metadata, owner, licensee
  - Add `uploadDataset()`, `licenseDataset()`, `getDataset()` functions
- Create mock ERC-20 token for licensing
- Test on Hardhat local network
- Push updates to `contract-dev` branch

Example command to compile contract:
```
npx hardhat compile
```

------------------------------------------------------------

☁️ Dinesh Kumar S – Backend & IPFS Developer

Responsibilities:
- Set up Node.js Express server under `backend/`
- Connect to IPFS using `ipfs-http-client`
- API routes:
  - POST /upload → uploads file, returns CID
  - GET /dataset/:id → fetch metadata
- Encrypt file before upload (basic AES)
- Push code to `ipfs-backend` branch

Backend init commands:
```
cd backend
npm init -y
npm install express ipfs-http-client multer cors
```

------------------------------------------------------------

🎨 Lokesh Talamala – Frontend Developer

Responsibilities:
- Set up React app in `frontend/`
- Install & configure Tailwind or Bootstrap
- Build UI:
  - Upload form (file + metadata)
  - Dataset viewer (list & license status)
- Connect MetaMask via Ethers.js
- Interact with contract (`uploadDataset()`, `getDataset()`)

Frontend setup commands:
```
npx create-react-app frontend
cd frontend
npm install ethers bootstrap
```

------------------------------------------------------------

📌 Week 1 Deliverables (By April 14)

- Smart contract extended & tested
- ERC-20 token written (mock)
- IPFS upload API tested with encryption
- Frontend skeleton with MetaMask integration
- All team members’ code in their respective branches
