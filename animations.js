// Animações com Anime.js para o projeto Evolução Veicular

// Função para inicializar todas as animações
function initAnimeAnimations() {
    // Animação do título "A Evolução dos"
    anime({
        targets: '.anime-title-1',
        translateY: [-50, 0],
        opacity: [0, 1],
        duration: 1200,
        easing: 'easeOutExpo',
        delay: 300
    });

    // Animação do título "Automóveis" com efeito de piscar
    anime({
        targets: '.anime-title-2',
        translateY: [-50, 0],
        opacity: [0, 1],
        scale: [0.8, 1],
        duration: 1500,
        easing: 'easeOutElastic(1, .8)',
        delay: 800,
        complete: function() {
            // Após a animação inicial, inicia o efeito de piscar
            startBlinkingEffect();
        }
    });

    // Animação do texto de descrição
    anime({
        targets: '.anime-description',
        translateY: [30, 0],
        opacity: [0, 1],
        duration: 1000,
        easing: 'easeOutQuad',
        delay: 1300
    });

    // Animação adicional para o texto destacado
    anime({
        targets: '.highlight-text',
        color: ['#ffffff', '#4A90E2', '#ffffff'],
        duration: 2000,
        easing: 'easeInOutQuad',
        delay: 2000,
        loop: true,
        direction: 'alternate'
    });
}

// Função específica para o efeito de piscar da palavra "Automóveis"
// Função para efeito de piscar suave
function startBlinkingEffect() {
    anime({
        targets: '.anime-title-2',
        opacity: [1, 0.3, 1],
        duration: 3000,
        easing: 'easeInOutCubic',
        loop: true,
        direction: 'alternate'
    });
}

// Animação de entrada com efeito de digitação para o título
function typewriterAnimation() {
    const title1 = document.querySelector('.anime-title-1');
    const title2 = document.querySelector('.anime-title-2');
    const description = document.querySelector('.anime-description');
    
    if (title1) title1.style.opacity = '0';
    if (title2) title2.style.opacity = '0';
    if (description) description.style.opacity = '0';
    
    // Efeito de digitação para "A Evolução dos"
    anime({
        targets: '.anime-title-1',
        opacity: [0, 1],
        duration: 100,
        complete: function() {
            anime({
                targets: '.anime-title-1',
                width: ['0%', '100%'],
                duration: 1000,
                easing: 'easeOutExpo'
            });
        }
    });
    
    // Efeito de digitação para "Automóveis"
    setTimeout(() => {
        anime({
            targets: '.anime-title-2',
            opacity: [0, 1],
            duration: 100,
            complete: function() {
                anime({
                    targets: '.anime-title-2',
                    width: ['0%', '100%'],
                    duration: 1200,
                    easing: 'easeOutExpo'
                });
            }
        });
    }, 1000);
    
    // Animação da descrição
    setTimeout(() => {
        anime({
            targets: '.anime-description',
            opacity: [0, 1],
            translateY: [20, 0],
            duration: 800,
            easing: 'easeOutQuad'
        });
    }, 2200);
}

// Animação de hover para os textos
function setupHoverAnimations() {
    const titleElements = document.querySelectorAll('.anime-title-1, .anime-title-2');
    
    titleElements.forEach(element => {
        element.addEventListener('mouseenter', () => {
            anime({
                targets: element,
                scale: 1.05,
                duration: 300,
                easing: 'easeOutQuad'
            });
        });
        
        element.addEventListener('mouseleave', () => {
            anime({
                targets: element,
                scale: 1,
                duration: 300,
                easing: 'easeOutQuad'
            });
        });
    });
}

// Inicializar animações quando o DOM estiver carregado
document.addEventListener('DOMContentLoaded', function() {
    // Aguardar um pouco para garantir que todos os elementos estejam carregados
    setTimeout(() => {
        initAnimeAnimations();
        setupHoverAnimations();
    }, 500);
});

// Função alternativa para efeito de digitação (opcional)
function enableTypewriterMode() {
    typewriterAnimation();
}