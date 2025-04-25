
let walletHistory = [];
let loopInterval = null;

function generateWallet() {
  const keyPair = bitcoin.ECPair.makeRandom();
  const { address } = bitcoin.payments.p2pkh({ pubkey: keyPair.publicKey });
  const wif = keyPair.toWIF();

  walletHistory.push({ address, wif });

  document.getElementById('walletAddress').textContent = address;
  document.getElementById('walletPrivateKey').textContent = wif;
  document.getElementById('walletBalance').textContent = "Loading...";

  fetch(`https://blockstream.info/api/address/${address}`)
    .then(res => res.json())
    .then(data => {
      const confirmed = data.chain_stats.funded_txo_sum - data.chain_stats.spent_txo_sum;
      const unconfirmed = data.mempool_stats.funded_txo_sum - data.mempool_stats.spent_txo_sum;
      const balanceBTC = (confirmed + unconfirmed) / 1e8;
      document.getElementById('walletBalance').textContent = balanceBTC + " BTC";

      // Stop and alert if balance > 0
      if (balanceBTC > 0) {
        stopLoop();
        alert("Ditemukan wallet dengan saldo!\nAddress: " + address + "\nSaldo: " + balanceBTC + " BTC");
      }
    })
    .catch(() => {
      document.getElementById('walletBalance').textContent = "Error loading balance";
    });

  const qr = new QRCode(document.getElementById("qrcode"), {
    text: address,
    width: 128,
    height: 128
  });
  document.getElementById("qrcode").innerHTML = "";
  qr.makeCode(address);

  document.getElementById("walletInfo").scrollIntoView({ behavior: "smooth" });
}

function toggleLoop() {
  if (!loopInterval) {
    loopInterval = setInterval(generateWallet, 3000);
  }
}

function stopLoop() {
  clearInterval(loopInterval);
  loopInterval = null;
}

function exportHistory() {
  if (walletHistory.length === 0) {
    alert("No wallet history yet.");
    return;
  }
  const data = walletHistory.map(w => `Address: ${w.address}\nPrivate Key: ${w.wif}`).join("\n\n");
  const blob = new Blob([data], { type: "text/plain" });
  const a = document.createElement("a");
  a.href = URL.createObjectURL(blob);
  a.download = "wallet-history.txt";
  a.click();
}

function validateMnemonic() {
  const input = document.getElementById("mnemonicInput").value.trim();
  if (!input) {
    alert("Please enter a mnemonic.");
  } else {
    alert("Feature not fully implemented.");
  }
}

function toggleDarkMode() {
  document.body.classList.toggle("dark-mode");
}
