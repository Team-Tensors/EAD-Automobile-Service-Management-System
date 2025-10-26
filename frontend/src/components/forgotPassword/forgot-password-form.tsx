import type React from "react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Link } from 'react-router-dom'
import { useState } from "react"
import { ArrowLeft, Mail, CheckCircle } from "lucide-react"
import { authService } from "@/services/authService"

export function ForgotPasswordForm({ className, ...props }: React.ComponentProps<"div">) {
  const [email, setEmail] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)
  const [formError, setFormError] = useState('')

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setEmail(e.target.value)
    // Clear errors when user types
    if (error) setError(null)
    if (formError) setFormError('')
  }

  const validateForm = (): boolean => {
    if (!email) {
      setFormError('Email is required')
      return false
    }
    
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(email)) {
      setFormError('Please enter a valid email address')
      return false
    }
    
    return true
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!validateForm()) return
    
    setIsLoading(true)
    setError(null)
    
    try {
      const response = await authService.forgotPassword(email)
      setSuccess(true)
      console.log('Password reset email sent:', response)
    } catch (err) {
      const errorMessage = (err as Error).message || 'Failed to send reset email. Please try again.'
      setError(errorMessage)
    } finally {
      setIsLoading(false)
    }
  }

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
                <h1 className="text-2xl font-bold text-white mb-2">Check Your Email</h1>
                <p className="text-gray-400 mb-4">
                  We've sent a password reset link to <strong className="text-white">{email}</strong>
                </p>
                <p className="text-sm text-gray-500">
                  Click the link in the email to reset your password. 
                  The link will expire in 1 hour.
                </p>
              </div>

              <Alert className="bg-blue-500/10 border-blue-500/50 text-blue-300 w-full">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                </svg>
                <AlertDescription>
                  <strong>Didn't receive the email?</strong><br />
                  Check your spam folder or{' '}
                  <button 
                    onClick={() => setSuccess(false)} 
                    className="underline text-blue-400 hover:text-blue-500"
                  >
                    try again
                  </button>
                </AlertDescription>
              </Alert>

              <Link 
                to="/login" 
                className="flex items-center gap-2 text-orange-500 hover:text-orange-600 transition-colors"
              >
                <ArrowLeft className="w-4 h-4" />
                Back to login
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

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
                <h1 className="text-2xl font-bold font-heading text-white mt-4">Forgot Password?</h1>
                <p className="text-balance text-gray-400">
                  No worries! Enter your email and we'll send you reset instructions.
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
                <Label htmlFor="email" className="text-white">Email Address</Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                  <Input 
                    id="email" 
                    name="email"
                    type="email" 
                    placeholder="example@gmail.com" 
                    value={email}
                    onChange={handleChange}
                    className={`pl-10 border-zinc-800 bg-zinc-900 text-white placeholder:text-gray-500 focus-visible:ring-orange-500 focus-visible:ring-offset-zinc-950 transition-all ${formError ? 'border-red-500 focus:border-red-500 focus-visible:ring-red-500 bg-red-950/20' : ''}`}
                    required 
                    aria-invalid={formError ? "true" : "false"}
                    aria-describedby={formError ? "email-error" : undefined}
                  />
                </div>
                {formError && (
                  <Alert variant="destructive" className="mt-2" id="email-error">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 flex-shrink-0" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                    </svg>
                    <AlertDescription className="font-medium">
                      {formError}
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
                    Sending...
                  </span>
                ) : (
                  'Send Reset Link'
                )}
              </Button>

              <div className="text-center">
                <Link 
                  to="/login" 
                  className="inline-flex items-center gap-2 text-sm text-gray-400 hover:text-orange-500 transition-colors"
                >
                  <ArrowLeft className="w-4 h-4" />
                  Back to login
                </Link>
              </div>
            </div>
          </form>

          <div className="relative hidden bg-zinc-900 md:block">
            <img
              src="/IAE-Blog-3.18.24.png"
              alt="Forgot Password"
              className="absolute inset-0 h-full w-full object-cover dark:brightness-[0.6]"
            />
          </div>
        </CardContent>
      </Card>

      <div className="text-balance text-center text-xs text-gray-400">
        Remember your password?{" "}
        <Link to="/login" className="underline underline-offset-4 text-orange-500 hover:text-orange-600">
          Sign in here
        </Link>
      </div>
    </div>
  )
}
