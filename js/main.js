const wallets = [];
let autoGenerating = false;

async function generateWallet() {
    updateStatus("Scanning...");
    const mnemonic = bip39.generateMnemonic();
    const seed = await bip39.mnemonicToSeed(mnemonic);
    const root = bitcoin.bip32.fromSeed(seed);
    const child = root.derivePath("m/44'/0'/0'/0/0");
    const { address } = bitcoin.payments.p2pkh({ pubkey: child.publicKey });

    await checkBalance(address, mnemonic);
}

async function generateMultipleWallets(count) {
    for (let i = 0; i < count; i++) {
        if (!autoGenerating) break;
        await generateWallet();
        await new Promise(r => setTimeout(r, 200)); // Lebih cepat, tapi masih aman
    }
    updateStatus("Mass generation complete");
}

async function checkBalance(address, mnemonic) {
    try {
        const response = await fetch(`https://blockchain.info/q/addressbalance/${address}?cors=true`);
        if (!response.ok) throw new Error('Failed to fetch balance');
        const balanceSatoshi = await response.text();
        const balanceBTC = parseFloat(balanceSatoshi) / 100000000;

        if (balanceBTC > 0) {
            const walletData = {
                address,
                mnemonic,
                balance: balanceBTC
            };

            wallets.push(walletData);
            displayWallet(walletData);
            updateStatus("Found wallet with balance!");
            autoGenerating = false; // Stop otomatis kalau ketemu wallet isi
        }
    } catch (err) {
        console.error("Balance check error", err);
    }
}

function displayWallet({ address, mnemonic, balance }) {
    const row = document.createElement("tr");
    row.innerHTML = `
        <td>${address}</td>
        <td>${mnemonic}</td>
        <td>${balance} BTC</td>
    `;
    document.querySelector("#wallet-table tbody").appendChild(row);

    const card = document.createElement("div");
    card.className = "wallet-card";
    card.innerHTML = `
        <p><strong>Address:</strong> ${address}</p>
        <p><strong>Mnemonic:</strong> ${mnemonic}</p>
        <p><strong>Balance:</strong> ${balance} BTC</p>
    `;
    document.getElementById("wallet-cards").prepend(card);
}

function updateStatus(text) {
    document.getElementById("status").innerText = text;
}

function startGenerating() {
    autoGenerating = true;
    const count = parseInt(document.getElementById("wallet-count").value || "10");
    generateMultipleWallets(count);
}

function stopGenerating() {
    autoGenerating = false;
    updateStatus("Stopped");
}

document.addEventListener("DOMContentLoaded", () => {
    document.getElementById("generate-btn").addEventListener("click", startGenerating);
    document.getElementById("stop-btn").addEventListener("click", stopGenerating);
});