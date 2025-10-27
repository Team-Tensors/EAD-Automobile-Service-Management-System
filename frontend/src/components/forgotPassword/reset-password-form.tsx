import type React from "react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Link, useNavigate, useSearchParams } from 'react-router-dom'
import { useState, useEffect } from "react"
import { Eye, EyeOff, CheckCircle, XCircle } from "lucide-react"
import { authService } from "@/services/authService"

export function ResetPasswordForm({ className, ...props }: React.ComponentProps<"div">) {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const token = searchParams.get('token')

  const [formData, setFormData] = useState({
    newPassword: '',
    confirmPassword: ''
  })
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [isVerifying, setIsVerifying] = useState(true)
  const [tokenValid, setTokenValid] = useState(false)
  const [userEmail, setUserEmail] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)
  const [formErrors, setFormErrors] = useState<{ [key: string]: string }>({})

  // Verify token on component mount
  useEffect(() => {
    const verifyToken = async () => {
      if (!token) {
        setError('Invalid or missing reset token')
        setIsVerifying(false)
        setTokenValid(false)
        return
      }

      try {
        const response = await authService.verifyResetToken(token)
        if (response.valid) {
          setTokenValid(true)
          if (response.email) {
            setUserEmail(response.email)
          }
        } else {
          setError('This reset link has expired or is invalid')
          setTokenValid(false)
        }
      } catch {
        setError('Unable to verify reset link. It may have expired.')
        setTokenValid(false)
      } finally {
        setIsVerifying(false)
      }
    }

    verifyToken()
  }, [token])

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))

    // Clear field-specific error when user starts typing
    if (formErrors[name]) {
      setFormErrors(prev => ({ ...prev, [name]: '' }))
    }

    // Clear general error
    if (error) setError(null)
  }

  const validateForm = (): boolean => {
    const errors: { [key: string]: string } = {}

    if (!formData.newPassword) {
      errors.newPassword = 'Password is required'
    } else if (formData.newPassword.length < 8) {
      errors.newPassword = 'Password must be at least 8 characters long'
    } else if (!/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/.test(formData.newPassword)) {
      errors.newPassword = 'Password must contain uppercase, lowercase, and numbers'
    }

    if (!formData.confirmPassword) {
      errors.confirmPassword = 'Please confirm your password'
    } else if (formData.newPassword !== formData.confirmPassword) {
      errors.confirmPassword = 'Passwords do not match'
    }

    setFormErrors(errors)
    return Object.keys(errors).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!validateForm() || !token) return

    setIsLoading(true)
    setError(null)

    try {
      await authService.resetPassword(token, formData.newPassword)
      setSuccess(true)
      
      // Redirect to login after 3 seconds
      setTimeout(() => {
        navigate('/login')
      }, 3000)
    } catch (err) {
      const errorMessage = (err as Error).message || 'Failed to reset password. Please try again.'
      setError(errorMessage)
    } finally {
      setIsLoading(false)
    }
  }

  // Loading state while verifying token
  if (isVerifying) {
    return (
      <div className={cn("flex flex-col gap-6", className)} {...props}>
        <Card className="overflow-hidden bg-zinc-950 border-zinc-800">
          <CardContent className="p-8">
            <div className="flex flex-col items-center text-center gap-6">
              <svg className="animate-spin h-12 w-12 text-orange-500" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
              </svg>
              <div>
                <h1 className="text-2xl font-bold text-white mb-2">Verifying Reset Link</h1>
                <p className="text-gray-400">Please wait...</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  // Invalid token state
  if (!tokenValid) {
    return (
      <div className={cn("flex flex-col gap-6", className)} {...props}>
        <Card className="overflow-hidden bg-zinc-950 border-zinc-800">
          <CardContent className="p-8">
            <div className="flex flex-col items-center text-center gap-6">
              <div className="rounded-full bg-red-500/10 p-3">
                <XCircle className="w-12 h-12 text-red-500" />
              </div>

              <div>
                <h1 className="text-2xl font-bold text-white mb-2">Invalid Reset Link</h1>
                <p className="text-gray-400 mb-4">{error}</p>
              </div>

              <div className="flex flex-col gap-3 w-full max-w-sm">
                <Link to="/forgot-password">
                  <Button className="w-full bg-orange-500 hover:bg-orange-600 text-white">
                    Request New Reset Link
                  </Button>
                </Link>
                <Link to="/login">
                  <Button variant="outline" className="w-full border-zinc-800 bg-zinc-900 text-white hover:bg-zinc-800">
                    Back to Login
                  </Button>
                </Link>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  // Success state
  if (success) {
    return (
      <div className={cn("flex flex-col gap-6", className)} {...props}>
        <Card className="overflow-hidden bg-zinc-950 border-zinc-800">
          <CardContent className="p-8">
            <div className="flex flex-col items-center text-center gap-6">
              <div className="rounded-full bg-green-500/10 p-3">
                <CheckCircle className="w-12 h-12 text-green-500" />
              </div>

              <div>
                <h1 className="text-2xl font-bold text-white mb-2">Password Reset Successful!</h1>
                <p className="text-gray-400 mb-4">
                  Your password has been reset successfully.
                </p>
                <p className="text-sm text-gray-500">
                  Redirecting to login page...
                </p>
              </div>

              <Link to="/login">
                <Button className="bg-orange-500 hover:bg-orange-600 text-white">
                  Go to Login
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  // Reset password form
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
                <h1 className="text-2xl font-bold font-heading text-white mt-4">Reset Password</h1>
                <p className="text-balance text-gray-400">
                  {userEmail && `For ${userEmail}`}
                </p>
                <p className="text-sm text-gray-500 mt-2">
                  Enter your new password below
                </p>
              </div>

              {error && (
                <Alert variant="destructive">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                  </svg>
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}

              <div className="grid gap-2">
                <Label htmlFor="newPassword" className="text-white">New Password</Label>
                <div className="relative">
                  <Input 
                    id="newPassword" 
                    name="newPassword"
                    type={showPassword ? "text" : "password"}
                    value={formData.newPassword}
                    onChange={handleChange}
                    className={`border-zinc-800 bg-zinc-900 text-white placeholder:text-gray-500 focus-visible:ring-orange-500 focus-visible:ring-offset-zinc-950 transition-all pr-10 ${formErrors.newPassword ? 'border-red-500 focus:border-red-500 focus-visible:ring-red-500 bg-red-950/20' : ''}`}
                    placeholder="Enter new password"
                    required 
                    aria-invalid={formErrors.newPassword ? "true" : "false"}
                    aria-describedby={formErrors.newPassword ? "password-error" : undefined}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white transition-colors"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
                {formErrors.newPassword && (
                  <Alert variant="destructive" className="mt-2" id="password-error">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 flex-shrink-0" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                    </svg>
                    <AlertDescription className="font-medium">
                      {formErrors.newPassword}
                    </AlertDescription>
                  </Alert>
                )}
                <p className="text-xs text-gray-500">
                  Must be at least 8 characters with uppercase, lowercase, and numbers
                </p>
              </div>

              <div className="grid gap-2">
                <Label htmlFor="confirmPassword" className="text-white">Confirm New Password</Label>
                <div className="relative">
                  <Input 
                    id="confirmPassword" 
                    name="confirmPassword"
                    type={showConfirmPassword ? "text" : "password"}
                    value={formData.confirmPassword}
                    onChange={handleChange}
                    className={`border-zinc-800 bg-zinc-900 text-white placeholder:text-gray-500 focus-visible:ring-orange-500 focus-visible:ring-offset-zinc-950 transition-all pr-10 ${formErrors.confirmPassword ? 'border-red-500 focus:border-red-500 focus-visible:ring-red-500 bg-red-950/20' : ''}`}
                    placeholder="Confirm new password"
                    required 
                    aria-invalid={formErrors.confirmPassword ? "true" : "false"}
                    aria-describedby={formErrors.confirmPassword ? "confirm-password-error" : undefined}
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
                  <Alert variant="destructive" className="mt-2" id="confirm-password-error">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 flex-shrink-0" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                    </svg>
                    <AlertDescription className="font-medium">
                      {formErrors.confirmPassword}
                    </AlertDescription>
                  </Alert>
                )}
              </div>

              <Button 
                type="submit" 
                className="w-full bg-orange-500 hover:bg-orange-600 text-white" 
                disabled={isLoading}
              >
                {isLoading ? (
                  <span className="flex items-center gap-2">
                    <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                    </svg>
                    Resetting Password...
                  </span>
                ) : (
                  'Reset Password'
                )}
              </Button>

              <div className="text-center">
                <Link 
                  to="/login" 
                  className="text-sm text-gray-400 hover:text-orange-500 transition-colors"
                >
                  Back to login
                </Link>
              </div>
            </div>
          </form>

          <div className="relative hidden bg-zinc-900 md:block">
            <img
              src="/IAE-Blog-3.18.24.png"
              alt="Reset Password"
              className="absolute inset-0 h-full w-full object-cover dark:brightness-[0.6]"
            />
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
