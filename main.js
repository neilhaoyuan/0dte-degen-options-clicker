// Create game instance
let game = new GameLogic();
let previousPrice = game.stock.getPrice();
let priceHistory = [game.stock.getPrice()]; // Store price history for chart
let maxHistoryLength = 50; // Keep last 50 data points

// Initialize UI on page load
window.addEventListener('DOMContentLoaded', function() {
    // Initial UI update
    updateStatusBar(game.getUserState());
    updateStockPrice(game.stock.getPrice(), previousPrice);
    generateOptions(game);
    updatePositionsList(game.getUserState().options);
    
    // Create the price chart
    const ctx = document.getElementById('price-chart').getContext('2d');
    const priceChart = new Chart(ctx, {
        type: 'line',
        data: {
            labels: Array(priceHistory.length).fill(''),
            datasets: [{
                label: 'Stock Price',
                data: priceHistory,
                borderColor: 'rgb(75, 192, 192)',
                backgroundColor: 'rgba(75, 192, 192, 0.1)',
                tension: 0.1,
                fill: true
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    display: false
                }
            },
            scales: {
                y: {
                    beginAtZero: false
                }
            }
        }
    });
    
    // Track tick count for option refresh
    let tickCount = 0;
    const REFRESH_INTERVAL = 10; // Refresh every 10 ticks
    
    // Start game loop - tick every 1 second (1000ms)
    setInterval(function() {
        // DEBUG: Check before tick
        previousPrice = game.stock.getPrice();
        console.log('Before tick:', previousPrice);
        
        // Update game state
        game.tick();        
        game.checkLevelUp();
        
        // Update UI
        const gameState = game.getUserState();
        updateStatusBar(gameState);
        updateStockPrice(gameState.stockPrice, previousPrice);
        updatePositionsList(gameState.options);
        
        // Add new price to history
        priceHistory.push(gameState.stockPrice);
        
        // Keep only last 50 points
        if (priceHistory.length > maxHistoryLength) {
            priceHistory.shift();
        }
        
        // Update chart
        priceChart.data.labels = Array(priceHistory.length).fill('');
        priceChart.data.datasets[0].data = priceHistory;
        priceChart.update();
        
        // Update countdown
        tickCount++;
        const ticksUntilRefresh = REFRESH_INTERVAL - (tickCount % REFRESH_INTERVAL);
        const secondsUntilRefresh = (ticksUntilRefresh * 1).toFixed(1); // 1s per tick
        document.getElementById('countdown').textContent = secondsUntilRefresh;
        
        // Refresh options every 10 ticks
        if (tickCount % REFRESH_INTERVAL === 0) {
            generateOptions(game);
        }
        
    }, 1000);
});