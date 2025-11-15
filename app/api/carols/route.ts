import { NextRequest, NextResponse } from 'next/server'
import { getCarols } from '@/lib/storage'

export async function GET() {
  const carols = await getCarols()
  return NextResponse.json(carols, {
    headers: {
      'Content-Type': 'application/json; charset=utf-8',
      'Cache-Control': 'no-cache, no-store, must-revalidate',
      'Pragma': 'no-cache',
      'Expires': '0',
    },
  })
}
