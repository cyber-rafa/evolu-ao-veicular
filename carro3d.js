class Car3DInteractive {
  constructor() {
    this.sections = document.querySelectorAll('.section-3d');
    // Removidas as referências à barra de progresso
    this.currentSection = 0;
    this.isMobile = window.innerWidth <= 768;
    this.isTablet = window.innerWidth <= 1024 && window.innerWidth > 768;
    this.lastScrollTime = 0;
    this.scrollCooldown = 1000; // ms
    
    this.init();
  }

  init() {
    this.setupScrollObserver();
    this.setupKeyboardNavigation();
    this.setupTouchGestures();
    this.setupParticleEffects();
    this.setupPerformanceObservers();
    this.setupParallax();
    this.setupResizeHandler();
    this.setupGlitchEffects(); // Efeito futurístico
    this.setupHologramEffect(); // Efeito futurístico
    this.setupEnhanced3DEffects(); // Novo método para melhorar o design 3D
    this.setupCameraControls(); // Controles de câmera
    this.setupCinematicTransitions(); // Transições cinematográficas
    this.setupSmoothScrollTransitions(); // Transições suaves
    
    // Adicionar link para o novo CSS
    this.loadFuturisticStyles();
    
    // Detectar dispositivo e otimizar
    this.optimizeForDevice();
  }

  loadFuturisticStyles() {
    const linkElement = document.createElement('link');
    linkElement.rel = 'stylesheet';
    linkElement.href = 'carro3d-futuristic.css';
    document.head.appendChild(linkElement);
  }

  setupScrollObserver() {
    const observerOptions = {
      root: null,
      rootMargin: '0px',
      threshold: this.isMobile ? 0.3 : 0.5 // Menor threshold para mobile
    };

    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          const sectionIndex = Array.from(this.sections).indexOf(entry.target);
          this.activateSection(sectionIndex);
        }
      });
    }, observerOptions);

    this.sections.forEach(section => {
      observer.observe(section);
    });

    // Smooth scroll behavior
    document.documentElement.style.scrollBehavior = 'smooth';
  }

  activateSection(index) {
    // Evitar ativações muito frequentes (debounce)
    const now = Date.now();
    if (now - this.lastScrollTime < this.scrollCooldown) return;
    this.lastScrollTime = now;
    
    this.currentSection = index;
    
    // Remove active class from all sections
    this.sections.forEach(section => section.classList.remove('active'));
    
    // Add active class to current section
    this.sections[index].classList.add('active');
    
    // Removida a atualização da barra de progresso
    
    // Trigger section-specific animations
    this.triggerSectionAnimation(index);
    
    // Adicionar efeito de glitch na transição
    this.triggerGlitchEffect(index);
  }
  
  // Novo método para melhorar o design 3D
  setupEnhanced3DEffects() {
    // Adicionar efeito de profundidade aos modelos 3D
    this.sections.forEach(section => {
      const carModel = section.querySelector('.car-model');
      if (carModel) {
        // Adicionar camadas de profundidade
        const depthLayers = ['front', 'middle', 'back'];
        depthLayers.forEach(layer => {
          const depthElement = document.createElement('div');
          depthElement.className = `depth-layer ${layer}-layer`;
          carModel.appendChild(depthElement);
        });
        
        // Adicionar efeito de iluminação dinâmica
        const lightSource = document.createElement('div');
        lightSource.className = 'dynamic-light';
        carModel.appendChild(lightSource);
        
        // Adicionar reflexos
        const reflection = document.createElement('div');
        reflection.className = 'reflection-effect';
        carModel.appendChild(reflection);
      }
    });
    
    // Adicionar evento de movimento do mouse para efeito parallax
    document.addEventListener('mousemove', (e) => {
      if (window.innerWidth <= 768) return; // Desativar em dispositivos móveis
      
      const mouseX = e.clientX / window.innerWidth - 0.5;
      const mouseY = e.clientY / window.innerHeight - 0.5;
      
      this.sections.forEach(section => {
        if (section.classList.contains('active')) {
          const carModel = section.querySelector('.car-model');
          if (carModel) {
            carModel.style.transform = `rotateY(${mouseX * 15}deg) rotateX(${-mouseY * 15}deg)`;
            
            // Mover camadas com diferentes intensidades para efeito de profundidade
            const frontLayer = carModel.querySelector('.front-layer');
            const middleLayer = carModel.querySelector('.middle-layer');
            const backLayer = carModel.querySelector('.back-layer');
            
            if (frontLayer) frontLayer.style.transform = `translateX(${mouseX * 20}px) translateY(${mouseY * 20}px)`;
            if (middleLayer) middleLayer.style.transform = `translateX(${mouseX * 10}px) translateY(${mouseY * 10}px)`;
            if (backLayer) backLayer.style.transform = `translateX(${mouseX * 5}px) translateY(${mouseY * 5}px)`;
            
            // Mover luz dinâmica
            const light = carModel.querySelector('.dynamic-light');
            if (light) {
              light.style.background = `radial-gradient(circle at ${50 + mouseX * 100}% ${50 + mouseY * 100}%, rgba(0, 246, 255, 0.8), transparent 70%)`;
            }
          }
        }
      });
    });
  }
  
  triggerSectionAnimation(index) {
    const section = this.sections[index];
    const sectionType = section.dataset.section;
    
    switch(sectionType) {
      case 'battery':
        this.animateBattery();
        break;
      case 'motor':
        this.animateMotor();
        break;
      case 'charging':
        this.animateCharging();
        break;
      case 'cooling':
        this.animateCooling();
        break;
    }
  }

  animateBattery() {
    const cells = document.querySelectorAll('.battery-cell');
    cells.forEach((cell, index) => {
      setTimeout(() => {
        cell.style.animationDelay = `${index * 0.2}s`;
        cell.classList.add('charging');
      }, index * 100);
    });
  }

  animateMotor() {
    const rotor = document.querySelector('.motor-rotor');
    if (rotor) {
      rotor.style.animationDuration = '1s';
    }
  }

  animateCharging() {
    const cable = document.querySelector('.charging-cable');
    const port = document.querySelector('.charging-port');
    
    if (cable) {
      cable.style.opacity = '1';
      cable.style.animation = 'extendCable 1s ease-out forwards';
    }
  }

  animateCooling() {
    const flow = document.querySelector('.coolant-flow');
    if (flow) {
      flow.style.animation = 'coolantFlow 2s ease-in-out infinite';
    }
  }

  setupKeyboardNavigation() {
    document.addEventListener('keydown', (e) => {
      if (e.key === 'ArrowDown' || e.key === 'PageDown') {
        e.preventDefault();
        this.scrollToSection(this.currentSection + 1);
      } else if (e.key === 'ArrowUp' || e.key === 'PageUp') {
        e.preventDefault();
        this.scrollToSection(this.currentSection - 1);
      }
    });
  }

  setupTouchGestures() {
    let touchStartY = 0;
    let touchEndY = 0;
    let touchStartX = 0;
    let touchEndX = 0;

    document.addEventListener('touchstart', (e) => {
      touchStartY = e.changedTouches[0].screenY;
      touchStartX = e.changedTouches[0].screenX;
    });

    document.addEventListener('touchend', (e) => {
      touchEndY = e.changedTouches[0].screenY;
      touchEndX = e.changedTouches[0].screenX;
      this.handleSwipe();
    });

    const handleSwipe = () => {
      const swipeThreshold = this.isMobile ? 30 : 50; // Menor threshold para mobile
      const diffY = touchStartY - touchEndY;
      const diffX = touchStartX - touchEndX;

      // Verificar se o swipe é mais vertical que horizontal
      if (Math.abs(diffY) > Math.abs(diffX) && Math.abs(diffY) > swipeThreshold) {
        if (diffY > 0) {
          this.scrollToSection(this.currentSection + 1);
        } else {
          this.scrollToSection(this.currentSection - 1);
        }
      }
    };

    this.handleSwipe = handleSwipe;
  }

  setupParticleEffects() {
    // Reduzir o número de partículas em dispositivos móveis para melhor desempenho
    const particleCount = this.isMobile ? 10 : this.isTablet ? 15 : 25;
    
    this.sections.forEach(section => {
      const container = section.querySelector('.energy-particles-container');
      if (container) {
        for (let i = 0; i < particleCount; i++) {
          const particle = document.createElement('div');
          particle.className = 'energy-particle';
          particle.style.left = `${Math.random() * 100}%`;
          particle.style.top = `${Math.random() * 100}%`;
          particle.style.animationDelay = `${Math.random() * 4}s`;
          particle.style.animationDuration = `${5 + Math.random() * 5}s`; // Duração variada
          container.appendChild(particle);
        }
      }
    });
  }
  
  setupPerformanceObservers() {
    const observerOptions = {
      rootMargin: this.isMobile ? '100px' : '200px',
      threshold: 0.1
    };
    
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('visible');
          
          // Carregar elementos 3D apenas quando visíveis
          const carModel = entry.target.querySelector('.car-model');
          if (carModel) {
            carModel.style.visibility = 'visible';
          }
        } else {
          entry.target.classList.remove('visible');
          
          // Descarregar elementos 3D quando não visíveis para economizar memória
          if (this.isMobile) {
            const carModel = entry.target.querySelector('.car-model');
            if (carModel && Math.abs(Array.from(this.sections).indexOf(entry.target) - this.currentSection) > 1) {
              carModel.style.visibility = 'hidden';
            }
          }
        }
      });
    }, observerOptions);
    
    this.sections.forEach(section => observer.observe(section));
  }

  setupParallax() {
    // Efeito parallax para elementos 3D
    window.addEventListener('scroll', () => {
      const scrolled = window.pageYOffset;
      const parallaxElements = document.querySelectorAll('.parallax-element');
      
      parallaxElements.forEach(element => {
        const speed = element.dataset.speed || 0.5;
        const yPos = -(scrolled * speed);
        element.style.transform = `translateY(${yPos}px)`;
      });
    });
    
    // Parallax baseado no movimento do mouse (já implementado em setupEnhanced3DEffects)
    // Este método pode ser usado para efeitos parallax adicionais se necessário
  }

  setupResizeHandler() {
    window.addEventListener('resize', () => {
      // Atualizar flags de dispositivo
      this.isMobile = window.innerWidth <= 768;
      this.isTablet = window.innerWidth <= 1024 && window.innerWidth > 768;
      
      // Reotimizar para o novo tamanho
      this.optimizeForDevice();
    });
  }

  optimizeForDevice() {
    // Ajustar qualidade com base no dispositivo
    if (this.isMobile) {
      document.documentElement.style.setProperty('--particle-quality', 'low');
      document.documentElement.style.setProperty('--animation-quality', 'reduced');
    } else if (this.isTablet) {
      document.documentElement.style.setProperty('--particle-quality', 'medium');
      document.documentElement.style.setProperty('--animation-quality', 'medium');
    } else {
      document.documentElement.style.setProperty('--particle-quality', 'high');
      document.documentElement.style.setProperty('--animation-quality', 'full');
    }
  }

  setupGlitchEffects() {
    // Adicionar SVG filter para efeito de glitch
    const svgFilter = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
    svgFilter.setAttribute('class', 'svg-filters');
    svgFilter.setAttribute('width', '0');
    svgFilter.setAttribute('height', '0');
    svgFilter.innerHTML = `
      <defs>
        <filter id="glitch-filter">
          <feColorMatrix type="matrix" values="1 0 0 0 0  0 0 0 0 0  0 0 1 0 0  0 0 0 1 0" result="red-channel" />
          <feOffset in="red-channel" dx="3" dy="0" result="red-offset" />
          <feColorMatrix type="matrix" values="0 0 0 0 0  0 1 0 0 0  0 0 0 0 0  0 0 0 1 0" result="green-channel" />
          <feOffset in="green-channel" dx="-3" dy="0" result="green-offset" />
          <feColorMatrix type="matrix" values="0 0 0 0 0  0 0 0 0 0  0 0 1 0 0  0 0 0 1 0" result="blue-channel" />
          <feOffset in="blue-channel" dx="0" dy="0" result="blue-offset" />
          <feBlend in="red-offset" in2="green-offset" mode="screen" result="blend1" />
          <feBlend in="blend1" in2="blue-offset" mode="screen" result="blend" />
        </filter>
        <filter id="hologram-filter">
          <feTurbulence type="fractalNoise" baseFrequency="0.05" numOctaves="1" result="noise" />
          <feColorMatrix type="matrix" values="0 0 0 0 0  0 0 0 0 0  0 0 0 0 0  0 0 0 0.05 0" result="noise-alpha" />
          <feBlend in="SourceGraphic" in2="noise-alpha" mode="screen" result="blend" />
          <feConvolveMatrix order="3,3" kernelMatrix="0 -1 0 -1 4 -1 0 -1 0" edgeMode="duplicate" result="sharpen" />
          <feComposite in="blend" in2="sharpen" operator="arithmetic" k1="0" k2="1" k3="0.5" k4="0" />
        </filter>
      </defs>
    `;
    document.body.appendChild(svgFilter);
  }

  triggerGlitchEffect(index) {
    const section = this.sections[index];
    const carModel = section.querySelector('.car-model');
    
    if (carModel) {
      carModel.style.filter = 'url(#glitch-filter)';
      setTimeout(() => {
        carModel.style.filter = 'none';
      }, 500);
    }
  }

  setupHologramEffect() {
    this.sections.forEach(section => {
      const carModel = section.querySelector('.car-model');
      if (carModel) {
        // Adicionar linhas de escaneamento holográfico
        const hologramLines = document.createElement('div');
        hologramLines.className = 'hologram-lines';
        carModel.appendChild(hologramLines);
        
        // Adicionar brilho holográfico
        const hologramGlow = document.createElement('div');
        hologramGlow.className = 'hologram-glow';
        carModel.appendChild(hologramGlow);
      }
    });
  }

  setupCameraControls() {
    // Variáveis de controle da câmera
    this.cameraState = {
      rotationX: 0,
      rotationY: 0,
      zoom: 1,
      isDragging: false,
      startX: 0,
      startY: 0,
      sensitivity: 0.5,
      zoomSensitivity: 0.1,
      maxRotationX: 45,
      minRotationX: -45,
      maxZoom: 3,
      minZoom: 0.5
    };

    this.setupMouseControls();
    this.setupTouchControls();
    this.setupWheelZoom();
    this.setupKeyboardControls();
    this.setupResetControls();
  }

  setupMouseControls() {
    // Mouse down - iniciar arrasto
    document.addEventListener('mousedown', (e) => {
      // Verificar se clicou em uma seção 3D ativa
      const activeSection = document.querySelector('.section-3d.active');
      if (!activeSection) return;
      
      const carContainer = activeSection.querySelector('.car-3d-container');
      if (!carContainer) return;
      
      // Verificar se o clique foi dentro do container do carro
      const rect = carContainer.getBoundingClientRect();
      if (e.clientX >= rect.left && e.clientX <= rect.right && 
          e.clientY >= rect.top && e.clientY <= rect.bottom) {
        
        this.cameraState.isDragging = true;
        this.cameraState.startX = e.clientX;
        this.cameraState.startY = e.clientY;
        
        // Adicionar cursor de arrasto
        document.body.style.cursor = 'grabbing';
        carContainer.style.cursor = 'grabbing';
        
        e.preventDefault();
      }
    });

    // Mouse move - rotacionar câmera
    document.addEventListener('mousemove', (e) => {
      if (!this.cameraState.isDragging) return;
      
      const deltaX = e.clientX - this.cameraState.startX;
      const deltaY = e.clientY - this.cameraState.startY;
      
      // Calcular nova rotação
      this.cameraState.rotationY += deltaX * this.cameraState.sensitivity;
      this.cameraState.rotationX -= deltaY * this.cameraState.sensitivity;
      
      // Limitar rotação vertical
      this.cameraState.rotationX = Math.max(
        this.cameraState.minRotationX, 
        Math.min(this.cameraState.maxRotationX, this.cameraState.rotationX)
      );
      
      // Aplicar transformação
      this.applyCameraTransform();
      
      // Atualizar posição inicial para próximo frame
      this.cameraState.startX = e.clientX;
      this.cameraState.startY = e.clientY;
      
      e.preventDefault();
    });

    // Mouse up - parar arrasto
    document.addEventListener('mouseup', () => {
      if (this.cameraState.isDragging) {
        this.cameraState.isDragging = false;
        document.body.style.cursor = '';
        
        const activeSection = document.querySelector('.section-3d.active');
        const carContainer = activeSection?.querySelector('.car-3d-container');
        if (carContainer) {
          carContainer.style.cursor = 'grab';
        }
      }
    });
  }

  setupTouchControls() {
    let initialDistance = 0;
    let initialScale = 1;
    let touchStartRotationX = 0;
    let touchStartRotationY = 0;
    
    document.addEventListener('touchstart', (e) => {
      const activeSection = document.querySelector('.section-3d.active');
      if (!activeSection) return;
      
      if (e.touches.length === 1) {
        // Toque único - rotação
        this.cameraState.isDragging = true;
        this.cameraState.startX = e.touches[0].clientX;
        this.cameraState.startY = e.touches[0].clientY;
        touchStartRotationX = this.cameraState.rotationX;
        touchStartRotationY = this.cameraState.rotationY;
      } else if (e.touches.length === 2) {
        // Dois toques - zoom
        initialDistance = this.getDistance(e.touches[0], e.touches[1]);
        initialScale = this.cameraState.zoom;
      }
      
      e.preventDefault();
    });
    
    document.addEventListener('touchmove', (e) => {
      if (e.touches.length === 1 && this.cameraState.isDragging) {
        // Rotação com um dedo
        const deltaX = e.touches[0].clientX - this.cameraState.startX;
        const deltaY = e.touches[0].clientY - this.cameraState.startY;
        
        this.cameraState.rotationY = touchStartRotationY + deltaX * this.cameraState.sensitivity;
        this.cameraState.rotationX = touchStartRotationX - deltaY * this.cameraState.sensitivity;
        
        // Limitar rotação
        this.cameraState.rotationX = Math.max(
          this.cameraState.minRotationX,
          Math.min(this.cameraState.maxRotationX, this.cameraState.rotationX)
        );
        
        this.applyCameraTransform();
      } else if (e.touches.length === 2) {
        // Zoom com dois dedos
        const currentDistance = this.getDistance(e.touches[0], e.touches[1]);
        const scale = initialScale * (currentDistance / initialDistance);
        
        this.cameraState.zoom = Math.max(
          this.cameraState.minZoom,
          Math.min(this.cameraState.maxZoom, scale)
        );
        
        this.applyCameraTransform();
      }
      
      e.preventDefault();
    });
    
    document.addEventListener('touchend', () => {
      this.cameraState.isDragging = false;
    });
  }

  setupWheelZoom() {
    document.addEventListener('wheel', (e) => {
      const activeSection = document.querySelector('.section-3d.active');
      if (!activeSection) return;
      
      const carContainer = activeSection.querySelector('.car-3d-container');
      if (!carContainer) return;
      
      // Verificar se o mouse está sobre o container do carro
      const rect = carContainer.getBoundingClientRect();
      if (e.clientX >= rect.left && e.clientX <= rect.right && 
          e.clientY >= rect.top && e.clientY <= rect.bottom) {
        
        e.preventDefault();
        
        // Calcular zoom
        const delta = e.deltaY > 0 ? -this.cameraState.zoomSensitivity : this.cameraState.zoomSensitivity;
        this.cameraState.zoom = Math.max(
          this.cameraState.minZoom,
          Math.min(this.cameraState.maxZoom, this.cameraState.zoom + delta)
        );
        
        this.applyCameraTransform();
      }
    });
  }

  setupKeyboardControls() {
    document.addEventListener('keydown', (e) => {
      const activeSection = document.querySelector('.section-3d.active');
      if (!activeSection) return;
      
      const step = 2; // Graus por tecla
      const zoomStep = 0.1;
      
      switch(e.key) {
        case 'ArrowLeft':
          if (e.ctrlKey || e.metaKey) {
            e.preventDefault();
            this.cameraState.rotationY -= step;
            this.applyCameraTransform();
          }
          break;
        case 'ArrowRight':
          if (e.ctrlKey || e.metaKey) {
            e.preventDefault();
            this.cameraState.rotationY += step;
            this.applyCameraTransform();
          }
          break;
        case 'ArrowUp':
          if (e.ctrlKey || e.metaKey) {
            e.preventDefault();
            this.cameraState.rotationX = Math.min(
              this.cameraState.maxRotationX,
              this.cameraState.rotationX + step
            );
            this.applyCameraTransform();
          }
          break;
        case 'ArrowDown':
          if (e.ctrlKey || e.metaKey) {
            e.preventDefault();
            this.cameraState.rotationX = Math.max(
              this.cameraState.minRotationX,
              this.cameraState.rotationX - step
            );
            this.applyCameraTransform();
          }
          break;
        case '+':
        case '=':
          if (e.ctrlKey || e.metaKey) {
            e.preventDefault();
            this.cameraState.zoom = Math.min(
              this.cameraState.maxZoom,
              this.cameraState.zoom + zoomStep
            );
            this.applyCameraTransform();
          }
          break;
        case '-':
          if (e.ctrlKey || e.metaKey) {
            e.preventDefault();
            this.cameraState.zoom = Math.max(
              this.cameraState.minZoom,
              this.cameraState.zoom - zoomStep
            );
            this.applyCameraTransform();
          }
          break;
        case 'r':
        case 'R':
          if (e.ctrlKey || e.metaKey) {
            e.preventDefault();
            this.resetCamera();
          }
          break;
      }
    });
  }

  setupResetControls() {
    // Criar botão de reset se não existir
    if (!document.querySelector('.camera-reset-btn')) {
      const resetBtn = document.createElement('button');
      resetBtn.className = 'camera-reset-btn';
      resetBtn.innerHTML = '↻';
      resetBtn.title = 'Reset Camera (Ctrl+R)';
      resetBtn.addEventListener('click', () => this.resetCamera());
      document.body.appendChild(resetBtn);
    }
  }

  applyCameraTransform() {
    const activeSection = document.querySelector('.section-3d.active');
    if (!activeSection) return;
    
    const carContainer = activeSection.querySelector('.car-3d-container');
    if (!carContainer) return;
    
    // Aplicar transformações
    const transform = `
      perspective(1000px)
      rotateX(${this.cameraState.rotationX}deg)
      rotateY(${this.cameraState.rotationY}deg)
      scale(${this.cameraState.zoom})
    `;
    
    carContainer.style.transform = transform;
    
    // Atualizar indicadores visuais
    this.updateCameraIndicators();
    
    // Adicionar classe para indicar que está sendo controlado
    carContainer.classList.add('camera-controlled');
    
    // Remover classe após um tempo
    clearTimeout(this.cameraControlTimeout);
    this.cameraControlTimeout = setTimeout(() => {
      carContainer.classList.remove('camera-controlled');
    }, 1000);
  }

  resetCamera() {
    this.cameraState.rotationX = 0;
    this.cameraState.rotationY = 0;
    this.cameraState.zoom = 1;
    
    const activeSection = document.querySelector('.section-3d.active');
    if (activeSection) {
      const carContainer = activeSection.querySelector('.car-3d-container');
      if (carContainer) {
        carContainer.style.transition = 'transform 0.5s ease-out';
        this.applyCameraTransform();
        
        setTimeout(() => {
          carContainer.style.transition = '';
        }, 500);
      }
    }
    
    // Mostrar feedback visual
    const resetBtn = document.querySelector('.camera-reset-btn');
    if (resetBtn) {
      resetBtn.style.transform = 'scale(1.2) rotate(180deg)';
      setTimeout(() => {
        resetBtn.style.transform = '';
      }, 200);
    }
  }

  updateCameraIndicators() {
    // Atualizar indicador de zoom se existir
    const zoomIndicator = document.querySelector('.zoom-indicator');
    if (zoomIndicator) {
      const zoomPercent = Math.round(this.cameraState.zoom * 100);
      zoomIndicator.textContent = `${zoomPercent}%`;
    }
  }

  getDistance(touch1, touch2) {
    const dx = touch1.clientX - touch2.clientX;
    const dy = touch1.clientY - touch2.clientY;
    return Math.sqrt(dx * dx + dy * dy);
  }

  // Métodos para transições cinematográficas
  setupCinematicTransitions() {
    // Criar overlay de transição
    this.createTransitionOverlay();
    
    // Configurar transições entre seções
    this.setupSectionTransitions();
    
    // Configurar animações de entrada
    this.setupEntranceAnimations();
  }

  createTransitionOverlay() {
    const overlay = document.createElement('div');
    overlay.className = 'section-transition-overlay';
    overlay.innerHTML = `
      <div class="transition-waves"></div>
      <div class="transition-particles">
        <div class="transition-particle"></div>
        <div class="transition-particle"></div>
        <div class="transition-particle"></div>
        <div class="transition-particle"></div>
        <div class="transition-particle"></div>
        <div class="transition-particle"></div>
        <div class="transition-particle"></div>
        <div class="transition-particle"></div>
      </div>
      <div class="chromatic-aberration"></div>
      <div class="scan-line"></div>
      <div class="transition-glitch"></div>
    `;
    
    document.body.appendChild(overlay);
    this.transitionOverlay = overlay;
  }

  setupSectionTransitions() {
    // Interceptar mudanças de seção para adicionar transição
    const originalActivateSection = this.activateSection.bind(this);

    this.activateSection = (index) => {
      // Iniciar transição cinematográfica
      this.startCinematicTransition(() => {
        originalActivateSection(index);
      });
    };
  }

  startCinematicTransition(callback) {
    // Mostrar overlay de transição
    this.transitionOverlay.classList.add('active');
    
    // Executar callback no meio da transição
    setTimeout(() => {
      callback();
    }, 400);
    
    // Remover overlay após transição
    setTimeout(() => {
      this.transitionOverlay.classList.remove('active');
    }, 800);
  }

  setupEntranceAnimations() {
    // Observador para animações de entrada
    const entranceObserver = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          const section = entry.target;
          const sectionType = section.dataset.section;
          
          // Aplicar atraso baseado no tipo de seção
          const delay = this.getEntranceDelay(sectionType);
          
          setTimeout(() => {
            this.triggerEntranceAnimation(section, sectionType);
          }, delay);
          
          // Parar de observar esta seção
          entranceObserver.unobserve(section);
        }
      });
    }, {
      threshold: 0.3,
      rootMargin: '0px 0px -100px 0px'
    });
    
    // Observar todas as seções
    this.sections.forEach(section => {
      entranceObserver.observe(section);
    });
  }

  getEntranceDelay(sectionType) {
    const delays = {
      'intro': 0,
      'car-body': 200,
      'battery': 100,
      'motor': 300,
      'inverter': 150,
      'charging': 250,
      'cooling': 180,
      'conclusion': 400
    };
    
    return delays[sectionType] || 0;
  }

  triggerEntranceAnimation(section, sectionType) {
    const carModel = section.querySelector('.car-model');
    const content = section.querySelector('.section-content');

    if (carModel) {
      // Reset animation
      carModel.style.animation = 'none';
      
      // Force reflow
      carModel.offsetHeight;
      
      // Apply entrance animation based on section type
      const animations = {
        'intro': 'carEntranceFade 2s cubic-bezier(0.25, 0.46, 0.45, 0.94) forwards',
        'car-body': 'carEntranceSlide 2.5s cubic-bezier(0.25, 0.46, 0.45, 0.94) forwards',
        'battery': 'carEntranceZoom 2s cubic-bezier(0.25, 0.46, 0.45, 0.94) forwards',
        'motor': 'carEntranceRotate 2.2s cubic-bezier(0.25, 0.46, 0.45, 0.94) forwards',
        'inverter': 'carEntranceSlide 2s cubic-bezier(0.25, 0.46, 0.45, 0.94) forwards',
        'charging': 'carEntranceZoom 1.8s cubic-bezier(0.25, 0.46, 0.45, 0.94) forwards',
        'cooling': 'carEntranceRotate 2.3s cubic-bezier(0.25, 0.46, 0.45, 0.94) forwards',
        'conclusion': 'carEntranceFade 2.5s cubic-bezier(0.25, 0.46, 0.45, 0.94) forwards'
      };
      
      carModel.style.animation = animations[sectionType] || animations['intro'];
    }
    
    // Animar conteúdo da seção
    if (content) {
      content.style.transform = 'translateY(0)';
      content.style.opacity = '1';
    }
  }

  setupSmoothScrollTransitions() {
    let isTransitioning = false;

    const originalScrollToSection = this.scrollToSection.bind(this);

    this.scrollToSection = (index) => {
      if (isTransitioning) return;
      if (index < 0 || index >= this.sections.length) return;
      
      isTransitioning = true;
      
      // Aplicar animação de saída à seção atual
      this.applyExitAnimation(this.currentSection);
      
      // Executar scroll após animação de saída
      setTimeout(() => {
        originalScrollToSection(index);
        
        setTimeout(() => {
          isTransitioning = false;
        }, 1000);
      }, 300);
    };
  }

  applyExitAnimation(sectionIndex) {
    if (sectionIndex < 0 || sectionIndex >= this.sections.length) return;
    
    const section = this.sections[sectionIndex];
    const carModel = section.querySelector('.car-model');
    
    if (carModel) {
      carModel.style.animation = 'carExitFade 0.5s ease-in-out forwards';
    }
  }

  scrollToSection(index) {
    if (index >= 0 && index < this.sections.length) {
      this.sections[index].scrollIntoView({
        behavior: 'smooth',
        block: 'start'
      });
    }
  }
}

