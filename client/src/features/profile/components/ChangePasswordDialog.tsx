import { useState } from 'react'
import { authClient } from '#/lib/auth/auth-client'
import { Button } from '#/components/ui/button'
import { cn } from '#/lib/utils'
import { Input } from '#/components/ui/input'
import { Label } from '#/components/ui/label'
import { KeyRound, ShieldAlert, Eye, EyeOff } from 'lucide-react'
import { Loader } from '#/components/ui/loader'
import { toast } from 'sonner'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '#/components/ui/dialog'

interface ChangePasswordDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function ChangePasswordDialog({
  open,
  onOpenChange,
}: ChangePasswordDialogProps) {
  const [currentPassword, setCurrentPassword] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [showCurrentPassword, setShowCurrentPassword] = useState(false)
  const [showNewPassword, setShowNewPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [isChangingPassword, setIsChangingPassword] = useState(false)
  const [changePasswordError, setChangePasswordError] = useState<string | null>(
    null,
  )

  // Password strength logic
  const getPasswordStrength = (password: string) => {
    if (!password) return { score: 0, label: 'None', color: 'bg-muted' }
    let score = 0
    if (password.length >= 8) score += 1
    if (/[A-Z]/.test(password)) score += 1
    if (/[0-9]/.test(password)) score += 1
    if (/[^A-Za-z0-9]/.test(password)) score += 1

    if (score <= 1) return { score: 25, label: 'Weak', color: 'bg-destructive' }
    if (score === 2) return { score: 50, label: 'Fair', color: 'bg-orange-500' }
    if (score === 3) return { score: 75, label: 'Good', color: 'bg-yellow-500' }
    return { score: 100, label: 'Strong', color: 'bg-primary' }
  }

  const handleChangePasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setChangePasswordError(null)

    if (!currentPassword) {
      setChangePasswordError('Current password is required.')
      return
    }
    if (newPassword.length < 8) {
      setChangePasswordError('New password must be at least 8 characters.')
      return
    }
    if (newPassword !== confirmPassword) {
      setChangePasswordError('Passwords do not match.')
      return
    }

    setIsChangingPassword(true)
    try {
      const { error } = await authClient.changePassword({
        newPassword,
        currentPassword,
        revokeOtherSessions: true,
      })

      if (error) {
        setChangePasswordError(
          error.message ||
            'Failed to change password. Please verify current password.',
        )
        setIsChangingPassword(false)
        return
      }

      toast.success('Password changed successfully!')
      onOpenChange(false)
      setCurrentPassword('')
      setNewPassword('')
      setConfirmPassword('')
    } catch (err: any) {
      console.error(err)
      setChangePasswordError('An unexpected error occurred. Please try again.')
    } finally {
      setIsChangingPassword(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[420px] rounded-[32px] border-none bg-card/90 backdrop-blur-md p-6 shadow-2xl animate-scale-in">
        <DialogHeader className="text-left">
          <DialogTitle className="text-xl font-black text-foreground font-display flex items-center gap-2">
            <KeyRound className="h-5 w-5 text-primary" />
            Change Password
          </DialogTitle>
          <DialogDescription className="text-xs text-muted-foreground/85 font-medium">
            Update your account password to ensure your listings and payouts
            remain secure.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleChangePasswordSubmit} className="space-y-4 mt-2">
          {changePasswordError && (
            <div className="bg-danger text-destructive text-xs font-bold p-3 rounded-xl flex items-center gap-1.5 animate-fade-in border border-danger/30">
              <ShieldAlert size={14} className="shrink-0" />
              <span>{changePasswordError}</span>
            </div>
          )}

          {/* Current Password */}
          <div className="space-y-1.5">
            <Label className="text-xs font-bold text-muted-foreground/70">
              Current Password
            </Label>
            <div className="relative">
              <Input
                type={showCurrentPassword ? 'text' : 'password'}
                placeholder="Enter current password"
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                className="h-11 rounded-xl border-border bg-muted-light/30 text-foreground font-semibold text-sm transition-all focus:ring-primary/20 pr-10"
              />
              <Button
                type="button"
                variant="ghost"
                size="icon"
                onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                className="absolute right-2 top-1/2 -translate-y-1/2 h-7 w-7 text-muted-foreground/70 hover:text-muted-foreground hover:bg-transparent"
              >
                {showCurrentPassword ? <EyeOff size={16} /> : <Eye size={16} />}
              </Button>
            </div>
          </div>

          {/* New Password */}
          <div className="space-y-1.5">
            <Label className="text-xs font-bold text-muted-foreground/70">
              New Password
            </Label>
            <div className="relative">
              <Input
                type={showNewPassword ? 'text' : 'password'}
                placeholder="At least 8 characters"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                className="h-11 rounded-xl border-border bg-muted-light/30 text-foreground font-semibold text-sm transition-all focus:ring-primary/20 pr-10"
              />
              <Button
                type="button"
                variant="ghost"
                size="icon"
                onClick={() => setShowNewPassword(!showNewPassword)}
                className="absolute right-2 top-1/2 -translate-y-1/2 h-7 w-7 text-muted-foreground/70 hover:text-muted-foreground hover:bg-transparent"
              >
                {showNewPassword ? <EyeOff size={16} /> : <Eye size={16} />}
              </Button>
            </div>

            {/* Strength Indicator */}
            {newPassword && (
              <div className="space-y-1 mt-1.5 animate-fade-in">
                <div className="flex justify-between items-center text-[10px] font-bold">
                  <span className="text-muted-foreground/70">
                    Password Strength
                  </span>
                  <span
                    className={cn(
                      getPasswordStrength(newPassword).label === 'Weak' &&
                        'text-destructive',
                      getPasswordStrength(newPassword).label === 'Fair' &&
                        'text-orange-500',
                      getPasswordStrength(newPassword).label === 'Good' &&
                        'text-yellow-500',
                      getPasswordStrength(newPassword).label === 'Strong' &&
                        'text-primary',
                    )}
                  >
                    {getPasswordStrength(newPassword).label}
                  </span>
                </div>
                <div className="h-1.5 w-full bg-muted/50 rounded-full overflow-hidden">
                  <div
                    className={cn(
                      'h-full transition-all duration-500 rounded-full',
                      getPasswordStrength(newPassword).color,
                    )}
                    style={{
                      width: `${getPasswordStrength(newPassword).score}%`,
                    }}
                  />
                </div>
              </div>
            )}
          </div>

          {/* Confirm New Password */}
          <div className="space-y-1.5">
            <Label className="text-xs font-bold text-muted-foreground/70">
              Confirm New Password
            </Label>
            <div className="relative">
              <Input
                type={showConfirmPassword ? 'text' : 'password'}
                placeholder="Repeat new password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="h-11 rounded-xl border-border bg-muted-light/30 text-foreground font-semibold text-sm transition-all focus:ring-primary/20 pr-10"
              />
              <Button
                type="button"
                variant="ghost"
                size="icon"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                className="absolute right-2 top-1/2 -translate-y-1/2 h-7 w-7 text-muted-foreground/70 hover:text-muted-foreground hover:bg-transparent"
              >
                {showConfirmPassword ? <EyeOff size={16} /> : <Eye size={16} />}
              </Button>
            </div>
          </div>

          <DialogFooter className="pt-3 flex flex-row gap-3">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              className="flex-1 rounded-xl h-11 font-bold border-border text-foreground/80 hover:bg-muted-light shadow-none cursor-pointer"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={isChangingPassword}
              className="flex-1 rounded-xl h-11 font-bold bg-primary hover:bg-primary/95 text-primary-foreground flex items-center justify-center gap-1.5 shadow-lg shadow-primary/10 cursor-pointer border-none"
            >
              {isChangingPassword ? <Loader variant="white" size={14} /> : null}
              {isChangingPassword ? 'Updating...' : 'Save Password'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
