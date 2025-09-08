const { exec } = require('child_process');
const fs = require('fs');
const path = require('path');

class DataPersistenceMonitor {
  constructor() {
    this.logFile = path.join(__dirname, 'data-persistence-monitor.log');
    this.startTime = new Date();
    this.checks = [];
  }

  log(message) {
    const timestamp = new Date().toISOString();
    const logMessage = `[${timestamp}] ${message}`;
    console.log(logMessage);
    fs.appendFileSync(this.logFile, logMessage + '\n');
  }

  async runCommand(command) {
    return new Promise((resolve, reject) => {
      exec(command, (error, stdout, stderr) => {
        if (error) {
          reject(error);
        } else {
          resolve(stdout.trim());
        }
      });
    });
  }

  async checkPM2Status() {
    try {
      const status = await this.runCommand('pm2 status --no-color');
      const isOnline = status.includes('online');
      const restartCount = status.match(/│\s*\d+\s*│\s*research-backend\s*│[^│]*│\s*(\d+)\s*│/);
      
      return {
        online: isOnline,
        restarts: restartCount ? parseInt(restartCount[1]) : 0,
        status: status
      };
    } catch (error) {
      return { online: false, restarts: -1, error: error.message };
    }
  }

  async checkDatabase() {
    try {
      const userCount = await this.runCommand('mongosh researchustad --quiet --eval "db.users.countDocuments()"');
      const superadminExists = await this.runCommand('mongosh researchustad --quiet --eval "db.users.findOne({email: \'anissir@gmail.com\'}) ? \'EXISTS\' : \'MISSING\'"');
      
      return {
        userCount: parseInt(userCount) || 0,
        superadminExists: superadminExists === 'EXISTS',
        timestamp: new Date()
      };
    } catch (error) {
      return { userCount: -1, superadminExists: false, error: error.message };
    }
  }

  async checkApplicationHealth() {
    try {
      const response = await this.runCommand('curl -s -o /dev/null -w "%{http_code}" http://localhost:5000/');
      return {
        httpStatus: parseInt(response),
        healthy: parseInt(response) === 200
      };
    } catch (error) {
      return { httpStatus: -1, healthy: false, error: error.message };
    }
  }

  async performCheck() {
    const checkTime = new Date();
    this.log('🔍 Starting data persistence check...');

    // Check PM2 Status
    const pm2Status = await this.checkPM2Status();
    this.log(`📊 PM2 Status: ${pm2Status.online ? 'ONLINE' : 'OFFLINE'}, Restarts: ${pm2Status.restarts}`);

    // Check Database
    const dbStatus = await this.checkDatabase();
    this.log(`🗄️  Database: ${dbStatus.userCount} users, Superadmin: ${dbStatus.superadminExists ? 'EXISTS' : 'MISSING'}`);

    // Check Application Health
    const appHealth = await this.checkApplicationHealth();
    this.log(`🌐 Application: HTTP ${appHealth.httpStatus}, Healthy: ${appHealth.healthy ? 'YES' : 'NO'}`);

    // Record check results
    const checkResult = {
      timestamp: checkTime,
      pm2: pm2Status,
      database: dbStatus,
      application: appHealth,
      overall: pm2Status.online && dbStatus.superadminExists && appHealth.healthy
    };

    this.checks.push(checkResult);

    // Alert if issues found
    if (!checkResult.overall) {
      this.log('⚠️  WARNING: Issues detected!');
      if (!pm2Status.online) this.log('   - PM2 is not online');
      if (!dbStatus.superadminExists) this.log('   - Superadmin user missing');
      if (!appHealth.healthy) this.log('   - Application not healthy');
    } else {
      this.log('✅ All systems healthy');
    }

    this.log('---');
    return checkResult;
  }

  generateReport() {
    const totalChecks = this.checks.length;
    const healthyChecks = this.checks.filter(c => c.overall).length;
    const uptime = new Date() - this.startTime;
    const uptimeHours = Math.round(uptime / (1000 * 60 * 60) * 100) / 100;

    this.log('📋 MONITORING REPORT');
    this.log('==================');
    this.log(`Total checks: ${totalChecks}`);
    this.log(`Healthy checks: ${healthyChecks}`);
    this.log(`Success rate: ${Math.round((healthyChecks / totalChecks) * 100)}%`);
    this.log(`Monitoring duration: ${uptimeHours} hours`);
    this.log(`Start time: ${this.startTime.toISOString()}`);
    this.log(`End time: ${new Date().toISOString()}`);

    if (healthyChecks === totalChecks) {
      this.log('🎉 EXCELLENT: 100% uptime - Data persistence issue appears to be RESOLVED!');
    } else if (healthyChecks / totalChecks >= 0.95) {
      this.log('✅ GOOD: >95% uptime - Data persistence issue likely resolved');
    } else {
      this.log('⚠️  CONCERN: <95% uptime - Data persistence issue may still exist');
    }
  }

  async startMonitoring(intervalMinutes = 30, durationHours = 48) {
    this.log(`🚀 Starting data persistence monitoring for ${durationHours} hours`);
    this.log(`📅 Check interval: ${intervalMinutes} minutes`);
    this.log(`⏰ Started at: ${this.startTime.toISOString()}`);
    this.log('---');

    const endTime = new Date(this.startTime.getTime() + (durationHours * 60 * 60 * 1000));
    const intervalMs = intervalMinutes * 60 * 1000;

    const monitor = setInterval(async () => {
      if (new Date() >= endTime) {
        clearInterval(monitor);
        this.log('🏁 Monitoring period completed');
        this.generateReport();
        process.exit(0);
      }

      await this.performCheck();
    }, intervalMs);

    // Perform initial check
    await this.performCheck();
  }
}

// Usage
const monitor = new DataPersistenceMonitor();

// Start monitoring
// Check every 30 minutes for 48 hours
monitor.startMonitoring(30, 48).catch(console.error);
