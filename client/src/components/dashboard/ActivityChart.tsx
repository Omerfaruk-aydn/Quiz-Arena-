import { BarChart, Bar, XAxis, YAxis, ResponsiveContainer, Tooltip, CartesianGrid } from 'recharts';

interface ActivityChartProps {
  data: Array<{ label: string; games: number; participants: number }>;
}

export function ActivityChart({ data }: ActivityChartProps) {
  return (
    <div className="glass p-5">
      <div className="mb-4 flex items-center justify-between">
        <h3 className="font-semibold">Son Aktivite</h3>
        <span className="text-xs text-text-muted">Son 14 gün</span>
      </div>
      <div className="h-64 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#2A2A3A" vertical={false} />
            <XAxis
              dataKey="label"
              tick={{ fill: '#94A3B8', fontSize: 12 }}
              axisLine={{ stroke: '#2A2A3A' }}
              tickLine={false}
            />
            <YAxis
              tick={{ fill: '#94A3B8', fontSize: 12 }}
              axisLine={false}
              tickLine={false}
              allowDecimals={false}
            />
            <Tooltip
              cursor={{ fill: '#7C3AED20' }}
              contentStyle={{
                background: '#13131A',
                border: '1px solid #2A2A3A',
                borderRadius: 12,
                color: '#F8FAFC',
              }}
            />
            <Bar dataKey="games" fill="#7C3AED" radius={[6, 6, 0, 0]} name="Oyun" />
            <Bar dataKey="participants" fill="#EC4899" radius={[6, 6, 0, 0]} name="Katılımcı" />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
