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
      <h2 style="color: #2563eb; text-align: center">Reset Your Password</h2>
    <p>Hello!</p>
    <p>
      We received a request to reset your password for your
      <strong>Research Ustad</strong> account. If you didn't make this request,
      you can safely ignore this email.
    </p>

    <div style="text-align: center; margin: 30px 0">
      <a
        target="_blank"
        href="${resetUILink}"
        style="
          background-color: #2563eb;
          color: white;
          padding: 15px 30px;
          text-decoration: none;
          border-radius: 8px;
          display: inline-block;
          font-weight: bold;
          font-size: 16px;
        "
      >
        🔑 Reset My Password
      </a>
    </div>

    <div
      style="
        background-color: #fff3cd;
        padding: 15px;
        border-radius: 8px;
        margin: 25px 0;
        border-left: 4px solid #ffc107;
      "
    >
      <p style="margin: 0; color: #856404; font-size: 14px">
        <strong>⚠️ Security Notice:</strong> This link will expire in 10
        minutes. If you didn't request this, please ignore this email.
      </p>
    </div>

    <p style="color: #666; font-size: 14px; margin: 20px 0">
      <strong>Button not working?</strong> Copy and paste this link into your
      browser:<br />
      <a href="${resetUILink}" style="color: #2563eb; word-break: break-all"
        >${resetUILink}</a
      >
    </p>

    <p>
      If you have any questions or need assistance, please don't hesitate to
      contact our support team.
    </p>

    <p>&nbsp;</p>

    <p style="margin: 10px 0">
      <strong style="font-size: 16px">Best Regards,</strong>
    </p>

    <p style="margin: 4px 0">
      <img
        src="https://i.ibb.co.com/RG0nL1rv/Research-Ustad-Logo.png"
        alt="Research Ustad Logo"
        width="105"
        height="105"
        onerror="this.style.display='none'; this.nextElementSibling.style.display='block';"
      />
    </p>

    <p
      style="
        margin: 8px 0;
        font-family: 'Times New Roman', Times, serif;
        font-size: 14pt;
      "
    >
      <strong>Research Ustad Team</strong>
    </p>

    <p
      style="
        margin: 4px 0;
        font-family: 'Times New Roman', Times, serif;
        font-size: 12pt;
      "
    >
      <em>Contact:</em>
      <a href="https://researchustad.org/" target="_blank">Research Ustad</a>
    </p>

    <p
      style="
        margin: 4px 0;
        font-family: 'Times New Roman', Times, serif;
        font-size: 12pt;
      "
    >
      <em>WhatsApp:</em>
      <a href="tel:+8801724653054">+880 1724-653054</a>
    </p>

    <p
      style="
        margin: 4px 0;
        font-family: 'Times New Roman', Times, serif;
        font-size: 12pt;
      "
    >
      <em>Email:</em>
      <a href="mailto:info@researchustad.org">info@researchustad.org</a>
    </p>
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
