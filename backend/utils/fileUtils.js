const fs = require('fs');
const path = require('path');

// Ensure upload directories exist
const ensureDirectoryExists = () => {
  const profilesDir = path.join(__dirname, '../uploads/profiles');
  
  if (!fs.existsSync(path.join(__dirname, '../uploads'))) {
    fs.mkdirSync(path.join(__dirname, '../uploads'));
  }
  
  if (!fs.existsSync(profilesDir)) {
    fs.mkdirSync(profilesDir);
  }
  
  // Create default avatar if it doesn't exist
  const defaultAvatarPath = path.join(profilesDir, 'default-avatar.jpg');
  if (!fs.existsSync(defaultAvatarPath)) {
    // Copy from another location or create an empty file
    fs.copyFileSync(
      path.join(__dirname, '../assets/default-avatar.jpg'), 
      defaultAvatarPath
    );
    // If you don't have a source file, you could create a blank placeholder
    // fs.writeFileSync(defaultAvatarPath, '');
  }
};

module.exports = {
  ensureDirectoryExists
};