import { NextRequest } from 'next/server'
import { sendWelcomeEmail } from '../../_lib/email'
import { successResponse, errorResponse } from '../../_lib/response'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { email, name } = body

    if (!email || !name) {
      return errorResponse('Email and name are required', 'Validation failed', 400)
    }

    const result = await sendWelcomeEmail(email, name)

    if (!result.success) {
      return errorResponse(result.error || 'Failed to send email', 'Email failed', 500)
    }

    return successResponse(null, 'Welcome email sent successfully')
  } catch (error) {
    return errorResponse(
      error instanceof Error ? error.message : 'Unknown error',
      'Failed to send welcome email',
      500
    )
  }
}
