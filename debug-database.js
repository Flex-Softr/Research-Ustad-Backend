#!/usr/bin/env node

// Database Diagnostic Script
// This script will help identify why data is disappearing

const mongoose = require('mongoose');
require('dotenv').config();

const DATABASE_URL = process.env.DATABASE_URL;

console.log('🔍 Database Diagnostic Tool');
console.log('==========================');
console.log(`Database URL: ${DATABASE_URL?.replace(/\/\/.*@/, '//***:***@')}`);
console.log(`Environment: ${process.env.NODE_ENV}`);
console.log('');

async function diagnoseDatabase() {
  try {
    console.log('🔗 Connecting to database...');
    await mongoose.connect(DATABASE_URL);
    console.log('✅ Connected successfully');
    
    // Get database info
    const db = mongoose.connection.db;
    const adminDb = db.admin();
    
    console.log('\n📊 Database Information:');
    console.log(`Database Name: ${db.databaseName}`);
    console.log(`Host: ${mongoose.connection.host}`);
    console.log(`Port: ${mongoose.connection.port}`);
    
    // List all collections
    const collections = await db.listCollections().toArray();
    console.log(`\n📁 Collections (${collections.length}):`);
    collections.forEach(col => {
      console.log(`  - ${col.name}`);
    });
    
    // Check if collections have data
    console.log('\n📈 Collection Statistics:');
    for (const collection of collections) {
      try {
        const count = await db.collection(collection.name).countDocuments();
        console.log(`  - ${collection.name}: ${count} documents`);
      } catch (error) {
        console.log(`  - ${collection.name}: Error counting documents`);
      }
    }
    
    // Check database server info
    try {
      const serverStatus = await adminDb.serverStatus();
      console.log('\n🖥️ Server Information:');
      console.log(`MongoDB Version: ${serverStatus.version}`);
      console.log(`Uptime: ${Math.floor(serverStatus.uptime / 3600)} hours`);
      console.log(`Host: ${serverStatus.host}`);
    } catch (error) {
      console.log('\n⚠️ Could not get server status (might be a cloud database)');
    }
    
    // Check if this is MongoDB Atlas
    if (DATABASE_URL.includes('mongodb.net') || DATABASE_URL.includes('atlas')) {
      console.log('\n☁️ This appears to be MongoDB Atlas');
      console.log('⚠️ If you\'re on the free tier, databases might reset periodically');
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
    
  } catch (error) {
    console.error('❌ Database connection failed:', error.message);
  } finally {
    await mongoose.disconnect();
    console.log('\n🔌 Disconnected from database');
  }
}

// Run the diagnostic
diagnoseDatabase().catch(console.error);
