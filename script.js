// script.js

document.addEventListener('DOMContentLoaded', function() {
    // ========== INITIALIZATION ==========
    console.log('GEC Innovation Strategy - Dashboard loaded');

    // Recupera i valori delle variabili CSS definite nel :root
    const primaryColor = getComputedStyle(document.documentElement).getPropertyValue('--primary-color').trim();
    const textLightColor = getComputedStyle(document.documentElement).getPropertyValue('--text-light').trim();
    const textSecondaryColor = getComputedStyle(document.documentElement).getPropertyValue('--text-secondary').trim();
    const bgTertiaryColor = getComputedStyle(document.documentElement).getPropertyValue('--bg-tertiary').trim();
    const positiveColor = getComputedStyle(document.documentElement).getPropertyValue('--positive').trim();
    const negativeColor = getComputedStyle(document.documentElement).getPropertyValue('--negative').trim();


    // ========== UTILITY FUNCTIONS ==========
    function formatCurrency(value) {
        if (value === null || value === undefined || isNaN(value)) {
            return '$N/A'; // Gestisce valori non validi
        }
        return '$' + value.toLocaleString('en-US', {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2
        });
    }

    function formatDate(date, withSeconds = false) {
        if (!date) return 'N/A'; // Gestisce date non valide
        const dateObj = date instanceof Date ? date : new Date(date);

        if (isNaN(dateObj.getTime())) {
             console.error("Data non valida fornita a formatDate:", date);
             return 'Invalid Date';
        }

        const options = {
            day: '2-digit',
            month: 'short', // es. Apr
            year: 'numeric'
        };
        if (withSeconds) {
            options.hour = '2-digit';
            options.minute = '2-digit';
            options.second = '2-digit';
            options.hour12 = false; // Formato 24 ore
        }
        return dateObj.toLocaleDateString('en-US', options);
    }

    // ========== SPLASH SCREEN HANDLING ==========
    (function() {
        const splash = document.getElementById('splash');
        const header = document.getElementById('header');
        const hideSplash = () => {
            if (splash) {
                splash.classList.add('hidden');
                if (header) {
                     header.classList.add('visible');
                     const mainContent = document.getElementById('main-content');
                     if (mainContent) {
                         requestAnimationFrame(() => {
                            mainContent.style.paddingTop = `${header.offsetHeight + 20}px`;
                         });
                     }
                 }
                splash.addEventListener('transitionend', () => {
                     splash.remove();
                     console.log('Splash screen removed');
                }, { once: true });
            }
        };
        setTimeout(hideSplash, 3000);
    })();


    // ========== PORTFOLIO DATA MANAGER ==========
    const portfolioManager = (function() {
        const data = [
            { name: 'LYXOR NASDAQ 100 DAILY LEV', symbol: 'LQQ.PA', weight: 26.48, color: '#72ecc3' },
            { name: 'MicroStrategy Inc.', symbol: 'MSTR', weight: 12.64, color: '#5ac69b' },
            { name: 'Tesla, Inc.', symbol: 'TSLA', weight: 11.74, color: '#a0f2dc' },
            { name: 'NVIDIA Corp.', symbol: 'NVDA', weight: 11.50, color: '#4dd0e1' },
            { name: 'Amazon.com, Inc.', symbol: 'AMZN', weight: 11.23, color: '#26c6da' },
            { name: 'Alphabet Inc. (Class A)', symbol: 'GOOG', weight: 11.13, color: '#00bcd4' },
            { name: 'Meta Platforms, Inc.', symbol: 'META', weight: 10.90, color: '#0097a7' },
            { name: 'MARA Holdings, Inc.', symbol: 'MARA', weight: 2.19, color: '#00838f' },
            { name: 'Riot Platforms, Inc.', symbol: 'RIOT', weight: 1.64, color: '#006064' },
            { name: 'Novavax, Inc.', symbol: 'NVAX', weight: 0.57, color: '#004d40' }
        ];

        const calculateDiversificationScore = () => {
            const weights = data.map(item => item.weight);
            if (weights.length === 0) return 0;
            const sumSq = weights.reduce((sum, w) => sum + Math.pow(w, 2), 0);
            const hhi_normalized = sumSq / 10000;
            return Math.round(Math.max(0, (1 - hhi_normalized) * 100));
        };

        const getPerformance2025 = () => {
             const perfElement = document.getElementById('performance-2025');
             if (perfElement) {
                 const text = perfElement.textContent.replace(/[^\d,\.\+\-]/g, '').replace(',', '.').trim();
                 return parseFloat(text);
             }
             return null;
        };

        return {
            data,
            totalAssets: data.length,
            maxWeight: data.length > 0 ? Math.max(...data.map(item => item.weight)) : 0,
            diversificationScore: calculateDiversificationScore(),
            performance2025: getPerformance2025()
        };
    })();

    // ========== CHART MANAGER ==========
    const chartManager = (function() {
        // === Grafico a ciambella (Asset Allocation) ===
        const donutChartOptions = {
            series: portfolioManager.data.map(item => item.weight),
            chart: {
                type: 'donut',
                height: '100%',
                width: '100%',
                parentHeightOffset: 0,
                id: 'donut-chart-instance'
            },
            labels: portfolioManager.data.map(item => item.name),
            colors: portfolioManager.data.map(item => item.color),
            legend: {
                position: 'bottom',
                horizontalAlign: 'center',
                labels: { colors: textLightColor }
            },
            plotOptions: { pie: { donut: { size: '65%' } } },
            dataLabels: { enabled: false },
            tooltip: { theme: 'dark' }
        };
        const donutChartElement = document.querySelector('#donut-chart');
        let donutChart = null;

        if (donutChartElement) {
             donutChart = new ApexCharts(donutChartElement, donutChartOptions);
             donutChart.render();
        } else {
             console.error('Element #donut-chart not found.');
        }


        // === Funzione per generare lo sparkline ===
        const generateSparkline = (selector, positive) => {
            const sparkData = Array.from({ length: 15 }, () => Math.random() * 100); // Dati casuali per sparkline
             const sparklineElement = document.querySelector(selector);
             if (!sparklineElement) {
                 console.warn(`Sparkline element "${selector}" not found.`);
                 return;
             }

             if (!sparkData || sparkData.length === 0) {
                 sparklineElement.innerHTML = '<p style="color:' + textSecondaryColor + '; text-align:center; font-size:0.8rem;">Dati sparkline non disponibili</p>';
                 return;
             }

            new ApexCharts(sparklineElement, {
                series: [{ data: sparkData }],
                chart: { type: 'line', width: '100%', height: 50, sparkline: { enabled: true }, animations: { enabled: false } },
                stroke: { curve: 'smooth', width: 2 },
                fill: { opacity: 0.1 },
                tooltip: { enabled: false },
                colors: [positive ? positiveColor : negativeColor]
            }).render();
        };

        // === Grafico storico per l'indice GEC ===
        let gecHistoricalChart = null;

        // ** DATI REALI FORNITI DALL'UTENTE (dal file GECINNOV_01Jan25_to_05May25.txt) **
        const fullHistoricalData = [
            { x: new Date("2025-01-03").getTime(), y: 1018.63 },
            { x: new Date("2025-01-06").getTime(), y: 1012.04 },
            { x: new Date("2025-01-07").getTime(), y: 1014.79 },
            { x: new Date("2025-01-08").getTime(), y: 1016.93 },
            { x: new Date("2025-01-10").getTime(), y: 1019.5 },
            { x: new Date("2025-01-13").getTime(), y: 1021.07 },
            { x: new Date("2025-01-14").getTime(), y: 1014.03 },
            { x: new Date("2025-01-15").getTime(), y: 1015.4 },
            { x: new Date("2025-01-16").getTime(), y: 1015.99 },
            { x: new Date("2025-01-17").getTime(), y: 1016.47 },
            { x: new Date("2025-01-21").getTime(), y: 1010.23 },
            { x: new Date("2025-01-22").getTime(), y: 1008.94 },
            { x: new Date("2025-01-23").getTime(), y: 1011.21 },
            { x: new Date("2025-01-24").getTime(), y: 1002.39 },
            { x: new Date("2025-01-27").getTime(), y: 1004.99 },
            { x: new Date("2025-01-28").getTime(), y: 1010.21 },
            { x: new Date("2025-01-29").getTime(), y: 1009.52 },
            { x: new Date("2025-01-30").getTime(), y: 1009.94 },
            { x: new Date("2025-01-31").getTime(), y: 1011.92 },
            { x: new Date("2025-02-03").getTime(), y: 1017.62 },
            { x: new Date("2025-02-04").getTime(), y: 1012.2 },
            { x: new Date("2025-02-05").getTime(), y: 1012.48 },
            { x: new Date("2025-02-06").getTime(), y: 1015.68 },
            { x: new Date("2025-02-07").getTime(), y: 1016.57 },
            { x: new Date("2025-02-10").getTime(), y: 1018.21 },
            { x: new Date("2025-02-11").getTime(), y: 1015.39 },
            { x: new Date("2025-02-12").getTime(), y: 1010.73 },
            { x: new Date("2025-02-13").getTime(), y: 1008.88 },
            { x: new Date("2025-02-14").getTime(), y: 1007.11 },
            { x: new Date("2025-02-18").getTime(), y: 1009.23 },
            { x: new Date("2025-02-19").getTime(), y: 1002.75 },
            { x: new Date("2025-02-20").getTime(), y: 1004.09 },
            { x: new Date("2025-02-21").getTime(), y: 993.5 },
            { x: new Date("2025-02-24").getTime(), y: 985.49 },
            { x: new Date("2025-02-25").getTime(), y: 972.02 },
            { x: new Date("2025-02-26").getTime(), y: 975.64 },
            { x: new Date("2025-02-27").getTime(), y: 968.34 },
            { x: new Date("2025-02-28").getTime(), y: 978.54 },
            { x: new Date("2025-03-03").getTime(), y: 973.93 },
            { x: new Date("2025-03-04").getTime(), y: 981.71 },
            { x: new Date("2025-03-05").getTime(), y: 993.2 },
            { x: new Date("2025-03-06").getTime(), y: 989.04 },
            { x: new Date("2025-03-07").getTime(), y: 984.98 },
            { x: new Date("2025-03-10").getTime(), y: 962.1 },
            { x: new Date("2025-03-11").getTime(), y: 968.7 },
            { x: new Date("2025-03-12").getTime(), y: 969.67 },
            { x: new Date("2025-03-13").getTime(), y: 968.17 },
            { x: new Date("2025-03-14").getTime(), y: 982.84 },
            { x: new Date("2025-03-17").getTime(), y: 981.31 },
            { x: new Date("2025-03-18").getTime(), y: 974.57 },
            { x: new Date("2025-03-19").getTime(), y: 984.27 },
            { x: new Date("2025-03-20").getTime(), y: 983.88 },
            { x: new Date("2025-03-21").getTime(), y: 985.42 },
            { x: new Date("2025-03-24").getTime(), y: 1002.22 },
            { x: new Date("2025-03-25").getTime(), y: 1002.87 },
            { x: new Date("2025-03-26").getTime(), y: 996.75 },
            { x: new Date("2025-03-27").getTime(), y: 994.49 },
            { x: new Date("2025-03-28").getTime(), y: 978.69 },
            { x: new Date("2025-03-31").getTime(), y: 975.72 },
            { x: new Date("2025-04-01").getTime(), y: 990.55 },
            { x: new Date("2025-04-02").getTime(), y: 998.3 },
            { x: new Date("2025-04-03").getTime(), y: 950.72 },
            { x: new Date("2025-04-04").getTime(), y: 937.19 },
            { x: new Date("2025-04-07").getTime(), y: 923.03 },
            { x: new Date("2025-04-08").getTime(), y: 914.22 },
            { x: new Date("2025-04-09").getTime(), y: 995.69 },
            { x: new Date("2025-04-10").getTime(), y: 962.51 },
            { x: new Date("2025-04-11").getTime(), y: 969.12 },
            { x: new Date("2025-04-14").getTime(), y: 982.92 },
            { x: new Date("2025-04-15").getTime(), y: 983.44 },
            { x: new Date("2025-04-16").getTime(), y: 945.85 },
            { x: new Date("2025-04-17").getTime(), y: 935.76 },
            { x: new Date("2025-04-22").getTime(), y: 934.78 },
            { x: new Date("2025-04-23").getTime(), y: 982.72 },
            { x: new Date("2025-04-24").getTime(), y: 1006.94 },
            { x: new Date("2025-04-25").getTime(), y: 1042.03 },
            { x: new Date("2025-04-28").getTime(), y: 1036.46 },
            { x: new Date("2025-04-29").getTime(), y: 1048.29 },
            { x: new Date("2025-04-30").getTime(), y: 1038.39 },
            { x: new Date("2025-05-02").getTime(), y: 1093.41 } // Ultimo dato dal file
        ];

        // Ordina i dati per data crescente (molto importante per i grafici temporali)
        fullHistoricalData.sort((a, b) => a.x - b.x);

        console.log(`Caricati e formattati ${fullHistoricalData.length} punti dati storici dal file fornito.`);


        async function fetchHistoricalData() {
            // Questa funzione ora restituisce semplicemente tutti i dati pre-caricati
            console.log('Restituzione di tutti i dati storici caricati (dal file fornito).');

            if (!fullHistoricalData || fullHistoricalData.length === 0) {
                 console.warn("Nessun dato storico disponibile da restituire.");
                 return [];
            }

            // Restituisce direttamente tutti i dati caricati
            return fullHistoricalData;
        }

        async function renderGecHistoricalChart() {
            const chartElement = document.querySelector('#gec-historical-chart');
            if (!chartElement) {
                console.error('Element #gec-historical-chart not found.');
                 const parentContainer = document.querySelector('.index-performance-container');
                 if(parentContainer && !parentContainer.querySelector('#gec-historical-chart-error')) {
                      parentContainer.innerHTML += '<p id="gec-historical-chart-error" style="color:' + textSecondaryColor + '; text-align:center; font-size:1rem;">Errore: Impossibile trovare l\'elemento grafico (#gec-historical-chart).</p>';
                 }
                return;
            }

            // Chiamiamo fetchHistoricalData che ora restituisce sempre l'intero dataset
            const formattedData = await fetchHistoricalData();

            if (!formattedData || formattedData.length === 0) {
                 const existingErrorMsg = chartElement.parentElement ? chartElement.parentElement.querySelector('#gec-historical-chart-error') : null;
                 if(existingErrorMsg) existingErrorMsg.remove();

                 chartElement.innerHTML = '<p style="color:' + textSecondaryColor + '; text-align:center; font-size:1rem;">Dati storici non disponibili.</p>';
                 if (gecHistoricalChart) {
                    gecHistoricalChart.destroy();
                    gecHistoricalChart = null;
                 }
                 return;
            } else {
                 const noDataMsg = chartElement.parentElement ? chartElement.parentElement.querySelector('p[style*="Dati storici non disponibili"]') : null;
                 if(noDataMsg) noDataMsg.remove();
                  if (!gecHistoricalChart) {
                      chartElement.innerHTML = '';
                  }
            }

            // Determina automaticamente l'intervallo min/max dall'effettivo dataset
            const firstDataPoint = formattedData[0] ? formattedData[0].x : undefined;
            const lastDataPoint = formattedData[formattedData.length - 1] ? formattedData[formattedData.length - 1].x : undefined;


            const gecHistoricalChartOptions = {
                series: [{
                    name: 'Valore Indice',
                    data: formattedData
                }],
                chart: {
                    type: 'line',
                    height: 300,
                    width: '100%',
                    toolbar: { show: true, tools: { download: false, selection: true, zoom: true, pan: true, reset: true } },
                    zoom: { enabled: true },
                    animations: { enabled: true, easing: 'easeinout', speed: 800 },
                    id: 'gec-historical-chart-instance'
                },
                colors: [primaryColor],
                stroke: { curve: 'smooth', width: 2 }, // Puoi cambiare 'smooth' in 'straight' se preferisci linee rette tra i punti
                grid: {
                     show: true,
                     borderColor: bgTertiaryColor,
                     strokeDashArray: 4,
                     position: 'back'
                 },
                xaxis: {
                    type: 'datetime',
                    labels: { style: { colors: textSecondaryColor } },
                    axisBorder: { show: false },
                    axisTicks: { show: false },
                    // Imposta il dominio dell'asse X in base ai dati caricati
                    min: firstDataPoint,
                    max: lastDataPoint,
                },
                yaxis: {
                    labels: { style: { colors: textSecondaryColor } },
                    opposite: false,
                     formatter: function (value) {
                         return value ? value.toFixed(2) : 'N/A';
                     }
                },
                tooltip: {
                    x: { format: 'dd MMM yyyy' }, // Formato data nel tooltip
                    theme: 'dark',
                     y: {
                        formatter: function (value) {
                            return value ? value.toFixed(2) : 'N/A';
                        }
                     }
                },
                dataLabels: { enabled: false }
            };

            if (gecHistoricalChart) {
                 gecHistoricalChart.updateOptions({ // Usiamo updateOptions per aggiornare anche min/max dell'asse X e la serie
                     series: [{ data: formattedData }],
                     xaxis: {
                         min: firstDataPoint,
                         max: lastDataPoint,
                     }
                 }, true, true); // I primi due true resettano zoom/pan e redraw; il terzo mantiene lo stato (potrebbe essere necessario sperimentare qui) - mettiamo true per ridisegnare correttamente con il nuovo range
                 console.log('Grafico storico aggiornato con dati dal file fornito.');
            } else {
                gecHistoricalChart = new ApexCharts(chartElement, gecHistoricalChartOptions);
                gecHistoricalChart.render();
                console.log('Nuovo grafico storico GEC Innovation Index renderizzato (con dati dal file fornito).');
            }
        }

        // Chiama la funzione per renderizzare il grafico storico all'avvio
        // Renderizza sempre tutti i dati dal file caricato
        renderGecHistoricalChart();

        // Rimosso il gestore click sui pulsanti timeframe (come concordato)


        return {
            generateSparkline,
            renderGecHistoricalChart, // Mantenuta per coerenza, anche se non più usata dai bottoni
            donutChart,
            gecHistoricalChart
        };
    })();


    // ========== ALPHA VANTAGE CONFIGURATION ==========
    const apiKey = 'LORHIOHX8N5W8HPU'; // La tua chiave API
    const baseUrl = 'https://www.alphavantage.co/query';
    const alphaVantageApiLimit = 5;


    async function fetchQuote(symbol) {
        await new Promise(resolve => setTimeout(resolve, 1500));

        const url = `${baseUrl}?function=GLOBAL_QUOTE&symbol=${symbol}&apikey=${apiKey}`;
        try {
            console.log(`Workspaceing quote for ${symbol}...`);
            const response = await fetch(url);

            if (!response.ok) {
                console.error(`Errore HTTP! status: ${response.status} per ${symbol}`);
                try {
                    const errorText = await response.text();
                    console.error(`Dettagli errore per ${symbol}: ${errorText}`);
                } catch (e) {
                     console.error(`Impossibile leggere il corpo dell'errore per ${symbol}.`);
                }
                return null;
            }

            const data = await response.json();

             if (data && data['Global Quote'] && data['Global Quote']['05. price']) {
                return data['Global Quote'];
            } else {
                 console.warn(`Dati quotazione non validi, mancanti o errore API per ${symbol}:`, data);
                 if (data["Note"] && data["Note"].includes("API call frequency")) {
                     console.error(`Limite chiamate API Alpha Vantage raggiunto per ${symbol}. Attendi un minuto.`);
                 } else if (data["Error Message"]) {
                      console.error(`Messaggio di errore API per ${symbol}: ${data["Error Message"]}`);
                 }
                return null;
            }
        } catch (error) {
            console.error(`Errore fetch per ${symbol}:`, error);
            return null;
        }
    }


    // ========== DASHBOARD MANAGER ==========
    const dashboardManager = (function() {
        const stocks = [
            { symbol: 'LQQ.PA',  name: 'LYXOR NASDAQ 100 DAILY LEV', logo: 'https://logo.clearbit.com/nasdaq.com', price: null, change: null },
            { symbol: 'MSTR', name: 'MicroStrategy Inc.', logo: 'https://logo.clearbit.com/microstrategy.com', price: null, change: null },
            { symbol: 'TSLA', name: 'Tesla, Inc.', logo: 'https://logo.clearbit.com/tesla.com', price: null, change: null },
            { symbol: 'NVDA', name: 'NVIDIA Corp.', symbol: 'NVDA', weight: 11.50, color: '#4dd0e1' }, // Corretto duplicato NVDA
            { symbol: 'AMZN', name: 'Amazon.com, Inc.', logo: 'https://logo.clearbit.com/amazon.com', price: null, change: null },
            { symbol: 'GOOG', name: 'Alphabet Inc. (Class A)', logo: 'https://logo.clearbit.com/google.com', price: null, change: null },
            { symbol: 'META', name: 'Meta Platforms, Inc.', logo: 'https://logo.clearbit.com/meta.com', price: null, change: null },
            { name: 'MARA Holdings, Inc.', symbol: 'MARA',logo: 'https://ml.globenewswire.com/Resource/Download/c6f90e85-d59a-4fb2-9c10-de6e48201994', price: null, change: null },
            { symbol: 'RIOT', name: 'Riot Platforms, Inc.', logo: 'https://logo.clearbit.com/riotblockchain.com', price: null, change: null },
            { name: 'Novavax, Inc.', symbol: 'NVAX', logo: 'https://logo.clearbit.com/novavax.com', price: null, change: null }
        ];
        const container = document.getElementById('dashboard-grid');

        async function init() {
            if (!container) {
                console.error('Missing #dashboard-grid element');
                return;
            }
            container.innerHTML = '';

            console.log('Starting fetch dashboard data...');
            const quotes = await Promise.all(stocks.map(s => fetchQuote(s.symbol)));
            console.log('Dashboard data fetch completed.');


            stocks.forEach((stock, idx) => {
                const quote = quotes[idx];

                 if (quote) {
                    stock.price = parseFloat(quote['05. price']);
                    stock.change = parseFloat(quote['10. change percent'].replace('%', ''));

                    const card = document.createElement('div');
                    card.className = 'card';
                    const isPositive = stock.change >= 0;
                    const logoClass = stock.symbol === 'MSTR' ? 'strategy-logo' : '';

                    card.innerHTML = `
                        <div class="card-header">
                            <div class="card-logo">
                                <img src="${stock.logo}" alt="${stock.name} logo" class="${logoClass}" loading="lazy" onerror="this.onerror=null; this.src='assets/logo.png'; this.classList.remove('${logoClass}');"> </div>
                            <div class="card-title"><h3>${stock.name}</h3><p>${stock.symbol}</p></div>
                        </div>
                        <div class="card-price">${formatCurrency(stock.price)}</div>
                        <div class="card-change ${isPositive ? 'positive' : 'negative'}">
                            <i class="fas fa-arrow-${isPositive ? 'up' : 'down'}"></i>${stock.change !== null ? Math.abs(stock.change).toFixed(2) + '%' : 'N/A'}
                        </div>
                        <div class="sparkline" id="sparkline-${stock.symbol.replace('.', '-') }"></div>
                    `;
                    container.appendChild(card);
                    if (stock.price !== null) {
                        chartManager.generateSparkline(`#sparkline-${stock.symbol.replace('.', '-')}`, isPositive);
                    }
                } else {
                    console.warn(`Could not load live data for ${stock.symbol}. Creating card with N/A data.`);
                    const card = document.createElement('div');
                    card.className = 'card card-error';
                    const logoClass = stock.symbol === 'MSTR' ? 'strategy-logo' : '';
                    card.innerHTML = `
                        <div class="card-header">
                             <div class="card-logo">
                                <img src="${stock.logo}" alt="${stock.name} logo" class="${logoClass}" loading="lazy" onerror="this.onerror=null; this.src='assets/logo.png'; this.classList.remove('${logoClass}');"> </div>
                            <div class="card-title"><h3>${stock.name}</h3><p>${stock.symbol}</p></div>
                        </div>
                        <div class="card-price">${formatCurrency(null)}</div>
                        <div class="card-change negative">
                            <i class="fas fa-exclamation-triangle"></i> Dati live non disponibili
                        </div>
                        <div class="sparkline"></div> `;
                    container.appendChild(card);
                }
            });
            console.log('Dashboard rendered with live data (some might be N/A due to API issues).');
        }
        init();
        return { refresh: init };
    })();

    // ========== STATS MANAGER ==========
    const statsManager = (function() {
        const updateStats = () => {
            const totalAssetsElement = document.getElementById('total-assets');
            if(totalAssetsElement) totalAssetsElement.textContent = portfolioManager.totalAssets;

            const topAssetElement = document.getElementById('top-asset');
            if(topAssetElement) topAssetElement.textContent = portfolioManager.maxWeight.toFixed(2) + '%';

            const diversificationElement = document.getElementById('diversification');
             if(diversificationElement) diversificationElement.textContent = portfolioManager.diversificationScore + '%';

            const now = new Date();
            const formattedTime = formatDate(now, true);

            const lastUpdateElement = document.getElementById('last-update');
             if(lastUpdateElement) lastUpdateElement.textContent = formattedTime;

            const timestampElement = document.getElementById('timestamp');
            if(timestampElement) timestampElement.textContent = formattedTime;
        };

        setTimeout(updateStats, 100);
        return { update: statsManager.update };
    })();


    // ========== BUTTON HANDLERS ==========
    (function() {
        document.getElementById('export-pdf')?.addEventListener('click', function() {
            const btn = this;
            btn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Generando...';
            btn.disabled = true;
            setTimeout(() => {
                btn.innerHTML = '<i class="fas fa-check"></i> Report pronto!';
                setTimeout(() => { btn.innerHTML = '<i class="fas fa-file-pdf"></i> Esporta Report'; btn.disabled = false; }, 2000);
            }, 1500);
        });

        document.getElementById('refresh-data')?.addEventListener('click', async function() {
            const btn = this;
            const originalContent = btn.innerHTML;
            btn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Aggiornamento...';
            btn.disabled = true;

            console.log('Aggiornamento dati in corso...');

            statsManager.update();
            await dashboardManager.refresh();

             // Non serve più ottenere il timeframe attivo, chiamiamo renderGecHistoricalChart senza parametri specifici
             if (chartManager.renderGecHistoricalChart) {
                 await chartManager.renderGecHistoricalChart(); // Chiamata senza parametro, userà i dati dal file
             } else {
                 console.warn("chartManager.renderGecHistoricalChart is not available for update.");
             }

            console.log('Aggiornamento dati completato.');

            btn.innerHTML = '<i class="fas fa-check"></i> Dati aggiornati!';
            setTimeout(() => {
                 btn.innerHTML = originalContent;
                 btn.disabled = false;
            }, 1500);
        });
    })();


    // ========== RESPONSIVE CHARTS ON RESIZE ==========
    window.addEventListener('resize', function() {
        if (window.ApexCharts) {
            const donutChartElement = document.querySelector('#donut-chart');
            if (donutChartElement && chartManager.donutChart) {
                chartManager.donutChart.updateOptions({
                    chart: {
                        width: donutChartElement.offsetWidth,
                        height: donutChartElement.offsetHeight
                    }
                }, false, false);
            }

            const gecChartElement = document.querySelector('#gec-historical-chart');
            if (gecChartElement && chartManager.gecHistoricalChart) {
                gecHistoricalChart.updateOptions({ // Usiamo gecHistoricalChart direttamente per l'istanza esistente
                     chart: {
                        width: gecChartElement.offsetWidth,
                        height: 300 // Mantieni l'altezza fissa
                    }
                }, false, false);
            }
        }
    });

    setTimeout(() => {
        window.dispatchEvent(new Event('resize'));
    }, 100);

});