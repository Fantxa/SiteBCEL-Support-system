// ============================================================
//  SERVIÇO DE QUESTÕES
//  Ponto único de integração com o banco de dados (Firebase)
// ============================================================
//
// Este é o ÚNICO arquivo que precisa ser mexido para plugar o banco
// de dados de verdade. O resto da aplicação (main.js) já está pronto:
// ele só chama fetchQuestionsByLevel(levelId) e espera receber de
// volta uma lista de questões daquele nível.
//
// CONTRATO (mantenha a assinatura, troque só o conteúdo da função):
//   fetchQuestionsByLevel(levelId) -> Promise<Array<Questao>>
//
// Formato esperado de cada questão (ajuste os campos conforme o
// modelo de dados real que for definido no Firestore):
//   {
//     id: string,              // id do documento no Firestore
//     equation: string,        // ex: "__ H2 + __ O2 -> __ H2O"
//     coefficients: number[],  // coeficientes corretos, ex: [2, 1, 2]
//     level: number            // 1, 2 ou 3
//   }
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
        { id: 'mock-1-1', equation: '__ H2 + __ O2 -> __ H2O', coefficients: [2, 1, 2], level: 1 },
        { id: 'mock-1-2', equation: '__ N2 + __ H2 -> __ NH3', coefficients: [1, 3, 2], level: 1 },
    ],
    '2': [
        { id: 'mock-2-1', equation: '__ C3H8 + __ O2 -> __ CO2 + __ H2O', coefficients: [1, 5, 3, 4], level: 2 },
    ],
    '3': [
        { id: 'mock-3-1', equation: '__ KMnO4 + __ HCl -> __ KCl + __ MnCl2 + __ Cl2 + __ H2O', coefficients: [2, 16, 2, 2, 5, 8], level: 3 },
    ],
};
// --- FIM DO MOCK ---

/**
 * Busca as questões de um determinado nível de dificuldade.
 * Hoje devolve dados fictícios (mock); quando o Firebase entrar,
 * só o corpo desta função muda — quem chama (main.js) não muda nada.
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
