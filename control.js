const socket = io();
let currentTeam = '';
async function loadAvailableIcons() {
            try {
                const response = await fetch('/api/icons');
                availableIcons = await response.json();
            } catch (error) {
                console.error('Erro ao carregar ícones:', error);
                availableIcons = [];
            }
        }

// Inicializar quando a página carregar
document.addEventListener('DOMContentLoaded', () => {
    const savedTheme = localStorage.getItem('theme') || 'light';
    document.documentElement.setAttribute('data-theme', savedTheme);
    
    const button = document.querySelector('.theme-toggle');
    button.textContent = savedTheme === 'dark' ? '☀️ Light Mode' : '🌙 Dark Mode';
    
    loadAvailableIcons();
});

// Status da conexão
socket.on('connect', () => {
    document.getElementById('status').textContent = '✅';
    document.getElementById('status').className = 'status connected';
    socket.emit('getPlacarData');
});

socket.on('disconnect', () => {
    document.getElementById('status').textContent = '❌';
    document.getElementById('status').className = 'status disconnected';
});

// Receber atualizações do placar
socket.on('placarUpdate', (data) => {
    document.getElementById('timeA').value = data.timeA.toUpperCase();
    document.getElementById('timeB').value = data.timeB.toUpperCase();
    document.getElementById('golsA').value = data.golsA;
    document.getElementById('golsB').value = data.golsB;
    document.getElementById('iconA').value = data.iconA || '';
    document.getElementById('iconB').value = data.iconB || '';
    document.getElementById('faltasA').value = data.faltasA || 0;
    document.getElementById('faltasB').value = data.faltasB || 0;
    document.getElementById('periodo').value = data.periodo || 1;
});

// Receber atualizações do timer
socket.on('timerUpdate', (data) => {
    const minutes = Math.floor(data.seconds / 60).toString().padStart(2, '0');
    const seconds = (data.seconds % 60).toString().padStart(2, '0');
    document.getElementById('timerDisplay').textContent = `${minutes}:${seconds}`;
    
    // Atualizar modo do timer na interface
    const isCountdown = data.isCountdown;
    document.querySelector(`input[name="timerMode"][value="${isCountdown ? 'countdown' : 'normal'}"]`).checked = true;
});

socket.on('timerFinished', () => {
    alert('⏰ Tempo esgotado!');
});

// Funções de controle
function changeScore(team, change) {
    const input = document.getElementById(`gols${team}`);
    const newValue = Math.max(0, parseInt(input.value) + change);
    input.value = newValue;
    updateScore();
}

function updateScore() {
    const data = {
        timeA: document.getElementById('timeA').value,
        timeB: document.getElementById('timeB').value,
        golsA: parseInt(document.getElementById('golsA').value),
        golsB: parseInt(document.getElementById('golsB').value),
        iconA: document.getElementById('iconA').value,
        iconB: document.getElementById('iconB').value,
        faltasA: parseInt(document.getElementById('faltasA').value) || 0,
        faltasB: parseInt(document.getElementById('faltasB').value) || 0,
        periodo: parseInt(document.getElementById('periodo').value) || 1
    };
    socket.emit('updatePlacar', data);
}

function updateTeamNames() {
    updateScore();
}

function changeTimerMode() {
    const isCountdown = document.querySelector('input[name="timerMode"]:checked').value === 'countdown';
    socket.emit('setTimerMode', isCountdown);
}

function changeFaltas(team, change) {
    const input = document.getElementById(`faltas${team}`);
    const newValue = Math.max(0, Math.min(5, parseInt(input.value) + change));
    input.value = newValue;
    updateScore();
}

function resetFaltas() {
    if (confirm('Tem certeza que deseja zerar as faltas?')) {
        document.getElementById('faltasA').value = 0;
        document.getElementById('faltasB').value = 0;
        updateScore();
    }
}

function changePeriodo(change) {
    const input = document.getElementById('periodo');
    const newValue = Math.max(1, Math.min(3, parseInt(input.value) + change));
    input.value = newValue;
    updateScore();
}

function updatePeriodo() {
    updateScore();
}

// Funções do modal de ícones
function openIconModal(team) {
    currentTeam = team;
    document.getElementById('modalTeamName').textContent = `Time ${team}`;
    document.getElementById('iconModal').style.display = 'block';
    loadIconGallery();
}

function closeIconModal() {
    document.getElementById('iconModal').style.display = 'none';
    currentTeam = '';
}

function loadIconGallery() {
    const gallery = document.getElementById('iconGallery');
    
    if (availableIcons.length === 0) {
        gallery.innerHTML = '<div style="grid-column: 1/-1; text-align: center; color: #666;">Nenhum ícone encontrado na pasta icone_times</div>';
        return;
    }
    
    gallery.innerHTML = availableIcons.map(icon => `
        <div class="icon-item" onclick="selectIcon('${icon.url}')">
            <img src="${icon.url}" alt="${icon.displayName}" onerror="this.style.display='none'">
            <div class="icon-name">${icon.displayName}</div>
        </div>
    `).join('');
}

function selectIcon(iconUrl) {
    if (currentTeam) {
        document.getElementById(`icon${currentTeam}`).value = iconUrl;
        updateScore();
        closeIconModal();
    }
}

// Fechar modal clicando fora
document.getElementById('iconModal').addEventListener('click', function(e) {
    if (e.target === this) {
        closeIconModal();
    }
});

function resetScore() {
    if (confirm('Tem certeza que deseja zerar o placar?')) {
        document.getElementById('golsA').value = 0;
        document.getElementById('golsB').value = 0;
        updateScore();
    }
}

function startTimer() {
    socket.emit('startTimer');
}

function stopTimer() {
    socket.emit('stopTimer');
}

function resetTimer() {
    if (confirm('Tem certeza que deseja resetar o timer?')) {
        socket.emit('resetTimer');
    }
}

function setCustomTime() {
    const minutes = parseInt(document.getElementById('customMinutes').value) || 0;
    const seconds = parseInt(document.getElementById('customSeconds').value) || 0;
    const totalSeconds = (minutes * 60) + seconds;
    socket.emit('setTimer', totalSeconds);
}

// Auto-update quando mudar os valores
document.getElementById('golsA').addEventListener('change', updateScore);
document.getElementById('golsB').addEventListener('change', updateScore);
document.getElementById('iconA').addEventListener('change', updateScore);
document.getElementById('iconB').addEventListener('change', updateScore);
document.getElementById('faltasA').addEventListener('change', updateScore);
document.getElementById('faltasB').addEventListener('change', updateScore);
document.getElementById('periodo').addEventListener('change', updateScore);

// Theme toggle functionality
function toggleTheme() {
    const currentTheme = document.documentElement.getAttribute('data-theme');
    const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
    
    document.documentElement.setAttribute('data-theme', newTheme);
    localStorage.setItem('theme', newTheme);
    
    // Update button text
    const button = document.querySelector('.theme-toggle');
    button.textContent = newTheme === 'dark' ? '☀️ Light Mode' : '🌙 Dark Mode';
}
