# ==============================================================================
# CONLIZ — IMAGEM ÚNICA (site + painel + API)
#
# Estágio 1: build da exportação estática do Next (frontend/out)
# Estágio 2: build do Spring Boot, que embute o estático em resources/static
# Estágio 3: JRE slim apenas com o jar
#
# Contexto de build: a RAIZ do repositório (render.yaml já aponta dockerContext: .)
#   docker build -f backend/Dockerfile -t conliz .
# ==============================================================================

# ---------------------------------------------------------------- 1. FRONTEND
FROM node:20-alpine AS frontend
WORKDIR /web
COPY frontend/package.json frontend/package-lock.json ./
RUN npm ci
COPY frontend/ ./
# O `npm run build` chama scripts/copy-static.mjs. Se a pasta não vier no contexto
# (por exemplo por uma regra no .dockerignore), criamos um stub: com --skip-copy o
# script só precisa existir para o Node carregar — não faz nada.
RUN mkdir -p /web/scripts && { [ -f /web/scripts/copy-static.mjs ] || printf 'console.log("[copy-static] stub: nada a copiar");\n' > /web/scripts/copy-static.mjs; }
# A exportação é gerada sem depender da API: as páginas caem no conteúdo de fallback.
ENV NEXT_TELEMETRY_DISABLED=1
RUN npm run build -- --skip-copy

# ---------------------------------------------------------------- 2. BACKEND
FROM maven:3.9.9-eclipse-temurin-21-alpine AS builder
WORKDIR /app
COPY backend/pom.xml .
RUN mvn dependency:go-offline -B
COPY backend/src ./src
# Site e painel entram como recursos estáticos do próprio jar.
COPY --from=frontend /web/out ./src/main/resources/static
RUN mvn clean package -DskipTests

# ---------------------------------------------------------------- 3. RUNTIME
FROM eclipse-temurin:21-jre-alpine
WORKDIR /app
RUN addgroup -S conliz && adduser -S conliz -G conliz
USER conliz:conliz
COPY --from=builder /app/target/*.jar app.jar
EXPOSE 8080
ENTRYPOINT ["java", "-Djava.security.egd=file:/dev/./urandom", "-jar", "app.jar"]
