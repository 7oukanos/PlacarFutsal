# Sistema de Placar Futsal para OBS

Sistema completo de placar para transmissões de futsal, com controle remoto via interface web.

*By. **Ítalo Aurélio***

## 🚀 Como usar

### 1. Instalação
```bash
npm install
```

### 2. Iniciar o servidor
```bash
npm start
```

### 3. Acessar as interfaces

- **Placar (para OBS)**: http://localhost:3000
- **Controle**: http://localhost:3000/control

## 📺 Configuração no OBS

1. Adicione uma fonte **"Browser Source"**
2. URL: `http://localhost:3000`
3. Largura: 650px
4. Altura: 80px
5. CSS personalizado: `background: transparent;` **SUPER IMPORTANTE**
6. Marque **"Shutdown source when not visible"** e **"Refresh browser when scene becomes active"**

## 🎮 Funcionalidades

### Controle do Placar
- ✅ Alterar nomes dos times
- ✅ **Galeria de ícones:** Escolha ícones da pasta `icone_times` ou emojis
- ✅ Incrementar/decrementar gols
- ✅ Zerar placar
- ✅ Controle em tempo real

### Controle do Timer
- ✅ Modo normal (conta para cima)
- ✅ Modo countdown (conta para baixo até zero)
- ✅ Iniciar/parar cronômetro
- ✅ Resetar timer
- ✅ Definir tempo personalizado
- ✅ Mudar período
- ✅ Mudar icone dos times
- ✅ Efeitos visuais quando countdown está terminando
- ✅ Parada automática no countdown
- ✅ Sincronização automática

## 🛠️ Estrutura do Projeto

```
├── index.html      # Interface do placar (para OBS)
├── control.css     # Estilo do controle
├── control.js      # JavaScript do controle
├── control.html    # Interface de controle
├── LogoPantera     # Logo do placar e do controle
├── styles.css      # Estilos do placar
├── placar.js       # JavaScript do placar
├── server.js       # Servidor Node.js
├── package.json    # Dependências
├── fonte           # Fonte do placar
└── icone_times/    # Pasta com ícones dos times (imagens)
```

## 🔧 Desenvolvimento

Para desenvolvimento com auto-reload:
```bash
npm run dev
```

## 📝 Notas

- O servidor roda na porta 3000 por padrão
- Todos os dados são sincronizados em tempo real
- Interface responsiva e moderna
- Compatível com OBS Studio
- **Ícones dos times:** 
  - Coloque imagens na pasta `icone_times/` (PNG, JPG, JPEG, GIF, WEBP, SVG)
  - Escolha através da galeria visual na interface de controle
  - Suporte também para emojis (🟦, ⚽, 🏆)
- **Timer countdown:** Define o tempo desejado e inicia - para automaticamente ao chegar em zero
- **Efeitos visuais:** Timer pisca e muda de cor quando countdown está terminando
