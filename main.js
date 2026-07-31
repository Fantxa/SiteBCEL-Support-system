import * as THREE from 'three';

document.addEventListener("DOMContentLoaded", () => {
    const buttons = document.querySelectorAll('.btn-neon');
    const difficultySelector = document.querySelector('.difficulty-selector');
    const loader = document.getElementById('loader');
    const subtitle = document.querySelector('.subtitle');

    buttons.forEach(button => {
        button.addEventListener('click', async (e) => {
            // Previne duplo clique acidental
            buttons.forEach(b => b.disabled = true);

            const levelId = button.getAttribute('data-level');
            const levelName = button.getAttribute('data-name');

            // Feedback visual de transição
            difficultySelector.classList.add('hidden');
            subtitle.innerText = `Iniciando calibração para o nível: ${levelName}...`;
            loader.classList.remove('hidden');

            // Chama a função que gerencia a comunicação com o Banco de Dados
            await initializeGameSession(levelId, levelName);
        });
    });
});

/**
 * Função pronta para integração com backend/SQL
 */
async function initializeGameSession(levelId, levelName) {
    try {
        /* ========================================================
           EXEMPLO DE INTEGRAÇÃO COM BACKEND / BANCO DE DADOS SQL
           Descomente e ajuste a URL/Método conforme sua API
           ======================================================== */
        
        /*
        const response = await fetch('/api/iniciar-balanceamento', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                dificuldade_id: levelId,
                timestamp: new Date().toISOString()
            })
        });

        if (!response.ok) {
            throw new Error('Falha na comunicação com o banco de dados');
        }

        const data = await response.json();
        
        // Redireciona o usuário para a página do jogo com o ID da sessão criada no SQL
        window.location.href = `/jogo.html?session=${data.sessionId}`;
        */

        // SIMULAÇÃO para você ver funcionando no Front-End agora:
        console.log(`[Banco de Dados] Simulando inserção de nova partida: Nível ${levelId} - ${levelName}`);
        
        setTimeout(() => {
            alert(`Sessão do nível ${levelName} registrada no BD (Simulado)!\n\nPronto para redirecionar para a tela da equação.`);
            // Reseta a tela (Apenas para demonstração, normalmente aqui você redirecionaria de página)
            document.querySelector('.difficulty-selector').classList.remove('hidden');
            document.getElementById('loader').classList.add('hidden');
            document.querySelector('.subtitle').innerText = "Selecione o nível de complexidade das equações";
            document.querySelectorAll('.btn-neon').forEach(b => b.disabled = false);
        }, 2000); // Finge que o servidor levou 2 segundos para responder

    } catch (error) {
        console.error('Erro na integração com BD:', error);
        alert('Erro ao conectar com os servidores centrais. Tente novamente.');
        
        // Restaura a tela em caso de erro
        document.querySelector('.difficulty-selector').classList.remove('hidden');
        document.getElementById('loader').classList.add('hidden');
        document.querySelectorAll('.btn-neon').forEach(b => b.disabled = false);
    }
}

// ============================
// Difficulty selector & Redirecionamento
// ============================
const difficultyOptions = document.querySelectorAll('.difficulty-option');
const glider = document.querySelector('.difficulty-glider');
const readout = document.getElementById('difficulty-readout');
const btnStart = document.getElementById('btn-start'); // Puxa o novo botão

const levelIndex = { easy: 0, medium: 1, hard: 2 };
let selectedLevel = null; // Variável para guardar a escolha do usuário

difficultyOptions.forEach((option) => {
    option.addEventListener('click', () => {
        // Remove a classe active de todos e adiciona no clicado
        difficultyOptions.forEach((btn) => btn.classList.remove('active'));
        option.classList.add('active');

        // Move a barra verde
        selectedLevel = option.dataset.level;
        glider.style.transform = `translateX(${levelIndex[selectedLevel] * 100}%)`;
        readout.textContent = option.dataset.readout;

        // Faz o botão de iniciar aparecer
        btnStart.classList.remove('hidden');
    });
});

// Ação de clique para redirecionar para a página inteligente
btnStart.addEventListener('click', () => {
    if (selectedLevel) {
        // Redireciona para o arquivo da página 2, passando a dificuldade pela URL
        window.location.href = `balanceamento.html?level=${selectedLevel}`;
    }
});