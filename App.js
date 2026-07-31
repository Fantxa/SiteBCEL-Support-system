// 1. Simulação do Banco de Dados (SQL)
const databaseMock = [
    {
        id: 1,
        textReactants: ["H₂", "O₂"],
        textProducts: ["H₂O"],
        reactants: [
            { id: "h2", label: "H₂", composition: { H: 2 } },
            { id: "o2", label: "O₂", composition: { O: 2 } }
        ],
        products: [
            { id: "h2o", label: "H₂O", composition: { H: 2, O: 1 } }
        ]
    },
    {
        id: 2,
        textReactants: ["N₂", "H₂"],
        textProducts: ["NH₃"],
        reactants: [
            { id: "n2", label: "N₂", composition: { N: 2 } },
            { id: "h2", label: "H₂", composition: { H: 2 } }
        ],
        products: [
            { id: "nh3", label: "NH₃", composition: { N: 1, H: 3 } }
        ]
    }
];

// Estado atual do jogo
let currentLevelIndex = 0;
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
    const level = databaseMock[index];
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
    const level = databaseMock[currentLevelIndex];
    
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

// 7. Lógica de Verificação (Conferindo Matemática)
btnVerify.onclick = () => {
    const countR = calculateAtoms(userState.reactants);
    const countP = calculateAtoms(userState.products);

    // Se o painel estiver vazio, já barra
    if (Object.keys(countR).length === 0 && Object.keys(countP).length === 0) {
        alert("Adicione moléculas antes de verificar!");
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
        alert("Sucesso! Equação Balanceada perfeitamente.");
        btnVerify.classList.add('hidden');
        btnNext.classList.remove('hidden');
    } else {
        alert("Ainda não está balanceado. Cheque os contadores de átomos abaixo das pilhas!");
    }
};

btnNext.onclick = () => {
    equationText.style.color = "var(--white-soft)";
    currentLevelIndex++;
    if(currentLevelIndex >= databaseMock.length) {
        alert("Fim das questões do banco de dados!");
        currentLevelIndex = 0; // Reseta pro inicio
    }
    loadLevel(currentLevelIndex);
};

// Iniciar a aplicação
loadLevel(currentLevelIndex);