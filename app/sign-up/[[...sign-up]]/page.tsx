import { SignUp } from '@clerk/nextjs'

export default function SignUpPage() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-zinc-50">
      <div className="w-full max-w-md">
        <div className="mb-8 text-center">
          <h1 className="text-xl font-semibold text-zinc-900">Incompass Research</h1>
          <p className="mt-1 text-sm text-zinc-500">Create your account</p>
        </div>
        <SignUp />
      </div>
    </div>
  )
}
