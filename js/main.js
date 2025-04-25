// main.js

const wallets = []; let autoGenerating = false;

async function generateWallet() { updateStatus("Scanning..."); const mnemonic = bip39.generateMnemonic(); const seed = await bip39.mnemonicToSeed(mnemonic); const root = bitcoin.bip32.fromSeed(seed); const child = root.derivePath("m/44'/0'/0'/0/0"); const { address } = bitcoin.payments.p2pkh({ pubkey: child.publicKey });

await checkBalance(address, mnemonic); }

async function checkBalance(address, mnemonic) { try { const response = await axios.get(https://api.blockcypher.com/v1/btc/main/addrs/${address}/balance); const balance = response.data.final_balance;

const walletData = {
  address,
  mnemonic,
  balance
};

wallets.push(walletData);

if (balance > 0) {
  displayWallet(walletData);
  updateStatus("Found wallet with balance!");
  autoGenerating = false;
} else {
  updateStatus("No balance found.");
}

} catch (error) { console.error("Error checking balance:", error); updateStatus("Error checking balance"); } }

function displayWallet(wallet) { const infoDiv = document.getElementById("walletInfo"); const div = document.createElement("div"); div.className = "wallet-entry"; div.innerHTML = <p><strong>Address:</strong> ${wallet.address}</p> <p><strong>Mnemonic:</strong> ${wallet.mnemonic}</p> <p><strong>Balance:</strong> ${wallet.balance} satoshi</p> <hr/>; infoDiv.prepend(div); }

function startAuto() { autoGenerating = true; updateStatus("Auto scanning started..."); const loop = async () => { if (!autoGenerating) return; await generateWallet(); setTimeout(loop, 1000); // Delay per wallet scan }; loop(); }

function exportWallets() { const csvContent = wallets.map(w => ${w.address},${w.mnemonic},${w.balance}).join("\n"); const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" }); const url = URL.createObjectURL(blob); const link = document.createElement("a"); link.setAttribute("href", url); link.setAttribute("download", "wallets.csv"); link.click(); }

function toggleDarkMode() { document.body.classList.toggle("dark-mode"); }

function validateMnemonic() { const input = document.getElementById("mnemonicInput").value.trim(); if (!bip39.validateMnemonic(input)) { alert("Mnemonic tidak valid."); return; } alert("Mnemonic valid."); }

function updateStatus(text) { let statusBar = document.getElementById("statusBar"); if (!statusBar) { statusBar = document.createElement("div"); statusBar.id = "statusBar"; statusBar.style.margin = "10px 0"; statusBar.style.fontWeight = "bold"; document.querySelector(".container").prepend(statusBar); } statusBar.textContent = text; }

