
import httpStatus from 'http-status';
import mongoose, { Types } from 'mongoose';
import config from '../../config';
import AppError from '../../errors/AppError';
import { sendEmail } from '../../utils/sendEmail';
import { User } from './user.model';
import { ResearchPaper } from '../ResearchPaper/ResearchPaper.model';
import { Blog } from '../Blog/blog.model';
import { TUser } from './user.interface';

export class UserService {
  // ===== USER CREATION =====

  /**
   * Create a new user (supports both regular users and research members)
   */
  static async createUser(
    payload: Partial<TUser> & { password?: string },
    file?: any,
  ): Promise<TUser[]> {
    // 🛡️ PROTECTION: Prevent creating multiple superAdmin users
    if (payload.role === 'superAdmin') {
      const existingSuperAdmin = await User.findOne({ role: 'superAdmin' });
      if (existingSuperAdmin) {
        throw new AppError(
          httpStatus.FORBIDDEN,
          'Cannot create multiple superAdmin users. Only one superAdmin is allowed in the system.',
        );
      }
    }

    const userData: Partial<TUser> = {
      password: payload.password || (config.default_password as string),
      designation: payload.designation,
      email: payload.email,
      fullName: payload.fullName,
      role: payload.role || 'user',
      image:
        payload.image ||
        'https://www.shutterstock.com/image-vector/default-avatar-profile-icon-social-600nw-1906669723.jpg',

      // Research member fields
      contactNo: payload.contactNo || '',
      current: payload.current || {
        institution: '',
        department: '',
        degree: '',
        inst_designation: '',
      },
      education: payload.education || {
        degree: '',
        field: '',
        institution: '',
        status: 'Completed',
        scholarship: '',
      },
      research: payload.research || [],
      shortBio: payload.shortBio || '',
      socialLinks: payload.socialLinks || {
        researchgate: '',
        google_scholar: '',
        linkedin: '',
      },
      expertise: payload.expertise || [],
      awards: payload.awards || [],
      conferences: payload.conferences || [],

      // Initialize empty publications array
      publications: [],
    };

    // Handle file upload
    if (file) {
      userData.image = file;
    }

    const session = await mongoose.startSession();

    try {
      await session.startTransaction();

      console.log(`🔍 Checking for existing user with email: ${payload.email}`);

      // Check if user with this email already exists
      const existingUser = await User.findOne({ email: payload.email });

      let newUser;

      if (existingUser) {
        console.log(`❌ User already exists`);
        throw new AppError(
          httpStatus.CONFLICT,
          'User with this email already exists',
        );
      } else {
        // Create new user
        console.log(`🆕 Creating new user with email: ${payload.email}`);
        const createdUsers = await User.create([userData], { session });
        newUser = createdUsers[0];
        console.log(`✅ New user created successfully:`, newUser?.email);
      }

      if (!newUser) {
        throw new AppError(httpStatus.BAD_REQUEST, 'Failed to create user');
      }

      const plainPassword =
        payload.password || (config.default_password as string);

      const subject = 'Welcome to ResearchUstad';
      const emailContent = `
       <h2 style="color: #4CAF50; text-align: center;">Welcome to ResearchUstad!</h2>
    <p>Dear ${payload.fullName},</p>
    <p>Congratulations! Your account has been successfully created on <strong>ResearchUstad</strong>. You now have access to our platform and can start exploring.</p>
    <h3>Your Account Details:</h3>
    <ul>
      <li><strong>Email:</strong>  ${newUser.email}</li>
      <li><strong>Password:</strong> ${plainPassword}</li>
        <li><strong>Designation:</strong> ${newUser.designation}</li>
    </ul>
    <p>For security reasons, we strongly recommend that you change your password immediately after logging in.</p>

      <p><a href="${config.frontend_url}" style="background-color: #4CAF50; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px; display: inline-block;">Log In</a></p>

    <p>If you have any questions, feel free to reach out to our support team.</p>

    <p>Best regards,</p>
    <p><strong>The ResearchUstad Team</strong></p>
    `;

      await sendEmail(newUser.email, emailContent, subject);
      await session.commitTransaction();
      return [newUser];
    } catch (err: any) {
      await session.abortTransaction();
      throw err;
    } finally {
      await session.endSession();
    }
  }

  // ===== USER RETRIEVAL =====

