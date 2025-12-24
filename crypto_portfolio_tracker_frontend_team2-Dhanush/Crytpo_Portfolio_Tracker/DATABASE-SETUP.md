# PostgreSQL Database Setup

## 🗄️ Database Configuration

Your Crypto Portfolio Tracker is configured to use PostgreSQL with these credentials:

- **Database:** `crypto_portfolio`
- **Username:** `crypto_portfolio`
- **Password:** `crypto_portfolio`
- **Host:** `localhost`
- **Port:** `5432`

## 🚀 Quick Setup

### Option 1: Automated Setup (If you have psql access)

```bash
# Run the setup script as PostgreSQL superuser
psql -U postgres -f setup-database.sql
```

### Option 2: Manual Setup

1. **Connect to PostgreSQL as superuser:**
   ```bash
   psql -U postgres
   ```

2. **Run these commands:**
   ```sql
   CREATE DATABASE crypto_portfolio;
   CREATE USER crypto_portfolio WITH PASSWORD 'crypto_portfolio';
   GRANT ALL PRIVILEGES ON DATABASE crypto_portfolio TO crypto_portfolio;
   \q
   ```

3. **Test the connection:**
   ```bash
   psql -h localhost -U crypto_portfolio -d crypto_portfolio
   ```

### Option 3: Using pgAdmin or Database GUI

1. Create a new database named `crypto_portfolio`
2. Create a new user `crypto_portfolio` with password `crypto_portfolio`
3. Grant all privileges on the database to the user

## 🧪 Test Database Connection

Run the connection test script:

```powershell
./test-db-connection.ps1
```

This will verify:
- PostgreSQL server is running
- Database exists and is accessible
- User has proper permissions

## 🔧 Troubleshooting

### PostgreSQL Not Running
```bash
# Windows (if installed as service)
net start postgresql-x64-14

# Or start PostgreSQL service from Services.msc
```

### Connection Issues
1. Check if PostgreSQL is listening on port 5432
2. Verify `pg_hba.conf` allows local connections
3. Ensure database and user exist with correct permissions

### Permission Issues
```sql
-- Connect as superuser and run:
GRANT ALL PRIVILEGES ON DATABASE crypto_portfolio TO crypto_portfolio;
GRANT ALL ON SCHEMA public TO crypto_portfolio;
```

## 📋 Environment Variables (Optional)

You can override database settings using environment variables:

```bash
export DATABASE_URL="jdbc:postgresql://localhost:5432/crypto_portfolio"
export DATABASE_USERNAME="crypto_portfolio"
export DATABASE_PASSWORD="crypto_portfolio"
```

## 🏗️ Schema Creation

Spring Boot will automatically create the required tables:
- `users` - User accounts
- `exchanges` - Crypto exchanges
- `apikeys` - Encrypted API keys

The schema is defined in the JPA entities and will be created on first startup.

## ✅ Verification

After setup, you should be able to:
1. Connect to the database with the credentials
2. Start the Spring Boot application without errors
3. See tables created automatically by Hibernate
4. Register and login users through the API

## 🚀 Next Steps

Once the database is set up:
1. Run `./start-backend.ps1` to start the Spring Boot application
2. The backend will be available at http://localhost:8080
3. Test with the frontend at http://localhost:3001