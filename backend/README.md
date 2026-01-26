# 🚀 Backend Quick Start

## ✅ Files Created

All backend files are now ready!

## 📦 Install Dependencies

Open terminal in `backend/` folder and run:

```bash
npm install
```

যদি error আসে, তাহলে এটা try করুন:

```bash
npm install --legacy-peer-deps
```

অথবা manually install করুন:

```bash
npm install express cors dotenv bcrypt jsonwebtoken helmet morgan express-rate-limit
npm install @prisma/client
npm install -D prisma nodemon
```

## 🔧 Generate Prisma Client

```bash
npx prisma generate
```

## ▶️ Start Server

```bash
npm run dev
```

Server চলবে: `http://localhost:3001`

## 🧪 Test API

### Health Check
```bash
curl http://localhost:3001/health
```

### Login
```bash
curl -X POST http://localhost:3001/api/auth/login -H "Content-Type: application/json" -d "{\"email\":\"admin@undp.org\",\"password\":\"Admin@2026\"}"
```

### Get Projects
```bash
curl http://localhost:3001/api/projects
```

---

**Backend ready!** 🎉
