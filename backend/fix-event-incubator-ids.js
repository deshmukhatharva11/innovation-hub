const { Event, Incubator } = require('./models');

async function fixEventIncubatorIds() {
  try {
    console.log('🔧 Fixing event incubator IDs...\n');
    
    // Get the primary incubator
    const primaryIncubator = await Incubator.findOne({
      where: { name: 'SGBAU Innovation Hub' }
    });
    
    if (!primaryIncubator) {
      console.log('❌ Primary incubator not found');
      return;
    }
    
    console.log('✅ Found primary incubator:', primaryIncubator.name, '(ID:', primaryIncubator.id, ')');
    
    // Update all events that don't have incubator_id
    const [updatedCount] = await Event.update(
      { incubator_id: primaryIncubator.id },
      { 
        where: { 
          incubator_id: null 
        } 
      }
    );
    
    console.log('✅ Updated', updatedCount, 'events with incubator_id:', primaryIncubator.id);
    
    // Verify the update
    const events = await Event.findAll({
      attributes: ['id', 'title', 'incubator_id', 'college_id'],
      limit: 10
    });
    
    console.log('\n📋 Sample events after update:');
    events.forEach(event => {
      console.log(`  - ${event.title} (incubator_id: ${event.incubator_id}, college_id: ${event.college_id})`);
    });
    
  } catch (error) {
    console.log('❌ Error:', error.message);
  }
}

fixEventIncubatorIds();
