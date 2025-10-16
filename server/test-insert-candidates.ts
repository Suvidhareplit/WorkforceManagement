import { getStorage } from './storage/index.js';

const storage = getStorage();

async function testInsertCandidates() {
  console.log('Testing candidate insertion with Aadhar validation...\n');

  const testCandidates = [
    {
      name: 'John Doe',
      phone: '9876543210',
      aadharNumber: '111111111111',
      email: 'john@example.com',
      role: 'Operator',
      city: 'Bangalore',
      cluster: 'CBD',
      qualification: 'Graduation',
      resumeSource: 'vendor',
      vendor: 'ManpowerCorp'
    },
    {
      name: 'Jane Smith',
      phone: '9876543211',
      aadharNumber: '222222222222',
      email: 'jane@example.com',
      role: 'Operator',
      city: 'Bangalore',
      cluster: 'Indiranagar',
      qualification: 'B.Tech',
      resumeSource: 'field_recruiter',
      recruiter: 'Joydeep'
    },
    {
      name: 'Bob Johnson',
      phone: '9876543212',
      aadharNumber: '333333333333',
      email: 'bob@example.com',
      role: 'Operator',
      city: 'Bangalore',
      cluster: 'Whitefield',
      qualification: 'Diploma',
      resumeSource: 'referral',
      referralName: 'Alice Brown'
    }
  ];

  for (const candidate of testCandidates) {
    try {
      console.log(`\nInserting: ${candidate.name}...`);
      const result = await storage.createCandidate(candidate);
      console.log(`✅ Success! Application ID: ${result.applicationId}`);
      console.log(`   Message: ${result.message}`);
    } catch (error: any) {
      console.error(`❌ Error: ${error.message}`);
    }
  }

  // Test duplicate Aadhar
  console.log('\n\n--- Testing Duplicate Aadhar Detection ---');
  try {
    console.log('\nAttempting to insert duplicate Aadhar (111111111111)...');
    await storage.createCandidate({
      name: 'Duplicate Person',
      phone: '9999999999',
      aadharNumber: '111111111111', // Same as John Doe
      email: 'duplicate@example.com',
      role: 'Operator',
      city: 'Bangalore',
      cluster: 'CBD',
      qualification: 'Graduation',
      resumeSource: 'direct'
    });
    console.log('❌ Should have failed but did not!');
  } catch (error: any) {
    console.log(`✅ Correctly rejected: ${error.message}`);
  }

  // Verify inserted data
  console.log('\n\n--- Verifying Inserted Candidates ---');
  const candidates = await storage.getCandidates();
  const newCandidates = candidates.filter((c: any) => 
    ['111111111111', '222222222222', '333333333333'].includes(c.aadharNumber)
  );
  
  console.log(`\nFound ${newCandidates.length} newly inserted candidates:`);
  newCandidates.forEach((c: any) => {
    console.log(`\n- ${c.name}`);
    console.log(`  Application ID: ${c.applicationId}`);
    console.log(`  Aadhar: ${c.aadharNumber}`);
    console.log(`  Phone: ${c.phone}`);
    console.log(`  City: ${c.cityName}, Cluster: ${c.clusterName}`);
    console.log(`  Status: ${c.status}`);
  });

  process.exit(0);
}

testInsertCandidates().catch(error => {
  console.error('Fatal error:', error);
  process.exit(1);
});
