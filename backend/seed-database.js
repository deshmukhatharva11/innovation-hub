#!/usr/bin/env node

const seedDatabase = require('./scripts/seed-comprehensive');

console.log('🚀 Starting Innovation Hub Database Seeding...');
console.log('This will create a comprehensive database with sample data for testing.\n');

seedDatabase()
  .then(() => {
    console.log('\n✅ Database seeding completed successfully!');
    console.log('🎯 Your Innovation Hub is now ready with sample data!');
    process.exit(0);
  })
  .catch((error) => {
    console.error('\n❌ Database seeding failed:', error);
    process.exit(1);
  });
