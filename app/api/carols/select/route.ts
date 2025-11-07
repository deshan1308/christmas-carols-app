import { NextRequest, NextResponse } from 'next/server'
import { getCarols, saveCarols } from '@/lib/storage'

export async function POST(request: NextRequest) {
  try {
    const { carolId, branchName } = await request.json()

    if (!carolId || !branchName) {
      return NextResponse.json(
        { message: 'Carol ID and branch name are required' },
        { status: 400 }
      )
    }

    const carols = await getCarols()
    const carolIndex = carols.findIndex((c: any) => c.id === carolId)

    if (carolIndex === -1) {
      return NextResponse.json(
        { message: 'Carol not found' },
        { status: 404 }
      )
    }

    if (carols[carolIndex].selected) {
      return NextResponse.json(
        { message: 'This carol has already been selected by another branch' },
        { status: 400 }
      )
    }

    carols[carolIndex].selected = true
    carols[carolIndex].branch = branchName

    await saveCarols(carols)

    return NextResponse.json(
      { message: 'Carol selected successfully', carol: carols[carolIndex] },
      { status: 200 }
    )
  } catch (error) {
    console.error('Error selecting carol:', error)
    return NextResponse.json(
      { message: 'Internal server error' },
      { status: 500 }
    )
  }
}
