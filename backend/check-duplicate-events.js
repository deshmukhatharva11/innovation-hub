const { Event } = require('./models');

async function checkDuplicateEvents() {
  try {
    console.log('🔍 Checking for duplicate events...\n');
    
    // Get all events
    const events = await Event.findAll({
      order: [['id', 'ASC']]
    });
    
    console.log(`Total events: ${events.length}`);
    
    // Check for duplicate IDs
    const ids = events.map(event => event.id);
    const uniqueIds = [...new Set(ids)];
    
    if (ids.length !== uniqueIds.length) {
      console.log('❌ Duplicate IDs found!');
      console.log('All IDs:', ids);
      console.log('Unique IDs:', uniqueIds);
      
      // Find duplicates
      const duplicates = ids.filter((id, index) => ids.indexOf(id) !== index);
      console.log('Duplicate IDs:', [...new Set(duplicates)]);
    } else {
      console.log('✅ No duplicate IDs found');
    }
    
    // Check for duplicate titles
    const titles = events.map(event => event.title);
    const uniqueTitles = [...new Set(titles)];
    
    if (titles.length !== uniqueTitles.length) {
      console.log('❌ Duplicate titles found!');
      const duplicateTitles = titles.filter((title, index) => titles.indexOf(title) !== index);
      console.log('Duplicate titles:', [...new Set(duplicateTitles)]);
    } else {
      console.log('✅ No duplicate titles found');
    }
    
    // Display all events
    console.log('\n📋 All events:');
    events.forEach(event => {
      console.log(`ID: ${event.id}, Title: "${event.title}", Status: ${event.status}, Created: ${event.created_at}`);
    });
    
  } catch (error) {
    console.error('❌ Error checking events:', error);
  }
}

checkDuplicateEvents();