  /**
   * Get user by email with populated publications
   */
  static async getUserByEmail(email: string): Promise<TUser | null> {
    const user = await User.findOne({ email }).populate({
      path: 'publications',
      select: 'title citations journal abstract year visitLink authors status isApproved',
      populate: {
        path: 'authors.user',
        select: 'fullName email designation image',
      },
    });

    return user;
  }

  /**
   * Get a single user by ID with populated publications
   */
  static async getUserById(id: string): Promise<TUser | null> {
    const user = await User.findById(id).populate({
      path: 'publications',
      select: 'title citations journal abstract year visitLink authors status isApproved',
      populate: {
        path: 'authors.user',
        select: 'fullName email designation image',
      },
    });

    return user;
  }

  /**
   * Get all users with optional filtering and populated publications
   */
  static async getUsers(options: any = {}): Promise<TUser[]> {
    const { type, limit, fields, selectFields, excludeRoles, role } = options;

    const query: any = { isDeleted: { $ne: true } };

    // Apply type filter
    if (type === 'research-members') {
      query.role = 'user';
    }

    // Apply role filter
    if (role) {
      query.role = role;
    }

    // Apply exclude roles filter
    if (excludeRoles && Array.isArray(excludeRoles)) {
      query.role = { $nin: excludeRoles };
    }

    // Build the query
    let userQuery = User.find(query);

    // Apply limit if specified
    if (limit) {
      userQuery = userQuery.limit(limit);
    }

    // Apply field selection if specified
    if (fields || selectFields) {
      const fieldString = fields || selectFields;
      userQuery = userQuery.select(fieldString);
    }

    // Always populate publications with limited fields
    userQuery = userQuery.populate({
      path: 'publications',
      select: 'title citations journal abstract year visitLink authors status isApproved',
      populate: {
        path: 'authors.user',
        select: 'fullName email designation image',
      },
    });

    const users = await userQuery.exec();
    return users;
  }

  /**
   * Get all research members (users with designations)
   */
  static async getResearchMembers(): Promise<TUser[]> {
    return await User.find({
      designation: { $exists: true, $ne: null },
      role: { $ne: 'superAdmin' },
    }).sort({ fullName: 1 });
  }

  /**
   * Get research members by designation
   */
  static async getResearchMembersByDesignation(
    designation: string,
  ): Promise<TUser[]> {
    return await User.find({ designation }).sort({ fullName: 1 });
  }

  // ===== USER UPDATES =====

  /**
   * Update user by ID
   */
  static async updateUser(id: string, payload: Partial<TUser>): Promise<TUser> {
    const { current, education, socialLinks, ...remainingData } = payload;

    const modifiedUpdatedData: Record<string, unknown> = {
      ...remainingData,
    };

    if (current && Object.keys(current).length) {
      for (const [key, value] of Object.entries(current)) {
        modifiedUpdatedData[`current.${key}`] = value;
      }
    }

    if (education && Object.keys(education).length) {
      for (const [key, value] of Object.entries(education)) {
        modifiedUpdatedData[`education.${key}`] = value;
      }
    }

    if (socialLinks && Object.keys(socialLinks).length) {
      for (const [key, value] of Object.entries(socialLinks)) {
        modifiedUpdatedData[`socialLinks.${key}`] = value;
      }
    }

    const result = await User.findByIdAndUpdate(id, modifiedUpdatedData, {
      new: true,
      runValidators: true,
    });

    if (!result) {
      throw new AppError(httpStatus.NOT_FOUND, 'User not found');
    }

    return result;
  }

  /**
   * Update user by email
   */
  static async updateUserByEmail(
    email: string,
    payload: Partial<TUser>,
  ): Promise<TUser> {
    const { current, education, socialLinks, ...remainingData } = payload;

    const modifiedUpdatedData: Record<string, unknown> = {
      ...remainingData,
    };

    if (current && Object.keys(current).length) {
      for (const [key, value] of Object.entries(current)) {
        modifiedUpdatedData[`current.${key}`] = value;
      }
    }

    if (education && Object.keys(education).length) {
      for (const [key, value] of Object.entries(education)) {
        modifiedUpdatedData[`education.${key}`] = value;
      }
    }

    if (socialLinks && Object.keys(socialLinks).length) {
      for (const [key, value] of Object.entries(socialLinks)) {
        modifiedUpdatedData[`socialLinks.${key}`] = value;
      }
    }

    const result = await User.findOneAndUpdate({ email }, modifiedUpdatedData, {
      new: true,
      runValidators: true,
    });

    if (!result) {
      throw new AppError(httpStatus.NOT_FOUND, 'User not found');
    }

    return result;
  }

