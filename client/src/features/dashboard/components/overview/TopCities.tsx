const cities = [
  { name: 'Ahmedabad', count: '2,985', percentage: 95 },
  { name: 'Mumbai', count: '2,450', percentage: 80 },
  { name: 'Bangalore', count: '2,310', percentage: 75 },
  { name: 'Delhi', count: '1,985', percentage: 65 },
  { name: 'Pune', count: '1,750', percentage: 55 },
]

export const TopCities = () => {
  return (
    <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm h-full">
      <div className="flex items-center justify-between mb-6">
        <h3 className="font-bold text-dash-text">Top Cities by Listings</h3>
        <button className="text-xs font-bold text-dash-brand hover:underline">
          View All
        </button>
      </div>

      <div className="space-y-5">
        {cities.map((city) => (
          <div
            key={city.name}
            className="flex items-center justify-between group"
          >
            <span className="text-xs font-bold text-dash-text-soft w-24">
              {city.name}
            </span>
            <div className="flex-1 h-1.5 bg-gray-100 rounded-full overflow-hidden mx-4">
              <div
                className="h-full bg-dash-brand rounded-full transition-all duration-1000 group-hover:bg-primary-light"
                style={{ width: `${city.percentage}%` }}
              ></div>
            </div>
            <span className="text-xs font-bold text-dash-text text-right w-12">
              {city.count}
            </span>
          </div>
        ))}
      </div>
    </div>
  )
}
