import { db } from '../index';
import { advocates } from '../schema';
import { faker } from '@faker-js/faker';

// Medical specialties list
const specialties = [
  "Bipolar",
  "LGBTQ",
  "Medication/Prescribing",
  "Suicide History/Attempts",
  "General Mental Health (anxiety, depression, stress, grief, life transitions)",
  "Men's issues",
  "Relationship Issues (family, friends, couple, etc)",
  "Trauma & PTSD",
  "Personality disorders",
  "Personal growth",
  "Substance use/abuse",
  "Pediatrics",
  "Women's issues (post-partum, infertility, family planning)",
  "Chronic pain",
  "Weight loss & nutrition",
  "Eating disorders",
  "Diabetic Diet and nutrition",
  "Coaching (leadership, career, academic and wellness)",
  "Life coaching",
  "Obsessive-compulsive disorders",
  "Neuropsychological evaluations & testing (ADHD testing)",
  "Attention and Hyperactivity (ADHD)",
  "Sleep issues",
  "Schizophrenia and psychotic disorders",
  "Learning disorders",
  "Domestic abuse",
  "Geriatrics",
  "Autism spectrum disorders",
  "Developmental disorders",
  "Anger management",
  "Family therapy",
  "Group therapy",
  "Couples therapy",
  "Child & adolescent therapy",
  "Career counseling",
  "Grief counseling",
  "Sexual health",
  "Gender identity",
  "Self-esteem issues",
  "Stress management",
];

// Degrees
const degrees = ['MD', 'PhD', 'MSW', 'LCSW', 'PsyD', 'LMFT', 'LPC', 'LPCC', 'DNP', 'RN', 'NP'];

// Major US cities for more realistic distribution
const cities = [
  'New York', 'Los Angeles', 'Chicago', 'Houston', 'Phoenix', 'Philadelphia',
  'San Antonio', 'San Diego', 'Dallas', 'San Jose', 'Austin', 'Jacksonville',
  'Fort Worth', 'Columbus', 'San Francisco', 'Charlotte', 'Indianapolis',
  'Seattle', 'Denver', 'Washington', 'Boston', 'El Paso', 'Detroit',
  'Nashville', 'Portland', 'Memphis', 'Oklahoma City', 'Las Vegas',
  'Louisville', 'Baltimore', 'Milwaukee', 'Albuquerque', 'Tucson',
  'Fresno', 'Mesa', 'Sacramento', 'Atlanta', 'Kansas City', 'Colorado Springs',
  'Miami', 'Raleigh', 'Omaha', 'Long Beach', 'Virginia Beach', 'Oakland',
  'Minneapolis', 'Tulsa', 'Arlington', 'Tampa', 'New Orleans', 'Wichita',
  'Cleveland', 'Bakersfield', 'Aurora', 'Anaheim', 'Honolulu', 'Santa Ana',
  'Riverside', 'Corpus Christi', 'Lexington', 'Stockton', 'Henderson',
  'Saint Paul', 'St. Louis', 'Cincinnati', 'Pittsburgh', 'Greensboro',
  'Anchorage', 'Plano', 'Lincoln', 'Orlando', 'Irvine', 'Newark',
  'Toledo', 'Durham', 'Chula Vista', 'Fort Wayne', 'Jersey City',
  'St. Petersburg', 'Laredo', 'Madison', 'Chandler', 'Buffalo', 'Lubbock',
  'Scottsdale', 'Reno', 'Glendale', 'Gilbert', 'Winston-Salem', 'North Las Vegas',
  'Norfolk', 'Chesapeake', 'Garland', 'Irving', 'Hialeah', 'Fremont',
  'Boise', 'Richmond', 'Baton Rouge', 'Spokane', 'Des Moines', 'Tacoma',
  'San Bernardino', 'Modesto', 'Fontana', 'Santa Clarita', 'Birmingham',
  'Oxnard', 'Fayetteville', 'Moreno Valley', 'Rochester', 'Glendale',
  'Huntington Beach', 'Salt Lake City', 'Grand Rapids', 'Amarillo',
  'Yonkers', 'Aurora', 'Montgomery', 'Akron', 'Little Rock', 'Huntsville',
  'Augusta', 'Port St. Lucie', 'Grand Prairie', 'Columbus', 'Tallahassee',
  'Overland Park', 'Tempe', 'McKinney', 'Mobile', 'Cape Coral', 'Shreveport',
  'Frisco', 'Knoxville', 'Worcester', 'Brownsville', 'Vancouver', 'Fort Lauderdale',
  'Sioux Falls', 'Ontario', 'Chattanooga', 'Providence', 'Newport News',
  'Rancho Cucamonga', 'Santa Rosa', 'Oceanside', 'Salem', 'Elk Grove',
  'Garden Grove', 'Pembroke Pines', 'Peoria', 'Eugene', 'Corona', 'Cary',
  'Springfield', 'Fort Collins', 'Jackson', 'Alexandria', 'Hayward',
  'Lancaster', 'Lakewood', 'Clarksville', 'Palmdale', 'Salinas',
  'Springfield', 'Hollywood', 'Pasadena', 'Sunnyvale', 'Macon', 'Kansas City',
  'Pomona', 'Escondido', 'Killeen', 'Naperville', 'Joliet', 'Bellevue',
  'Rockford', 'Savannah', 'Paterson', 'Torrance', 'Bridgeport', 'McAllen',
  'Mesquite', 'Syracuse', 'Midland', 'Pasadena', 'Murfreesboro', 'Miramar',
  'Dayton', 'Fullerton', 'Olathe', 'Orange', 'Thornton', 'Roseville',
  'Denton', 'Waco', 'Surprise', 'Carrollton', 'West Valley City',
  'Charleston', 'Warren', 'Hampton', 'Gainesville', 'Visalia', 'Coral Springs',
  'Columbia', 'Cedar Rapids', 'Sterling Heights', 'New Haven', 'Stamford',
  'Concord', 'Kent', 'Santa Clara', 'Elizabeth', 'Round Rock', 'Thousand Oaks',
  'Lafayette', 'Athens', 'Topeka', 'Simi Valley', 'Fargo', 'Norman',
  'Columbia', 'Abilene', 'Wilmington', 'Hartford', 'Victorville', 'Pearland',
  'Vallejo', 'Ann Arbor', 'Berkeley', 'Allentown', 'Richardson', 'Odessa',
  'Arvada', 'Cambridge', 'Sugar Land', 'Beaumont', 'Lansing', 'Evansville',
  'Rochester', 'Independence', 'Fairfield', 'Provo', 'Clearwater', 'College Station',
  'West Jordan', 'Carlsbad', 'El Monte', 'Murrieta', 'Temecula', 'Palm Bay',
  'Westminster', 'North Charleston', 'Miami Gardens', 'Manchester', 'High Point',
  'Downey', 'Clovis', 'Pompano Beach', 'Pueblo', 'Elgin', 'Lowell',
  'Antioch', 'West Palm Beach', 'Peoria', 'Everett', 'Ventura', 'Centennial',
  'Lakeland', 'Gresham', 'Richmond', 'Billings', 'Inglewood', 'Broken Arrow',
  'Sandy Springs', 'Jurupa Valley', 'Hillsboro', 'Waterbury', 'Santa Maria',
  'Boulder', 'Greeley', 'Daly City', 'Meridian', 'Lewisville', 'Davie',
  'West Covina', 'League City', 'Tyler', 'Norwalk', 'San Mateo', 'Green Bay',
  'Wichita Falls', 'Sparks', 'Lakewood', 'Burbank', 'Rialto', 'Allen',
  'Las Cruces', 'Renton', 'Davenport', 'Vista', 'Tuscaloosa', 'Clinton',
  'Edison', 'Woodbridge', 'San Angelo', 'Kenosha', 'Vacaville'
];

