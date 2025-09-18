import bcrypt from 'bcrypt';
import httpStatus from 'http-status';
import jwt, { JwtPayload } from 'jsonwebtoken';
import config from '../../config';
import AppError from '../../errors/AppError';
import { sendEmail } from '../../utils/sendEmail';
import { TLoginUser } from './auth.interface';
import { createToken, verifyToken } from './auth.utils';
import { User } from '../user/user.model';

const loginUser = async (payload: TLoginUser) => {
  // checking if the user is exist
  const user = await User.isUserExistsByCustomId(payload.email);

  if (!user) {
    throw new AppError(httpStatus.NOT_FOUND, 'This user is not found !');
  }

  // checking if the user is blocked
  const userStatus = user?.status;

  if (userStatus === 'blocked') {
    throw new AppError(httpStatus.FORBIDDEN, 'This user is blocked ! !');
  }

  //checking if the password is correct
  if (!(await User.isPasswordMatched(payload?.password, user?.password)))
    throw new AppError(httpStatus.FORBIDDEN, 'Password do not matched');

  // Update user's login status
  await User.findByIdAndUpdate(user._id, { isLoggedIn: true });

  //create token and sent to the  client
  const jwtPayload = {
    id: user._id,
    email: user.email,
    role: user.role,
  };
  console.log(jwtPayload);

  const accessToken = createToken(
    jwtPayload,
    config.jwt_access_secret as string,
    config.jwt_access_expires_in as string,
  );

  const refreshToken = createToken(
    jwtPayload,
    config.jwt_refresh_secret as string,
    config.jwt_refresh_expires_in as string,
  );

  return {
    accessToken,
    refreshToken,
    needsPasswordChange: user?.needsPasswordChange,
  };
};

const changePassword = async (
  userData: JwtPayload,
  payload: { oldPassword: string; newPassword: string },
) => {
  // checking if the user is exist
  const user = await User.isUserExistsByCustomId(userData.email);

  if (!user) {
    throw new AppError(httpStatus.NOT_FOUND, 'This user is not found !');
  }

  // checking if the user is blocked
  const userStatus = user?.status;

  if (userStatus === 'blocked') {
    throw new AppError(httpStatus.FORBIDDEN, 'This user is blocked ! !');
  }

  //checking if the password is correct
  if (!(await User.isPasswordMatched(payload.oldPassword, user?.password)))
    throw new AppError(httpStatus.FORBIDDEN, 'Password do not matched');

  //hash new password
  const newHashedPassword = await bcrypt.hash(
    payload.newPassword,
    Number(config.bcrypt_salt_rounds),
  );

  await User.findOneAndUpdate(
    {
      email: userData.email,
      role: userData.role,
    },
    {
      password: newHashedPassword,
      needsPasswordChange: false,
      passwordChangedAt: new Date(),
    },
  );

  return null;
};

const refreshToken = async (token: string) => {
  // checking if the given token is valid
  const decoded = verifyToken(token, config.jwt_refresh_secret as string);

  const { email, iat } = decoded;

  // checking if the user is exist
  const user = await User.isUserExistsByCustomId(email);

  if (!user) {
    throw new AppError(httpStatus.NOT_FOUND, 'This user is not found !');
  }

  // checking if the user is blocked
  const userStatus = user?.status;

  if (userStatus === 'blocked') {
    throw new AppError(httpStatus.FORBIDDEN, 'This user is blocked ! !');
  }

  if (
    user.passwordChangedAt &&
    User.isJWTIssuedBeforePasswordChanged(user.passwordChangedAt, iat as number)
  ) {
    throw new AppError(httpStatus.UNAUTHORIZED, 'You are not authorized !');
  }

  const jwtPayload = {
    id: user._id,
    email: user.email,
    role: user.role,
  };

  const accessToken = createToken(
    jwtPayload,
    config.jwt_access_secret as string,
    config.jwt_access_expires_in as string,
  );

  return {
    accessToken,
  };
};

