import { NextRequest, NextResponse } from 'next/server'
import fs from 'fs'
import path from 'path'

const carolsFilePath = path.join(process.cwd(), 'data', 'carols.json')

function getCarols() {
  try {
    // Read file as buffer first to handle encoding properly
    const buffer = fs.readFileSync(carolsFilePath)
    // Remove BOM if present (UTF-8 BOM is EF BB BF)
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

function saveCarols(carols: any[]) {
  const dir = path.dirname(carolsFilePath)
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true })
  }
  // Write as UTF-8 without BOM
  fs.writeFileSync(carolsFilePath, JSON.stringify(carols, null, 2), { encoding: 'utf8' })
}

export async function POST(request: NextRequest) {
  try {
    const { carolIds, branchName, customCarolText } = await request.json()

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

    const carols = getCarols()
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
      const maxId = carols.length > 0 ? Math.max(...carols.map((c: any) => c.id)) : 0
      const newCarol = {
        id: maxId + 1,
        name: customCarolText.trim(),
        selected: true,
        branch: branchName.trim()
      }
      carols.push(newCarol)
      selectedCarols.push(newCarol)
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
      if (carol.id <= 19) { // Only update existing carols, not the custom one (already added)
        const carolIndex = carols.findIndex((c: any) => c.id === carol.id)
        if (carolIndex !== -1) {
          carols[carolIndex].selected = true
          carols[carolIndex].branch = branchName.trim()
        }
      }
    }

    saveCarols(carols)

    return NextResponse.json(
      { 
        message: 'Carol selection submitted successfully', 
        selectedCount: selectedCarols.length,
        carols: selectedCarols
      },
      { status: 200 }
    )
  } catch (error) {
    console.error('Error selecting carols:', error)
    return NextResponse.json(
      { message: 'Internal server error' },
      { status: 500 }
    )
  }
}

