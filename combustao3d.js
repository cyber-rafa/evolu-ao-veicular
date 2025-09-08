// Experiência 3D - Carro a Combustão (Three.js + Anime.js)
import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';

class CombustionCar3DExperience {
  // Dentro da classe CombustionCar3DExperience
  constructor() {
    this.canvas = document.getElementById('webgl');
    this.infoBody = document.getElementById('info-body');
    this.statusFill = document.getElementById('status-fill');

    this.scene = new THREE.Scene();
    this.scene.background = new THREE.Color(0x9fb8ff);
    this.scene.fog = new THREE.Fog(0x9fb8ff, 20, 70);

    this.renderer = new THREE.WebGLRenderer({ canvas: this.canvas, antialias: true, alpha: true });
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 1.8));
    this.renderer.setSize(this.canvas.clientWidth || 800, this.canvas.clientHeight || 500, false);
    this.renderer.shadowMap.enabled = true;
    this.renderer.outputColorSpace = THREE.SRGBColorSpace;
    this.renderer.toneMapping = THREE.ACESFilmicToneMapping;
    this.renderer.toneMappingExposure = 1.28;

    const aspect = (this.canvas.clientWidth || 800) / (this.canvas.clientHeight || 500);
    this.camera = new THREE.PerspectiveCamera(55, aspect, 0.1, 100);
    this.camera.position.set(4.4, 2.3, 5.6);
    this.scene.add(this.camera);

    this.controls = new OrbitControls(this.camera, this.canvas);
    this.controls.enableDamping = true;
    this.controls.dampingFactor = 0.06;
    this.controls.maxPolarAngle = Math.PI * 0.49;
    this.controls.target.set(0, 0.45, 0);

    this.clock = new THREE.Clock();
    this.raycaster = new THREE.Raycaster();
    this.pointer = new THREE.Vector2();
    this.hovered = null;

    this.labels = {
      motor: document.getElementById('label-motor'),
      tanque: document.getElementById('label-tanque'),
      escapamento: document.getElementById('label-escapamento'),
      radiador: document.getElementById('label-radiador'),
      cambio: document.getElementById('label-cambio'),
    };

    this.objects = {}; // refs por nome
    this.wheels = [];
    this._exhaustPuffs = []; // efeitos temporários de escapamento

    // FIX: initialize road/driving state to avoid "Cannot read properties of undefined (reading 'push')"
    this.roadSegments = [];
    this.roadLength = 16;   // comprimento de cada segmento da estrada (em unidades da cena)
    this.driveSpeed = 8;    // velocidade da estrada quando "dirigindo"
    this.isDriving = false; // começa parado
    this._aura = null;      // halo desativado, mas mantido definido
    this._didHideLoading = false;

    this._setupLights();
    this._setupEnvironment();
    this._buildCar();
    this._bindEvents();
    this._intro();

    this.animate = this.animate.bind(this);
    requestAnimationFrame(this.animate);
  }

  _setupLights() {
    const hemi = new THREE.HemisphereLight(0xfff3e0, 0x2a2f45, 1.0);
    this.scene.add(hemi);

    const ambient = new THREE.AmbientLight(0xffffff, 0.22);
    this.scene.add(ambient);

    const dir = new THREE.DirectionalLight(0xffffff, 1.45);
    dir.position.set(6, 7, 5);
    dir.castShadow = true;
    dir.shadow.mapSize.set(2048, 2048);
    dir.shadow.camera.near = 1;
    dir.shadow.camera.far = 30;
    this.scene.add(dir);

    const fill = new THREE.SpotLight(0xb3c7ff, 0.5, 0, Math.PI * 0.30, 0.35, 1);
    fill.position.set(-4, 4, -2);
    fill.castShadow = false;
    this.scene.add(fill);
  }

  _setupEnvironment() {
    // (Sem círculo/halo)
    // Antes havia um RingGeometry aqui; removido para não exibir nenhum círculo.

    // Estrada com 3 segmentos (loop contínuo)
    const L = this.roadLength;      // comprimento de cada segmento
    const roadWidth = 4.2;          // largura da via

    const makeSegment = () => {
      const g = new THREE.Group();

      // Asfalto
      const asphaltMat = new THREE.MeshStandardMaterial({ color: 0x2b2b2b, roughness: 0.95, metalness: 0.0 });
      const asphalt = new THREE.Mesh(new THREE.PlaneGeometry(L, roadWidth), asphaltMat);
      asphalt.rotation.x = -Math.PI / 2;
      asphalt.position.y = 0.001;
      asphalt.receiveShadow = true;
      g.add(asphalt);

      // Linhas laterais contínuas
      const sideMat = new THREE.MeshBasicMaterial({ color: 0xffffff });
      const sideL = new THREE.Mesh(new THREE.PlaneGeometry(L, 0.06), sideMat);
      sideL.rotation.x = -Math.PI / 2;
      sideL.position.set(0, 0.002, roadWidth * 0.5 - 0.12);

      const sideR = sideL.clone();
      sideR.position.z = -roadWidth * 0.5 + 0.12;

      g.add(sideL, sideR);

      // Faixa central tracejada
      const dashMat = new THREE.MeshBasicMaterial({ color: 0xfff6c0 });
      const dashLen = 0.9, gap = 0.7, dashW = 0.1;
      const count = Math.ceil(L / (dashLen + gap));
      for (let i = 0; i < count; i++) {
        const x = -L / 2 + i * (dashLen + gap);
        const dash = new THREE.Mesh(new THREE.PlaneGeometry(dashLen, dashW), dashMat);
        dash.rotation.x = -Math.PI / 2;
        dash.position.set(x + dashLen / 2, 0.003, 0);
        g.add(dash);
      }

      // NOVO: gramado e árvores
      const grassMat = new THREE.MeshStandardMaterial({ color: 0x184d2a, roughness: 1.0, metalness: 0.0 });
      const grassLeft = new THREE.Mesh(new THREE.PlaneGeometry(L, 24), grassMat);
      grassLeft.rotation.x = -Math.PI / 2;
      grassLeft.position.set(0, -0.002, 12);
      grassLeft.receiveShadow = true;

      const grassRight = new THREE.Mesh(new THREE.PlaneGeometry(L, 24), grassMat);
      grassRight.rotation.x = -Math.PI / 2;
      grassRight.position.set(0, -0.002, -12);
      grassRight.receiveShadow = true;

      g.add(grassLeft, grassRight);

      // Materiais e geometria das árvores
      const trunkMat = new THREE.MeshStandardMaterial({ color: 0x5a3c1e, roughness: 0.9, metalness: 0.0 });
      const leafMat = new THREE.MeshStandardMaterial({ color: 0x2e7d32, roughness: 0.85, metalness: 0.0 });
      const trunkGeo = new THREE.CylinderGeometry(0.07, 0.09, 0.8, 8);
      const leafGeo = new THREE.ConeGeometry(0.5, 1.2, 12);

      const makeTree = () => {
        const t = new THREE.Group();
        const trunk = new THREE.Mesh(trunkGeo, trunkMat);
        trunk.position.y = 0.4;
        trunk.castShadow = true;

        const leaves = new THREE.Mesh(leafGeo, leafMat);
        leaves.position.y = 1.2;
        leaves.castShadow = true;

        t.add(trunk, leaves);
        return t;
      };

      const addTrees = (baseZ, qty) => {
        const treesGroup = new THREE.Group();
        for (let i = 0; i < qty; i++) {
          const tree = makeTree();
          const margin = 1.0;
          const x = -L / 2 + margin + Math.random() * (L - 2 * margin); // espalha ao longo do segmento
          const z = baseZ + (Math.random() * 6 - 3);                    // leve variação lateral
          const s = 0.85 + Math.random() * 0.6;                          // variação de escala
          tree.position.set(x, 0, z);
          tree.rotation.y = Math.random() * Math.PI * 2;
          tree.scale.setScalar(s);
          treesGroup.add(tree);
        }
        g.add(treesGroup);
      };

      addTrees(10, 10);   // lado esquerdo (Z positivo)
      addTrees(-10, 10);  // lado direito (Z negativo)

      return g;
    };

    const s0 = makeSegment(); s0.position.x = -L;
    const s1 = makeSegment();
    const s2 = makeSegment(); s2.position.x = L;

    this.scene.add(s0, s1, s2);
    this.roadSegments.push(s0, s1, s2);
  }

  _material(color) {
    return new THREE.MeshStandardMaterial({
      color,
      metalness: 0.6,
      roughness: 0.35,
      envMapIntensity: 1.0,
      emissive: new THREE.Color(0x000000),
      emissiveIntensity: 0.2
    });
  }

  _buildCar() {
    const car = new THREE.Group();
    car.name = 'car';

    // Corpo
    const body = new THREE.Mesh(new THREE.BoxGeometry(2.8, 0.62, 1.25), this._material(0x9b1c31));
    body.position.y = 0.62;
    body.castShadow = true;
    body.receiveShadow = true;
    car.add(body);
    this.objects.body = body;

    // Capô e teto
    const hood = new THREE.Mesh(new THREE.BoxGeometry(0.9, 0.22, 1.18), this._material(0x7f1527));
    hood.position.set(0.85, 0.93, 0);
    hood.castShadow = true;
    car.add(hood);

    const roof = new THREE.Mesh(new THREE.BoxGeometry(1.3, 0.24, 1.1), this._material(0xb0293f));
    roof.position.set(-0.1, 0.98, 0);
    roof.castShadow = true;
    car.add(roof);

    // Para-choques
    const bumperF = new THREE.Mesh(new THREE.BoxGeometry(0.22, 0.22, 1.26), this._material(0x3a3a3a));
    bumperF.position.set(1.4, 0.48, 0);
    car.add(bumperF);
    const bumperR = new THREE.Mesh(new THREE.BoxGeometry(0.22, 0.22, 1.26), this._material(0x3a3a3a));
    bumperR.position.set(-1.4, 0.48, 0);
    car.add(bumperR);

    // Rodas
    const tyreMat = new THREE.MeshStandardMaterial({ color: 0x222222, metalness: 0.2, roughness: 0.85 });
    const rimMat = new THREE.MeshStandardMaterial({ color: 0xe3e3e3, metalness: 1.0, roughness: 0.25, emissive: 0x111111, emissiveIntensity: 0.15 });
    const wheel = () => {
      const g = new THREE.Group();
      const tyre = new THREE.Mesh(new THREE.CylinderGeometry(0.34, 0.34, 0.24, 32), tyreMat);
      tyre.rotation.z = Math.PI / 2; tyre.castShadow = true; tyre.receiveShadow = true;
      const rim = new THREE.Mesh(new THREE.CylinderGeometry(0.21, 0.21, 0.25, 24), rimMat);
      rim.rotation.z = Math.PI / 2;
      g.add(tyre, rim);
      g.userData.spin = rim;
      return g;
    };
    const w1 = wheel(); w1.position.set(0.98, 0.35, 0.6);
    const w2 = wheel(); w2.position.set(-1.0, 0.35, 0.6);
    const w3 = wheel(); w3.position.set(0.98, 0.35, -0.6);
    const w4 = wheel(); w4.position.set(-1.0, 0.35, -0.6);
    [w1, w2, w3, w4].forEach(w => { car.add(w); this.wheels.push(w); });

    // Componentes a combustão
    // Motor (ICE)
    const motor = new THREE.Mesh(new THREE.BoxGeometry(0.6, 0.28, 0.45), this._material(0xd94848));
    motor.position.set(1.0, 0.68, 0);
    motor.castShadow = true;
    motor.userData.component = 'motor';
    car.add(motor);
    this.objects.motor = motor;

    // Radiador (frente)
    const radiador = new THREE.Mesh(new THREE.BoxGeometry(0.55, 0.28, 0.06), this._material(0x4f83a1));
    radiador.position.set(1.32, 0.62, 0);
    radiador.castShadow = true;
    radiador.userData.component = 'radiador';
    car.add(radiador);
    this.objects.radiador = radiador;

    // Câmbio (centro)
    const cambio = new THREE.Mesh(new THREE.BoxGeometry(0.4, 0.2, 0.3), this._material(0x8c6b3e));
    cambio.position.set(0.35, 0.56, 0);
    cambio.castShadow = true;
    cambio.userData.component = 'cambio';
    car.add(cambio);
    this.objects.cambio = cambio;

    // Tanque (traseira)
    const tanque = new THREE.Mesh(new THREE.BoxGeometry(0.9, 0.22, 0.7), this._material(0x2b9348));
    tanque.position.set(-1.0, 0.45, 0);
    tanque.castShadow = true;
    tanque.userData.component = 'tanque';
    car.add(tanque);
    this.objects.tanque = tanque;

    // Escapamento (tubo traseiro)
    const escapamento = new THREE.Mesh(new THREE.CylinderGeometry(0.06, 0.06, 0.9, 20), this._material(0x8b8b8b));
    escapamento.rotation.z = Math.PI / 2;
    escapamento.position.set(-1.4, 0.36, -0.35);
    escapamento.castShadow = true;
    escapamento.userData.component = 'escapamento';
    car.add(escapamento);
    this.objects.escapamento = escapamento;

    // Ponteira do escapamento (para efeito de "puff")
    const ponteira = new THREE.Mesh(new THREE.CylinderGeometry(0.08, 0.08, 0.2, 16), this._material(0xcccccc));
    ponteira.rotation.z = Math.PI / 2;
    ponteira.position.set(-1.86, 0.36, -0.35);
    ponteira.castShadow = true;
    car.add(ponteira);
    this.objects.ponteira = ponteira;

    this.scene.add(car);
    this.car = car;

    // Captura posições originais para separar/recolher
    this._captureOriginalTransforms();

    // Oscilação sutil do carro
    if (window.anime) {
      anime({
        targets: this.car.position,
        y: [this.car.position.y, this.car.position.y + 0.035],
        duration: 2500,
        direction: 'alternate',
        easing: 'easeInOutSine',
        loop: true
      });
    }
  }

  // Salva transformações iniciais dos componentes e rodas
  _captureOriginalTransforms() {
    if (!this._orig) this._orig = new Map();
    const save = (obj) => {
      if (!obj) return;
      this._orig.set(obj, {
        pos: obj.position.clone(),
        rot: obj.rotation.clone(),
      });
    };
    save(this.objects.motor);
    save(this.objects.tanque);
    save(this.objects.escapamento);
    save(this.objects.radiador);
    save(this.objects.cambio);
    save(this.objects.body);
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

      // Offsets para destacar cada componente
      moveTo(this.objects.motor,       add(o(this.objects.motor),       new THREE.Vector3( 1.0, 0.25,  0.0)));
      moveTo(this.objects.radiador,    add(o(this.objects.radiador),    new THREE.Vector3( 1.4, 0.15,  0.0)));
      moveTo(this.objects.cambio,      add(o(this.objects.cambio),      new THREE.Vector3( 0.0, 0.25,  0.9)));
      moveTo(this.objects.tanque,      add(o(this.objects.tanque),      new THREE.Vector3(-1.2, 0.20,  0.0)));
      moveTo(this.objects.escapamento, add(o(this.objects.escapamento), new THREE.Vector3(-0.8, 0.10, -0.9)));

      // Opcional: manter a carroceria no lugar (já salva em _orig)
      // moveTo(this.objects.body, add(o(this.objects.body), new THREE.Vector3(0, 0.4, 0)));

      // Rodas levemente deslocadas para fora
      this.wheels.forEach((w, idx) => {
        const offsetZ = (idx % 2 === 0) ? 0.35 : -0.35;
        moveTo(w, add(o(w), new THREE.Vector3(0, 0.1, offsetZ)), 650);
      });

      this._ringPulse('#ffb36b');
      this._exploded = true;
      if (btn) btn.textContent = 'Recolher Peças';

      // Mostrar labels ao separar peças
      this._labelsVisible = true;
      this._positionLabels();
    } else {
      // Remover posições originais
      this._orig.forEach((val, obj) => moveTo(obj, val.pos, 650));
      this._ringPulse('#ffb36b');
      this._exploded = false;
      if (btn) btn.textContent = 'Separar Peças';

      // Esconder labels ao resetar
      this._labelsVisible = false;
      Object.values(this.labels).forEach(el => { if (el) el.style.display = 'none'; });
    }
  }

  _bindEvents() {
    window.addEventListener('resize', () => this._onResize());
    this.canvas.addEventListener('pointermove', (e) => this._onPointerMove(e));
    this.canvas.addEventListener('click', (e) => this._onClick(e));

    document.getElementById('btn-ignition').addEventListener('click', () => this.ignition());
    document.getElementById('btn-refuel').addEventListener('click', () => this.refuel());
    document.getElementById('btn-rev').addEventListener('click', () => this.rev());
    document.getElementById('btn-reset').addEventListener('click', () => this.reset());
    document.getElementById('btn-reset-cam').addEventListener('click', () => this.resetCamera());
    const driveBtn = document.getElementById('btn-drive');
    if (driveBtn) driveBtn.addEventListener('click', () => this.drive());

    // Novo: Separar Peças
    const explodeBtn = document.getElementById('btn-explode');
    if (explodeBtn) explodeBtn.addEventListener('click', () => this.explode());
  }

  _intro() {
    if (window.anime) {
      anime({ targets: this.statusFill, width: ['0%', '35%'], duration: 1200, delay: 200, easing: 'easeInOutQuad' });
      anime({
        targets: '.anime-title-1',
        translateY: [-10, 0], opacity: [0, 1], duration: 800, easing: 'easeOutExpo'
      });
      anime({
        targets: '.anime-title-2',
        translateY: [-10, 0], opacity: [0, 1], scale: [0.95, 1], duration: 900, delay: 150, easing: 'easeOutBack'
      });
    }
  }

  _onResize() {
    const width = this.canvas.clientWidth || this.canvas.parentElement.clientWidth;
    const height = this.canvas.clientHeight || this.canvas.parentElement.clientHeight;
    this.renderer.setSize(width, height, false);
    this.camera.aspect = width / height;
    this.camera.updateProjectionMatrix();
  }

  _updateRay(e) {
    const rect = this.canvas.getBoundingClientRect();
    this.pointer.x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
    this.pointer.y = -((e.clientY - rect.top) / rect.height) * 2 + 1;
    this.raycaster.setFromCamera(this.pointer, this.camera);
  }

  _intersectables() {
    return [this.objects.motor, this.objects.tanque, this.objects.escapamento, this.objects.radiador, this.objects.cambio, this.objects.body, ...this.wheels];
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
    // Esconde tudo rapidamente se não for para mostrar
    if (!this._labelsVisible) {
      Object.values(this.labels).forEach(el => { if (el) el.style.display = 'none'; });
      return;
    }

    const width = this.canvas.clientWidth || this.canvas.parentElement.clientWidth;
    const height = this.canvas.clientHeight || this.canvas.parentElement.clientHeight;
    const toScreen = (obj, el) => {
      if (!obj || !el) return;
      const p = obj.getWorldPosition(new THREE.Vector3()).clone().project(this.camera);
      if (p.z < 1) {
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
    toScreen(this.objects.motor, this.labels.motor);
    toScreen(this.objects.tanque, this.labels.tanque);
    toScreen(this.objects.escapamento, this.labels.escapamento);
    toScreen(this.objects.radiador, this.labels.radiador);
    toScreen(this.objects.cambio, this.labels.cambio);
  }

  _htmlFor(comp) {
    const map = {
      motor: {
        title: 'Motor a Combustão (ICE)',
        color: '#d94848',
        html: `
          <p>O motor a combustão interna converte a energia química do combustível em energia mecânica por meio da combustão controlada.</p>
          <ul>
            <li>Admissão, compressão, combustão e escape</li>
            <li>Velocidade e vibração aumentam com aceleração</li>
          </ul>
        `
      },
      tanque: {
        title: 'Tanque de Combustível',
        color: '#2b9348',
        html: `
          <p>Reserva de combustível do veículo. O abastecimento repõe o nível e permite maior autonomia.</p>
          <ul>
            <li>Posicionado na traseira</li>
            <li>Conectado à linha de combustível</li>
          </ul>
        `
      },
      escapamento: {
        title: 'Sistema de Escape',
        color: '#8b8b8b',
        html: `
          <p>Conduz os gases resultantes da combustão para fora do motor, reduz ruído e controla emissões.</p>
          <ul>
            <li>Ponteira evidencia fluxo durante aceleração</li>
          </ul>
        `
      },
      radiador: {
        title: 'Radiador',
        color: '#4f83a1',
        html: `
          <p>Responsável pela troca de calor do fluido de arrefecimento, mantendo a temperatura adequada de operação.</p>
        `
      },
      cambio: {
        title: 'Câmbio',
        color: '#8c6b3e',
        html: `
          <p>Transmite torque do motor às rodas com diferentes relações, permitindo melhor desempenho e economia.</p>
        `
      }
    };
    return map[comp];
  }

  _ringPulse(color) {
    // Desativado: não criar círculo/halo
    return;
  }

  _showInfo(comp) {
    const data = this._htmlFor(comp);
    if (!data) return;
    const html = `
      <h4 style="margin:.25rem 0 .5rem; color:${data.color}">${data.title}</h4>
      ${data.html}
    `;
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

    // Remover qualquer aura existente ao mostrar info e não criar novas
    if (this._aura) {
      this.scene.remove(this._aura);
      this._aura.geometry?.dispose?.();
      this._aura.material?.dispose?.();
      this._aura = null;
    }
  }

  ignition() {
    // Ligar motor: leve vibração do corpo + destaque do motor
    this._showInfo('motor');
    this._pulse(this.objects.motor.scale);

    anime({
      targets: this.statusFill,
      width: ['10%', '45%'],
      duration: 1000,
      easing: 'easeInOutQuad'
    });

    // Vibração do corpo
    anime({
      targets: this.objects.body.rotation,
      z: [{ value: 0.02, duration: 250 }, { value: -0.02, duration: 250 }, { value: 0, duration: 200 }],
      easing: 'easeInOutSine'
    });

    // Start puffs leves no escapamento
    this._emitExhaust(3, 300);
  }

  refuel() {
    this._showInfo('tanque');
    this._pulse(this.objects.tanque.scale);
    anime({
      targets: this.statusFill,
      width: ['30%', '100%'],
      duration: 1200,
      easing: 'easeInOutQuad'
    });
  }

  rev() {
    // Acelerar: rodas giram, corpo inclina, puff de escapamento mais forte
    this._showInfo('escapamento');
    const wheels = this.wheels.map(w => w.userData.spin);
    const spin = { a: 0 };
    anime({
      targets: spin,
      a: Math.PI * 10,
      duration: 1800,
      easing: 'easeInOutSine',
      update: () => wheels.forEach(r => r.rotation.x = spin.a)
    });

    anime({
      targets: this.car.position,
      x: [{ value: 0.22, duration: 700 }, { value: -0.22, duration: 700 }, { value: 0, duration: 500 }],
      easing: 'easeInOutSine'
    });

    anime({
      targets: this.objects.body.rotation,
      x: [{ value: -0.03, duration: 350 }, { value: 0, duration: 550 }],
      easing: 'easeOutQuad'
    });

    this._emitExhaust(6, 220);

    // Inicia movimento curto da estrada para simular deslocamento
    this.isDriving = true;
    clearTimeout(this._driveTimeout);
    this._driveTimeout = setTimeout(() => { this.isDriving = false; }, 1800);
  }

  // Alterna direção contínua (iniciar/parar)
  drive() {
    this.isDriving = !this.isDriving;
    const btn = document.getElementById('btn-drive');
    if (btn) btn.textContent = this.isDriving ? 'Parar' : 'Dirigir';
    if (this.isDriving) {
      this._showInfo('escapamento');
    }
  }
  reset() {
    this.infoBody.innerHTML = 'Clique em um componente para ver detalhes. Use os botões abaixo para simular cenários.';
    this.statusFill.style.width = '0%';

    [this.objects.motor, this.objects.tanque, this.objects.escapamento, this.objects.radiador, this.objects.cambio].forEach(o => {
      if (!o) return;
      if (o.material) o.material.emissiveIntensity = 0.2;
      o.scale.set(1, 1, 1);
    });

    // Recolhe todas as peças caso estejam separadas
    if (this._orig && this._orig.size > 0) {
      this._orig.forEach((val, obj) => {
        if (!obj) return;
        anime.remove(obj.position);
        obj.position.copy(val.pos);
        if (val.rot) obj.rotation.copy(val.rot);
      });
    }
    this._exploded = false;
    const btn = document.getElementById('btn-explode');
    if (btn) btn.textContent = 'Separar Peças';

    // Esconder labels ao resetar
    this._labelsVisible = false;
    Object.values(this.labels).forEach(el => { if (el) el.style.display = 'none'; });

    // Parar e reposicionar estrada
    this.isDriving = false;
    if (this.roadSegments.length === 3) {
      const L = this.roadLength;
      this.roadSegments[0].position.x = -L;
      this.roadSegments[1].position.x = 0;
      this.roadSegments[2].position.x = L;
    }
    const driveBtn = document.getElementById('btn-drive');
    if (driveBtn) driveBtn.textContent = 'Dirigir';
  }

  resetCamera() {
    this.controls.target.set(0, 0.45, 0);
    this.camera.position.set(4.4, 2.3, 5.6);
    this.controls.update();
  }

  _emitExhaust(count = 4, delayStep = 200) {
    // Cria pequenas "fumaças" esféricas que crescem e somem, a partir da ponteira
    const origin = this.objects.ponteira.getWorldPosition(new THREE.Vector3());
    for (let i = 0; i < count; i++) {
      const geo = new THREE.SphereGeometry(0.04, 10, 10);
      const mat = new THREE.MeshStandardMaterial({ color: 0xcccccc, roughness: 0.9, metalness: 0.0, transparent: true, opacity: 0.85 });
      const puff = new THREE.Mesh(geo, mat);
      puff.position.copy(origin.clone().add(new THREE.Vector3(0, 0, 0)));
      puff.castShadow = false; puff.receiveShadow = false;
      this.scene.add(puff);
      this._exhaustPuffs.push(puff);

      const angle = (Math.random() - 0.5) * 0.6;
      const up = 0.15 + Math.random() * 0.12;
      const out = -0.35 - Math.random() * 0.2;

      setTimeout(() => {
        anime({
          targets: puff.position,
          x: origin.x + out,
          y: origin.y + up,
          z: origin.z + Math.sin(angle) * 0.1,
          duration: 900,
          easing: 'easeOutQuad'
        });
        anime({
          targets: puff.scale,
          x: 2.4, y: 2.4, z: 2.4,
          duration: 900,
          easing: 'easeOutQuad'
        });
        anime({
          targets: puff.material,
          opacity: 0.0,
          duration: 900,
          easing: 'linear',
          complete: () => {
            this.scene.remove(puff);
            puff.geometry.dispose();
            puff.material.dispose();
          }
        });
      }, i * delayStep);
    }
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

    // Idle das rodas + incremento quando dirigindo
    const spinDelta = (this.isDriving ? (0.8 + 8.0) : 0.8) * dt;
    this.wheels.forEach(w => { w.userData.spin.rotation.x += spinDelta; });

    // Movimento da estrada (loop com 3 segmentos) enquanto "dirigindo"
    if (this.isDriving && this.roadSegments.length === 3) {
      const dx = this.driveSpeed * dt;
      const L = this.roadLength;
      for (const seg of this.roadSegments) {
        seg.position.x -= dx;
        if (seg.position.x < -1.5 * L) {
          seg.position.x += 3 * L;
        }
      }
    }

    // Reposiciona labels a cada frame
    this._positionLabels();

    this.renderer.render(this.scene, this.camera);

    if (!this._didHideLoading) {
      this._didHideLoading = true;
      this._hideLoading();
    }

    requestAnimationFrame(this.animate);
  }
}

function bootstrap() {
  const canvas = document.getElementById('webgl');
  const parent = canvas.parentElement;
  canvas.width = parent.clientWidth;
  canvas.height = Math.max(360, parent.clientHeight);

  new CombustionCar3DExperience();
}

document.addEventListener('DOMContentLoaded', bootstrap);