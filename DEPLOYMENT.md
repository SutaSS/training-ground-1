# 🚀 Deployment Guide - Render.com

## Prerequisites
- GitHub account dengan repo sudah push
- Supabase database (atau PostgreSQL lainnya)
- Render.com account (gratis)

---

## 📋 Step-by-Step Deployment

### 1. **Persiapan Repository**

Pastikan semua file sudah di-commit:
```bash
git add .
git commit -m "chore: prepare for render deployment"
git push origin main
```

### 2. **Setup Render Service**

1. Login ke [Render.com](https://render.com)
2. Click **"New +"** → **"Web Service"**
3. Connect GitHub repository kamu
4. Pilih repo: `training-ground-1`

### 3. **Konfigurasi Build Settings**

Render akan auto-detect dari `render.yaml`, tapi pastikan:

- **Name**: `library-management` (atau nama bebas)
- **Region**: Singapore (terdekat untuk Indonesia)
- **Branch**: `main`
- **Root Directory**: `server`
- **Runtime**: Node
- **Build Command**: `npm run build`
- **Start Command**: `npm start`

### 4. **Environment Variables**

Add di Render Dashboard → Environment:

```env
NODE_ENV=production
DATABASE_URL=<your-supabase-connection-string>
JWT_SECRET=<generate-random-string-32-chars>
JWT_EXPIRES_IN=7d
CLIENT_URL=<nanti-diisi-setelah-deploy>
```

**Generate JWT_SECRET:**
```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

**Supabase Connection String:**
- Login Supabase → Project Settings → Database
- Copy **Connection String** (mode: Session)
- Format: `postgresql://postgres.[project]:[password]@[host]:5432/postgres`

### 5. **Deploy!**

1. Click **"Create Web Service"**
2. Render akan:
   - Clone repo
   - Install dependencies (client + server)
   - Build client (generate dist/)
   - Generate Prisma client
   - Start server

**Tunggu ~5-10 menit** untuk build pertama

### 6. **Update CLIENT_URL**

Setelah deploy sukses:
1. Copy Render URL (contoh: `https://library-management-abc.onrender.com`)
2. Update environment variable `CLIENT_URL` dengan URL tersebut
3. Render akan auto-redeploy

### 7. **Run Database Migration (First Time)**

Di Render Dashboard → Shell:
```bash
npx prisma migrate deploy
npx prisma db seed
```

Atau via lokal (update DATABASE_URL ke production):
```bash
cd server
npx prisma migrate deploy --schema=./prisma/schema.prisma
npm run seed
```

---

## ✅ Testing

1. Akses: `https://your-app.onrender.com`
2. Test register, login, borrow book
3. Check browser console untuk errors
4. Test WebSocket notifications

---

## 🐛 Troubleshooting

### Build Failed - "Cannot find module"
```bash
# Pastikan dependencies di package.json lengkap
cd server && npm install
cd ../client && npm install
git add . && git commit -m "fix: update dependencies"
git push
```

### Database Connection Error
- Pastikan DATABASE_URL benar (cek Supabase)
- Cek IP whitelist di Supabase: `0.0.0.0/0` (allow all)

### CORS Error
- Pastikan CLIENT_URL diisi dengan URL Render yang benar
- Redeploy setelah update env

### Cold Start Lambat (~30s)
- Normal untuk Render free tier
- Setelah idle 15 menit, app spin down
- First request akan lambat, setelah itu fast

---

## 🔄 Update Aplikasi

```bash
# Local changes
git add .
git commit -m "feat: your changes"
git push origin main
```

Render akan **auto-deploy** setiap push ke main branch!

---

## 📊 Monitoring

- **Logs**: Render Dashboard → Logs tab
- **Metrics**: Dashboard → Metrics (CPU, memory, requests)
- **Events**: Lihat deploy history & errors

---

## 💰 Free Tier Limits

- **750 hours/month** (cukup untuk 1 app)
- **Spin down after 15 min idle**
- **512 MB RAM**
- **0.1 CPU**

Cukup untuk demo/portfolio/internship!

---

## 🎓 Tips

1. **Keep app alive**: Setup UptimeRobot untuk ping setiap 5 menit
2. **Monitor logs**: Check logs untuk error production
3. **Branch deploy**: Buat branch `staging` untuk testing sebelum production
4. **Environment groups**: Gunakan Render Environment Groups untuk manage env vars

---

## 📱 Access URLs

After deploy:
- **Frontend**: `https://your-app.onrender.com`
- **API**: `https://your-app.onrender.com/api`
- **Health Check**: `https://your-app.onrender.com/api`

---

## 🔐 Security Checklist

- ✅ JWT_SECRET random & secure
- ✅ DATABASE_URL tidak di-commit ke Git
- ✅ CORS configured with specific origin
- ✅ Environment variables set di Render
- ✅ Supabase connection pooling enabled

---

**Good luck with deployment! 🚀**

Butuh bantuan? Check Render logs atau DM!
