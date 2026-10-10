# Production Container for قطّاط البرمجة (Qattat Code)
FROM node:20-alpine AS runner

WORKDIR /app

COPY package.json ./
COPY src/ ./src/
COPY tests/ ./tests/
COPY index.html ./

RUN node tests/qattat.test.js

EXPOSE 3000

CMD ["npx", "serve", ".", "-l", "3000"]
