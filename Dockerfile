FROM node:20-alpine

LABEL maintainer="Guilherme Zanchet"
LABEL description="Arcade Continue? - Emulador Retrô Web"

WORKDIR /app

# O projeto não possui dependências npm externas (usa módulos nativos do Node.js)
COPY package*.json ./

# Copia os arquivos do frontend e servidor
COPY serve-local.cjs ./
COPY index.html ./
COPY snes.html ./
COPY ps1.html ./
COPY player.html ./
COPY snes-player.html ./
COPY ps1-player.html ./
COPY snes-games.json ./
COPY ps1-games.json ./
COPY assets/ ./assets/
COPY licenses/ ./licenses/
COPY scripts/ ./scripts/

# Cria pontos de montagem para as pastas de jogos
RUN mkdir -p "/app/Super nintendo/GAMES" "/app/ps1" "/app/PlayStation/GAMES"

EXPOSE 4175

ENV PORT=4175
ENV HOST=0.0.0.0

CMD ["node", "serve-local.cjs"]