  // ===== USER MANAGEMENT =====

  /**
   * Toggle user role between admin and user
   */
  static async toggleUserRole(id: string): Promise<TUser> {
    const user = await User.findById(id);
    if (!user) {
      throw new AppError(httpStatus.NOT_FOUND, 'User not found');
    }

    const newRole = user.role === 'admin' ? 'user' : 'admin';

    const result = await User.findByIdAndUpdate(
      id,
      { role: newRole },
      { new: true, runValidators: true },
    );
    return result!;
  }

  /**
   * Delete user and all related data
   */
  static async deleteUser(id: string, requestingUserId?: string): Promise<any> {
    const session = await mongoose.startSession();

    try {
      session.startTransaction();

      // First, check if user exists
      const userToDelete = await User.findById(id);
      if (!userToDelete) {
        throw new AppError(httpStatus.NOT_FOUND, 'User not found');
      }

      // 🛡️ PROTECTION: Prevent self-deletion
      if (requestingUserId && requestingUserId === id) {
        throw new AppError(
          httpStatus.FORBIDDEN,
          'Cannot delete your own account. Please contact another administrator.',
        );
      }

      // 🛡️ PROTECTION: Prevent superAdmin deletion (only one superAdmin allowed)
      if (userToDelete.role === 'superAdmin') {
        throw new AppError(
          httpStatus.FORBIDDEN,
          'Cannot delete superAdmin users. Only one superAdmin is allowed in the system.',
        );
      }

      console.log(`🗑️ Hard deleting user: ${userToDelete.email} (ID: ${id})`);

      // Delete all related data first
      // 1. Delete user's research papers
      const deletedPapers = await ResearchPaper.deleteMany(
        { user: id },
        { session },
      );
      console.log(`📄 Deleted ${deletedPapers.deletedCount} research papers`);

      // 2. Delete user's blogs
      const deletedBlogs = await Blog.deleteMany({ author: id }, { session });
      console.log(`📝 Deleted ${deletedBlogs.deletedCount} blogs`);

      // 3. Remove user from author references in research papers
      const updatedPapers = await ResearchPaper.updateMany(
        { 'authorReferences.user': id },
        { $pull: { authorReferences: { user: id } } },
        { session },
      );
      console.log(
        `👥 Removed author references from ${updatedPapers.modifiedCount} papers`,
      );

      // 4. Finally, delete the user completely
      const deletedUser = await User.findByIdAndDelete(id, { session });

      if (!deletedUser) {
        throw new AppError(httpStatus.NOT_FOUND, 'User not found');
      }

      console.log(
        `✅ User ${deletedUser.email} completely deleted from database`,
      );

      await session.commitTransaction();
      return {
        message: 'User and all related data deleted successfully',
        deletedUser: {
          id: deletedUser._id,
          email: deletedUser.email,
          fullName: deletedUser.fullName,
        },
        deletedPapers: deletedPapers.deletedCount,
        deletedBlogs: deletedBlogs.deletedCount,
        updatedPapers: updatedPapers.modifiedCount,
      };
    } catch (err: any) {
      await session.abortTransaction();
      console.error('❌ Error during hard delete:', err);
      throw err;
    } finally {
      await session.endSession();
    }
  }

  /**
   * Search users by name
   */
  static async searchUsers(query: string): Promise<TUser[]> {
    if (!query || query.trim().length < 2) {
      return [];
    }

    const searchRegex = new RegExp(query.trim(), 'i');

    const users = await User.find({
      fullName: { $regex: searchRegex },
    })
      .select('fullName email designation')
      .limit(10)
      .sort({ fullName: 1 });

    return users;
  }

  // ===== SUPERADMIN MANAGEMENT =====

