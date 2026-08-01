document.addEventListener("DOMContentLoaded", () => {
    // 1. Mapeamento de todos os elementos do HTML
    const buttons = document.querySelectorAll('.btn-neon');
    const btnStart = document.getElementById('btn-start');
    const difficultySelector = document.querySelector('.difficulty-selector');
    const loader = document.getElementById('loader');
    const subtitle = document.querySelector('.subtitle');
    const readout = document.getElementById('difficulty-readout');

    let selectedLevel = null;
    let selectedName = null;

    // 2. Lógica de seleção do nível de dificuldade
    buttons.forEach(button => {
        button.addEventListener('click', () => {
            // Remove o efeito visual de todos os botões e aplica apenas no selecionado
            buttons.forEach(b => b.style.boxShadow = "0 0 10px var(--neon-green-dim), inset 0 0 10px var(--neon-green-dim)");
            button.style.boxShadow = "0 0 25px var(--neon-green), inset 0 0 15px var(--neon-green)";

            // Salva os dados do botão clicado
            selectedLevel = button.getAttribute('data-level');
            selectedName = button.getAttribute('data-name');
            
            // Atualiza o texto de leitura se ele existir
            if (readout) {
                readout.textContent = `Nível selecionado: ${selectedName}. Pronto para iniciar.`;
            }

            // Revela o botão de iniciar
            btnStart.classList.remove('hidden');
        });
    });

    // 3. Lógica do botão "Acessar Laboratório"
    btnStart.addEventListener('click', async () => {
        if (!selectedLevel) return; // Trava de segurança

        // Feedback visual: esconde os botões e mostra a interface de carregamento
        btnStart.classList.add('hidden');
        difficultySelector.classList.add('hidden');
        if (readout) readout.classList.add('hidden');
        
        subtitle.innerText = `Iniciando calibração para o nível: ${selectedName}...`;
        loader.classList.remove('hidden');

        // Dispara a comunicação (simulada) com o BD
        await initializeGameSession(selectedLevel, selectedName);
    });

    // 4. Conexão com Banco de Dados e Redirecionamento Final
    async function initializeGameSession(levelId, levelName) {
        try {
            console.log(`[Banco de Dados] Simulando requisição: Nível ${levelId} - ${levelName}`);
            
            // Simula o tempo de resposta do servidor (2 segundos)
            setTimeout(() => {
                // REDIRECIONAMENTO CORRIGIDO: 
                // Envia o usuário para a página inteligente passando o nível na URL
                window.location.href = `SmartPage.html?level=${levelId}`;
            }, 2000);

        } catch (error) {
            console.error('Erro na integração com BD:', error);
            
            // AQUI ESTÁ A MUDANÇA! Substituímos o alert nativo pelo seu showAlert customizado
            showAlert('Erro ao conectar com os servidores centrais. Tente novamente.', true);
            
            // Restaura a tela em caso de falha no servidor
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

    // Se for erro, pinta de vermelho. Se não, verde neon.
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