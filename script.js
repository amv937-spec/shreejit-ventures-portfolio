let balance = 100000;
let holdings = [];
let stocks = [
  { symbol: 'AAPL', name: 'Apple Inc.', price: 195.71, change: 2.34, logo: '🍎' },
  { symbol: 'MSFT', name: 'Microsoft', price: 378.91, change: -1.23, logo: '🪟' },
  { symbol: 'GOOGL', name: 'Alphabet', price: 140.93, change: 3.45, logo: '🔍' },
  { symbol: 'AMZN', name: 'Amazon', price: 155.33, change: 1.87, logo: '📦' },
  { symbol: 'TSLA', name: 'Tesla', price: 248.48, change: -5.67, logo: '⚡' },
  { symbol: 'NVDA', name: 'NVIDIA', price: 495.22, change: 8.91, logo: '🎮' },
];
let selectedStock = null;
let orderType = 'buy';

function renderStocks() {
  const grid = document.getElementById('stocksGrid');
  grid.innerHTML = stocks.map(stock => `
    <div class="stock-card">
      <div class="stock-header">
        <span class="stock-logo">${stock.logo}</span>
        <div class="stock-info">
          <h3>${stock.symbol}</h3>
          <p class="stock-name">${stock.name}</p>
        </div>
      </div>
      <p class="price">$${stock.price.toFixed(2)}</p>
      <p class="${stock.change >= 0 ? 'positive' : 'negative'}">
        ${stock.change >= 0 ? '+' : ''}${stock.change.toFixed(2)}
      </p>
      <span class="live"><span class="pulse"></span> Live</span>
    </div>
  `).join('');
}

function renderStockSelect() {
  const select = document.getElementById('stockSelect');
  select.innerHTML = stocks.map(stock => `
    <div class="stock-option" data-symbol="${stock.symbol}">
      <span class="option-logo">${stock.logo}</span>
      <div>
        <strong>${stock.symbol}</strong>
        <p>$${stock.price.toFixed(2)}</p>
      </div>
    </div>
  `).join('');

  document.querySelectorAll('.stock-option').forEach(el => {
    el.addEventListener('click', () => {
      document.querySelectorAll('.stock-option').forEach(e => e.classList.remove('selected'));
      el.classList.add('selected');
      selectedStock = stocks.find(s => s.symbol === el.dataset.symbol);
      updateSummary();
      document.getElementById('executeBtn').disabled = false;
    });
  });
}

function updateSummary() {
  const summary = document.getElementById('summary');
  const summaryText = document.getElementById('summaryText');
  const quantity = parseInt(document.getElementById('quantity').value) || 1;
  
  if (selectedStock) {
    summary.style.display = 'block';
    summaryText.textContent = `Total: $${(selectedStock.price * quantity).toFixed(2)}`;
  }
}

function renderHoldings() {
  const section = document.getElementById('holdingsSection');
  const list = document.getElementById('holdingsList');
  
  if (holdings.length === 0) {
    section.style.display = 'none';
    return;
  }
  
  section.style.display = 'block';
  list.innerHTML = holdings.map(holding => {
    const stock = stocks.find(s => s.symbol === holding.symbol);
    const currentValue = stock ? stock.price * holding.quantity : 0;
    const gain = currentValue - (holding.buyPrice * holding.quantity);
    
    return `
      <div class="holding-card">
        <div class="holding-left">
          <span class="holding-logo">${holding.logo}</span>
          <div>
            <strong>${holding.symbol}</strong>
            <span> - ${holding.quantity} shares @ $${holding.buyPrice.toFixed(2)}</span>
          </div>
        </div>
        <div>
          <p class="value">$${currentValue.toFixed(2)}</p>
          <p class="${gain >= 0 ? 'positive' : 'negative'}">
            ${gain >= 0 ? '+' : ''}$${gain.toFixed(2)}
          </p>
        </div>
      </div>
    `;
  }).join('');
}

function updateTotalValue() {
  const total = holdings.reduce((sum, holding) => {
    const stock = stocks.find(s => s.symbol === holding.symbol);
    return sum + (stock ? stock.price * holding.quantity : 0);
  }, 0);
  document.getElementById('totalValue').textContent = `$${total.toFixed(2)}`;
}

function executeTrade() {
  if (!selectedStock) return;
  
  const quantity = parseInt(document.getElementById('quantity').value) || 1;
  const totalCost = selectedStock.price * quantity;
  
  if (orderType === 'buy') {
    if (totalCost > balance) {
      alert('Insufficient balance');
      return;
    }
    
    balance -= totalCost;
    const existing = holdings.find(h => h.symbol === selectedStock.symbol);
    
    if (existing) {
      existing.quantity += quantity;
    } else {
      holdings.push({
        symbol: selectedStock.symbol,
        quantity: quantity,
        buyPrice: selectedStock.price,
        logo: selectedStock.logo
      });
    }
    
    alert(`✅ Successfully bought ${quantity} shares of ${selectedStock.symbol}`);
  } else {
    const holding = holdings.find(h => h.symbol === selectedStock.symbol);
    
    if (!holding || holding.quantity < quantity) {
      alert('❌ Insufficient shares to sell');
      return;
    }
    
    balance += totalCost;
    
    if (holding.quantity === quantity) {
      holdings = holdings.filter(h => h.symbol !== selectedStock.symbol);
    } else {
      holding.quantity -= quantity;
    }
    
    alert(`✅ Successfully sold ${quantity} shares of ${selectedStock.symbol}`);
  }
  
  document.getElementById('balance').textContent = `$${balance.toFixed(2)}`;
  document.getElementById('quantity').value = 1;
  renderHoldings();
  updateTotalValue();
}

function updatePrices() {
  stocks = stocks.map(stock => ({
    ...stock,
    price: stock.price + (Math.random() - 0.5) * 2,
    change: (Math.random() - 0.5) * 5
  }));
  renderStocks();
  renderStockSelect();
  renderHoldings();
  updateTotalValue();
}

// Event Listeners
document.getElementById('portfolioBtn').addEventListener('click', () => {
  document.getElementById('portfolioView').style.display = 'block';
  document.getElementById('tradingView').style.display = 'none';
  document.getElementById('portfolioBtn').classList.add('active');
  document.getElementById('tradingBtn').classList.remove('active');
});

document.getElementById('tradingBtn').addEventListener('click', () => {
  document.getElementById('portfolioView').style.display = 'none';
  document.getElementById('tradingView').style.display = 'block';
  document.getElementById('tradingBtn').classList.add('active');
  document.getElementById('portfolioBtn').classList.remove('active');
});

document.getElementById('buyBtn').addEventListener('click', () => {
  orderType = 'buy';
  document.getElementById('buyBtn').classList.add('active');
  document.getElementById('sellBtn').classList.remove('active');
  const btn = document.getElementById('executeBtn');
  btn.className = 'execute buy';
  btn.textContent = 'Execute Buy Order';
});

document.getElementById('sellBtn').addEventListener('click', () => {
  orderType = 'sell';
  document.getElementById('sellBtn').classList.add('active');
  document.getElementById('buyBtn').classList.remove('active');
  const btn = document.getElementById('executeBtn');
  btn.className = 'execute sell';
  btn.textContent = 'Execute Sell Order';
});

document.getElementById('quantity').addEventListener('input', updateSummary);
document.getElementById('executeBtn').addEventListener('click', executeTrade);

// Initialize
renderStocks();
renderStockSelect();
setInterval(updatePrices, 3000);