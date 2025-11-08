'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useCarols } from '@/context/CarolsContext'

interface Submission {
  id: number
  branch_name: string
  team: string
  carol_ids: number[]
  custom_carol_text?: string | null
  submitted_at: string
}

export default function SubmissionsPage() {
  const { carols, fetchCarols } = useCarols()
  const router = useRouter()
  const [submissions, setSubmissions] = useState<Submission[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [groupedByBranch, setGroupedByBranch] = useState<Record<string, Submission[]>>({})

  useEffect(() => {
    fetchCarols()
    fetchSubmissions()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const fetchSubmissions = async () => {
    try {
      setIsLoading(true)
      const response = await fetch('/api/submissions')
      if (response.ok) {
        const data = await response.json()
        setSubmissions(data)
      } else {
        console.error('Failed to fetch submissions')
      }
    } catch (error) {
      console.error('Error fetching submissions:', error)
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    // Group submissions by branch and team
    const grouped: Record<string, Record<string, Submission[]>> = {}
    
    submissions.forEach((submission) => {
      const branchKey = submission.branch_name
      const teamKey = submission.team || 'No Team'
      
      if (!grouped[branchKey]) {
        grouped[branchKey] = {}
      }
      if (!grouped[branchKey][teamKey]) {
        grouped[branchKey][teamKey] = []
      }
      grouped[branchKey][teamKey].push(submission)
    })
    
    // Convert to flat structure: branch -> teams -> submissions
    const flatGrouped: Record<string, Submission[]> = {}
    Object.keys(grouped).sort().forEach((branch) => {
      Object.keys(grouped[branch]).sort().forEach((team) => {
        const key = `${branch} - ${team}`
        flatGrouped[key] = grouped[branch][team]
      })
    })
    
    setGroupedByBranch(flatGrouped)
  }, [submissions])

  // Helper function to get carol name by ID
  const getCarolName = (carolId: number): string => {
    const carol = carols.find(c => c.id === carolId)
    return carol ? carol.name : `Carol #${carolId}`
  }

  // Format date
  const formatDate = (dateString: string): string => {
    const date = new Date(dateString)
    return date.toLocaleString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  const branches = Object.keys(groupedByBranch)
  const totalSubmissions = submissions.length

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
              Total Submissions: <span className="font-bold text-christmas-green">{totalSubmissions}</span>
            </p>
            <p className="text-gray-600">
              Branches: <span className="font-bold text-christmas-green">{branches.length}</span>
            </p>
          </div>
          <div className="flex gap-3">
            <button
              onClick={fetchSubmissions}
              className="px-6 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors font-semibold"
              disabled={isLoading}
            >
              {isLoading ? 'Loading...' : 'Refresh'}
            </button>
            <button
              onClick={() => router.push('/')}
              className="px-6 py-2 bg-christmas-green text-white rounded-lg hover:bg-green-700 transition-colors font-semibold"
            >
              Make New Selection
            </button>
          </div>
        </div>

        {isLoading ? (
          <div className="bg-white rounded-lg shadow-md p-12 text-center">
            <p className="text-gray-500 text-xl">Loading submissions...</p>
          </div>
        ) : branches.length === 0 ? (
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
              const branchSubmissions = groupedByBranch[branchTeam]
              return (
                <div key={branchTeam} className="bg-white rounded-lg shadow-md p-6">
                  <h2 className="text-2xl font-bold text-christmas-green mb-2 flex items-center justify-between">
                    <span>{branch}</span>
                    <span className="text-lg font-normal text-gray-600">
                      {branchSubmissions.length} {branchSubmissions.length === 1 ? 'Submission' : 'Submissions'}
                    </span>
                  </h2>
                  <div className="mb-4">
                    <span className="px-3 py-1 bg-blue-100 text-blue-700 text-sm rounded-full font-semibold">
                      {team}
                    </span>
                  </div>
                  <div className="space-y-4">
                    {branchSubmissions.map((submission) => (
                      <div
                        key={submission.id}
                        className="p-4 bg-green-50 rounded-lg border-2 border-christmas-green"
                      >
                        <div className="flex items-center justify-between mb-3">
                          <span className="text-sm text-gray-500">
                            Submitted: {formatDate(submission.submitted_at)}
                          </span>
                          <span className="px-3 py-1 bg-christmas-green text-white text-sm rounded-full">
                            {submission.carol_ids.length + (submission.custom_carol_text ? 1 : 0)} {submission.carol_ids.length + (submission.custom_carol_text ? 1 : 0) === 1 ? 'Carol' : 'Carols'}
                          </span>
                        </div>
                        <ul className="space-y-2">
                          {submission.carol_ids.map((carolId) => (
                            <li
                              key={carolId}
                              className="p-2 bg-white rounded border border-green-200"
                            >
                              <span className="font-medium text-gray-800">{getCarolName(carolId)}</span>
                            </li>
                          ))}
                          {submission.custom_carol_text && (
                            <li className="p-2 bg-white rounded border border-green-200">
                              <span className="font-medium text-gray-800">{submission.custom_carol_text}</span>
                              <span className="ml-2 px-2 py-1 bg-purple-100 text-purple-700 text-xs rounded">Custom</span>
                            </li>
                          )}
                        </ul>
                      </div>
                    ))}
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>
    </main>
  )
}

