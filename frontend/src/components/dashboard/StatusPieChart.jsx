import { PieChart, Pie, Cell, Legend, Tooltip, ResponsiveContainer } from 'recharts';

const COLORS = { Draft: '#d1d5db', Review: '#fbbf24', Approved: '#4ade80' };

export default function StatusPieChart({ data }) {
  const chartData = [
    { name: 'Draft', value: data.Draft || 0 },
    { name: 'Review', value: data.Review || 0 },
    { name: 'Approved', value: data.Approved || 0 },
  ];

  return (
    <div className="bg-white rounded shadow p-6">
      <h3 className="text-lg font-semibold text-gray-800 mb-4">Applications by Status</h3>
      <ResponsiveContainer width="100%" height={300}>
        <PieChart>
          <Pie data={chartData} cx="50%" cy="50%" labelLine={false} label={({ name, value }) => `${name}: ${value}`} outerRadius={80} fill="#8884d8" dataKey="value">
            {chartData.map((entry) => <Cell key={entry.name} fill={COLORS[entry.name]} />)}
          </Pie>
          <Tooltip />
          <Legend />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
}
