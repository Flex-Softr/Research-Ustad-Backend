#!/usr/bin/env node

// Test Database Operations Script
// This will test if we can create collections and insert data

const mongoose = require('mongoose');
require('dotenv').config();

const DATABASE_URL = process.env.DATABASE_URL;

console.log('🧪 Testing Database Operations');
console.log('==============================');
console.log(`Database URL: ${DATABASE_URL?.replace(/\/\/.*@/, '//***:***@')}`);
console.log('');

// Simple test schema
const TestSchema = new mongoose.Schema({
  name: String,
  email: String,
  createdAt: { type: Date, default: Date.now }
});

const TestModel = mongoose.model('TestCollection', TestSchema);

async function testDatabaseOperations() {
  try {
    console.log('🔗 Connecting to database...');
    await mongoose.connect(DATABASE_URL);
    console.log('✅ Connected successfully');
    
    const db = mongoose.connection.db;
    console.log(`📊 Database Name: ${db.databaseName}`);
    
    // Test 1: Create a test document
    console.log('\n🧪 Test 1: Creating a test document...');
    const testDoc = new TestModel({
      name: 'Test User',
      email: 'test@example.com'
    });
    
    const savedDoc = await testDoc.save();
    console.log('✅ Test document created:', savedDoc._id);
    
    // Test 2: Find the document
    console.log('\n🧪 Test 2: Finding the test document...');
    const foundDoc = await TestModel.findById(savedDoc._id);
    if (foundDoc) {
      console.log('✅ Test document found:', foundDoc.name);
    } else {
      console.log('❌ Test document not found!');
    }
    
    // Test 3: List all collections
    console.log('\n🧪 Test 3: Listing all collections...');
    const collections = await db.listCollections().toArray();
    console.log(`📁 Collections (${collections.length}):`);
    collections.forEach(col => {
      console.log(`  - ${col.name}`);
    });
    
    // Test 4: Count documents in test collection
    console.log('\n🧪 Test 4: Counting documents in test collection...');
    const count = await TestModel.countDocuments();
    console.log(`📊 Test collection has ${count} documents`);
    
    // Test 5: Create a user document (like your app does)
    console.log('\n🧪 Test 5: Creating a user document...');
    const UserSchema = new mongoose.Schema({
      email: String,
      fullName: String,
      role: String,
      createdAt: { type: Date, default: Date.now }
    });
    
    const UserModel = mongoose.model('TestUser', UserSchema);
    
    const testUser = new UserModel({
      email: 'testuser@example.com',
      fullName: 'Test User',
      role: 'user'
    });
    
    const savedUser = await testUser.save();
    console.log('✅ Test user created:', savedUser._id);
    
    // Test 6: List collections again
    console.log('\n🧪 Test 6: Listing collections after creating user...');
    const collectionsAfter = await db.listCollections().toArray();
    console.log(`📁 Collections (${collectionsAfter.length}):`);
    collectionsAfter.forEach(col => {
      console.log(`  - ${col.name}`);
    });
    
    console.log('\n🎉 All tests completed successfully!');
    console.log('✅ Your database is working correctly');
    
  } catch (error) {
    console.error('❌ Test failed:', error.message);
    console.error('Full error:', error);
  } finally {
    await mongoose.disconnect();
    console.log('\n🔌 Disconnected from database');
  }
}

// Run the tests
testDatabaseOperations().catch(console.error);
