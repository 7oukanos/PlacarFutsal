const express = require('express');
const http = require('http');
const socketIo = require('socket.io');
const path = require('path');
const fs = require('fs');

const app = express();
const server = http.createServer(app);
const io = socketIo(server);

// Dados do placar
let placarData = {
  timeA: 'Time A',
  timeB: 'Time B',
  golsA: 0,
  golsB: 0,
  iconA: '',
  iconB: '',
  faltasA: 0,
  faltasB: 0,
  periodo: 1
};

// Dados do timer
let timerData = {
  seconds: 0,
  isRunning: false,
  interval: null,
  isCountdown: false,
  initialSeconds: 0
};

// Servir arquivos estáticos
app.use(express.static(__dirname));

// Rota principal - mostra o placar
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'index.html'));
});

// Rota de controle
app.get('/control', (req, res) => {
  res.sendFile(path.join(__dirname, 'control.html'));
});

// Rota para listar ícones disponíveis
app.get('/api/icons', (req, res) => {
  const iconsDir = path.join(__dirname, 'icone_times');
  
  try {
    if (!fs.existsSync(iconsDir)) {
      return res.json([]);
    }
    
    const files = fs.readdirSync(iconsDir);
    const imageFiles = files.filter(file => {
      const ext = path.extname(file).toLowerCase();
      return ['.jpg', '.jpeg', '.png', '.gif', '.webp', '.svg'].includes(ext);
    });
    
    const icons = imageFiles.map(file => ({
      name: file,
      url: `/icone_times/${file}`,
      displayName: path.basename(file, path.extname(file))
    }));
    
    res.json(icons);
  } catch (error) {
    console.error('Erro ao listar ícones:', error);
    res.json([]);
  }
});

// Configuração do Socket.IO
io.on('connection', (socket) => {
  console.log('Cliente conectado:', socket.id);

  // Enviar dados iniciais quando cliente se conecta
  socket.on('getPlacarData', () => {
    socket.emit('placarUpdate', placarData);
    socket.emit('timerUpdate', timerData);
  });

  // Atualizar placar
  socket.on('updatePlacar', (data) => {
    placarData = {
      timeA: data.timeA || placarData.timeA,
      timeB: data.timeB || placarData.timeB,
      golsA: data.golsA || 0,
      golsB: data.golsB || 0,
      iconA: data.iconA || placarData.iconA,
      iconB: data.iconB || placarData.iconB,
      faltasA: data.faltasA !== undefined ? data.faltasA : placarData.faltasA,
      faltasB: data.faltasB !== undefined ? data.faltasB : placarData.faltasB,
      periodo: data.periodo !== undefined ? data.periodo : placarData.periodo
    };
    
    console.log('Placar atualizado:', placarData);
    io.emit('placarUpdate', placarData);
  });

  // Controles do timer
  socket.on('startTimer', () => {
    if (!timerData.isRunning) {
      timerData.isRunning = true;
      timerData.interval = setInterval(() => {
        if (timerData.isCountdown) {
          timerData.seconds--;
          if (timerData.seconds <= 0) {
            timerData.seconds = 0;
            timerData.isRunning = false;
            clearInterval(timerData.interval);
            timerData.interval = null;
            console.log('Timer countdown finalizado');
            io.emit('timerFinished');
          }
        } else {
          timerData.seconds++;
        }
        io.emit('timerUpdate', timerData);
      }, 1000);
      console.log(`Timer iniciado (${timerData.isCountdown ? 'countdown' : 'normal'})`);
    }
  });

  socket.on('stopTimer', () => {
    if (timerData.isRunning) {
      timerData.isRunning = false;
      clearInterval(timerData.interval);
      timerData.interval = null;
      console.log('Timer parado');
    }
  });

  socket.on('resetTimer', () => {
    if (timerData.interval) {
      clearInterval(timerData.interval);
      timerData.interval = null;
    }
    timerData.seconds = 0;
    timerData.isRunning = false;
    io.emit('timerUpdate', timerData);
    console.log('Timer resetado');
  });

  socket.on('setTimer', (seconds) => {
    if (timerData.interval) {
      clearInterval(timerData.interval);
      timerData.interval = null;
    }
    timerData.seconds = seconds;
    timerData.initialSeconds = seconds;
    timerData.isRunning = false;
    io.emit('timerUpdate', timerData);
    console.log('Timer definido para:', seconds, 'segundos');
  });

  socket.on('setTimerMode', (isCountdown) => {
    timerData.isCountdown = isCountdown;
    console.log('Modo do timer alterado para:', isCountdown ? 'countdown' : 'normal');
    io.emit('timerUpdate', timerData);
  });

  socket.on('disconnect', () => {
    console.log('Cliente desconectado:', socket.id);
  });
});

const PORT = process.env.PORT || 3000;

server.listen(PORT, () => {
  console.log(`🚀 Servidor rodando na porta ${PORT}`);
  console.log(`📺 Placar: http://localhost:${PORT}`);
  console.log(`🎮 Controle: http://localhost:${PORT}/control`);
  console.log('');
  console.log('Para usar no OBS, adicione uma fonte "Browser Source" com a URL:');
  console.log(`http://localhost:${PORT}`);
});

// Graceful shutdown
process.on('SIGINT', () => {
  console.log('\n🛑 Encerrando servidor...');
  if (timerData.interval) {
    clearInterval(timerData.interval);
  }
  server.close(() => {
    console.log('✅ Servidor encerrado com sucesso');
    process.exit(0);
  });
});
