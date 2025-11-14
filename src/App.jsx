import { useEffect, useState } from 'react'

function App() {
  const baseUrl = import.meta.env.VITE_BACKEND_URL || 'http://localhost:8000'

  const [harvests, setHarvests] = useState([])
  const [investments, setInvestments] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  const [harvestForm, setHarvestForm] = useState({
    harvest_date: '',
    boat: '',
    location: '',
    weight_kg: '',
    price_per_kg: '',
    notes: ''
  })

  const [investmentForm, setInvestmentForm] = useState({
    investor_name: '',
    amount_usd: '',
    investment_date: '',
    instrument: '',
    notes: ''
  })

  const fetchData = async () => {
    try {
      setLoading(true)
      const [hRes, iRes] = await Promise.all([
        fetch(`${baseUrl}/harvest`),
        fetch(`${baseUrl}/investment`)
      ])
      if (!hRes.ok || !iRes.ok) throw new Error('Failed to fetch data')
      const [hData, iData] = await Promise.all([hRes.json(), iRes.json()])
      setHarvests(hData)
      setInvestments(iData)
      setError('')
    } catch (e) {
      setError(e.message)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchData()
  }, [])

  const onChange = (setter) => (e) => {
    const { name, value } = e.target
    setter((prev) => ({ ...prev, [name]: value }))
  }

  const submitHarvest = async (e) => {
    e.preventDefault()
    try {
      const res = await fetch(`${baseUrl}/harvest`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...harvestForm,
          weight_kg: parseFloat(harvestForm.weight_kg),
          price_per_kg: parseFloat(harvestForm.price_per_kg),
        })
      })
      if (!res.ok) throw new Error('Failed to save harvest')
      setHarvestForm({ harvest_date: '', boat: '', location: '', weight_kg: '', price_per_kg: '', notes: '' })
      fetchData()
    } catch (e) {
      alert(e.message)
    }
  }

  const submitInvestment = async (e) => {
    e.preventDefault()
    try {
      const res = await fetch(`${baseUrl}/investment`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...investmentForm,
          amount_usd: parseFloat(investmentForm.amount_usd)
        })
      })
      if (!res.ok) throw new Error('Failed to save investment')
      setInvestmentForm({ investor_name: '', amount_usd: '', investment_date: '', instrument: '', notes: '' })
      fetchData()
    } catch (e) {
      alert(e.message)
    }
  }

  const totalWeight = harvests.reduce((sum, h) => sum + (h.weight_kg || 0), 0)
  const avgPrice = harvests.length ? (harvests.reduce((sum, h) => sum + (h.price_per_kg || 0), 0) / harvests.length) : 0
  const totalRevenue = harvests.reduce((sum, h) => sum + (h.weight_kg * h.price_per_kg || 0), 0)
  const totalInvested = investments.reduce((sum, i) => sum + (i.amount_usd || 0), 0)

  return (
    <div className="min-h-screen bg-gradient-to-br from-sky-50 to-emerald-50">
      <header className="bg-white/70 backdrop-blur sticky top-0 z-10 border-b">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <h1 className="text-2xl font-bold text-emerald-700">Lobster Harvest Dashboard</h1>
          <nav className="space-x-4 text-sm">
            <a href="/test" className="text-gray-600 hover:text-emerald-700">System Test</a>
            <a href="#harvest" className="text-gray-600 hover:text-emerald-700">Harvest</a>
            <a href="#invest" className="text-gray-600 hover:text-emerald-700">Invest</a>
          </nav>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-6 py-8">
        {/* Stats */}
        <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
          <div className="bg-white rounded-xl shadow p-5">
            <p className="text-gray-500 text-sm">Total Catch</p>
            <p className="text-3xl font-semibold">{totalWeight.toFixed(1)} kg</p>
          </div>
          <div className="bg-white rounded-xl shadow p-5">
            <p className="text-gray-500 text-sm">Avg Dock Price</p>
            <p className="text-3xl font-semibold">${avgPrice.toFixed(2)}/kg</p>
          </div>
          <div className="bg-white rounded-xl shadow p-5">
            <p className="text-gray-500 text-sm">Est. Revenue</p>
            <p className="text-3xl font-semibold">${totalRevenue.toFixed(0)}</p>
          </div>
          <div className="bg-white rounded-xl shadow p-5">
            <p className="text-gray-500 text-sm">Total Invested</p>
            <p className="text-3xl font-semibold">${totalInvested.toFixed(0)}</p>
          </div>
        </section>

        {/* Forms */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8" id="harvest">
          <div className="bg-white rounded-xl shadow p-6">
            <h2 className="text-xl font-semibold mb-4">Log Harvest</h2>
            <form onSubmit={submitHarvest} className="grid grid-cols-2 gap-4">
              <div className="col-span-2 sm:col-span-1">
                <label className="block text-sm text-gray-600 mb-1">Date</label>
                <input type="date" name="harvest_date" value={harvestForm.harvest_date} onChange={onChange(setHarvestForm)} className="w-full border rounded px-3 py-2" required />
              </div>
              <div>
                <label className="block text-sm text-gray-600 mb-1">Boat</label>
                <input type="text" name="boat" value={harvestForm.boat} onChange={onChange(setHarvestForm)} className="w-full border rounded px-3 py-2" placeholder="Vessel" required />
              </div>
              <div>
                <label className="block text-sm text-gray-600 mb-1">Location</label>
                <input type="text" name="location" value={harvestForm.location} onChange={onChange(setHarvestForm)} className="w-full border rounded px-3 py-2" placeholder="Area/Port" required />
              </div>
              <div>
                <label className="block text-sm text-gray-600 mb-1">Weight (kg)</label>
                <input type="number" step="0.1" name="weight_kg" value={harvestForm.weight_kg} onChange={onChange(setHarvestForm)} className="w-full border rounded px-3 py-2" required />
              </div>
              <div>
                <label className="block text-sm text-gray-600 mb-1">Price per kg ($)</label>
                <input type="number" step="0.01" name="price_per_kg" value={harvestForm.price_per_kg} onChange={onChange(setHarvestForm)} className="w-full border rounded px-3 py-2" required />
              </div>
              <div className="col-span-2">
                <label className="block text-sm text-gray-600 mb-1">Notes</label>
                <textarea name="notes" value={harvestForm.notes} onChange={onChange(setHarvestForm)} className="w-full border rounded px-3 py-2" rows="2" placeholder="Optional"></textarea>
              </div>
              <div className="col-span-2">
                <button className="bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2 rounded">Save Harvest</button>
              </div>
            </form>
          </div>

          <div className="bg-white rounded-xl shadow p-6" id="invest">
            <h2 className="text-xl font-semibold mb-4">Record Investment</h2>
            <form onSubmit={submitInvestment} className="grid grid-cols-2 gap-4">
              <div className="col-span-2">
                <label className="block text-sm text-gray-600 mb-1">Investor</label>
                <input type="text" name="investor_name" value={investmentForm.investor_name} onChange={onChange(setInvestmentForm)} className="w-full border rounded px-3 py-2" placeholder="Full name" required />
              </div>
              <div>
                <label className="block text-sm text-gray-600 mb-1">Amount (USD)</label>
                <input type="number" step="0.01" name="amount_usd" value={investmentForm.amount_usd} onChange={onChange(setInvestmentForm)} className="w-full border rounded px-3 py-2" required />
              </div>
              <div>
                <label className="block text-sm text-gray-600 mb-1">Date</label>
                <input type="date" name="investment_date" value={investmentForm.investment_date} onChange={onChange(setInvestmentForm)} className="w-full border rounded px-3 py-2" required />
              </div>
              <div className="col-span-2">
                <label className="block text-sm text-gray-600 mb-1">Instrument</label>
                <input type="text" name="instrument" value={investmentForm.instrument} onChange={onChange(setInvestmentForm)} className="w-full border rounded px-3 py-2" placeholder="e.g., revenue share" required />
              </div>
              <div className="col-span-2">
                <label className="block text-sm text-gray-600 mb-1">Notes</label>
                <textarea name="notes" value={investmentForm.notes} onChange={onChange(setInvestmentForm)} className="w-full border rounded px-3 py-2" rows="2" placeholder="Optional"></textarea>
              </div>
              <div className="col-span-2">
                <button className="bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2 rounded">Save Investment</button>
              </div>
            </form>
          </div>
        </div>

        {/* Tables */}
        <section className="grid grid-cols-1 lg:grid-cols-2 gap-8 mt-10">
          <div className="bg-white rounded-xl shadow p-6">
            <h3 className="text-lg font-semibold mb-4">Recent Harvests</h3>
            <div className="overflow-x-auto">
              <table className="min-w-full text-sm">
                <thead>
                  <tr className="text-left text-gray-600 border-b">
                    <th className="py-2 pr-4">Date</th>
                    <th className="py-2 pr-4">Boat</th>
                    <th className="py-2 pr-4">Location</th>
                    <th className="py-2 pr-4">Weight (kg)</th>
                    <th className="py-2 pr-4">Price/kg</th>
                  </tr>
                </thead>
                <tbody>
                  {harvests.map((h) => (
                    <tr key={h._id} className="border-b last:border-none">
                      <td className="py-2 pr-4">{h.harvest_date || h.date}</td>
                      <td className="py-2 pr-4">{h.boat}</td>
                      <td className="py-2 pr-4">{h.location}</td>
                      <td className="py-2 pr-4">{h.weight_kg}</td>
                      <td className="py-2 pr-4">${h.price_per_kg}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow p-6">
            <h3 className="text-lg font-semibold mb-4">Recent Investments</h3>
            <div className="overflow-x-auto">
              <table className="min-w-full text-sm">
                <thead>
                  <tr className="text-left text-gray-600 border-b">
                    <th className="py-2 pr-4">Date</th>
                    <th className="py-2 pr-4">Investor</th>
                    <th className="py-2 pr-4">Instrument</th>
                    <th className="py-2 pr-4">Amount</th>
                  </tr>
                </thead>
                <tbody>
                  {investments.map((i) => (
                    <tr key={i._id} className="border-b last:border-none">
                      <td className="py-2 pr-4">{i.investment_date || i.date}</td>
                      <td className="py-2 pr-4">{i.investor_name}</td>
                      <td className="py-2 pr-4">{i.instrument}</td>
                      <td className="py-2 pr-4">${i.amount_usd}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </section>

        {error && (
          <div className="mt-6 text-red-600">{error}</div>
        )}
        {loading && (
          <div className="mt-6 text-gray-600">Loading...</div>
        )}
      </main>

      <footer className="max-w-7xl mx-auto px-6 py-8 text-center text-gray-500">
        Built for sustainable lobster fisheries — track harvests and investments in one place.
      </footer>
    </div>
  )
}

export default App
