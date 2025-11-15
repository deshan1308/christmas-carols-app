'use client'

import { useCarols } from '@/context/CarolsContext'

export default function CarolList() {
  const { 
    carols, 
    tempSelectedCarols, 
    toggleTempCarolSelection, 
    fetchCarols, 
    isLoading,
    isOtherSelected,
    toggleOtherSelection,
    customCarolText,
    setCustomCarolText
  } = useCarols()

  const availableCarols = carols.filter((carol) => !carol.selected)
  const selectedCarols = carols.filter((carol) => carol.selected)
  
  // Debug: Log selected carols to verify they're being received
  if (selectedCarols.length > 0) {
    console.log('CarolList - Selected carols:', selectedCarols.map(c => ({
      id: c.id,
      name: c.name,
      branch: c.branch,
      selected: c.selected
    })))
  }
  
  // Calculate total selections (carols + other)
  const totalSelections = tempSelectedCarols.length + (isOtherSelected ? 1 : 0)

  // Debug logging
  console.log('=== CAROL LIST RENDER ===')
  console.log('isLoading:', isLoading)
  console.log('Total carols:', carols.length)
  console.log('Available carols:', availableCarols.length)
  console.log('Selected carols:', selectedCarols.length)
  if (carols.length > 0) {
    console.log('Sample carol:', carols[0])
  }
  console.log('=== END RENDER ===')

  const handleToggleCarol = (carolId: number) => {
    // Only allow selection of available carols
    const carol = carols.find((c) => c.id === carolId)
    if (carol && !carol.selected) {
      const isCurrentlySelected = tempSelectedCarols.includes(carolId)
      const currentTotal = tempSelectedCarols.length + (isOtherSelected ? 1 : 0)
      
      // If trying to select a new carol and already have 2 selected, prevent it
      if (!isCurrentlySelected && currentTotal >= 2) {
        alert('You can only select exactly 2 carols. Please deselect one first.')
        return
      }
      
      toggleTempCarolSelection(carolId)
    }
  }

  return (
    <div className="space-y-6">
      {/* Available Carols with Checkboxes */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-xl font-bold text-gray-800">
            Select Carols ({totalSelections}/2 selected)
          </h3>
          {carols.length === 0 && (
            <button
              onClick={() => fetchCarols()}
              className="px-4 py-2 bg-christmas-green text-white rounded-lg hover:bg-green-700 transition-colors text-sm font-semibold"
            >
              Refresh
            </button>
          )}
        </div>
        <p className="text-sm text-gray-600 mb-4">
          You must select exactly 2 carols (not 1, not 3 or more)
        </p>
        {isLoading ? (
          <div className="text-center py-8">
            <p className="text-gray-500 mb-4">Loading carols...</p>
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-christmas-green mx-auto"></div>
          </div>
        ) : carols.length === 0 ? (
          <div className="text-center py-8">
            <p className="text-gray-500 mb-4">No carols found. Please refresh.</p>
            <button
              onClick={() => fetchCarols()}
              className="px-4 py-2 bg-christmas-green text-white rounded-lg hover:bg-green-700 transition-colors text-sm font-semibold"
            >
              Refresh
            </button>
          </div>
        ) : availableCarols.length === 0 ? (
          <p className="text-gray-500 text-center py-8">
            No carols available. All carols have been selected.
          </p>
        ) : (
          <ul className="space-y-2">
            {availableCarols.map((carol) => {
              const isTempSelected = tempSelectedCarols.includes(carol.id)
              const canSelect = tempSelectedCarols.length < 2 || isTempSelected
              return (
                <li
                  key={carol.id}
                  className={`p-4 border rounded-lg transition-all flex items-center gap-4 ${
                    isTempSelected
                      ? 'border-christmas-green bg-green-50'
                      : canSelect
                      ? 'border-gray-200 hover:border-christmas-green hover:shadow-md'
                      : 'border-gray-200 bg-gray-50 opacity-60'
                  }`}
                >
                  <input
                    type="checkbox"
                    checked={isTempSelected}
                    onChange={() => handleToggleCarol(carol.id)}
                    disabled={!canSelect}
                    className="w-5 h-5 text-christmas-green border-gray-300 rounded focus:ring-christmas-green disabled:cursor-not-allowed"
                  />
                  <span className="font-medium text-gray-800 flex-1">{carol.name}</span>
                  {isTempSelected && (
                    <span className="px-3 py-1 bg-christmas-green text-white text-sm rounded-full">
                      Selected
                    </span>
                  )}
                </li>
              )
            })}
          </ul>
        )}
        
        {/* Other Option */}
        <div className="mt-4 pt-4 border-t border-gray-200">
          <div className={`p-4 border rounded-lg transition-all ${
            isOtherSelected
              ? 'border-christmas-green bg-green-50'
              : totalSelections < 2
              ? 'border-gray-200 hover:border-christmas-green hover:shadow-md'
              : 'border-gray-200 bg-gray-50 opacity-60'
          }`}>
            <div className="flex items-center gap-4 mb-3">
              <input
                type="checkbox"
                checked={isOtherSelected}
                onChange={toggleOtherSelection}
                disabled={totalSelections >= 2 && !isOtherSelected}
                className="w-5 h-5 text-christmas-green border-gray-300 rounded focus:ring-christmas-green disabled:cursor-not-allowed"
              />
              <span className="font-medium text-gray-800 flex-1">Other (Type your own carol)</span>
              {isOtherSelected && (
                <span className="px-3 py-1 bg-christmas-green text-white text-sm rounded-full">
                  Selected
                </span>
              )}
            </div>
            {isOtherSelected && (
              <div className="mt-3">
                <input
                  type="text"
                  value={customCarolText}
                  onChange={(e) => setCustomCarolText(e.target.value)}
                  placeholder="Type your carol name here..."
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-christmas-green"
                />
                {!customCarolText.trim() && (
                  <p className="text-sm text-red-500 mt-1">Please enter a carol name</p>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Already Selected Carols by Other Branches */}
      {selectedCarols.length > 0 && (
        <div className="bg-gray-50 rounded-lg shadow-md p-6">
          <h3 className="text-xl font-bold text-gray-600 mb-4">
            Not Available - Already Taken
          </h3>
          <ul className="space-y-2">
            {selectedCarols.map((carol) => (
              <li
                key={carol.id}
                className="p-3 bg-white rounded-lg border border-gray-200 flex items-center justify-between"
              >
                <span className="text-gray-600">{carol.name}</span>
                <div className="flex items-center gap-2">
                  <span className="px-3 py-1 bg-gray-200 text-gray-700 text-sm rounded-full">
                    {carol.branch}
                  </span>
                  <span className="px-3 py-1 bg-red-100 text-red-700 text-sm rounded-full">
                    Not Available - Already Taken
                  </span>
                </div>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  )
}
