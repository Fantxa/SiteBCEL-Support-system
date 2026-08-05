import { fetchQuestionsByLevel } from './questionsService.js';

// 1. Questões do banco de dados
// O array fixo que existia aqui virou mock dentro de questionsService.js,
// que é o único lugar que precisa ser tocado pra plugar o Firebase de verdade.

// Estado atual do jogo
let currentLevelIndex = 0;
let levels = []; // questões do nível escolhido, carregadas em initApp()
let userState = {
    reactants: [], // Array de instâncias colocadas
    products: []
};

// Elementos da DOM
const equationText = document.getElementById('equation-text');
const reactantsStack = document.getElementById('reactants-stack');
const productsStack = document.getElementById('products-stack');
const reactantsPool = document.getElementById('reactants-pool');
const productsPool = document.getElementById('products-pool');
const reactantsCounter = document.getElementById('reactants-counter');
const productsCounter = document.getElementById('products-counter');
const btnVerify = document.getElementById('btn-verify');
const btnNext = document.getElementById('btn-next');

// 2. Inicialização do Nível
function loadLevel(index) {
    const level = levels[index];
    userState.reactants = [];
    userState.products = [];
    
    btnNext.classList.add('hidden');
    btnVerify.classList.remove('hidden');

    buildPool(level.reactants, reactantsPool, 'reactants');
    buildPool(level.products, productsPool, 'products');
    
    updateUI();
}

// 3. Constrói os botões do "Banco de Moléculas"
function buildPool(molecules, container, side) {
    container.innerHTML = '';
    molecules.forEach(mol => {
        const btn = document.createElement('button');
        btn.className = 'pool-btn';
        btn.innerHTML = `+ ${mol.label}`;
        btn.onclick = () => addMolecule(mol, side);
        container.appendChild(btn);
    });
}

// 4. Lógica de Adicionar (Clique no Banco -> Vai pra Área)
function addMolecule(moleculeDef, side) {
    // Cria um ID único para a instância baseada no timestamp
    const instance = {
        uid: Date.now() + Math.random(),
        ...moleculeDef
    };
    userState[side].push(instance);
    updateUI();
}

// 5. Lógica de Reverter (Clique na Área -> Remove)
function removeMolecule(uid, side) {
    userState[side] = userState[side].filter(mol => mol.uid !== uid);
    updateUI();
}

// 6. Atualização Visual e Contagem
function updateUI() {
    const level = levels[currentLevelIndex];
    
    // Atualiza o empilhamento visual
    renderStack(userState.reactants, reactantsStack, 'reactants');
    renderStack(userState.products, productsStack, 'products');

    // Calcula átomos totais
    const countR = calculateAtoms(userState.reactants);
    const countP = calculateAtoms(userState.products);

    // Renderiza os contadores de átomos
    renderCounters(countR, reactantsCounter);
    renderCounters(countP, productsCounter);

    // Atualiza o texto da equação lá em cima
    renderEquationText(level, userState);
}

function renderStack(instances, container, side) {
    container.innerHTML = '';
    instances.forEach(mol => {
        const div = document.createElement('div');
        div.className = 'molecule-instance';
        div.innerHTML = mol.label;
        div.title = "Clique para remover";
        div.onclick = () => removeMolecule(mol.uid, side);
        container.appendChild(div);
    });
}

function calculateAtoms(instances) {
    const totals = {};
    instances.forEach(mol => {
        for (const [atom, qty] of Object.entries(mol.composition)) {
            totals[atom] = (totals[atom] || 0) + qty;
        }
    });
    return totals;
}

function renderCounters(counts, container) {
    container.innerHTML = '';
    for (const [atom, qty] of Object.entries(counts)) {
        container.innerHTML += `<span class="atom-badge">${atom}: ${qty}</span>`;
    }
}

function renderEquationText(level, state) {
    // Conta quantas vezes cada tipo de molécula foi colocada
    const countReactants = {};
    state.reactants.forEach(r => countReactants[r.label] = (countReactants[r.label] || 0) + 1);
    
    const countProducts = {};
    state.products.forEach(p => countProducts[p.label] = (countProducts[p.label] || 0) + 1);

    // Monta string Reagentes
    const strReactants = level.reactants.map(r => {
        const coef = countReactants[r.label] || '_';
        return `<span class="coef">${coef}</span>${r.label}`;
    }).join(' + ');

    // Monta string Produtos
    const strProducts = level.products.map(p => {
        const coef = countProducts[p.label] || '_';
        return `<span class="coef">${coef}</span>${p.label}`;
    }).join(' + ');

    equationText.innerHTML = `${strReactants} ➔ ${strProducts}`;
}

