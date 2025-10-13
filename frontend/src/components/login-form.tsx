import type React from "react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import type { LoginCredentials } from '../types/auth';
import { useState } from "react"

 
  
export function LoginForm({ className, ...props }: React.ComponentProps<"div">) {

   const navigate = useNavigate();
  const { login, isLoading, error, clearError } = useAuth();
  
  const [formData, setFormData] = useState<LoginCredentials>({
    email: '',
    password: '',
    rememberMe: false,
  });

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      const { name, value, type, checked } = e.target;
      setFormData(prev => ({
        ...prev,
        [name]: type === 'checkbox' ? checked : value,
      }));
      
      // Clear field error when user starts typing
      if (formErrors[name]) {
        setFormErrors(prev => ({ ...prev, [name]: '' }));
      }
      
      // Clear auth error
      if (error) {
        clearError();
      }
    };
  
    const validateForm = (): boolean => {
      const errors: { [key: string]: string } = {};
      
      if (!formData.email) {
        errors.email = 'Email is required';
      }
      
      if (!formData.password) {
        errors.password = 'Password is required';
      }
      
      setFormErrors(errors);
      return Object.keys(errors).length === 0;
    };
  
    const handleSubmit = async (e: React.FormEvent) => {
      e.preventDefault();
      
      if (!validateForm()) return;
      
      try {
        await login(formData);
        navigate('/dashboard'); // Redirect to dashboard after successful login
      } catch (err) {
        // Error is handled by the auth context
        console.error('Login failed:', err);
      }
    };

  const [formErrors, setFormErrors] = useState<{ [key: string]: string }>({});
  return (
    <div className={cn("flex flex-col gap-6", className)} {...props}>
      <Card className="overflow-hidden bg-zinc-950 border-zinc-800">
        <CardContent className="grid p-0 md:grid-cols-2">
          <form className="p-6 md:p-8" onSubmit={handleSubmit}>
            <div className="flex flex-col gap-6">
              <div className="flex flex-col items-center text-center">
                <span className="text-3xl font-bold text-white tracking-wider">DRIVE<span className="text-orange-500">CARE</span></span>
                <h1 className="text-2xl font-bold font-heading text-white">Welcome back</h1>
                <p className="text-balance text-gray-400">Login to your DriveCare account</p>
              </div>
              {error && (
                <div className="text-red-400 bg-red-950/50 p-3 rounded border border-red-800 mb-2">
                  {error}
                </div>
              )}
              
              <div className="grid gap-2">
                <Label htmlFor="email" className="text-white">Email</Label>
                <Input 
                  id="email" 
                  name="email"
                  type="email" 
                  placeholder="example@gmail.com" 
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
                <div className="flex items-center">
                  <Label htmlFor="password" className="text-white">Password</Label>
                  <a href="#" className="ml-auto text-sm underline-offset-2 hover:underline text-orange-500 hover:text-orange-600">
                    Forgot your password?
                  </a>
                </div>
                <Input 
                  id="password" 
                  name="password"
                  type="password" 
                  value={formData.password}
                  onChange={handleChange}
                  className={`border-zinc-800 bg-zinc-900 text-white placeholder:text-gray-500 focus-visible:ring-orange-500 focus-visible:ring-offset-zinc-950 ${formErrors.password ? 'border-red-400 focus:border-red-500' : ''}`}
                  required 
                />
                {formErrors.password && (
                  <span className="text-red-400 text-sm mt-1 block">
                    {formErrors.password}
                  </span>
                )}
              </div>
              <div className="flex items-center justify-between mb-4">
                <label className="flex items-center text-sm font-medium cursor-pointer text-gray-400">
                  <input
                    type="checkbox"
                    name="rememberMe"
                    checked={formData.rememberMe}
                    onChange={handleChange}
                    className="mr-2 h-4 w-4 text-orange-500 focus:ring-orange-500 focus:ring-2 border-zinc-800 bg-zinc-900 rounded"
                  />
                  Remember me
                </label>
              </div>
              
              <Button type="submit" className="w-full bg-orange-500 hover:bg-orange-600 text-white" disabled={isLoading}>
                {isLoading ? 'Signing in...' : 'Login'}
              </Button>
              <div className="relative text-center text-sm after:absolute after:inset-0 after:top-1 after:z-0 after:flex after:items-center ">
                <span className="relative z-10 px-2 text-gray-400">Or continue with</span>
              </div>
              <div className="">
              
                <Button variant="outline" className="w-full border-zinc-800 bg-zinc-900 text-white hover:bg-zinc-800 hover:text-white">
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" className="mr-2 h-5 w-5">
                  <path
                    d="M12.48 10.92v3.28h7.84c-.24 1.84-.853 3.187-1.787 4.133-1.147 1.147-2.933 2.4-6.053 2.4-4.827 0-8.6-3.893-8.6-8.72s3.773-8.72 8.6-8.72c2.6 0 4.507 1.027 5.907 2.347l2.307-2.307C18.747 1.44 16.133 0 12.48 0 5.867 0 .307 5.387.307 12s5.56 12 12.173 12c3.573 0 6.267-1.173 8.373-3.36 2.16-2.16 2.84-5.213 2.84-7.667 0-.76-.053-1.467-.173-2.053H12.48z"
                    fill="currentColor"
                  />
                </svg>
                  <span className="">Google</span>
                </Button>
               
              </div>
              <div className="text-center text-sm text-gray-400">
                Don&apos;t have an account?{" "}
                <Link to="/register" className="underline underline-offset-4 text-orange-500 hover:text-orange-600">
                  Sign up
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