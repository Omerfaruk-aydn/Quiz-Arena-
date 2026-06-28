# 🎮 QuizArena — Full-Stack Multiplayer Quiz Platform
## Profesyonel Proje Prompt (Kahoot Clone)

---

# 📌 PROJE VİZYONU

QuizArena; öğretmenlerin soru bankası oluşturduğu, öğrencilerin gerçek zamanlı yarıştığı,
animasyonlu bir multiplayer quiz platformudur. Kahoot'tan daha modern, daha hızlı ve
daha kişiselleştirilebilir olacak. Tasarım dili: **koyu zemin, neon aksanlar, glassmorphism
kartlar, sinematik geçişler.** Oyun hissi ön planda, eğitim işlevi arka planda.

---

# 🏗️ MİMARİ GENEL BAKIŞ

```
quizarena/
├── client/          → React + Vite (Frontend)
├── server/          → Node.js + Express (Backend API)
├── socket/          → Socket.io sunucu mantığı
├── shared/          → Ortak type/interface/constants
└── docker-compose.yml
```

---

# 🧱 FULL TECH STACK

## Frontend
| Teknoloji           | Versiyon  | Kullanım Amacı                              |
|---------------------|-----------|---------------------------------------------|
| React               | 18.x      | UI framework                                |
| Vite                | 5.x       | Build tool (CRA değil, Vite kullan)         |
| TypeScript          | 5.x       | Type safety                                 |
| Framer Motion       | 11.x      | Sayfa geçişleri, mount/unmount animasyonları|
| GSAP + ScrollTrigger| 3.x       | Kompleks timeline, confetti, kazanma ekranı |
| Socket.io-client    | 4.x       | Real-time bağlantı                          |
| Zustand             | 4.x       | Global state (Redux değil, Zustand)         |
| React Query         | 5.x       | Server state, caching, API calls            |
| React Router DOM    | 6.x       | Client-side routing                         |
| Axios               | 1.x       | HTTP client                                 |
| Tailwind CSS        | 3.x       | Utility-first styling                       |
| shadcn/ui           | latest    | Base components (Button, Dialog, Input...)  |
| Radix UI            | latest    | Accessible primitives (shadcn'nin altında)  |
| Recharts            | 2.x       | Game sonucu grafikleri                      |
| react-hot-toast     | 2.x       | Notification sistemi                        |
| Lucide React        | latest    | Icon seti                                   |
| clsx + tailwind-merge| latest  | Conditional classnames                      |
| date-fns            | 3.x       | Tarih formatlama                            |
| react-use           | latest    | Useful hooks koleksiyonu                    |

## Backend
| Teknoloji         | Versiyon | Kullanım Amacı                              |
|-------------------|----------|---------------------------------------------|
| Node.js           | 20 LTS   | Runtime                                     |
| Express.js        | 4.x      | HTTP server + REST API                      |
| TypeScript        | 5.x      | Type safety (backend de TS)                 |
| Socket.io         | 4.x      | Real-time engine                            |
| MongoDB           | 7.x      | Ana veritabanı                              |
| Mongoose          | 8.x      | ODM                                         |
| Redis             | 7.x      | Session cache + game state                  |
| ioredis           | 5.x      | Redis client                                |
| JWT               | 9.x      | Authentication tokens                       |
| bcryptjs          | 2.x      | Password hashing                            |
| Zod               | 3.x      | Input validation (hem backend hem client)   |
| multer            | 1.x      | Image upload                                |
| sharp             | 0.33.x   | Image resize/optimize                       |
| cloudinary        | 2.x      | Image CDN                                   |
| nodemailer        | 6.x      | Email (şifre sıfırlama vb.)                 |
| helmet            | 7.x      | HTTP security headers                       |
| cors              | 2.x      | CORS policy                                 |
| express-rate-limit| 7.x      | Rate limiting                               |
| morgan            | 1.x      | HTTP request logging                        |
| winston           | 3.x      | Application logging                         |
| dotenv            | 16.x     | Environment variables                       |

## DevOps & Tooling
| Teknoloji        | Kullanım                      |
|------------------|-------------------------------|
| Docker           | Containerization              |
| Docker Compose   | Local multi-service           |
| pnpm             | Package manager (hız için)    |
| ESLint + Prettier| Code quality                  |
| Husky + lint-staged| Pre-commit hooks            |
| Jest + Supertest | Backend unit/integration test |
| Vitest           | Frontend unit test            |
| Playwright       | E2E test                      |

---

# 🗂️ KLASÖR YAPISI (Detaylı)

## Client (`client/src/`)

```
src/
├── assets/
│   ├── fonts/
│   ├── sounds/               → correctAnswer.mp3, wrongAnswer.mp3,
│   │                           countdown.mp3, gameStart.mp3, win.mp3
│   └── images/
│
├── components/
│   ├── ui/                   → shadcn/ui primitives (Button, Card, Badge...)
│   ├── layout/
│   │   ├── AppLayout.tsx     → Authenticated route wrapper
│   │   ├── GameLayout.tsx    → Game sırasında fullscreen layout
│   │   ├── Navbar.tsx        → Dashboard navbar
│   │   └── Sidebar.tsx       → Teacher dashboard sidebar
│   │
│   ├── auth/
│   │   ├── LoginForm.tsx
│   │   ├── RegisterForm.tsx
│   │   └── AuthGuard.tsx     → Protected route HOC
│   │
│   ├── quiz/
│   │   ├── QuizCard.tsx      → Quiz list'te gösterilen card
│   │   ├── QuizForm.tsx      → Quiz create/edit formu
│   │   ├── QuestionEditor.tsx→ Single question edit
│   │   ├── AnswerOption.tsx  → A/B/C/D cevap seçeneği
│   │   └── QuizPreview.tsx   → Quiz önizleme
│   │
│   ├── game/
│   │   ├── GameLobby.tsx     → Oyuncuların beklediği lobi
│   │   ├── GameQuestion.tsx  → Soru ekranı (countdown dahil)
│   │   ├── GameAnswerGrid.tsx→ 4 şıklı cevap grid'i
│   │   ├── GameLeaderboard.tsx→ Soru sonrası skor tablosu
│   │   ├── GameResults.tsx   → Oyun sonu ekranı
│   │   ├── PlayerPodium.tsx  → 1.-2.-3. animasyonlu podyum
│   │   ├── CountdownTimer.tsx→ Circular progress + sayı
│   │   ├── ScorePopup.tsx    → Doğru cevapta puan patlama
│   │   └── ConfettiCanvas.tsx→ GSAP confetti sistemi
│   │
│   ├── dashboard/
│   │   ├── StatsCards.tsx    → Total quiz, oyun, katılımcı
│   │   ├── RecentGames.tsx   → Son oyunlar tablosu
│   │   └── ActivityChart.tsx → Recharts bar chart
│   │
│   └── common/
│       ├── LoadingSpinner.tsx → Animated loading
│       ├── ErrorBoundary.tsx
│       ├── EmptyState.tsx
│       └── Avatar.tsx         → User avatarı (renk + initials)
│
├── pages/
│   ├── auth/
│   │   ├── LoginPage.tsx
│   │   └── RegisterPage.tsx
│   │
│   ├── dashboard/
│   │   └── DashboardPage.tsx  → Teacher ana sayfası
│   │
│   ├── quiz/
│   │   ├── QuizListPage.tsx   → Quiz kütüphanesi
│   │   ├── QuizCreatePage.tsx → Yeni quiz oluştur
│   │   └── QuizEditPage.tsx   → Quiz düzenle
│   │
│   ├── game/
│   │   ├── GameHostPage.tsx   → Host oyun yönetim ekranı
│   │   ├── GamePlayerPage.tsx → Oyuncu oyun ekranı
│   │   ├── GameJoinPage.tsx   → PIN ile katılma ekranı
│   │   └── GameReportPage.tsx → Oyun sonrası detaylı rapor
│   │
│   └── public/
│       └── LandingPage.tsx    → Açılış sayfası
│
├── hooks/
│   ├── useSocket.ts           → Socket.io bağlantı hook'u
│   ├── useGame.ts             → Oyun state yönetimi
│   ├── useTimer.ts            → Countdown timer
│   ├── useSound.ts            → Ses efektleri
│   ├── useAuth.ts             → Auth işlemleri
│   └── useKeyboardShortcut.ts → Klavye kısayolları
│
├── stores/
│   ├── authStore.ts           → Kullanıcı bilgisi, token
│   ├── gameStore.ts           → Oyun state (sorular, skorlar, timer)
│   └── uiStore.ts             → Modal, sidebar, theme state
│
├── services/
│   ├── api.ts                 → Axios instance + interceptors
│   ├── authService.ts         → Login, register, refresh token
│   ├── quizService.ts         → CRUD quiz operations
│   └── gameService.ts         → Game report, history
│
├── socket/
│   ├── socketClient.ts        → Socket.io connection setup
│   ├── gameEvents.ts          → Emit fonksiyonları
│   └── gameListeners.ts       → On listener fonksiyonları
│
├── lib/
│   ├── utils.ts               → Helper fonksiyonlar
│   ├── constants.ts           → Renkler, konfig sabitleri
│   ├── validations.ts         → Zod schemas (client-side)
│   └── animations.ts          → Framer Motion variants
│
├── types/
│   ├── quiz.types.ts
│   ├── game.types.ts
│   ├── user.types.ts
│   └── socket.types.ts
│
├── App.tsx
├── main.tsx
└── vite.config.ts
```

## Server (`server/src/`)

```
src/
├── api/
│   ├── routes/
│   │   ├── auth.routes.ts
│   │   ├── quiz.routes.ts
│   │   ├── game.routes.ts
│   │   └── user.routes.ts
│   │
│   ├── controllers/
│   │   ├── auth.controller.ts
│   │   ├── quiz.controller.ts
│   │   ├── game.controller.ts
│   │   └── user.controller.ts
│   │
│   ├── middlewares/
│   │   ├── authenticate.ts    → JWT doğrulama
│   │   ├── authorize.ts       → Role kontrolü
│   │   ├── validate.ts        → Zod validation
│   │   ├── upload.ts          → Multer file upload
│   │   └── rateLimiter.ts
│   │
│   └── validators/
│       ├── auth.validator.ts
│       ├── quiz.validator.ts
│       └── game.validator.ts
│
├── socket/
│   ├── index.ts               → Socket.io sunucu setup
│   ├── handlers/
│   │   ├── connection.handler.ts
│   │   ├── lobby.handler.ts   → Lobi olayları
│   │   ├── game.handler.ts    → Oyun akışı olayları
│   │   └── chat.handler.ts    → Lobi chat (bonus feature)
│   │
│   └── gameEngine/
│       ├── GameRoom.ts        → Her oyun oturumunun sınıfı
│       ├── GameState.ts       → State machine
│       ├── ScoreCalculator.ts → Puan hesaplama algoritması
│       └── QuestionTimer.ts   → Sunucu tarafı timer
│
├── models/
│   ├── User.model.ts
│   ├── Quiz.model.ts
│   ├── Question.model.ts
│   ├── GameSession.model.ts
│   ├── GameParticipant.model.ts
│   └── GameAnswer.model.ts
│
├── services/
│   ├── authService.ts         → Token üret, doğrula
│   ├── emailService.ts        → Nodemailer
│   ├── redisService.ts        → Cache operasyonları
│   ├── imageService.ts        → Cloudinary upload
│   └── gameSessionService.ts  → DB'ye oyun kaydet
│
├── config/
│   ├── database.ts            → MongoDB bağlantısı
│   ├── redis.ts               → Redis bağlantısı
│   ├── cloudinary.ts
│   └── env.ts                 → Zod ile env validation
│
├── utils/
│   ├── logger.ts              → Winston setup
│   ├── generatePIN.ts         → 6 haneli benzersiz PIN
│   ├── asyncHandler.ts        → Express async wrapper
│   └── ApiError.ts            → Custom error class
│
├── types/
│   ├── express.d.ts           → req.user type augmentation
│   └── game.types.ts
│
├── app.ts                     → Express app setup
└── index.ts                   → Sunucu entry point
```

---

# 🍃 VERİTABANI ŞEMALARI (MongoDB / Mongoose)

## User Schema
```typescript
{
  _id: ObjectId,
  name: string,                    // "Ahmet Yılmaz"
  email: string,                   // unique, lowercase, indexed
  password: string,                // bcrypt hash
  role: "teacher" | "student",
  avatar: {
    url: string,                   // Cloudinary URL
    publicId: string               // Cloudinary public_id
  },
  refreshToken: string,            // hashed
  isEmailVerified: boolean,
  emailVerificationToken: string,
  passwordResetToken: string,
  passwordResetExpires: Date,
  stats: {
    totalGamesHosted: number,
    totalGamesPlayed: number,
    totalQuestionsAnswered: number,
    correctAnswers: number,
    highScore: number
  },
  createdAt: Date,
  updatedAt: Date
}
```

## Quiz Schema
```typescript
{
  _id: ObjectId,
  title: string,                   // max 100 char
  description: string,             // max 500 char
  coverImage: {
    url: string,
    publicId: string
  },
  creator: ObjectId,               // ref: User
  category: string,                // "Matematik", "Tarih", "Bilim"...
  difficulty: "easy" | "medium" | "hard",
  tags: string[],                  // max 10 tag
  isPublic: boolean,               // public quiz kütüphanesi
  questions: [ObjectId],           // ref: Question
  settings: {
    defaultTimeLimit: number,      // saniye, 10-120 arası
    showAnswerAfterEach: boolean,  // her soru sonrası cevap göster
    randomizeQuestions: boolean,
    randomizeAnswers: boolean,
    maxParticipants: number        // 0 = sınırsız
  },
  stats: {
    timesPlayed: number,
    averageScore: number,
    totalParticipants: number
  },
  createdAt: Date,
  updatedAt: Date
}
```

## Question Schema
```typescript
{
  _id: ObjectId,
  quiz: ObjectId,                  // ref: Quiz
  type: "multiple_choice"          // v2'de "true_false", "open_ended"
       | "true_false"
       | "image_choice",
  text: string,                    // max 200 char
  image: {                         // opsiyonel
    url: string,
    publicId: string
  },
  answers: [
    {
      text: string,                // max 75 char
      isCorrect: boolean,
      color: "red" | "blue" | "yellow" | "green"  // sabit renk ataması
    }
  ],                               // 2-4 adet
  timeLimit: number,               // saniye, quiz default'unu override eder
  points: 1000,                    // base puan (hız bonusu eklenir)
  explanation: string,             // cevap sonrası gösterilecek açıklama
  order: number,                   // quiz içindeki sıra
  createdAt: Date
}
```

## GameSession Schema
```typescript
{
  _id: ObjectId,
  pin: string,                     // 6 haneli unique, indexed
  quiz: ObjectId,                  // ref: Quiz
  host: ObjectId,                  // ref: User
  status: "lobby"
        | "starting"
        | "active"
        | "question_results"
        | "leaderboard"
        | "finished",
  currentQuestionIndex: number,
  participants: [ObjectId],        // ref: GameParticipant
  settings: {                      // Quiz settings snapshot (override edilebilir)
    timeLimit: number,
    showAnswerAfterEach: boolean,
    randomizeQuestions: boolean,
    randomizeAnswers: boolean,
    maxParticipants: number
  },
  questionOrder: [ObjectId],       // randomize edilmiş soru sırası
  startedAt: Date,
  finishedAt: Date,
  duration: number,                // toplam süre (ms)
  createdAt: Date
}
```

## GameParticipant Schema
```typescript
{
  _id: ObjectId,
  session: ObjectId,               // ref: GameSession
  user: ObjectId,                  // ref: User (null ise guest)
  nickname: string,                // Oyun içi görünen ad
  avatar: {
    emoji: string,                 // "🦊", "🐻", seçilen emoji avatar
    color: string                  // bg rengi
  },
  socketId: string,
  totalScore: number,
  rank: number,                    // oyun sonunda hesaplanır
  streak: number,                  // consecutive correct answers
  answers: [ObjectId],             // ref: GameAnswer
  isConnected: boolean,
  joinedAt: Date
}
```

## GameAnswer Schema
```typescript
{
  _id: ObjectId,
  session: ObjectId,               // ref: GameSession
  participant: ObjectId,           // ref: GameParticipant
  question: ObjectId,              // ref: Question
  selectedAnswer: number,          // index (0-3), null = süre doldu
  isCorrect: boolean,
  responseTime: number,            // ms (answer time - question start time)
  pointsEarned: number,            // hız bonusu dahil
  answeredAt: Date
}
```

---

# ⚡ SOCKET.IO EVENT ARCHITECTURE

## Namespace & Room Yapısı
```
Namespace: /game
Room: game:{PIN}           → Tüm katılımcılar + host
Room: game:{PIN}:host      → Sadece host
Room: game:{PIN}:players   → Sadece oyuncular
```

## Client → Server Events

```typescript
// Lobi
"lobby:join"         { pin: string, nickname: string, emoji: string }
"lobby:leave"        { pin: string }
"lobby:ready"        {}  // oyuncu hazır işareti (opsiyonel feature)

// Host olayları
"host:create_game"   { quizId: string, settings?: GameSettings }
"host:start_game"    { pin: string }
"host:next_question" { pin: string }
"host:skip_question" { pin: string }
"host:end_game"      { pin: string }
"host:kick_player"   { pin: string, participantId: string }

// Oyun içi
"game:submit_answer" { pin: string, answerIndex: number, responseTime: number }

// Chat (lobi sırasında)
"chat:message"       { pin: string, message: string }
```

## Server → Client Events

```typescript
// Lobi
"lobby:player_joined"    { participant: ParticipantDTO, totalCount: number }
"lobby:player_left"      { participantId: string, totalCount: number }
"lobby:player_list"      { participants: ParticipantDTO[] }
"lobby:player_kicked"    { participantId: string }
"lobby:chat_message"     { nickname: string, message: string, timestamp: Date }

// Oyun akışı
"game:starting"          { countdown: 3 }  // 3-2-1 geri sayım
"game:question_start"    { question: QuestionDTO, index: number, total: number, timeLimit: number }
"game:timer_tick"        { remaining: number }  // her saniye
"game:answer_received"   { count: number }  // kaç kişi cevapladı (host + oyuncuya)
"game:question_end"      { correctAnswer: number, explanation: string, answerStats: AnswerStats }
"game:leaderboard"       { leaderboard: LeaderboardEntry[], myRank?: number, myScore?: number }
"game:player_result"     { isCorrect: boolean, pointsEarned: number, totalScore: number, rank: number }
"game:finished"          { finalLeaderboard: FinalLeaderboardEntry[] }

// Bağlantı
"game:error"             { code: string, message: string }
"game:reconnected"       { gameState: ReconnectStateDTO }  // tab yenilenirse

// Host-only
"host:answer_distribution" { distribution: [number, number, number, number] }
  // Her şıkka kaç kişi bastı (canlı)
```

## Puan Hesaplama Algoritması
```typescript
// ScoreCalculator.ts
function calculatePoints(
  isCorrect: boolean,
  responseTime: number,    // ms cinsinden
  timeLimit: number,       // ms cinsinden
  basePoints: number = 1000,
  streak: number = 0
): number {
  if (!isCorrect) return 0;

  // Hız bonusu: ilk yarıda cevaplarsan tam puan alırsın
  // İkinci yarıda oransal olarak düşer
  const timeRatio = Math.max(0, 1 - (responseTime / timeLimit));
  const speedBonus = Math.round(basePoints * timeRatio * 0.5);

  // Streak bonusu: arka arkaya doğrular
  const streakBonus = Math.min(streak * 50, 200);  // max 200 bonus

  return basePoints + speedBonus + streakBonus;
}

// Örnek:
// 10 saniyelik soruda 2 saniyede doğru cevap → 1000 + 400 + streak = yüksek puan
// 10 saniyelik soruda 9 saniyede doğru cevap → 1000 + 50 = düşük puan
```

---

# 🔐 AUTH AKIŞI

## JWT Stratejisi (Access + Refresh Token)
```
1. Login → { accessToken (15dk), refreshToken (7gün) }
2. accessToken: Authorization: Bearer header'da gönderilir
3. refreshToken: httpOnly cookie'de saklanır (CSRF korumalı)
4. accessToken süresi dolunca → /auth/refresh endpoint'i
5. refreshToken de süresi dolunca → yeniden login
6. Logout → refreshToken invalidate (DB'den sil)
```

## API Endpoints

### Auth Routes
```
POST   /api/auth/register         → Kayıt
POST   /api/auth/login            → Giriş
POST   /api/auth/logout           → Çıkış
POST   /api/auth/refresh          → Token yenile
POST   /api/auth/forgot-password  → Şifre sıfırlama maili
POST   /api/auth/reset-password/:token → Şifre güncelle
GET    /api/auth/me               → Mevcut kullanıcı bilgisi
```

### Quiz Routes
```
GET    /api/quizzes               → Kendi quizlerini listele (paginated)
GET    /api/quizzes/public        → Public quiz kütüphanesi
POST   /api/quizzes               → Yeni quiz oluştur
GET    /api/quizzes/:id           → Quiz detayı
PUT    /api/quizzes/:id           → Quiz güncelle
DELETE /api/quizzes/:id           → Quiz sil
POST   /api/quizzes/:id/duplicate → Quiz klonla
POST   /api/quizzes/:id/questions → Soru ekle
PUT    /api/quizzes/:id/questions/:qId → Soru güncelle
DELETE /api/quizzes/:id/questions/:qId → Soru sil
POST   /api/quizzes/:id/cover     → Cover image upload
PATCH  /api/quizzes/:id/questions/reorder → Soru sırası değiştir
```

### Game Routes
```
POST   /api/games                 → Oyun oturumu oluştur (PIN üretilir)
GET    /api/games/:pin            → Oyun bilgisi (join öncesi)
GET    /api/games/:pin/report     → Oyun sonrası detaylı rapor
GET    /api/games/history         → Kullanıcının oyun geçmişi
```

### User Routes
```
GET    /api/users/stats           → Kullanıcı istatistikleri
PUT    /api/users/profile         → Profil güncelle
POST   /api/users/avatar          → Avatar yükle
```

---

# 🎨 DESIGN SYSTEM & UI/UX

## Renk Paleti
```
Background: #0A0A0F      (almost black)
Surface:     #13131A      (card bg)
Surface2:    #1C1C28      (elevated card)
Border:      #2A2A3A      (subtle border)

Primary:     #7C3AED      (vibrant purple)
Primary-glow:#7C3AED40   (glow efekti için)

Accent1:     #EC4899      (hot pink - cevap seçenekleri)
Accent2:     #3B82F6      (blue)
Accent3:     #F59E0B      (amber)
Accent4:     #10B981      (emerald)

Correct:     #22C55E
Wrong:       #EF4444
Text:        #F8FAFC
Text-muted:  #94A3B8
```

## Typography
```
Display:  "Space Grotesk" (başlıklar, rakamlar)
Body:     "Inter" (paragraf, açıklamalar)
Mono:     "JetBrains Mono" (PIN kodları)
→ Google Fonts'tan import edilecek
```

## Cevap Seçeneği Renkleri (Kahoot gibi)
```
A → Kırmızı   #EF4444   ▲ triangle icon
B → Mavi      #3B82F6   ● circle icon
C → Sarı      #F59E0B   ■ square icon
D → Yeşil     #10B981   ♦ diamond icon
```

---

# 🎬 ANİMASYON REHBERİ

## Framer Motion - Sayfa Geçişleri
```typescript
// lib/animations.ts

// Sayfa mount/unmount
export const pageVariants = {
  initial: { opacity: 0, y: 20, scale: 0.98 },
  animate: { opacity: 1, y: 0, scale: 1, transition: { duration: 0.3, ease: "easeOut" } },
  exit:    { opacity: 0, y: -20, scale: 0.98, transition: { duration: 0.2 } }
};

// Stagger children (oyuncu listesi, quiz kartları)
export const containerVariants = {
  animate: { transition: { staggerChildren: 0.08 } }
};

export const itemVariants = {
  initial: { opacity: 0, x: -20 },
  animate: { opacity: 1, x: 0 }
};

// Cevap seçeneği hover
export const answerVariants = {
  rest:    { scale: 1 },
  hover:   { scale: 1.03, transition: { type: "spring", stiffness: 400 } },
  tap:     { scale: 0.97 },
  correct: { scale: [1, 1.1, 1], backgroundColor: "#22C55E" },
  wrong:   { scale: [1, 0.95, 1], backgroundColor: "#EF4444" }
};

// Skor popup
export const scorePopupVariants = {
  initial: { opacity: 0, scale: 0.5, y: 20 },
  animate: { opacity: 1, scale: 1, y: -30, transition: { type: "spring", damping: 10 } },
  exit:    { opacity: 0, y: -60, transition: { duration: 0.4 } }
};

// Leaderboard öğeleri (rank'e göre delay)
export const leaderboardItemVariants = (rank: number) => ({
  initial: { opacity: 0, x: rank % 2 === 0 ? 50 : -50 },
  animate: { opacity: 1, x: 0, transition: { delay: rank * 0.1, duration: 0.4 } }
});
```

## GSAP - Özel Animasyonlar

### Confetti Sistemi (oyun sonu)
```typescript
// components/game/ConfettiCanvas.tsx
import gsap from "gsap";

function launchConfetti(canvas: HTMLCanvasElement) {
  const ctx = canvas.getContext("2d")!;
  const particles: Particle[] = [];
  const COLORS = ["#7C3AED", "#EC4899", "#F59E0B", "#3B82F6", "#10B981"];

  // 150 confetti parçacığı oluştur
  for (let i = 0; i < 150; i++) {
    particles.push({
      x: Math.random() * canvas.width,
      y: -20,
      size: Math.random() * 8 + 4,
      color: COLORS[Math.floor(Math.random() * COLORS.length)],
      rotation: 0,
      speedX: (Math.random() - 0.5) * 4,
      speedY: Math.random() * 4 + 2,
      rotationSpeed: (Math.random() - 0.5) * 10
    });
  }

  // GSAP ticker ile animate et
  const ticker = gsap.ticker.add(() => {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    particles.forEach(p => {
      p.x += p.speedX;
      p.y += p.speedY;
      p.rotation += p.rotationSpeed;
      // draw rotated rect
      ctx.save();
      ctx.translate(p.x, p.y);
      ctx.rotate((p.rotation * Math.PI) / 180);
      ctx.fillStyle = p.color;
      ctx.fillRect(-p.size / 2, -p.size / 2, p.size, p.size);
      ctx.restore();
    });
  });

  // 4 saniye sonra temizle
  setTimeout(() => gsap.ticker.remove(ticker), 4000);
}
```

### Countdown Timer Animasyonu
```typescript
// CountdownTimer.tsx - SVG circle progress
// GSAP ile SVG stroke-dashoffset animasyonu
gsap.to(circleRef.current, {
  strokeDashoffset: circumference,  // dolu → boş
  duration: timeLimit,
  ease: "none",
  onUpdate: updateTimeDisplay
});

// Son 5 saniyede kırmızıya dön + pulse
gsap.to(circleRef.current, {
  stroke: "#EF4444",
  duration: 0.3,
  delay: timeLimit - 5
});
```

### Podyum Animasyonu (oyun sonu)
```typescript
// PlayerPodium.tsx
// 3. → 2. → 1. sırayla çıkma animasyonu

const tl = gsap.timeline();
tl.from(".podium-3rd", { y: 100, opacity: 0, duration: 0.5 })
  .from(".podium-2nd", { y: 120, opacity: 0, duration: 0.5 }, "+=0.3")
  .from(".podium-1st", { y: 150, opacity: 0, duration: 0.6 }, "+=0.3")
  .from(".crown-icon", { scale: 0, rotation: -180, duration: 0.4, ease: "back.out(2)" }, "-=0.1");
```

---

# 🎮 OYUN AKIŞI (Game Flow)

## Host Tarafı Adımlar
```
1. Dashboard → "Oyun Başlat" butonuna tıkla
2. Quiz seç → Ayarları gözden geçir/düzenle
3. Oyun oluşturulur → PIN: 739281 ekranı
4. Lobi: Katılan oyuncuları canlı görür
5. "Başlat" butonu → 3-2-1 geri sayım
6. Soru ekranı: Kaç kişi cevapladı gösterir (gerçek zamanlı)
7. "Sonraki Soru" veya süre dolunca otomatik geçiş
8. Soru aralarında leaderboard
9. Son soru → Oyun sonu ekranı (podyum + confetti)
10. Raporu kaydet → Dashboard'da görüntüle
```

## Oyuncu Tarafı Adımlar
```
1. quizarena.app/join → PIN gir → Nickname + emoji seç
2. Lobi: Diğer oyuncuları görür + lobide chat
3. Oyun başladığında soru ekranı gelir
4. Cevabı seç → Animasyon + bekleme
5. Doğru/yanlış + puan gösterilir
6. Soru arası: Leaderboard + kendi sırası
7. Oyun sonu: Final rank + skor kartı
```

## Reconnection Stratejisi
```typescript
// Oyuncu tab yenilemesi veya bağlantı kopmasında:
socket.on("reconnect", () => {
  socket.emit("game:rejoin", { pin, participantId });
});

// Server: mevcut game state'i döner
socket.on("game:reconnected", (state: ReconnectStateDTO) => {
  // Şu anki soruya sync olunur
  gameStore.syncState(state);
});
```

---

# 📊 ÖĞRETMEN DASHBOARD'U

## Ana Sayfa Widgets
```
┌─────────────────────────────────────────────────────┐
│  📊 Toplam Quiz  │  🎮 Oyun Sayısı  │  👥 Katılımcı │
│      14          │       47         │     1,203      │
├─────────────────────────────────────────────────────┤
│                                                     │
│  [Son 30 Günde Aktivite - Recharts Bar Chart]       │
│                                                     │
├─────────────────────────────────────────────────────┤
│  Son Oyunlar                          Tüm geçmiş → │
│  ─────────────────────────────────────────────────  │
│  Türkiye Tarihi  |  23 oyuncu  |  Ort: 68%  | ...  │
│  Matematik Testi |  15 oyuncu  |  Ort: 55%  | ...  │
└─────────────────────────────────────────────────────┘
```

## Oyun Raporu Sayfası
```
- Soru bazlı doğruluk oranı (bar chart)
- Ortalama cevap süresi (her soru için)
- En çok hata yapılan sorular
- Oyuncu bazlı tablo: Skor, doğru sayısı, ortalama süre
- CSV export butonu
- Her soru için cevap dağılımı (pie chart)
```

---

# 🔧 QUIZ OLUŞTURUCU

## Özellikler
```
- Drag & drop soru sıralama (dnd-kit)
- Soru tipi: Çoktan seçmeli / Doğru-Yanlış
- Her şıkka resim eklenebilir (opsiyonel)
- Soruya resim/YouTube linki eklenebilir
- Süre soru bazlı ayarlanabilir (10/20/30/60/90/120 sn)
- Her soru için açıklama alanı (cevap sonrası gösterilir)
- Otomatik kaydetme (debounce 2sn)
- Quiz önizleme modu
- Soru bankasından kopyala
```

## Rich Text Editor
```typescript
// Basit ama güçlü: react-quill KULLANMA
// Bunun yerine: tiptap editor (headless, tam kontrol)
// Desteklenecek: Bold, Italic, Math formül (KaTeX), Link
```

---

# 🔒 GÜVENLİK

## Önlemler
```
1. Helmet.js → Content-Security-Policy, XSS headers
2. Rate limiting → /api/auth/login: 5 istek/dk
3. JWT secret rotation → Redis'te token blacklist
4. MongoDB injection → Mongoose ODM + Zod validation
5. File upload → Tip kontrolü (image/jpeg, image/png, image/webp only)
             → Boyut limiti (5MB)
             → Cloudinary'ye yükle, local'de tutma
6. Socket.io → Bağlantıda JWT doğrulama
             → Room'a katılımda PIN doğrulama
             → Rate: dakikada max 60 event
7. CORS → Yalnızca izin verilen originler
8. ENV → Zod ile tip güvenli env validation
```

---

# 📱 RESPONSIVE TASARIM

## Breakpoints
```
Mobile:   375px - 767px   (oyuncu ekranı öncelikli)
Tablet:   768px - 1023px  (her iki rol çalışmalı)
Desktop: 1024px+          (host dashboard öncelikli)

NOT: Host oyunu yönetmek için muhtemelen büyük ekran kullanır.
     Oyuncular telefonda oynar. Bu yüzden:
     - Oyuncu cevap butonları minimum 64px yüksek olmalı
     - Host ekranı data-rich olabilir
```

---

# 🚀 DEPLOYMENT

## Docker Compose (Local)
```yaml
version: "3.8"
services:
  client:
    build: ./client
    ports: ["5173:5173"]
    environment:
      VITE_API_URL: http://localhost:4000
      VITE_SOCKET_URL: http://localhost:4000

  server:
    build: ./server
    ports: ["4000:4000"]
    depends_on: [mongodb, redis]
    environment:
      MONGODB_URI: mongodb://mongodb:27017/quizarena
      REDIS_URL: redis://redis:6379
      JWT_SECRET: ...
      JWT_REFRESH_SECRET: ...
      CLOUDINARY_CLOUD_NAME: ...
      CLOUDINARY_API_KEY: ...
      CLOUDINARY_API_SECRET: ...

  mongodb:
    image: mongo:7
    volumes: ["mongodb_data:/data/db"]
    ports: ["27017:27017"]

  redis:
    image: redis:7-alpine
    ports: ["6379:6379"]
    volumes: ["redis_data:/data"]

volumes:
  mongodb_data:
  redis_data:
```

## Production (Önerilen)
```
Frontend:  Vercel (React + Vite)
Backend:   Railway veya Render (Node.js)
Database:  MongoDB Atlas (M0 free → production'da M10+)
Redis:     Upstash (Serverless Redis, free tier var)
Images:    Cloudinary (free tier yeterli başlangıç için)
```

---

# 🧪 TEST STRATEJİSİ

## Backend (Jest + Supertest)
```
- Auth: register, login, refresh, logout
- Quiz CRUD: create, read, update, delete, permissions
- Game: PIN oluşturma, session yönetimi
- Score calculation: farklı senaryolar
```

## Frontend (Vitest + React Testing Library)
```
- Form validasyonları
- Game timer hook
- Score hesaplama utility
- Component render testleri
```

## E2E (Playwright)
```
- Tam oyun senaryosu: Host oluştur → Oyuncu katıl → Oyna → Rapor gör
- Auth flow
- Quiz create → edit → delete
```

---

# 📋 GELIŞTIRME SIRALAMA (Roadmap)

## Hafta 1 — Temel Altyapı
```
- [ ] Monorepo kurulumu (pnpm workspace)
- [ ] TypeScript config (client + server)
- [ ] ESLint + Prettier + Husky
- [ ] Docker Compose ayarla
- [ ] MongoDB + Redis bağlantısı
- [ ] Express app setup (helmet, cors, morgan)
- [ ] Winston logger
- [ ] Zod env validation
- [ ] User model + auth endpoints
- [ ] JWT access/refresh token sistemi
```

## Hafta 2 — Auth & Quiz CRUD
```
- [ ] Register/Login/Logout API
- [ ] Refresh token rotasyonu
- [ ] Quiz model + CRUD endpoints
- [ ] Question model + CRUD endpoints
- [ ] Image upload (Multer + Cloudinary)
- [ ] Frontend: Design system, Tailwind config
- [ ] Frontend: Auth pages (Login, Register)
- [ ] Frontend: Zustand auth store
- [ ] Frontend: React Query setup
- [ ] Frontend: Protected routes
```

## Hafta 3 — Quiz Oluşturucu UI
```
- [ ] Dashboard layout (Sidebar + Navbar)
- [ ] Quiz list sayfası
- [ ] Quiz create/edit formu
- [ ] Question editor (add/edit/delete/reorder)
- [ ] Image upload UI
- [ ] Quiz preview modu
- [ ] Autosave implementasyonu
- [ ] Drag & drop soru sıralama
```

## Hafta 4 — Socket.io & Oyun Motoru
```
- [ ] Socket.io server setup
- [ ] GameRoom sınıfı
- [ ] GameState state machine
- [ ] ScoreCalculator
- [ ] QuestionTimer (sunucu tarafı)
- [ ] Tüm event handler'lar (lobby, game, host)
- [ ] Redis'e game state cache
- [ ] Reconnection mantığı
- [ ] Socket.io client setup
- [ ] gameStore (Zustand)
```

## Hafta 5 — Oyun UI
```
- [ ] PIN ile katılma sayfası
- [ ] Lobi ekranı (oyuncu listesi animasyonlu)
- [ ] Host lobi yönetim ekranı
- [ ] Soru ekranı (countdown timer)
- [ ] Cevap seçenekleri (Framer Motion)
- [ ] Skor popup animasyonu (GSAP)
- [ ] Leaderboard ekranı
- [ ] Oyun sonu podyum (GSAP)
- [ ] Confetti sistemi
- [ ] Ses efektleri sistemi
```

## Hafta 6 — Dashboard & Raporlar
```
- [ ] Stats widget'ları
- [ ] Aktivite grafiği (Recharts)
- [ ] Oyun geçmişi listesi
- [ ] Oyun raporu detay sayfası
- [ ] CSV export
- [ ] Profil sayfası
- [ ] Avatar upload
```

## Hafta 7 — Kalite & Polish
```
- [ ] Mobile responsive düzeltmeleri
- [ ] Error boundary'ler
- [ ] Loading skeleton'lar (her liste için)
- [ ] Empty state'ler
- [ ] Toast notification'lar
- [ ] Keyboard accessibility
- [ ] Sayfa meta title/description
- [ ] Performance optimizasyonu (lazy load, code splitting)
- [ ] Backend testleri (Jest)
- [ ] E2E test (Playwright)
```

## Hafta 8 — Deployment & Extras
```
- [ ] Production environment setup
- [ ] Vercel deploy (frontend)
- [ ] Railway deploy (backend)
- [ ] MongoDB Atlas setup
- [ ] Upstash Redis setup
- [ ] Cloudinary setup
- [ ] CI/CD (GitHub Actions)
- [ ] Landing page
- [ ] Şifre sıfırlama (email)
- [ ] Public quiz kütüphanesi
```

---

# 🎁 BONUS ÖZELLIKLER (V2)

```
- [ ] Takım modu (ekip olarak yarışma)
- [ ] Soru tipi: Açık uçlu (AI ile değerlendirme)
- [ ] Soru tipi: Görsel seçenekli (4 resim arasından seç)
- [ ] Soru tipi: Sıralama (doğru sırayı bul)
- [ ] Canlı soru editing (host oyun sırasında soru düzenleyebilir)
- [ ] Homework modu (gerçek zamanlı değil, asenkron)
- [ ] QR kod ile katılım
- [ ] Öğrenci hesapları (misafir değil, kayıtlı)
- [ ] Sınıf/grup yönetimi
- [ ] AI soru üretici (konu ver, sorular gelsin)
- [ ] Dark/light tema toggle
- [ ] Çoklu dil desteği (i18n)
- [ ] Erişilebilirlik (WCAG 2.1 AA)
```

---

# 💡 ÖNEMLİ NOTLAR

## Yapma (Anti-patterns)
```
❌ any tip kullanma (TypeScript her yerde strict)
❌ useEffect içinde socket listener ekleyip cleanup etmemeyi
❌ Client'ta oyun doğrulama (güvenlik açığı, server'da yapılmalı)
❌ setInterval ile timer (sunucu zamanı esas olmalı)
❌ Büyük component'lar (200 satırı geçen component'ı böl)
❌ Direct state mutation (Zustand immer kullan)
❌ console.log production'a bırakma (winston kullan)
❌ Hardcoded string (constants.ts'e taşı)
❌ index.ts'ten default export (named export tercih et)
```

## Yap (Best practices)
```
✅ Her Socket event için TypeScript interface
✅ Zod ile hem client hem server validasyonu
✅ API error'ları için merkezi error handler
✅ React Query'yi sadece server state için, Zustand'ı UI state için
✅ Framer Motion AnimatePresence ile unmount animasyonları
✅ useMemo/useCallback yalnızca gerektiğinde
✅ Lazy loading: büyük sayfaları React.lazy ile
✅ Image: loading="lazy", srcset, WebP format
✅ useReducer yerine Zustand (daha az boilerplate)
✅ Custom hook'lar: iş mantığını component'tan ayır
```

---

*QuizArena — Öğrenmeyi yarışmaya, yarışmayı sanat haline getir.*
