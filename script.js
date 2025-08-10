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
        
        // Resetar progresso para garantir que comece do zero
        let progress = 0;
        
        // Criar elemento de progresso fora do intervalo para evitar recriação
        infoPanel.innerHTML = `
            <div class="charging-status">
                <h4 style="color: #6f42c1;">⚡ Carregamento em Progresso</h4>
                <div class="charging-progress">
                    <div class="progress-bar">
                        <div class="progress-fill" style="width: 0%; background: #6f42c1;"></div>
                    </div>
                    <div class="charging-stats">
                        <div class="stat">
                            <span>Nível da Bateria:</span>
                            <span class="battery-level" style="color: #6f42c1;">0%</span>
                        </div>
                        <div class="stat">
                            <span>Potência:</span>
                            <span style="color: #6f42c1;">150 kW</span>
                        </div>
                        <div class="stat">
                            <span>Tempo Restante:</span>
                            <span class="time-remaining" style="color: #6f42c1;">30 min</span>
                        </div>
                    </div>
                </div>
            </div>
        `;
        
        // Obter referências aos elementos que serão atualizados
        const progressFill = infoPanel.querySelector('.progress-fill');
        const batteryLevel = infoPanel.querySelector('.battery-level');
        const timeRemaining = infoPanel.querySelector('.time-remaining');
        
        // Usar requestAnimationFrame para animação mais suave
        const chargingInterval = setInterval(() => {
            progress += 1;
            
            // Atualizar apenas os elementos necessários em vez de recriar todo o HTML
            if (progressFill) progressFill.style.width = `${progress}%`;
            if (batteryLevel) batteryLevel.textContent = `${progress}%`;
            if (timeRemaining) timeRemaining.textContent = `${Math.max(0, 30 - Math.floor(progress/3))} min`;
            
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

// Melhorias para a seção hero
function setupEnhancedHero() {
    const timelinePoints = document.querySelectorAll('.point');
    const progressFill = document.querySelector('.progress-fill');
    const heroVisual = document.querySelector('.hero-visual');
    const hasHero = !!document.querySelector('.hero');
    
    // Interatividade dos pontos da timeline
    if (timelinePoints.length) {
        timelinePoints.forEach(point => {
            point.addEventListener('click', () => {
                const year = point.getAttribute('data-year');
                animateToYear(year);
                timelinePoints.forEach(p => p.classList.remove('active', 'highlight'));
                point.classList.add('active');
                if (year === '2024') point.classList.add('highlight');
            });
        });
    }
    
    function animateToYear(year) {
        const carStages = document.querySelectorAll('.car-stage');
        const transformationArrow = document.querySelector('.transformation-arrow');
        
        // Reset animations
        carStages.forEach(stage => {
            stage.style.transform = 'scale(1)';
            stage.style.opacity = '0.7';
        });
        
        // Highlight based on year
        if (parseInt(year) <= 1970) {
            document.querySelector('.old-stage').style.transform = 'scale(1.1)';
            document.querySelector('.old-stage').style.opacity = '1';
        } else {
            document.querySelector('.electric-stage').style.transform = 'scale(1.1)';
            document.querySelector('.electric-stage').style.opacity = '1';
        }
        
        // Animate transformation arrow
        transformationArrow.style.animation = 'none';
        setTimeout(() => {
            transformationArrow.style.animation = 'pulse 1s ease-in-out';
        }, 100);
    }
    
    // Auto-play da timeline
    if (timelinePoints.length) {
        let currentPointIndex = 0;
        setInterval(() => {
            if (timelinePoints.length > 0) {
                timelinePoints[currentPointIndex].click();
                currentPointIndex = (currentPointIndex + 1) % timelinePoints.length;
            }
        }, 4000);
    }
    
    // Parallax effect para o hero
    if (hasHero) {
        window.addEventListener('scroll', () => {
            const scrolled = window.pageYOffset;
            const rate = scrolled * -0.5;
            if (heroVisual) {
                heroVisual.style.transform = `translateY(${rate}px)`;
            }
            const hero = document.querySelector('.hero');
            if (!hero) return;
            const heroHeight = hero.offsetHeight || 1;
            const opacity = Math.max(0, 1 - (scrolled / heroHeight));
            hero.style.opacity = opacity;
        });
    }
}

// Animação de entrada dos elementos
function setupHeroAnimations() {
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('animate-in');
            }
        });
    }, {
        threshold: 0.1
    });
    
    // Observar elementos para animação
    const animatedElements = document.querySelectorAll('.hero-badge, .hero-title, .hero-description, .hero-stats, .hero-actions, .evolution-showcase');
    animatedElements.forEach(el => observer.observe(el));
}

