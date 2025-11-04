'use client'

import { useState } from 'react'
import { useCarols } from '@/context/CarolsContext'

export default function BranchForm() {
  const [branchName, setBranchName] = useState('')
  const { 
    tempSelectedCarols, 
    submitSelection, 
    carols,
    isOtherSelected,
    customCarolText
  } = useCarols()
  const [isSubmitting, setIsSubmitting] = useState(false)

  const selectedCarolNames = carols
    .filter((c) => tempSelectedCarols.includes(c.id))
    .map((c) => c.name)
  
  const totalSelections = tempSelectedCarols.length + (isOtherSelected ? 1 : 0)

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

    setIsSubmitting(true)
    const success = await submitSelection(
      branchName.trim(), 
      tempSelectedCarols,
      isOtherSelected ? customCarolText.trim() : undefined
    )
    setIsSubmitting(false)

    if (success) {
      // Clear the form after successful submission
      setBranchName('')
      const carolCount = tempSelectedCarols.length + (isOtherSelected ? 1 : 0)
      alert(`Successfully submitted ${carolCount} carol(s) for branch "${branchName.trim()}"`)
    }
  }

  return (
    <div className="bg-white rounded-lg shadow-md p-6 mb-6">
      <h2 className="text-2xl font-bold text-gray-800 mb-4">Step 2: Enter Branch Name and Submit</h2>
      
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

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="flex gap-4">
          <input
            type="text"
            value={branchName}
            onChange={(e) => setBranchName(e.target.value)}
            placeholder="Enter branch name..."
            className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-christmas-green"
            required
            disabled={isSubmitting || totalSelections !== 2}
          />
          <button
            type="submit"
            disabled={isSubmitting || totalSelections !== 2}
            className="px-6 py-2 bg-christmas-green text-white rounded-lg hover:bg-green-700 transition-colors font-semibold disabled:bg-gray-400 disabled:cursor-not-allowed"
          >
            {isSubmitting ? 'Submitting...' : 'Submit'}
          </button>
        </div>
        {totalSelections !== 2 && (
          <p className="text-sm text-gray-500">
            {totalSelections === 0
              ? 'Please select exactly 2 carols first'
              : totalSelections === 1
              ? 'Please select 1 more carol (you need exactly 2 carols)'
              : `Please select exactly 2 carols (you have selected ${totalSelections})`}
          </p>
        )}
      </form>
    </div>
  )
}
