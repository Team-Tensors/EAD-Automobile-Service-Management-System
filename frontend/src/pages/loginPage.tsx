import { LoginForm } from "../components/loginPage/login-form"

export default function LoginPage() {
  return (
    <div className="flex min-h-svh flex-col items-center justify-center bg-zinc-950 p-6 md:p-10">
      <div className="w-full max-w-md md:max-w-4xl">
        <LoginForm />
      </div>
    </div>
  )
}
