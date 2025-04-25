let walletHistory = [];
let autoGenerating = false;

function toggleDarkMode() {
  document.body.classList.toggle("light");
}

function generateWallet() {
  const keyPair = bitcoinjs.ECPair.makeRandom();
  const { address } = bitcoinjs.payments.p2pkh({ pubkey: keyPair.publicKey });
  const wif = keyPair.toWIF();

  axios.get(`https://blockstream.info/api/address/${address}`)
    .then(res => {
      const balance = res.data.chain_stats.funded_txo_sum - res.data.chain_stats.spent_txo_sum;
      const btc = (balance / 1e8).toFixed(8);
      appendWallet(address, wif, btc);
    })
    .catch(() => appendWallet(address, wif, "Gagal cek saldo"));
}

function appendWallet(address, wif, balance) {
  const div = document.createElement("div");
  div.className = "wallet-entry";
  const qrCanvas = document.createElement("canvas");
  QRCode.toCanvas(qrCanvas, address);
  div.innerHTML = \`
    <p><strong>Address:</strong> \${address}</p>
    <p><strong>Private Key:</strong> \${wif}</p>
    <p><strong>Saldo:</strong> \${balance} BTC</p>
  \`;
  div.appendChild(qrCanvas);
  document.getElementById("walletInfo").prepend(div);
  walletHistory.push({ address, wif, balance });
}

function exportWallets() {
  const content = walletHistory.map(w => \`\${w.address},\${w.wif},\${w.balance} BTC\`).join("\n");
  const blob = new Blob([content], { type: "text/plain" });
  const a = document.createElement("a");
  a.href = URL.createObjectURL(blob);
  a.download = "wallet-history.txt";
  a.click();
}

function validateMnemonic() {
  const input = document.getElementById("mnemonicInput").value.trim();
  const isValid = bip39.validateMnemonic(input);
  alert(isValid ? "Mnemonic valid!" : "Mnemonic tidak valid!");
}

function startAuto() {
  if (autoGenerating) return;
  autoGenerating = true;
  const loop = async () => {
    if (!autoGenerating) return;
    generateWallet();
    setTimeout(loop, 3000);
  };
  loop();
}
