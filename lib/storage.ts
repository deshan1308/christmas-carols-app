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
        // Normalize carol data - ensure selected is boolean and IDs are numbers
        const normalized = data.map((c: any) => {
          // Normalize selected field - handle various formats
          let selected = false
          if (c.selected === true || c.selected === 'true' || c.selected === 1 || c.selected === '1') {
            selected = true
          }
          
          return {
            ...c,
            id: typeof c.id === 'string' ? parseInt(c.id, 10) : c.id,
            selected: selected,
            branch: c.branch || null, // Preserve branch name
            team: c.team || null,
          }
        })
        
        // Debug: Log selected carols with branch names
        const selectedCarols = normalized.filter(c => c.selected)
        if (selectedCarols.length > 0) {
          console.log('Selected carols from database:', selectedCarols.map(c => ({
            id: c.id,
            name: c.name,
            branch: c.branch,
            selected: c.selected
          })))
        }
        
        return normalized
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

      // Debug: Log what we're saving
      const selectedToSave = carolsToUpsert.filter(c => c.selected)
      if (selectedToSave.length > 0) {
        console.log('Saving to Supabase - Selected carols:', selectedToSave.map(c => ({
          id: c.id,
          name: c.name,
          branch: c.branch,
          selected: c.selected,
          team: c.team
        })))
      }

      // Upsert all carols
      const { error, data: upsertedData } = await supabase
        .from('carols')
        .upsert(carolsToUpsert, { onConflict: 'id' })
        .select()

      if (error) {
        console.error('❌ Error saving to Supabase:', error)
        console.error('Error details:', JSON.stringify(error, null, 2))
        
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

      console.log('✅ Carols saved successfully to Supabase')
      if (upsertedData && upsertedData.length > 0) {
        const savedSelected = upsertedData.filter((c: any) => c.selected)
        if (savedSelected.length > 0) {
          console.log('✅ Verified saved selected carols:', savedSelected.map((c: any) => ({
            id: c.id,
            name: c.name,
            branch: c.branch,
            selected: c.selected
          })))
        }
      }
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
  errors?: string[] // Optional errors array
}): Promise<any> {
  if (isSupabaseConfigured) {
    try {
      // Store errors as JSON string in custom_carol_text if there are errors and no custom carol
      // Otherwise, store errors in a separate way (we'll use custom_carol_text with a prefix)
      let customCarolText = submission.customCarolText || null
      if (submission.errors && submission.errors.length > 0) {
        // If there are errors, append them to custom_carol_text or store separately
        // We'll store errors as a JSON string prefixed with "__ERRORS__:"
        const errorsJson = JSON.stringify(submission.errors)
        if (customCarolText) {
          customCarolText = `${customCarolText}\n__ERRORS__:${errorsJson}`
        } else {
          customCarolText = `__ERRORS__:${errorsJson}`
        }
      }
      
      const { data, error } = await supabase
        .from('submissions')
        .insert({
          _name: submission.branchName, // Using _name to match Supabase schema
          team: submission.team,
          carol_ids: submission.carolIds,
          custom_carol_text: customCarolText,
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
        .eq('_name', branchName) // Using _name to match Supabase schema
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

/**
 * Delete all submissions for a branch (case-insensitive)
 */
export async function deleteSubmissionsByBranch(branchName: string): Promise<number> {
  if (isSupabaseConfigured) {
    try {
      // First, get all submissions for this branch (case-insensitive)
      // Select all columns to handle different schema variations
      const { data: submissions, error: fetchError } = await supabase
        .from('submissions')
        .select('*')
      
      if (fetchError) {
        console.error('Error fetching submissions:', fetchError)
        throw new Error(`Failed to fetch submissions: ${fetchError.message}`)
      }

      // Filter case-insensitively - check both _name and branch_name columns
      const branchSubmissions = (submissions || []).filter((s: any) => {
        const name = s._name || s.branch_name
        return name && name.trim().toUpperCase() === branchName.trim().toUpperCase()
      })

      if (branchSubmissions.length === 0) {
        console.log(`No submissions found for branch: ${branchName}`)
        return 0
      }

      // Delete all submissions for this branch
      const idsToDelete = branchSubmissions.map((s: any) => s.id)
      const { error: deleteError } = await supabase
        .from('submissions')
        .delete()
        .in('id', idsToDelete)

      if (deleteError) {
        console.error('Error deleting submissions:', deleteError)
        throw new Error(`Failed to delete submissions: ${deleteError.message}`)
      }

      console.log(`Deleted ${idsToDelete.length} submission(s) for branch: ${branchName}`)
      return idsToDelete.length
    } catch (error: any) {
      console.error('Error deleting submissions:', error)
      throw error
    }
  }
  
  throw new Error('Supabase is not configured.')
}

/**
 * Reset carols selected by a branch (case-insensitive)
 */
export async function resetCarolsByBranch(branchName: string): Promise<number> {
  if (isSupabaseConfigured) {
    try {
      // Get all carols
      const carols = await getCarols()
      
      // Find carols selected by this branch (case-insensitive)
      const branchCarols = carols.filter((c: any) => 
        c.branch && c.branch.trim().toUpperCase() === branchName.trim().toUpperCase() && c.selected
      )

      if (branchCarols.length === 0) {
        console.log(`No carols found selected by branch: ${branchName}`)
        return 0
      }

      // Reset these carols: set selected=false, branch=null, team=null
      // Include name field as it's required
      const updates = branchCarols.map((c: any) => ({
        id: c.id,
        name: c.name, // Required field
        selected: false,
        branch: null,
        team: null,
      }))

      // Update carols
      const { error } = await supabase
        .from('carols')
        .upsert(updates, { onConflict: 'id' })

      if (error) {
        console.error('Error resetting carols:', error)
        throw new Error(`Failed to reset carols: ${error.message}`)
      }

      console.log(`Reset ${updates.length} carol(s) for branch: ${branchName}`)
      return updates.length
    } catch (error: any) {
      console.error('Error resetting carols:', error)
      throw error
    }
  }
  
  throw new Error('Supabase is not configured.')
}

/**
 * Delete submissions and reset carols for a branch
 */
export async function deleteBranchData(branchName: string): Promise<{ submissionsDeleted: number, carolsReset: number }> {
  const submissionsDeleted = await deleteSubmissionsByBranch(branchName)
  const carolsReset = await resetCarolsByBranch(branchName)
  return { submissionsDeleted, carolsReset }
}

