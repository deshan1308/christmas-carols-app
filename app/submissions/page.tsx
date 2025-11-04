'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useCarols } from '@/context/CarolsContext'

export default function SubmissionsPage() {
  const { carols, fetchCarols } = useCarols()
  const router = useRouter()
  const [groupedByBranch, setGroupedByBranch] = useState<Record<string, any[]>>({})

  useEffect(() => {
    fetchCarols()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  useEffect(() => {
    // Group carols by branch and team
    const grouped: Record<string, Record<string, any[]>> = {}
    carols
      .filter((c) => c.selected && c.branch)
      .forEach((carol) => {
        const branchKey = carol.branch!
        const teamKey = carol.team || 'No Team'
        
        if (!grouped[branchKey]) {
          grouped[branchKey] = {}
        }
        if (!grouped[branchKey][teamKey]) {
          grouped[branchKey][teamKey] = []
        }
        grouped[branchKey][teamKey].push(carol)
      })
    
    // Convert to flat structure: branch -> teams -> carols
    const flatGrouped: Record<string, any[]> = {}
    Object.keys(grouped).sort().forEach((branch) => {
      Object.keys(grouped[branch]).sort().forEach((team) => {
        const key = `${branch} - ${team}`
        flatGrouped[key] = grouped[branch][team]
      })
    })
    
    setGroupedByBranch(flatGrouped)
  }, [carols])

  const branches = Object.keys(groupedByBranch)
  const totalSelected = carols.filter((c) => c.selected).length

  return (
    <main className="min-h-screen bg-gradient-to-br from-red-50 to-green-50 py-8 px-4">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-christmas-red mb-2">
            🎄 Christmas Carols Submissions 🎄
          </h1>
          <p className="text-gray-600">
            View all submitted carol selections by branch
          </p>
        </div>

        <div className="mb-6 flex justify-between items-center">
          <div className="bg-white rounded-lg shadow-md px-6 py-4">
            <p className="text-gray-600">
              Total Selections: <span className="font-bold text-christmas-green">{totalSelected}</span>
            </p>
            <p className="text-gray-600">
              Branches: <span className="font-bold text-christmas-green">{branches.length}</span>
            </p>
          </div>
          <button
            onClick={() => router.push('/')}
            className="px-6 py-2 bg-christmas-green text-white rounded-lg hover:bg-green-700 transition-colors font-semibold"
          >
            Make New Selection
          </button>
        </div>

        {branches.length === 0 ? (
          <div className="bg-white rounded-lg shadow-md p-12 text-center">
            <p className="text-gray-500 text-xl">No submissions yet.</p>
            <button
              onClick={() => router.push('/')}
              className="mt-4 px-6 py-2 bg-christmas-green text-white rounded-lg hover:bg-green-700 transition-colors font-semibold"
            >
              Make First Selection
            </button>
          </div>
        ) : (
          <div className="space-y-6">
            {branches.map((branchTeam) => {
              const [branch, team] = branchTeam.split(' - ')
              return (
                <div key={branchTeam} className="bg-white rounded-lg shadow-md p-6">
                  <h2 className="text-2xl font-bold text-christmas-green mb-2 flex items-center justify-between">
                    <span>{branch}</span>
                    <span className="text-lg font-normal text-gray-600">
                      {groupedByBranch[branchTeam].length} {groupedByBranch[branchTeam].length === 1 ? 'Carol' : 'Carols'}
                    </span>
                  </h2>
                  <div className="mb-4">
                    <span className="px-3 py-1 bg-blue-100 text-blue-700 text-sm rounded-full font-semibold">
                      {team}
                    </span>
                  </div>
                  <ul className="space-y-2">
                    {groupedByBranch[branchTeam].map((carol) => (
                      <li
                        key={carol.id}
                        className="p-4 bg-green-50 rounded-lg border-2 border-christmas-green flex items-center justify-between"
                      >
                        <span className="font-medium text-gray-800">{carol.name}</span>
                        <span className="px-3 py-1 bg-christmas-green text-white text-sm rounded-full">
                          Selected
                        </span>
                      </li>
                    ))}
                  </ul>
                </div>
              )
            })}
          </div>
        )}
      </div>
    </main>
  )
}

