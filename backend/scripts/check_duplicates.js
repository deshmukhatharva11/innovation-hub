const { sequelize } = require('../config/database');
const { QueryTypes } = require('sequelize');

(async () => {
  try {
    console.log('Checking for duplicate IDs in the colleges table...');

    const duplicates = await sequelize.query(
      `SELECT id, COUNT(*) as count FROM colleges GROUP BY id HAVING COUNT(*) > 1;`,
      { type: QueryTypes.SELECT }
    );

    if (duplicates.length > 0) {
      console.log('Duplicate IDs found:', duplicates);
    } else {
      console.log('No duplicate IDs found in the colleges table.');
    }

    process.exit(0);
  } catch (error) {
    console.error('Error checking for duplicates:', error);
    process.exit(1);
  }
})();
