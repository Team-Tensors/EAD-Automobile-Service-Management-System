import { RegisterForm } from "../components/registerPage/register-form"

export default function RegisterPage() {
  return (
    <div className="flex min-h-svh flex-col items-center justify-center bg-zinc-950 p-6 md:p-10">
      <div className="w-full max-w-md md:max-w-6xl px-10">
        <RegisterForm />
      </div>
    </div>
  )
}
