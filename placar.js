// Conectar ao servidor via Socket.IO
const socket = io();

let timerSeconds = 0;

function secondsToMMSS(s) {
  const m = Math.floor(s / 60).toString().padStart(2, '0');
  const sec = (s % 60).toString().padStart(2, '0');
  return `${m}:${sec}`;
}

// Escutar atualizações do servidor
socket.on('placarUpdate', (data) => {
  document.getElementById('golsA').textContent = data.golsA;
  document.getElementById('golsB').textContent = data.golsB;
  document.getElementById('timeA').textContent = data.timeA;
  document.getElementById('timeB').textContent = data.timeB;
  document.getElementById('periodo').textContent = data.periodo+"P";
  
  // Atualizar ícones
  updateTeamIcon('iconA', data.iconA);
  updateTeamIcon('iconB', data.iconB);
  
  // Atualizar faltas
  updateFaltasDisplay('A', data.faltasA || 0);
  updateFaltasDisplay('B', data.faltasB || 0);
});

function updateFaltasDisplay(team, faltas) {
  for (let i = 1; i <= 5; i++) {
    const faltaElement = document.getElementById(`falta-${team}-${i}`);
    if (i <= faltas) {
      faltaElement.classList.add('active');
    } else {
      faltaElement.classList.remove('active');
    }
  }
}

function updateTeamIcon(elementId, iconUrl) {
  const iconElement = document.getElementById(elementId);
  if (iconUrl && iconUrl.trim() !== '') {
    // Se for uma URL de imagem
    if (iconUrl.startsWith('http') || iconUrl.startsWith('data:') || iconUrl.includes('.')) {
      iconElement.innerHTML = `<img src="${iconUrl}" alt="Ícone do time">`;
    } else {
      // Se for um emoji ou texto
      iconElement.innerHTML = iconUrl;
    }
  } else {
    // Ícone padrão
    iconElement.innerHTML = '⚽';
  }
}

socket.on('timerUpdate', (data) => {
  timerSeconds = data.seconds;
  document.getElementById('timer').textContent = secondsToMMSS(timerSeconds);
  
  // Adicionar efeito visual quando countdown está próximo do fim
  const timerElement = document.getElementById('timer');
  if (data.isCountdown && data.seconds <= 10 && data.seconds > 0 && data.isRunning) {
    timerElement.style.color = '#ff4444';
    timerElement.style.animation = 'pulse 1s infinite';
  } else {
    timerElement.style.color = 'white';
    timerElement.style.animation = 'none';
  }
});

socket.on('timerFinished', () => {
  // Efeito quando o countdown termina
  const timerElement = document.getElementById('timer');
  timerElement.style.color = '#ff0000';
  timerElement.style.animation = 'blink 0.5s infinite';
});

// Inicialização
socket.on('connect', () => {
  console.log('Conectado ao servidor');
  socket.emit('getPlacarData');
});
