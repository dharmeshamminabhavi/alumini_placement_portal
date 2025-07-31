const mongoose = require('mongoose');
const Company = require('./models/Company');
const Review = require('./models/Review');
const User = require('./models/User');

// Connect to MongoDB
mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/placement-portal', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

const sampleCompanies = [
  {
    name: 'Google',
    industry: 'Technology',
    location: 'Mountain View, CA',
    description: 'Google is a multinational technology company that specializes in Internet-related services and products.',
    website: 'https://google.com',
    companySize: '5000+',
    foundedYear: 1998,
    tags: ['AI', 'Search', 'Cloud']
  },
  {
    name: 'Microsoft',
    industry: 'Technology',
    location: 'Redmond, WA',
    description: 'Microsoft Corporation is an American multinational technology company.',
    website: 'https://microsoft.com',
    companySize: '5000+',
    foundedYear: 1975,
    tags: ['Software', 'Cloud', 'Gaming']
  },
  {
    name: 'Amazon',
    industry: 'Technology',
    location: 'Seattle, WA',
    description: 'Amazon.com, Inc. is an American multinational technology company focusing on e-commerce.',
    website: 'https://amazon.com',
    companySize: '5000+',
    foundedYear: 1994,
    tags: ['E-commerce', 'Cloud', 'AI']
  }
];

const sampleReviews = [
  {
    title: 'Great work culture and benefits',
    content: 'I had an amazing experience working at this company. The work culture is very supportive and the benefits are excellent. The team is collaborative and there are many opportunities for growth. The management is approachable and the work-life balance is well maintained. I would definitely recommend this company to anyone looking for a great work environment.',
    overallRating: 5,
    workCulture: 5,
    workLifeBalance: 4,
    careerGrowth: 5,
    compensation: 5,
    management: 4,
    pros: ['Great benefits', 'Supportive culture', 'Good work-life balance', 'Career growth opportunities', 'Excellent team collaboration'],
    cons: ['Sometimes long hours', 'High expectations'],
    recommendations: 'Yes',
    isAnonymous: false,
    linkedinProfile: 'https://linkedin.com/in/john-doe-software-engineer'
  },
  {
    title: 'Challenging but rewarding',
    content: 'The work is challenging but very rewarding. I learned a lot during my time here and the compensation is competitive. The management is supportive and there are clear career paths. The company invests in employee development and provides good learning opportunities. The work environment is fast-paced but manageable.',
    overallRating: 4,
    workCulture: 4,
    workLifeBalance: 3,
    careerGrowth: 5,
    compensation: 4,
    management: 4,
    pros: ['Competitive salary', 'Learning opportunities', 'Clear career path', 'Good team', 'Professional development'],
    cons: ['Work-life balance could be better', 'High pressure at times'],
    recommendations: 'Yes',
    isAnonymous: false,
    linkedinProfile: 'https://linkedin.com/in/jane-smith-tech-lead'
  }
];

async function seedData() {
  try {
    console.log('Starting to seed data...');

    // Clear existing data
    await Company.deleteMany({});
    await Review.deleteMany({});

    // Create companies
    const createdCompanies = [];
    for (const companyData of sampleCompanies) {
      const company = new Company(companyData);
      await company.save();
      createdCompanies.push(company);
      console.log(`Created company: ${company.name}`);
    }

    // Get a sample user (you'll need to create one first)
    const sampleUser = await User.findOne();
    if (!sampleUser) {
      console.log('No users found. Please create a user first.');
      return;
    }

    // Create reviews
    for (let i = 0; i < createdCompanies.length; i++) {
      const company = createdCompanies[i];
      for (let j = 0; j < sampleReviews.length; j++) {
        const reviewData = {
          ...sampleReviews[j],
          author: sampleUser._id,
          company: company._id
        };
        const review = new Review(reviewData);
        await review.save();
        console.log(`Created review for ${company.name}: ${review.title}`);
      }
    }

    console.log('Data seeding completed successfully!');
    process.exit(0);
  } catch (error) {
    console.error('Error seeding data:', error);
    process.exit(1);
  }
}

seedData(); 