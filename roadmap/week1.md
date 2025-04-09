# 📅 Week 1 Plan – Group 2: Distributed Trust (April 9–14)

This document outlines the goals, individual responsibilities, and expected deliverables for Week 1 of the Distributed Trust project.

---

## 🧠 Team Roles

| Member | Roll Number | Responsibility |
|--------|-------------|----------------|
| Vishnu Vardhan | CS24M022 | **Lead / Deployment / Integrator** |
| Dinesh Kumar S | CS24M017 | **Smart Contract & Token Developer** |
| Dinesh Naik Katravath | CS24M018 | **Backend & IPFS Developer** |
| Lokesh Talamala | CS24M023 | **Frontend Developer** |

---

## 🎯 Week 1 Objective

> Build the foundation of the decentralized platform: setup contracts, IPFS, and frontend environment.

---

## 🧑‍🚀 Vishnu Vardhan (Project Lead)

**Tasks:**
- ✅ Create and structure GitHub repository
- ✅ Initialize Hardhat project and install dependencies
- ✅ Deploy `TraindataRegistry` contract locally
- ✅ Push contract code and setup folders
- ✅ Write team documentation (`README.md`, `week1.md`)
- ✅ Create and assign GitHub issues for all members
- ✅ Guide team members through setup and review commits

---

## 💾 Dinesh Kumar S (Smart Contract Developer)

**Tasks:**
- [ ] Extend `TraindataRegistry.sol`:
  - Include dataset metadata (CID, description, owner, license status)
  - Add functions for uploading, licensing, and fetching datasets
- [ ] Create a mock ERC-20 token for dataset licensing
- [ ] Test contracts locally using Hardhat
- [ ] Provide ABI and contract address for frontend/backend
- [ ] Push changes to `contract-dev` branch

---

## ☁️ Dinesh Naik Katravath (Backend & IPFS Developer)

**Tasks:**
- [ ] Setup basic Node.js + Express backend in `backend/` folder
- [ ] Use `ipfs-http-client` to:
  - Upload encrypted files to IPFS
  - Retrieve CIDs
- [ ] Build API endpoints:
  - `POST /upload` → returns CID
  - `GET /dataset/:id` → retrieves dataset info
- [ ] Document backend API flow
- [ ] Push code to `ipfs-backend` branch

---

## 🎨 Lokesh Talamala (Frontend Developer)

**Tasks:**
- [ ] Setup React project inside `frontend/` folder
- [ ] Install and configure Tailwind CSS or Bootstrap
- [ ] Build initial components:
  - Upload form (file + metadata)
  - Dataset view section
- [ ] Connect to MetaMask using Ethers.js
- [ ] Interact with contract: `uploadDataset()`, `getDataset()`
- [ ] Push to `frontend-dev` branch

---

## 📌 Deliverables by End of Week 1

- [ ] Fully working `TraindataRegistry` contract with local tests
- [ ] IPFS integration tested and returning CIDs
- [ ] Basic frontend skeleton with MetaMask connection
- [ ] All members synced with repo and pushing to their branches

---