// Helper function to generate random specialties
function generateRandomSpecialties(): string[] {
  const count = Math.floor(Math.random() * 5) + 2; // 2-6 specialties
  const shuffled = [...specialties].sort(() => 0.5 - Math.random());
  return shuffled.slice(0, count);
}

// Helper function to generate random phone number
function generatePhoneNumber(): string {
  // Generate area code (200-999)
  const areaCode = Math.floor(Math.random() * 800) + 200;
  // Generate exchange (200-999)
  const exchange = Math.floor(Math.random() * 800) + 200;
  // Generate subscriber number (0000-9999)
  const subscriber = Math.floor(Math.random() * 10000).toString().padStart(4, '0');
  
  return `${areaCode}${exchange}${subscriber}`;
}

// Function to generate a single advocate
function generateAdvocate() {
  return {
    firstName: faker.person.firstName(),
    lastName: faker.person.lastName(),
    city: cities[Math.floor(Math.random() * cities.length)],
    degree: degrees[Math.floor(Math.random() * degrees.length)],
    specialties: generateRandomSpecialties(),
    yearsOfExperience: Math.floor(Math.random() * 35) + 1, // 1-35 years
    phoneNumber: generatePhoneNumber(),
  };
}

// Main seeding function
export async function seedLargeDataset(count: number = 10000) {
  console.log(`🌱 Starting large seed with ${count} advocates...`);
  
  try {
    // Check if database is connected
    if (!db) {
      throw new Error('Database connection not available');
    }

    console.log('📊 Generating advocate data...');
    
    // Generate data in batches to avoid memory issues
    const batchSize = 500;
    const batches = Math.ceil(count / batchSize);
    let totalInserted = 0;

    for (let i = 0; i < batches; i++) {
      const currentBatchSize = Math.min(batchSize, count - totalInserted);
      const advocateData = Array.from({ length: currentBatchSize }, generateAdvocate);
      
      console.log(`📦 Inserting batch ${i + 1}/${batches} (${currentBatchSize} records)...`);
      
      // Insert batch
      await db.insert(advocates).values(advocateData);
      
      totalInserted += currentBatchSize;
      console.log(`✅ Progress: ${totalInserted}/${count} advocates inserted`);
    }

    console.log(`🎉 Successfully seeded ${totalInserted} advocates!`);
    return { success: true, count: totalInserted };
    
  } catch (error) {
    console.error('❌ Large seed failed:', error);
    throw error;
  }
}

// Script execution when run directly
if (require.main === module) {
  const count = parseInt(process.argv[2] || '10000', 10);
  
  seedLargeDataset(count)
    .then((result) => {
      console.log('✨ Large seed completed:', result);
      process.exit(0);
    })
    .catch((error) => {
      console.error('💥 Large seed error:', error);
      process.exit(1);
    });
}