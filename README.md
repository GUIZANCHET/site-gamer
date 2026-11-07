# site-gamer
site de classicos
# 🕹️ Continue? — Arcade de Bolso

Um arcade web leve, gratuito e direto ao navegador, desenvolvido com carinho para a comunidade e para a criançada que não tem acesso a PCs potentes ou não sabe configurar emuladores complexos. Escolheu, clicou, jogou! 🚀

---

## 🌟 O Propósito do Projeto
O **Continue?** nasceu com uma missão simples e poderosa: democratizar o acesso aos clássicos dos videogames e a mini-games independentes de forma 100% web. Sem telas de instalação cheias de burocracia, sem downloads perigosos e otimizado para rodar direto no navegador — seja num PC fraco de escola, num tablet antigo ou no celular dos pais.

---

## 🚀 Funcionalidades Principais
* **Zero Configuração:** Emuladores integrados que rodam direto no browser via WebAssembly (`EmulatorJS`) e HTML5 Canvas.
* **Leve e Rápido:** Interface minimalista, sem *bloatware*, otimizada para carregar instantaneamente em hardwares de entrada.
* **Suporte Multi-dispositivo:** Jogue usando o teclado do computador ou utilize os botões virtuais adaptados para telas touch em dispositivos móveis.
* **Curadoria Nostálgica:** Uma biblioteca unificada de clássicos retrô e homebrews independentes.

---

## 🛠️ Estrutura do Repositório
```text
├── index.html            # Página principal / Vitrine do Arcade
├── snes.html             # Interface do catálogo de Super Nintendo
├── ps1.html              # Interface do catálogo de PlayStation
├── player.html           # Player integrado para NES / Homebrews
├── snes-player.html      # Player integrado para SNES
├── ps1-player.html       # Player integrado para PS1
├── snes-games.json       # Catálogo de dados e metadados para SNES
├── ps1-games.json        # Catálogo de dados e metadados para PS1
├── serve-local.cjs       # Servidor Node.js local para indexação e API de ROMs
├── Dockerfile            # Imagem de container leve baseada em Node Alpine
├── docker-compose.yml    # Orquestração do container com volumes para ROMs
└── assets/               # Capas, mídias e arquivos estáticos

---

## 💻 Como Executar

### Opção 1: Usando Docker (Recomendado para qualquer dispositivo)
Se você tem o Docker instalado, pode rodar o arcade instantaneamente sem precisar instalar Node.js:

```bash
# Subir o container em segundo plano
docker compose up -d

# Ver os logs
docker compose logs -f

# Parar o container
docker compose down
```

Ou usando os atalhos do `npm`:
```bash
npm run docker:up
npm run docker:down
```

### Opção 2: Usando Node.js local
```bash
npm install
npm run dev
```

---

## 📱 Jogando no Celular, Tablet ou Smart TV
Como o servidor aceita conexões de toda a rede local (`0.0.0.0`), qualquer aparelho conectado ao mesmo Wi-Fi pode jogar:

1. Descubra o IP local do seu computador (no Linux: `hostname -I` ou `ip a`; no Windows: `ipconfig`).
2. No celular ou tablet, abra o navegador e acesse:
   ```text
   http://<IP-DO-PC>:4175
   ```
   *(Exemplo: `http://192.168.1.15:4175`)*
3. Toque em qualquer jogo! O sistema ativará os controles touch na tela automaticamente.

📜 Licença e Uso
Este projeto é distribuído sob a licença de código aberto. Sinta-se livre para estudar, adaptar e espalhar a nostalgia e o acesso à tecnologia para quem mais precisa.

Feito pra quem ainda aperta START 🕹️


---

### Como colocar no GitHub:
1. No seu repositório no GitHub, clique no botão **"Add file"** (Adicionar arquivo) -> **"Create new file"** (Criar novo arquivo).
2. No nome do arquivo, escreva exatamente: `README.md`
3. Cole todo o texto acima dentro da caixa grande de edição.
4. Clique no botão verde **"Commit changes..."** no canto superior direito para salvar. 

Pronto! O seu repositório vai ficar com uma apresentação impecável. Me avisa quando terminar para irmos para o próximo passo!