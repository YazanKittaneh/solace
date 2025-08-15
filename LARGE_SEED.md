# Large Dataset Seeding

This application includes functionality to generate and seed large datasets for performance testing and development purposes.

## Features

- Generate up to 100,000 realistic advocate records
- Batch processing to avoid memory issues
- Realistic data using Faker.js
- Progress tracking during seeding
- Multiple seeding methods (CLI, API, UI)

## Usage Methods

### 1. Command Line Interface

Run the seeding script directly from the command line:

```bash
# Seed with default 10,000 records
npm run seed:large

# Seed with custom number (pass as argument)
npx tsx ./src/db/seed/large-seed.ts 5000
```

### 2. API Endpoint

Send a POST request to the seeding endpoint:

```bash
# Default 10,000 records
curl -X POST http://localhost:3000/api/seed-large

# Custom number of records
curl -X POST http://localhost:3000/api/seed-large \
  -H "Content-Type: application/json" \
  -d '{"count": 25000}'
```

### 3. Admin UI

1. Start the development server:
   ```bash
   npm run dev
   ```

2. Navigate to http://localhost:3000/admin

3. Use the interface to:
   - Seed small dataset (16 default advocates)
   - Seed large dataset with custom count
   - Quick buttons for common amounts (1K, 5K, 10K, 25K, 50K)

## Generated Data

Each advocate record includes:
- **First Name & Last Name**: Realistic names using Faker.js
- **City**: Random selection from 250+ US cities
- **Degree**: Random selection from medical degrees (MD, PhD, MSW, etc.)
- **Specialties**: 2-6 random specialties from 40+ options
- **Years of Experience**: 1-35 years
- **Phone Number**: Valid US phone number format

## Performance Considerations

- **Batch Processing**: Records are inserted in batches of 500 to optimize database performance
- **Memory Usage**: Batch processing prevents memory overflow for large datasets
- **Time Estimates**:
  - 1,000 records: ~5 seconds
  - 10,000 records: ~30-60 seconds
  - 50,000 records: ~3-5 minutes
  - 100,000 records: ~8-10 minutes

## Database Requirements

Ensure your PostgreSQL database is running and properly configured:

```bash
# Start database with Docker
docker compose up -d

# Check database is ready
docker compose ps
```

## Configuration

Environment variables for database connection:
```env
DATABASE_URL=postgresql://postgres:password@localhost:5432/solaceassignment
# or
POSTGRES_URL=postgresql://postgres:password@localhost:5432/solaceassignment
```

## Troubleshooting

### Database Connection Error
- Ensure PostgreSQL is running
- Check DATABASE_URL or POSTGRES_URL is correctly set
- Verify database credentials

### Memory Issues
- Reduce batch size in `src/db/seed/large-seed.ts`
- Seed smaller datasets incrementally

### Slow Performance
- Check database connection pool settings
- Ensure adequate system resources
- Consider using smaller batch sizes

## Notes

- Seeding adds to existing data (doesn't clear the database first)
- Each run generates unique random data
- Phone numbers are generated in valid US format but are not real numbers
- All data is fictional and for testing purposes only