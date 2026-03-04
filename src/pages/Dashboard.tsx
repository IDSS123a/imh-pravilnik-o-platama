import { useAuth } from '../lib/auth';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card'; // Need to create Card
import { Activity, Users, DollarSign, ShieldCheck } from 'lucide-react';

export default function Dashboard() {
  const { user } = useAuth();

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Dobrodošli, {user?.name}</h1>
        <p className="text-gray-500 mt-2">Pregled finansijskog stanja i obračuna plata za tekući mjesec.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard 
          title="Ukupni Trošak Plata" 
          value="27.302,15 KM" 
          trend="+2.5%" 
          icon={DollarSign} 
          trendUp={false} // Cost going up is usually bad/neutral, but context matters
        />
        <StatCard 
          title="Aktivni Zaposleni" 
          value="19" 
          trend="0" 
          icon={Users} 
          trendUp={true}
        />
        <StatCard 
          title="Likvidnost" 
          value="Stabilna" 
          trend="> 25k KM" 
          icon={Activity} 
          trendUp={true}
          className="text-green-600"
        />
        <StatCard 
          title="Zaštitne Klauzule" 
          value="Neaktivne" 
          trend="Sigurno" 
          icon={ShieldCheck} 
          trendUp={true}
          className="text-green-600"
        />
      </div>

      {/* Charts would go here */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200 h-96 flex items-center justify-center text-gray-400">
          Chart Placeholder: Monthly Cost Trend
        </div>
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200 h-96 flex items-center justify-center text-gray-400">
          Chart Placeholder: Category Breakdown
        </div>
      </div>
    </div>
  );
}

function StatCard({ title, value, trend, icon: Icon, trendUp, className }: any) {
  return (
    <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200 transition-all hover:shadow-md">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-sm font-medium text-gray-500">{title}</h3>
        <div className="p-2 bg-gray-50 rounded-lg">
          <Icon className="w-5 h-5 text-gray-600" />
        </div>
      </div>
      <div className="flex items-end justify-between">
        <div>
          <p className={`text-2xl font-bold text-gray-900 ${className}`}>{value}</p>
        </div>
        <div className={`text-xs font-medium px-2 py-1 rounded-full ${trendUp ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'}`}>
          {trend}
        </div>
      </div>
    </div>
  );
}
