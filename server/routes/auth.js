const express = require('express');
const jwt = require('jsonwebtoken');
const { body, validationResult } = require('express-validator');
const User = require('../models/User');
const Company = require('../models/Company');
const Review = require('../models/Review');
const { auth } = require('../middleware/auth');

const router = express.Router();

// Generate JWT Token
const generateToken = (userId) => {
  return jwt.sign({ userId }, process.env.JWT_SECRET || 'your-secret-key', {
    expiresIn: '7d'
  });
};

// Custom validation for @a.com emails
const validateAComEmail = (value) => {
  const emailRegex = /^[A-Z0-9._%+-]+@a\.com$/i;
  if (!emailRegex.test(value)) {
    throw new Error('Only @a.com email addresses are allowed');
  }
  return true;
};

// @route   POST /api/auth/register
// @desc    Register a new user
// @access  Public
router.post('/register', [
  body('name').trim().isLength({ min: 2 }).withMessage('Name must be at least 2 characters long'),
  body('email').isEmail().normalizeEmail().custom(validateAComEmail).withMessage('Only @a.com email addresses are allowed'),
  body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters long'),
  body('graduationYear').isInt({ min: 2000, max: new Date().getFullYear() + 5 }).withMessage('Invalid graduation year'),
  body('branch').isIn(['Computer Science', 'Information Technology', 'Electronics', 'Mechanical', 'Civil', 'Chemical', 'Other']).withMessage('Invalid branch'),
  body('linkedinProfile').optional().isURL().withMessage('Please provide a valid LinkedIn profile URL')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { name, email, password, graduationYear, branch, linkedinProfile } = req.body;

    // Check if user already exists
    let user = await User.findOne({ email });
    if (user) {
      return res.status(400).json({ message: 'User already exists' });
    }

    // Create new user
    user = new User({
      name,
      email,
      password,
      graduationYear,
      branch,
      linkedinProfile,
      role: 'student' // Default role
    });

    await user.save();

    // Generate token
    const token = generateToken(user._id);

    res.status(201).json({
      message: 'User registered successfully',
      token,
      user: user.getPublicProfile()
    });
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Helper function to update company statistics
async function updateCompanyStats(companyId) {
  try {
    const reviews = await Review.find({ company: companyId, isActive: true });
    
    if (reviews.length === 0) return;

    const totalRating = reviews.reduce((sum, review) => sum + review.overallRating, 0);
    const averageRating = totalRating / reviews.length;

    await Company.findByIdAndUpdate(companyId, {
      averageRating: Math.round(averageRating * 10) / 10,
      reviewCount: reviews.length
    });
  } catch (error) {
    console.error('Update company stats error:', error);
  }
}

// @route   POST /api/auth/login
// @desc    Login user
// @access  Public
router.post('/login', [
  body('email').isEmail().normalizeEmail().custom(validateAComEmail).withMessage('Only @a.com email addresses are allowed'),
  body('password').exists().withMessage('Password is required')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { email, password } = req.body;

    // Check if user exists
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ message: 'Invalid credentials' });
    }

    // Check password
    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(400).json({ message: 'Invalid credentials' });
    }

    // Check if account is active
    if (!user.isActive) {
      return res.status(400).json({ message: 'Account is deactivated' });
    }

    // Generate token
    const token = generateToken(user._id);

    res.json({
      message: 'Login successful',
      token,
      user: user.getPublicProfile()
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   GET /api/auth/me
// @desc    Get current user profile
// @access  Private
router.get('/me', auth, async (req, res) => {
  try {
    res.json({ user: req.user });
  } catch (error) {
    console.error('Get profile error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   PUT /api/auth/profile
// @desc    Update user profile
// @access  Private
router.put('/profile', auth, [
  body('name').optional().trim().isLength({ min: 2 }).withMessage('Name must be at least 2 characters long'),
  body('currentCompany').optional().trim(),
  body('designation').optional().trim(),
  body('location').optional().trim(),
  body('linkedinProfile').optional().trim().isURL().withMessage('Please provide a valid LinkedIn URL')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { name, currentCompany, designation, location, linkedinProfile } = req.body;

    const updateFields = {};
    if (name) updateFields.name = name;
    if (currentCompany) updateFields.currentCompany = currentCompany;
    if (designation) updateFields.designation = designation;
    if (location) updateFields.location = location;
    if (linkedinProfile) updateFields.linkedinProfile = linkedinProfile;

    const user = await User.findByIdAndUpdate(
      req.user._id,
      { $set: updateFields },
      { new: true, runValidators: true }
    ).select('-password');

    res.json({
      message: 'Profile updated successfully',
      user
    });
  } catch (error) {
    console.error('Update profile error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   PUT /api/auth/change-password
// @desc    Change user password
// @access  Private
router.put('/change-password', auth, [
  body('currentPassword').exists().withMessage('Current password is required'),
  body('newPassword').isLength({ min: 6 }).withMessage('New password must be at least 6 characters long')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { currentPassword, newPassword } = req.body;

    // Get user with password
    const user = await User.findById(req.user._id);
    
    // Check current password
    const isMatch = await user.comparePassword(currentPassword);
    if (!isMatch) {
      return res.status(400).json({ message: 'Current password is incorrect' });
    }

    // Update password
    user.password = newPassword;
    await user.save();

    res.json({ message: 'Password changed successfully' });
  } catch (error) {
    console.error('Change password error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   PUT /api/auth/update-profile
// @desc    Update user profile after registration
// @access  Private
router.put('/update-profile', auth, [
  body('role').optional().isIn(['student', 'alumni']).withMessage('Invalid role'),
  body('userType').optional().isIn(['reader', 'writer']).withMessage('Invalid user type'),
  body('companyName').optional().trim().isLength({ min: 2 }).withMessage('Company name must be at least 2 characters long'),
  body('location').optional().trim().isLength({ min: 2 }).withMessage('Location must be at least 2 characters long'),
  body('joinYear').optional().isInt({ min: 2000, max: new Date().getFullYear() }).withMessage('Invalid join year'),
  body('salary').optional().isFloat({ min: 0 }).withMessage('Salary must be a positive number'),
  body('review').optional().trim().isLength({ min: 50 }).withMessage('Review must be at least 50 characters long')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { role, userType, companyName, location, joinYear, salary, review } = req.body;

    // Update user profile
    const updateData = {};
    if (role) updateData.role = role;
    if (userType) updateData.userType = userType;

    const user = await User.findByIdAndUpdate(
      req.user._id,
      updateData,
      { new: true }
    );

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.json({
      message: 'Profile updated successfully',
      user: user.getPublicProfile()
    });
  } catch (error) {
    console.error('Update profile error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   POST /api/auth/create-initial-review
// @desc    Create initial review for new writer
// @access  Private
router.post('/create-initial-review', auth, [
  body('companyName').trim().isLength({ min: 2 }).withMessage('Company name must be at least 2 characters long'),
  body('location').trim().isLength({ min: 2 }).withMessage('Location must be at least 2 characters long'),
  body('joinYear').isInt({ min: 2000, max: new Date().getFullYear() }).withMessage('Invalid join year'),
  body('salary').isFloat({ min: 0 }).withMessage('Salary must be a positive number'),
  body('review').trim().isLength({ min: 50 }).withMessage('Review must be at least 50 characters long'),
  body('workCulture').isInt({ min: 1, max: 5 }).withMessage('Work culture rating must be between 1 and 5'),
  body('workLifeBalance').isInt({ min: 1, max: 5 }).withMessage('Work-life balance rating must be between 1 and 5'),
  body('careerGrowth').isInt({ min: 1, max: 5 }).withMessage('Career growth rating must be between 1 and 5'),
  body('compensation').isInt({ min: 1, max: 5 }).withMessage('Compensation rating must be between 1 and 5'),
  body('management').isInt({ min: 1, max: 5 }).withMessage('Management rating must be between 1 and 5')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { companyName, location, joinYear, salary, review, workCulture, workLifeBalance, careerGrowth, compensation, management } = req.body;

    // Check if company exists, if not create it
    let company = await Company.findOne({ 
      name: { $regex: new RegExp(companyName, 'i') },
      location: { $regex: new RegExp(location, 'i') }
    });

    if (!company) {
      company = new Company({
        name: companyName,
        industry: 'Technology', // Default industry
        location: location,
        website: '',
        description: '',
        logo: '',
        isActive: true
      });
      await company.save();
    }

    // Check if user already reviewed this company
    const existingReview = await Review.findOne({
      author: req.user._id,
      company: company._id,
      isActive: true
    });

    if (existingReview) {
      return res.status(400).json({ message: 'You have already reviewed this company' });
    }

    // Create review
    const newReview = new Review({
      author: req.user._id,
      company: company._id,
      title: `Review of ${companyName}`,
      content: review,
      overallRating: Math.round((workCulture + workLifeBalance + careerGrowth + compensation + management) / 5), // Calculate average of all ratings
      workCulture: workCulture,
      workLifeBalance: workLifeBalance,
      careerGrowth: careerGrowth,
      compensation: compensation,
      management: management,
      pros: [],
      cons: [],
      recommendations: 'Yes',
      isAnonymous: false,
      isActive: true
    });

    await newReview.save();

    // Update company statistics
    await updateCompanyStats(company._id);

    res.status(201).json({
      message: 'Initial review created successfully',
      review: newReview
    });
  } catch (error) {
    console.error('Create initial review error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router; 