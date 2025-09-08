#!/usr/bin/env node

/**
 * Production Monitoring Script
 * Monitors database health and data persistence
 */

const mongoose = require('mongoose');
const fs = require('fs');
const path = require('path');

// Load environment variables
require('dotenv').config({ path: path.join(process.cwd(), '.env') });

const DATABASE_URL = process.env.DATABASE_URL;
const LOG_FILE = path.join(__dirname, 'production-monitor.log');

function log(message) {
  const timestamp = new Date().toISOString();
  const logMessage = `[${timestamp}] ${message}`;
  console.log(logMessage);
  fs.appendFileSync(LOG_FILE, logMessage + '\n');
}

async function monitorDatabase() {
  try {
    log('🔍 Starting database monitoring...');
    
    if (!DATABASE_URL) {
      log('❌ DATABASE_URL not provided');
      return;
    }

    // Connect to database
    await mongoose.connect(DATABASE_URL);
    log('✅ Connected to database');
    
    const db = mongoose.connection.db;
    const User = mongoose.model('User', new mongoose.Schema({}, { strict: false }));
    
    // Check super admin
    const superAdmin = await User.findOne({ role: 'superAdmin' });
    if (superAdmin) {
      log(`✅ Super admin exists: ${superAdmin.email}`);
    } else {
      log('❌ Super admin missing - attempting to recreate...');
      
      // Try to recreate super admin
      try {
        const newSuperAdmin = await User.create({
          email: 'anissir@gmail.com',
          password: process.env.SUPER_ADMIN_PASSWORD || 'admin123',
          needsPasswordChange: false,
          role: 'superAdmin',
          image: 'https://i.ibb.co.com/9HK7CcHy/Whats-App-Image-2025-03-12-at-11-29-38-8d375b0e.jpg',
          fullName: 'Anis Islam',
          designation: 'Super Administrator',
          status: 'in-progress',
        });
        log(`✅ Super admin recreated: ${newSuperAdmin.email}`);
      } catch (error) {
        log(`❌ Failed to recreate super admin: ${error.message}`);
      }
    }
    
    // Check total users
    const userCount = await User.countDocuments();
    log(`📊 Total users: ${userCount}`);
    
    // Check recent activity
    const recentUsers = await User.find().sort({ createdAt: -1 }).limit(3);
    log(`📈 Recent users: ${recentUsers.map(u => u.email).join(', ')}`);
    
    // Check collections
    const collections = await db.listCollections().toArray();
    log(`📁 Collections: ${collections.length}`);
    
    await mongoose.disconnect();
    log('🔌 Disconnected from database');
    
  } catch (error) {
    log(`❌ Monitoring failed: ${error.message}`);
  }
}

// Run monitoring every 30 minutes
setInterval(monitorDatabase, 30 * 60 * 1000);

// Run immediately
monitorDatabase();

log('🚀 Production monitor started - checking every 30 minutes');
