import Auth from '@/app/components/Auth';

export default function LoginPage() {
  return (
    <div className="max-w-md w-full space-y-8 bg-white p-8 rounded-lg shadow-md">
      <div>
        <h1 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
          Welcome Back
        </h1>
        <p className="mt-2 text-center text-sm text-gray-600">
          Sign in to your account to continue
        </p>
      </div>
      <Auth />
    </div>
  );
} 