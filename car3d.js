// Módulo da experiência 3D com Three.js + Anime.js

import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';

class Car3DExperience {
  constructor() {
    this.canvas = document.getElementById('webgl');
    this.infoBody = document.getElementById('info-body');
    this.statusFill = document.getElementById('status-fill');

    this.scene = new THREE.Scene();
    this.scene.background = new THREE.Color(0x9fb8ff);
    this.scene.fog = new THREE.Fog(0x9fb8ff, 24, 80);

    this.renderer = new THREE.WebGLRenderer({ canvas: this.canvas, antialias: true, alpha: true });
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 1.8));
    this.renderer.setSize(this.canvas.clientWidth || 800, this.canvas.clientHeight || 500, false);
    this.renderer.shadowMap.enabled = true;
    this.renderer.outputColorSpace = THREE.SRGBColorSpace;
    this.renderer.toneMapping = THREE.ACESFilmicToneMapping;
    this.renderer.toneMappingExposure = 1.35;
    this.clock = new THREE.Clock();

    const aspect = (this.canvas.clientWidth || 800) / (this.canvas.clientHeight || 500);
    this.camera = new THREE.PerspectiveCamera(55, aspect, 0.1, 100);
    this.camera.position.set(4, 2.2, 5);
    this.scene.add(this.camera);

    this.controls = new OrbitControls(this.camera, this.canvas);
    this.controls.enableDamping = true;
    this.controls.dampingFactor = 0.05;
    this.controls.maxPolarAngle = Math.PI * 0.49;
    this.controls.target.set(0, 0.4, 0);

    this.raycaster = new THREE.Raycaster();
    this.pointer = new THREE.Vector2();
    this.hovered = null;

    this.labels = {
      bateria: document.getElementById('label-bateria'),
      motor: document.getElementById('label-motor'),
      inversor: document.getElementById('label-inversor'),
      controlador: document.getElementById('label-controlador'),
    };

    this.objects = {}; // referências por nome
    this.wheels = [];
    // estado para "Separar Peças"
    this._exploded = false;
    this._orig = new Map();

    // NOVO: controlar visibilidade das labels como na combustão
    this._labelsVisible = false;
    Object.values(this.labels).forEach(el => { if (el) el.style.display = 'none'; });
    // Estrada infinita e estado de condução
    this.roadSegments = [];
    this.isDriving = false;
    this.driveSpeed = 3.2; // unidades por segundo
    this.roadLength = 22;  // mesmo tamanho do segmento de estrada (PlaneGeometry)
    this._setupLights();
    this._setupEnvironment();
    this._buildCar();
    // Novo: construir o posto de carregamento
    this._buildCharger();
    this._bindEvents();
    this._intro();

    this.animate = this.animate.bind(this);
    requestAnimationFrame(this.animate);
  }

  _setupLights() {
    const hemi = new THREE.HemisphereLight(0xfff3e0, 0x27324a, 0.95);
    this.scene.add(hemi);

    const ambient = new THREE.AmbientLight(0xffffff, 0.18);
    this.scene.add(ambient);

    const dir = new THREE.DirectionalLight(0xffffff, 1.35);
    dir.position.set(5, 7.5, 4.5);
    dir.castShadow = true;
    dir.shadow.mapSize.set(2048, 2048);
    dir.shadow.camera.near = 1;
    dir.shadow.camera.far = 20;
    this.scene.add(dir);

    const fill = new THREE.SpotLight(0x9fb7ff, 0.28, 0, Math.PI * 0.32, 0.35, 1);
    fill.position.set(-4, 4, -2);
    fill.castShadow = false;
    this.scene.add(fill);
  }

  _setupEnvironment() {
    // Estrada com asfalto e faixa central tracejada
    const createRoadSegment = () => {
      const segment = new THREE.Group();

      // Configuração igual ao carro a combustão
      const L = this.roadLength;       // comprimento do segmento
      const roadWidth = 4.2;           // largura da via (igual combustão)

      // Asfalto
      const asphaltMat = new THREE.MeshStandardMaterial({ color: 0x2b2b2b, roughness: 0.95, metalness: 0.0 });
      const road = new THREE.Mesh(new THREE.PlaneGeometry(L, roadWidth), asphaltMat);
      road.rotation.x = -Math.PI / 2;
      road.position.y = 0.001;
      road.receiveShadow = true;
      segment.add(road);

      // Linhas laterais contínuas
      const sideMat = new THREE.MeshBasicMaterial({ color: 0xffffff });
      const sideL = new THREE.Mesh(new THREE.PlaneGeometry(L, 0.06), sideMat);
      sideL.rotation.x = -Math.PI / 2;
      sideL.position.set(0, 0.002, roadWidth * 0.5 - 0.12);

      const sideR = sideL.clone();
      sideR.position.z = -roadWidth * 0.5 + 0.12;

      segment.add(sideL, sideR);

      // Faixa central tracejada
      const dashMat = new THREE.MeshBasicMaterial({ color: 0xfff6c0 });
      const dashLen = 0.9, gap = 0.7, dashW = 0.1;
      const count = Math.ceil(L / (dashLen + gap));
      for (let i = 0; i < count; i++) {
        const x = -L / 2 + i * (dashLen + gap);
        const dash = new THREE.Mesh(new THREE.PlaneGeometry(dashLen, dashW), dashMat);
        dash.rotation.x = -Math.PI / 2;
        dash.position.set(x + dashLen / 2, 0.003, 0);
        segment.add(dash);
      }

      // Gramado encostado na estrada (sem espaçamento preto)
      const grassMat = new THREE.MeshStandardMaterial({ color: 0x184d2a, roughness: 1.0, metalness: 0.0 });
      const grassLeft = new THREE.Mesh(new THREE.PlaneGeometry(L, 24), grassMat);
      grassLeft.rotation.x = -Math.PI / 2;
      grassLeft.position.set(0, -0.002, roadWidth * 0.5 + 12); // colado na borda
      grassLeft.receiveShadow = true;

      const grassRight = new THREE.Mesh(new THREE.PlaneGeometry(L, 24), grassMat);
      grassRight.rotation.x = -Math.PI / 2;
      grassRight.position.set(0, -0.002, -roadWidth * 0.5 - 12);
      grassRight.receiveShadow = true;

      segment.add(grassLeft, grassRight);

      // Materiais e geometria base das árvores (mantidas e reposicionadas conforme nova largura)
      const trunkMat = new THREE.MeshStandardMaterial({ color: 0x5a3c1e, roughness: 0.9, metalness: 0.0 });
      const leafMat = new THREE.MeshStandardMaterial({ color: 0x2e7d32, roughness: 0.85, metalness: 0.0 });
      const trunkGeo = new THREE.CylinderGeometry(0.07, 0.09, 0.8, 8);
      const leafGeo = new THREE.ConeGeometry(0.5, 1.2, 12);

      const makeTree = () => {
        const g = new THREE.Group();
        const trunk = new THREE.Mesh(trunkGeo, trunkMat);
        trunk.position.y = 0.4;
        trunk.castShadow = true;
        const leaves = new THREE.Mesh(leafGeo, leafMat);
        leaves.position.y = 1.2;
        leaves.castShadow = true;
        g.add(trunk, leaves);
        return g;
      };

      const addTrees = (baseZ, count) => {
        const trees = new THREE.Group();
        for (let i = 0; i < count; i++) {
          const t = makeTree();
          const x = -L / 2 + 1 + Math.random() * (L - 2);          // ao longo do segmento
          const z = baseZ + (Math.random() * 6 - 3);                // leve variação lateral
          const s = 0.85 + Math.random() * 0.6;                     // variação de tamanho
          t.position.set(x, 0, z);
          t.rotation.y = Math.random() * Math.PI * 2;
          t.scale.setScalar(s);
          trees.add(t);
        }
        segment.add(trees);
      };

      addTrees(roadWidth * 0.5 + 9, 12);   // lado esquerdo
      addTrees(-roadWidth * 0.5 - 9, 12);  // lado direito

      return segment;
    };
  
    // Cria dois segmentos para loop contínuo
    const segA = createRoadSegment();
    segA.position.x = 0;
    this.scene.add(segA);
  
    const segB = createRoadSegment();
    segB.position.x = this.roadLength;
    this.scene.add(segB);
  
    this.roadSegments = [segA, segB];

    // Aura energética sutil (mantida)
    const ringGeo = new THREE.RingGeometry(1.4, 1.65, 64);
    const ringMat = new THREE.MeshBasicMaterial({ color: 0x4f8cff, transparent: true, opacity: 0.15, side: THREE.DoubleSide });
    const ring = new THREE.Mesh(ringGeo, ringMat);
    ring.rotation.x = -Math.PI / 2;
    ring.position.y = 0.02;
    this.scene.add(ring);
    this.energyRing = ring;
  }

  _material(color) {
    return new THREE.MeshStandardMaterial({
      color,
      metalness: 0.6,
      roughness: 0.35,
      envMapIntensity: 1.0
    });
  }

  _buildCar() {
    const car = new THREE.Group();
    car.name = 'car';

    // Corpo
    const body = new THREE.Mesh(new THREE.BoxGeometry(2.6, 0.6, 1.2, 1, 1, 1), this._material(0xffffff));
    body.position.y = 0.6;
    body.castShadow = true;
    body.receiveShadow = true;
    body.userData.component = 'carro';
    car.add(body);
    this.objects.body = body;

    // Teto
    const roof = new THREE.Mesh(new THREE.BoxGeometry(1.4, 0.28, 1.1), this._material(0xffffff));
    roof.position.set(0.15, 0.95, 0);
    roof.castShadow = true;
    car.add(roof);
    this.objects.roof = roof;

    // Rodas
    const wheelMat = new THREE.MeshStandardMaterial({ color: 0x222222, metalness: 0.2, roughness: 0.8 });
    const rimMat = new THREE.MeshStandardMaterial({ color: 0x8aa3ff, metalness: 1.0, roughness: 0.2, emissive: 0x112244, emissiveIntensity: 0.2 });

    const wheel = () => {
      const g = new THREE.Group();
      const tyre = new THREE.Mesh(new THREE.CylinderGeometry(0.33, 0.33, 0.22, 32), wheelMat);
      tyre.rotation.z = Math.PI / 2; tyre.castShadow = true; tyre.receiveShadow = true;
      const rim = new THREE.Mesh(new THREE.CylinderGeometry(0.2, 0.2, 0.24, 24), rimMat);
      rim.rotation.z = Math.PI / 2;
      g.add(tyre, rim);
      g.userData.spin = rim; // para fácil rotação
      return g;
    };

    const w1 = wheel(); w1.position.set(0.95, 0.33, 0.55);
    const w2 = wheel(); w2.position.set(-0.95, 0.33, 0.55);
    const w3 = wheel(); w3.position.set(0.95, 0.33, -0.55);
    const w4 = wheel(); w4.position.set(-0.95, 0.33, -0.55);
    [w1,w2,w3,w4].forEach(w => { car.add(w); this.wheels.push(w); });

    // Componentes internos
    // Bateria
    const battery = new THREE.Mesh(new THREE.BoxGeometry(1.6, 0.18, 0.9), this._material(0x20c997));
    battery.position.set(0, 0.35, 0);
    battery.castShadow = true;
    battery.userData.component = 'bateria';
    car.add(battery);
    this.objects.bateria = battery;

    // Inversor
    const inverter = new THREE.Mesh(new THREE.BoxGeometry(0.6, 0.16, 0.35), this._material(0xfd7e14));
    inverter.position.set(0.4, 0.7, -0.18);
    inverter.castShadow = true;
    inverter.userData.component = 'inversor';
    car.add(inverter);
    this.objects.inversor = inverter;

    // Controlador
    const controller = new THREE.Mesh(new THREE.BoxGeometry(0.5, 0.14, 0.3), this._material(0x17a2b8));
    controller.position.set(-0.35, 0.72, 0.2);
    controller.castShadow = true;
    controller.userData.component = 'controlador';
    car.add(controller);
    this.objects.controlador = controller;

    // Motor
    const motor = new THREE.Mesh(new THREE.CylinderGeometry(0.26, 0.26, 0.4, 32), this._material(0xdc3545));
    motor.rotation.z = Math.PI / 2;
    motor.position.set(1.15, 0.58, 0);
    motor.castShadow = true;
    motor.userData.component = 'motor';
    car.add(motor);
    this.objects.motor = motor;

    this.scene.add(car);
    this.car = car;

    // Captura posições/rotações originais para explode/recolher
    this._captureOriginalTransforms();

    // Flutuação sutil
    anime({
      targets: this.car.position,
      y: [this.car.position.y, this.car.position.y + 0.04],
      duration: 2400,
      easing: 'easeInOutSine',
      direction: 'alternate',
      loop: true
    });
  }

  // Salva transformações iniciais dos componentes e rodas
  _captureOriginalTransforms() {
    const save = (obj) => {
      if (!obj) return;
      this._orig.set(obj, {
        pos: obj.position.clone(),
        rot: obj.rotation.clone()
      });
    };
    save(this.objects.bateria);
    save(this.objects.inversor);
    save(this.objects.controlador);
    save(this.objects.motor);
    save(this.objects.roof);
    this.wheels.forEach(w => save(w));
  }

  // Alterna entre separar e recolher as peças
  explode() {
    const btn = document.getElementById('btn-explode');

    const moveTo = (obj, target, duration = 700) => {
      if (!obj) return;
      anime.remove(obj.position);
      anime({
        targets: obj.position,
        x: target.x, y: target.y, z: target.z,
        duration,
        easing: 'easeInOutQuad'
      });
    };

    if (!this._exploded) {
      const o = (obj) => this._orig.get(obj)?.pos || obj.position.clone();
      const add = (a, b) => new THREE.Vector3(a.x + b.x, a.y + b.y, a.z + b.z);

      moveTo(this.objects.motor,       add(o(this.objects.motor),       new THREE.Vector3( 1.4, 0.20,  0.0)));
      moveTo(this.objects.bateria,     add(o(this.objects.bateria),     new THREE.Vector3(-1.4, 0.20, -1.1)));
      moveTo(this.objects.inversor,    add(o(this.objects.inversor),    new THREE.Vector3( 0.8, 0.25,  1.1)));
      moveTo(this.objects.controlador, add(o(this.objects.controlador), new THREE.Vector3(-0.9, 0.25,  1.1)));
      if (this.objects.roof) {
        moveTo(this.objects.roof, add(o(this.objects.roof), new THREE.Vector3(0, 0.9, 0)));
      }
      this.wheels.forEach((w, idx) => {
        const offset = (idx % 2 === 0) ? 0.35 : -0.35;
        moveTo(w, add(o(w), new THREE.Vector3(0, 0.1, offset)), 650);
      });

      this._ringPulse('#4f8cff');
      this._exploded = true;
      if (btn) btn.textContent = 'Recolher Peças';

      // NOVO: mostrar labels quando separar as peças
      this._labelsVisible = true;
      this._positionLabels();
    } else {
      // Restaurar posições originais
      this._orig.forEach((val, obj) => moveTo(obj, val.pos, 650));
      this._ringPulse('#4f8cff');
      this._exploded = false;
      if (btn) btn.textContent = 'Separar Peças';

      // NOVO: esconder labels quando recolher
      this._labelsVisible = false;
      Object.values(this.labels).forEach(el => { if (el) el.style.display = 'none'; });
    }
  }

  _bindEvents() {
    window.addEventListener('resize', () => this._onResize());
    this.canvas.addEventListener('pointermove', (e) => this._onPointerMove(e));
    this.canvas.addEventListener('click', (e) => this._onClick(e));

    // Controles
    document.getElementById('btn-start').addEventListener('click', () => this.startup());
    document.getElementById('btn-charge').addEventListener('click', () => this.charge());
    document.getElementById('btn-drive').addEventListener('click', () => this.drive());
    document.getElementById('btn-explode').addEventListener('click', () => this.explode());
    document.getElementById('btn-reset').addEventListener('click', () => this.reset());
    document.getElementById('btn-reset-cam').addEventListener('click', () => this.resetCamera());
  }

  _intro() {
    // Barrinha de status entrando
    anime({ targets: this.statusFill, width: ['0%', '85%'], duration: 1600, delay: 300, easing: 'easeInOutQuad' });
    // Títulos (reaproveita classes anime-title-1/2 para harmonizar com seu projeto)
    if (window.anime) {
      anime({
        targets: '.anime-title-1',
        translateY: [-10, 0],
        opacity: [0, 1],
        duration: 800,
        easing: 'easeOutExpo'
      });
      anime({
        targets: '.anime-title-2',
        translateY: [-10, 0],
        opacity: [0, 1],
        scale: [0.95, 1],
        duration: 900,
        delay: 150,
        easing: 'easeOutBack'
      });
    }
  }

  _onResize() {
    const width = this.canvas.clientWidth || this.canvas.parentElement.clientWidth;
    const height = this.canvas.clientHeight || this.canvas.parentElement.clientHeight;
    this.renderer.setSize(width, height, false);
    this.camera.aspect = width / height;
    this.camera.updateProjectionMatrix();
    if (this.composer) this.composer.setSize(width, height);
  }

  _updateRay(e) {
    const rect = this.canvas.getBoundingClientRect();
    this.pointer.x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
    this.pointer.y = -((e.clientY - rect.top) / rect.height) * 2 + 1;
    this.raycaster.setFromCamera(this.pointer, this.camera);
  }

  _intersectables() {
    return [this.objects.bateria, this.objects.motor, this.objects.inversor, this.objects.controlador, this.objects.body, ...this.wheels, ...(this.chargerInteract || [])];
  }

  _onPointerMove(e) {
    this._updateRay(e);
    const hits = this.raycaster.intersectObjects(this._intersectables(), false);
    const first = hits[0]?.object || null;

    if (this.hovered !== first) {
      if (this.hovered && this.hovered.material?.emissive) {
        anime.remove(this.hovered.material);
        this.hovered.material.emissiveIntensity = 0.2;
      }
      this.hovered = first;
      if (this.hovered && this.hovered.material?.emissive) {
        anime({
          targets: this.hovered.material,
          emissiveIntensity: [this.hovered.material.emissiveIntensity ?? 0.2, 0.9],
          duration: 320,
          easing: 'easeOutQuad'
        });
      }
    }

    // Atualiza labels
    this._positionLabels();
  }

  _onClick(e) {
    this._updateRay(e);
    const hits = this.raycaster.intersectObjects(this._intersectables(), false);
    const obj = hits[0]?.object;
    if (!obj) return;

    const comp = obj.userData.component;
    if (!comp) return;

    this._showInfo(comp);
    this._pulse(obj.scale);
  }

  _pulse(target) {
    anime.remove(target);
    anime({
      targets: target,
      x: [{ value: 1.08, duration: 150 }, { value: 1.0, duration: 250 }],
      y: [{ value: 1.08, duration: 150 }, { value: 1.0, duration: 250 }],
      z: [{ value: 1.08, duration: 150 }, { value: 1.0, duration: 250 }],
      easing: 'easeOutBack'
    });
  }

  _positionLabels() {
    // Esconde rapidamente se não for para mostrar
    if (!this._labelsVisible) {
      Object.values(this.labels).forEach(el => { if (el) el.style.display = 'none'; });
      return;
    }

    const width = this.canvas.clientWidth || this.canvas.parentElement.clientWidth;
    const height = this.canvas.clientHeight || this.canvas.parentElement.clientHeight;

    const toScreen = (mesh, el) => {
      if (!mesh || !el) return;
      const p = mesh.getWorldPosition(new THREE.Vector3()).clone().project(this.camera);

      // Mostra só se estiver no frustum e à frente da câmera
      if (p.z < 1 && p.x >= -1 && p.x <= 1 && p.y >= -1 && p.y <= 1) {
        const x = (p.x * 0.5 + 0.5) * width;
        const y = (-p.y * 0.5 + 0.5) * height;
        el.style.display = 'block';
        el.style.left = `${x}px`;
        el.style.top = `${y}px`;
        el.style.opacity = '0.95';
      } else {
        el.style.display = 'none';
      }
    };

    toScreen(this.objects.bateria, this.labels.bateria);
    toScreen(this.objects.motor, this.labels.motor);
    toScreen(this.objects.inversor, this.labels.inversor);
    toScreen(this.objects.controlador, this.labels.controlador);
  }

  _showInfo(component) {
    const infoMap = {
      bateria: {
        title: '🔋 Bateria de Íons de Lítio',
        color: '#20c997',
        html: `
          <p>Armazena a energia elétrica que alimenta todo o sistema de tração do veículo.</p>
          <ul>
            <li>Fornece corrente contínua (CC) para o inversor</li>
            <li>Define a autonomia e pode ser recarregada em tomadas/estações</li>
            <li>Possui sistemas de gerenciamento térmico e de carga (BMS)</li>
            <li>Pode recuperar energia durante frenagens (regen)</li>
          </ul>
        `
      },
      motor: {
        title: '⚙️ Motor Elétrico Síncrono',
        color: '#dc3545',
        html: `
          <p>Converte energia elétrica em movimento rotacional de forma silenciosa e eficiente.</p>
          <ul>
            <li>Entrega torque instantâneo às rodas</li>
            <li>Tem poucas partes móveis e baixa manutenção</li>
            <li>Opera com corrente alternada trifásica controlada pelo inversor</li>
            <li>Pode funcionar como gerador durante a frenagem regenerativa</li>
          </ul>
        `
      },
      inversor: {
        title: '🔄 Inversor de Potência',
        color: '#fd7e14',
        html: `
          <p>Transforma a energia da bateria (CC) em corrente alternada (CA) para o motor, controlando velocidade e torque.</p>
          <ul>
            <li>Modula frequência e tensão para acelerar, manter velocidade ou frear</li>
            <li>Gerencia o fluxo reverso de energia na regeneração</li>
            <li>Conta com sistemas de proteção e refrigeração</li>
            <li>Integra-se ao controlador para respostas suaves e seguras</li>
          </ul>
        `
      },
      controlador: {
        title: '🧠 Controlador Principal',
        color: '#17a2b8',
        html: `
          <p>Unidade eletrônica que coordena todo o trem de força elétrico.</p>
          <ul>
            <li>Orquestra a comunicação entre bateria, inversor e motor</li>
            <li>Gerencia modos de condução, segurança e limites de potência</li>
            <li>Coleta dados e executa estratégias de eficiência</li>
            <li>Permite diagnósticos e atualizações de software</li>
          </ul>
        `
      }
    };

    const data = infoMap[component];
    if (!data) return;

    const html = `
      <div class="component-details" style="font-size:1.08rem; line-height:1.55;">
        <h4 style="margin:0 0 .5rem; color:${data.color}; font-size:1.2rem;">${data.title}</h4>
        ${data.html}
      </div>
    `;

    // Transição do painel (Anime.js)
    const tmp = document.createElement('div');
    tmp.innerHTML = html;
    this.infoBody.innerHTML = '';
    this.infoBody.appendChild(tmp);

    anime({
      targets: this.infoBody,
      opacity: [0, 1],
      translateY: [6, 0],
      duration: 400,
      easing: 'easeOutQuad'
    });

    // realce da aura
    this._ringPulse(data.color);
  }

  _ringPulse(colorHex) {
    anime.remove(this.energyRing.material);
    const c = new THREE.Color(colorHex);
    this.energyRing.material.color = c;
    anime({
      targets: this.energyRing.material,
      opacity: [{ value: 0.36, duration: 220 }, { value: 0.15, duration: 600 }],
      easing: 'easeOutQuad'
    });
  }

  startup() {
    // sequência de "sistema iniciando": saltos sutis dos componentes
    const seq = [
      this.objects.controlador,
      this.objects.bateria,
      this.objects.inversor,
      this.objects.motor
    ];
    seq.forEach((obj, i) => {
      setTimeout(() => this._pulse(obj.scale), i * 200);
    });

    anime({
      targets: this.statusFill,
      width: ['0%', '85%'],
      duration: 1200,
      easing: 'easeInOutQuad'
    });

    this._showInfo('controlador');
  }

  charge() {
    // simula barra de carga na bateria
    this._showInfo('bateria');
    const target = { p: 0 };
    anime({
      targets: target,
      p: 100,
      duration: 3000,
      easing: 'linear',
      update: () => {
        // muda emissive e escala sutil da bateria
        const m = this.objects.bateria.material;
        if (m) {
          m.emissive = new THREE.Color(0x20c997);
          m.emissiveIntensity = 0.2 + 0.8 * (target.p / 100);
        }
        this.objects.bateria.scale.setScalar(1 + 0.03 * Math.sin(target.p / 8));
        this.statusFill.style.width = `${Math.min(100, target.p)}%`;
      },
      complete: () => {
        this.statusFill.style.width = '100%';
      }
    });

    // Novo: pulsar aro da estação enquanto carrega
    if (this.chargerRingMat) {
      anime.remove(this.chargerRingMat);
      anime({
        targets: this.chargerRingMat,
        emissiveIntensity: [
          { value: 1.2, duration: 400, easing: 'easeOutQuad' },
          { value: 0.2, duration: 600, easing: 'easeInQuad' }
        ],
        loop: 4
      });
    }
  }

  drive() {
    // Alterna condução contínua
    const btn = document.getElementById('btn-drive');
    this.isDriving = !this.isDriving;

    if (this.isDriving) {
      this._showInfo('motor');
      this._ringPulse('#dc3545');
      if (btn) btn.textContent = 'Parar';

      // vibração contínua no corpo enquanto dirige
      anime.remove(this.objects.body.rotation);
      anime({
        targets: this.objects.body.rotation,
        z: [{ value: 0.02, duration: 300 }, { value: -0.02, duration: 300 }],
        easing: 'easeInOutSine',
        direction: 'alternate',
        loop: true
      });

      // leve deslocamento lateral enquanto dirige (opcional)
      anime.remove(this.car.position);
      anime({
        targets: this.car.position,
        x: [{ value: 0.2, duration: 800 }, { value: -0.2, duration: 800 }],
        easing: 'easeInOutSine',
        direction: 'alternate',
        loop: true
      });
    } else {
      if (btn) btn.textContent = 'Dirigir';

      // parar vibração do corpo
      anime.remove(this.objects.body.rotation);
      this.objects.body.rotation.z = 0;

      // reposicionar estrada e resetar rodas (evita “saltos” quando retomar)
      if (this.roadSegments?.length >= 2) {
        this.roadSegments[0].position.x = 0;
        this.roadSegments[1].position.x = this.roadLength;
      }
      this.wheels.forEach(w => { w.userData.spin.rotation.x = 0; });

      this._ringPulse('#4f8cff');
    }
  }

  reset() {
    this.infoBody.innerHTML = 'Clique em um componente para ver detalhes. Use os botões abaixo para simular cenários.';
    this.statusFill.style.width = '0%';

    // materiais emissivos reset
    [this.objects.bateria, this.objects.inversor, this.objects.controlador, this.objects.motor].forEach(o => {
      if (o?.material) { o.material.emissiveIntensity = 0.2; }
      o.scale.set(1,1,1);
    });

    anime.remove(this.car.position);
    this.car.position.set(0, this.car.position.y, 0);

    // restabelece flutuação
    anime({
      targets: this.car.position,
      y: [this.car.position.y, this.car.position.y + 0.04],
      duration: 2400,
      easing: 'easeInOutSine',
      direction: 'alternate',
      loop: true
    });

    this._ringPulse('#4f8cff');

    // Parar condução e restaurar botão + reposicionar estrada/rodas
    this.isDriving = false;
    const btn = document.getElementById('btn-drive');
    if (btn) btn.textContent = 'Dirigir';

    if (this.roadSegments?.length >= 2) {
        this.roadSegments[0].position.x = 0;
        this.roadSegments[1].position.x = this.roadLength;
    }
    this.wheels.forEach(w => { w.userData.spin.rotation.x = 0; });

    // NOVO: esconder labels ao resetar
    this._labelsVisible = false;
    Object.values(this.labels).forEach(el => { if (el) el.style.display = 'none'; });
  }

  resetCamera() {
    this.controls.target.set(0, 0.4, 0);
    this.camera.position.set(4, 2.2, 5);
    this.controls.update();
  }

  _hideLoading() {
    const ld = document.getElementById('loading');
    if (!ld) return;
    ld.style.opacity = '0';
    setTimeout(() => ld.remove(), 450);
  }

  animate() {
    const dt = this.clock.getDelta();
    this.controls.update();
  
    // Movimento da estrada contínuo + rotação das rodas proporcional à velocidade
    if (this.isDriving && this.roadSegments.length) {
      const dx = this.driveSpeed * dt;
  
      this.roadSegments.forEach(seg => {
        seg.position.x -= dx;
        if (seg.position.x < -this.roadLength) {
          seg.position.x += this.roadLength * 2; // recicla o segmento para a frente
        }
      });
  
      // velocidade angular das rodas ~ v / r
      const wheelRadius = 0.33;
      const angVel = this.driveSpeed / wheelRadius;
      this.wheels.forEach(w => { w.userData.spin.rotation.x += angVel * dt; });
    } else {
      // efeito idle nas rodas lento
      this.wheels.forEach(w => { w.userData.spin.rotation.x += dt * 0.8; });
    }
  
    // Reposiciona as labels para ficarem corretas em cada componente
    this._positionLabels();
  
    // Render via composer (com bloom)
    if (this.composer) {
      this.composer.render();
    } else {
      this.renderer.render(this.scene, this.camera);
    }
  
    // Esconde overlay no primeiro frame renderizado
    if (!this._didHideLoading) {
      this._didHideLoading = true;
      this._hideLoading();
    }
  
    requestAnimationFrame(this.animate);
  }
}

function bootstrap() {
  // Garante tamanho inicial coerente com o container
  const canvas = document.getElementById('webgl');
  const parent = canvas.parentElement;
  canvas.width = parent.clientWidth;
  canvas.height = Math.max(360, parent.clientHeight);

  new Car3DExperience();
}

document.addEventListener('DOMContentLoaded', bootstrap);