import { query } from '../config/db.js';

async function seedSampleData() {
  console.log('🌱 Seeding sample master data...');

  try {
    // Insert sample roles
    await query(`
      INSERT IGNORE INTO roles (name, description, is_active) VALUES 
      ('Software Engineer', 'Develops and maintains software applications', true),
      ('Senior Software Engineer', 'Senior level software development role', true),
      ('Product Manager', 'Manages product development and strategy', true),
      ('HR Manager', 'Manages human resources operations', true),
      ('Sales Executive', 'Handles sales and client relationships', true)
    `);
    console.log('✅ Roles seeded');

    // Insert sample clusters
    await query(`
      INSERT IGNORE INTO clusters (name, code, city_id, is_active) VALUES 
      ('Tech Hub', 'TH01', 1, true),
      ('Business Center', 'BC01', 1, true),
      ('Innovation Lab', 'IL01', 2, true),
      ('Operations Center', 'OC01', 3, true)
    `);
    console.log('✅ Clusters seeded');

    // Insert sample vendors
    await query(`
      INSERT IGNORE INTO vendors (name, email, phone, address, contact_person, is_active) VALUES 
      ('TechRecruit Solutions', 'contact@techrecruit.com', '9876543210', '123 Tech Street, Bangalore', 'John Doe', true),
      ('Global Talent Partners', 'info@globaltalent.com', '9876543211', '456 Business Ave, Mumbai', 'Jane Smith', true),
      ('Elite Staffing', 'hello@elitestaffing.com', '9876543212', '789 Corporate Blvd, Delhi', 'Mike Johnson', true)
    `);
    console.log('✅ Vendors seeded');

    // Insert sample recruiters
    await query(`
      INSERT IGNORE INTO recruiters (name, email, phone, city_id, vendor_id, is_active) VALUES 
      ('Alice Johnson', 'alice@techrecruit.com', '9876543213', 1, 1, true),
      ('Bob Wilson', 'bob@globaltalent.com', '9876543214', 2, 2, true),
      ('Carol Davis', 'carol@elitestaffing.com', '9876543215', 3, 3, true)
    `);
    console.log('✅ Recruiters seeded');

    // Insert sample hiring requests
    await query(`
      INSERT IGNORE INTO hiring_requests (
        request_id, city_id, cluster_id, role_id, position_title, 
        no_of_openings, request_type, priority, status, description, 
        requirements, created_by
      ) VALUES 
      ('HR001', 1, 1, 1, 'Frontend Developer', 3, 'fresh', 'P1', 'open', 
       'Looking for React.js developers', 'React, TypeScript, 2+ years experience', 5),
      ('HR002', 2, 3, 2, 'Senior Backend Developer', 2, 'fresh', 'P0', 'open', 
       'Senior Node.js developer needed', 'Node.js, MongoDB, 5+ years experience', 5),
      ('HR003', 1, 2, 3, 'Product Manager', 1, 'replacement', 'P2', 'closed', 
       'Product management role', 'MBA, 3+ years PM experience', 5)
    `);
    console.log('✅ Hiring requests seeded');

    console.log('🎉 Sample data seeding completed successfully!');
    
  } catch (error) {
    console.error('❌ Error seeding data:', error);
  }
}

seedSampleData().then(() => {
  console.log('Script completed');
  process.exit(0);
}).catch(error => {
  console.error('Script failed:', error);
  process.exit(1);
});
