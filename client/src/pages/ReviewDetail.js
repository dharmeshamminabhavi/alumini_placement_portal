import React from 'react';
import { useParams, Link } from 'react-router-dom';
import { useQuery } from 'react-query';
import { reviewsAPI } from '../services/api';
import { useAuth } from '../contexts/AuthContext';
import { 
  FaStar, 
  FaBuilding, 
  FaMapMarkerAlt, 
  FaCalendarAlt, 
  FaUser,
  FaArrowLeft,
  FaExclamationTriangle,
  FaThumbsUp,
  FaThumbsDown,
  FaCheck,
  FaTimes,
  FaIndustry,
  FaMoneyBillWave,
  FaUserGraduate
} from 'react-icons/fa';

const ReviewDetail = () => {
  const { id } = useParams();
  const { user } = useAuth();

  const { data: reviewData, isLoading, error } = useQuery(
    ['review', id],
    () => reviewsAPI.getById(id)
  );

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto"></div>
            <p className="mt-4 text-gray-600">Loading review details...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error || !reviewData?.success) {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <FaExclamationTriangle className="h-12 w-12 text-red-500 mx-auto mb-4" />
            <h1 className="text-2xl font-bold text-gray-900 mb-4">Error Loading Review</h1>
            <p className="text-gray-600 mb-4">
              {error?.message || reviewData?.error || 'Failed to load review details'}
            </p>
            <Link to="/reviews" className="btn-primary inline-flex items-center">
              <FaArrowLeft className="mr-2" />
              Back to Reviews
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const review = reviewData.review;

  if (!review) {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h1 className="text-3xl font-bold text-gray-900 mb-4">Review Not Found</h1>
            <p className="text-gray-600">The review you're looking for doesn't exist.</p>
            <Link to="/reviews" className="btn-primary mt-4 inline-flex items-center">
              <FaArrowLeft className="mr-2" />
              Back to Reviews
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const renderStars = (rating) => {
    return Array.from({ length: 5 }, (_, i) => (
      <FaStar
        key={i}
        className={`h-5 w-5 ${i < rating ? 'text-yellow-400' : 'text-gray-300'}`}
      />
    ));
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <Link to="/reviews" className="inline-flex items-center text-primary-600 hover:text-primary-500 mb-4">
            <FaArrowLeft className="mr-2" />
            Back to Reviews
          </Link>
          
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-start justify-between mb-4">
              <div>
                <h1 className="text-2xl font-bold text-gray-900 mb-2">{review.title}</h1>
                <div className="flex items-center text-gray-600 mb-2">
                  <FaBuilding className="mr-2" />
                  <span className="font-medium">{review.company?.name}</span>
                  {review.company?.location && (
                    <>
                      <FaMapMarkerAlt className="ml-4 mr-2" />
                      <span>{review.company.location}</span>
                    </>
                  )}
                </div>
                <div className="flex items-center text-gray-500 text-sm">
                  <FaCalendarAlt className="mr-2" />
                  <span>Posted on {formatDate(review.createdAt)}</span>
                </div>
              </div>
              
              <div className="text-right">
                <div className="flex items-center mb-2">
                  {renderStars(review.overallRating)}
                  <span className="ml-2 text-lg font-semibold text-gray-900">
                    {review.overallRating}/5
                  </span>
                </div>
                <div className="text-sm text-gray-500">
                  Overall Rating
                </div>
              </div>
            </div>

            {/* Author Information */}
            <div className="border-t border-gray-200 pt-4 mb-6">
              <div className="flex items-center">
                <div className="bg-primary-100 rounded-full p-2 mr-3">
                  <FaUserGraduate className="h-5 w-5 text-primary-600" />
                </div>
                <div>
                  <div className="font-medium text-gray-900">
                    {review.isAnonymous ? 'Anonymous User' : review.author?.name || 'Unknown User'}
                  </div>
                  {!review.isAnonymous && review.author && (
                    <div className="text-sm text-gray-500">
                      {review.author.graduationYear && `${review.author.graduationYear} Graduate`}
                      {review.author.branch && ` • ${review.author.branch}`}
                      {review.author.currentCompany && ` • ${review.author.currentCompany}`}
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Detailed Ratings */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
              <div className="bg-gray-50 rounded-lg p-4">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium text-gray-700">Work Culture</span>
                  <div className="flex items-center">
                    {renderStars(review.workCulture)}
                    <span className="ml-1 text-sm font-medium">{review.workCulture}/5</span>
                  </div>
                </div>
              </div>
              
              <div className="bg-gray-50 rounded-lg p-4">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium text-gray-700">Work-Life Balance</span>
                  <div className="flex items-center">
                    {renderStars(review.workLifeBalance)}
                    <span className="ml-1 text-sm font-medium">{review.workLifeBalance}/5</span>
                  </div>
                </div>
              </div>
              
              <div className="bg-gray-50 rounded-lg p-4">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium text-gray-700">Career Growth</span>
                  <div className="flex items-center">
                    {renderStars(review.careerGrowth)}
                    <span className="ml-1 text-sm font-medium">{review.careerGrowth}/5</span>
                  </div>
                </div>
              </div>
              
              <div className="bg-gray-50 rounded-lg p-4">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium text-gray-700">Compensation</span>
                  <div className="flex items-center">
                    {renderStars(review.compensation)}
                    <span className="ml-1 text-sm font-medium">{review.compensation}/5</span>
                  </div>
                </div>
              </div>
              
              <div className="bg-gray-50 rounded-lg p-4">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium text-gray-700">Management</span>
                  <div className="flex items-center">
                    {renderStars(review.management)}
                    <span className="ml-1 text-sm font-medium">{review.management}/5</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Review Content */}
            <div className="mb-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-3">Review</h3>
              <div className="bg-gray-50 rounded-lg p-4">
                <p className="text-gray-700 leading-relaxed whitespace-pre-wrap">
                  {review.content}
                </p>
              </div>
            </div>

            {/* Pros and Cons */}
            {(review.pros?.length > 0 || review.cons?.length > 0) && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                {review.pros?.length > 0 && (
                  <div>
                    <h3 className="text-lg font-semibold text-green-700 mb-3 flex items-center">
                      <FaCheck className="mr-2" />
                      Pros
                    </h3>
                    <ul className="space-y-2">
                      {review.pros.map((pro, index) => (
                        <li key={index} className="flex items-start">
                          <FaCheck className="h-4 w-4 text-green-500 mr-2 mt-0.5 flex-shrink-0" />
                          <span className="text-gray-700">{pro}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
                
                {review.cons?.length > 0 && (
                  <div>
                    <h3 className="text-lg font-semibold text-red-700 mb-3 flex items-center">
                      <FaTimes className="mr-2" />
                      Cons
                    </h3>
                    <ul className="space-y-2">
                      {review.cons.map((con, index) => (
                        <li key={index} className="flex items-start">
                          <FaTimes className="h-4 w-4 text-red-500 mr-2 mt-0.5 flex-shrink-0" />
                          <span className="text-gray-700">{con}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            )}

            {/* Recommendation */}
            <div className="border-t border-gray-200 pt-4">
              <div className="flex items-center justify-between">
                <span className="text-lg font-semibold text-gray-900">Would you recommend this company?</span>
                <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                  review.recommendations === 'Yes' 
                    ? 'bg-green-100 text-green-800' 
                    : review.recommendations === 'No'
                    ? 'bg-red-100 text-red-800'
                    : 'bg-yellow-100 text-yellow-800'
                }`}>
                  {review.recommendations}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ReviewDetail; 