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
    const { carolId, branchName } = await request.json()

    if (!carolId || !branchName) {
      return NextResponse.json(
        { message: 'Carol ID and branch name are required' },
        { status: 400 }
      )
    }

    const carols = getCarols()
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

    saveCarols(carols)

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
