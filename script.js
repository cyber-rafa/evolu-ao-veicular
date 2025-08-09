// Função para scroll suave
function scrollToSection(sectionId) {
    const section = document.getElementById(sectionId);
    section.scrollIntoView({ behavior: 'smooth' });
}

// Animação da timeline ao fazer scroll
function animateTimeline() {
    const timelineItems = document.querySelectorAll('.timeline-item');
    
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('animate');
            }
        });
    }, {
        threshold: 0.3
    });
    
    timelineItems.forEach(item => {
        observer.observe(item);
    });
}

// Interatividade avançada do carro elétrico
function setupAdvancedInteractiveCar() {
    const components = document.querySelectorAll('.component-3d');
    const infoPanel = document.querySelector('.panel-content');
    const controlButtons = document.querySelectorAll('.control-btn');
    const carBody = document.querySelector('.car-body-3d');
    const energyParticles = document.querySelectorAll('.energy-particle');
    
    // Informações detalhadas dos componentes
    const componentInfo = {
        'battery-3d': {
            title: '🔋 Bateria de Íons de Lítio',
            description: 'Sistema de armazenamento de energia de alta capacidade',
            specs: [
                { label: 'Capacidade', value: '75-100 kWh' },
                { label: 'Voltagem', value: '400V' },
                { label: 'Vida útil', value: '8-10 anos' },
                { label: 'Carregamento', value: '0-80% em 30min' }
            ],
            color: '#28a745'
        },
        'motor-3d': {
            title: '⚙️ Motor Elétrico Síncrono',
            description: 'Converte energia elétrica em movimento rotacional',
            specs: [
                { label: 'Potência', value: '250-400 hp' },
                { label: 'Torque', value: '400-600 Nm' },
                { label: 'Eficiência', value: '95%' },
                { label: 'RPM máximo', value: '15.000' }
            ],
            color: '#dc3545'
        },
        'inverter-3d': {
            title: '🔄 Inversor de Potência',
            description: 'Converte corrente contínua em alternada',
            specs: [
                { label: 'Tipo', value: 'IGBT' },
                { label: 'Frequência', value: '10-20 kHz' },
                { label: 'Eficiência', value: '98%' },
                { label: 'Refrigeração', value: 'Líquida' }
            ],
            color: '#fd7e14'
        },
        'charger-3d': {
            title: '⚡ Sistema de Carregamento',
            description: 'Gerencia o carregamento da bateria',
            specs: [
                { label: 'Tipo AC', value: '7-22 kW' },
                { label: 'Tipo DC', value: '50-350 kW' },
                { label: 'Conectores', value: 'CCS/CHAdeMO' },
                { label: 'Proteção', value: 'IP67' }
            ],
            color: '#6f42c1'
        },
        'controller-3d': {
            title: '🧠 Controlador Principal',
            description: 'Gerencia toda a distribuição de energia',
            specs: [
                { label: 'Processador', value: '32-bit ARM' },
                { label: 'Memória', value: '512 MB' },
                { label: 'CAN Bus', value: '500 kbps' },
                { label: 'Atualizações', value: 'OTA' }
            ],
            color: '#17a2b8'
        }
    };
    
    // Função para mostrar informações do componente
    function showComponentInfo(componentClass) {
        const info = componentInfo[componentClass];
        if (!info) return;
        
        infoPanel.innerHTML = `
            <div class="component-details">
                <div class="component-header">
                    <h4 style="color: ${info.color}; margin-bottom: 0.5rem;">${info.title}</h4>
                    <p style="color: #666; margin-bottom: 1.5rem;">${info.description}</p>
                </div>
                <div class="component-specs">
                    ${info.specs.map(spec => `
                        <div class="spec-item">
                            <span class="spec-label">${spec.label}:</span>
                            <span class="spec-value" style="color: ${info.color};">${spec.value}</span>
                        </div>
                    `).join('')}
                </div>
                <div class="component-status">
                    <div class="status-bar">
                        <div class="status-fill" style="background: ${info.color};"></div>
                    </div>
                    <span class="status-text">Sistema Operacional</span>
                </div>
            </div>
        `;
        
        // Animar a barra de status
        setTimeout(() => {
            const statusFill = infoPanel.querySelector('.status-fill');
            if (statusFill) {
                statusFill.style.width = '85%';
            }
        }, 100);
    }
    
    // Eventos dos componentes
    components.forEach(component => {
        component.addEventListener('mouseenter', () => {
            const componentClass = Array.from(component.classList).find(cls => cls.endsWith('-3d'));
            showComponentInfo(componentClass);
            component.classList.add('active');
            
            // Ativar partículas de energia
            energyParticles.forEach(particle => {
                particle.style.animationPlayState = 'running';
            });
        });
        
        component.addEventListener('mouseleave', () => {
            component.classList.remove('active');
        });
        
        component.addEventListener('click', () => {
            // Efeito de clique
            component.style.transform = 'translateZ(40px) scale(1.3)';
            setTimeout(() => {
                component.style.transform = '';
            }, 200);
        });
    });
    
    // Controles do carro
    controlButtons.forEach(button => {
        button.addEventListener('click', () => {
            const action = button.getAttribute('data-action');
            handleCarAction(action);
        });
    });
    
    function handleCarAction(action) {
        switch(action) {
            case 'start':
                startCarSystem();
                break;
            case 'charge':
                simulateCharging();
                break;
            case 'drive':
                simulateDriving();
                break;
            case 'reset':
                resetCarSystem();
                break;
        }
    }
    
    function startCarSystem() {
        carBody.style.animation = 'carStartup 2s ease-in-out';
        
        // Ativar componentes sequencialmente
        const componentOrder = ['.controller-3d', '.battery-3d', '.inverter-3d', '.motor-3d'];
        componentOrder.forEach((selector, index) => {
            setTimeout(() => {
                const component = document.querySelector(selector);
                component.classList.add('active');
                setTimeout(() => component.classList.remove('active'), 1000);
            }, index * 500);
        });
        
        // Mostrar status no painel
        setTimeout(() => {
            infoPanel.innerHTML = `
                <div class="system-status">
                    <h4 style="color: #28a745;">🚗 Sistema Iniciado</h4>
                    <div class="startup-sequence">
                        <div class="sequence-item completed">✅ Controlador Principal</div>
                        <div class="sequence-item completed">✅ Sistema de Bateria</div>
                        <div class="sequence-item completed">✅ Inversor de Potência</div>
                        <div class="sequence-item completed">✅ Motor Elétrico</div>
                        <div class="sequence-item completed">✅ Pronto para Condução</div>
                    </div>
                </div>
            `;
        }, 2000);
    }
    
    function simulateCharging() {
        const charger = document.querySelector('.charger-3d');
        charger.classList.add('active');
        
        let progress = 0;
        const chargingInterval = setInterval(() => {
            progress += 2;
            
            infoPanel.innerHTML = `
                <div class="charging-status">
                    <h4 style="color: #6f42c1;">⚡ Carregamento em Progresso</h4>
                    <div class="charging-progress">
                        <div class="progress-bar">
                            <div class="progress-fill" style="width: ${progress}%; background: #6f42c1;"></div>
                        </div>
                        <div class="charging-stats">
                            <div class="stat">
                                <span>Nível da Bateria:</span>
                                <span style="color: #6f42c1;">${progress}%</span>
                            </div>
                            <div class="stat">
                                <span>Potência:</span>
                                <span style="color: #6f42c1;">150 kW</span>
                            </div>
                            <div class="stat">
                                <span>Tempo Restante:</span>
                                <span style="color: #6f42c1;">${Math.max(0, 30 - Math.floor(progress/3))} min</span>
                            </div>
                        </div>
                    </div>
                </div>
            `;
            
            if (progress >= 100) {
                clearInterval(chargingInterval);
                charger.classList.remove('active');
                
                setTimeout(() => {
                    infoPanel.innerHTML = `
                        <div class="charging-complete">
                            <h4 style="color: #28a745;">✅ Carregamento Completo</h4>
                            <p>Bateria carregada a 100%. Autonomia: 450 km</p>
                        </div>
                    `;
                }, 500);
            }
        }, 100);
    }
    
    function simulateDriving() {
        const motor = document.querySelector('.motor-3d');
        const wheels = document.querySelectorAll('.rim');
        
        motor.classList.add('active');
        wheels.forEach(wheel => {
            wheel.style.animationDuration = '0.3s';
        });
        
        carBody.style.animation = 'carDriving 3s ease-in-out';
        
        infoPanel.innerHTML = `
            <div class="driving-status">
                <h4 style="color: #dc3545;">🚗 Modo Condução Ativo</h4>
                <div class="driving-stats">
                    <div class="stat">
                        <span>Velocidade:</span>
                        <span style="color: #dc3545;">80 km/h</span>
                    </div>
                    <div class="stat">
                        <span>Potência:</span>
                        <span style="color: #dc3545;">200 kW</span>
                    </div>
                    <div class="stat">
                        <span>Consumo:</span>
                        <span style="color: #dc3545;">18 kWh/100km</span>
                    </div>
                    <div class="stat">
                        <span>Autonomia:</span>
                        <span style="color: #dc3545;">380 km</span>
                    </div>
                </div>
            </div>
        `;
        
        setTimeout(() => {
            motor.classList.remove('active');
            wheels.forEach(wheel => {
                wheel.style.animationDuration = '2s';
            });
        }, 3000);
    }
    
    function resetCarSystem() {
        // Remover todas as classes ativas
        components.forEach(component => {
            component.classList.remove('active');
        });
        
        // Resetar animações
        carBody.style.animation = '';
        const wheels = document.querySelectorAll('.rim');
        wheels.forEach(wheel => {
            wheel.style.animationDuration = '2s';
        });
        
        // Resetar painel
        infoPanel.innerHTML = `
            <div class="default-info">
                <p>🚗 Sistema resetado. Passe o mouse sobre os componentes para explorar</p>
                <div class="stats-preview">
                    <div class="stat">
                        <span class="stat-label">Eficiência</span>
                        <span class="stat-value">95%</span>
                    </div>
                    <div class="stat">
                        <span class="stat-label">Autonomia</span>
                        <span class="stat-value">450km</span>
                    </div>
                    <div class="stat">
                        <span class="stat-label">Potência</span>
                        <span class="stat-value">350hp</span>
                    </div>
                </div>
            </div>
        `;
    }
}

