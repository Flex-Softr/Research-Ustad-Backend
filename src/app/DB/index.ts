import config from '../config';
import { USER_ROLE } from '../modules/user/user.constant';
import { User } from '../modules/user/user.model';

const superUser = {
  email: 'anissir@gmail.com',
  password: config.super_admin_password,
  needsPasswordChange: false,
  role: 'superAdmin',
  image:"https://i.ibb.co.com/9HK7CcHy/Whats-App-Image-2025-03-12-at-11-29-38-8d375b0e.jpg",
  fullName:"Anis Islam",
  status: 'in-progress',
  isDeleted: false,
};

const seedSuperAdmin = async () => {
  //when database is connected, we will check is there any user who is super admin
  const isSuperAdminExits = await User.findOne({ role: USER_ROLE.superAdmin });

  if (!isSuperAdminExits) {
    await User.create(superUser);
  }
};

export default seedSuperAdmin;
