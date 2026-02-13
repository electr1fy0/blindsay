# Unsaid

**Anonymous inbox, precise publishing.**

Unsaid is a platform that allows you to receive honest, anonymous notes through a shared link. You have full control over your inbox: read everything privately, and only publish the messages you reply to.

## Features

- **Anonymous Inbox:** Receive notes in a private stream.
- **Curated Public Feed:** Reply to publish. Everything else stays private.
- **Inbox Controls:** Open, close, or pause your inbox link.
- **Moderation Tools:** Hidden-words filter, sender blocking, and inbox pause.
- **Safety:** Built-in reporting and rate limiting.
- **Easy Sharing:** Generate unique links and QR codes instantly.
- **Mobile Optimized:** Fully responsive design for on-the-go management.

## Tech Stack

- **Framework:** [Next.js 16](https://nextjs.org/) (App Router)
- **Language:** TypeScript
- **Database:** PostgreSQL
- **ORM:** [Prisma](https://www.prisma.io/)
- **Authentication:** [NextAuth.js](https://next-auth.js.org/) (Google Provider)
- **Styling:** Tailwind CSS, Shadcn UI
- **Icons:** Hugeicons

## Getting Started

### Prerequisites

- Bun
- PostgreSQL database

### Installation

1. **Clone the repository:**
   ```bash
   git clone https://github.com/electr1fy0/unsaid.git
   cd unsaid
   ```

2. **Install dependencies:**
   ```bash
   bun install
   ```

3. **Environment Variables:**
   Create a `.env` file in the root directory and add the following:

   ```env
   # Database
   DATABASE_URL="postgresql://user:password@localhost:5432/unsaid"

   # NextAuth
   NEXTAUTH_URL="http://localhost:3000"
   NEXTAUTH_SECRET="your-secret-key"

   # Google OAuth
   GOOGLE_CLIENT_ID="your-google-client-id"
   GOOGLE_CLIENT_SECRET="your-google-client-secret"
   ```

4. **Database Setup:**
   Run the Prisma migrations to set up your database schema.

   ```bash
   bunx prisma migrate dev
   ```

5. **Run the development server:**

   ```bash
   bun dev
   ```

   Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

## License

[MIT](LICENSE)