  /**
   * Replace the current superAdmin with a new one
   */
  static async replaceSuperAdmin(
    newSuperAdminId: string,
    requestingUserId?: string,
  ): Promise<any> {
    const session = await mongoose.startSession();

    try {
      session.startTransaction();

      // 🛡️ PROTECTION: Only current superAdmin can replace themselves
      if (!requestingUserId) {
        throw new AppError(
          httpStatus.FORBIDDEN,
          'Authentication required to replace superAdmin.',
        );
      }

      const requestingUser = await User.findById(requestingUserId);
      if (!requestingUser || requestingUser.role !== 'superAdmin') {
        throw new AppError(
          httpStatus.FORBIDDEN,
          'Only the current superAdmin can replace themselves.',
        );
      }

      // Check if new superAdmin candidate exists
      const newSuperAdminCandidate = await User.findById(newSuperAdminId);
      if (!newSuperAdminCandidate) {
        throw new AppError(
          httpStatus.NOT_FOUND,
          'New superAdmin candidate not found.',
        );
      }

      // Check if new candidate is already superAdmin
      if (newSuperAdminCandidate.role === 'superAdmin') {
        throw new AppError(
          httpStatus.BAD_REQUEST,
          'Selected user is already a superAdmin.',
        );
      }

      // Check if trying to replace with the same user
      if (requestingUserId === newSuperAdminId) {
        throw new AppError(
          httpStatus.BAD_REQUEST,
          'Cannot replace superAdmin with the same user.',
        );
      }

      console.log(
        `🔄 Replacing superAdmin: ${requestingUser.email} -> ${newSuperAdminCandidate.email}`,
      );

      // 1. Demote current superAdmin to admin
      const demotedSuperAdmin = await User.findByIdAndUpdate(
        requestingUserId,
        { role: 'admin' },
        { new: true, runValidators: true, session },
      );

      // 2. Promote new candidate to superAdmin
      const promotedSuperAdmin = await User.findByIdAndUpdate(
        newSuperAdminId,
        { role: 'superAdmin' },
        { new: true, runValidators: true, session },
      );

      await session.commitTransaction();

      console.log(
        `✅ SuperAdmin successfully replaced: ${demotedSuperAdmin?.email} -> ${promotedSuperAdmin?.email}`,
      );

      return {
        message: 'SuperAdmin successfully replaced',
        previousSuperAdmin: {
          id: demotedSuperAdmin?._id,
          email: demotedSuperAdmin?.email,
          fullName: demotedSuperAdmin?.fullName,
          newRole: 'admin',
        },
        newSuperAdmin: {
          id: promotedSuperAdmin?._id,
          email: promotedSuperAdmin?.email,
          fullName: promotedSuperAdmin?.fullName,
          newRole: 'superAdmin',
        },
      };
    } catch (err: any) {
      await session.abortTransaction();
      console.error('❌ Error during superAdmin replacement:', err);
      throw err;
    } finally {
      await session.endSession();
    }
  }

  /**
   * Get current superAdmin information
   */
  static async getCurrentSuperAdmin(): Promise<any> {
    const superAdmin = await User.findOne({ role: 'superAdmin' });
    if (!superAdmin) {
      throw new AppError(
        httpStatus.NOT_FOUND,
        'No superAdmin found in the system.',
      );
    }

    return {
      id: superAdmin._id,
      email: superAdmin.email,
      fullName: superAdmin.fullName,
      role: superAdmin.role,
      designation: superAdmin.designation,
    };
  }

  // ===== STATISTICS =====

  /**
   * Get platform-wide statistics
   */
  static async getPlatformStats(): Promise<any> {
    const [
      totalUsers,
      totalResearchMembers,
      totalApprovedPapers,
      totalPendingPapers,
      totalResearchPapers,
      totalBlogs,
    ] = await Promise.all([
      User.countDocuments(),
      User.countDocuments({ role: { $ne: 'superAdmin' } }),
      ResearchPaper.countDocuments({ isApproved: true }),
      ResearchPaper.countDocuments({ isApproved: false }),
      ResearchPaper.countDocuments(),
      Blog.countDocuments(),
    ]);

    return {
      totalUsers,
      totalResearchMembers,
      totalApprovedPapers,
      totalPendingPapers,
      totalResearchPapers,
      totalBlogs,
    };
  }

  /**
   * Get personal statistics for a user
   */
  static async getUserStats(userId: string): Promise<any> {
    const [
      totalApprovedPapers,
      totalPendingPapers,
      totalResearchPapers,
      totalBlogs,
    ] = await Promise.all([
      ResearchPaper.countDocuments({ isApproved: true, user: userId }),
      ResearchPaper.countDocuments({ isApproved: false, user: userId }),
      ResearchPaper.countDocuments({ user: userId }),
      Blog.countDocuments({ author: userId }),
    ]);

    return {
      totalApprovedPapers,
      totalPendingPapers,
      totalResearchPapers,
      totalBlogs,
    };
  }

  // ===== PUBLICATION MANAGEMENT =====

