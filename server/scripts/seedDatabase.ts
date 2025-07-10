import { storage } from "../storage";

async function seedDatabase() {
  try {
    console.log('Starting database seeding...');

    // Create sample cities
    const mumbai = await storage.createCity({ name: 'Mumbai', code: 'MUM' });
    const delhi = await storage.createCity({ name: 'Delhi', code: 'DEL' });
    const bangalore = await storage.createCity({ name: 'Bangalore', code: 'BLR' });

    console.log('Cities created:', { mumbai, delhi, bangalore });

    // Create clusters for Mumbai
    const mumbaiClusters = await Promise.all([
      storage.createCluster({ name: 'Andheri', code: 'AND', cityId: mumbai.id }),
      storage.createCluster({ name: 'Bandra', code: 'BAN', cityId: mumbai.id }),
      storage.createCluster({ name: 'Thane', code: 'THA', cityId: mumbai.id })
    ]);

    // Create clusters for Delhi
    const delhiClusters = await Promise.all([
      storage.createCluster({ name: 'Gurgaon', code: 'GUR', cityId: delhi.id }),
      storage.createCluster({ name: 'Noida', code: 'NOI', cityId: delhi.id }),
      storage.createCluster({ name: 'Dwarka', code: 'DWA', cityId: delhi.id })
    ]);

    // Create clusters for Bangalore
    const bangaloreClusters = await Promise.all([
      storage.createCluster({ name: 'Whitefield', code: 'WHI', cityId: bangalore.id }),
      storage.createCluster({ name: 'Electronic City', code: 'EC', cityId: bangalore.id }),
      storage.createCluster({ name: 'Koramangala', code: 'KOR', cityId: bangalore.id })
    ]);

    console.log('Clusters created');

    // Create sample roles
    const roles = await Promise.all([
      storage.createRole({ 
        title: 'Delivery Executive', 
        code: 'DE', 
        description: 'Food and package delivery',
        salaryMin: 15000,
        salaryMax: 25000
      }),
      storage.createRole({ 
        title: 'Warehouse Worker', 
        code: 'WW', 
        description: 'Warehouse operations and inventory management',
        salaryMin: 18000,
        salaryMax: 28000
      }),
      storage.createRole({ 
        title: 'Security Guard', 
        code: 'SG', 
        description: 'Security and surveillance',
        salaryMin: 16000,
        salaryMax: 22000
      }),
      storage.createRole({ 
        title: 'Cleaner', 
        code: 'CL', 
        description: 'Cleaning and maintenance',
        salaryMin: 12000,
        salaryMax: 18000
      })
    ]);

    console.log('Roles created:', roles);

    // Create sample vendors
    const vendors = await Promise.all([
      storage.createVendor({
        name: 'ManpowerCorp',
        contactPerson: 'Rajesh Kumar',
        email: 'rajesh@manpowercorp.com',
        phone: '+91-9876543210',
        address: 'Mumbai Office Complex'
      }),
      storage.createVendor({
        name: 'StaffingSolutions',
        contactPerson: 'Priya Sharma',
        email: 'priya@staffingsol.com',
        phone: '+91-9876543211',
        address: 'Delhi Business Park'
      })
    ]);

    console.log('Vendors created:', vendors);

    // Create sample recruiters
    const recruiters = await Promise.all([
      storage.createRecruiter({
        name: 'Amit Patel',
        email: 'amit.patel@company.com',
        phone: '+91-9876543212',
        vendorId: vendors[0].id
      }),
      storage.createRecruiter({
        name: 'Sneha Gupta',
        email: 'sneha.gupta@company.com',
        phone: '+91-9876543213',
        vendorId: vendors[1].id
      })
    ]);

    console.log('Recruiters created:', recruiters);

    // Create admin user
    const adminUser = await storage.createUser({
      username: 'admin',
      email: 'admin@company.com',
      password: '$2b$10$K7L/VnVp8fFlKxk7.1ynDuOwVA0P7L2rq.8p1vXq0Yk8k1XQVhGke', // password: admin123
      firstName: 'System',
      lastName: 'Administrator',
      role: 'admin',
      isActive: true
    });

    console.log('Admin user created:', adminUser);

    console.log('Database seeding completed successfully!');
    
    // Summary
    console.log('\n=== SEEDING SUMMARY ===');
    console.log(`Cities: ${[mumbai, delhi, bangalore].length}`);
    console.log(`Clusters: ${mumbaiClusters.length + delhiClusters.length + bangaloreClusters.length}`);
    console.log(`Roles: ${roles.length}`);
    console.log(`Vendors: ${vendors.length}`);
    console.log(`Recruiters: ${recruiters.length}`);
    console.log(`Users: 1 (admin)`);
    console.log('\nLogin credentials:');
    console.log('Username: admin');
    console.log('Password: admin123');

  } catch (error) {
    console.error('Database seeding failed:', error);
    throw error;
  }
}

// Run if called directly
if (require.main === module) {
  seedDatabase()
    .then(() => process.exit(0))
    .catch(() => process.exit(1));
}

export { seedDatabase };