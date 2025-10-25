import { EmployeeRegisterForm } from '../components/employeeRegisterPage/employeeRegister-form'

export function EmployeeRegisterPage() {
  return (
    <div className="min-h-screen bg-zinc-950 flex items-center justify-center p-4">
      <div className="w-full max-w-4xl">
        <EmployeeRegisterForm />
      </div>
    </div>
  )
}

export default EmployeeRegisterPage
