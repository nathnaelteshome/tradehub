'use client'

import { useActionState } from 'react'
import { useFormStatus } from 'react-dom'
import { resetPassword, type AuthActionResult } from '@/actions/auth'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Loader2 } from 'lucide-react'

function SubmitButton() {
  const { pending } = useFormStatus()
  return (
    <Button type="submit" className="w-full" disabled={pending}>
      {pending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
      Reset password
    </Button>
  )
}

export function ResetPasswordForm() {
  const [state, formAction] = useActionState<AuthActionResult, FormData>(resetPassword, null)

  return (
    <form action={formAction} className="space-y-4">
      {state && 'error' in state && (
        <div className="p-3 text-sm text-destructive bg-destructive/10 border border-destructive/20 rounded-md">
          {state.error}
        </div>
      )}
      <div className="space-y-2">
        <Label htmlFor="password">New Password</Label>
        <Input
          id="password"
          name="password"
          type="password"
          required
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor="confirmPassword">Confirm New Password</Label>
        <Input
          id="confirmPassword"
          name="confirmPassword"
          type="password"
          required
        />
      </div>
      <SubmitButton />
    </form>
  )
}
