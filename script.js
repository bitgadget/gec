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
        if (withSeconds) options.second = '2-digit';
        return date.toLocaleDateString('it-IT', options);
    }

    // ========== SPLASH SCREEN HANDLING ==========
    (function() {
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
    })();

    // ========== PORTFOLIO DATA MANAGER ==========
    const portfolioManager = (function() {
        const data = [
            { name: 'NASDAQ 100 Index', symbol: 'LQQ.PA', weight: 26.48, color: '#72ecc3' },
            { name: 'MicroStrategy', symbol: 'MSTR', weight: 12.64, color: '#5ac69b' },
            { name: 'Tesla', symbol: 'TSLA', weight: 11.74, color: '#a0f2dc' },
            { name: 'NVIDIA', symbol: 'NVDA', weight: 11.50, color: '#4dd0e1' },
            { name: 'Amazon.com', symbol: 'AMZN', weight: 11.23, color: '#26c6da' },
            { name: 'Alphabet (Google)', symbol: 'GOOG', weight: 11.13, color: '#00bcd4' },
            { name: 'Meta Platforms', symbol: 'META', weight: 10.90, color: '#0097a7' },
            { name: 'Marathon Digital Holdings', symbol: 'MARA', weight: 2.19, color: '#00838f' },
            { name: 'Riot Platforms', symbol: 'RIOT', weight: 1.64, color: '#006064' },
            { name: 'Novavax', symbol: 'NVAX', weight: 0.57, color: '#004d40' }
        ];
        const calculateDiversificationScore = () => {
            const weights = data.map(item => item.weight);
            const sumSq = weights.reduce((sum, w) => sum + w*w, 0);
            const hhi = sumSq / 10000;
            return Math.round((1 - hhi) * 100);
        };
        return {
            data,
            totalAssets: data.length,
            maxWeight: Math.max(...data.map(item => item.weight)),
            diversificationScore: calculateDiversificationScore()
        };
    })();

    // ========== CHART MANAGER ==========
    const chartManager = (function() {
        const donutChart = new ApexCharts(document.querySelector('#donut-chart'), {
            series: portfolioManager.data.map(item => item.weight),
            chart: { type: 'donut', height: '100%', width: '100%' },
            labels: portfolioManager.data.map(item => item.name),
            colors: portfolioManager.data.map(item => item.color),
            legend: { position: 'bottom', horizontalAlign: 'center' },
            plotOptions: { pie: { donut: { size: '65%' } } },
            dataLabels: { enabled: false }
        });
        donutChart.render();
        const generateSparkline = (selector, positive) => {
            const sparkData = Array.from({ length: 15 }, () => Math.random() * 100);
            new ApexCharts(document.querySelector(selector), {
                series: [{ data: sparkData }],
                chart: { type: 'line', width: '100%', height: 50, sparkline: { enabled: true }, animations: { enabled: false } },
                stroke: { curve: 'smooth', width: 2 },
                fill: { opacity: 0.1 },
                tooltip: { enabled: false },
                colors: [positive ? '#00C853' : '#FF1744']
            }).render();
        };
        return { generateSparkline };
    })();

    // ========== STATS MANAGER ==========
    const statsManager = (function() {
        const updateStats = () => {
            document.getElementById('total-assets').textContent = portfolioManager.totalAssets;
            document.getElementById('top-asset').textContent = portfolioManager.maxWeight.toFixed(2) + '%';
            document.getElementById('diversification').textContent = portfolioManager.diversificationScore + '%';
        };
        updateStats();
        return { update: updateStats };
    })();

    // ========== ALPHA VANTAGE CONFIGURATION ==========
    const apiKey = 'LORHIOHX8N5W8HPU';
    const baseUrl = 'https://www.alphavantage.co/query?function=GLOBAL_QUOTE';
    async function fetchQuote(symbol) {
        try {
            const response = await fetch(`${baseUrl}&symbol=${symbol}&apikey=${apiKey}`);
            const data = await response.json();
            return data['Global Quote'];
        } catch (error) {
            console.error(`Errore fetch per ${symbol}:`, error);
            return null;
        }
    }

    // ========== DASHBOARD MANAGER ==========
    const dashboardManager = (function() {
        const stocks = [
            { symbol: 'LQQ.PA',  name: 'NASDAQ 100 Index',         logo: 'https://logo.clearbit.com/nasdaq.com', price: 0, change: 0 },
            { symbol: 'MSTR', name: 'MicroStrategy',           logo: 'https://logo.clearbit.com/microstrategy.com', price: 0, change: 0 },
            { symbol: 'TSLA', name: 'Tesla',                    logo: 'https://logo.clearbit.com/tesla.com', price: 0, change: 0 },
            { symbol: 'NVDA', name: 'NVIDIA',                   logo: 'https://logo.clearbit.com/nvidia.com', price: 0, change: 0 },
            { symbol: 'AMZN', name: 'Amazon.com',               logo: 'https://logo.clearbit.com/amazon.com', price: 0, change: 0 },
            { symbol: 'GOOG', name: 'Alphabet (Google)',        logo: 'https://logo.clearbit.com/google.com', price: 0, change: 0 },
            { symbol: 'META', name: 'Meta Platforms',           logo: 'https://logo.clearbit.com/meta.com', price: 0, change: 0 },
            { symbol: 'MARA', name: 'Marathon Digital Holdings',logo: 'https://ml.globenewswire.com/Resource/Download/c6f90e85-d59a-4fb2-9c10-de6e48201994', price: 0, change: 0 },
            { symbol: 'RIOT', name: 'Riot Platforms',           logo: 'https://logo.clearbit.com/riotblockchain.com', price: 0, change: 0 },
            { symbol: 'NVAX', name: 'Novavax',                  logo: 'https://logo.clearbit.com/novavax.com', price: 0, change: 0 }
        ];
        const container = document.getElementById('dashboard-grid');
        async function init() {
            if (!container) {
                console.error('Missing #dashboard-grid element');
                return;
            }
            container.innerHTML = '';
            const quotes = await Promise.all(stocks.map(s => fetchQuote(s.symbol)));
            quotes.forEach((quote, idx) => {
                if (quote && quote['05. price']) {
                    stocks[idx].price = parseFloat(quote['05. price']);
                    stocks[idx].change = parseFloat(quote['10. change percent'].replace('%', ''));
                }
            });
            stocks.forEach(stock => {
                const card = document.createElement('div');
                card.className = 'card';
                const isPositive = stock.change >= 0;
                const logoClass = stock.symbol === 'MSTR' ? 'strategy-logo' : '';
                card.innerHTML = `
                    <div class="card-header">
                        <div class="card-logo"><img src="${stock.logo}" alt="${stock.name} logo" class="${logoClass}"></div>
                        <div class="card-title"><h3>${stock.name}</h3><p>${stock.symbol}</p></div>
                    </div>
                    <div class="card-price">${formatCurrency(stock.price)}</div>
                    <div class="card-change ${isPositive ? 'positive' : 'negative'}">
                        <i class="fas fa-arrow-${isPositive ? 'up' : 'down'}"></i>${Math.abs(stock.change).toFixed(2)}%
                    </div>
                    <div class="sparkline" id="sparkline-${stock.symbol}"></div>
                `;
                container.appendChild(card);
                chartManager.generateSparkline(`#sparkline-${stock.symbol}`, isPositive);
            });
            console.log('Dashboard rendered with live data');
        }
        init();
        return { refresh: init };
    })();

    // ========== BUTTON HANDLERS ==========
    (function() {
        document.getElementById('export-pdf').addEventListener('click', function() {
            const btn = this;
            btn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Generando...';
            btn.disabled = true;
            setTimeout(() => {
                btn.innerHTML = '<i class="fas fa-check"></i> Report pronto!';
                setTimeout(() => { btn.innerHTML = '<i class="fas fa-file-pdf"></i> Esporta Report'; btn.disabled = false; }, 2000);
            }, 1500);
        });
        document.getElementById('refresh-data').addEventListener('click', function() {
            const btn = this;
            btn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Aggiornamento...';
            btn.disabled = true;
            setTimeout(() => {
                statsManager.update();
                dashboardManager.refresh();
                btn.innerHTML = '<i class="fas fa-check"></i> Dati aggiornati!';
                setTimeout(() => { btn.innerHTML = '<i class="fas fa-sync-alt"></i> Aggiorna'; btn.disabled = false; }, 1500);
            }, 1000);
        });
    })();

    // ========== RESPONSIVE CHARTS ON RESIZE ==========
    window.addEventListener('resize', function() {
        if (window.ApexCharts) {
            ApexCharts.exec('donut-chart', 'updateOptions', {
                chart: {
                    width: document.querySelector('.chart-container').offsetWidth,
                    height: document.querySelector('.chart-container').offsetHeight
                }
            });
        }
    });
});
