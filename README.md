# Event Management Platform

## Overview

This is a full-stack event management platform that allows users to browse events, organizers to manage events, and users to register for them. The application is built using modern web technologies with a focus on scalability, clean UI, and efficient data handling.

---

## Features

* User authentication (via Supabase)
* Event listing and browsing
* Organizer-based event management
* Event registration system
* Image upload support for events
* Distance calculation for events based on user location
* Responsive UI for desktop and mobile

---

## Tech Stack

### Frontend

* Next.js
* React.js
* Tailwind CSS

### Backend

* Next.js API routes
* Prisma ORM

### Database

* PostgreSQL (via Supabase)

### Authentication

* Supabase Auth

### Deployment

* Vercel

---

## Project Structure

```
root/
│── app/                  # Next.js app directory
│── components/           # Reusable UI components
│── lib/                  # Utility functions and configs
│── prisma/               # Prisma schema and seed file
│── public/               # Static assets
│── styles/               # Global styles
│── .env                  # Environment variables
```

---

## Environment Variables

Create a `.env` file in the root directory and add the following:

```
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
DATABASE_URL=your_database_url
```

Note: Do not expose the service role key publicly.

---

## Installation and Setup

1. Clone the repository

```
git clone <your-repo-url>
cd <project-folder>
```

2. Install dependencies

```
npm install
```

3. Setup environment variables

4. Run database migrations

```
npx prisma migrate dev
```

5. Seed the database

```
node prisma/seed.js
```

6. Start development server

```
npm run dev
```

---

## Deployment

The project is deployed using Vercel.

Steps:

1. Push code to GitHub
2. Import project into Vercel
3. Add environment variables in Vercel dashboard
4. Deploy

---

## Key Functionalities

### Event Management

* Create, update, and delete events
* Associate events with organizers

### User Flow

* Users can browse events
* Users can register for events

### Authentication Flow

* Managed via Supabase
* Users are created and stored in the database

---

## Known Issues

* Ensure environment variables are correctly configured during deployment
* Public keys (NEXT_PUBLIC) are exposed in frontend, verify safety

---

## Future Improvements

* Payment integration for paid events
* Advanced filtering and search
* Admin dashboard
* Email notifications

---

## License

This project is for educational and personal use.

---

## Author

Developed as part of a full-stack learning project.
