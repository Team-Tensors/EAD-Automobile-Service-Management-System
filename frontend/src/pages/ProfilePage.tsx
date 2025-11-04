import { useState, useEffect } from "react";
import { useAuth } from "../hooks/useAuth";
import { authService } from "../services/authService";
import AuthenticatedNavbar from "../components/CustomerNavbar/CustomerNavbar";
import { User, Mail, Phone, MapPin, Calendar } from "lucide-react";
import { Button } from "../components/ui/button";
import FormInputField from "../components/ui/FormInputField";
import type { User as UserType } from "../types/auth";

const ProfilePage = () => {
  const { user } = useAuth();
  const [userData, setUserData] = useState<UserType | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    fullName: user?.fullName || "",
    phoneNumber: user?.phoneNumber || "",
    address: user?.address || "",
  });

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const updatedUser = await authService.getProfile();
        setUserData(updatedUser);
      } catch (err) {
        console.error("Failed to fetch user data:", err);
      }
    };

    fetchUserData();
  }, []);

  useEffect(() => {
    if (userData) {
      setFormData({
        fullName: userData.fullName || "",
        phoneNumber: userData.phoneNumber || "",
        address: userData.address || "",
      });
    }
  }, [userData]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
    // Clear errors when user starts typing
    if (error) setError(null);
    if (success) setSuccess(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);
    setIsLoading(true);

    try {
      // Only send fields that have changed
      const updatedData: Record<string, string> = {};
      
      if (formData.fullName !== user?.fullName) {
        updatedData.fullName = formData.fullName;
      }
      if (formData.phoneNumber !== user?.phoneNumber) {
        updatedData.phoneNumber = formData.phoneNumber;
      }
      if (formData.address !== user?.address) {
        updatedData.address = formData.address;
      }

      if (Object.keys(updatedData).length === 0) {
        setError("No changes detected");
        setIsLoading(false);
        return;
      }

      const updatedUser = await authService.updateProfile(updatedData);
      
      // Update localStorage with the new user data
      const storedUser = localStorage.getItem('auth_user');
      if (storedUser) {
        const currentUser = JSON.parse(storedUser);
        const newUserData = { ...currentUser, ...updatedUser };
        localStorage.setItem('auth_user', JSON.stringify(newUserData));
      }
      
      setSuccess("Profile updated successfully!");
      setIsEditing(false);
      
      // Reload page to reflect changes
      setTimeout(() => {
        window.location.reload();
      }, 1000);
    } catch (err: unknown) {
      if (err instanceof Error) {
        setError(err.message || "Failed to update profile");
      } else {
        setError("Failed to update profile");
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleCancel = () => {
    // Reset form to original user data
    if (user) {
      setFormData({
        fullName: user.fullName || "",
        phoneNumber: user.phoneNumber || "",
        address: user.address || ""
      });
    }
    setIsEditing(false);
    setError(null);
    setSuccess(null);
  };

  if (!user) {
    return (
      <>
        <AuthenticatedNavbar />
        <div className="min-h-screen bg-linear-to-br from-zinc-900 via-zinc-800 to-zinc-900 pt-32">
          <div className="max-w-4xl mx-auto px-4">
            <p className="text-white text-center">Loading profile...</p>
          </div>
        </div>
      </>
    );
  }

  // const isEmployee = user.roles?.includes("EMPLOYEE") || user.role === "EMPLOYEE";

  return (
    <>
      <AuthenticatedNavbar />
      <div className="min-h-screen bg-linear-to-br from-zinc-900 via-zinc-800 to-zinc-900 pt-24 sm:pt-32 pb-12">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Header */}
          <div className="mb-6 sm:mb-8">
            <h1 className="text-3xl sm:text-4xl font-bold text-white mb-2">My Profile</h1>
            <p className="text-sm sm:text-base text-gray-400">View and manage your account information</p>
          </div>

          {/* Profile Card */}
          <div className="bg-zinc-950/50 backdrop-blur-sm border border-zinc-800 rounded-xl p-4 sm:p-6 lg:p-8">
            {/* Profile Header */}
            <div className="flex flex-col sm:flex-row items-center sm:items-start gap-4 sm:gap-6 mb-6 sm:mb-8 pb-6 sm:pb-8 border-b border-zinc-800">
              <div className="w-20 h-20 sm:w-24 sm:h-24 bg-linear-to-br from-orange-500 to-orange-600 rounded-full flex items-center justify-center shrink-0">
                <User className="w-10 h-10 sm:w-12 sm:h-12 text-white" />
              </div>
              <div className="flex-1 text-center sm:text-left">
                <h2 className="text-xl sm:text-2xl font-bold text-white mb-1">{user.fullName}</h2>
                <p className="text-sm sm:text-base text-gray-400 mb-2 break-all">{user.email}</p>
                <div className="flex flex-wrap gap-2 justify-center sm:justify-start">
                  {user.roles?.map((role) => (
                    <span
                      key={role}
                      className="px-3 py-1 bg-orange-500/20 text-orange-400 rounded-full text-xs sm:text-sm font-medium"
                    >
                      {role}
                    </span>
                  ))}
                </div>
              </div>
              {!isEditing && (
                <Button
                  onClick={() => setIsEditing(true)}
                  className="bg-orange-600 hover:bg-orange-700 text-white w-full sm:w-auto whitespace-nowrap"
                >
                  Edit Profile
                </Button>
              )}
            </div>

            {/* Error/Success Messages */}
            {error && (
              <div className="mb-4 sm:mb-6 p-3 sm:p-4 bg-red-500/10 border border-red-500/50 rounded-lg">
                <p className="text-red-400 text-xs sm:text-sm">{error}</p>
              </div>
            )}
            {success && (
              <div className="mb-4 sm:mb-6 p-3 sm:p-4 bg-green-500/10 border border-green-500/50 rounded-lg">
                <p className="text-green-400 text-xs sm:text-sm">{success}</p>
              </div>
            )}

            {/* Profile Form */}
            <form onSubmit={handleSubmit}>
              <div className="space-y-4 sm:space-y-6">
                {/* Full Name */}
                <div>
                  <FormInputField
                    name="fullName"
                    type="text"
                    label="Full Name"
                    icon={<User className="w-4 h-4 sm:w-5 sm:h-5 text-orange-500" />}
                    placeholder="Enter your full name"
                    value={formData.fullName}
                    onChange={handleInputChange}
                    disabled={!isEditing}
                    required
                  />
                </div>

                {/* Email (Read-only) */}
                <div>
                  <div className="space-y-2">
                    <label className="text-xs sm:text-sm font-medium text-gray-300">
                      Email Address
                    </label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500 w-4 h-4 sm:w-5 sm:h-5" />
                      <input
                        type="email"
                        value={user.email}
                        disabled
                        className="w-full pl-9 sm:pl-10 pr-4 py-2.5 sm:py-3 text-sm sm:text-base bg-zinc-800/50 border border-zinc-700 rounded-lg text-gray-400 cursor-not-allowed break-all"
                      />
                    </div>
                    <p className="text-xs text-gray-500">Email cannot be changed</p>
                  </div>
                </div>
                
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
                  {/* Phone Number */}
                  <div>
                    <FormInputField
                      name="phoneNumber"
                      type="tel"
                      label="Phone Number"
                      icon={<Phone className="w-4 h-4 sm:w-5 sm:h-5 text-orange-500" />}
                      placeholder="Enter your phone number"
                      value={formData.phoneNumber}
                      onChange={handleInputChange}
                      disabled={!isEditing}
                    />
                  </div>
                </div>

                {/* Address */}
                <div>
                  <FormInputField
                    name="address"
                    type="text"
                    label="Address"
                    icon={<MapPin className="w-4 h-4 sm:w-5 sm:h-5 text-orange-500" />}
                    placeholder="Enter your address"
                    value={formData.address}
                    onChange={handleInputChange}
                    disabled={!isEditing}
                  />
                </div>


                {/* Account Info */}
                {user.createdAt && (
                  <div className="pt-4 sm:pt-6 border-t border-zinc-800">
                    <div className="flex items-center gap-2 text-gray-400">
                      <Calendar className="w-4 h-4 shrink-0" />
                      <span className="text-xs sm:text-sm">
                        Account created on{" "}
                        {new Date(user.createdAt).toLocaleDateString("en-US", {
                          year: "numeric",
                          month: "long",
                          day: "numeric",
                        })}
                      </span>
                    </div>
                  </div>
                )}
              </div>

              {/* Action Buttons */}
              {isEditing && (
                <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 mt-6 sm:mt-8 pt-4 sm:pt-6 border-t border-zinc-800">
                  <Button
                    type="submit"
                    disabled={isLoading}
                    className="flex-1 bg-orange-600 hover:bg-orange-700 text-white text-sm sm:text-base py-2.5 sm:py-3"
                  >
                    {isLoading ? "Saving..." : "Save Changes"}
                  </Button>
                  <Button
                    type="button"
                    onClick={handleCancel}
                    disabled={isLoading}
                    className="flex-1 bg-zinc-700 hover:bg-zinc-600 text-white text-sm sm:text-base py-2.5 sm:py-3"
                  >
                    Cancel
                  </Button>
                </div>
              )}
            </form>
          </div>
        </div>
      </div>
    </>
  );
};

export default ProfilePage;
