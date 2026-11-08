FROM node:20-alpine

LABEL maintainer="Guilherme Zanchet"
LABEL description="Arcade Continue? - Emulador Retrô Web"

WORKDIR /app

# O projeto não possui dependências npm externas (usa módulos nativos do Node.js)
COPY package*.json ./

# Copia os arquivos do frontend, APIs serverless e servidor local
COPY serve-local.cjs ./
COPY coi-serviceworker.js ./
COPY *.html ./
COPY *.json ./
COPY api/ ./api/
COPY assets/ ./assets/
COPY licenses/ ./licenses/
COPY scripts/ ./scripts/

# Cria pontos de montagem para as pastas de jogos
RUN mkdir -p "/app/Super nintendo/GAMES" "/app/ps1" "/app/PlayStation/GAMES" "/app/neogeo" "/app/n64" "/app/gameboy" "/app/segagenisi" "/app/psp"

EXPOSE 4175

ENV PORT=4175
ENV HOST=0.0.0.0

CMD ["node", "serve-local.cjs"]
