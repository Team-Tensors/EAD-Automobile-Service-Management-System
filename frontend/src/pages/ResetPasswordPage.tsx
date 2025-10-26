import { ResetPasswordForm } from '../components/forgotPassword/reset-password-form'

export default function ResetPasswordPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-zinc-950 p-4">
      <div className="w-full max-w-4xl">
        <ResetPasswordForm />
      </div>
    </div>
  )
}
