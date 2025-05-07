// script.js

document.addEventListener('DOMContentLoaded', function() {
    // ========== INITIALIZATION ==========
    console.log('GEC Innovation Strategy - Dashboard loaded');

    // Recupera i valori delle variabili CSS definite nel :root
    // Questo è un modo per usare i colori definiti nel CSS in JS
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
        // Cerca di creare un oggetto Date se l'input non lo è già
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
        // Usiamo 'en-US' per il formato del mese corto standard (es. Apr anziché apr)
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
                     // Aggiusta il padding del main in base all'altezza dell'header
                     const mainContent = document.getElementById('main-content');
                     if (mainContent) {
                         // Usa requestAnimationFrame per assicurarsi che l'header abbia la sua altezza finale
                         requestAnimationFrame(() => {
                            mainContent.style.paddingTop = `${header.offsetHeight + 20}px`; // 20px di margine extra
                         });
                     }
                 }
                // Rimuovi l'elemento splash screen dal DOM dopo la transizione
                splash.addEventListener('transitionend', () => {
                     splash.remove();
                     console.log('Splash screen removed');
                }, { once: true }); // Rimuovi l'listener dopo che si attiva una volta
            }
        };
        // Assicurati che la splash screen sia mostrata per almeno 3 secondi
        setTimeout(hideSplash, 3000);
    })();


    // ========== PORTFOLIO DATA MANAGER ==========
    const portfolioManager = (function() {
        // Ho allineato i nomi qui con quelli usati nella tabella HTML e dashboard
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
            if (weights.length === 0) return 0; // Evita divisione per zero
            const sumSq = weights.reduce((sum, w) => sum + Math.pow(w, 2), 0);
            const hhi_normalized = sumSq / 10000;
            // Calcola un punteggio da 0 (massima concentrazione) a 100 (ipotetica massima diversificazione)
            // Questo è un indice semplificato
            return Math.round(Math.max(0, (1 - hhi_normalized) * 100)); // Assicura che il punteggio non sia negativo
        };


        // Calcola la performance 2025 (questo è un dato statico nell'HTML originale, potresti volerlo rendere dinamico)
        // Per ora, leggiamo il valore dall'HTML o usiamo un valore fisso
        const getPerformance2025 = () => {
             const perfElement = document.getElementById('performance-2025');
             if (perfElement) {
                 // Rimuove +, % e , per fare il parsing, gestisce anche spazi e altri caratteri non numerici
                 const text = perfElement.textContent.replace(/[^\d,\.\+\-]/g, '').replace(',', '.').trim();
                 return parseFloat(text);
             }
             return null; // O un valore di default, es. 0
        };


        return {
            data,
            totalAssets: data.length,
            maxWeight: data.length > 0 ? Math.max(...data.map(item => item.weight)) : 0, // Gestisce portfolio vuoto
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
                height: '100%', // Usa altezza 100% del contenitore
                width: '100%', // Usa larghezza 100% del contenitore
                parentHeightOffset: 0, // Importante per l'altezza flessibile
                id: 'donut-chart-instance' // Aggiungi un ID per poterlo riferire con ApexCharts.exec
            },
            labels: portfolioManager.data.map(item => item.name),
            colors: portfolioManager.data.map(item => item.color), // Questi colori sono già esadecimali
            legend: {
                position: 'bottom',
                horizontalAlign: 'center',
                labels: { colors: textLightColor } // Usa la variabile JS con il colore
            },
            plotOptions: { pie: { donut: { size: '65%' } } },
            dataLabels: { enabled: false },
            tooltip: { theme: 'dark' } // Tema scuro per tooltip
        };
        const donutChartElement = document.querySelector('#donut-chart');
        let donutChart = null; // Dichiara la variabile per il grafico a ciambella

        if (donutChartElement) {
             donutChart = new ApexCharts(donutChartElement, donutChartOptions);
             donutChart.render();
        } else {
             console.error('Element #donut-chart not found.');
        }


        // === Funzione per generare lo sparkline ===
        const generateSparkline = (selector, positive) => {
            const sparkData = Array.from({ length: 15 }, () => Math.random() * 100); // Dati di esempio
             const sparklineElement = document.querySelector(selector);
             if (!sparklineElement) {
                 console.warn(`Sparkline element "${selector}" not found.`);
                 return;
             }

             // Evita di renderizzare se non ci sono dati per lo sparkline
             if (!sparkData || sparkData.length === 0) {
                 sparklineElement.innerHTML = '<p style="color:var(--text-secondary); text-align:center; font-size:0.8rem;">Dati sparkline non disponibili</p>';
                 return;
             }

            new ApexCharts(sparklineElement, {
                series: [{ data: sparkData }],
                chart: { type: 'line', width: '100%', height: 50, sparkline: { enabled: true }, animations: { enabled: false } },
                stroke: { curve: 'smooth', width: 2 },
                fill: { opacity: 0.1 },
                tooltip: { enabled: false },
                colors: [positive ? positiveColor : negativeColor] // Usa variabili JS con i colori
            }).render();
        };

        // === NUOVO: Grafico storico per l'indice GEC ===
        let gecHistoricalChart = null; // Variabile per mantenere l'istanza del grafico storico

        async function renderGecHistoricalChart() {
            const chartElement = document.querySelector('#gec-historical-chart');
            if (!chartElement) {
                console.error('Element #gec-historical-chart not found.');
                return;
            }

            // ** Importante **
            // QUI DEVI RECUPERARE I DATI STORICI REALI PER L'ISIN DE000SL0L1D2
            // DA UN'API (come Alpha Vantage se supportato per indici/ETFs o un'altra fonte)
            // O DA DATI SALVATI.
            // Sostituisci i dati di esempio con i dati reali.
            // Assicurati che i dati siano in un formato che ApexCharts può usare,
            // tipicamente un array di oggetti { x: timestamp o data stringa, y: valore }.

            console.log('Tentativo di caricare dati storici per DE000SL0L1D2...');

            // Dati di esempio (Sostituisci con la chiamata API reale)
            // Esempio di dati che potrebbero provenire da una API storica (formato Time Series Daily Adjusted di Alpha Vantage)
            // Dovresti adattare il codice per parsare la risposta API reale.
            // Esempio di struttura dati grezzi dall'API:
            /*
            const apiDataRaw = await fetch('LA_TUA_API_ENDPOINT_PER_DATI_STORICI').then(res => res.json());
            const formattedData = parseHistoricalData(apiDataRaw); // Devi implementare parseHistoricalData per la tua API
            */

            // Funzione di esempio per parsare dati storici (adatta alla tua fonte dati reale)
            function parseHistoricalData(rawData) {
                const data = [];
                // Esempio ipotetico per dati Alpha Vantage Time Series (Daily)
                // if (rawData && rawData["Time Series (Daily)"]) {
                //     const timeSeries = rawData["Time Series (Daily)"];
                //     for (const date in timeSeries) {
                //         if (timeSeries.hasOwnProperty(date)) {
                //             const closePrice = parseFloat(timeSeries[date]["4. close"]);
                //             if (!isNaN(closePrice)) {
                //                 data.push({
                //                     x: new Date(date).getTime(),
                //                     y: closePrice
                //                 });
                //             }
                //         }
                //     }
                // }
                // Ordina i dati per data crescente per il grafico
                // data.sort((a, b) => a.x - b.x);
                // return data;

                // Attualmente, usiamo i dati di esempio hardcoded:
                const historicalData = [
                    { x: new Date('2024-01-01').getTime(), y: 950 },
                    { x: new Date('2024-02-01').getTime(), y: 965 },
                    { x: new Date('2024-03-01').getTime(), y: 980 },
                    { x: new Date('2024-04-01').getTime(), y: 975 },
                    { x: new Date('2024-05-01').getTime(), y: 990 },
                    { x: new Date('2024-06-01').getTime(), y: 1010 },
                    { x: new Date('2024-07-01').getTime(), y: 1030 },
                    { x: new Date('2024-08-01').getTime(), y: 1025 },
                    { x: new Date('2024-09-01').getTime(), y: 1040 },
                    { x: new Date('2024-10-01').getTime(), y: 1060 },
                    { x: new Date('2024-11-01').getTime(), y: 1055 },
                    { x: new Date('2024-12-01').getTime(), y: 1070 },
                    { x: new Date('2025-01-01').getTime(), y: 1080 },
                    { x: new Date('2025-02-01').getTime(), y: 1075 },
                    { x: new Date('2025-03-01').getTime(), y: 1090 },
                    { x: new Date('2025-04-01').getTime(), y: 1085 },
                    { x: new Date('2025-05-01').getTime(), y: 1061.49 } // Esempio dato attuale
                ];
                 // Assicurati che ci siano dati prima di ritornarli
                 if (historicalData.length === 0) {
                     console.warn("Nessun dato storico disponibile per il grafico GEC.");
                     return [];
                 }
                return historicalData; // Restituisce i dati di esempio
            }

            const formattedData = parseHistoricalData(null); // Usa i dati di esempio per ora

            // Non renderizzare il grafico se non ci sono dati
            if (formattedData.length === 0) {
                 chartElement.innerHTML = '<p style="color:var(--text-secondary); text-align:center; font-size:1rem;">Dati storici non disponibili per questo indice.</p>';
                 if (gecHistoricalChart) {
                    gecHistoricalChart.destroy();
                    gecHistoricalChart = null;
                 }
                 return;
            }


            const gecHistoricalChartOptions = {
                series: [{
                    name: 'Valore Indice', // Nome della serie (puoi cambiarlo)
                    data: formattedData
                }],
                chart: {
                    type: 'line',
                    height: 300, // Altezza fissa per questo grafico (o rendila dinamica)
                    width: '100%',
                    toolbar: { show: true, tools: { download: true, selection: false, zoom: true, pan: true, reset: true } }, // Abilita toolbar
                    zoom: { enabled: true }, // Abilita zoom sull'asse X
                    animations: { enabled: true, easing: 'easeinout', speed: 800 },
                    id: 'gec-historical-chart-instance' // Aggiungi un ID per ApexCharts.exec
                },
                colors: [primaryColor], // Usa la variabile JS con il colore
                stroke: { curve: 'smooth', width: 2 },
                grid: {
                     show: true,
                     borderColor: bgTertiaryColor, // Usa la variabile JS con il colore
                     strokeDashArray: 4,
                     position: 'back'
                 },
                xaxis: {
                    type: 'datetime',
                    labels: { style: { colors: textSecondaryColor } }, // Usa la variabile JS con il colore
                    axisBorder: { show: false },
                    axisTicks: { show: false }
                },
                yaxis: {
                    labels: { style: { colors: textSecondaryColor } }, // Usa la variabile JS con il colore
                    opposite: false // Mostra l'asse Y a sinistra
                },
                tooltip: {
                    x: { format: 'dd MMM yyyy' }, // Formato data nel tooltip
                    theme: 'dark', // Usa il tema scuro del tooltip
                     y: {
                        formatter: function (value) {
                            return value ? value.toFixed(2) : 'N/A'; // Formatta il valore Y
                        }
                     }
                },
                dataLabels: { enabled: false }
            };

            if (gecHistoricalChart) {
                gecHistoricalChart.destroy(); // Distruggi il vecchio grafico prima di renderizzarne uno nuovo (utile per aggiornamenti)
            }

            gecHistoricalChart = new ApexCharts(chartElement, gecHistoricalChartOptions);
            gecHistoricalChart.render();
            console.log('Grafico storico GEC Innovation Index renderizzato (con dati di esempio).');
        }

        // Chiama la funzione per renderizzare il grafico storico all'avvio
        renderGecHistoricalChart();


        return {
            generateSparkline,
            renderGecHistoricalChart, // Esponi la funzione se vuoi poterla chiamare esternamente (es. per aggiornare)
            donutChart, // Esponi anche il grafico a ciambella per il resize
            gecHistoricalChart // Esponi l'istanza del grafico storico
        };
    })();


    // ========== STATS MANAGER ==========
    const statsManager = (function() {
        const updateStats = () => {
            // Aggiorna i valori delle statistiche dai dati del portfolioManager (che sono hardcoded)
            // Aggiungi controlli per assicurarti che gli elementi esistano
            const totalAssetsElement = document.getElementById('total-assets');
            if(totalAssetsElement) totalAssetsElement.textContent = portfolioManager.totalAssets;

            const topAssetElement = document.getElementById('top-asset');
            if(topAssetElement) topAssetElement.textContent = portfolioManager.maxWeight.toFixed(2) + '%';

            const diversificationElement = document.getElementById('diversification');
             if(diversificationElement) diversificationElement.textContent = portfolioManager.diversificationScore + '%';

             // La performance 2025 è statica nell'HTML originale, non viene aggiornata qui a meno che tu non la renda dinamica
             // Se volessi aggiornarla dinamicamente:
             // const performanceElement = document.getElementById('performance-2025');
             // if(performanceElement && portfolioManager.performance2025 !== null) {
             //     performanceElement.textContent = (portfolioManager.performance2025 >= 0 ? '+' : '') + portfolioManager.performance2025.toFixed(2) + '%';
             // }


             // Aggiorna il timestamp corrente
            const now = new Date();
            const formattedTime = formatDate(now, true);

            const lastUpdateElement = document.getElementById('last-update');
             if(lastUpdateElement) lastUpdateElement.textContent = formattedTime;

            const timestampElement = document.getElementById('timestamp');
            if(timestampElement) timestampElement.textContent = formattedTime;
        };

         // Esegui l'aggiornamento iniziale con un piccolo ritardo per permettere al DOM di caricarsi
        setTimeout(updateStats, 100);
        return { update: updateStats };
    })();


    // ========== ALPHA VANTAGE CONFIGURATION ==========
    // ** Nota sulla sicurezza: la chiave API è esposta qui. **
    // ** Si raccomanda VIVAMENTE di gestirla lato server in produzione. **
    const apiKey = 'LORHIOHX8N5W8HPU';
    const baseUrl = 'https://www.alphavantage.co/query?function=GLOBAL_QUOTE'; // Endpoint per quotazioni attuali
    const alphaVantageApiLimit = 5; // Limite di richieste per minuto per la free API

    // Funzione per recuperare quotazione singola
    async function fetchQuote(symbol) {
        // Aggiunge un piccolo ritardo per rispettare i limiti di frequenza delle API
        // Per 10 titoli, 1.5s tra le chiamate dovrebbe mantenere entro il limite dei 5/min
        // Considera un meccanismo più robusto in produzione (coda di richieste, gestione errori limite)
        await new Promise(resolve => setTimeout(resolve, 1500)); // 1.5 secondi di ritardo tra le chiamate

        const url = `${baseUrl}&symbol=${symbol}&apikey=${apiKey}`;
        try {
            console.log(`Workspaceing quote for ${symbol}...`);
            const response = await fetch(url);

            if (!response.ok) {
                console.error(`Errore HTTP! status: ${response.status} per ${symbol}`);
                // Tenta di leggere la risposta per dettagli sull'errore
                try {
                    const errorText = await response.text();
                    console.error(`Dettagli errore per ${symbol}: ${errorText}`);
                } catch (e) {
                     console.error(`Impossibile leggere il corpo dell'errore per ${symbol}.`);
                }
                return null;
            }

            const data = await response.json();

             // Controlla se la risposta contiene dati validi e non un messaggio di errore API
             if (data && data['Global Quote'] && data['Global Quote']['05. price']) {
                 // console.log(`Dati ricevuti per ${symbol}:`, data['Global Quote']);
                return data['Global Quote'];
            } else {
                 // Potrebbe essere un messaggio di errore dall'API (es. limite raggiunto, simbolo non trovato)
                 console.warn(`Dati quotazione non validi, mancanti o errore API per ${symbol}:`, data);
                 // Controlla se c'è un messaggio di errore esplicito da Alpha Vantage
                 if (data["Note"] && data["Note"].includes("API call frequency")) {
                     console.error(`Limite chiamate API Alpha Vantage raggiunto per ${symbol}. Attendi un minuto.`);
                     // Potresti voler implementare una logica di retry qui
                 } else if (data["Error Message"]) {
                      console.error(`Messaggio di errore API per ${symbol}: ${data["Error Message"]}`);
                 }
                return null; // Ritorna null se i dati non sono validi
            }
        } catch (error) {
            console.error(`Errore fetch per ${symbol}:`, error);
            return null;
        }
    }


    // ========== DASHBOARD MANAGER ==========
    const dashboardManager = (function() {
         // Ho allineato i nomi qui con quelli usati nel portfolioManager e nella tabella HTML
        const stocks = [
            { symbol: 'LQQ.PA',  name: 'LYXOR NASDAQ 100 DAILY LEV', logo: 'https://logo.clearbit.com/nasdaq.com', price: null, change: null }, // Inizializza con null
            { symbol: 'MSTR', name: 'MicroStrategy Inc.', logo: 'https://logo.clearbit.com/microstrategy.com', price: null, change: null },
            { symbol: 'TSLA', name: 'Tesla, Inc.', logo: 'https://logo.clearbit.com/tesla.com', price: null, change: null },
            { symbol: 'NVDA', name: 'NVIDIA Corp.', logo: 'https://logo.clearbit.com/nvidia.com', price: null, change: null },
            { symbol: 'AMZN', name: 'Amazon.com, Inc.', logo: 'https://logo.clearbit.com/amazon.com', price: null, change: null },
            { symbol: 'GOOG', name: 'Alphabet Inc. (Class A)', logo: 'https://logo.clearbit.com/google.com', price: null, change: null },
            { symbol: 'META', name: 'Meta Platforms, Inc.', logo: 'https://logo.clearbit.com/meta.com', price: null, change: null },
            { symbol: 'MARA', name: 'MARA Holdings, Inc.',logo: 'https://ml.globenewswire.com/Resource/Download/c6f90e85-d59a-4fb2-9c10-de6e48201994', price: null, change: null }, // Questo URL logo sembra specifico e potrebbe rompersi
            { symbol: 'RIOT', name: 'Riot Platforms, Inc.', logo: 'https://logo.clearbit.com/riotblockchain.com', price: null, change: null },
            { symbol: 'NVAX', name: 'Novavax, Inc.', logo: 'https://logo.clearbit.com/novavax.com', price: null, change: null }
        ];
        const container = document.getElementById('dashboard-grid');

        async function init() {
            if (!container) {
                console.error('Missing #dashboard-grid element');
                return;
            }
            container.innerHTML = ''; // Pulisce il contenitore prima di riempirlo

            console.log('Inizio fetch dati dashboard...');
            // Esegui le chiamate API in parallelo ma con un piccolo ritardo tra ognuna gestito in fetchQuote
            const quotes = await Promise.all(stocks.map(s => fetchQuote(s.symbol)));
            console.log('Fetch dati dashboard completato.');


            stocks.forEach((stock, idx) => {
                const quote = quotes[idx]; // Ottieni la quotazione corrispondente

                 if (quote) { // Verifica che la quotazione sia stata recuperata con successo
                    stock.price = parseFloat(quote['05. price']);
                    stock.change = parseFloat(quote['10. change percent'].replace('%', ''));

                    const card = document.createElement('div');
                    card.className = 'card';
                    const isPositive = stock.change >= 0;
                    // Applica il filtro solo a MSTR se necessario
                    const logoClass = stock.symbol === 'MSTR' ? 'strategy-logo' : ''; // Mantenuto il filtro per MSTR

                    card.innerHTML = `
                        <div class="card-header">
                            <div class="card-logo">
                                <img src="${stock.logo}" alt="${stock.name} logo" class="${logoClass}" loading="lazy" onerror="this.onerror=null; this.src='assets/logo.png'; this.classList.remove('${logoClass}');"> </div>
                            <div class="card-title"><h3>${stock.name}</h3><p>${stock.symbol}</p></div>
                        </div>
                        <div class="card-price">${formatCurrency(stock.price)}</div>
                        <div class="card-change ${isPositive ? 'positive' : 'negative'}">
                            <i class="fas fa-arrow-${isPositive ? 'up' : 'down'}"></i>${Math.abs(stock.change).toFixed(2)}%
                        </div>
                        <div class="sparkline" id="sparkline-${stock.symbol.replace('.', '-') /* Sostituisci '.' con '-' per ID validi */}"></div>
                    `;
                    container.appendChild(card);
                     // Genera sparkline DOPO aver aggiunto la card al DOM
                     // Controlla se ci sono dati validi per generare lo sparkline
                    if (stock.price !== null) { // Assumendo che la presenza di prezzo indichi dati validi per sparkline (anche se qui usiamo dati casuali)
                        chartManager.generateSparkline(`#sparkline-${stock.symbol.replace('.', '-')}`, isPositive);
                    }
                } else {
                    console.warn(`Impossibile caricare i dati live per ${stock.symbol}. Creazione card con dati N/A.`);
                     // Crea una card con dati N/A se il fetch fallisce
                    const card = document.createElement('div');
                    card.className = 'card card-error'; // Potresti aggiungere una classe 'card-error' per stilizzarla diversamente
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
        init(); // Esegui la funzione di inizializzazione all'avvio
        return { refresh: init }; // Espone la funzione per aggiornare la dashboard
    })();

    // ========== BUTTON HANDLERS ==========
    (function() {
         // Gestore pulsante Esporta PDF (simulato)
        document.getElementById('export-pdf')?.addEventListener('click', function() { // Aggiunto ?. per controllo esistenza
            const btn = this;
            btn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Generando...';
            btn.disabled = true;
            setTimeout(() => {
                btn.innerHTML = '<i class="fas fa-check"></i> Report pronto!';
                setTimeout(() => { btn.innerHTML = '<i class="fas fa-file-pdf"></i> Esporta Report'; btn.disabled = false; }, 2000);
            }, 1500);
        });

        // Gestore pulsante Aggiorna Dati
        document.getElementById('refresh-data')?.addEventListener('click', async function() { // Aggiunto ?. per controllo esistenza
            const btn = this;
            // Salva il contenuto originale del pulsante per ripristinarlo
            const originalContent = btn.innerHTML;
            btn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Aggiornamento...';
            btn.disabled = true;

            console.log('Aggiornamento dati in corso...');

            // Aggiorna le statistiche (basate su dati hardcoded + timestamp)
            statsManager.update();

            // Aggiorna i dati live della dashboard
            await dashboardManager.refresh();

            // Aggiorna il grafico storico dell'indice GEC
            // Abilita la riga seguente SE hai implementato il fetch dati reali
            // await chartManager.renderGecHistoricalChart();

            console.log('Aggiornamento dati completato.');

            btn.innerHTML = '<i class="fas fa-check"></i> Dati aggiornati!';
            // Ripristina il pulsante dopo un breve ritardo
            setTimeout(() => {
                 btn.innerHTML = originalContent; // Ripristina il contenuto originale (icona + testo)
                 btn.disabled = false;
                 // Aggiorna il timestamp dopo l'aggiornamento dei dati (già fatto in statsManager.update)
            }, 1500);
        });
    })();


    // ========== RESPONSIVE CHARTS ON RESIZE ==========
     // Funzione per gestire il resize dei grafici
    window.addEventListener('resize', function() {
        if (window.ApexCharts) {
             // Aggiorna il grafico a ciambella
            const donutChartElement = document.querySelector('#donut-chart');
            if (donutChartElement && chartManager.donutChart) { // Controlla che l'elemento e l'istanza esistano
                chartManager.donutChart.updateOptions({
                    chart: {
                        width: donutChartElement.offsetWidth,
                        height: donutChartElement.offsetHeight // Mantieni altezza del contenitore
                    }
                }, false, false); // terzo parametro false per non resettare lo stato dello zoom/pan
            }

             // Aggiorna il grafico storico GEC (se esiste)
            const gecChartElement = document.querySelector('#gec-historical-chart');
            if (gecChartElement && chartManager.gecHistoricalChart) { // Controlla che l'elemento e l'istanza esistano
                chartManager.gecHistoricalChart.updateOptions({
                     chart: {
                        width: gecChartElement.offsetWidth,
                        height: 300 // Mantieni l'altezza fissa o calcolala dinamicamente
                    }
                }, false, false); // terzo parametro false per non resettare lo stato dello zoom/pan
            }

             // Gli sparkline sono già gestiti da ApexCharts sparkline option
        }
    });

     // Chiama la funzione di resize una volta all'avvio per assicurarsi che i grafici abbiano la dimensione corretta
     // Aggiungi un piccolo ritardo per assicurarti che l'header sia visibile e il main padding sia calcolato
    setTimeout(() => {
        window.dispatchEvent(new Event('resize'));
    }, 100); // Ritardo di 100ms

});