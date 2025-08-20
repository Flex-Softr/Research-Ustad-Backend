import dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.join((process.cwd(), '.env')) });

console.log('LOADED BACKEND_URL:', process.env.BACKEND_URL);

export default {
  NODE_ENV: process.env.NODE_ENV,
  port: process.env.PORT,
  database_url: process.env.DATABASE_URL,
  bcrypt_salt_rounds: process.env.BCRYPT_SALT_ROUNDS,
  default_password: process.env.DEFAULT_PASS,
  jwt_access_secret: process.env.JWT_ACCESS_SECRET,
  jwt_refresh_secret: process.env.JWT_REFRESH_SECRET,
  jwt_access_expires_in: process.env.JWT_ACCESS_EXPIRES_IN,
  jwt_refresh_expires_in: process.env.JWT_REFRESH_EXPIRES_IN,
  reset_pass_ui_link:
    process.env.RESET_PASS_UI_LINK || 'http://localhost:3000/reset-password',
  super_admin_password: process.env.SUPER_ADMIN_PASSWORD,
  frontend_url: process.env.FRONTEND_URL,
  backend_url: process.env.BACKEND_URL,
};
