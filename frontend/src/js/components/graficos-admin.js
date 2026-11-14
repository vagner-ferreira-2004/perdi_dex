/* ============================================================
   CONFIGURAÇÃO DE CORES POR TEMA (CLARO / ESCURO)
============================================================ */
function getCorTexto() {
    const isDark = document.documentElement.getAttribute('data-theme') === 'dark';
    
    // Cores dos textos / rótulos
    const corModoClaro  = '#8b8b8b';
    const corModoEscuro = '#e7e7e7';
    
    return isDark ? corModoEscuro : corModoClaro;
}

function getCorGrid() {
    const isDark = document.documentElement.getAttribute('data-theme') === 'dark';
    
    // Cores das linhas horizontais de fundo (eixo Y)
    const gridModoClaro  = 'rgba(0, 0, 0, 0.08)';
    const gridModoEscuro = 'rgba(255, 255, 255, 0.15)';
    
    return isDark ? gridModoEscuro : gridModoClaro;
}

const corAtual = getCorTexto();
const corGridAtual = getCorGrid();



/* ============================================================
   1. PERCENTUAL DOS ITENS (Doughnut Chart)
============================================================ */
const ctx = document.getElementById('cadastrosChart');

const chartCadastros = new Chart(ctx, {
    type: 'doughnut',
    data: {
        labels: [],
        datasets: [{
            label: 'Quantidade',
            data: [],
            backgroundColor: ['#97e3b8', '#ffac65', '#cd1b31', '#5e2697', '#169ad8'],
            borderWidth: 0,
            hoverOffset: 12, 
        }]
    },
    plugins: [ChartDataLabels],
    options: {
        cutout: '45%', 
        maintainAspectRatio: false,
        animation: {
            animateScale: true, 
            animateRotate: true, 
            duration: 1500 
        },
        layout: {
            padding: { top: 20, bottom: 10, left: 1, right: 1 }
        },
        plugins: {
            legend: {
                position: 'bottom',
                title: {
                    display: true,
                    text: '', 
                    padding: { top: 5 }
                },
                labels: {
                    color: corAtual,
                    padding: 15,
                    usePointStyle: true, 
                    pointStyle: 'circle',
                    font: {
                        family: 'Poppins',
                        size: 11,
                        weight: '500'
                    }
                }
            },
            tooltip: {
                backgroundColor: 'rgba(11, 24, 100, 0.8)',
                padding: 12,
                titleFont: { family: 'Poppins', size: 12 },
                bodyFont: { family: 'Poppins', size: 12 },
                displayColors: true, 
                usePointStyle: true, 
                boxPadding: 6,       
                callbacks: {
                    labelColor: function(context) {
                        return {
                            borderColor: 'transparent',
                            backgroundColor: context.dataset.backgroundColor[context.dataIndex],
                        };
                    },
                    label: function(context) {
                        let value = context.raw;
                        let total = context.chart._metasets[context.datasetIndex].total;
                        let percentage = (total ? (value / total) * 100 : 0).toFixed(1) + '%';
                        return `${value} itens (${percentage})`;
                    }
                }
            },
            datalabels: {
                color: corAtual,
                anchor: 'end',
                align: 'end',
                offset: 4,
                clip: false,
                font: {
                    family: 'Poppins',
                    size: 11,
                    weight: '500'
                },
                formatter: (value, context) => {
                    const data = context.chart.data.datasets[0].data;
                    const total = data.reduce((acc, val) => acc + val, 0);
                    const porcentagem = total ? (value / total) * 100 : 0;
                    return porcentagem.toFixed(1) + '%';
                }
            }
        }
    }
});

window.addEventListener('perdidexDashboardData', (event) => {
    const stats = event.detail;
    chartCadastros.data.labels = Object.keys(stats.byCategory);
    chartCadastros.data.datasets[0].data = Object.values(stats.byCategory);
    chartCadastros.update();

    chartProgresso.data.datasets[0].data = [stats.published, stats.returned];
    chartProgresso.update();

    chartMes.data.datasets[0].data = stats.byMonth;
    chartMes.data.datasets[1].data = stats.returnedByMonth;
    chartMes.update();
});


/* ============================================================
   2. STATUS DOS ITENS (Pie Chart)
============================================================ */
const progressoCtx = document.getElementById('progressoChart');

const chartProgresso = new Chart(progressoCtx, {
    type: 'pie',
    data: {
        labels: ['Publicados', 'Devolvidos'],
        datasets: [{
            label: 'Quantidade',
            data: [0, 0],
            backgroundColor: ['#e2374b', '#3ac0e9'],
            borderWidth: 0,
            hoverOffset: 12, 
        }]
    },
    plugins: [ChartDataLabels],
    options: {
        devicePixelRatio: window.devicePixelRatio || 2, // Garante resolução nítida
        cutout: '0%', 
        maintainAspectRatio: false,
        animation: {
            animateScale: true, 
            animateRotate: true, 
            duration: 1500 
        },
        layout: {
            padding: { top: 30, bottom: 30, left: 5, right: 5 }
        },
        plugins: {
            legend: {
                position: 'bottom',
                labels: {
                    color: corAtual,
                    padding: 20,
                    usePointStyle: true, 
                    pointStyle: 'circle',
                    font: {
                        family: 'Poppins',
                        size: 11,
                        weight: '500'
                    }
                }
            },
            tooltip: {
                backgroundColor: 'rgba(11, 24, 100, 0.8)',
                padding: 12,
                titleFont: { family: 'Poppins', size: 12 },
                bodyFont: { family: 'Poppins', size: 12 },
                displayColors: true, 
                usePointStyle: true, 
                boxPadding: 6,       
                callbacks: {
                    labelColor: function(context) {
                        return {
                            borderColor: 'transparent',
                            backgroundColor: context.dataset.backgroundColor[context.dataIndex],
                        };
                    },
                    label: function(context) {
                        let value = context.raw;
                        let total = context.chart._metasets[context.datasetIndex].total;
                        let percentage = (total ? (value / total) * 100 : 0).toFixed(1) + '%';
                        return `${value} itens (${percentage})`;
                    }
                }
            },
            datalabels: {
                color: corAtual,
                anchor: 'end',
                align: 'end',
                offset: 4,
                clip: false,
                font: {
                    family: 'Poppins',
                    size: 11,
                    weight: '500'
                },
                formatter: (value, context) => {
                    const data = context.chart.data.datasets[0].data;
                    const total = data.reduce((acc, val) => acc + val, 0);
                    const porcentagem = total ? (value / total) * 100 : 0;
                    return porcentagem.toFixed(1) + '%';
                }
            }
        }
    }
});


