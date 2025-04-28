import GoogleAuthTest from "../../src/components/GoogleAuthTest"

export default function AuthTestPage() {
  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-md mx-auto">
        <h1 className="text-2xl font-bold mb-6">Google Authentication Test</h1>
        <GoogleAuthTest />
      </div>
    </div>
  )
}
