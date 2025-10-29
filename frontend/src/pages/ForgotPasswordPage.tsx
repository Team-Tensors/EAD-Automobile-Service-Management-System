import { ForgotPasswordForm } from '../components/forgotPassword/forgot-password-form'

export default function ForgotPasswordPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-zinc-950 p-4">
      <div className="w-full max-w-4xl">
        <ForgotPasswordForm />
      </div>
    </div>
  )
}
