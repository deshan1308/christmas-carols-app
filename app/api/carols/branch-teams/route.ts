import { NextRequest, NextResponse } from 'next/server'
import fs from 'fs'
import path from 'path'

const carolsFilePath = path.join(process.cwd(), 'data', 'carols.json')

function getCarols() {
  try {
    const buffer = fs.readFileSync(carolsFilePath)
    let fileContents: string
    if (buffer[0] === 0xef && buffer[1] === 0xbb && buffer[2] === 0xbf) {
      fileContents = buffer.slice(3).toString('utf8')
    } else {
      fileContents = buffer.toString('utf8')
    }
    return JSON.parse(fileContents)
  } catch (error) {
    console.error('Error reading carols file:', error)
    return []
  }
}

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

    const carols = getCarols()
    
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

