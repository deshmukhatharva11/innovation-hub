const { sequelize } = require('./config/database');

async function updateReportsSchema() {
  try {
    console.log('🔄 Updating Reports table schema...');

    const queryInterface = sequelize.getQueryInterface();

    // Add missing columns to Reports table
    const columnsToAdd = [
      {
        name: 'description',
        type: 'TEXT',
        allowNull: true
      },
      {
        name: 'data',
        type: 'JSON',
        allowNull: true
      },
      {
        name: 'incubator_id',
        type: 'INTEGER',
        allowNull: true,
        references: {
          model: 'Incubators',
          key: 'id'
        }
      }
    ];

    for (const column of columnsToAdd) {
      try {
        await queryInterface.addColumn('Reports', column.name, {
          type: column.type,
          allowNull: column.allowNull,
          references: column.references
        });
        console.log(`✅ Added column: ${column.name}`);
      } catch (error) {
        if (error.message.includes('already exists')) {
          console.log(`⚠️ Column ${column.name} already exists`);
        } else {
          console.log(`❌ Error adding column ${column.name}:`, error.message);
        }
      }
    }

    // Update existing columns to allow null
    try {
      await queryInterface.changeColumn('Reports', 'period_start', {
        type: 'DATE',
        allowNull: true
      });
      console.log('✅ Updated period_start to allow null');
    } catch (error) {
      console.log('⚠️ period_start column update skipped:', error.message);
    }

    try {
      await queryInterface.changeColumn('Reports', 'period_end', {
        type: 'DATE',
        allowNull: true
      });
      console.log('✅ Updated period_end to allow null');
    } catch (error) {
      console.log('⚠️ period_end column update skipped:', error.message);
    }

    try {
      await queryInterface.changeColumn('Reports', 'college_id', {
        type: 'INTEGER',
        allowNull: true
      });
      console.log('✅ Updated college_id to allow null');
    } catch (error) {
      console.log('⚠️ college_id column update skipped:', error.message);
    }

    console.log('\n🎉 Reports schema updated successfully!');

  } catch (error) {
    console.error('❌ Error updating schema:', error);
  }
}

updateReportsSchema().then(() => {
  console.log('\n✅ Schema update completed');
  process.exit(0);
}).catch(error => {
  console.error('❌ Schema update failed:', error);
  process.exit(1);
});
