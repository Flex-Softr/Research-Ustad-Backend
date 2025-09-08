const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
require('dotenv').config();

async function fixSuperAdminPassword() {
  try {
    console.log('🔗 Connecting to database...');
    await mongoose.connect(process.env.DATABASE_URL);
    console.log('✅ Connected to database');

    // Define User schema (simplified)
    const userSchema = new mongoose.Schema({
      email: String,
      password: String,
      role: String,
      fullName: String,
      designation: String,
      status: String,
      image: String,
      needsPasswordChange: Boolean
    });

    const User = mongoose.model('User', userSchema);

    // Find the superadmin user
    const superAdmin = await User.findOne({ email: 'anissir@gmail.com' });
    
    if (!superAdmin) {
      console.log('❌ Super admin not found');
      return;
    }

    console.log('👤 Found super admin:', superAdmin.email);
    console.log('🔍 Current password (first 10 chars):', superAdmin.password.substring(0, 10) + '...');

    // Check if password is already hashed (bcrypt hashes start with $2b$)
    if (superAdmin.password.startsWith('$2b$')) {
      console.log('✅ Password is already hashed');
      return;
    }

    // Hash the plain text password
    console.log('🔐 Hashing password...');
    const saltRounds = parseInt(process.env.BCRYPT_SALT_ROUNDS) || 12;
    const hashedPassword = await bcrypt.hash(superAdmin.password, saltRounds);
    
    console.log('🔐 Hashed password (first 20 chars):', hashedPassword.substring(0, 20) + '...');

    // Update the user with hashed password using findOneAndUpdate to bypass pre-save hook
    await User.findOneAndUpdate(
      { email: 'anissir@gmail.com' },
      { password: hashedPassword },
      { new: true }
    );

    console.log('✅ Password hashed and updated successfully');
    
    // Verify the fix
    const updatedUser = await User.findOne({ email: 'anissir@gmail.com' });
    const isMatch = await bcrypt.compare('admin12345', updatedUser.password);
    console.log('🧪 Password verification test:', isMatch ? '✅ PASS' : '❌ FAIL');

  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await mongoose.disconnect();
    console.log('🔌 Disconnected from database');
  }
}

fixSuperAdminPassword();
