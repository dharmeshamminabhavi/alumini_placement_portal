const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const User = require('./models/User');

// Connect to MongoDB
mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/placement-portal', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

async function createUser() {
  try {
    console.log('Creating test user...');

    // Check if user already exists
    const existingUser = await User.findOne({ email: 'test@example.com' });
    if (existingUser) {
      console.log('Test user already exists');
      return existingUser;
    }

    // Hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash('password123', salt);

    // Create user
    const user = new User({
      name: 'Test User',
      email: 'test@example.com',
      password: hashedPassword,
      role: 'alumni',
      userType: 'writer',
      graduationYear: 2022,
      branch: 'Computer Science',
      currentCompany: 'Test Company',
      designation: 'Software Engineer',
      linkedinProfile: 'https://linkedin.com/in/testuser'
    });

    await user.save();
    console.log('Test user created successfully:', user._id);
    return user;
  } catch (error) {
    console.error('Error creating user:', error);
    throw error;
  }
}

createUser().then(() => {
  console.log('User creation completed');
  process.exit(0);
}).catch((error) => {
  console.error('Failed to create user:', error);
  process.exit(1);
}); 