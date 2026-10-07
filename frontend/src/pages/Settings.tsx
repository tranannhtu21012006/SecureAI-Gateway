import { useAuth } from '../services/auth';

export default function Settings() {
  const { user } = useAuth();

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <h1 className="text-2xl font-bold dark:text-white">Settings</h1>
      <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow">
        <h2 className="text-lg font-medium mb-4 dark:text-white">Profile Information</h2>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Email</label>
            <div className="mt-1 text-gray-900 dark:text-white">{user?.email}</div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Role</label>
            <div className="mt-1 text-gray-900 dark:text-white capitalize">{user?.role}</div>
          </div>
        </div>
      </div>
    </div>
  );
}