// Adicionar estilos CSS adicionais via JavaScript
function addAdvancedCarStyles() {
    const style = document.createElement('style');
    style.textContent = `
        .component-details {
            text-align: left;
        }
        
        .component-specs {
            margin: 1rem 0;
        }
        
        .spec-item {
            display: flex;
            justify-content: space-between;
            padding: 0.5rem 0;
            border-bottom: 1px solid #f0f0f0;
        }
        
        .spec-label {
            font-weight: 600;
            color: #495057;
        }
        
        .spec-value {
            font-weight: 700;
        }
        
        .component-status {
            margin-top: 1.5rem;
        }
        
        .status-bar {
            width: 100%;
            height: 8px;
            background: #e9ecef;
            border-radius: 4px;
            overflow: hidden;
            margin-bottom: 0.5rem;
        }
        
        .status-fill {
            height: 100%;
            width: 0%;
            transition: width 2s ease;
            border-radius: 4px;
        }
        
        .status-text {
            font-size: 0.9rem;
            color: #28a745;
            font-weight: 600;
        }
        
        .startup-sequence {
            margin-top: 1rem;
        }
        
        .sequence-item {
            padding: 0.5rem 0;
            color: #666;
            transition: color 0.3s ease;
        }
        
        .sequence-item.completed {
            color: #28a745;
        }
        
        .charging-progress {
            margin-top: 1rem;
        }
        
        .progress-bar {
            width: 100%;
            height: 12px;
            background: #e9ecef;
            border-radius: 6px;
            overflow: hidden;
            margin-bottom: 1rem;
        }
        
        .progress-fill {
            height: 100%;
            transition: width 0.3s ease;
            border-radius: 6px;
        }
        
        .charging-stats, .driving-stats {
            display: grid;
            gap: 0.5rem;
        }
        
        @keyframes carStartup {
            0% { transform: rotateX(15deg) rotateY(-10deg) scale(1); }
            50% { transform: rotateX(10deg) rotateY(0deg) scale(1.05); }
            100% { transform: rotateX(15deg) rotateY(-10deg) scale(1); }
        }
        
        @keyframes carDriving {
            0% { transform: rotateX(15deg) rotateY(-10deg) translateX(0); }
            25% { transform: rotateX(12deg) rotateY(-5deg) translateX(10px); }
            50% { transform: rotateX(10deg) rotateY(0deg) translateX(0); }
            75% { transform: rotateX(12deg) rotateY(5deg) translateX(-10px); }
            100% { transform: rotateX(15deg) rotateY(-10deg) translateX(0); }
        }
    `;
    document.head.appendChild(style);
}

// Atualizar a inicialização
document.addEventListener('DOMContentLoaded', () => {
    animateTimeline();
    setupAdvancedInteractiveCar();
    addAdvancedCarStyles();
});