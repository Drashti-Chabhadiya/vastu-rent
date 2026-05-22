import { createFileRoute } from '@tanstack/react-router'
import { Button } from '@/components/ui/button'

export const Route = createFileRoute('/_authenticated/account/profile')({
  component: AccountProfileSettings,
})

function AccountProfileSettings() {
  return (
    <div className="p-4 md:p-6">
      <h1 className="text-2xl font-black text-gray-900 mb-2">
        Account Settings
      </h1>
      <p className="text-sm text-gray-500 mb-8">
        Manage your account security, notifications, and lister preferences.
      </p>

      <div className="space-y-6">
        <div className="bg-white border border-gray-100 rounded-2xl p-6 flex items-center justify-between shadow-sm">
          <div>
            <h4 className="font-bold text-gray-900">Email Notifications</h4>
            <p className="text-sm text-gray-500">
              Receive updates about your bookings and listings.
            </p>
          </div>
          <div className="w-12 h-6 bg-primary rounded-full relative cursor-pointer">
            <div className="absolute right-1 top-1 w-4 h-4 bg-white rounded-full"></div>
          </div>
        </div>

        <div className="bg-white border border-gray-100 rounded-2xl p-6 flex items-center justify-between shadow-sm">
          <div>
            <h4 className="font-bold text-gray-900">
              Two-Factor Authentication
            </h4>
            <p className="text-sm text-gray-500">
              Add an extra layer of security to your account.
            </p>
          </div>
          <Button variant="link" className="text-primary font-bold text-sm hover:underline p-0 h-auto">
            Enable
          </Button>
        </div>

        <div className="bg-red-50/50 border border-red-100 rounded-2xl p-6 flex items-center justify-between">
          <div>
            <h4 className="font-bold text-red-600">Delete Account Request</h4>
            <p className="text-sm text-red-500">
              Send a request to Super Admins to permanently purge your data.
            </p>
          </div>
          <Button variant="destructive" className="bg-red-600 hover:bg-red-700 text-white font-bold h-10 px-6 rounded-xl transition-all active:scale-[0.98]">
            Request Purge
          </Button>
        </div>
      </div>
    </div>
  )
}

