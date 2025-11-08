import fs from 'fs'
import path from 'path'
import { supabase } from './supabase'

// Check if we're in a serverless environment (Vercel, etc.)
const isServerless = process.env.VERCEL === '1' || process.env.NODE_ENV === 'production'

// Check if Supabase is configured
const isSupabaseConfigured = process.env.NEXT_PUBLIC_SUPABASE_URL || 
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ||
  // Default Supabase URL is set in lib/supabase.ts, so Supabase is always configured
  true

// File system path (for local development fallback only)
const carolsFilePath = path.join(process.cwd(), 'data', 'carols.json')

/**
 * Get carols from storage (Supabase in production, file system as fallback only in local dev)
 */
export async function getCarols(): Promise<any[]> {
  if (isSupabaseConfigured) {
    try {
      const { data, error } = await supabase
        .from('carols')
        .select('*')
        .order('id')

      if (error) {
        console.error('Error reading from Supabase:', error)
        
        // In serverless, never fall back to file system
        if (isServerless) {
          throw new Error(`Supabase error: ${error.message}. Please ensure the 'carols' table exists in your Supabase database. See SUPABASE_SETUP.md for setup instructions.`)
        }
        
        // Only fallback to file system in local development
        console.warn('Supabase failed, falling back to file system (local dev only)')
        return getCarolsFromFile()
      }

      if (Array.isArray(data) && data.length > 0) {
        return data
      }

      // If no data in Supabase, try to initialize from file system (only in local dev)
      if (!isServerless) {
        const fileData = getCarolsFromFile()
        if (fileData.length > 0) {
          console.log('No data in Supabase, using file system data. Consider running migration script.')
        }
        return fileData
      }
      
      // In serverless, return empty array if no data
      return []
    } catch (error: any) {
      console.error('Error reading from Supabase:', error)
      
      // In serverless, re-throw the error
      if (isServerless) {
        throw error
      }
      
      // Only fallback to file system in local development
      return getCarolsFromFile()
    }
  }
  
  // Use file system only in local development
  if (!isServerless) {
    return getCarolsFromFile()
  }
  
  // In serverless without Supabase, throw error
  throw new Error('Supabase is not configured. Please set NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY environment variables.')
}

/**
 * Save carols to storage (Supabase in production, file system as fallback only in local dev)
 */
export async function saveCarols(carols: any[]): Promise<void> {
  if (isSupabaseConfigured) {
    try {
      // Prepare data for upsert
      const carolsToUpsert = carols.map(carol => ({
        id: carol.id,
        name: carol.name,
        selected: carol.selected || false,
        branch: carol.branch || null,
        team: carol.team || null,
      }))

      // Upsert all carols
      const { error } = await supabase
        .from('carols')
        .upsert(carolsToUpsert, { onConflict: 'id' })

      if (error) {
        console.error('Error saving to Supabase:', error)
        
        // In serverless, never fall back to file system - throw error
        if (isServerless) {
          // Provide helpful error message
          if (error.message.includes('relation') || error.message.includes('does not exist')) {
            throw new Error(`Supabase table 'carols' does not exist. Please run the SQL migration script in your Supabase dashboard. See SUPABASE_SETUP.md for instructions. Original error: ${error.message}`)
          }
          throw new Error(`Failed to save carols to Supabase: ${error.message}. Please check your Supabase configuration.`)
        }
        
        // Only fallback to file system in local development
        console.warn('Supabase failed, falling back to file system (local dev only)')
        saveCarolsToFile(carols)
        return
      }

      console.log('Carols saved successfully to Supabase')
      return
    } catch (error: any) {
      console.error('Error saving to Supabase:', error)
      
      // In serverless, re-throw the error (never use file system)
      if (isServerless) {
        throw error
      }
      
      // Only fallback to file system in local development
      saveCarolsToFile(carols)
      return
    }
  }
  
  // Use file system only in local development
  if (!isServerless) {
    saveCarolsToFile(carols)
    return
  }
  
  // In serverless without Supabase, throw error
  throw new Error('Supabase is not configured. Please set NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY environment variables.')
}