  /**
   * Add a research paper to users' publications based on author emails
   */
  static async addPaperToAuthors(
    paperId: Types.ObjectId,
    authors: Array<
      | {
          user?: Types.ObjectId;
          name?: string;
          role: string;
          isRegisteredUser?: boolean;
        }
      | string
    >,
  ): Promise<void> {
    const session = await mongoose.startSession();

    try {
      await session.startTransaction();

      // Filter authors with user ObjectIds (handle both old and new formats)
      const authorsWithUserIds = authors.filter((author) => {
        if (typeof author === 'string') {
          return false; // Old format - no user reference
        }
        return author.user;
      }) as Array<{
        user?: Types.ObjectId;
        name?: string;
        role: string;
        isRegisteredUser?: boolean;
      }>;

      if (authorsWithUserIds.length === 0) {
        console.log(
          '📝 No authors with user references found, skipping publication linking',
        );
        return;
      }

      // Get all author user ObjectIds
      const authorUserIds = authorsWithUserIds
        .filter((author) => author.user)
        .map((author) => author.user!);

      console.log(`🔍 Looking for users with ObjectIds:`, authorUserIds);

      // Get total user count for comparison
      const totalUsers = await User.countDocuments().session(session);
      console.log(`📊 Total users in database: ${totalUsers}`);

      // Find all users whose ObjectId matches any of the author references
      const matchingUsers = await User.find({
        _id: { $in: authorUserIds },
      }).session(session);

      console.log(
        `✅ Found ${matchingUsers.length} matching users out of ${totalUsers} total users`,
      );
      console.log(
        `📈 Match rate: ${((matchingUsers.length / totalUsers) * 100).toFixed(
          2,
        )}%`,
      );

      if (matchingUsers.length > 0) {
        console.log(`👥 Matching users:`);
        matchingUsers.forEach((user, index) => {
          console.log(
            `  ${index + 1}. ${user.fullName} (${user.email}) - Role: ${
              user.role
            }`,
          );
        });
      }

      // Add the paper to each matching user's publications array
      for (const user of matchingUsers) {
        // Initialize publications array if it doesn't exist
        if (!user.publications) {
          user.publications = [];
        }

        // Check if paper is already in user's publications
        const paperExists = user.publications.some((pubId) =>
          pubId.equals(paperId),
        );
        if (!paperExists) {
          // Use findByIdAndUpdate to avoid password hashing middleware
          await User.findByIdAndUpdate(
            user._id,
            { $push: { publications: paperId } },
            { session, new: true },
          );
          console.log(
            `📄 Added paper ${paperId} to user ${user.email}'s publications`,
          );
        } else {
          console.log(
            `📄 Paper ${paperId} already exists in user ${user.email}'s publications`,
          );
        }
      }

      await session.commitTransaction();
      console.log(
        `🎉 Successfully linked paper ${paperId} to ${matchingUsers.length} authors`,
      );
    } catch (error) {
      await session.abortTransaction();
      console.error('❌ Error linking paper to authors:', error);
      throw error;
    } finally {
      await session.endSession();
    }
  }

  /**
   * Remove a research paper from users' publications
   */
  static async removePaperFromAuthors(paperId: Types.ObjectId): Promise<void> {
    const session = await mongoose.startSession();

    try {
      await session.startTransaction();

      // Find all users who have this paper in their publications
      const usersWithPaper = await User.find({
        publications: paperId,
      }).session(session);

      console.log(
        `🔍 Found ${usersWithPaper.length} users with paper ${paperId}`,
      );

      // Remove the paper from each user's publications array
      for (const user of usersWithPaper) {
        if (user.publications) {
          // Use findByIdAndUpdate to avoid password hashing middleware
          await User.findByIdAndUpdate(
            user._id,
            { $pull: { publications: paperId } },
            { session, new: true },
          );
          console.log(
            `🗑️ Removed paper ${paperId} from user ${user.email}'s publications`,
          );
        }
      }

      await session.commitTransaction();
      console.log(
        `🎉 Successfully removed paper ${paperId} from ${usersWithPaper.length} authors`,
      );
    } catch (error) {
      await session.abortTransaction();
      console.error('❌ Error removing paper from authors:', error);
      throw error;
    } finally {
      await session.endSession();
    }
  }

