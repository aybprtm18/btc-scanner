let addressList = [];

document.getElementById("file-input").addEventListener("change", handleFile);
document.getElementById("start-scan").addEventListener("click", startScanning);

function handleFile(event) {
  const file = event.target.files[0];
  const reader = new FileReader();
  reader.onload = function(e) {
    addressList = e.target.result.split(/\r?\n/).filter(line => line.trim() !== "");
    alert(`Berhasil memuat ${addressList.length} address dari file!`);
  };
  reader.readAsText(file);
}

async function startScanning() {
  if (addressList.length === 0) {
    alert("Belum ada address yang dimuat!");
    return;
  }

  for (let i = 0; i < addressList.length; i++) {
    const address = addressList[i];
    const balance = await getBalance(address);

    displayWallet(address, balance);

    if (balance > 0) {
      playAlarm();
    }
    
    await new Promise(r => setTimeout(r, 300)); // delay untuk hindari banned API
  }
}

async function getBalance(address) {
  try {
    const response = await fetch(`https://blockchain.info/q/addressbalance/${address}`);
    if (!response.ok) throw new Error('Failed to fetch balance');
    const balanceSatoshi = await response.text();
    return parseFloat(balanceSatoshi) / 100000000; // konversi ke BTC
  } catch (err) {
    console.error("Error fetching balance:", err);
    return 0;
  }
}

function displayWallet(address, balance) {
  const container = document.getElementById("wallet-list");
  const card = document.createElement("div");
  card.style.padding = "10px";
  card.style.margin = "10px";
  card.style.border = "1px solid #ccc";
  card.style.backgroundColor = balance > 0 ? "#d4edda" : "#f8d7da"; // hijau kalau ada saldo
  card.innerHTML = `
    <p><strong>Address:</strong> ${address}</p>
    <p><strong>Balance:</strong> ${balance} BTC</p>
  `;
  container.appendChild(card);
}

function playAlarm() {
  const alarm = document.getElementById("alarm-sound");
  alarm.play().catch(e => console.error("Alarm sound error:", e));
}