// 7. Lógica de Verificação (Conferindo Matemática) - AGORA SÓ TEM UMA VERSÃO!
btnVerify.onclick = () => {
    const countR = calculateAtoms(userState.reactants);
    const countP = calculateAtoms(userState.products);

    // Se o painel estiver vazio, já barra
    if (Object.keys(countR).length === 0 && Object.keys(countP).length === 0) {
        showAlert("Adicione moléculas antes de verificar!", true);
        return;
    }

    let isBalanced = true;
    
    // Verifica se tudo da esquerda está na direita
    for (const atom in countR) {
        if (countR[atom] !== countP[atom]) {
            isBalanced = false;
        }
    }
    // Verifica se tudo da direita está na esquerda (caso sobre átomos de produtos)
    for (const atom in countP) {
        if (countP[atom] !== countR[atom]) {
            isBalanced = false;
        }
    }

    if (isBalanced) {
        equationText.style.color = "var(--green-100)";
        showAlert("Sucesso! Equação Balanceada perfeitamente."); // Verde
        btnVerify.classList.add('hidden');
        btnNext.classList.remove('hidden');
    } else {
        showAlert("Ainda não está balanceado. Cheque os contadores de átomos abaixo das pilhas!", true);
    }
};

btnNext.onclick = () => {
    equationText.style.color = "var(--white-soft)";
    currentLevelIndex++;
    if(currentLevelIndex >= levels.length) {
        showAlert("Fim das questões do banco de dados!");
        currentLevelIndex = 0; // Reseta pro inicio
    }
    loadLevel(currentLevelIndex);
};

// ============================
// Modal de Alerta Customizado (INSERIDO AQUI TAMBÉM)
// ============================
function showAlert(message, isError = false) {
    const alertBox = document.getElementById('custom-alert');
    const alertMsg = document.getElementById('alert-message');
    const alertClose = document.getElementById('alert-close');
    const alertContent = alertBox.querySelector('.alert-content');

    if (isError) {
        alertContent.style.borderColor = '#D9483A';
        alertContent.style.boxShadow = '0 0 20px rgba(217, 72, 58, 0.4)';
    } else {
        alertContent.style.borderColor = 'var(--green-50, #59BF2A)';
        alertContent.style.boxShadow = '0 0 20px rgba(89, 191, 42, 0.4)';
    }

    alertMsg.textContent = message;
    alertBox.classList.remove('hidden');

    alertClose.onclick = () => {
        alertBox.classList.add('hidden');
    };
}

// ============================
// Carregamento das questões (Banco de Dados)
// ============================
// A busca em si mora em questionsService.js (fetchQuestionsByLevel) —
// esse é o único arquivo que precisa mudar quando o Firebase entrar.
// Aqui só decidimos DE ONDE pegar os dados: se a tela de seleção de
// dificuldade (index.html) já buscou e guardou no sessionStorage,
// reaproveita; senão, busca direto pelo nível que veio na URL.

async function getQuestionsForLevel(levelId) {
    const cachedLevel = sessionStorage.getItem('bcel_level');
    const cachedQuestions = sessionStorage.getItem('bcel_questions');

    if (cachedLevel === levelId && cachedQuestions) {
        try {
            return JSON.parse(cachedQuestions);
        } catch (e) {
            console.warn('Dados em sessionStorage inválidos, buscando de novo no banco.', e);
        }
    }

    return fetchQuestionsByLevel(levelId);
}

async function initApp() {
    const params = new URLSearchParams(window.location.search);
    const levelId = params.get('level') || '1';

    try {
        levels = await getQuestionsForLevel(levelId);

        if (!levels || levels.length === 0) {
            throw new Error(`Nenhuma questão disponível para o nível ${levelId}.`);
        }

        currentLevelIndex = 0;
        loadLevel(currentLevelIndex);
    } catch (error) {
        console.error('Falha ao carregar questões do banco de dados:', error);
        equationText.textContent = 'Não foi possível carregar as questões.';
        showAlert(error?.message || 'Erro ao conectar com os servidores centrais. Tente novamente.', true);
    }
}

// Iniciar a aplicação
initApp();