async function generateWallet() {
  const res = await fetch("https://blockchain.info/q/newaddress");
  const { address, private: priv } = await res.json();

  document.getElementById("walletInfo").innerHTML = `
    <p><strong>Address:</strong> ${address}</p>
    <p><strong>Private Key (WIF):</strong> ${priv}</p>
    <p><em>Saldo dicek otomatis (fitur selanjutnya)</em></p>
  `;
}