  /**
   * Update user publications when a paper is updated
   */
  static async updatePaperAuthors(
    paperId: Types.ObjectId,
    newAuthors: Array<
      | {
          user?: Types.ObjectId;
          name?: string;
          role: string;
          isRegisteredUser?: boolean;
        }
      | string
    >,
  ): Promise<void> {
    const session = await mongoose.startSession();

    try {
      await session.startTransaction();

      // First, remove the paper from all users
      await this.removePaperFromAuthors(paperId);

      // Then, add it to the new authors
      await this.addPaperToAuthors(paperId, newAuthors);

      await session.commitTransaction();
      console.log(`🔄 Successfully updated paper ${paperId} authors`);
    } catch (error) {
      await session.abortTransaction();
      console.error('❌ Error updating paper authors:', error);
      throw error;
    } finally {
      await session.endSession();
    }
  }

  /**
   * Get user's publications with full research paper data
   */
  static async getUserPublications(userId: string): Promise<any[]> {
    const user = await User.findById(userId).populate({
      path: 'publications',
      select:
        'title authors journal year status isApproved visitLink abstract keywords citations researchArea funding createdAt',
    });

    if (!user) {
      throw new AppError(httpStatus.NOT_FOUND, 'User not found');
    }

    return user.publications || [];
  }

  /**
   * Get all team members with their publications
   */
  static async getTeamMembersWithPublications(): Promise<any[]> {
    const users = await User.find({
      role: { $in: ['user', 'admin', 'superAdmin'] },
      isDeleted: { $ne: true },
    }).populate({
      path: 'publications',
      select:
        'title authors journal year status isApproved visitLink abstract keywords citations researchArea funding createdAt',
    });

    return users.map((user) => ({
      _id: user._id,
      fullName: user.fullName,
      email: user.email,
      designation: user.designation,
      role: user.role,
      image: user.image,
      shortBio: user.shortBio,
      contactNo: user.contactNo,
      current: user.current,
      education: user.education,
      research: user.research,
      socialLinks: user.socialLinks,
      expertise: user.expertise,
      awards: user.awards,
      conferences: user.conferences,
      publications: user.publications || [],
    }));
  }
}

// ===== LEGACY EXPORTS FOR BACKWARD COMPATIBILITY =====

// Export individual functions for backward compatibility
export const UserServices = {
  // User creation
  createResearchMembar: (
    file: any,
    password: string,
    payload: Partial<TUser>,
  ) => UserService.createUser({ ...payload, password }, file),
  createResearchMembars: (payload: Partial<TUser> & { password?: string }) =>
    UserService.createUser(payload),

  // User retrieval
  getMe: (email: string) => UserService.getUserByEmail(email),
  getUserByEmail: (email: string) => UserService.getUserByEmail(email),
  getUserById: (id: string) => UserService.getUserById(id),
  getUsers: (options?: any) => UserService.getUsers(options),

  // Research member specific
  getAllResearchMembers: () => UserService.getResearchMembers(),
  getResearchMembersByDesignation: (designation: string) =>
    UserService.getResearchMembersByDesignation(designation),
  getSingleResearchMember: (id: string) => UserService.getUserById(id),
  getSingleResearchMemberByEmail: (email: string) =>
    UserService.getUserByEmail(email),

  // User management
  userToadmin: (id: string) => UserService.toggleUserRole(id),
  deleteUser: (id: string, requestingUserId?: string) =>
    UserService.deleteUser(id, requestingUserId),
  searchUsers: (query: string) => UserService.searchUsers(query),

  // User updates
  updateUser: (id: string, payload: Partial<TUser>) =>
    UserService.updateUser(id, payload),
  updateUserByEmail: (email: string, payload: Partial<TUser>) =>
    UserService.updateUserByEmail(email, payload),
  updateResearchMember: (id: string, payload: Partial<TUser>) =>
    UserService.updateUser(id, payload),
  updateResearchMemberByEmail: (email: string, payload: Partial<TUser>) =>
    UserService.updateUserByEmail(email, payload),

  // SuperAdmin management
  replaceSuperAdmin: (newSuperAdminId: string, requestingUserId?: string) =>
    UserService.replaceSuperAdmin(newSuperAdminId, requestingUserId),
  getCurrentSuperAdmin: () => UserService.getCurrentSuperAdmin(),

  // Statistics
  AllInfo: () => UserService.getPlatformStats(),
  AllInfoForPersonal: (id: string) => UserService.getUserStats(id),

  // Legacy aliases
  Alluser: () => UserService.getUsers(),
  getAllUsers: () =>
    UserService.getUsers({
      selectFields: 'fullName email designation',
      limit: 50,
    }),
  deleteResearchMember: (id: string, requestingUserId?: string) =>
    UserService.deleteUser(id, requestingUserId),
};
