import BranchForm from '@/components/BranchForm'
import CarolList from '@/components/CarolList'

export default function Home() {
  return (
    <main className="min-h-screen bg-gradient-to-br from-red-50 to-green-50 py-8 px-4">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-christmas-red mb-2">
            🎄 Christmas Carols Selection 🎄
          </h1>
          <p className="text-gray-600">
            Select carols, then enter your branch name and submit
          </p>
        </div>

        <div className="mb-6">
          <h2 className="text-2xl font-bold text-gray-800 mb-4">Step 1: Select Carols</h2>
          <CarolList />
        </div>

        <BranchForm />
      </div>
    </main>
  )
}
