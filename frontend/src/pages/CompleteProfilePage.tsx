import { CompleteProfileForm } from '../components/registerPage/complete-profile-form'

export function CompleteProfilePage() {
  return (
    <div className="min-h-screen bg-zinc-950 flex items-center justify-center p-4">
      <div className="w-full max-w-4xl">
        <CompleteProfileForm />
      </div>
    </div>
  )
}

export default CompleteProfilePage
