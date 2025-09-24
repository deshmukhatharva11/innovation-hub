const { sequelize } = require('./config/database');

async function addIncubatorIdToEvents() {
  try {
    console.log('🔧 Adding incubator_id column to Events table...\n');
    
    // Add the incubator_id column
    await sequelize.query(`
      ALTER TABLE Events 
      ADD COLUMN incubator_id INTEGER NULL,
      ADD CONSTRAINT fk_events_incubator 
      FOREIGN KEY (incubator_id) REFERENCES Incubators(id)
    `);
    
    console.log('✅ Added incubator_id column to Events table');
    
    // Get the primary incubator ID
    const [incubatorResult] = await sequelize.query(`
      SELECT id FROM Incubators WHERE name = 'SGBAU Innovation Hub' LIMIT 1
    `);
    
    if (incubatorResult.length > 0) {
      const incubatorId = incubatorResult[0].id;
      console.log('✅ Found primary incubator ID:', incubatorId);
      
      // Update all existing events with the primary incubator ID
      const [updateResult] = await sequelize.query(`
        UPDATE Events 
        SET incubator_id = :incubatorId 
        WHERE incubator_id IS NULL
      `, {
        replacements: { incubatorId }
      });
      
      console.log('✅ Updated', updateResult, 'events with incubator_id:', incubatorId);
      
      // Verify the update
      const [events] = await sequelize.query(`
        SELECT id, title, incubator_id, college_id 
        FROM Events 
        LIMIT 5
      `);
      
      console.log('\n📋 Sample events after update:');
      events.forEach(event => {
        console.log(`  - ${event.title} (incubator_id: ${event.incubator_id}, college_id: ${event.college_id})`);
      });
    } else {
      console.log('❌ Primary incubator not found');
    }
    
  } catch (error) {
    console.log('❌ Error:', error.message);
    if (error.message.includes('already exists')) {
      console.log('ℹ️ Column already exists, continuing...');
    }
  }
}

addIncubatorIdToEvents();
