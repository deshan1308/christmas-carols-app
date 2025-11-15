'use client'

import React, { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react'

interface Carol {
  id: number
  name: string
  selected: boolean
  branch: string | null
  team?: string | null
}

interface CarolsContextType {
  carols: Carol[]
  selectedCarols: Carol[]
  currentBranch: string | null
  setCurrentBranch: (branch: string) => void
  selectCarol: (carolId: number, branchName: string) => Promise<void>
  fetchCarols: () => Promise<void>
  getBranchCarols: (branchName: string) => Carol[]
  // New methods for the new flow
  tempSelectedCarols: number[]
  toggleTempCarolSelection: (carolId: number) => void
  clearTempSelection: () => void
  submitSelection: (branchName: string, carolIds: number[], customCarolText?: string, team?: string) => Promise<boolean>
  isLoading: boolean
  // Other option
  isOtherSelected: boolean
  toggleOtherSelection: () => void
  customCarolText: string
  setCustomCarolText: (text: string) => void
  // Team selection
  checkBranchTeams: (branchName: string) => Promise<{ availableTeams: string[], canSelectTeam1: boolean, canSelectTeam2: boolean }>
}

const CarolsContext = createContext<CarolsContextType | undefined>(undefined)

export function CarolsProvider({ children }: { children: ReactNode }) {
  const [carols, setCarols] = useState<Carol[]>([])
  const [currentBranch, setCurrentBranch] = useState<string | null>(null)
  const [tempSelectedCarols, setTempSelectedCarols] = useState<number[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isOtherSelected, setIsOtherSelected] = useState(false)
  const [customCarolText, setCustomCarolText] = useState('')

  const fetchCarols = useCallback(async () => {
    setIsLoading(true)
    try {
      // Use absolute URL to avoid any routing issues
      const baseUrl = typeof window !== 'undefined' ? window.location.origin : ''
      const url = `${baseUrl}/api/carols`
      
      console.log('=== FETCH CAROLS START ===')
      console.log('URL:', url)
      console.log('Window:', typeof window !== 'undefined' ? 'defined' : 'undefined')
      
      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'Accept': 'application/json',
          'Cache-Control': 'no-cache, no-store, must-revalidate',
          'Pragma': 'no-cache',
        },
        cache: 'no-store', // Force no caching
      })
      
      console.log('Response received:', {
        status: response.status,
        statusText: response.statusText,
        ok: response.ok,
        type: response.type,
      })
      
      if (!response.ok) {
        const errorText = await response.text()
        console.error('Response not OK:', errorText)
        throw new Error(`HTTP ${response.status}: ${errorText}`)
      }
      
      const contentType = response.headers.get('content-type')
      console.log('Content-Type:', contentType)
      
      if (!contentType || !contentType.includes('application/json')) {
        const text = await response.text()
        console.error('Invalid content type. Response:', text.substring(0, 200))
        throw new Error('Response is not JSON')
      }
      
      const data = await response.json()
      console.log('=== FETCH SUCCESS ===')
      console.log('Data type:', typeof data)
      console.log('Is array:', Array.isArray(data))
      console.log('Data length:', Array.isArray(data) ? data.length : 'N/A')
      
      if (Array.isArray(data) && data.length > 0) {
        console.log('First carol:', data[0])
        setCarols(data)
        setIsLoading(false)
        console.log('State updated successfully')
      } else if (Array.isArray(data)) {
        console.warn('Empty array received')
        setCarols([])
        setIsLoading(false)
      } else {
        console.error('Invalid data format:', data)
        setCarols([])
        setIsLoading(false)
      }
    } catch (error: any) {
      console.error('=== FETCH ERROR ===')
      console.error('Error type:', error.name)
      console.error('Error message:', error.message)
      console.error('Error stack:', error.stack)
      setCarols([])
      setIsLoading(false)
    }
  }, [])

  useEffect(() => {
    console.log('CarolsProvider mounted, fetching carols...')
    
    // Fetch immediately
    fetchCarols()
    
    // Also set up a test fetch directly to see if it works
    const testFetch = async () => {
      try {
        const testUrl = window.location.origin + '/api/carols'
        console.log('Test fetch from:', testUrl)
        const res = await fetch(testUrl)
        const testData = await res.json()
        console.log('Test fetch result:', testData.length, 'carols')
        if (Array.isArray(testData) && testData.length > 0) {
          console.log('Test fetch succeeded, updating state...')
          setCarols(testData)
          setIsLoading(false)
        }
      } catch (err) {
        console.error('Test fetch failed:', err)
      }
    }
    
    // Run test fetch after a short delay
    const timer = setTimeout(testFetch, 500)
    
    return () => clearTimeout(timer)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const selectCarol = async (carolId: number, branchName: string) => {
    try {
      const response = await fetch('/api/carols/select', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ carolId, branchName }),
      })

      if (response.ok) {
        await fetchCarols()
      } else {
        const error = await response.json()
        alert(error.message || 'Failed to select carol')
      }
    } catch (error) {
      console.error('Error selecting carol:', error)
      alert('Failed to select carol')
    }
  }

  const selectedCarols = carols.filter((carol) => carol.selected)
  const availableCarols = carols.filter((carol) => !carol.selected)

  const getBranchCarols = (branchName: string) => {
    return carols.filter((carol) => carol.branch === branchName)
  }

  const toggleTempCarolSelection = (carolId: number) => {
    setTempSelectedCarols((prev) => {
      if (prev.includes(carolId)) {
        return prev.filter((id) => id !== carolId)
      } else {
        return [...prev, carolId]
      }
    })
  }

  const clearTempSelection = () => {
    setTempSelectedCarols([])
    setIsOtherSelected(false)
    setCustomCarolText('')
  }

  const toggleOtherSelection = () => {
    const currentTotal = tempSelectedCarols.length + (isOtherSelected ? 1 : 0)
    
    if (!isOtherSelected && currentTotal >= 2) {
      alert('You can only select exactly 2 carols. Please deselect one first.')
      return
    }
    
    setIsOtherSelected(!isOtherSelected)
    if (isOtherSelected) {
      setCustomCarolText('')
    }
  }

  const checkBranchTeams = async (branchName: string) => {
    try {
      const response = await fetch(`/api/carols/branch-teams?branchName=${encodeURIComponent(branchName)}`)
      if (response.ok) {
        const data = await response.json()
        return {
          availableTeams: data.availableTeams || ['Team 1', 'Team 2'],
          canSelectTeam1: data.canSelectTeam1 !== false,
          canSelectTeam2: data.canSelectTeam2 !== false,
        }
      }
      return {
        availableTeams: ['Team 1', 'Team 2'],
        canSelectTeam1: true,
        canSelectTeam2: true,
      }
    } catch (error) {
      console.error('Error checking branch teams:', error)
      return {
        availableTeams: ['Team 1', 'Team 2'],
        canSelectTeam1: true,
        canSelectTeam2: true,
      }
    }
  }

  const submitSelection = async (branchName: string, carolIds: number[], customCarolText?: string, team?: string) => {
    try {
      const response = await fetch('/api/carols/select/bulk', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ carolIds, branchName, customCarolText, team }),
      })

      if (response.ok) {
        await fetchCarols()
        clearTempSelection()
        return true
      } else {
        const error = await response.json()
        // Show detailed errors if available
        let errorMessage = error.message || 'Failed to submit selection'
        if (error.errors && Array.isArray(error.errors) && error.errors.length > 0) {
          errorMessage += '\n\n' + error.errors.join('\n')
        }
        alert(errorMessage)
        return false
      }
    } catch (error) {
      console.error('Error submitting selection:', error)
      alert('Failed to submit selection')
      return false
    }
  }

  return (
    <CarolsContext.Provider
      value={{
        carols,
        selectedCarols,
        currentBranch,
        setCurrentBranch,
        selectCarol,
        fetchCarols,
        getBranchCarols,
        tempSelectedCarols,
        toggleTempCarolSelection,
        clearTempSelection,
        submitSelection,
        isLoading,
        isOtherSelected,
        toggleOtherSelection,
        customCarolText,
        setCustomCarolText,
        checkBranchTeams,
      }}
    >
      {children}
    </CarolsContext.Provider>
  )
}

export function useCarols() {
  const context = useContext(CarolsContext)
  if (context === undefined) {
    throw new Error('useCarols must be used within a CarolsProvider')
  }
  return context
}
