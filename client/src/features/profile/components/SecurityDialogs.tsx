import { ChangePasswordDialog } from './ChangePasswordDialog'
import { TwoFactorDialog } from './TwoFactorDialog'
import { SessionsDialog } from './SessionsDialog'
import { DevicesDialog } from './DevicesDialog'

interface SecurityDialogsProps {
  pwOpen: boolean
  setPwOpen: (open: boolean) => void
  tfaOpen: boolean
  setTfaOpen: (open: boolean) => void
  sessOpen: boolean
  setSessOpen: (open: boolean) => void
  devOpen: boolean
  setDevOpen: (open: boolean) => void
  twoFactorEnabled: boolean
  handleToggleTwoFactor: (enabled: boolean) => void
  userEmail?: string
}

export function SecurityDialogs({
  pwOpen,
  setPwOpen,
  tfaOpen,
  setTfaOpen,
  sessOpen,
  setSessOpen,
  devOpen,
  setDevOpen,
  twoFactorEnabled,
  handleToggleTwoFactor,
  userEmail = '',
}: SecurityDialogsProps) {
  return (
    <>
      <ChangePasswordDialog open={pwOpen} onOpenChange={setPwOpen} />
      <TwoFactorDialog
        open={tfaOpen}
        onOpenChange={setTfaOpen}
        twoFactorEnabled={twoFactorEnabled}
        setTwoFactorEnabled={handleToggleTwoFactor}
        userEmail={userEmail}
      />
      <SessionsDialog open={sessOpen} onOpenChange={setSessOpen} />
      <DevicesDialog open={devOpen} onOpenChange={setDevOpen} />
    </>
  )
}
