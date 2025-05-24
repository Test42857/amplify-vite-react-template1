/* eslint-disable no-undef */
// Script to verify Node.js version and CDK compatibility
import fs from 'fs';
import path from 'path';

console.log('=== Environment Verification ===');

// Check Node.js version
const nodeVersion = process.version;
console.log(`Node.js version: ${nodeVersion}`);

// Extract the major version number
const majorVersion = parseInt(nodeVersion.substring(1).split('.')[0], 10);
const requiredMajorVersion = 20;

if (majorVersion < requiredMajorVersion) {
  console.error(`❌ ERROR: Node.js version ${nodeVersion} does not meet the requirement (v${requiredMajorVersion}.x.x or higher)`);
  console.error(`Please use Node.js ${requiredMajorVersion} or higher.`);
} else {
  console.log(`✅ Node.js version ${nodeVersion} meets the requirement (v${requiredMajorVersion}.x.x or higher)`);
}

// Check if package.json exists
try {
  const packageJsonPath = path.join(process.cwd(), 'package.json');
  const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'));
  
  console.log('\n=== Package.json Dependencies ===');
  
  // Check AWS CDK versions
  const cdkVersion = packageJson.devDependencies['aws-cdk'] || 'Not installed';
  const cdkLibVersion = packageJson.devDependencies['aws-cdk-lib'] || 'Not installed';
  
  console.log(`AWS CDK version: ${cdkVersion}`);
  console.log(`AWS CDK Lib version: ${cdkLibVersion}`);
  
  if (cdkVersion === cdkLibVersion) {
    console.log('✅ AWS CDK and AWS CDK Lib versions match');
  } else {
    console.log('⚠️ WARNING: AWS CDK and AWS CDK Lib versions do not match');
  }
  
  // Check amplify.yml for CDK version
  try {
    const amplifyYmlPath = path.join(process.cwd(), 'amplify.yml');
    const amplifyYmlContent = fs.readFileSync(amplifyYmlPath, 'utf8');
    
    if (amplifyYmlContent.includes('aws-cdk@latest')) {
      console.log('✅ amplify.yml installs the latest AWS CDK version');
    } else if (amplifyYmlContent.includes('aws-cdk@2.138.0')) {
      console.log('⚠️ WARNING: amplify.yml installs a specific AWS CDK version (2.138.0), which might not be compatible');
    } else {
      console.log('❌ ERROR: amplify.yml does not install AWS CDK');
    }
  } catch (error) {
    console.error(`\n❌ ERROR: Could not check amplify.yml for CDK version: ${error.message}`);
  }
  
  // Check engines field
  if (packageJson.engines && packageJson.engines.node) {
    console.log(`\nNode.js version requirement in package.json: ${packageJson.engines.node}`);
    console.log('✅ package.json has Node.js version requirement');
  } else {
    console.log('\n⚠️ WARNING: package.json does not specify Node.js version requirement');
  }
  
} catch (error) {
  console.error(`\n❌ ERROR: Could not read package.json: ${error.message}`);
}

// Check if .nvmrc exists
try {
  const nvmrcPath = path.join(process.cwd(), '.nvmrc');
  const nvmrcContent = fs.readFileSync(nvmrcPath, 'utf8').trim();
  
  console.log(`\n.nvmrc content: ${nvmrcContent}`);
  console.log('✅ .nvmrc file exists');
  
  if (nvmrcContent.startsWith('20')) {
    console.log('✅ .nvmrc specifies Node.js 20');
  } else {
    console.log(`⚠️ WARNING: .nvmrc specifies Node.js ${nvmrcContent}, but 20 is required`);
  }
} catch (error) {
  console.error(`\n❌ ERROR: Could not read .nvmrc: ${error.message}`);
}

// Check if amplify.yml exists
try {
  const amplifyYmlPath = path.join(process.cwd(), 'amplify.yml');
  const amplifyYmlContent = fs.readFileSync(amplifyYmlPath, 'utf8');
  
  console.log('\n=== amplify.yml Configuration ===');
  
  if (amplifyYmlContent.includes('nvm install 20') && amplifyYmlContent.includes('nvm use 20')) {
    console.log('✅ amplify.yml uses nvm to install and use Node.js 20');
  } else if (amplifyYmlContent.includes('NODE_VERSION: "20"')) {
    console.log('⚠️ WARNING: amplify.yml specifies NODE_VERSION: "20" as an environment variable, which might not work');
  } else {
    console.log('❌ ERROR: amplify.yml does not specify Node.js 20');
  }
  
  // Check for nvm use commands
  if (amplifyYmlContent.includes('nvm use')) {
    console.log('⚠️ WARNING: amplify.yml contains "nvm use" commands which might not work in all environments');
  } else {
    console.log('✅ amplify.yml does not contain "nvm use" commands');
  }
  
  // Check if commands are properly quoted
  const commandsQuoted = amplifyYmlContent.includes("'echo") ||
                         amplifyYmlContent.includes("'npm");
  if (commandsQuoted) {
    console.log('✅ amplify.yml commands are properly quoted to avoid YAML syntax issues');
  } else {
    console.log('⚠️ WARNING: amplify.yml commands are not properly quoted, which may cause YAML syntax issues');
  }
} catch (error) {
  console.error(`\n❌ ERROR: Could not read amplify.yml: ${error.message}`);
}

console.log('\n=== Verification Complete ===');