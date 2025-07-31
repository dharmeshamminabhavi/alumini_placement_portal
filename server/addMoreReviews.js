const mongoose = require('mongoose');
const Company = require('./models/Company');
const Review = require('./models/Review');
const User = require('./models/User');

// Connect to MongoDB
mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/placement-portal', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

const additionalReviews = [
  {
    title: 'Excellent learning environment',
    content: 'This company provides an excellent learning environment with great mentorship opportunities. The team is very supportive and there are many chances to work on cutting-edge technologies. The work culture is collaborative and the management is very approachable.',
    overallRating: 5,
    workCulture: 5,
    workLifeBalance: 4,
    careerGrowth: 5,
    compensation: 4,
    management: 5,
    pros: ['Great learning opportunities', 'Supportive team', 'Good mentorship', 'Cutting-edge tech', 'Collaborative culture'],
    cons: ['Sometimes long hours', 'High expectations'],
    recommendations: 'Yes',
    isAnonymous: false,
    linkedinProfile: 'https://linkedin.com/in/alice-developer'
  },
  {
    title: 'Fast-paced and exciting',
    content: 'The work is fast-paced and exciting. There are always new challenges to tackle and the company is constantly innovating. The compensation is competitive and the benefits are excellent. The work-life balance could be better, but the experience is worth it.',
    overallRating: 4,
    workCulture: 4,
    workLifeBalance: 3,
    careerGrowth: 5,
    compensation: 5,
    management: 4,
    pros: ['Exciting work', 'Competitive salary', 'Great benefits', 'Innovation focus', 'Career growth'],
    cons: ['Work-life balance', 'High pressure'],
    recommendations: 'Yes',
    isAnonymous: false,
    linkedinProfile: 'https://linkedin.com/in/bob-engineer'
  },
  {
    title: 'Good company with room for improvement',
    content: 'Overall, this is a good company to work for. The work is interesting and the team is talented. However, there are some areas that could be improved, particularly in terms of work-life balance and communication from management.',
    overallRating: 3,
    workCulture: 3,
    workLifeBalance: 2,
    careerGrowth: 4,
    compensation: 3,
    management: 2,
    pros: ['Interesting work', 'Talented team', 'Good projects'],
    cons: ['Poor work-life balance', 'Communication issues', 'Management problems'],
    recommendations: 'Maybe',
    isAnonymous: false,
    linkedinProfile: 'https://linkedin.com/in/carol-tech'
  }
];

async function addMoreReviews() {
  try {
    console.log('Starting to add more reviews...');

    // Get existing companies
    const companies = await Company.find({});
    if (companies.length === 0) {
      console.log('No companies found. Please run seed.js first.');
      return;
    }

    // Get existing users
    const users = await User.find({});
    if (users.length === 0) {
      console.log('No users found. Please create users first.');
      return;
    }

    // Add reviews for each company
    for (const company of companies) {
      for (const reviewData of additionalReviews) {
        const review = new Review({
          ...reviewData,
          author: users[0]._id, // Use the first user
          company: company._id
        });
        await review.save();
        console.log(`Added review "${review.title}" for ${company.name}`);
      }
    }

    console.log('Additional reviews added successfully!');
    process.exit(0);
  } catch (error) {
    console.error('Error adding reviews:', error);
    process.exit(1);
  }
}

addMoreReviews(); 