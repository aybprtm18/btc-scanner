const bitcoin = window.bitcoinjs;
const axios = window.axios;

async function generateWallet() {
  const keyPair = bitcoin.ECPair.makeRandom();
  const { address } = bitcoin.payments.p2pkh({ pubkey: keyPair.publicKey });
  const wif = keyPair.toWIF();

  document.getElementById("address").innerText = address;
  document.getElementById("privateKey").innerText = wif;

  const balanceSpan = document.getElementById("balance");
  balanceSpan.innerText = "Loading...";
  try {
    const res = await axios.get(`https://blockstream.info/api/address/${address}`);
    const balance = res.data.chain_stats.funded_txo_sum - res.data.chain_stats.spent_txo_sum;
    balanceSpan.innerText = (balance / 1e8).toFixed(8) + " BTC";
  } catch (err) {
    balanceSpan.innerText = "Gagal cek saldo";
  }
}
