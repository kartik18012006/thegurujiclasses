const Settings = () => {
  return (
    <div className="max-w-4xl mx-auto">
      <div className="bg-white rounded-lg shadow-md border border-gray-200 p-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">Settings</h1>
        
        <div className="space-y-8">
          {/* Theme Settings */}
          <div>
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Theme</h2>
            <div className="space-y-3">
              <label className="flex items-center">
                <input
                  type="radio"
                  name="theme"
                  value="light"
                  defaultChecked
                  className="mr-3"
                  disabled
                />
                <span className="text-gray-700">Light</span>
              </label>
              <label className="flex items-center">
                <input
                  type="radio"
                  name="theme"
                  value="dark"
                  className="mr-3"
                  disabled
                />
                <span className="text-gray-700">Dark</span>
              </label>
              <label className="flex items-center">
                <input
                  type="radio"
                  name="theme"
                  value="system"
                  className="mr-3"
                  disabled
                />
                <span className="text-gray-700">System</span>
              </label>
            </div>
          </div>

          {/* Notification Settings */}
          <div>
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Notifications</h2>
            <div className="space-y-3">
              <label className="flex items-center">
                <input
                  type="checkbox"
                  className="mr-3"
                  disabled
                />
                <span className="text-gray-700">Email notifications</span>
              </label>
              <label className="flex items-center">
                <input
                  type="checkbox"
                  className="mr-3"
                  disabled
                />
                <span className="text-gray-700">Push notifications</span>
              </label>
              <label className="flex items-center">
                <input
                  type="checkbox"
                  className="mr-3"
                  disabled
                />
                <span className="text-gray-700">SMS notifications</span>
              </label>
            </div>
          </div>

          {/* Note */}
          <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
            <p className="text-sm text-gray-600">
              Settings are currently read-only. Functionality will be available in a future update.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Settings;


