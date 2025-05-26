# Travel Photobook

A modern web application for creating beautiful digital photo books of your travels. Built with Next.js, TypeScript, and Tailwind CSS.

## Features

- 📸 Upload and organize travel photos
- 🗺️ Track countries visited with interactive maps
- 📝 Add notes and memories to your trips
- 🎨 Create beautiful layouts for your photos
- 🔗 Share your travel stories with others
- 📱 Responsive design for all devices

## Tech Stack

- **Framework**: Next.js 13+ with App Router
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **Database**: PostgreSQL with Prisma ORM
- **Authentication**: Clerk
- **File Storage**: Uploadthing/Cloudinary
- **Deployment**: Vercel

## Getting Started

1. Clone the repository:

   ```bash
   git clone https://github.com/pollishmaster/travel-photobook.git
   cd travel-photobook
   ```

2. Install dependencies:

   ```bash
   npm install
   ```

3. Set up environment variables:

   ```bash
   cp .env.example .env
   ```

   Fill in your environment variables in `.env`

4. Set up the database:

   ```bash
   npx prisma db push
   ```

5. Run the development server:
   ```bash
   npm run dev
   ```

Open [http://localhost:3000](http://localhost:3000) to see the application.

## Environment Variables

The following environment variables are required:

```env
DATABASE_URL=
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=
CLERK_SECRET_KEY=
UPLOADTHING_SECRET=
UPLOADTHING_APP_ID=
```

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.
