
let autoGenerating = false;

async function generateWallet() {
    const mnemonic = bip39.generateMnemonic();
    const seed = await bip39.mnemonicToSeed(mnemonic);
    const root = bitcoin.bip32.fromSeed(seed);
    const child = root.derivePath("m/44'/0'/0'/0/0");
    const { address } = bitcoin.payments.p2pkh({ pubkey: child.publicKey });

    await checkBalance(address, mnemonic);
}

async function startScanning() {
    autoGenerating = true;
    updateStatus("Scanning wallet...");
    while (autoGenerating) {
        await generateWallet();
        await new Promise(resolve => setTimeout(resolve, 200));
    }
}

function stopScanning() {
    autoGenerating = false;
    updateStatus("Scanning stopped.");
}

async function checkBalance(address, mnemonic) {
    try {
        const response = await fetch(`https://blockchain.info/q/addressbalance/${address}`);
        if (!response.ok) throw new Error('Failed to fetch balance');
        const balanceSatoshi = await response.text();
        const balanceBTC = parseFloat(balanceSatoshi) / 100000000;

        displayWallet(address, mnemonic, balanceBTC);

        if (balanceBTC > 0) {
            playAlarm();
            stopScanning();
        }
    } catch (err) {
        console.error("Error fetching balance:", err);
    }
}

function displayWallet(address, mnemonic, balanceBTC) {
    const container = document.getElementById("wallet-list");
    const card = document.createElement("div");
    card.className = "wallet-card";
    card.style.backgroundColor = balanceBTC > 0 ? "#d4edda" : "#ffffff";
    card.innerHTML = `
        <p><strong>Address:</strong> ${address}</p>
        <p><strong>Mnemonic:</strong> ${mnemonic}</p>
        <p><strong>Balance:</strong> ${balanceBTC} BTC</p>
    `;
    container.prepend(card);
}

function playAlarm() {
    const alarm = document.getElementById("alarm-sound");
    alarm.play().catch(err => console.error("Alarm error:", err));
}

function updateStatus(text) {
    document.getElementById("status").innerText = `Status: ${text}`;
}

document.getElementById("start-scan").addEventListener("click", startScanning);
document.getElementById("stop-scan").addEventListener("click", stopScanning);
