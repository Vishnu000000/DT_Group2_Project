# 📅 Week 3 Plan – Group 2: Distributed Trust (April 21–26)

**Objective:**  
Integrate backend, contract, and frontend; implement licensing; finalize tests and docs.

## 👥 Team Roles

| Name                  | Roll No     | Role                             |
|-----------------------|-------------|----------------------------------|
| **Vishnu Vardhan**    | CS24M022    | Project Lead / Coordinator       |
| Dinesh Kumar S        | CS24M017    | Smart Contract Developer         |
| Dinesh Naik Katravath | CS24M018    | Backend & IPFS Developer         |
| Lokesh Talamala       | CS24M023    | Frontend Developer               |

---

## 🧑‍🚀 Project Lead – Vishnu Vardhan  
- ☑️ Review and merge final integration PRs  
- ☑️ Deploy contract to testnet and share address/ABI  
- ☑️ Update `README.md` with testnet info  
- ☑️ Collect final feedback and draft demo slides  

---

## 💾 Smart Contract Developer – Dinesh Kumar S  
- 🔥 Extend contract with `licenseDataset(datasetId)` and event  
- 🧪 Write tests for licensing in `test/`  
- 🚀 Deploy to testnet:  
  ```bash
  npx hardhat run scripts/deploy.js --network sepolia
  ```  
- 📄 Document ABI & address in `docs/contract.md`  

---

## ☁️ Backend & IPFS Developer – Dinesh Naik Katravath  
- 🛠 Integrate `/upload` endpoint with contract call:  
  ```js
  const registry = new ethers.Contract(addr, abi, signer);
  await registry.uploadDataset(req.body.name, req.body.cid);
  ```  
- ➕ Add `POST /license` endpoint to call `licenseDataset()`  
- 🗑 Implement soft‑delete for GDPR (optional)  
- ✅ Push final backend changes  

---

## 🎨 Frontend Developer – Lokesh Talamala  
- 🔗 Wire Upload page to backend `/upload` and then to smart contract  
- 🛒 Add “Purchase License” button for each dataset:  
  ```bash
  await registry.licenseDataset(datasetId);
  ```  
- 📜 Display dataset list with IPFS gateway links and license status  
- 🎨 Polish UI and add success/error toasts  
- ✅ Push final frontend integration  

---

## 📌 Deliverables by April 26  
- ✅ End‑to‑end flow: Upload → IPFS → Contract → UI  
- ✅ Licensing functionality live on testnet  
- ✅ UI, backend, and contract tested & documented  
- ✅ Demo-ready slides and final report drafted
