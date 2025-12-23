'use client'

import { useActionState, useRef, useEffect } from 'react'
import { useFormStatus } from 'react-dom'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Loader2, Send } from 'lucide-react'

interface MessageFormProps {
  action: (prevState: unknown, formData: FormData) => Promise<{ error?: string; success?: boolean }>
}

function SubmitButton() {
  const { pending } = useFormStatus()
  return (
    <Button type="submit" disabled={pending}>
      {pending ? (
        <Loader2 className="h-4 w-4 animate-spin" />
      ) : (
        <Send className="h-4 w-4" />
      )}
    </Button>
  )
}

export function MessageForm({ action }: MessageFormProps) {
  const [state, formAction] = useActionState(action, null)
  const formRef = useRef<HTMLFormElement>(null)

  useEffect(() => {
    if (state?.success) {
      formRef.current?.reset()
    }
  }, [state])

  return (
    <form ref={formRef} action={formAction} className="flex gap-2">
      <div className="flex-1">
        <Textarea
          name="content"
          placeholder="Type your message..."
          rows={2}
          required
          className="resize-none"
        />
        {state?.error && (
          <p className="text-sm text-destructive mt-1">{state.error}</p>
        )}
      </div>
      <SubmitButton />
    </form>
  )
}
