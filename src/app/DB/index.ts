import config from '../config';
import { USER_ROLE } from '../modules/user/user.constant';
import { User } from '../modules/user/user.model';

const superUser = {
  email: 'anissir@gmail.com',
  password: config.super_admin_password,
  needsPasswordChange: false,
  role: 'superAdmin',
  image:
    'https://i.ibb.co.com/9HK7CcHy/Whats-App-Image-2025-03-12-at-11-29-38-8d375b0e.jpg',
  fullName: 'Anis Islam',
  designation: 'Super Administrator',
  status: 'in-progress',
};

const seedSuperAdmin = async () => {
  try {
    console.log('🌱 Starting super admin seeding...');
    
    // Check if super admin exists
    const isSuperAdminExits = await User.findOne({ role: USER_ROLE.superAdmin });
    
    if (!isSuperAdminExits) {
      console.log('👤 Creating super admin user...');
      const createdUser = await User.create(superUser);
      console.log('✅ Super admin created successfully:', createdUser.email);
    } else {
      console.log('✅ Super admin already exists:', isSuperAdminExits.email);
    }
  } catch (error) {
    console.error('❌ Error seeding super admin:', error);
    throw error;
  }
};

export default seedSuperAdmin;
