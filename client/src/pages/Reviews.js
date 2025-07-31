import React from 'react';
import { Link } from 'react-router-dom';
import { useQuery, useQueryClient } from 'react-query';
import { companiesAPI, reviewsAPI } from '../services/api';
import { FaBuilding, FaStar, FaMapMarkerAlt, FaEye } from 'react-icons/fa';

const Reviews = () => {
  const queryClient = useQueryClient();

  // Clear cache on component mount to ensure fresh data
  React.useEffect(() => {
    queryClient.invalidateQueries('companies');
    queryClient.invalidateQueries('reviews');
  }, [queryClient]);

  const { data: companiesData, isLoading: companiesLoading, error: companiesError } = useQuery(
    'companies',
    () => companiesAPI.getAll(),
    {
      staleTime: 0, // Always fetch fresh data
      cacheTime: 0  // Don't cache
    }
  );

  const { data: reviewsData, isLoading: reviewsLoading, error: reviewsError } = useQuery(
    'reviews',
    () => reviewsAPI.getAll(),
    {
      staleTime: 0, // Always fetch fresh data
      cacheTime: 0  // Don't cache
    }
  );

  // Debug logging
  console.log('Companies Data:', companiesData);
  console.log('Reviews Data:', reviewsData);

  // Check if API calls were successful
  if (companiesData && !companiesData.success) {
    console.error('Companies API error:', companiesData.error);
  }
  if (reviewsData && !reviewsData.success) {
    console.error('Reviews API error:', reviewsData.error);
  }

  // Get review count for each company
  const getReviewCount = (companyId) => {
    return reviewsData?.reviews?.filter(review => review.company._id === companyId).length || 0;
  };

  // Get average rating for each company
  const getAverageRating = (companyId) => {
    const companyReviews = reviewsData?.reviews?.filter(review => review.company._id === companyId) || [];
    if (companyReviews.length === 0) return 0;
    const totalRating = companyReviews.reduce((sum, review) => sum + review.overallRating, 0);
    return Math.round((totalRating / companyReviews.length) * 10) / 10;
  };

  // Show companies with reviews, or all companies if no reviews exist
  const companiesWithReviews = companiesData?.companies?.filter(company => {
    const reviewCount = getReviewCount(company._id);
    return reviewCount > 0;
  }) || [];
  
  const allCompanies = companiesData?.companies || [];
  const filteredCompanies = companiesWithReviews.length > 0 ? companiesWithReviews : allCompanies;

  if (companiesLoading || reviewsLoading) {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto"></div>
            <p className="mt-4 text-gray-600">Loading companies...</p>
          </div>
        </div>
      </div>
    );
  }

  if (companiesError || reviewsError) {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <div className="text-red-600 text-lg font-semibold mb-4">
              {companiesError ? 'Failed to load companies' : 'Failed to load reviews'}
            </div>
            <p className="text-gray-600 mb-4">
              {companiesError?.message || reviewsError?.message || 'Please try again later.'}
            </p>
            <button 
              onClick={() => window.location.reload()} 
              className="btn-primary"
            >
              Retry
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Company Reviews</h1>
          <p className="text-gray-600">Browse companies and read reviews from alumni</p>
        </div>



        {/* Companies Grid */}
        {filteredCompanies.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredCompanies.map((company) => {
              const reviewCount = getReviewCount(company._id);
              const averageRating = getAverageRating(company._id);
              
              return (
                <div key={company._id} className="card hover:shadow-lg transition-shadow">
                  <div className="p-6">
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex-1">
                        <h3 className="text-lg font-semibold text-gray-900 mb-1">
                          {company.name}
                        </h3>
                        <div className="flex items-center text-sm text-gray-500 mb-2">
                          <FaMapMarkerAlt className="mr-1" />
                          {company.location}
                        </div>
                        <div className="text-sm text-gray-600">
                          {company.industry}
                        </div>
                      </div>
                      {company.logo && (
                        <div className="ml-4">
                          <img 
                            src={company.logo} 
                            alt={company.name}
                            className="w-12 h-12 rounded object-cover"
                          />
                        </div>
                      )}
                    </div>

                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center">
                        <div className="flex items-center mr-2">
                          {[...Array(5)].map((_, i) => (
                            <FaStar
                              key={i}
                              className={`h-4 w-4 ${
                                i < Math.floor(averageRating) ? 'text-yellow-400' : 'text-gray-300'
                              }`}
                            />
                          ))}
                        </div>
                        <span className="text-sm text-gray-600">
                          {averageRating > 0 ? `${averageRating}/5` : 'No reviews yet'}
                        </span>
                      </div>
                      <div className="text-sm text-gray-500">
                        {reviewCount} review{reviewCount !== 1 ? 's' : ''}
                      </div>
                    </div>

                    <Link
                      to={`/companies/${company._id}`}
                      className="btn-primary w-full flex items-center justify-center"
                    >
                      <FaEye className="mr-2" />
                      {reviewCount > 0 ? 'View Reviews' : 'View Company'}
                    </Link>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="text-center py-12">
            <FaBuilding className="h-12 w-12 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No companies found</h3>
            <p className="text-gray-500">
              {companiesWithReviews.length === 0 && allCompanies.length > 0 
                ? "No companies have reviews yet. Companies will appear here once they receive reviews."
                : "No companies have been added to the system yet."
              }
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Reviews; 