const forgetPassword = async (email: string) => {
  // checking if the user is exist
  const user = await User.isUserExistsByCustomId(email);

  if (!user) {
    throw new AppError(httpStatus.NOT_FOUND, 'This user is not found !');
  }

  // checking if the user is blocked
  const userStatus = user?.status;

  if (userStatus === 'blocked') {
    throw new AppError(httpStatus.FORBIDDEN, 'This user is blocked ! !');
  }

  const jwtPayload = {
    id: user._id,
    email: user.email,
    role: user.role,
  };

  const resetToken = createToken(
    jwtPayload,
    config.jwt_access_secret as string,
    '10m',
  );

  const resetUILink = `${config.reset_pass_ui_link}?email=${user.email}&token=${resetToken}`;
  const subject = 'Reset Your Password - Action Required';

  const htmlContent = `
    <!DOCTYPE html>
    <html lang="en">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Reset Your Password</title>
        <style>
            * {
                margin: 0;
                padding: 0;
                box-sizing: border-box;
            }
            
            body {
                font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
                line-height: 1.6;
                color: #333;
                background-color: #f8fafc;
            }
            
            .email-container {
                max-width: 600px;
                margin: 0 auto;
                background-color: #ffffff;
                border-radius: 12px;
                overflow: hidden;
                box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
            }
            
            .header {
                background: linear-gradient(135deg, #10b981 0%, #059669 100%);
                padding: 40px 30px;
                text-align: center;
                color: white;
            }
            
            .header h1 {
                font-size: 28px;
                font-weight: 700;
                margin-bottom: 8px;
                letter-spacing: -0.5px;
            }
            
            .header p {
                font-size: 16px;
                opacity: 0.9;
                font-weight: 400;
            }
            
            .content {
                padding: 40px 30px;
                background-color: #ffffff;
            }
            
            .greeting {
                font-size: 18px;
                font-weight: 600;
                color: #1f2937;
                margin-bottom: 20px;
            }
            
            .message {
                font-size: 16px;
                color: #4b5563;
                margin-bottom: 30px;
                line-height: 1.7;
            }
            
            .button-container {
                text-align: center;
                margin: 40px 0;
            }
            
            .reset-button {
                display: inline-block;
                background: linear-gradient(135deg, #10b981 0%, #059669 100%);
                color: white;
                padding: 16px 32px;
                text-decoration: none;
                border-radius: 8px;
                font-weight: 600;
                font-size: 16px;
                text-transform: uppercase;
                letter-spacing: 0.5px;
                box-shadow: 0 4px 12px rgba(16, 185, 129, 0.3);
                transition: all 0.3s ease;
                border: none;
                cursor: pointer;
            }
            
            .reset-button:hover {
                transform: translateY(-2px);
                box-shadow: 0 6px 20px rgba(16, 185, 129, 0.4);
            }
            
            .security-notice {
                background: linear-gradient(135deg, #fef3c7 0%, #fde68a 100%);
                border: 1px solid #f59e0b;
                border-radius: 8px;
                padding: 20px;
                margin: 30px 0;
            }
            
            .security-notice h3 {
                color: #92400e;
                font-size: 16px;
                font-weight: 600;
                margin-bottom: 12px;
                display: flex;
                align-items: center;
                gap: 8px;
            }
            
            .security-notice ul {
                list-style: none;
                padding: 0;
            }
            
            .security-notice li {
                color: #92400e;
                font-size: 14px;
                margin-bottom: 8px;
                padding-left: 20px;
                position: relative;
            }
            
            .security-notice li:before {
                content: "⚠️";
                position: absolute;
                left: 0;
                top: 0;
            }
            
            .fallback-link {
                background-color: #f3f4f6;
                border: 1px solid #e5e7eb;
                border-radius: 8px;
                padding: 20px;
                margin: 30px 0;
                text-align: center;
            }
            
            .fallback-link p {
                color: #6b7280;
                font-size: 14px;
                margin-bottom: 10px;
            }
            
            .fallback-link a {
                color: #10b981;
                text-decoration: none;
                word-break: break-all;
                font-family: 'Courier New', monospace;
                font-size: 12px;
                background-color: #ffffff;
                padding: 8px 12px;
                border-radius: 4px;
                border: 1px solid #e5e7eb;
                display: inline-block;
                max-width: 100%;
            }
            
            .footer {
                background-color: #f9fafb;
                padding: 30px;
                text-align: center;
                border-top: 1px solid #e5e7eb;
            }
            
            .footer p {
                color: #6b7280;
                font-size: 14px;
                margin-bottom: 8px;
            }
            
            .logo {
                display: inline-block;
                background: linear-gradient(135deg, #10b981 0%, #059669 100%);
                color: white;
                padding: 8px 16px;
                border-radius: 6px;
                font-weight: 700;
                font-size: 14px;
                margin-bottom: 15px;
            }
            
            @media (max-width: 600px) {
                .email-container {
                    margin: 10px;
                    border-radius: 8px;
                }
                
                .header, .content, .footer {
                    padding: 20px;
                }
                
                .header h1 {
                    font-size: 24px;
                }
                
                .reset-button {
                    padding: 14px 24px;
                    font-size: 14px;
                }
            }
        </style>
    </head>
    <body>
        <div class="email-container">
            <div class="header">
                <h1>🔐 Reset Your Password</h1>
                <p>ResearchUstad Account Security</p>
            </div>
            
            <div class="content">
                <div class="greeting">Hello!</div>
                
                <div class="message">
                    We received a request to reset your password for your ResearchUstad account. 
                    If you didn't make this request, you can safely ignore this email.
                </div>
                
                <div class="button-container">
                    <a href="${resetUILink}" class="reset-button" target="_blank">
                        🔑 Reset My Password
                    </a>
                </div>
                
                <div class="security-notice">
                    <h3>🛡️ Security Notice</h3>
                    <ul>
                        <li>This link will expire in 10 minutes</li>
                        <li>If you didn't request this, please ignore this email</li>
                        <li>Never share this link with anyone</li>
                        <li>This link is unique to your account</li>
                    </ul>
                </div>
                
                <div class="fallback-link">
                    <p><strong>Button not working?</strong></p>
                    <p>Copy and paste this link into your browser:</p>
                    <a href="${resetUILink}">${resetUILink}</a>
                </div>
                
                <div class="message">
                    If you have any questions or need assistance, please don't hesitate to contact our support team.
                </div>
            </div>
            
            <div class="footer">
                <div class="logo">ResearchUstad</div>
                <p>This is an automated message, please do not reply to this email.</p>
              
            </div>
        </div>
    </body>
    </html>
  `;

  await sendEmail(user.email, htmlContent, subject);
};

