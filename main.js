import * as THREE from 'three';
import { FBXLoader } from 'three/examples/jsm/loaders/FBXLoader.js';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { fetchQuestionsByLevel } from './questionsService.js';

// ============================
// Configuração do Modelo 3D
// ============================
function init3DModel() {
    const container = document.getElementById('3d-model-box');
    
    if (!container) {
        console.error("ERRO: Contêiner '3d-model-box' não encontrado na tela!");
        return;
    }

    console.log("Iniciando renderização 3D...");

    // 1. Cria a Cena
    const scene = new THREE.Scene();

    const axesHelper = new THREE.AxesHelper(5);
    scene.add(axesHelper);

    // 2. Configura a Câmera
    const camera = new THREE.PerspectiveCamera(75, container.clientWidth / container.clientHeight, 0.1, 1000);
    camera.position.set(0, 2, 5); 

    // 3. Renderizador
    const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });
    renderer.setSize(container.clientWidth, container.clientHeight);
    container.appendChild(renderer.domElement);
    renderer.domElement.style.touchAction = 'none'; // evita o navegador "roubar" o gesto de arrastar no celular

    // 3.1 Controles de órbita — é isso que deixa o usuário pegar e girar o modelo
    const controls = new OrbitControls(camera, renderer.domElement);
    controls.target.set(0, -1, 0);     // gira em torno de onde a molécula fica (mesma posição dela)
    controls.enableDamping = true;     // dá uma sensação suave de "inércia" ao soltar
    controls.dampingFactor = 0.08;
    controls.enablePan = false;        // trava o arrastar-para-o-lado; só gira e dá zoom
    controls.minDistance = 2;          // não deixa a câmera colar no modelo
    controls.maxDistance = 100;         // nem afastar demais
    controls.autoRotate = true;        // gira sozinho quando ninguém está mexendo...
    controls.autoRotateSpeed = 1.2;    
    controls.update();

    // 4. Luzes 
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.8);
    scene.add(ambientLight);
    
    const directionalLight = new THREE.DirectionalLight(0x39ff14, 1); 
    directionalLight.position.set(5, 10, 7);
    scene.add(directionalLight);

    // 5. Carregador FBX
    const loader = new FBXLoader();
    let molecule;

    loader.load('/Modelo-3D/wittig.fbx', (object) => {
        console.log("Modelo FBX carregado com sucesso!", object);
        molecule = object;
        
        molecule.scale.set(0.05, 0.05, 0.05); 
        molecule.position.set(0, -1, 0); 
        
        scene.add(molecule);
    }, 
    (xhr) => {
        console.log('Carregando 3D: ' + Math.round(xhr.loaded / xhr.total * 100) + '%');
    }, 
    (error) => {
        console.error('Erro CRÍTICO ao carregar o modelo FBX. Verifique o caminho ou a pasta public:', error);
    });

    // 6. Loop de Animação
    function animate() {
        requestAnimationFrame(animate);
        
        controls.update(); // obrigatório por causa do damping/autoRotate
        
        renderer.render(scene, camera);
    }
    animate();

    // Responsividade
    window.addEventListener('resize', () => {
        camera.aspect = container.clientWidth / container.clientHeight;
        camera.updateProjectionMatrix();
        renderer.setSize(container.clientWidth, container.clientHeight);
    });
}
// ============================
// Lógica Principal da Página
// ============================
document.addEventListener("DOMContentLoaded", () => {
    
    // AQUI ESTÁ A MÁGICA: Agora o 3D só carrega DEPOIS que o HTML está 100% lido
    init3DModel();

    // Mapeamento de todos os elementos do HTML
    const buttons = document.querySelectorAll('.btn-neon');
    const btnStart = document.getElementById('btn-start');
    const difficultySelector = document.querySelector('.difficulty-selector');
    const loader = document.getElementById('loader');
    const subtitle = document.querySelector('.subtitle');
    const readout = document.getElementById('difficulty-readout');

    let selectedLevel = null;
    let selectedName = null;

    // Lógica de seleção do nível de dificuldade
    buttons.forEach(button => {
        button.addEventListener('click', () => {
            buttons.forEach(b => b.style.boxShadow = "0 0 10px var(--neon-green-dim), inset 0 0 10px var(--neon-green-dim)");
            button.style.boxShadow = "0 0 25px var(--neon-green), inset 0 0 15px var(--neon-green)";

            selectedLevel = button.getAttribute('data-level');
            selectedName = button.getAttribute('data-name');
            
            if (readout) {
                readout.textContent = `Nível selecionado: ${selectedName}. Pronto para iniciar.`;
            }

            btnStart.classList.remove('hidden');
        });
    });

    // Lógica do botão "Acessar Laboratório"
    btnStart.addEventListener('click', async () => {
        if (!selectedLevel) return; 

        btnStart.classList.add('hidden');
        difficultySelector.classList.add('hidden');
        if (readout) readout.classList.add('hidden');
        
        subtitle.innerText = `Iniciando calibração para o nível: ${selectedName}...`;
        loader.classList.remove('hidden');

        await initializeGameSession(selectedLevel, selectedName);
    });

    // Conexão com o banco de dados e redirecionamento final.
    // A busca em si mora em questionsService.js (fetchQuestionsByLevel).
    // Quando o Firebase for plugado lá, nada aqui precisa mudar.
    async function initializeGameSession(levelId, levelName) {
        try {
            const questions = await fetchQuestionsByLevel(levelId);

            // Guarda as questões e o nível escolhido para a SmartPage.html
            // ler direto do sessionStorage, sem precisar buscar de novo.
            sessionStorage.setItem('bcel_questions', JSON.stringify(questions));
            sessionStorage.setItem('bcel_level', levelId);
            sessionStorage.setItem('bcel_level_name', levelName);

            window.location.href = `SmartPage.html?level=${levelId}`;
        } catch (error) {
            console.error('Falha ao buscar questões do banco de dados:', error);
            showAlert(error?.message || 'Erro ao conectar com os servidores centrais. Tente novamente.', true);
            
            difficultySelector.classList.remove('hidden');
            loader.classList.add('hidden');
            btnStart.classList.remove('hidden');
            subtitle.innerText = "Selecione o nível de complexidade das equações";
            if (readout) readout.classList.remove('hidden');
        }
    }
});

// Função do modal customizado
function showAlert(message, isError = false) {
    const alertBox = document.getElementById('custom-alert');
    const alertMsg = document.getElementById('alert-message');
    const alertClose = document.getElementById('alert-close');
    const alertContent = alertBox.querySelector('.alert-content');

    if (isError) {
        alertContent.style.borderColor = '#D9483A';
        alertContent.style.boxShadow = '0 0 20px rgba(217, 72, 58, 0.4)';
    } else {
        alertContent.style.borderColor = 'var(--neon-green, #59BF2A)';
        alertContent.style.boxShadow = '0 0 20px rgba(89, 191, 42, 0.4)';
    }

    alertMsg.textContent = message;
    alertBox.classList.remove('hidden');

    alertClose.onclick = () => {
        alertBox.classList.add('hidden');
    };
}