/* ============================================================
   3. ITENS POR MÊS (Line Chart)
============================================================ */
const mesCtx = document.getElementById('mesChart');
const meses = ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez'];

const chartMes = new Chart(mesCtx, {
    type: 'line',
    data: {
        labels: meses,
        datasets: [
            {
                label: 'Itens cadastrados',
                data: Array(12).fill(0),
                borderColor: '#e2374b',
                backgroundColor: '#e2374b',
                borderWidth: 3,
                tension: 0.4,
                pointRadius: 4,
                pointHoverRadius: 8
            },
            {
                label: 'Itens devolvidos',
                data: Array(12).fill(0),
                borderColor: '#3ac0e9',
                backgroundColor: '#3ac0e9',
                borderWidth: 3,
                tension: 0.4,
                pointRadius: 4,
                pointHoverRadius: 8
            }
        ]
    },
    options: {
        responsive: true,
        maintainAspectRatio: false, 
        interaction: {
            mode: 'nearest',
            intersect: true,
        },
        layout: {
            padding: { bottom: 10 }
        },
        plugins: {
            legend: {
                display: true,
                position: 'top',
                labels: {
                    usePointStyle: true, 
                    pointStyle: 'circle', 
                    boxWidth: 8, 
                    boxHeight: 8,
                    padding: 25,   
                    color: corAtual,
                    font: {
                        family: 'Poppins',
                        size: 11,
                        weight: '500'
                    },
                }
            },
            tooltip: {
                backgroundColor: 'rgba(11, 24, 100, 0.8)',
                padding: 12,
                boxPadding: 8,
                usePointStyle: true,
                titleFont: { family: 'Poppins', size: 14 },
                bodyFont: { family: 'Poppins', size: 13 },
                callbacks: {
                    title: function(tooltipItems) {
                        const mesesCompletos = {
                            'Jan': 'Janeiro', 'Fev': 'Fevereiro', 'Mar': 'Março',
                            'Abr': 'Abril', 'Mai': 'Maio', 'Jun': 'Junho',
                            'Jul': 'Julho', 'Ago': 'Agosto', 'Set': 'Setembro',
                            'Out': 'Outubro', 'Nov': 'Novembro', 'Dez': 'Dezembro'
                        };
                        const mesAbreviado = tooltipItems[0].label;
                        const nomeCompleto = mesesCompletos[mesAbreviado] || mesAbreviado;  
                        return `${nomeCompleto} de 2026`;
                    },
                    label: function(context) {
                        const valor = context.raw;
                        const titulo = context.dataset.label.toLowerCase(); 
                        return `${valor} itens ${titulo}`; 
                    }
                }
            },
            zoom: {
                pan: { enabled: true, mode: 'x' },
                zoom: {
                    wheel: { enabled: true },
                    pinch: { enabled: true },
                    mode: 'x', 
                }
            }
        },
        scales: {
            x: {
                offset: true,
                min: meses.length - 6, 
                max: meses.length - 1,
                grid: { display: false },
                ticks: {
                    font: { family: 'Poppins', size: 11 },
                    color: corAtual
                }
            },
            y: {
                beginAtZero: true,
                border: { display: false },
                grid: {
                    color: corGridAtual,
                    drawBorder: false
                },
                ticks: {
                    stepSize: 5,
                    font: { family: 'Poppins', size: 11 },
                    color: corAtual
                }
            }
        }
    }
});


/* ============================================================
   4. ATUALIZAÇÃO AUTOMÁTICA AO TROCAR DE TEMA
============================================================ */
function atualizarCoresGraficos() {
    const novaCor = getCorTexto();
    const novaCorGrid = getCorGrid();

    // Atualiza Doughnut
    chartCadastros.options.plugins.legend.labels.color = novaCor;
    chartCadastros.options.plugins.datalabels.color = novaCor;
    chartCadastros.update();

    // Atualiza Pie
    chartProgresso.options.plugins.legend.labels.color = novaCor;
    chartProgresso.options.plugins.datalabels.color = novaCor;
    chartProgresso.update();

    // Atualiza Linhas (Textos e Grade horizontal)
    chartMes.options.plugins.legend.labels.color = novaCor;
    chartMes.options.scales.x.ticks.color = novaCor;
    chartMes.options.scales.y.ticks.color = novaCor;
    chartMes.options.scales.y.grid.color = novaCorGrid;
    chartMes.update();
}

// Monitora alterações na tag <html data-theme="...">
const observerTema = new MutationObserver((mutations) => {
    mutations.forEach((mutation) => {
        if (mutation.type === 'attributes' && mutation.attributeName === 'data-theme') {
            atualizarCoresGraficos();
        }
    });
});

observerTema.observe(document.documentElement, { attributes: true });