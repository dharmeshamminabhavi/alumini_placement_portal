import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { useAuth } from '../contexts/AuthContext';
import { FaStar, FaBuilding, FaMapMarkerAlt, FaCalendarAlt, FaMoneyBillWave } from 'react-icons/fa';
import toast from 'react-hot-toast';

const AddReview = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm();

  const currentYear = new Date().getFullYear();
  const joinYears = Array.from({ length: 20 }, (_, i) => currentYear - i);

  const onSubmit = async (data) => {
    setIsLoading(true);
    try {
      // Use the same endpoint as UserTypeSelection to handle role update and review creation
      const response = await fetch('/api/auth/create-initial-review', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({
          companyName: data.companyName,
          location: data.location,
          joinYear: data.joinYear,
          salary: data.salary,
          review: data.review,
          workCulture: parseInt(data.workCulture),
          workLifeBalance: parseInt(data.workLifeBalance),
          careerGrowth: parseInt(data.careerGrowth),
          compensation: parseInt(data.compensation),
          management: parseInt(data.management)
        })
      });

      if (response.ok) {
        toast.success('Review submitted successfully!');
        navigate('/reviews');
      } else {
        const error = await response.json();
        toast.error(error.message || 'Failed to submit review');
      }
    } catch (error) {
      toast.error('Something went wrong. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Write a Review</h1>
          <p className="mt-2 text-gray-600">Share your experience working at a company</p>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          {/* Company Information */}
          <div className="card">
            <div className="card-header">
              <h2 className="text-xl font-semibold text-gray-900">Company Information</h2>
            </div>
            <div className="card-body space-y-4">
              <div>
                <label htmlFor="companyName" className="block text-sm font-medium text-gray-700">
                  Company Name
                </label>
                <div className="mt-1 relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <FaBuilding className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    id="companyName"
                    type="text"
                    className={`input pl-10 ${errors.companyName ? 'border-red-500' : ''}`}
                    placeholder="Enter company name"
                    {...register('companyName', {
                      required: 'Company name is required',
                    })}
                  />
                </div>
                {errors.companyName && (
                  <p className="mt-1 text-sm text-red-600">{errors.companyName.message}</p>
                )}
              </div>

              <div>
                <label htmlFor="location" className="block text-sm font-medium text-gray-700">
                  Location
                </label>
                <div className="mt-1 relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <FaMapMarkerAlt className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    id="location"
                    type="text"
                    className={`input pl-10 ${errors.location ? 'border-red-500' : ''}`}
                    placeholder="Enter company location"
                    {...register('location', {
                      required: 'Location is required',
                    })}
                  />
                </div>
                {errors.location && (
                  <p className="mt-1 text-sm text-red-600">{errors.location.message}</p>
                )}
              </div>

              <div>
                <label htmlFor="joinYear" className="block text-sm font-medium text-gray-700">
                  Year Joined
                </label>
                <div className="mt-1 relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <FaCalendarAlt className="h-5 w-5 text-gray-400" />
                  </div>
                  <select
                    id="joinYear"
                    className={`input pl-10 ${errors.joinYear ? 'border-red-500' : ''}`}
                    {...register('joinYear', {
                      required: 'Join year is required',
                    })}
                  >
                    <option value="">Select join year</option>
                    {joinYears.map((year) => (
                      <option key={year} value={year}>
                        {year}
                      </option>
                    ))}
                  </select>
                </div>
                {errors.joinYear && (
                  <p className="mt-1 text-sm text-red-600">{errors.joinYear.message}</p>
                )}
              </div>

              <div>
                <label htmlFor="salary" className="block text-sm font-medium text-gray-700">
                  Salary (CTC in LPA)
                </label>
                <div className="mt-1 relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <FaMoneyBillWave className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    id="salary"
                    type="number"
                    step="0.1"
                    className={`input pl-10 ${errors.salary ? 'border-red-500' : ''}`}
                    placeholder="Enter salary in LPA"
                    {...register('salary', {
                      required: 'Salary is required',
                      min: {
                        value: 0,
                        message: 'Salary must be positive',
                      },
                    })}
                  />
                </div>
                {errors.salary && (
                  <p className="mt-1 text-sm text-red-600">{errors.salary.message}</p>
                )}
              </div>

              <div>
                <label htmlFor="review" className="block text-sm font-medium text-gray-700">
                  Review
                </label>
                <div className="mt-1">
                  <textarea
                    id="review"
                    rows={4}
                    className={`input ${errors.review ? 'border-red-500' : ''}`}
                    placeholder="Share your experience working at this company..."
                    {...register('review', {
                      required: 'Review is required',
                      minLength: {
                        value: 50,
                        message: 'Review must be at least 50 characters',
                      },
                    })}
                  />
                </div>
                {errors.review && (
                  <p className="mt-1 text-sm text-red-600">{errors.review.message}</p>
                )}
              </div>

              {/* Rating Fields */}
              <div className="space-y-4">
                <h3 className="text-lg font-medium text-gray-900">Rate Your Experience</h3>
                
                <div>
                  <label htmlFor="workCulture" className="block text-sm font-medium text-gray-700">
                    Work Culture
                  </label>
                  <div className="mt-1">
                    <select
                      id="workCulture"
                      className={`input ${errors.workCulture ? 'border-red-500' : ''}`}
                      {...register('workCulture', {
                        required: 'Work culture rating is required',
                      })}
                    >
                      <option value="">Select rating</option>
                      {[1, 2, 3, 4, 5].map((value) => (
                        <option key={value} value={value}>
                          {value} - {value === 1 ? 'Poor' : value === 2 ? 'Fair' : value === 3 ? 'Good' : value === 4 ? 'Very Good' : 'Excellent'}
                        </option>
                      ))}
                    </select>
                  </div>
                  {errors.workCulture && (
                    <p className="mt-1 text-sm text-red-600">{errors.workCulture.message}</p>
                  )}
                </div>

                <div>
                  <label htmlFor="workLifeBalance" className="block text-sm font-medium text-gray-700">
                    Work-Life Balance
                  </label>
                  <div className="mt-1">
                    <select
                      id="workLifeBalance"
                      className={`input ${errors.workLifeBalance ? 'border-red-500' : ''}`}
                      {...register('workLifeBalance', {
                        required: 'Work-life balance rating is required',
                      })}
                    >
                      <option value="">Select rating</option>
                      {[1, 2, 3, 4, 5].map((value) => (
                        <option key={value} value={value}>
                          {value} - {value === 1 ? 'Poor' : value === 2 ? 'Fair' : value === 3 ? 'Good' : value === 4 ? 'Very Good' : 'Excellent'}
                        </option>
                      ))}
                    </select>
                  </div>
                  {errors.workLifeBalance && (
                    <p className="mt-1 text-sm text-red-600">{errors.workLifeBalance.message}</p>
                  )}
                </div>

                <div>
                  <label htmlFor="careerGrowth" className="block text-sm font-medium text-gray-700">
                    Career Growth
                  </label>
                  <div className="mt-1">
                    <select
                      id="careerGrowth"
                      className={`input ${errors.careerGrowth ? 'border-red-500' : ''}`}
                      {...register('careerGrowth', {
                        required: 'Career growth rating is required',
                      })}
                    >
                      <option value="">Select rating</option>
                      {[1, 2, 3, 4, 5].map((value) => (
                        <option key={value} value={value}>
                          {value} - {value === 1 ? 'Poor' : value === 2 ? 'Fair' : value === 3 ? 'Good' : value === 4 ? 'Very Good' : 'Excellent'}
                        </option>
                      ))}
                    </select>
                  </div>
                  {errors.careerGrowth && (
                    <p className="mt-1 text-sm text-red-600">{errors.careerGrowth.message}</p>
                  )}
                </div>

                <div>
                  <label htmlFor="compensation" className="block text-sm font-medium text-gray-700">
                    Compensation
                  </label>
                  <div className="mt-1">
                    <select
                      id="compensation"
                      className={`input ${errors.compensation ? 'border-red-500' : ''}`}
                      {...register('compensation', {
                        required: 'Compensation rating is required',
                      })}
                    >
                      <option value="">Select rating</option>
                      {[1, 2, 3, 4, 5].map((value) => (
                        <option key={value} value={value}>
                          {value} - {value === 1 ? 'Poor' : value === 2 ? 'Fair' : value === 3 ? 'Good' : value === 4 ? 'Very Good' : 'Excellent'}
                        </option>
                      ))}
                    </select>
                  </div>
                  {errors.compensation && (
                    <p className="mt-1 text-sm text-red-600">{errors.compensation.message}</p>
                  )}
                </div>

                <div>
                  <label htmlFor="management" className="block text-sm font-medium text-gray-700">
                    Management
                  </label>
                  <div className="mt-1">
                    <select
                      id="management"
                      className={`input ${errors.management ? 'border-red-500' : ''}`}
                      {...register('management', {
                        required: 'Management rating is required',
                      })}
                    >
                      <option value="">Select rating</option>
                      {[1, 2, 3, 4, 5].map((value) => (
                        <option key={value} value={value}>
                          {value} - {value === 1 ? 'Poor' : value === 2 ? 'Fair' : value === 3 ? 'Good' : value === 4 ? 'Very Good' : 'Excellent'}
                        </option>
                      ))}
                    </select>
                  </div>
                  {errors.management && (
                    <p className="mt-1 text-sm text-red-600">{errors.management.message}</p>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Submit Button */}
          <div className="flex justify-end space-x-4">
            <button
              type="button"
              onClick={() => navigate('/reviews')}
              className="btn-secondary"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isLoading}
              className="btn-primary"
            >
              {isLoading ? (
                <div className="flex items-center">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Submitting...
                </div>
              ) : (
                'Submit Review'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddReview; 