#!/usr/bin/env node

// Data Loss Investigation Script
// This will help identify what's causing data to disappear

const mongoose = require('mongoose');
require('dotenv').config();

const DATABASE_URL = process.env.DATABASE_URL;

console.log('🔍 Data Loss Investigation Tool');
console.log('================================');
console.log(`Database URL: ${DATABASE_URL?.replace(/\/\/.*@/, '//***:***@')}`);
console.log(`Environment: ${process.env.NODE_ENV}`);
console.log(`Node Version: ${process.version}`);
console.log(`Platform: ${process.platform}`);
console.log(`Uptime: ${Math.floor(process.uptime())} seconds`);
console.log('');

// Test schemas
const UserSchema = new mongoose.Schema({
  email: String,
  fullName: String,
  role: String,
  createdAt: { type: Date, default: Date.now }
});

const TestSchema = new mongoose.Schema({
  name: String,
  value: String,
  timestamp: { type: Date, default: Date.now }
});

const UserModel = mongoose.model('InvestigationUser', UserSchema);
const TestModel = mongoose.model('InvestigationTest', TestSchema);

async function investigateDataLoss() {
  try {
    console.log('🔗 Connecting to database...');
    await mongoose.connect(DATABASE_URL);
    console.log('✅ Connected successfully');
    
    const db = mongoose.connection.db;
    console.log(`📊 Database Name: ${db.databaseName}`);
    console.log(`🖥️ Host: ${mongoose.connection.host}`);
    console.log(`🔌 Port: ${mongoose.connection.port}`);
    
    // Check connection state
    console.log(`🔗 Connection State: ${mongoose.connection.readyState}`);
    console.log(`📡 Connection String: ${mongoose.connection.host}:${mongoose.connection.port}`);
    
    // List all collections
    console.log('\n📁 Current Collections:');
    const collections = await db.listCollections().toArray();
    console.log(`Found ${collections.length} collections:`);
    collections.forEach(col => {
      console.log(`  - ${col.name}`);
    });
    
    // Check if our test collections exist
    const hasUsers = collections.some(col => col.name === 'investigationusers');
    const hasTests = collections.some(col => col.name === 'investigationtests');
    
    console.log(`\n🧪 Test Collections Status:`);
    console.log(`  - investigationusers: ${hasUsers ? 'EXISTS' : 'MISSING'}`);
    console.log(`  - investigationtests: ${hasTests ? 'EXISTS' : 'MISSING'}`);
    
    // Create test data
    console.log('\n🧪 Creating test data...');
    
    const testUser = new UserModel({
      email: 'investigation@test.com',
      fullName: 'Investigation User',
      role: 'investigator'
    });
    
    const savedUser = await testUser.save();
    console.log(`✅ Test user created: ${savedUser._id}`);
    
    const testDoc = new TestModel({
      name: 'Investigation Test',
      value: 'This is a test document'
    });
    
    const savedTest = await testDoc.save();
    console.log(`✅ Test document created: ${savedTest._id}`);
    
    // Verify data was saved
    console.log('\n🔍 Verifying saved data...');
    const foundUser = await UserModel.findById(savedUser._id);
    const foundTest = await TestModel.findById(savedTest._id);
    
    console.log(`User found: ${foundUser ? 'YES' : 'NO'}`);
    console.log(`Test found: ${foundTest ? 'YES' : 'NO'}`);
    
    // Count documents
    const userCount = await UserModel.countDocuments();
    const testCount = await TestModel.countDocuments();
    
    console.log(`\n📊 Document Counts:`);
    console.log(`  - investigationusers: ${userCount} documents`);
    console.log(`  - investigationtests: ${testCount} documents`);
    
    // Check database stats
    console.log('\n📈 Database Statistics:');
    try {
      const stats = await db.stats();
      console.log(`  - Collections: ${stats.collections}`);
      console.log(`  - Data Size: ${(stats.dataSize / 1024).toFixed(2)} KB`);
      console.log(`  - Storage Size: ${(stats.storageSize / 1024).toFixed(2)} KB`);
      console.log(`  - Index Size: ${(stats.indexSize / 1024).toFixed(2)} KB`);
    } catch (error) {
      console.log('  - Could not get database stats');
    }
    
    // Check for any indexes
    console.log('\n🔍 Index Information:');
    for (const collection of collections) {
      try {
        const indexes = await db.collection(collection.name).indexes();
        console.log(`  - ${collection.name}: ${indexes.length} indexes`);
      } catch (error) {
        console.log(`  - ${collection.name}: Error getting indexes`);
      }
    }
    
    // Check if this is a development vs production issue
    console.log('\n🌍 Environment Analysis:');
    console.log(`  - NODE_ENV: ${process.env.NODE_ENV}`);
    console.log(`  - Database URL contains 'localhost': ${DATABASE_URL.includes('localhost')}`);
    console.log(`  - Database URL contains '127.0.0.1': ${DATABASE_URL.includes('127.0.0.1')}`);
    console.log(`  - Database URL contains 'mongodb.net': ${DATABASE_URL.includes('mongodb.net')}`);
    
    // Check for any potential issues
    console.log('\n⚠️ Potential Issues to Check:');
    if (process.env.NODE_ENV === 'development') {
      console.log('  - Running in development mode - data might not persist');
    }
    if (DATABASE_URL.includes('mongodb.net')) {
      console.log('  - Using MongoDB Atlas - check if you\'re on free tier');
    }
    if (DATABASE_URL.includes('localhost') || DATABASE_URL.includes('127.0.0.1')) {
      console.log('  - Using local MongoDB - check if it\'s configured for persistence');
    }
    
    console.log('\n🎉 Investigation completed!');
    console.log('✅ Database operations are working correctly');
    console.log('📝 Check the logs above for any potential issues');
    
  } catch (error) {
    console.error('❌ Investigation failed:', error.message);
    console.error('Full error:', error);
  } finally {
    await mongoose.disconnect();
    console.log('\n🔌 Disconnected from database');
  }
}

// Run the investigation
investigateDataLoss().catch(console.error);
