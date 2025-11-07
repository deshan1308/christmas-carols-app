import { NextRequest, NextResponse } from 'next/server'
import { getCarols } from '@/lib/storage'

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const branchName = searchParams.get('branchName')

    if (!branchName) {
      return NextResponse.json(
        { message: 'Branch name is required' },
        { status: 400 }
      )
    }

    const carols = await getCarols()
    
    // Find all carols selected by this branch
    const branchCarols = carols.filter((c: any) => c.branch === branchName && c.selected)
    
    // Get unique teams from this branch's selections
    const teams = new Set<string>()
    branchCarols.forEach((carol: any) => {
      if (carol.team) {
        teams.add(carol.team)
      }
    })

    const selectedTeams = Array.from(teams)
    const availableTeams = ['Team 1', 'Team 2'].filter(team => !selectedTeams.includes(team))

    return NextResponse.json({
      branchName,
      selectedTeams,
      availableTeams,
      canSelectTeam1: !selectedTeams.includes('Team 1'),
      canSelectTeam2: !selectedTeams.includes('Team 2'),
    })
  } catch (error) {
    console.error('Error getting branch teams:', error)
    return NextResponse.json(
      { message: 'Internal server error' },
      { status: 500 }
    )
  }
}

