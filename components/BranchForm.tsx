'use client'

import { useState } from 'react'
import { useCarols } from '@/context/CarolsContext'

export default function BranchForm() {
  const [branchName, setBranchName] = useState('')
  const { tempSelectedCarols, submitSelection, carols } = useCarols()
  const [isSubmitting, setIsSubmitting] = useState(false)

  const selectedCarolNames = carols
    .filter((c) => tempSelectedCarols.includes(c.id))
    .map((c) => c.name)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!branchName.trim()) {
      alert('Please enter a branch name')
      return
    }

    if (tempSelectedCarols.length !== 2) {
      alert('You must select exactly 2 carols (not 1, not 3 or more)')
      return
    }

    setIsSubmitting(true)
    const success = await submitSelection(branchName.trim(), tempSelectedCarols)
    setIsSubmitting(false)

    if (success) {
      // Clear the form after successful submission
      setBranchName('')
      alert(`Successfully submitted ${tempSelectedCarols.length} carol(s) for branch "${branchName.trim()}"`)
    }
  }

  return (
    <div className="bg-white rounded-lg shadow-md p-6 mb-6">
      <h2 className="text-2xl font-bold text-gray-800 mb-4">Step 2: Enter Branch Name and Submit</h2>
      
      {/* Show selected carols */}
      {tempSelectedCarols.length > 0 && (
        <div className="mb-4 p-4 bg-green-50 rounded-lg">
          <h3 className="font-semibold text-christmas-green mb-2">
            Selected Carols ({tempSelectedCarols.length}):
          </h3>
          <ul className="list-disc list-inside space-y-1">
            {selectedCarolNames.map((name, index) => (
              <li key={index} className="text-gray-700">{name}</li>
            ))}
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
            disabled={isSubmitting || tempSelectedCarols.length !== 2}
          />
          <button
            type="submit"
            disabled={isSubmitting || tempSelectedCarols.length !== 2}
            className="px-6 py-2 bg-christmas-green text-white rounded-lg hover:bg-green-700 transition-colors font-semibold disabled:bg-gray-400 disabled:cursor-not-allowed"
          >
            {isSubmitting ? 'Submitting...' : 'Submit'}
          </button>
        </div>
        {tempSelectedCarols.length !== 2 && (
          <p className="text-sm text-gray-500">
            {tempSelectedCarols.length === 0
              ? 'Please select exactly 2 carols first'
              : tempSelectedCarols.length === 1
              ? 'Please select 1 more carol (you need exactly 2 carols)'
              : `Please select exactly 2 carols (you have selected ${tempSelectedCarols.length})`}
          </p>
        )}
      </form>
    </div>
  )
}
