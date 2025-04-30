import { useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { useForm } from 'react-hook-form';
import { doc, updateDoc } from 'firebase/firestore';
import { firestore } from '../../firebase/config';
import { User, Wrench, Phone, MapPin, Mail, Save } from 'lucide-react';

type ProfileFormData = {
  displayName: string;
  phone: string;
  address: string;
  specialties: string;
};

const Profile = () => {
  const { currentUser, updateUserProfile } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  
  const {
    register,
    handleSubmit,
    formState: { errors }
  } = useForm<ProfileFormData>({
    defaultValues: {
      displayName: currentUser?.displayName || '',
      phone: '',
      address: '',
      specialties: 'plumbing,electrical,hvac,appliance'
    }
  });
  
  const onSubmit = async (data: ProfileFormData) => {
    if (!currentUser) return;
    
    try {
      setIsLoading(true);
      setError(null);
      setSuccess(null);


      


      
      
      // Update display name in auth
      await updateUserProfile(data.displayName);
      
      // Update profile in Firestore
      const providerRef = doc(firestore, 'service_providers', currentUser.uid);
      await updateDoc(providerRef, {
        name: data.displayName,
        phone: data.phone,
        address: data.address,
        specialties: data.specialties.split(',').map(s => s.trim()),
        updatedAt: new Date()
      });
      
      setSuccess('Profile updated successfully');
    } catch (err) {
      console.error('Error updating profile:', err);
      setError('Failed to update profile. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };
  
  return (
    <div>
      <h1 className="text-2xl font-bold text-neutral-900 dark:text-white mb-2">Profile Settings</h1>
      <p className="text-neutral-600 dark:text-neutral-400 mb-8">
        Manage your profile information and service preferences
      </p>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2">
          <div className="bg-white dark:bg-neutral-800 rounded-lg shadow-sm border border-neutral-200 dark:border-neutral-700 overflow-hidden">
            <div className="p-6">
              <h2 className="text-lg font-medium text-neutral-900 dark:text-white mb-6">Personal Information</h2>
              
              {error && (
                <div className="bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-400 p-3 rounded-md mb-4">
                  {error}
                </div>
              )}
              
              {success && (
                <div className="bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-400 p-3 rounded-md mb-4">
                  {success}
                </div>
              )}
              
              <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                <div className="space-y-2">
                  <label htmlFor="displayName" className="block text-sm font-medium text-neutral-700 dark:text-neutral-300">
                    Full Name
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <User size={18} className="text-neutral-400" />
                    </div>
                    <input
                      id="displayName"
                      type="text"
                      className={`pl-10 w-full py-2 px-4 rounded-md border ${
                        errors.displayName 
                          ? 'border-red-500 dark:border-red-500'
                          : 'border-neutral-300 dark:border-neutral-600'
                      } bg-white dark:bg-neutral-900 text-neutral-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary-500`}
                      placeholder="John Doe"
                      {...register('displayName', { 
                        required: 'Name is required',
                        minLength: {
                          value: 2,
                          message: 'Name must be at least 2 characters'
                        }
                      })}
                    />
                  </div>
                  {errors.displayName && (
                    <p className="text-red-500 text-xs mt-1">{errors.displayName.message}</p>
                  )}
                </div>
                
                <div className="space-y-2">
                  <label htmlFor="phone" className="block text-sm font-medium text-neutral-700 dark:text-neutral-300">
                    Phone Number
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <Phone size={18} className="text-neutral-400" />
                    </div>
                    <input
                      id="phone"
                      type="tel"
                      className={`pl-10 w-full py-2 px-4 rounded-md border ${
                        errors.phone 
                          ? 'border-red-500 dark:border-red-500'
                          : 'border-neutral-300 dark:border-neutral-600'
                      } bg-white dark:bg-neutral-900 text-neutral-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary-500`}
                      placeholder="+1 (555) 123-4567"
                      {...register('phone', { 
                        required: 'Phone number is required'
                      })}
                    />
                  </div>
                  {errors.phone && (
                    <p className="text-red-500 text-xs mt-1">{errors.phone.message}</p>
                  )}
                </div>
                
                <div className="space-y-2">
                  <label htmlFor="address" className="block text-sm font-medium text-neutral-700 dark:text-neutral-300">
                    Service Area / Address
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <MapPin size={18} className="text-neutral-400" />
                    </div>
                    <input
                      id="address"
                      type="text"
                      className={`pl-10 w-full py-2 px-4 rounded-md border ${
                        errors.address 
                          ? 'border-red-500 dark:border-red-500'
                          : 'border-neutral-300 dark:border-neutral-600'
                      } bg-white dark:bg-neutral-900 text-neutral-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary-500`}
                      placeholder="New York, NY"
                      {...register('address', { 
                        required: 'Service area is required'
                      })}
                    />
                  </div>
                  {errors.address && (
                    <p className="text-red-500 text-xs mt-1">{errors.address.message}</p>
                  )}
                </div>
                
                <div className="space-y-2">
                  <label htmlFor="specialties" className="block text-sm font-medium text-neutral-700 dark:text-neutral-300">
                    Service Specialties (comma separated)
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <Wrench size={18} className="text-neutral-400" />
                    </div>
                    <input
                      id="specialties"
                      type="text"
                      className={`pl-10 w-full py-2 px-4 rounded-md border ${
                        errors.specialties 
                          ? 'border-red-500 dark:border-red-500'
                          : 'border-neutral-300 dark:border-neutral-600'
                      } bg-white dark:bg-neutral-900 text-neutral-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary-500`}
                      placeholder="plumbing, electrical, hvac, appliance"
                      {...register('specialties', { 
                        required: 'At least one specialty is required'
                      })}
                    />
                  </div>
                  {errors.specialties && (
                    <p className="text-red-500 text-xs mt-1">{errors.specialties.message}</p>
                  )}
                </div>
                
                <div className="pt-4">
                  <button
                    type="submit"
                    disabled={isLoading}
                    className="inline-flex items-center bg-primary-600 hover:bg-primary-700 text-white font-medium py-2 px-6 rounded-md transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <Save size={18} className="mr-2" />
                    {isLoading ? 'Saving...' : 'Save Changes'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
        
        <div>
          <div className="bg-white dark:bg-neutral-800 rounded-lg shadow-sm border border-neutral-200 dark:border-neutral-700 overflow-hidden">
            <div className="p-6">
              <h2 className="text-lg font-medium text-neutral-900 dark:text-white mb-6">Profile Summary</h2>
              
              <div className="flex flex-col items-center mb-6">
                <div className="bg-primary-100 dark:bg-primary-900/30 p-6 rounded-full">
                  <User size={36} className="text-primary-700 dark:text-primary-400" />
                </div>
                <h3 className="mt-4 text-lg font-medium text-neutral-900 dark:text-white">
                  {currentUser?.displayName || 'User'}
                </h3>
                <p className="text-neutral-600 dark:text-neutral-400 text-sm">
                  {currentUser?.email}
                </p>
              </div>
              
              <div className="space-y-4">
                <div className="flex items-center border-t border-neutral-200 dark:border-neutral-700 pt-4">
                  <Mail size={18} className="text-neutral-500 dark:text-neutral-400 mr-3" />
                  <div>
                    <p className="text-xs text-neutral-500 dark:text-neutral-400">Email</p>
                    <p className="text-neutral-800 dark:text-neutral-200">{currentUser?.email}</p>
                  </div>
                </div>
                
                <div className="flex items-center border-t border-neutral-200 dark:border-neutral-700 pt-4">
                  <Wrench size={18} className="text-neutral-500 dark:text-neutral-400 mr-3" />
                  <div>
                    <p className="text-xs text-neutral-500 dark:text-neutral-400">Provider Since</p>
                    <p className="text-neutral-800 dark:text-neutral-200">
                      {currentUser?.metadata.creationTime 
                        ? new Date(currentUser.metadata.creationTime).toLocaleDateString() 
                        : 'Unknown'}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
          
          <div className="bg-white dark:bg-neutral-800 rounded-lg shadow-sm border border-neutral-200 dark:border-neutral-700 overflow-hidden mt-6">
            <div className="p-6">
              <h2 className="text-lg font-medium text-neutral-900 dark:text-white mb-4">Service Statistics</h2>
              
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <p className="text-neutral-600 dark:text-neutral-400">Services Completed</p>
                  <p className="font-medium text-neutral-900 dark:text-white">0</p>
                </div>
                
                <div className="flex justify-between items-center">
                  <p className="text-neutral-600 dark:text-neutral-400">Pending Services</p>
                  <p className="font-medium text-neutral-900 dark:text-white">0</p>
                </div>
                
                <div className="flex justify-between items-center">
                  <p className="text-neutral-600 dark:text-neutral-400">Average Rating</p>
                  <p className="font-medium text-neutral-900 dark:text-white">N/A</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;