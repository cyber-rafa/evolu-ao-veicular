// Módulo da experiência 3D com Three.js + Anime.js

import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';

class Car3DExperience {
  constructor() {
    this.canvas = document.getElementById('webgl');
    this.infoBody = document.getElementById('info-body');
    this.statusFill = document.getElementById('status-fill');

    this.scene = new THREE.Scene();
    this.scene.background = new THREE.Color(0x0b1020);

    this.renderer = new THREE.WebGLRenderer({ canvas: this.canvas, antialias: true, alpha: true });
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 1.8));
    this.renderer.setSize(this.canvas.clientWidth || 800, this.canvas.clientHeight || 500, false);
    this.renderer.shadowMap.enabled = true;
    this.renderer.outputColorSpace = THREE.SRGBColorSpace;
    this.renderer.toneMapping = THREE.ACESFilmicToneMapping;
    this.renderer.toneMappingExposure = 1.1;
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

    this._setupLights();
    this._setupEnvironment();
    this._buildCar();
    this._bindEvents();
    this._intro();

    this.animate = this.animate.bind(this);
    requestAnimationFrame(this.animate);
  }

  _setupLights() {
    const hemi = new THREE.HemisphereLight(0xffffff, 0x223355, 0.6);
    this.scene.add(hemi);

    const dir = new THREE.DirectionalLight(0xffffff, 1.0);
    dir.position.set(5, 6, 4);
    dir.castShadow = true;
    dir.shadow.mapSize.set(2048, 2048);
    dir.shadow.camera.near = 1;
    dir.shadow.camera.far = 20;
    this.scene.add(dir);
  }

  _setupEnvironment() {
    // Chão suave
    const groundMat = new THREE.MeshStandardMaterial({ color: 0x0f1735, metalness: 0.2, roughness: 0.9 });
    const ground = new THREE.Mesh(new THREE.CylinderGeometry(10, 10, 0.2, 64), groundMat);
    ground.receiveShadow = true;
    ground.position.y = -0.1;
    this.scene.add(ground);

    // Halo/aura de energia sutil
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
    const body = new THREE.Mesh(new THREE.BoxGeometry(2.6, 0.6, 1.2, 1, 1, 1), this._material(0x2955d9));
    body.position.y = 0.6;
    body.castShadow = true;
    body.receiveShadow = true;
    body.userData.component = 'carro';
    car.add(body);
    this.objects.body = body;

    // Teto
    const roof = new THREE.Mesh(new THREE.BoxGeometry(1.4, 0.28, 1.1), this._material(0x3a6fff));
    roof.position.set(0.15, 0.95, 0);
    roof.castShadow = true;
    car.add(roof);

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

  _bindEvents() {
    window.addEventListener('resize', () => this._onResize());
    this.canvas.addEventListener('pointermove', (e) => this._onPointerMove(e));
    this.canvas.addEventListener('click', (e) => this._onClick(e));

    // Controles
    document.getElementById('btn-start').addEventListener('click', () => this.startup());
    document.getElementById('btn-charge').addEventListener('click', () => this.charge());
    document.getElementById('btn-drive').addEventListener('click', () => this.drive());
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
    return [this.objects.bateria, this.objects.motor, this.objects.inversor, this.objects.controlador, this.objects.body, ...this.wheels];
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
    const place = (mesh, el) => {
      if (!mesh || !el) return;
      const pos = mesh.position.clone();
      mesh.updateWorldMatrix(true, false);
      mesh.getWorldPosition(pos);

      const proj = pos.clone().project(this.camera);

      // Esconder se estiver fora do frustum/NDC
      if (proj.x < -1 || proj.x > 1 || proj.y < -1 || proj.y > 1 || proj.z < -1 || proj.z > 1) {
        el.style.opacity = '0';
        return;
      }

      const x = (proj.x * 0.5 + 0.5) * this.canvas.clientWidth;
      const y = (-proj.y * 0.5 + 0.5) * this.canvas.clientHeight;

      const rect = this.canvas.getBoundingClientRect();
      el.style.left = rect.left + x + 'px';
      el.style.top = rect.top + y + 'px';
      el.style.opacity = '1';
    };

    place(this.objects.bateria, this.labels.bateria);
    place(this.objects.motor, this.labels.motor);
    place(this.objects.inversor, this.labels.inversor);
    place(this.objects.controlador, this.labels.controlador);
  }

  _showInfo(component) {
    const infoMap = {
      bateria: {
        title: '🔋 Bateria de Íons de Lítio',
        color: '#20c997',
        specs: [['Capacidade', '75–100 kWh'], ['Voltagem', '400V'], ['Vida útil', '8–10 anos'], ['Carregamento', '0–80% em 30min']]
      },
      motor: {
        title: '⚙️ Motor Elétrico Síncrono',
        color: '#dc3545',
        specs: [['Potência', '250–400 hp'], ['Torque', '400–600 Nm'], ['Eficiência', '≈95%'], ['RPM máx', '15.000']]
      },
      inversor: {
        title: '🔄 Inversor de Potência',
        color: '#fd7e14',
        specs: [['Tipo', 'IGBT'], ['Frequência', '10–20 kHz'], ['Eficiência', '≈98%'], ['Refrigeração', 'Líquida']]
      },
      controlador: {
        title: '🧠 Controlador Principal',
        color: '#17a2b8',
        specs: [['Processador', 'ARM 32-bit'], ['Memória', '512 MB'], ['CAN Bus', '500 kbps'], ['Atualizações', 'OTA']]
      }
    };

    const data = infoMap[component];
    if (!data) return;

    const html = `
      <div class="component-details">
        <h4 style="margin:0 0 .25rem; color:${data.color}">${data.title}</h4>
        <div class="specs">
          ${data.specs.map(([k,v]) => `<div class="spec"><span>${k}</span><span style="color:${data.color}">${v}</span></div>`).join('')}
        </div>
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
  }

  drive() {
    // acelera rodas + leve deslocamento
    this._showInfo('motor');
    const wheels = this.wheels.map(w => w.userData.spin);
    const spin = { a: 0 };
    anime({
      targets: spin,
      a: Math.PI * 8,
      duration: 2500,
      easing: 'easeInOutSine',
      update: () => wheels.forEach(r => r.rotation.x = spin.a)
    });

    anime({
      targets: this.car.position,
      x: [{ value: 0.2, duration: 800 }, { value: -0.2, duration: 800 }, { value: 0, duration: 700 }],
      easing: 'easeInOutSine'
    });

    // vibração suave no corpo
    anime({
      targets: this.objects.body.rotation,
      z: [{ value: 0.02, duration: 300 }, { value: -0.02, duration: 300 }, { value: 0, duration: 300 }],
      easing: 'easeInOutSine'
    });

    this._ringPulse('#dc3545');
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

    // efeito idle nas rodas lento
    this.wheels.forEach(w => { w.userData.spin.rotation.x += dt * 0.8; });

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