import { NextRequest, NextResponse } from 'next/server'
import { getCarols, saveCarols, saveSubmission } from '@/lib/storage'

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
    console.log('Request carolIds:', carolIds)
    
    if (!Array.isArray(carols)) {
      console.error('Carols is not an array:', typeof carols)
      return NextResponse.json(
        { message: 'Invalid carols data format' },
        { status: 500 }
      )
    }
    
    // Normalize carol data - ensure selected is boolean and IDs are numbers
    const normalizedCarols = carols.map((c: any) => ({
      ...c,
      id: typeof c.id === 'string' ? parseInt(c.id, 10) : c.id,
      selected: c.selected === true || c.selected === 'true' || c.selected === 1,
      branch: c.branch || null,
      team: c.team || null,
    }))
    
    // Check if branch has already selected this team
    const branchCarols = normalizedCarols.filter((c: any) => {
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
      // Normalize carol IDs to numbers
      const normalizedCarolIds = carolIds.map(id => typeof id === 'string' ? parseInt(id, 10) : id)
      console.log('Normalized carol IDs:', normalizedCarolIds)
      
      for (const carolId of normalizedCarolIds) {
        const carolIndex = normalizedCarols.findIndex((c: any) => c.id === carolId)
        
        if (carolIndex === -1) {
          console.error(`Carol with ID ${carolId} not found. Available IDs:`, normalizedCarols.map((c: any) => c.id))
          errors.push(`Carol with ID ${carolId} not found`)
          continue
        }

        const carol = normalizedCarols[carolIndex]
        if (carol.selected) {
          const selectedBy = carol.branch ? `branch "${carol.branch}"` : 'another user'
          console.warn(`Carol "${carol.name}" (ID: ${carol.id}) is already selected by ${selectedBy}`)
          errors.push(`Carol "${carol.name}" has already been selected by ${selectedBy}`)
          continue
        }

        selectedCarols.push(carol)
      }
    }

    // Handle custom carol
    if (hasCustom) {
      // Find the highest ID to create a new one
      const validIds = normalizedCarols.filter((c: any) => c.id && typeof c.id === 'number').map((c: any) => c.id)
      const maxId = validIds.length > 0 ? Math.max(...validIds) : 19
      const newCarol = {
        id: maxId + 1,
        name: customCarolText.trim(),
        selected: true,
        branch: branchName.trim(),
        team: team
      }
      normalizedCarols.push(newCarol)
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
      const carolIndex = normalizedCarols.findIndex((c: any) => c.id === carol.id)
      if (carolIndex !== -1) {
        // Only update if it's a regular carol (custom ones are already set)
        if (carol.id <= 19) {
          normalizedCarols[carolIndex].selected = true
          normalizedCarols[carolIndex].branch = branchName.trim()
          normalizedCarols[carolIndex].team = team
          console.log('Updated carol:', carol.id, 'with team:', team)
        }
      }
    }

    console.log('Saving carols...')
    await saveCarols(normalizedCarols)
    console.log('Carols saved successfully')

    // Save submission record
    try {
      const carolIdsToSave = selectedCarols
        .filter(c => c.id && typeof c.id === 'number')
        .map(c => c.id)
      
      if (carolIdsToSave.length > 0) {
        await saveSubmission({
          branchName: branchName.trim(),
          team,
          carolIds: carolIdsToSave,
          customCarolText: hasCustom ? customCarolText.trim() : null,
        })
        console.log('Submission record saved successfully')
      }
    } catch (submissionError: any) {
      // Log but don't fail the request if submission saving fails
      console.error('Error saving submission record:', submissionError)
      // Continue - the carols are already saved
    }

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