// ... existing code ...

const additionalStyles = `
  @keyframes extendCable {
    from {
      height: 0;
      opacity: 0;
    }
    to {
      height: 50px;
      opacity: 1;
    }
  }

  @keyframes coolantFlow {
    0% {
      background-position: 0% 50%;
    }
    100% {
      background-position: 100% 50%;
    }
  }

  .battery-cell.charging {
    animation: chargeGlow 2s ease-in-out infinite;
  }

  @keyframes chargeGlow {
    0%, 100% {
      box-shadow: 0 0 5px var(--primary-color);
    }
    50% {
      box-shadow: 0 0 20px var(--primary-color), 0 0 30px var(--primary-color);
    }
  }

  .hologram-lines {
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: repeating-linear-gradient(
      transparent 0px,
      rgba(0, 246, 255, 0.05) 1px,
      rgba(0, 246, 255, 0.05) 2px,
      transparent 3px
    );
    pointer-events: none;
    opacity: 0;
    transition: opacity 0.5s ease;
  }

  .section-3d.active .hologram-lines {
    opacity: 0.7;
    animation: scanLines 8s linear infinite;
  }

  @keyframes scanLines {
    0% { background-position: 0 0; }
    100% { background-position: 0 100%; }
  }

  .hologram-glow {
    position: absolute;
    top: -10%;
    left: -10%;
    right: -10%;
    bottom: -10%;
    border-radius: 50%;
    background: radial-gradient(ellipse at center, rgba(0, 246, 255, 0.2) 0%, transparent 70%);
    filter: blur(10px);
    opacity: 0;
    transition: opacity 0.5s ease;
    pointer-events: none;
  }

  .section-3d.active .hologram-glow {
    opacity: 1;
    animation: pulseHologram 4s ease-in-out infinite alternate;
  }

  @keyframes pulseHologram {
    0% { opacity: 0.2; transform: scale(1); }
    100% { opacity: 0.5; transform: scale(1.1); }
  }

  :root {
    --particle-quality: high;
    --animation-quality: full;
  }

  [data-quality="low"] .energy-particle {
    box-shadow: none;
  }

  [data-quality="medium"] .energy-particle {
    box-shadow: 0 0 10px var(--primary-color);
  }

  [data-animation-quality="reduced"] * {
    animation-duration: 120% !important;
  }

  @media (max-width: 768px) {
    html, body {
      max-width: 100%;
      overflow-x: hidden;
    }
  }
`;

const styleSheet = document.createElement('style');
styleSheet.textContent = additionalStyles;
document.head.appendChild(styleSheet);

// Initialize the 3D car interactive experience
document.addEventListener('DOMContentLoaded', () => {
  new Car3DInteractive();
});

// Utility function for throttling
const throttle = (func, limit) => {
  let inThrottle;
  return function() {
    const args = arguments;
    const context = this;
    if (!inThrottle) {
      func.apply(context, args);
      inThrottle = true;
      setTimeout(() => inThrottle = false, limit);
    }
  }
};

// Throttled scroll and resize handlers
window.addEventListener('scroll', throttle(() => {
  // Additional scroll handling if needed
}, 16));

window.addEventListener('resize', throttle(() => {
  // Additional resize handling if needed
}, 100));