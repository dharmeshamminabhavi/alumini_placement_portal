import React from 'react';
import { Link } from 'react-router-dom';
import { useQuery } from 'react-query';
import { useAuth } from '../contexts/AuthContext';
import { reviewsAPI } from '../services/api';
import { 
  FaStar, 
  FaPlus, 
  FaEdit,
  FaEye,
  FaChartLine
} from 'react-icons/fa';

const Dashboard = () => {
  const { user } = useAuth();

  const { data: userReviews } = useQuery(
    ['userReviews', user?._id],
    () => reviewsAPI.getAll({ author: user?._id, limit: 5 }),
    { enabled: !!user?._id }
  );

  const { data: stats } = useQuery('dashboardStats', async () => {
    const reviews = await reviewsAPI.getAll({ limit: 1 });
    return { reviews };
  });

  const quickActions = [
    {
      title: 'Add Review',
      description: 'Share your experience about a company',
      icon: FaStar,
      href: '/reviews/new',
      color: 'bg-blue-500',
      enabled: true // Enable for all users
    },
    {
      title: 'View Reviews',
      description: 'Read reviews from other alumni',
      icon: FaEye,
      href: '/reviews',
      color: 'bg-orange-500',
      enabled: true
    }
  ];

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Welcome Section */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">
            Welcome back, {user?.name}! 👋
          </h1>
          <p className="mt-2 text-gray-600">
            Here's what's happening in your alumni community
          </p>
        </div>

        {/* Stats Overview */}
        {stats && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
            <div className="card p-6">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <FaStar className="h-8 w-8 text-yellow-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-500">Total Reviews</p>
                  <p className="text-2xl font-semibold text-gray-900">
                    {stats.reviews?.pagination?.totalItems || 0}
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Quick Actions */}
        <div className="mb-8">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Quick Actions</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {quickActions.map((action, index) => (
              <Link
                key={index}
                to={action.enabled ? action.href : '#'}
                className={`card p-6 hover:shadow-lg transition-shadow ${
                  !action.enabled ? 'opacity-50 cursor-not-allowed' : ''
                }`}
                onClick={(e) => !action.enabled && e.preventDefault()}
              >
                <div className="flex items-center">
                  <div className={`flex-shrink-0 p-3 rounded-lg ${action.color}`}>
                    <action.icon className="h-6 w-6 text-white" />
                  </div>
                  <div className="ml-4">
                    <h3 className="text-lg font-medium text-gray-900">{action.title}</h3>
                    <p className="text-sm text-gray-500">{action.description}</p>
                  </div>
                </div>
              </Link>
            ))}
                    </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-1 gap-8">
          {/* User Reviews */}
          <div className="card">
            <div className="card-header">
                             <div className="flex items-center justify-between">
                 <h3 className="text-lg font-medium text-gray-900">Your Reviews</h3>
                 <Link
                   to="/reviews/new"
                   className="btn-primary text-sm"
                 >
                   <FaPlus className="mr-2" />
                   Add Review
                 </Link>
               </div>
            </div>
            <div className="card-body">
              {userReviews?.reviews?.length > 0 ? (
                <div className="space-y-4">
                  {userReviews.reviews.map((review) => (
                    <div key={review._id} className="border-b border-gray-200 pb-4 last:border-b-0">
                      <div className="flex items-center justify-between">
                        <div>
                          <h4 className="font-medium text-gray-900">{review.title}</h4>
                          <p className="text-sm text-gray-500">
                            {review.company?.name} • {new Date(review.createdAt).toLocaleDateString()}
                          </p>
                          <div className="flex items-center mt-1">
                            <div className="flex items-center">
                              {[...Array(5)].map((_, i) => (
                                <FaStar
                                  key={i}
                                  className={`h-4 w-4 ${
                                    i < review.overallRating ? 'text-yellow-400' : 'text-gray-300'
                                  }`}
                                />
                              ))}
                            </div>
                            <span className="ml-2 text-sm text-gray-500">
                              {review.overallRating}/5
                            </span>
                          </div>
                        </div>
                        <Link
                          to={`/reviews/${review._id}`}
                          className="btn-secondary text-sm"
                        >
                          <FaEye className="mr-1" />
                          View
                        </Link>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <FaStar className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                                     <p className="text-gray-500">
                     You haven't written any reviews yet. Share your experience!
                   </p>
                   <Link to="/reviews/new" className="btn-primary mt-4">
                     Write Your First Review
                   </Link>
                </div>
              )}
            </div>
          </div>


        </div>


      </div>
    </div>
  );
};

export default Dashboard; 