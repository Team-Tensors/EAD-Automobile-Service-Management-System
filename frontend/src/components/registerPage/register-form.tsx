import type React from "react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../../hooks/useAuth'
import { UserRole } from '../../types/auth'
import type { RegisterData } from '../../types/auth'
import { useState } from "react"
import { Eye, EyeOff } from "lucide-react"

export function RegisterForm({ className, ...props }: React.ComponentProps<"div">) {
  const navigate = useNavigate()
  const { register, isLoading, error, clearError } = useAuth()
  
  const [formData, setFormData] = useState<RegisterData>({
    email: '',
    password: '',
    fullName: '',
    phoneNumber: '',
    address: '',
    role: UserRole.CUSTOMER,
    confirmPassword: '',
  })
  
  const [formErrors, setFormErrors] = useState<{ [key: string]: string }>({})
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)

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
      clearError()
    }
  }

  const validateForm = (): boolean => {
    const errors: { [key: string]: string } = {}
    
    if (!formData.fullName?.trim()) {
      errors.fullName = 'Full name is required'
    }
    
    if (!formData.email) {
      errors.email = 'Email is required'
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      errors.email = 'Email is invalid'
    }
    
    if (!formData.password) {
      errors.password = 'Password is required'
    } else if (formData.password.length < 8) {
      errors.password = 'Password must be at least 8 characters long'
    }
    
    if (!formData.confirmPassword) {
      errors.confirmPassword = 'Please confirm your password'
    } else if (formData.password !== formData.confirmPassword) {
      errors.confirmPassword = 'Passwords do not match'
    }
    
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
    
    try {
      const registrationData = {
        email: formData.email,
        password: formData.password,
        fullName: formData.fullName,
        phoneNumber: formData.phoneNumber,
        address: formData.address || '',
        role: formData.role,
        confirmPassword: formData.confirmPassword,
      }
      
      await register(registrationData)
      navigate('/dashboard')
    } catch (err) {
      console.error('Registration failed:', err)
    }
  }

  const handleGoogleSignup = () => {
    // Redirect to backend OAuth endpoint
    window.location.href = `${import.meta.env.VITE_API_URL || 'http://localhost:4000/api'}/oauth2/authorization/google`;
  };

  return (
    <div className={cn("flex flex-col gap-6", className)} {...props}>
      <Card className="overflow-hidden bg-zinc-950 border-zinc-800">
        <CardContent className="grid p-0 md:grid-cols-2">
          <form className="p-6 md:p-8" onSubmit={handleSubmit}>
            <div className="flex flex-col gap-6">
              <div className="flex flex-col items-center text-center">
                <span className="text-3xl font-bold text-white tracking-wider font-heading">DRIVE<span className="text-orange-600">CARE</span></span>
                <h1 className="text-2xl font-bold text-white">Create an account</h1>
                <p className="text-balance text-gray-400">Sign up for your DriveCare account</p>
              </div>
              
              {error && (
                <div className="text-red-400 bg-red-950/50 p-3 rounded border border-red-800 mb-2">
                  {error}
                </div>
              )}
              <div className="grid gap-2">
                <Label htmlFor="fullName" className="text-white">Full Name</Label>
                <Input 
                  id="fullName" 
                  name="fullName"
                  type="text" 
                  placeholder="John Doe" 
                  value={formData.fullName}
                  onChange={handleChange}
                  className={`border-zinc-800 bg-zinc-900 text-white placeholder:text-gray-500 focus-visible:ring-orange-500 focus-visible:ring-offset-zinc-950 ${formErrors.fullName ? 'border-red-400 focus:border-red-500' : ''}`}
                  required 
                />
                {formErrors.fullName && (
                  <span className="text-red-400 text-sm mt-1 block">
                    {formErrors.fullName}
                  </span>
                )}
              </div>
              <div className="grid gap-2">
                <Label htmlFor="email" className="text-white">Email</Label>
                <Input 
                  id="email" 
                  name="email"
                  type="email" 
                  placeholder="m@example.com" 
                  value={formData.email}
                  onChange={handleChange}
                  className={`border-zinc-800 bg-zinc-900 text-white placeholder:text-gray-500 focus-visible:ring-orange-500 focus-visible:ring-offset-zinc-950 ${formErrors.email ? 'border-red-400 focus:border-red-500' : ''}`}
                  required 
                />
                {formErrors.email && (
                  <span className="text-red-400 text-sm mt-1 block">
                    {formErrors.email}
                  </span>
                )}
              </div>
              <div className="grid gap-2">
                <Label htmlFor="phoneNumber" className="text-white">Phone Number</Label>
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
                  className={`border-zinc-800 bg-zinc-900 text-white placeholder:text-gray-500 focus-visible:ring-orange-500 focus-visible:ring-offset-zinc-950 ${formErrors.address ? 'border-red-400 focus:border-red-500' : ''}`}
                />
                {formErrors.address && (
                  <span className="text-red-400 text-sm mt-1 block">
                    {formErrors.address}
                  </span>
                )}
              </div>
  
              <div className="grid gap-2">
                <Label htmlFor="password" className="text-white">Password</Label>
                <div className="relative">
                  <Input 
                    id="password" 
                    name="password"
                    type={showPassword ? "text" : "password"}
                    placeholder="Must be at least 8 characters"
                    value={formData.password}
                    onChange={handleChange}
                    className={`border-zinc-800 bg-zinc-900 text-white placeholder:text-gray-500 focus-visible:ring-orange-500 focus-visible:ring-offset-zinc-950 pr-10 ${formErrors.password ? 'border-red-400 focus:border-red-500' : ''}`}
                    required 
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white transition-colors"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
                {formErrors.password && (
                  <span className="text-red-400 text-sm mt-1 block">
                    {formErrors.password}
                  </span>
                )}
              </div>
              <div className="grid gap-2">
                <Label htmlFor="confirmPassword" className="text-white">Confirm Password</Label>
                <div className="relative">
                  <Input 
                    id="confirmPassword" 
                    name="confirmPassword"
                    type={showConfirmPassword ? "text" : "password"}
                    placeholder="Confirm your password"
                    value={formData.confirmPassword}
                    onChange={handleChange}
                    className={`border-zinc-800 bg-zinc-900 text-white placeholder:text-gray-500 focus-visible:ring-orange-500 focus-visible:ring-offset-zinc-950 pr-10 ${formErrors.confirmPassword ? 'border-red-400 focus:border-red-500' : ''}`}
                    required 
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white transition-colors"
                  >
                    {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
                {formErrors.confirmPassword && (
                  <span className="text-red-400 text-sm mt-1 block">
                    {formErrors.confirmPassword}
                  </span>
                )}
              </div>
              <Button type="submit" className="w-full bg-orange-600 hover:bg-orange-700 text-white" disabled={isLoading}>
                {isLoading ? 'Creating Account...' : 'Sign Up'}
              </Button>
              <div className="relative text-center text-sm">
                <span className="relative z-10 bg-zinc-950 px-2 text-gray-400">Or Sign up with </span>
              </div>
              <Button 
                type="button"
                variant="outline" 
                className="w-full border-zinc-800 bg-zinc-900 text-white hover:bg-zinc-800 hover:text-white"
                onClick={handleGoogleSignup}
              >
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" className="mr-2 h-5 w-5">
                  <path
                    d="M12.48 10.92v3.28h7.84c-.24 1.84-.853 3.187-1.787 4.133-1.147 1.147-2.933 2.4-6.053 2.4-4.827 0-8.6-3.893-8.6-8.72s3.773-8.72 8.6-8.72c2.6 0 4.507 1.027 5.907 2.347l2.307-2.307C18.747 1.44 16.133 0 12.48 0 5.867 0 .307 5.387.307 12s5.56 12 12.173 12c3.573 0 6.267-1.173 8.373-3.36 2.16-2.16 2.84-5.213 2.84-7.667 0-.76-.053-1.467-.173-2.053H12.48z"
                    fill="currentColor"
                  />
                </svg>
              Google
              </Button>
              <div className="text-center text-sm text-gray-400">
                Already have an account?{" "}
                <Link to="/login" className="underline underline-offset-4 text-orange-600 hover:text-orange-700">
                  Login
                </Link>
              </div>
              <div className="text-center text-sm text-gray-400">
                Joining as a service technician?{" "}
                <Link to="/register/employee" className="underline underline-offset-4 text-orange-600 hover:text-orange-700">
                  Employee Registration
                </Link>
              </div>
            </div>
          </form>
          <div className="relative hidden bg-zinc-900 md:block">
            <img
               src="/IAE-Blog-3.18.24.png"
              alt="Image"
              className="absolute inset-0 h-full w-full object-cover dark:brightness-[0.6]"
            />
          </div>
        </CardContent>
      </Card>
      <div className="text-balance text-center text-xs text-gray-400 [&_a]:underline [&_a]:underline-offset-4 hover:[&_a]:text-orange-500">
        By clicking continue, you agree to our <a href="#">Terms of Service</a> and <a href="#">Privacy Policy</a>.
      </div>
    </div>
  )
}