'use client'

import { useState, useEffect } from 'react'
import { useCarols } from '@/context/CarolsContext'

export default function BranchForm() {
  const [branchName, setBranchName] = useState('')
  const [selectedTeam, setSelectedTeam] = useState<string>('')
  const [availableTeams, setAvailableTeams] = useState<string[]>(['Team 1', 'Team 2'])
  const [canSelectTeam1, setCanSelectTeam1] = useState(true)
  const [canSelectTeam2, setCanSelectTeam2] = useState(true)
  const [isCheckingTeams, setIsCheckingTeams] = useState(false)
  const { 
    tempSelectedCarols, 
    submitSelection, 
    carols,
    isOtherSelected,
    customCarolText,
    checkBranchTeams
  } = useCarols()
  const [isSubmitting, setIsSubmitting] = useState(false)

  const selectedCarolNames = carols
    .filter((c) => tempSelectedCarols.includes(c.id))
    .map((c) => c.name)
  
  const totalSelections = tempSelectedCarols.length + (isOtherSelected ? 1 : 0)

  // Check available teams when branch name changes
  useEffect(() => {
    if (branchName.trim()) {
      setIsCheckingTeams(true)
      checkBranchTeams(branchName.trim()).then((result) => {
        setAvailableTeams(result.availableTeams)
        setCanSelectTeam1(result.canSelectTeam1)
        setCanSelectTeam2(result.canSelectTeam2)
        setIsCheckingTeams(false)
        
        // If only one team available, auto-select it
        if (result.availableTeams.length === 1) {
          setSelectedTeam(result.availableTeams[0])
        } else if (result.availableTeams.length === 0) {
          setSelectedTeam('')
        }
        
        // If current selection is not available, clear it
        if (selectedTeam && !result.availableTeams.includes(selectedTeam)) {
          setSelectedTeam('')
        }
      })
    } else {
      setAvailableTeams(['Team 1', 'Team 2'])
      setCanSelectTeam1(true)
      setCanSelectTeam2(true)
      setSelectedTeam('')
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [branchName])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!branchName.trim()) {
      alert('Please enter a branch name')
      return
    }

    if (totalSelections !== 2) {
      alert('You must select exactly 2 carols (not 1, not 3 or more)')
      return
    }

    if (isOtherSelected && !customCarolText.trim()) {
      alert('Please enter a carol name for "Other" option')
      return
    }

    if (!selectedTeam) {
      alert('Please select a team (Team 1 or Team 2)')
      return
    }

    setIsSubmitting(true)
    const success = await submitSelection(
      branchName.trim(), 
      tempSelectedCarols,
      isOtherSelected ? customCarolText.trim() : undefined,
      selectedTeam
    )
    setIsSubmitting(false)

    if (success) {
      // Clear the form after successful submission
      const submittedBranchName = branchName.trim()
      const submittedTeam = selectedTeam
      setBranchName('')
      setSelectedTeam('')
      const carolCount = tempSelectedCarols.length + (isOtherSelected ? 1 : 0)
      alert(`Successfully submitted ${carolCount} carol(s) for branch "${submittedBranchName}" with ${submittedTeam}`)
    }
  }

  return (
    <div className="space-y-6">
      {/* Step 2: Branch Name */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <h2 className="text-2xl font-bold text-gray-800 mb-4">Step 2: Enter Branch Name</h2>
        
        <div className="space-y-4">
          <input
            type="text"
            value={branchName}
            onChange={(e) => setBranchName(e.target.value)}
            placeholder="Enter branch name..."
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-christmas-green"
            disabled={isSubmitting || totalSelections !== 2}
          />
          
          {branchName.trim() && isCheckingTeams && (
            <p className="text-sm text-gray-500">Checking available teams...</p>
          )}
          
          {branchName.trim() && !isCheckingTeams && availableTeams.length === 0 && (
            <p className="text-sm text-red-500">
              This branch has already selected both Team 1 and Team 2. No more teams available.
            </p>
          )}
        </div>
      </div>

      {/* Step 3: Team Selection */}
      {branchName.trim() && totalSelections === 2 && availableTeams.length > 0 && (
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-2xl font-bold text-gray-800 mb-4">Step 3: Select Team</h2>
          
          {/* Show selected carols */}
          {totalSelections > 0 && (
            <div className="mb-4 p-4 bg-green-50 rounded-lg">
              <h3 className="font-semibold text-christmas-green mb-2">
                Selected Carols ({totalSelections}):
              </h3>
              <ul className="list-disc list-inside space-y-1">
                {selectedCarolNames.map((name, index) => (
                  <li key={index} className="text-gray-700">{name}</li>
                ))}
                {isOtherSelected && customCarolText.trim() && (
                  <li className="text-gray-700">Other: {customCarolText}</li>
                )}
              </ul>
            </div>
          )}

          <div className="space-y-3">
            {canSelectTeam1 && (
              <label className={`flex items-center gap-3 p-4 border-2 rounded-lg cursor-pointer transition-all ${
                selectedTeam === 'Team 1'
                  ? 'border-christmas-green bg-green-50'
                  : 'border-gray-200 hover:border-christmas-green hover:bg-gray-50'
              }`}>
                <input
                  type="radio"
                  name="team"
                  value="Team 1"
                  checked={selectedTeam === 'Team 1'}
                  onChange={(e) => setSelectedTeam(e.target.value)}
                  className="w-5 h-5 text-christmas-green border-gray-300 focus:ring-christmas-green"
                />
                <span className="font-medium text-gray-800 flex-1">Team 1</span>
                {selectedTeam === 'Team 1' && (
                  <span className="px-3 py-1 bg-christmas-green text-white text-sm rounded-full">
                    Selected
                  </span>
                )}
              </label>
            )}

            {canSelectTeam2 && (
              <label className={`flex items-center gap-3 p-4 border-2 rounded-lg cursor-pointer transition-all ${
                selectedTeam === 'Team 2'
                  ? 'border-christmas-green bg-green-50'
                  : 'border-gray-200 hover:border-christmas-green hover:bg-gray-50'
              }`}>
                <input
                  type="radio"
                  name="team"
                  value="Team 2"
                  checked={selectedTeam === 'Team 2'}
                  onChange={(e) => setSelectedTeam(e.target.value)}
                  className="w-5 h-5 text-christmas-green border-gray-300 focus:ring-christmas-green"
                />
                <span className="font-medium text-gray-800 flex-1">Team 2</span>
                {selectedTeam === 'Team 2' && (
                  <span className="px-3 py-1 bg-christmas-green text-white text-sm rounded-full">
                    Selected
                  </span>
                )}
              </label>
            )}

            {!canSelectTeam1 && !canSelectTeam2 && (
              <p className="text-sm text-red-500 p-4 bg-red-50 rounded-lg">
                This branch has already selected both teams. No teams available.
              </p>
            )}
          </div>
        </div>
      )}

      {/* Submit Button */}
      {branchName.trim() && totalSelections === 2 && selectedTeam && (
        <div className="bg-white rounded-lg shadow-md p-6">
          <form onSubmit={handleSubmit} className="space-y-4">
            <button
              type="submit"
              disabled={isSubmitting || !selectedTeam}
              className="w-full px-6 py-3 bg-christmas-green text-white rounded-lg hover:bg-green-700 transition-colors font-semibold disabled:bg-gray-400 disabled:cursor-not-allowed text-lg"
            >
              {isSubmitting ? 'Submitting...' : 'Submit Selection'}
            </button>
          </form>
        </div>
      )}

      {/* Instructions */}
      {totalSelections !== 2 && (
        <div className="bg-white rounded-lg shadow-md p-6">
          <p className="text-sm text-gray-500">
            {totalSelections === 0
              ? 'Please select exactly 2 carols first'
              : totalSelections === 1
              ? 'Please select 1 more carol (you need exactly 2 carols)'
              : `Please select exactly 2 carols (you have selected ${totalSelections})`}
          </p>
        </div>
      )}
    </div>
  )
}
