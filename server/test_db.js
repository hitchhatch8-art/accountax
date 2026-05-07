const { Client } = require('pg');

const urls = [
  "postgresql://postgres:AcconTax121@db.fsslppfdptmosgkdekoj.supabase.co:5432/postgres",
  "postgresql://postgres.fsslppfdptmosgkdekoj:AcconTax121@aws-0-eu-west-3.pooler.supabase.com:5432/postgres",
  "postgresql://postgres:AcconTax121@aws-0-eu-west-3.pooler.supabase.com:5432/postgres"
];

async function testConnections() {
  for (let i = 0; i < urls.length; i++) {
    console.log(`\nTesting URL ${i + 1}...`);
    const client = new Client({ connectionString: urls[i], connectionTimeoutMillis: 5000 });
    try {
      await client.connect();
      console.log(`✅ SUCCESS: URL ${i + 1} worked!`);
      await client.end();
      process.exit(0);
    } catch (err) {
      console.log(`❌ FAILED: ${err.message}`);
    }
  }
}

testConnections();
