import { NextRequest, NextResponse } from 'next/server'
import { getCarols, saveCarols } from '@/lib/storage'

export async function POST(request: NextRequest) {
  try {
    const { carolIds, branchName, customCarolText, team } = await request.json()

    console.log('POST /api/carols/select/bulk - Request received:', { carolIds, branchName, customCarolText, team })

    // Validate: must have exactly 2 selections total
    // Either: 2 carolIds, or 1 carolId + customCarolText, or 2 customCarolTexts (but we only support 1 Other)
    const hasCustom = customCarolText && customCarolText.trim() !== ''
    const carolCount = carolIds && Array.isArray(carolIds) ? carolIds.length : 0
    const totalSelections = carolCount + (hasCustom ? 1 : 0)

    if (totalSelections !== 2) {
      return NextResponse.json(
        { message: 'Exactly 2 carols must be selected (not 1, not 3 or more)' },
        { status: 400 }
      )
    }

    if (!branchName || branchName.trim() === '') {
      return NextResponse.json(
        { message: 'Branch name is required' },
        { status: 400 }
      )
    }

    if (hasCustom && !customCarolText.trim()) {
      return NextResponse.json(
        { message: 'Custom carol text is required when "Other" is selected' },
        { status: 400 }
      )
    }

    if (!team || (team !== 'Team 1' && team !== 'Team 2')) {
      return NextResponse.json(
        { message: 'Team selection is required (Team 1 or Team 2)' },
        { status: 400 }
      )
    }

    const carols = await getCarols()
    console.log('Loaded carols:', carols.length)
    
    if (!Array.isArray(carols)) {
      console.error('Carols is not an array:', typeof carols)
      return NextResponse.json(
        { message: 'Invalid carols data format' },
        { status: 500 }
      )
    }
    
    // Check if branch has already selected this team
    const branchCarols = carols.filter((c: any) => {
      return c && c.branch && c.branch.trim() === branchName.trim() && c.selected === true
    })
    console.log('Branch carols for', branchName, ':', branchCarols.length)
    const existingTeams = new Set(
      branchCarols
        .map((c: any) => c.team)
        .filter((t: any) => t && typeof t === 'string' && (t.trim() === 'Team 1' || t.trim() === 'Team 2'))
        .map((t: any) => t.trim())
    )
    console.log('Existing teams for', branchName, ':', Array.from(existingTeams))
    
    const teamTrimmed = team.trim()
    if (existingTeams.has(teamTrimmed)) {
      return NextResponse.json(
        { message: `This branch has already selected ${teamTrimmed}. Please choose ${teamTrimmed === 'Team 1' ? 'Team 2' : 'Team 1'}.` },
        { status: 400 }
      )
    }

    const errors: string[] = []
    const selectedCarols: any[] = []

    // Handle regular carol selections
    if (carolIds && Array.isArray(carolIds) && carolIds.length > 0) {
      for (const carolId of carolIds) {
        const carolIndex = carols.findIndex((c: any) => c.id === carolId)
        
        if (carolIndex === -1) {
          errors.push(`Carol with ID ${carolId} not found`)
          continue
        }

        if (carols[carolIndex].selected) {
          errors.push(`Carol "${carols[carolIndex].name}" has already been selected by branch "${carols[carolIndex].branch}"`)
          continue
        }

        selectedCarols.push(carols[carolIndex])
      }
    }

    // Handle custom carol
    if (hasCustom) {
      // Find the highest ID to create a new one
      const validIds = carols.filter((c: any) => c.id && typeof c.id === 'number').map((c: any) => c.id)
      const maxId = validIds.length > 0 ? Math.max(...validIds) : 19
      const newCarol = {
        id: maxId + 1,
        name: customCarolText.trim(),
        selected: true,
        branch: branchName.trim(),
        team: team
      }
      carols.push(newCarol)
      selectedCarols.push(newCarol)
      console.log('Added custom carol:', newCarol)
    }

    // If there are errors, return them
    if (errors.length > 0) {
      return NextResponse.json(
        { message: 'Some carols could not be selected', errors },
        { status: 400 }
      )
    }

    // Select all regular carols
    for (const carol of selectedCarols) {
      // Check if it's a regular carol (ID <= 19) or a custom one we just added
      const carolIndex = carols.findIndex((c: any) => c.id === carol.id)
      if (carolIndex !== -1) {
        // Only update if it's a regular carol (custom ones are already set)
        if (carol.id <= 19) {
          carols[carolIndex].selected = true
          carols[carolIndex].branch = branchName.trim()
          carols[carolIndex].team = team
          console.log('Updated carol:', carol.id, 'with team:', team)
        }
      }
    }

    console.log('Saving carols...')
    await saveCarols(carols)
    console.log('Carols saved successfully')

    return NextResponse.json(
      { 
        message: 'Carol selection submitted successfully', 
        selectedCount: selectedCarols.length,
        carols: selectedCarols
      },
      { status: 200 }
    )
  } catch (error: any) {
    console.error('Error selecting carols:', error)
    console.error('Error stack:', error?.stack)
    console.error('Error message:', error?.message)
    return NextResponse.json(
      { message: `Internal server error: ${error?.message || 'Unknown error'}` },
      { status: 500 }
    )
  }
}

