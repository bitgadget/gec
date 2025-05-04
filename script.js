// script.js

document.addEventListener('DOMContentLoaded', function() {
    // ========== INITIALIZATION ==========
    console.log('GEC Innovation Strategy - Dashboard loaded');
    
    // ========== UTILITY FUNCTIONS ==========
    function formatCurrency(value) {
        return '$' + value.toLocaleString('en-US', {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2
        });
    }
    
    function formatDate(date, withSeconds = false) {
        const options = {
            day: '2-digit',
            month: 'short',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        };
        
        if (withSeconds) {
            options.second = '2-digit';
        }
        
        return date.toLocaleDateString('it-IT', options);
    }

    // ========== SPLASH SCREEN HANDLING ==========
    const splashScreen = (function() {
        const splash = document.getElementById('splash');
        const header = document.getElementById('header');
        
        const hideSplash = () => {
            splash.classList.add('hidden');
            header.classList.add('visible');
            
            setTimeout(() => {
                splash.remove();
                console.log('Splash screen removed');
            }, 500);
        };
        
        setTimeout(hideSplash, 3000);
        
        return {
            hide: hideSplash
        };
    })();

    // ========== PORTFOLIO DATA MANAGER ==========
    const portfolioManager = (function() {
        const data = [
            { name: 'LYXOR NASDAQ 100', symbol: 'LQQ FP Equity', weight: 26.48, color: '#72ecc3' },
            { name: 'MicroStrategy', symbol: 'MSTR UQ Equity', weight: 12.64, color: '#5ac69b' },
            { name: 'Tesla', symbol: 'TSLA UQ Equity', weight: 11.74, color: '#a0f2dc' },
            { name: 'NVIDIA', symbol: 'NVDA UQ Equity', weight: 11.50, color: '#4dd0e1' },
            { name: 'Amazon', symbol: 'AMZN UQ Equity', weight: 11.23, color: '#26c6da' },
            { name: 'Alphabet', symbol: 'GOOG UQ Equity', weight: 11.13, color: '#00bcd4' },
            { name: 'Meta', symbol: 'META UQ Equity', weight: 10.90, color: '#0097a7' },
            { name: 'MARA', symbol: 'MARA UQ Equity', weight: 2.19, color: '#00838f' },
            { name: 'Riot', symbol: 'RIOT UQ Equity', weight: 1.64, color: '#006064' },
            { name: 'Novavax', symbol: 'NVAX UQ Equity', weight: 0.57, color: '#004d40' }
        ];

        const getTopAssets = (count = 5) => {
            return [...data]
                .sort((a, b) => b.weight - a.weight)
                .slice(0, count);
        };

        const calculateDiversificationScore = () => {
            const weights = data.map(item => item.weight);
            const sumOfSquares = weights.reduce((sum, weight) => sum + Math.pow(weight, 2), 0);
            const hhi = sumOfSquares / 10000;
            return Math.round((1 - hhi) * 100);
        };

        return {
            data,
            getTopAssets,
            totalAssets: data.length,
            maxWeight: Math.max(...data.map(item => item.weight)),
            diversificationScore: calculateDiversificationScore()
        };
    })();

    // ========== CHART MANAGER ==========
    const chartManager = (function() {
        // Initialize Donut Chart
        const donutChart = new ApexCharts(document.querySelector("#donut-chart"), {
            series: portfolioManager.data.map(item => item.weight),
            chart: {
                type: 'donut',
                height: '100%',
                width: '100%',
                animations: {
                    enabled: true,
                    easing: 'easeout',
                    speed: 800
                }
            },
            labels: portfolioManager.data.map(item => item.name),
            colors: portfolioManager.data.map(item => item.color),
            legend: {
                position: 'bottom',
                horizontalAlign: 'center',
                fontSize: '13px',
                markers: {
                    width: 10,
                    height: 10
                },
                itemMargin: {
                    horizontal: 5,
                    vertical: 5
                }
            },
            dataLabels: {
                enabled: false
            },
            plotOptions: {
                pie: {
                    donut: {
                        size: '65%',
                        labels: {
                            show: true,
                            name: {
                                fontSize: '13px',
                                offsetY: -5
                            },
                            value: {
                                offsetY: 5,
                                fontSize: '20px',
                                fontWeight: 600,
                                color: '#F5F5F5'
                            },
                            total: {
                                show: true,
                                showAlways: true,
                                label: 'TOTALE',
                                fontSize: '16px',
                                color: '#888888',
                                formatter: function(w) {
                                    return w.globals.seriesTotals.reduce((a, b) => a + b, 0).toFixed(2) + '%'
                                }
                            }
                        }
                    }
                }
            },
            tooltip: {
                y: {
                    formatter: function(value) {
                        return value + '%'
                    }
                }
            },
            responsive: [{
                breakpoint: 768,
                options: {
                    chart: {
                        height: 300
                    },
                    legend: {
                        position: 'bottom'
                    }
                }
            }]
        });

        // Generate sparkline for stock cards
        const generateSparkline = (elementId, isPositive) => {
            const data = Array.from({ length: 15 }, () => Math.random() * 100);
            
            new ApexCharts(document.querySelector(elementId), {
                series: [{ data }],
                chart: {
                    type: 'line',
                    width: '100%',
                    height: 50,
                    sparkline: { enabled: true },
                    animations: { enabled: false }
                },
                colors: [isPositive ? '#00C853' : '#FF1744'],
                stroke: { curve: 'smooth', width: 2 },
                fill: { opacity: 0.1 },
                tooltip: {
                    enabled: false
                }
            }).render();
        };

        // Initialize charts
        donutChart.render();
        console.log('Donut chart initialized');

        return {
            generateSparkline
        };
    })();

    // ========== STATS MANAGER ==========
    const statsManager = (function() {
        const updateStats = () => {
            document.getElementById('total-assets').textContent = portfolioManager.totalAssets;
            document.getElementById('top-asset').textContent = 
                portfolioManager.maxWeight.toFixed(2) + '%';
            document.getElementById('diversification').textContent = 
                portfolioManager.diversificationScore + '%';
        };
        
        updateStats();
        console.log('Stats initialized');
        
        return {
            update: updateStats
        };
    })();

    // ========== DASHBOARD MANAGER ==========
    const dashboardManager = (function() {
        const stocks = [
            { symbol: 'BTC', name: 'Bitcoin', logo: 'https://upload.wikimedia.org/wikipedia/commons/4/46/Bitcoin.svg', price: 51234.56, change: 2.34 },
            { symbol: 'MSTR', name: 'MicroStrategy', logo: 'https://companiesmarketcap.com/img/company-logos/64/MSTR.webp', price: 1456.78, change: -1.23 },
            { symbol: 'NDX', name: 'Nasdaq 100', logo: 'https://logo.clearbit.com/nasdaq.com', price: 17893.45, change: 0.78 },
            { symbol: 'SPX', name: 'S&P 500', logo: 'https://logo.clearbit.com/spglobal.com', price: 5214.67, change: -0.45 },
            { symbol: 'AAPL', name: 'Apple', logo: 'https://logo.clearbit.com/apple.com', price: 189.34, change: 1.56 },
            { symbol: 'MSFT', name: 'Microsoft', logo: 'https://logo.clearbit.com/microsoft.com', price: 345.67, change: 0.89 },
            { symbol: 'NVDA', name: 'NVIDIA', logo: 'https://logo.clearbit.com/nvidia.com', price: 876.54, change: 3.45 },
            { symbol: 'TSLA', name: 'Tesla', logo: 'https://logo.clearbit.com/tesla.com', price: 234.56, change: -2.34 }
        ];
        
        const dashboardGrid = document.getElementById('dashboard-grid');
        
        const renderDashboard = () => {
            dashboardGrid.innerHTML = '';
            stocks.forEach(stock => {
                const isPositive = stock.change >= 0;
                const card = document.createElement('div');
                card.className = 'card';
                // Aggiungo la classe 'strategy-logo' solo per MicroStrategy (MSTR)
                const logoClass = stock.symbol === 'MSTR' ? 'strategy-logo' : '';
                card.innerHTML = `
                    <div class="card-header">
                        <div class="card-logo"><img src="${stock.logo}" alt="${stock.name} logo" class="${logoClass}"></div>
                        <div class="card-title">
                            <h3>${stock.name}</h3>
                            <p>${stock.symbol}</p>
                        </div>
                    </div>
                    <div class="card-price">${formatCurrency(stock.price)}</div>
                    <div class="card-change ${isPositive ? 'positive' : 'negative'}">
                        <i class="fas fa-arrow-${isPositive ? 'up' : 'down'}"></i>
                        ${Math.abs(stock.change).toFixed(2)}%
                    </div>
                    <div class="sparkline" id="sparkline-${stock.symbol}"></div>
                `;
                dashboardGrid.appendChild(card);
                
                chartManager.generateSparkline(`#sparkline-${stock.symbol}`, isPositive);
            });
            console.log('Dashboard rendered');
        };
        
        const updateRandomStock = () => {
            const randomIndex = Math.floor(Math.random() * stocks.length);
            const stock = stocks[randomIndex];
            const newChange = stock.change + (Math.random() * 0.5 - 0.25);
            stock.change = parseFloat(newChange.toFixed(2));
            stock.price = stock.price * (1 + newChange / 100);
            
            const card = dashboardGrid.children[randomIndex];
            const isPositive = stock.change >= 0;
            
            card.querySelector('.card-price').textContent = formatCurrency(stock.price);
            const changeElement = card.querySelector('.card-change');
            changeElement.innerHTML = `
                <i class="fas fa-arrow-${isPositive ? 'up' : 'down'}"></i>
                ${Math.abs(stock.change).toFixed(2)}%
            `;
            changeElement.className = `card-change ${isPositive ? 'positive' : 'negative'}`;
            
            // Regenerate sparkline
            const sparklineContainer = card.querySelector(`#sparkline-${stock.symbol}`);
            sparklineContainer.innerHTML = '';
            chartManager.generateSparkline(`#sparkline-${stock.symbol}`, isPositive);
            
            return stock;
        };
        
        renderDashboard();
        
        return {
            updateRandomStock,
            refresh: renderDashboard
        };
    })();

    // ========== BUTTON HANDLERS ==========
    const buttonHandlers = (function() {
        // Export PDF Button
        document.getElementById('export-pdf').addEventListener('click', function() {
            const btn = this;
            btn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Generando...';
            btn.disabled = true;
            
            setTimeout(() => {
                btn.innerHTML = '<i class="fas fa-check"></i> Report pronto!';
                setTimeout(() => {
                    btn.innerHTML = '<i class="fas fa-file-pdf"></i> Esporta Report';
                    btn.disabled = false;
                    console.log('PDF export simulated');
                }, 2000);
            }, 1500);
        });
        
        // Refresh Data Button
        document.getElementById('refresh-data').addEventListener('click', function() {
            const btn = this;
            btn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Aggiornamento...';
            btn.disabled = true;
            
            setTimeout(() => {
                // Update all components
                statsManager.update();
                dashboardManager.refresh();
                
                btn.innerHTML = '<i class="fas fa-check"></i> Dati aggiornati!';
                setTimeout(() => {
                    btn.innerHTML = '<i class="fas fa-sync-alt"></i> Aggiorna';
                    btn.disabled = false;
                    console.log('Data refresh completed');
                }, 1500);
            }, 1000);
        });
    })();

    // ========== LIVE UPDATES ==========
    const liveUpdates = (function() {
        const updateTimestamp = () => {
            const now = new Date();
            document.getElementById('last-update').textContent = formatDate(now);
            document.getElementById('timestamp').textContent = formatDate(now, true);
        };
        
        const interval = setInterval(() => {
            updateTimestamp();
            statsManager.update();
            const updatedStock = dashboardManager.updateRandomStock();
            console.log(`Stock updated: ${updatedStock.name} (${updatedStock.change}%)`);
        }, 5000);
        
        updateTimestamp();
        console.log('Live updates initialized');
        
        return {
            stop: () => clearInterval(interval)
        };
    })();

    // ========== WINDOW EVENT LISTENERS ==========
    window.addEventListener('beforeunload', function() {
        liveUpdates.stop();
        console.log('Live updates stopped');
    });

    // ========== RESPONSIVE HANDLING ==========
    window.addEventListener('resize', function() {
        // Force chart to recalculate dimensions
        if (window.ApexCharts) {
            window.ApexCharts.exec('donut-chart', 'updateOptions', {
                chart: {
                    width: document.querySelector('.chart-container').offsetWidth,
                    height: document.querySelector('.chart-container').offsetHeight
                }
            });
        }
    });
});