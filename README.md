This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Docker Deployment

The easiest way to run WMS Stocktake in production is via Docker using the included `deploy.sh` script.

### Prerequisites

- [Docker](https://docs.docker.com/engine/install/) (v20+)
- [Docker Compose](https://docs.docker.com/compose/install/) (plugin or standalone)

### Fresh install

```bash
# Clone the repository
git clone <repository-url>
cd WMS-Stocktake

# Run the deploy script (creates .env, builds image, runs migrations, starts app)
./deploy.sh

# Optional: seed the database with demo data
./deploy.sh --seed
```

The script will:
1. Check Docker / Docker Compose are available.
2. Create a `.env` file from `.env.example` if one does not exist.
3. Auto-generate a secure `NEXTAUTH_SECRET` if the value is blank.
4. Build the Docker image.
5. Start the container with a persistent SQLite volume.
6. Run Prisma database migrations automatically on every start.

The app will be available at **http://localhost:3000** (or the `NEXTAUTH_URL` you set in `.env`).

### Configuration

Edit `.env` before (or after) the first run:

| Variable | Description | Default |
|---|---|---|
| `NEXTAUTH_URL` | Public URL of the app | `http://localhost:3000` |
| `NEXTAUTH_SECRET` | JWT signing secret (auto-generated) | _(generated)_ |
| `PORT` | Host port the app is exposed on | `3000` |
| `DATAPEL_API_URL` | Datapel API base URL (optional) | _(empty)_ |
| `DATAPEL_API_KEY` | Datapel API key (optional) | _(empty)_ |

### Upgrading

Run the same script to rebuild the image and restart the container. The SQLite database is preserved in a named Docker volume (`db_data`):

```bash
git pull
./deploy.sh
```

Use `--no-cache` to force a clean image rebuild:

```bash
./deploy.sh --no-cache
```

### Useful commands

```bash
# View live logs
docker compose logs -f

# Open a shell inside the container
docker compose exec app sh

# Stop the app
docker compose down

# Remove everything including the database volume (⚠ destructive)
docker compose down -v
```

### Default credentials (demo seed)

When seeded with `./deploy.sh --seed` the following accounts are created:

| Role | Email | Password |
|---|---|---|
| Admin | admin@example.com | admin123 |
| Staff | staff@example.com | staff123 |

**Change these passwords immediately after the first login.**

---

## Getting Started (local development)

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
