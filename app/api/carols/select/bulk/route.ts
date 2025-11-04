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
    const { carolIds, branchName } = await request.json()

    if (!carolIds || !Array.isArray(carolIds) || carolIds.length !== 2) {
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

    const carols = getCarols()
    const errors: string[] = []
    const selectedCarols: any[] = []

    // Check all carols first
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

    // If there are errors, return them
    if (errors.length > 0) {
      return NextResponse.json(
        { message: 'Some carols could not be selected', errors },
        { status: 400 }
      )
    }

    // Select all carols
    for (const carol of selectedCarols) {
      const carolIndex = carols.findIndex((c: any) => c.id === carol.id)
      carols[carolIndex].selected = true
      carols[carolIndex].branch = branchName.trim()
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

