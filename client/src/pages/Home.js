import React from 'react';
import { Link, Navigate } from 'react-router-dom';
import { useQuery } from 'react-query';
import { useAuth } from '../contexts/AuthContext';
import { reviewsAPI } from '../services/api';
import { 
  FaStar, 
  FaUsers, 
  FaChartLine,
  FaSearch,
  FaHandshake,
  FaLightbulb
} from 'react-icons/fa';

const Home = () => {
  const { isAuthenticated, loading } = useAuth();

  // Always call hooks before any conditional returns
  const { data: stats } = useQuery('homeStats', async () => {
    const reviews = await reviewsAPI.getAll({ limit: 1 });
    return { reviews };
  });

  // Redirect authenticated users to dashboard
  if (!loading && isAuthenticated) {
    return <Navigate to="/dashboard" replace />;
  }

  const features = [
    {
      icon: FaSearch,
      title: 'Discover Companies',
      description: 'Explore companies with detailed information, ratings, and placement statistics.'
    },
    {
      icon: FaStar,
      title: 'Read Reviews',
      description: 'Get authentic reviews from alumni about their work experience and company culture.'
    },
    {
      icon: FaHandshake,
      title: 'Connect with Alumni',
      description: 'Network with alumni and get insights about career opportunities.'
    }
  ];

  const benefits = [
    {
      icon: FaLightbulb,
      title: 'Make Informed Decisions',
      description: 'Get real insights from alumni to make better career choices.'
    },
    {
      icon: FaChartLine,
      title: 'Track Career Growth',
      description: 'Understand career progression and growth opportunities in different companies.'
    },
    {
      icon: FaUsers,
      title: 'Build Network',
      description: 'Connect with alumni and expand your professional network.'
    }
  ];

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="bg-gradient-to-r from-primary-600 to-primary-800 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24">
          <div className="text-center">
            <h1 className="text-4xl md:text-6xl font-bold mb-6 text-shadow-lg">
              Alumni Placement Portal
            </h1>
            <p className="text-xl md:text-2xl mb-8 text-primary-100 max-w-3xl mx-auto">
              Connect with alumni and get real insights about companies. 
              Share your placement experiences and help juniors make informed career decisions.
            </p>
            <p className="text-lg mb-8 text-primary-200 max-w-2xl mx-auto">
              <strong>Note:</strong> Only @a.com email addresses are allowed for registration and login.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                to="/register"
                className="btn bg-white text-primary-600 hover:bg-gray-100 px-8 py-3 text-lg font-semibold"
              >
                Get Started
              </Link>

            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      {stats && (
        <section className="py-16 bg-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-1 md:grid-cols-1 gap-8">
              <div className="text-center">
                <div className="text-4xl font-bold text-primary-600 mb-2">
                  {stats.reviews?.pagination?.totalItems || 0}
                </div>
                <div className="text-gray-600">Reviews</div>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* Features Section */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              Everything You Need to Know
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Our platform provides comprehensive insights to help you make informed career decisions.
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((feature, index) => (
              <div key={index} className="card text-center p-6">
                <div className="inline-flex items-center justify-center w-16 h-16 bg-primary-100 text-primary-600 rounded-full mb-4">
                  <feature.icon className="h-8 w-8" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">
                  {feature.title}
                </h3>
                <p className="text-gray-600">
                  {feature.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Benefits Section */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              Why Choose Our Platform?
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Join thousands of students and alumni who trust our platform for career insights.
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {benefits.map((benefit, index) => (
              <div key={index} className="text-center">
                <div className="inline-flex items-center justify-center w-16 h-16 bg-green-100 text-green-600 rounded-full mb-4">
                  <benefit.icon className="h-8 w-8" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">
                  {benefit.title}
                </h3>
                <p className="text-gray-600">
                  {benefit.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 bg-primary-600 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl font-bold mb-4">
            Ready to Get Started?
          </h2>
          <p className="text-xl mb-8 text-primary-100">
            Join our community and start sharing your experiences or exploring opportunities.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              to="/register"
              className="btn bg-white text-primary-600 hover:bg-gray-100 px-8 py-3 text-lg font-semibold"
            >
              Join Now
            </Link>

          </div>
        </div>
      </section>
    </div>
  );
};

export default Home; 