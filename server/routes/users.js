const express = require('express');
const { query, validationResult } = require('express-validator');
const User = require('../models/User');
const { auth, requireAdmin } = require('../middleware/auth');

const router = express.Router();

// @route   GET /api/users
// @desc    Get all users with filters (Admin only)
// @access  Private (Admin only)
router.get('/', auth, requireAdmin, [
  query('role').optional().isIn(['alumni', 'student', 'admin']).withMessage('Invalid role'),
  query('branch').optional().isIn(['Computer Science', 'Information Technology', 'Electronics', 'Mechanical', 'Civil', 'Chemical', 'Other']).withMessage('Invalid branch'),
  query('graduationYear').optional().isInt({ min: 2000, max: new Date().getFullYear() + 5 }).withMessage('Invalid graduation year'),
  query('page').optional().isInt({ min: 1 }).withMessage('Page must be a positive integer'),
  query('limit').optional().isInt({ min: 1, max: 50 }).withMessage('Limit must be between 1 and 50')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { role, branch, graduationYear, page = 1, limit = 10 } = req.query;
    const skip = (page - 1) * limit;

    // Build filter object
    const filter = { isActive: true };
    if (role) filter.role = role;
    if (branch) filter.branch = branch;
    if (graduationYear) filter.graduationYear = parseInt(graduationYear);

    const users = await User.find(filter)
      .select('-password')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    const total = await User.countDocuments(filter);

    res.json({
      users,
      pagination: {
        currentPage: parseInt(page),
        totalPages: Math.ceil(total / limit),
        totalItems: total,
        itemsPerPage: parseInt(limit)
      }
    });
  } catch (error) {
    console.error('Get users error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   GET /api/users/:id
// @desc    Get user by ID
// @access  Public
router.get('/:id', async (req, res) => {
  try {
    const user = await User.findById(req.params.id).select('-password');
    
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    if (!user.isActive) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.json({ user });
  } catch (error) {
    console.error('Get user error:', error);
    if (error.kind === 'ObjectId') {
      return res.status(404).json({ message: 'User not found' });
    }
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   PUT /api/users/:id/verify
// @desc    Verify user (Admin only)
// @access  Private (Admin only)
router.put('/:id/verify', auth, requireAdmin, async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    user.isVerified = true;
    await user.save();

    res.json({
      message: 'User verified successfully',
      user: user.getPublicProfile()
    });
  } catch (error) {
    console.error('Verify user error:', error);
    if (error.kind === 'ObjectId') {
      return res.status(404).json({ message: 'User not found' });
    }
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   PUT /api/users/:id/deactivate
// @desc    Deactivate user (Admin only)
// @access  Private (Admin only)
router.put('/:id/deactivate', auth, requireAdmin, async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    user.isActive = false;
    await user.save();

    res.json({
      message: 'User deactivated successfully'
    });
  } catch (error) {
    console.error('Deactivate user error:', error);
    if (error.kind === 'ObjectId') {
      return res.status(404).json({ message: 'User not found' });
    }
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   PUT /api/users/:id/activate
// @desc    Activate user (Admin only)
// @access  Private (Admin only)
router.put('/:id/activate', auth, requireAdmin, async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    user.isActive = true;
    await user.save();

    res.json({
      message: 'User activated successfully',
      user: user.getPublicProfile()
    });
  } catch (error) {
    console.error('Activate user error:', error);
    if (error.kind === 'ObjectId') {
      return res.status(404).json({ message: 'User not found' });
    }
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   GET /api/users/stats/overview
// @desc    Get user statistics
// @access  Public
router.get('/stats/overview', async (req, res) => {
  try {
    const totalUsers = await User.countDocuments({ isActive: true });
    const verifiedUsers = await User.countDocuments({ isActive: true, isVerified: true });
    
    const roleStats = await User.aggregate([
      { $match: { isActive: true } },
      { $group: { _id: '$role', count: { $sum: 1 } } },
      { $sort: { count: -1 } }
    ]);

    const branchStats = await User.aggregate([
      { $match: { isActive: true } },
      { $group: { _id: '$branch', count: { $sum: 1 } } },
      { $sort: { count: -1 } }
    ]);

    const yearStats = await User.aggregate([
      { $match: { isActive: true } },
      { $group: { _id: '$graduationYear', count: { $sum: 1 } } },
      { $sort: { _id: -1 } },
      { $limit: 5 }
    ]);

    const recentAlumni = await User.find({ 
      isActive: true, 
      role: 'alumni' 
    })
    .select('name graduationYear branch currentCompany designation')
    .sort({ createdAt: -1 })
    .limit(5);

    res.json({
      totalUsers,
      verifiedUsers,
      verificationRate: totalUsers > 0 ? Math.round((verifiedUsers / totalUsers) * 100) : 0,
      roleStats,
      branchStats,
      yearStats,
      recentAlumni
    });
  } catch (error) {
    console.error('Get user stats error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router; 