import { AccountSettings } from '@/components/settings/account-settings'
import { DeleteAccount } from '@/components/settings/delete-account'

export default function SettingsPage() {
  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <AccountSettings />
      <DeleteAccount />
    </div>
  )
}
