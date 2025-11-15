import { NextRequest, NextResponse } from 'next/server'
import { deleteBranchData } from '@/lib/storage'

/**
 * DELETE /api/admin/reset-branch?branchName=KELANIYA
 * 
 * Deletes all submissions and resets carols for a specific branch
 * 
 * WARNING: This is a destructive operation!
 */
export async function DELETE(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const branchName = searchParams.get('branchName')

    if (!branchName) {
      return NextResponse.json(
        { message: 'Branch name is required. Use ?branchName=KELANIYA' },
        { status: 400 }
      )
    }

    const result = await deleteBranchData(branchName)

    return NextResponse.json({
      message: `Successfully reset data for branch: ${branchName}`,
      submissionsDeleted: result.submissionsDeleted,
      carolsReset: result.carolsReset,
    })
  } catch (error: any) {
    console.error('Error resetting branch data:', error)
    return NextResponse.json(
      { message: `Error: ${error.message}` },
      { status: 500 }
    )
  }
}

