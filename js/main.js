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
        await new Promise(r => setTimeout(r, 500)); // Delay untuk hindari API limit
    }
    updateStatus("Mass generation complete");
}

async function checkBalance(address, mnemonic) {
    try {
        const response = await axios.get(`https://api.blockcypher.com/v1/btc/main/addrs/${address}/balance`);
        const balance = response.data.final_balance;

        const walletData = {
            address,
            mnemonic,
            balance
        };

        wallets.push(walletData);
        displayWallet(walletData);

        if (balance > 0) {
            updateStatus("Found wallet with balance!");
            autoGenerating = false;
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
        <td>${balance} satoshi</td>
    `;
    document.querySelector("#wallet-table tbody").appendChild(row);

    // Card view ala matamata
    const card = document.createElement("div");
    card.className = "wallet-card";
    card.innerHTML = `
        <p><strong>Address:</strong> ${address}</p>
        <p><strong>Mnemonic:</strong> ${mnemonic}</p>
        <p><strong>Balance:</strong> ${balance} satoshi</p>
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