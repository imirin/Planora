require('dotenv').config();
const mongoose = require('mongoose');

const uri = process.env.MONGODB_URI;

if (!uri) {
  console.error('❌ MONGODB_URI is not set in .env file');
  process.exit(1);
}

// Mask password for display
const maskedUri = uri.replace(/\/\/([^:]+):([^@]+)@/, '//$1:****@');
console.log('Testing MongoDB connection...');
console.log('URI:', maskedUri);
console.log('Database:', uri.split('/').pop().split('?')[0]);
console.log('');

mongoose.connect(uri, {
  serverSelectionTimeoutMS: 5000,
})
  .then(() => {
    console.log('✅ Connection successful!');
    console.log('✅ Database "planora" is accessible');
    return mongoose.connection.close();
  })
  .catch(err => {
    console.error('❌ Connection failed!');
    console.error('');
    console.error('Error:', err.message);
    console.error('');
    
    if (err.codeName === 'AuthenticationFailed' || err.message.includes('bad auth')) {
      console.error('🔐 Authentication Issue - Please check:');
      console.error('   1. Username: kit27csbs25_db_user');
      console.error('   2. Password: Verify it\'s correct in MongoDB Atlas');
      console.error('   3. Special characters in password must be URL encoded');
      console.error('   4. User has "Read and write" permissions');
      console.error('');
      console.error('💡 To fix:');
      console.error('   - Go to MongoDB Atlas → Database Access');
      console.error('   - Edit user or create new password');
      console.error('   - Update password in .env file');
      console.error('   - Restart server');
    } else if (err.message.includes('IP whitelist')) {
      console.error('🌐 Network Access Issue - Please check:');
      console.error('   - Go to MongoDB Atlas → Network Access');
      console.error('   - Add your IP address or allow all IPs (0.0.0.0/0)');
      console.error('   - Wait 1-2 minutes and try again');
    }
    
    process.exit(1);
  });
