
async function getWalletBalance(address) {
    try {
        const response = await fetch(`https://blockstream.info/api/address/${address}`);
        const data = await response.json();
        const confirmed = data.chain_stats.funded_txo_sum - data.chain_stats.spent_txo_sum;
        return confirmed / 1e8;
    } catch (error) {
        console.error('Gagal mengambil saldo:', error);
        return 0;
    }
}

function addWalletToList(address, privateKey, balance) {
    const walletList = document.getElementById('walletList');

    const walletItem = document.createElement('div');
    walletItem.style.padding = "10px";
    walletItem.style.marginBottom = "8px";
    walletItem.style.borderRadius = "8px";
    walletItem.style.backgroundColor = balance > 0 ? '#d4edda' : '#f8d7da';
    walletItem.style.border = "1px solid " + (balance > 0 ? '#28a745' : '#dc3545';

    walletItem.innerHTML = `
        <p><strong>Address:</strong> ${address}</p>
        <p><strong>Private Key:</strong> ${privateKey}</p>
        <p><strong>Balance:</strong> ${balance} BTC</p>
    `;

    walletList.appendChild(walletItem);
}

async function generateMultipleWallets() {
    const walletList = document.getElementById('walletList');
    walletList.innerHTML = "";

    for (let i = 0; i < 100; i++) {
        const keyPair = bitcoin.ECPair.makeRandom();
        const { address } = bitcoin.payments.p2pkh({ pubkey: keyPair.publicKey });
        const privateKey = keyPair.toWIF();

        const balance = await getWalletBalance(address);
        addWalletToList(address, privateKey, balance);
    }
}

document.getElementById('generateBtn').addEventListener('click', generateMultipleWallets);
