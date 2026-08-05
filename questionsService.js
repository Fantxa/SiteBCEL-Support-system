// ============================================================
//  SERVIÇO DE QUESTÕES
//  Ponto único de integração com o banco de dados (Firebase)
//  Usado pelas duas telas: index.html (seletor de dificuldade)
//  e SmartPage.html (laboratório onde o jogo acontece)
// ============================================================
//
// Este é o ÚNICO arquivo que precisa ser mexido para plugar o banco
// de dados de verdade. O resto da aplicação já está pronto: ela só
// chama fetchQuestionsByLevel(levelId) e espera receber de volta uma
// lista de questões daquele nível.
//
// CONTRATO (mantenha a assinatura, troque só o conteúdo da função):
//   fetchQuestionsByLevel(levelId) -> Promise<Array<Questao>>
//
// Formato de cada questão — é o que App.js (SmartPage) usa de verdade
// pra montar o jogo e conferir o balanceamento:
//   {
//     id: string | number,
//     level: number,             // 1, 2 ou 3
//     textReactants: string[],   // rótulos de exibição, ex: ["H₂", "O₂"]
//     textProducts: string[],    // ex: ["H₂O"]
//     reactants: [
//       { id: string, label: string, composition: { [elemento]: quantidade } }
//     ],
//     products: [
//       { id: string, label: string, composition: { [elemento]: quantidade } }
//     ]
//   }
//
// "composition" é a fórmula em objeto: quantos átomos de cada elemento
// tem em UMA molécula (ex: H₂O -> { H: 2, O: 1 }). É isso que o App.js
// usa pra contar os átomos e conferir se o usuário balanceou certo.
//
// ------------------------------------------------------------
// TODO (integração com Firebase):
//   1. Criar um firebaseConfig.js com initializeApp(...) e exportar
//      a instância do Firestore (não deixe chave/config aqui dentro).
//   2. Importar aqui: import { db } from './firebaseConfig.js';
//   3. Trocar o corpo de fetchQuestionsByLevel pela query real, ex:
//
//        import { collection, query, where, getDocs } from 'firebase/firestore';
//        import { db } from './firebaseConfig.js';
//
//        export async function fetchQuestionsByLevel(levelId) {
//            const q = query(
//                collection(db, 'questions'),
//                where('level', '==', Number(levelId))
//            );
//            const snapshot = await getDocs(q);
//
//            if (snapshot.empty) {
//                throw new Error(`Nenhuma questão encontrada para o nível ${levelId}.`);
//            }
//
//            // Cada documento no Firestore deve ter os campos descritos
//            // no formato de "Questao" acima (textReactants, reactants
//            // com composition, etc.) — ajuste aqui se o nome dos campos
//            // no banco for diferente.
//            return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
//        }
//
//   4. Pode apagar o bloco "MOCK" inteiro lá embaixo quando isso
//      estiver funcionando.
// ------------------------------------------------------------

const SIMULATED_NETWORK_DELAY_MS = 1200;

// --- MOCK: dados falsos só para o front funcionar/ser testado sem o Firebase ainda ---
// Apague este objeto quando a query real estiver implementada.
const MOCK_QUESTIONS_BY_LEVEL = {
    '1': [
        {
            id: 'mock-1-1',
            level: 1,
            textReactants: ['H₂', 'O₂'],
            textProducts: ['H₂O'],
            reactants: [
                { id: 'h2', label: 'H₂', composition: { H: 2 } },
                { id: 'o2', label: 'O₂', composition: { O: 2 } },
            ],
            products: [
                { id: 'h2o', label: 'H₂O', composition: { H: 2, O: 1 } },
            ],
        },
        {
            id: 'mock-1-2',
            level: 1,
            textReactants: ['N₂', 'H₂'],
            textProducts: ['NH₃'],
            reactants: [
                { id: 'n2', label: 'N₂', composition: { N: 2 } },
                { id: 'h2', label: 'H₂', composition: { H: 2 } },
            ],
            products: [
                { id: 'nh3', label: 'NH₃', composition: { N: 1, H: 3 } },
            ],
        },
    ],
    '2': [
        {
            id: 'mock-2-1',
            level: 2,
            textReactants: ['C₃H₈', 'O₂'],
            textProducts: ['CO₂', 'H₂O'],
            reactants: [
                { id: 'c3h8', label: 'C₃H₈', composition: { C: 3, H: 8 } },
                { id: 'o2', label: 'O₂', composition: { O: 2 } },
            ],
            products: [
                { id: 'co2', label: 'CO₂', composition: { C: 1, O: 2 } },
                { id: 'h2o', label: 'H₂O', composition: { H: 2, O: 1 } },
            ],
        },
    ],
    '3': [
        {
            id: 'mock-3-1',
            level: 3,
            textReactants: ['Al', 'O₂'],
            textProducts: ['Al₂O₃'],
            reactants: [
                { id: 'al', label: 'Al', composition: { Al: 1 } },
                { id: 'o2', label: 'O₂', composition: { O: 2 } },
            ],
            products: [
                { id: 'al2o3', label: 'Al₂O₃', composition: { Al: 2, O: 3 } },
            ],
        },
    ],
};
// --- FIM DO MOCK ---

/**
 * Busca as questões de um determinado nível de dificuldade.
 * Hoje devolve dados fictícios (mock); quando o Firebase entrar,
 * só o corpo desta função muda — quem chama não muda nada.
 *
 * @param {string|number} levelId - "1" | "2" | "3"
 * @returns {Promise<Array<object>>}
 */
export async function fetchQuestionsByLevel(levelId) {
    // --- MOCK (remover quando o Firebase estiver plugado) ---
    return new Promise((resolve, reject) => {
        setTimeout(() => {
            const questions = MOCK_QUESTIONS_BY_LEVEL[String(levelId)];

            if (!questions || questions.length === 0) {
                reject(new Error(`Nenhuma questão encontrada para o nível ${levelId}.`));
                return;
            }

            resolve(questions);
        }, SIMULATED_NETWORK_DELAY_MS);
    });
    // --- FIM DO MOCK ---
}