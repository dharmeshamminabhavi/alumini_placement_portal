import React, { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useQuery } from 'react-query';
import { companiesAPI, reviewsAPI } from '../services/api';
import { useAuth } from '../contexts/AuthContext';
import { 
  FaBuilding, 
  FaStar, 
  FaMapMarkerAlt, 
  FaGlobe, 
  FaIndustry,
  FaEye,
  FaThumbsUp,
  FaUser,
  FaCalendarAlt,
  FaArrowLeft,
  FaExclamationTriangle,
  FaEnvelope,
  FaLinkedin,
  FaTimes,
  FaUserGraduate
} from 'react-icons/fa';

const CompanyDetail = () => {
  const { id } = useParams();
  const { user } = useAuth();
  const [contactModal, setContactModal] = useState({ isOpen: false, reviewer: null });

  const { data: companyData, isLoading: companyLoading, error: companyError } = useQuery(
    ['company', id],
    () => companiesAPI.getById(id)
  );

  const { data: reviewsData, isLoading: reviewsLoading, error: reviewsError } = useQuery(
    ['companyReviews', id],
    () => reviewsAPI.getAllForCompany(id)
  );

  if (companyLoading || reviewsLoading) {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto"></div>
            <p className="mt-4 text-gray-600">Loading company details...</p>
          </div>
        </div>
      </div>
    );
  }

  if (companyError || reviewsError) {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <FaExclamationTriangle className="h-12 w-12 text-red-500 mx-auto mb-4" />
            <h1 className="text-2xl font-bold text-gray-900 mb-4">Error Loading Data</h1>
            <p className="text-gray-600 mb-4">
              {companyError?.message || reviewsError?.message || 'Failed to load company or review data'}
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

  if (!companyData?.success || !companyData?.company) {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h1 className="text-3xl font-bold text-gray-900 mb-4">Company Not Found</h1>
            <p className="text-gray-600">The company you're looking for doesn't exist.</p>
            <Link to="/reviews" className="btn-primary mt-4 inline-flex items-center">
              <FaArrowLeft className="mr-2" />
              Back to Reviews
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const company = companyData.company;
  const reviews = reviewsData?.success ? reviewsData.reviews : [];
  const averageRating = company.averageRating || 0;
  const reviewCount = reviews.length;

  // Debug logging
  console.log('Company Data:', companyData);
  console.log('Reviews Data:', reviewsData);
  console.log('Reviews Array:', reviews);
  console.log('Review Count:', reviewCount);

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <Link to="/reviews" className="inline-flex items-center text-primary-600 hover:text-primary-500 mb-4">
            <FaArrowLeft className="mr-2" />
            Back to Reviews
          </Link>
          
          <div className="flex items-start justify-between">
            <div className="flex items-center">
              {company.logo && (
                <img 
                  src={company.logo} 
                  alt={company.name}
                  className="w-16 h-16 rounded-lg object-cover mr-4"
                />
              )}
              <div>
                <h1 className="text-3xl font-bold text-gray-900 mb-2">{company.name}</h1>
                <div className="flex items-center text-gray-600 mb-2">
                  <FaMapMarkerAlt className="mr-2" />
                  {company.location}
                </div>
                <div className="flex items-center text-gray-600 mb-4">
                  <FaIndustry className="mr-2" />
                  {company.industry}
                </div>
                <div className="flex items-center">
                  <div className="flex items-center mr-4">
                    {[...Array(5)].map((_, i) => (
                      <FaStar
                        key={i}
                        className={`h-5 w-5 ${
                          i < Math.floor(averageRating) ? 'text-yellow-400' : 'text-gray-300'
                        }`}
                      />
                    ))}
                  </div>
                  <span className="text-lg font-medium text-gray-900">
                    {averageRating > 0 ? `${averageRating}/5` : 'No reviews'}
                  </span>
                  <span className="ml-2 text-gray-500">
                    ({reviewCount} review{reviewCount !== 1 ? 's' : ''})
                  </span>
                </div>
              </div>
            </div>
            
            {user?.role === 'alumni' && (
              <Link
                to="/reviews/new"
                className="btn-primary flex items-center"
              >
                <FaStar className="mr-2" />
                Write Review
              </Link>
            )}
          </div>
        </div>

        {/* Company Information */}
        <div className="card mb-8">
          <div className="card-header">
            <h2 className="text-xl font-semibold text-gray-900">Company Information</h2>
          </div>
          <div className="card-body">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h3 className="font-medium text-gray-900 mb-2">About</h3>
                <p className="text-gray-600">
                  {company.description || 'This company has not provided a description yet. Check out the reviews below to learn more about working here.'}
                </p>
              </div>
              <div>
                <h3 className="font-medium text-gray-900 mb-2">Details</h3>
                <div className="space-y-2">
                  <div className="flex items-center text-gray-600">
                    <FaIndustry className="mr-2 w-4 h-4" />
                    <span>Industry: {company.industry}</span>
                  </div>
                  <div className="flex items-center text-gray-600">
                    <FaMapMarkerAlt className="mr-2 w-4 h-4" />
                    <span>Location: {company.location}</span>
                  </div>
                  {company.website && (
                    <div className="flex items-center text-gray-600">
                      <FaGlobe className="mr-2 w-4 h-4" />
                      <a 
                        href={company.website} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="text-primary-600 hover:text-primary-500"
                      >
                        {company.website}
                      </a>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Reviews Section */}
        <div className="card">
          <div className="card-header">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-semibold text-gray-900">Reviews</h2>
              <span className="text-gray-500">{reviewCount} review{reviewCount !== 1 ? 's' : ''}</span>
            </div>
          </div>
          <div className="card-body">
            {reviews.length > 0 ? (
              <div className="space-y-8">
                {reviews.map((review) => (
                  <div key={review._id} className="border-b border-gray-200 pb-8 last:border-b-0">
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex-1">
                        <div className="flex items-center mb-3">
                          <h3 className="text-xl font-semibold text-gray-900 mr-4">
                            {review.title}
                          </h3>
                          <div className="flex items-center">
                            {[...Array(5)].map((_, i) => (
                              <FaStar
                                key={i}
                                className={`h-5 w-5 ${
                                  i < review.overallRating ? 'text-yellow-400' : 'text-gray-300'
                                }`}
                              />
                            ))}
                            <span className="ml-2 text-lg font-medium text-gray-900">
                              {review.overallRating}/5
                            </span>
                          </div>
                        </div>
                        
                        <div className="flex items-center text-sm text-gray-500 mb-4">
                          <FaUser className="mr-2" />
                          <span className="font-medium">
                            {review.isAnonymous ? 'Anonymous User' : review.author?.name || 'Unknown User'}
                          </span>
                          <span className="mx-2">•</span>
                          <FaCalendarAlt className="mr-2" />
                          <span>
                            {new Date(review.createdAt).toLocaleDateString('en-US', {
                              year: 'numeric',
                              month: 'long',
                              day: 'numeric'
                            })}
                          </span>
                          {review.linkedinProfile && (
                            <>
                              <span className="mx-2">•</span>
                              <a
                                href={review.linkedinProfile}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="flex items-center text-primary-600 hover:text-primary-500"
                              >
                                <FaLinkedin className="mr-1" />
                                LinkedIn
                              </a>
                            </>
                          )}
                        </div>

                        {/* Detailed Ratings */}
                        <div className="bg-gray-50 rounded-lg p-4 mb-6">
                          <h4 className="font-medium text-gray-900 mb-3">Detailed Ratings</h4>
                          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                            <div className="flex items-center justify-between">
                              <span className="text-sm text-gray-600">Work Culture:</span>
                              <div className="flex items-center">
                                {[...Array(5)].map((_, i) => (
                                  <FaStar
                                    key={i}
                                    className={`h-3 w-3 ${
                                      i < review.workCulture ? 'text-yellow-400' : 'text-gray-300'
                                    }`}
                                  />
                                ))}
                                <span className="ml-2 text-sm font-medium">{review.workCulture}/5</span>
                              </div>
                            </div>
                            <div className="flex items-center justify-between">
                              <span className="text-sm text-gray-600">Work-Life Balance:</span>
                              <div className="flex items-center">
                                {[...Array(5)].map((_, i) => (
                                  <FaStar
                                    key={i}
                                    className={`h-3 w-3 ${
                                      i < review.workLifeBalance ? 'text-yellow-400' : 'text-gray-300'
                                    }`}
                                  />
                                ))}
                                <span className="ml-2 text-sm font-medium">{review.workLifeBalance}/5</span>
                              </div>
                            </div>
                            <div className="flex items-center justify-between">
                              <span className="text-sm text-gray-600">Career Growth:</span>
                              <div className="flex items-center">
                                {[...Array(5)].map((_, i) => (
                                  <FaStar
                                    key={i}
                                    className={`h-3 w-3 ${
                                      i < review.careerGrowth ? 'text-yellow-400' : 'text-gray-300'
                                    }`}
                                  />
                                ))}
                                <span className="ml-2 text-sm font-medium">{review.careerGrowth}/5</span>
                              </div>
                            </div>
                            <div className="flex items-center justify-between">
                              <span className="text-sm text-gray-600">Compensation:</span>
                              <div className="flex items-center">
                                {[...Array(5)].map((_, i) => (
                                  <FaStar
                                    key={i}
                                    className={`h-3 w-3 ${
                                      i < review.compensation ? 'text-yellow-400' : 'text-gray-300'
                                    }`}
                                  />
                                ))}
                                <span className="ml-2 text-sm font-medium">{review.compensation}/5</span>
                              </div>
                            </div>
                            <div className="flex items-center justify-between">
                              <span className="text-sm text-gray-600">Management:</span>
                              <div className="flex items-center">
                                {[...Array(5)].map((_, i) => (
                                  <FaStar
                                    key={i}
                                    className={`h-3 w-3 ${
                                      i < review.management ? 'text-yellow-400' : 'text-gray-300'
                                    }`}
                                  />
                                ))}
                                <span className="ml-2 text-sm font-medium">{review.management}/5</span>
                              </div>
                            </div>
                          </div>
                        </div>

                        {/* Review Content */}
                        <div className="mb-6">
                          <h4 className="font-medium text-gray-900 mb-3">Review</h4>
                          <div className="bg-white border rounded-lg p-4">
                            <p className="text-gray-700 whitespace-pre-wrap leading-relaxed">
                              {review.content}
                            </p>
                          </div>
                        </div>

                        {/* Pros and Cons */}
                        {(review.pros?.length > 0 || review.cons?.length > 0) && (
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                            {review.pros?.length > 0 && (
                              <div className="bg-green-50 rounded-lg p-4">
                                <h4 className="font-medium text-green-800 mb-3 flex items-center">
                                  <span className="w-2 h-2 bg-green-500 rounded-full mr-2"></span>
                                  Pros
                                </h4>
                                <ul className="space-y-2">
                                  {review.pros.map((pro, index) => (
                                    <li key={index} className="flex items-start text-green-700">
                                      <span className="text-green-500 mr-2 mt-1">✓</span>
                                      <span>{pro}</span>
                                    </li>
                                  ))}
                                </ul>
                              </div>
                            )}
                            {review.cons?.length > 0 && (
                              <div className="bg-red-50 rounded-lg p-4">
                                <h4 className="font-medium text-red-800 mb-3 flex items-center">
                                  <span className="w-2 h-2 bg-red-500 rounded-full mr-2"></span>
                                  Cons
                                </h4>
                                <ul className="space-y-2">
                                  {review.cons.map((con, index) => (
                                    <li key={index} className="flex items-start text-red-700">
                                      <span className="text-red-500 mr-2 mt-1">✗</span>
                                      <span>{con}</span>
                                    </li>
                                  ))}
                                </ul>
                              </div>
                            )}
                          </div>
                        )}

                        {/* Recommendation and Helpful */}
                        <div className="flex items-center justify-between pt-4 border-t border-gray-200">
                          <div className="flex items-center">
                            <span className="text-sm text-gray-600 mr-3">Recommendation:</span>
                            <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                              review.recommendations === 'Yes' ? 'bg-green-100 text-green-800' :
                              review.recommendations === 'No' ? 'bg-red-100 text-red-800' : 
                              'bg-yellow-100 text-yellow-800'
                            }`}>
                              {review.recommendations}
                            </span>
                          </div>
                          <div className="flex items-center space-x-4">
                            <div className="flex items-center text-sm text-gray-500">
                              <FaThumbsUp className="mr-2" />
                              <span>{review.helpfulCount || 0} found this helpful</span>
                            </div>
                            {!review.isAnonymous && review.author && (
                              <button
                                onClick={() => setContactModal({ isOpen: true, reviewer: review.author, review: review })}
                                className="btn-secondary text-sm flex items-center"
                              >
                                <FaEnvelope className="mr-2" />
                                Contact Reviewer
                              </button>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <FaStar className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                <h3 className="text-xl font-medium text-gray-900 mb-2">No reviews yet</h3>
                <p className="text-gray-500 mb-6 max-w-md mx-auto">
                  Be the first to share your experience working at this company. 
                  Your review will help other alumni make informed decisions.
                </p>
                {user?.role === 'alumni' && (
                  <Link to="/reviews/new" className="btn-primary">
                    Write First Review
                  </Link>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Contact Modal */}
      {contactModal.isOpen && contactModal.reviewer && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-md w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-900">Contact Reviewer</h3>
                <button
                  onClick={() => setContactModal({ isOpen: false, reviewer: null })}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <FaTimes className="h-5 w-5" />
                </button>
              </div>

              <div className="space-y-4">
                {/* Reviewer Info */}
                <div className="bg-gray-50 rounded-lg p-4">
                  <div className="flex items-center mb-3">
                    <FaUserGraduate className="h-5 w-5 text-primary-600 mr-2" />
                    <h4 className="font-medium text-gray-900">{contactModal.reviewer.name}</h4>
                  </div>
                  
                  <div className="space-y-2 text-sm text-gray-600">
                    {contactModal.reviewer.graduationYear && (
                      <div className="flex items-center">
                        <span className="font-medium mr-2">Graduation Year:</span>
                        <span>{contactModal.reviewer.graduationYear}</span>
                      </div>
                    )}
                    {contactModal.reviewer.branch && (
                      <div className="flex items-center">
                        <span className="font-medium mr-2">Branch:</span>
                        <span>{contactModal.reviewer.branch}</span>
                      </div>
                    )}
                    {contactModal.reviewer.currentCompany && (
                      <div className="flex items-center">
                        <span className="font-medium mr-2">Current Company:</span>
                        <span>{contactModal.reviewer.currentCompany}</span>
                      </div>
                    )}
                    {contactModal.reviewer.designation && (
                      <div className="flex items-center">
                        <span className="font-medium mr-2">Designation:</span>
                        <span>{contactModal.reviewer.designation}</span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Contact Options */}
                <div className="space-y-3">
                  <h4 className="font-medium text-gray-900">Contact Information</h4>
                  
                  {/* Email */}
                  <div className="flex items-center p-3 border rounded-lg hover:bg-gray-50 transition-colors">
                    <FaEnvelope className="h-4 w-4 text-gray-400 mr-3" />
                    <div className="flex-1">
                      <p className="text-sm font-medium text-gray-900">Email</p>
                      <p className="text-sm text-gray-500">
                        {contactModal.reviewer.email || 'Email not available'}
                      </p>
                    </div>
                    {contactModal.reviewer.email && (
                      <a
                        href={`mailto:${contactModal.reviewer.email}`}
                        className="btn-primary text-xs"
                      >
                        Send Email
                      </a>
                    )}
                  </div>



                  {/* LinkedIn */}
                  <div className="flex items-center p-3 border rounded-lg hover:bg-gray-50 transition-colors">
                    <FaLinkedin className="h-4 w-4 text-gray-400 mr-3" />
                    <div className="flex-1">
                      <p className="text-sm font-medium text-gray-900">LinkedIn</p>
                      <p className="text-sm text-gray-500">
                        {contactModal.review?.linkedinProfile || contactModal.reviewer.linkedinProfile || 'LinkedIn not available'}
                      </p>
                    </div>
                    {(contactModal.review?.linkedinProfile || contactModal.reviewer.linkedinProfile) && (
                      <a
                        href={contactModal.review?.linkedinProfile || contactModal.reviewer.linkedinProfile}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="btn-primary text-xs"
                      >
                        View Profile
                      </a>
                    )}
                  </div>
                </div>

                {/* Message */}
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <p className="text-sm text-blue-800">
                    <strong>Note:</strong> Please be respectful when contacting reviewers. 
                    They've shared their experience to help the community, so keep your 
                    messages professional and relevant.
                  </p>
                </div>

                {/* Close Button */}
                <div className="flex justify-end pt-4">
                  <button
                    onClick={() => setContactModal({ isOpen: false, reviewer: null })}
                    className="btn-secondary"
                  >
                    Close
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CompanyDetail; 