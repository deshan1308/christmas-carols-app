import { NextRequest, NextResponse } from 'next/server'
import { saveSubmission, getSubmissions } from '@/lib/storage'

// GET all submissions
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const branchName = searchParams.get('branchName')

    if (branchName) {
      const { getSubmissionsByBranch } = await import('@/lib/storage')
      const submissions = await getSubmissionsByBranch(branchName)
      return NextResponse.json(submissions, {
        headers: {
          'Content-Type': 'application/json; charset=utf-8',
        },
      })
    }

    const submissions = await getSubmissions()
    return NextResponse.json(submissions, {
      headers: {
        'Content-Type': 'application/json; charset=utf-8',
      },
    })
  } catch (error: any) {
    console.error('Error fetching submissions:', error)
    return NextResponse.json(
      { message: `Internal server error: ${error?.message || 'Unknown error'}` },
      { status: 500 }
    )
  }
}

// POST create a new submission
export async function POST(request: NextRequest) {
  try {
    const { branchName, team, carolIds, customCarolText } = await request.json()

    // Validation
    if (!branchName || branchName.trim() === '') {
      return NextResponse.json(
        { message: 'Branch name is required' },
        { status: 400 }
      )
    }

    if (!team || (team !== 'Team 1' && team !== 'Team 2')) {
      return NextResponse.json(
        { message: 'Team selection is required (Team 1 or Team 2)' },
        { status: 400 }
      )
    }

    if (!carolIds || !Array.isArray(carolIds) || carolIds.length === 0) {
      return NextResponse.json(
        { message: 'At least one carol ID is required' },
        { status: 400 }
      )
    }

    const submission = await saveSubmission({
      branchName: branchName.trim(),
      team,
      carolIds,
      customCarolText: customCarolText || null,
    })

    return NextResponse.json(
      {
        message: 'Submission saved successfully',
        submission,
      },
      { status: 201 }
    )
  } catch (error: any) {
    console.error('Error saving submission:', error)
    return NextResponse.json(
      { message: `Internal server error: ${error?.message || 'Unknown error'}` },
      { status: 500 }
    )
  }
}