const resetPassword = async (
  payload: { email: string; newPassword: string },
  token: string,
) => {
  // checking if the user is exist
  const user = await User.isUserExistsByCustomId(payload?.email);

  if (!user) {
    throw new AppError(httpStatus.NOT_FOUND, 'This user is not found !');
  }

  // checking if the user is blocked
  const userStatus = user?.status;

  if (userStatus === 'blocked') {
    throw new AppError(httpStatus.FORBIDDEN, 'This user is blocked ! !');
  }

  const decoded = jwt.verify(
    token,
    config.jwt_access_secret as string,
  ) as JwtPayload;

  //localhost:3000?id=A-0001&token=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiJBLTAwMDEiLCJyb2xlIjoiYWRtaW4iLCJpYXQiOjE3MDI4NTA2MTcsImV4cCI6MTcwMjg1MTIxN30.-T90nRaz8-KouKki1DkCSMAbsHyb9yDi0djZU3D6QO4

  if (payload.email !== decoded.email) {
    throw new AppError(httpStatus.FORBIDDEN, 'You are forbidden!');
  }

  //hash new password
  const newHashedPassword = await bcrypt.hash(
    payload.newPassword,
    Number(config.bcrypt_salt_rounds),
  );

  await User.findOneAndUpdate(
    {
      email: decoded.email,
      role: decoded.role,
    },
    {
      password: newHashedPassword,
      needsPasswordChange: false,
      passwordChangedAt: new Date(),
    },
  );
};

const logoutUser = async (userId: string) => {
  // Update user's login status to false
  await User.findByIdAndUpdate(userId, { isLoggedIn: false });
  return { message: 'Logged out successfully' };
};

export const AuthServices = {
  loginUser,
  changePassword,
  refreshToken,
  forgetPassword,
  resetPassword,
  logoutUser,
};