// Efeitos de hover nos carros
function setupCarHoverEffects() {
    const oldCar = document.querySelector('.car-container-old');
    const electricCar = document.querySelector('.car-container-electric');
    
    if (oldCar) {
        oldCar.addEventListener('mouseenter', () => {
            // Intensificar fumaça
            const smokeParticles = oldCar.querySelectorAll('.smoke-particle');
            smokeParticles.forEach(particle => {
                particle.style.animationDuration = '1s';
            });
        });
        
        oldCar.addEventListener('mouseleave', () => {
            const smokeParticles = oldCar.querySelectorAll('.smoke-particle');
            smokeParticles.forEach(particle => {
                particle.style.animationDuration = '2s';
            });
        });
    }
    
    if (electricCar) {
        electricCar.addEventListener('mouseenter', () => {
            // Intensificar efeitos elétricos
            const lightningBolt = electricCar.querySelector('.lightning-bolt');
            const energyAura = electricCar.querySelector('.energy-aura');
            
            if (lightningBolt) {
                lightningBolt.style.animationDuration = '0.5s';
            }
            if (energyAura) {
                energyAura.style.animationDuration = '1s';
            }
        });
        
        electricCar.addEventListener('mouseleave', () => {
            const lightningBolt = electricCar.querySelector('.lightning-bolt');
            const energyAura = electricCar.querySelector('.energy-aura');
            
            if (lightningBolt) {
                lightningBolt.style.animationDuration = '2s';
            }
            if (energyAura) {
                energyAura.style.animationDuration = '2s';
            }
        });
    }
}

// Responsividade dinâmica
function setupResponsiveHero() {
    function adjustHeroForMobile() {
        const isMobile = window.innerWidth <= 768;
        const heroContainer = document.querySelector('.hero-container');
        const evolutionShowcase = document.querySelector('.evolution-showcase');
        
        if (isMobile) {
            // Ajustes para mobile
            if (evolutionShowcase) {
                evolutionShowcase.style.flexDirection = 'column';
            }
        } else {
            // Ajustes para desktop
            if (evolutionShowcase) {
                evolutionShowcase.style.flexDirection = 'row';
            }
        }
    }
    
    // Executar na carga e no redimensionamento
    adjustHeroForMobile();
    window.addEventListener('resize', adjustHeroForMobile);
}

// Menu responsivo
document.addEventListener('DOMContentLoaded', function() {
    const mobileMenu = document.getElementById('mobile-menu');
    const navLinks = document.querySelector('.nav-links');
    if (!mobileMenu || !navLinks) return;
    mobileMenu.addEventListener('click', function() {
        navLinks.classList.toggle('active');
        const icon = mobileMenu.querySelector('i');
        if (!icon) return;
        if (icon.classList.contains('fa-bars')) {
            icon.classList.remove('fa-bars');
            icon.classList.add('fa-times');
        } else {
            icon.classList.remove('fa-times');
            icon.classList.add('fa-bars');
        }
    });
    const navItems = document.querySelectorAll('.nav-links a');
    navItems.forEach(item => {
        item.addEventListener('click', function() {
            navLinks.classList.remove('active');
            const icon = mobileMenu.querySelector('i');
            if (!icon) return;
            icon.classList.remove('fa-times');
            icon.classList.add('fa-bars');
        });
    });
});

