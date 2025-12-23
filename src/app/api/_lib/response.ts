import { NextResponse } from 'next/server'

export interface ApiResponse<T = unknown> {
  success: boolean
  data: T | null
  error: string | null
  message: string
}

export function successResponse<T>(
  data: T,
  message: string = 'Success',
  status: number = 200
): NextResponse<ApiResponse<T>> {
  return NextResponse.json(
    {
      success: true,
      data,
      error: null,
      message,
    },
    { status }
  )
}

export function errorResponse(
  error: string,
  message: string = 'Error occurred',
  status: number = 400
): NextResponse<ApiResponse<null>> {
  return NextResponse.json(
    {
      success: false,
      data: null,
      error,
      message,
    },
    { status }
  )
}
