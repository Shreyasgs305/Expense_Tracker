# 💰 Expense Tracker

### Track Expenses. Manage Budgets. Take Control of Your Finances.

**Expense Tracker** is a full-stack MERN web application designed to help users manage their personal finances in one place. Users can track income and expenses, manage multiple accounts, organize transactions into categories, set budgets, and analyze their spending.

🌐 **Live Website:** [https://myexpensestracker.in](https://myexpensestracker.in)

---

## ✨ Features

- **User Authentication** — Secure registration, login, email verification using OTP, and password reset.
- **Dashboard** — View financial summaries and get an overview of your finances.
- **Account Management** — Manage multiple financial accounts, including bank accounts, cash, wallets, and credit cards.
- **Expense Management** — Add, view, edit, and delete transactions.
- **Category Management** — Organize transactions into income and expense categories.
- **Budget Management** — Create and manage budgets to control spending.
- **Reports & Analytics** — Understand spending patterns and analyze financial activity.
- **Credit Card Payments** — Manage credit card payment transactions.
- **Loan Management** — Keep track of loan-related information.
- **Profile Management** — Update profile details and manage account settings.
- **Responsive Design** — Access the application on desktop, tablet, and mobile devices.

## 🛠️ Tech Stack

| Technology | Purpose |
|---|---|
| React.js | Frontend user interface |
| Vite | Frontend development and build tool |
| Tailwind CSS | Styling and responsive design |
| Node.js | Backend runtime |
| Express.js | REST API development |
| MongoDB | Database |
| Mongoose | Database modeling |
| JWT | Authentication |
| Axios | API communication |
| Resend | Email delivery for OTP verification and password reset |
| Vercel | Frontend deployment |
| Render | Backend deployment |

## 🏗️ Architecture

```text
              User
                |
                v
       React.js Frontend
       (Vercel Hosting)
                |
                v
        Express REST API
        (Render Hosting)
                |
                v
          MongoDB Database
                |
                v
      Store and retrieve data
```

## 🚀 Live Deployment

| Component | Platform |
|---|---|
| Frontend | Vercel |
| Backend | Render |
| Database | MongoDB |
| Email Service | Resend |

**Live application:** [myexpensestracker.in](https://myexpensestracker.in)

## ⚙️ Getting Started

Follow these steps to run the project locally.

### Prerequisites

Make sure you have installed:

- [Node.js](https://nodejs.org/)
- [MongoDB Atlas](https://www.mongodb.com/atlas) or a local MongoDB instance
- [Git](https://git-scm.com/)

### 1. Clone the Repository

```bash
git clone https://github.com/Shreyasgs305/Expense_Tracker.git
cd Expense_Tracker
```

The repository contains the frontend and backend. Run the commands below from the corresponding project directories.

### 2. Set Up the Backend

```bash
cd server
npm install
```

Create a `.env` file in the backend directory:

```env
PORT=5000
MONGODB_URI=your_mongodb_connection_string
JWT_SECRET=your_strong_random_secret
RESEND_API_KEY=your_resend_api_key
```

Configure any additional environment variables required by your backend code.

Start the backend:

```bash
npm run dev
```

### 3. Set Up the Frontend

Open a new terminal:

```bash
cd client
npm install
```

Create a `.env` file in the frontend directory:

```env
VITE_API_URL=http://localhost:5000/api
```

If your frontend or backend folders have different names, adjust the commands accordingly.

Start the frontend:

```bash
npm run dev
```

Open the local URL displayed in your terminal, usually `http://localhost:5173`.

> **Important:** Never commit `.env` files, database credentials, JWT secrets, or API keys to GitHub.

## 🔐 Security

- Token-based authentication using JWT.
- Password hashing before storage.
- Email OTP verification for account registration.
- OTP-based password reset.
- Protected routes for authenticated users.
- Environment variables for sensitive configuration.

## 📈 Future Improvements

- Export financial reports to PDF and Excel.
- Add recurring transactions.
- Introduce savings goals and financial reminders.
- Improve financial insights and spending visualizations.
- Add advanced filtering and transaction search.
- Enhance accessibility and performance.

## 👨‍💻 Author

**Shreyas G S**

Aspiring Software Engineer | MERN Stack Developer

- GitHub: [@Shreyasgs305](https://github.com/Shreyasgs305)
- Live Project: [Expense Tracker](https://myexpensestracker.in)

## 📄 License

This project is available for learning and portfolio purposes. Add a suitable open-source license if you intend to allow others to reuse, modify, or distribute the code.

---

⭐ If you find this project useful, consider giving the repository a star!