/**
 * Read carols from file system (local development)
 */
function getCarolsFromFile(): any[] {
  try {
    // Check if file exists
    if (!fs.existsSync(carolsFilePath)) {
      console.log('Carols file does not exist, returning empty array')
      return []
    }

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
    return Array.isArray(parsed) ? parsed : []
  } catch (error) {
    console.error('Error reading carols file:', error)
    return []
  }
}

/**
 * Save carols to file system (local development)
 */
function saveCarolsToFile(carols: any[]): void {
  try {
    const dir = path.dirname(carolsFilePath)
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true })
    }
    // Write as UTF-8 without BOM
    const jsonString = JSON.stringify(carols, null, 2)
    fs.writeFileSync(carolsFilePath, jsonString, { encoding: 'utf8' })
    console.log('File saved successfully to:', carolsFilePath)
  } catch (error: any) {
    console.error('Error saving carols file:', error)
    throw new Error(`Failed to save carols: ${error.message}`)
  }
}

/**
 * Save a submission to storage (Supabase)
 */
export async function saveSubmission(submission: {
  branchName: string
  team: string
  carolIds: number[]
  customCarolText?: string | null
}): Promise<any> {
  if (isSupabaseConfigured) {
    try {
      const { data, error } = await supabase
        .from('submissions')
        .insert({
          branch_name: submission.branchName,
          team: submission.team,
          carol_ids: submission.carolIds,
          custom_carol_text: submission.customCarolText || null,
        })
        .select()
        .single()

      if (error) {
        console.error('Error saving submission to Supabase:', error)
        
        if (isServerless) {
          if (error.message.includes('relation') || error.message.includes('does not exist')) {
            throw new Error(`Supabase table 'submissions' does not exist. Please run the SQL migration script in your Supabase dashboard. See SUPABASE_SETUP.md for instructions. Original error: ${error.message}`)
          }
          throw new Error(`Failed to save submission to Supabase: ${error.message}`)
        }
        
        throw new Error(`Failed to save submission: ${error.message}`)
      }

      console.log('Submission saved successfully to Supabase')
      return data
    } catch (error: any) {
      console.error('Error saving submission:', error)
      throw error
    }
  }
  
  throw new Error('Supabase is not configured. Please set NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY environment variables.')
}

/**
 * Get all submissions from storage (Supabase)
 */
export async function getSubmissions(): Promise<any[]> {
  if (isSupabaseConfigured) {
    try {
      const { data, error } = await supabase
        .from('submissions')
        .select('*')
        .order('submitted_at', { ascending: false })

      if (error) {
        console.error('Error reading submissions from Supabase:', error)
        
        if (isServerless) {
          if (error.message.includes('relation') || error.message.includes('does not exist')) {
            // Return empty array if table doesn't exist yet
            console.warn('Submissions table does not exist yet')
            return []
          }
          throw new Error(`Supabase error: ${error.message}`)
        }
        
        return []
      }

      return Array.isArray(data) ? data : []
    } catch (error: any) {
      console.error('Error reading submissions:', error)
      
      if (isServerless) {
        // Return empty array instead of throwing to allow page to load
        return []
      }
      
      return []
    }
  }
  
  return []
}

/**
 * Get submissions by branch name
 */
export async function getSubmissionsByBranch(branchName: string): Promise<any[]> {
  if (isSupabaseConfigured) {
    try {
      const { data, error } = await supabase
        .from('submissions')
        .select('*')
        .eq('branch_name', branchName)
        .order('submitted_at', { ascending: false })

      if (error) {
        console.error('Error reading submissions by branch from Supabase:', error)
        return []
      }

      return Array.isArray(data) ? data : []
    } catch (error) {
      console.error('Error reading submissions by branch:', error)
      return []
    }
  }
  
  return []
}

