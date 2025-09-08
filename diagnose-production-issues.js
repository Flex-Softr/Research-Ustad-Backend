#!/usr/bin/env node

/**
 * Production Issue Diagnostic Script
 * This script helps identify why data disappears after 2+ hours
 */

const mongoose = require('mongoose');
const fs = require('fs');
const path = require('path');

// Load environment variables
require('dotenv').config({ path: path.join(process.cwd(), '.env') });

const DATABASE_URL = process.env.DATABASE_URL;

console.log('🔍 Production Issue Diagnostic Tool');
console.log('===================================');
console.log(`Database URL: ${DATABASE_URL ? 'SET' : 'NOT SET'}`);
console.log(`Environment: ${process.env.NODE_ENV || 'development'}`);
console.log(`Node Version: ${process.version}`);
console.log(`Platform: ${process.platform}`);
console.log(`Uptime: ${process.uptime()} seconds`);
console.log('');

async function diagnoseIssues() {
  try {
    // 1. Check environment variables
    console.log('🔧 Environment Variables Check:');
    console.log('================================');
    const requiredEnvVars = [
      'DATABASE_URL',
      'JWT_ACCESS_SECRET',
      'JWT_REFRESH_SECRET',
      'SUPER_ADMIN_PASSWORD',
      'NODE_ENV'
    ];
    
    requiredEnvVars.forEach(varName => {
      const value = process.env[varName];
      console.log(`  ${varName}: ${value ? '✅ SET' : '❌ MISSING'}`);
    });
    console.log('');

    // 2. Check database connection
    console.log('🔗 Database Connection Test:');
    console.log('============================');
    
    if (!DATABASE_URL) {
      console.log('❌ DATABASE_URL not provided');
      return;
    }

    console.log('Connecting to database...');
    await mongoose.connect(DATABASE_URL);
    console.log('✅ Connected successfully');
    
    const db = mongoose.connection.db;
    const dbName = db.databaseName;
    console.log(`📊 Database Name: ${dbName}`);
    console.log('');

    // 3. Check collections and data
    console.log('📁 Database Collections Check:');
    console.log('===============================');
    
    const collections = await db.listCollections().toArray();
    console.log(`Found ${collections.length} collections:`);
    
    for (const collection of collections) {
      const count = await db.collection(collection.name).countDocuments();
      console.log(`  - ${collection.name}: ${count} documents`);
    }
    console.log('');

    // 4. Check super admin user
    console.log('👤 Super Admin User Check:');
    console.log('==========================');
    
    const User = mongoose.model('User', new mongoose.Schema({}, { strict: false }));
    const superAdmin = await User.findOne({ role: 'superAdmin' });
    
    if (superAdmin) {
      console.log('✅ Super admin found:');
      console.log(`  - Email: ${superAdmin.email}`);
      console.log(`  - Name: ${superAdmin.fullName}`);
      console.log(`  - Status: ${superAdmin.status}`);
      console.log(`  - Created: ${superAdmin.createdAt}`);
    } else {
      console.log('❌ Super admin NOT found');
    }
    console.log('');

    // 5. Check recent data
    console.log('📊 Recent Data Check:');
    console.log('=====================');
    
    const recentUsers = await User.find().sort({ createdAt: -1 }).limit(5);
    console.log(`Recent users (${recentUsers.length}):`);
    recentUsers.forEach(user => {
      console.log(`  - ${user.email} (${user.role}) - ${user.createdAt}`);
    });
    console.log('');

    // 6. Check system resources
    console.log('💻 System Resources:');
    console.log('===================');
    const memUsage = process.memoryUsage();
    console.log(`Memory Usage:`);
    console.log(`  - RSS: ${Math.round(memUsage.rss / 1024 / 1024)} MB`);
    console.log(`  - Heap Used: ${Math.round(memUsage.heapUsed / 1024 / 1024)} MB`);
    console.log(`  - Heap Total: ${Math.round(memUsage.heapTotal / 1024 / 1024)} MB`);
    console.log('');

    // 7. Check for potential issues
    console.log('⚠️ Potential Issues:');
    console.log('===================');
    
    const issues = [];
    
    if (!process.env.SUPER_ADMIN_PASSWORD) {
      issues.push('SUPER_ADMIN_PASSWORD not set - super admin cannot be created');
    }
    
    if (!superAdmin) {
      issues.push('Super admin user missing - login will fail');
    }
    
    if (collections.length === 0) {
      issues.push('No collections found - database might be empty');
    }
    
    if (DATABASE_URL.includes('localhost') || DATABASE_URL.includes('127.0.0.1')) {
      issues.push('Database URL points to localhost - should be production URL');
    }
    
    if (issues.length === 0) {
      console.log('✅ No obvious issues found');
    } else {
      issues.forEach(issue => console.log(`❌ ${issue}`));
    }
    console.log('');

    // 8. Recommendations
    console.log('💡 Recommendations:');
    console.log('===================');
    console.log('1. Check system cron jobs: sudo crontab -l');
    console.log('2. Check PM2 logs: pm2 logs research-backend');
    console.log('3. Check disk space: df -h');
    console.log('4. Check MongoDB logs: sudo journalctl -u mongod');
    console.log('5. Monitor database connections: netstat -tlnp | grep 27017');
    console.log('');

  } catch (error) {
    console.error('❌ Diagnostic failed:', error.message);
  } finally {
    await mongoose.disconnect();
    console.log('🔌 Disconnected from database');
  }
}

// Run the diagnostic
diagnoseIssues().catch(console.error);
