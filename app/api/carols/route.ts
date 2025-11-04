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
    const parsed = JSON.parse(fileContents)
    return parsed
  } catch (error) {
    console.error('Error reading carols file:', error)
    return []
  }
}

export async function GET() {
  const carols = getCarols()
  return NextResponse.json(carols, {
    headers: {
      'Content-Type': 'application/json; charset=utf-8',
    },
  })
}
