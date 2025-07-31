import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { useAuth } from '../contexts/AuthContext';
import { FaStar, FaBuilding, FaMapMarkerAlt, FaCalendarAlt, FaMoneyBillWave, FaCheck } from 'react-icons/fa';
import toast from 'react-hot-toast';

const UserTypeSelection = () => {
  const { user, updateProfile } = useAuth();
  const navigate = useNavigate();
  const [userType, setUserType] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm();

  const currentYear = new Date().getFullYear();
  const joinYears = Array.from({ length: 20 }, (_, i) => currentYear - i);

  const handleUserTypeSelection = (type) => {
    setUserType(type);
  };

  const onSubmit = async (data) => {
    setIsLoading(true);
    try {
      // Debug: Log the form data to see what's being sent
      console.log('Form data:', data);
      
             let updateData = {
         role: 'alumni', // Both readers and writers should be able to add reviews
         userType: userType
       };

      // If user is a writer, add the additional fields
      if (userType === 'writer') {
        updateData = {
          ...updateData,
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
        };
      }

      // Update user profile using AuthContext
      const updateResult = await updateProfile(updateData);
      
      if (updateResult.success) {
        // If user is a writer, create company and review
        if (userType === 'writer') {
          try {
            await createCompanyAndReview(data);
            toast.success('Profile updated successfully!');
            navigate('/dashboard');
          } catch (reviewError) {
            toast.error(reviewError.message || 'Failed to create review');
          }
        } else {
          toast.success('Profile updated successfully!');
          navigate('/dashboard');
        }
      } else {
        toast.error(updateResult.error || 'Failed to update profile');
      }
    } catch (error) {
      toast.error('Something went wrong. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const createCompanyAndReview = async (data) => {
    try {
      const reviewData = {
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
      };
      
      console.log('Sending review data:', reviewData);
      
      const response = await fetch('/api/auth/create-initial-review', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify(reviewData)
      });

      if (!response.ok) {
        const errorData = await response.json();
        console.error('Failed to create initial review:', errorData);
        throw new Error(errorData.message || 'Failed to create review');
      }
      
      const result = await response.json();
      console.log('Review created successfully:', result);
    } catch (error) {
      console.error('Error creating initial review:', error);
      throw error; // Re-throw to be handled by the calling function
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
            Welcome to Alumni Portal!
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600">
            How would you like to use the platform?
          </p>
        </div>

        {/* User Type Selection */}
        {!userType && (
          <div className="mt-8 space-y-6">
            <div className="text-center">
              <h3 className="text-lg font-medium text-gray-900 mb-4">
                Choose your experience
              </h3>
              <p className="text-sm text-gray-600 mb-6">
                Select how you want to interact with the alumni community
              </p>
            </div>
            
            <div className="grid grid-cols-1 gap-4">
              <button
                type="button"
                onClick={() => handleUserTypeSelection('reader')}
                className="card p-6 text-left hover:shadow-lg transition-shadow border-2 border-transparent hover:border-primary-300"
              >
                <div className="flex items-center">
                  <div className="flex-shrink-0 p-3 rounded-lg bg-blue-100">
                    <FaStar className="h-6 w-6 text-blue-600" />
                  </div>
                  <div className="ml-4">
                    <h3 className="text-lg font-medium text-gray-900">Read Reviews</h3>
                    <p className="text-sm text-gray-500">
                      Browse and read reviews from alumni about companies
                    </p>
                  </div>
                </div>
              </button>

              <button
                type="button"
                onClick={() => handleUserTypeSelection('writer')}
                className="card p-6 text-left hover:shadow-lg transition-shadow border-2 border-transparent hover:border-primary-300"
              >
                <div className="flex items-center">
                  <div className="flex-shrink-0 p-3 rounded-lg bg-green-100">
                    <FaBuilding className="h-6 w-6 text-green-600" />
                  </div>
                  <div className="ml-4">
                    <h3 className="text-lg font-medium text-gray-900">Write Reviews</h3>
                    <p className="text-sm text-gray-500">
                      Share your work experience and help other alumni
                    </p>
                  </div>
                </div>
              </button>
            </div>
          </div>
        )}

        {/* Form for Writers */}
        {userType === 'writer' && (
          <form className="mt-8 space-y-6" onSubmit={handleSubmit(onSubmit)}>
            <div className="space-y-4">
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
                    placeholder="Share your experience working at this company. Describe the work culture, challenges, opportunities, and your overall experience..."
                    {...register('review', {
                      required: 'Review is required',
                      minLength: {
                        value: 50,
                        message: 'Review must be at least 50 characters',
                      },
                      validate: (value) => {
                        if (value.includes('linkedin.com')) {
                          return 'Please enter actual review content, not LinkedIn URLs';
                        }
                        return true;
                      }
                    })}
                  />
                </div>
                <p className="mt-1 text-sm text-gray-500">
                  Please share your honest experience. This helps other alumni make informed decisions.
                </p>
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

            <div className="flex flex-col space-y-3">
              <button
                type="submit"
                disabled={isLoading}
                className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isLoading ? (
                  <div className="flex items-center">
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    Setting up your profile...
                  </div>
                ) : (
                  'Complete Setup'
                )}
              </button>

              <button
                type="button"
                onClick={() => setUserType('')}
                className="w-full flex justify-center py-2 px-4 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
              >
                Back to selection
              </button>
            </div>
          </form>
        )}

        {/* Quick Setup for Readers */}
        {userType === 'reader' && (
          <div className="mt-8 space-y-6">
            <div className="text-center">
              <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-green-100">
                <FaCheck className="h-6 w-6 text-green-600" />
              </div>
              <h3 className="mt-4 text-lg font-medium text-gray-900">
                You're all set to read reviews!
              </h3>
              <p className="mt-2 text-sm text-gray-600">
                You can now browse and read reviews from alumni about different companies.
              </p>
            </div>

            <div className="flex flex-col space-y-3">
                             <button
                 type="button"
                 onClick={async () => {
                   try {
                                           // Update user profile using AuthContext
                      const updateResult = await updateProfile({
                        role: 'alumni', // Readers should also be able to add reviews
                        userType: 'reader'
                      });

                     if (updateResult.success) {
                       navigate('/dashboard');
                     } else {
                       toast.error(updateResult.error || 'Failed to update profile');
                     }
                   } catch (error) {
                     toast.error('Something went wrong');
                   }
                 }}
                 className="w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
               >
                 Go to Dashboard
               </button>

              <button
                type="button"
                onClick={() => setUserType('')}
                className="w-full flex justify-center py-2 px-4 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
              >
                Change selection
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default UserTypeSelection; 