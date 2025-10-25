import type React from "react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useNavigate } from 'react-router-dom'
import { useState } from "react"
import { UserRole } from '../../types/auth'
import { authService } from "@/services/authService"

interface CompleteProfileData {
  phoneNumber: string;
  address: string;
  role: UserRole;
}

export function CompleteProfileForm({ className, ...props }: React.ComponentProps<"div">) {
  const navigate = useNavigate()
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  
  const [formData, setFormData] = useState<CompleteProfileData>({
    phoneNumber: '',
    address: '',
    role: UserRole.CUSTOMER,
  })
  
  const [formErrors, setFormErrors] = useState<{ [key: string]: string }>({})

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value,
    }))
    
    // Clear field error when user starts typing
    if (formErrors[name]) {
      setFormErrors(prev => ({ ...prev, [name]: '' }))
    }
    
    // Clear auth error
    if (error) {
      setError(null)
    }
  }

  const validateForm = (): boolean => {
    const errors: { [key: string]: string } = {}
    
    if (!formData.phoneNumber?.trim()) {
      errors.phoneNumber = 'Phone number is required'
    }
    
    setFormErrors(errors)
    return Object.keys(errors).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!validateForm()) {
      return
    }
    
    setIsLoading(true)
    setError(null)
    
    try {
      // Call backend API to update profile with missing information
      await authService.updateProfile({
        phoneNumber: formData.phoneNumber,
        address: formData.address || '',
        role: formData.role,
      })
      
      // Update user data in localStorage
      const currentUser = localStorage.getItem('user')
      if (currentUser) {
        const userData = JSON.parse(currentUser)
        const updatedUser = {
          ...userData,
          phoneNumber: formData.phoneNumber,
          address: formData.address,
          role: formData.role,
          roles: [formData.role],
        }
        localStorage.setItem('user', JSON.stringify(updatedUser))
      }
      
      // Redirect to dashboard
      navigate('/dashboard')
    } catch (err) {
      console.error('Profile completion failed:', err)
      const apiError = err as { response?: { data?: { message?: string } } }
      setError(apiError.response?.data?.message || 'Failed to complete profile. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }

//   const handleSkip = () => {
//     // Allow user to skip for now, but they may need to complete later
//     navigate('/dashboard')
//   }

  return (
    <div className={cn("flex flex-col gap-6", className)} {...props}>
      <Card className="overflow-hidden bg-zinc-950 border-zinc-800">
        <CardContent className="grid p-0 md:grid-cols-2">
          <form className="p-6 md:p-8" onSubmit={handleSubmit}>
            <div className="flex flex-col gap-6">
              <div className="flex flex-col items-center text-center">
                <span className="text-3xl font-bold text-white tracking-wider">
                  DRIVE<span className="text-orange-500">CARE</span>
                </span>
                <h1 className="text-2xl font-bold font-heading text-white">Complete Your Profile</h1>
                <p className="text-balance text-gray-400">
                  We need a few more details to set up your account
                </p>
              </div>
              
              {error && (
                <div className="text-red-400 bg-red-950/50 p-3 rounded border border-red-800 mb-2">
                  {error}
                </div>
              )}

              <div className="grid gap-2">
                <Label htmlFor="phoneNumber" className="text-white">
                  Phone Number <span className="text-red-400">*</span>
                </Label>
                <Input 
                  id="phoneNumber" 
                  name="phoneNumber"
                  type="tel" 
                  placeholder="+1 (555) 000-0000" 
                  value={formData.phoneNumber}
                  onChange={handleChange}
                  className={`border-zinc-800 bg-zinc-900 text-white placeholder:text-gray-500 focus-visible:ring-orange-500 focus-visible:ring-offset-zinc-950 ${formErrors.phoneNumber ? 'border-red-400 focus:border-red-500' : ''}`}
                  required 
                />
                {formErrors.phoneNumber && (
                  <span className="text-red-400 text-sm mt-1 block">
                    {formErrors.phoneNumber}
                  </span>
                )}
              </div>

              <div className="grid gap-2">
                <Label htmlFor="address" className="text-white">Address (Optional)</Label>
                <Input 
                  id="address" 
                  name="address"
                  type="text" 
                  placeholder="123 Main St, City, State" 
                  value={formData.address}
                  onChange={handleChange}
                  className="border-zinc-800 bg-zinc-900 text-white placeholder:text-gray-500 focus-visible:ring-orange-500 focus-visible:ring-offset-zinc-950"
                />
              </div>
              
              {/* <div className="grid gap-2">
                <Label htmlFor="role" className="text-white">
                  Account Type <span className="text-red-400">*</span>
                </Label>
                <select
                  id="role"
                  name="role"
                  value={formData.role}
                  onChange={handleChange}
                  className="flex h-9 w-full rounded-md border border-zinc-800 bg-zinc-900 text-white px-3 py-1 text-base font-sans shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-orange-500 focus-visible:ring-offset-2 focus-visible:ring-offset-zinc-950 disabled:cursor-not-allowed disabled:opacity-50 md:text-sm"
                  required
                >
                  <option value={UserRole.CUSTOMER}>Vehicle Owner (Customer)</option>
                  <option value={UserRole.EMPLOYEE}>Service Technician (Employee)</option>
                </select>
                <p className="text-xs text-gray-400">
                  Choose how you'll be using DriveCare
                </p>
              </div> */}

              <Button 
                type="submit" 
                className="w-full bg-orange-500 hover:bg-orange-600 text-white" 
                disabled={isLoading}
              >
                {isLoading ? 'Completing Profile...' : 'Complete Profile'}
              </Button>

              {/* <Button 
                type="button"
                variant="outline"
                className="w-full border-zinc-800 bg-zinc-900 text-gray-400 hover:bg-zinc-800 hover:text-white"
                onClick={handleSkip}
                disabled={isLoading}
              >
                Skip for Now
              </Button> */}

              <div className="text-center text-xs text-gray-400">
                <p>You can always update your profile later in settings.</p>
              </div>
            </div>
          </form>
          <div className="relative hidden bg-zinc-900 md:block">
            <img
              src="/IAE-Blog-3.18.24.png"
              alt="Complete your profile"
              className="absolute inset-0 h-full w-full object-cover dark:brightness-[0.6]"
            />
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