// Função para mostrar o carro interativo
function setupInteractiveCarButton() {
    const showButton = document.getElementById('show-interactive-car');
    const carExperience = document.getElementById('car-experience-container');
    
    if (showButton && carExperience) {
        showButton.addEventListener('click', function() {
            // Ocultar o botão
            showButton.style.display = 'none';
            
            // Mostrar o carro interativo com animação
            carExperience.style.display = 'block';
            carExperience.classList.add('fade-in');
            
            // Inicializar os componentes interativos após exibir
            setTimeout(() => {
                // Reinicializar os componentes interativos
                setupAdvancedInteractiveCar();
            }, 500);
        });
    }
}

// Remover a função setupInteractiveCarButton() inteira

// Atualizar a inicialização
document.addEventListener('DOMContentLoaded', () => {
    const hasHero = !!document.querySelector('.hero');
    const hasThree = !!document.querySelector('.three-stage');

    // Página inicial
    if (hasHero) {
        animateTimeline();
        setupEnhancedHero();
        setupHeroAnimations();
        setupCarHoverEffects();
        setupResponsiveHero();
    }

    // Experiência imersiva (pode reutilizar estilos avançados do painel)
    if (hasThree) {
        addAdvancedCarStyles();
    }
});

// Detectar dispositivos móveis e ajustar a experiência
function detectMobileDevice() {
    const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent) || window.innerWidth < 768;
    
    if (isMobile) {
        document.body.classList.add('mobile-device');
        setupMobileExperience();
    }
}

// Configurar experiência otimizada para dispositivos móveis
function setupMobileExperience() {
    // Adicionar menu hamburguer para navegação
    const menuToggle = document.createElement('div');
    menuToggle.className = 'menu-toggle';
    menuToggle.innerHTML = '☰';
    
    const nav = document.querySelector('nav');
    const navLinks = document.querySelector('.nav-links');
    
    if (nav && !document.querySelector('.menu-toggle')) {
        nav.insertBefore(menuToggle, navLinks);
        
        menuToggle.addEventListener('click', function() {
            navLinks.classList.toggle('active');
        });
        
        // Fechar menu ao clicar em um link
        const links = document.querySelectorAll('.nav-links a');
        links.forEach(link => {
            link.addEventListener('click', function() {
                navLinks.classList.remove('active');
            });
        });
    }
    
    // Ajustar interação para componentes 3D em touch
    const components = document.querySelectorAll('.component-3d');
    components.forEach(component => {
        component.addEventListener('touchstart', function(e) {
            // Prevenir comportamento padrão para evitar problemas de scroll
            e.preventDefault();
            
            // Remover classe active de todos os componentes
            components.forEach(c => c.classList.remove('active'));
            
            // Adicionar classe active ao componente tocado
            this.classList.add('active');
            
            // Mostrar informações do componente
            const componentClass = this.classList[1];
            showComponentInfo(componentClass);
        });
    });
}

// Inicializar detecção de dispositivo quando o DOM estiver carregado
document.addEventListener('DOMContentLoaded', function() {
    detectMobileDevice();
    
    // Adicionar instruções para dispositivos touch
    const carExperience = document.querySelector('.car-experience');
    if (carExperience) {
        const touchInstructions = document.createElement('div');
        touchInstructions.className = 'touch-instructions';
        touchInstructions.innerHTML = 'Toque nos componentes para ver mais detalhes';
        carExperience.insertBefore(touchInstructions, carExperience.firstChild);
    }
});

// Ajustar layout quando a orientação do dispositivo mudar
window.addEventListener('resize', function() {
    if (window.innerWidth < 768) {
        document.body.classList.add('mobile-device');
    } else {
        document.body.classList.remove('mobile-device');
    }
});