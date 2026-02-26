import { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { FileDown, Search, Trash2 } from 'lucide-react';
import { supabase } from '@/lib/supabase';

const IRS_RATE_2024 = 0.67; // $0.67 per mile for 2024

export function MileageLogManager() {
  const [trips, setTrips] = useState<any[]>([]);
  const [filteredTrips, setFilteredTrips] = useState<any[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [typeFilter, setTypeFilter] = useState('all');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchTrips();
  }, []);

  useEffect(() => {
    let filtered = trips;
    if (typeFilter !== 'all') {
      filtered = filtered.filter(t => t.trip_type === typeFilter);
    }
    if (searchTerm) {
      filtered = filtered.filter(t => 
        t.start_location.toLowerCase().includes(searchTerm.toLowerCase()) ||
        t.end_location.toLowerCase().includes(searchTerm.toLowerCase()) ||
        t.purpose?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
    setFilteredTrips(filtered);
  }, [trips, searchTerm, typeFilter]);

  const fetchTrips = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const { data } = await supabase
      .from('mileage_trips')
      .select('*')
      .eq('user_id', user.id)
      .order('trip_date', { ascending: false });

    setTrips(data || []);
    setLoading(false);
  };

  const deleteTrip = async (id: string) => {
    await supabase.from('mileage_trips').delete().eq('id', id);
    fetchTrips();
  };

  const exportToCSV = () => {
    const headers = ['Date', 'Start', 'End', 'Miles', 'Type', 'Purpose', 'Deduction'];
    const rows = filteredTrips.map(t => [
      t.trip_date,
      t.start_location,
      t.end_location,
      t.distance_miles,
      t.trip_type,
      t.purpose || '',
      t.trip_type === 'business' ? `$${(t.distance_miles * IRS_RATE_2024).toFixed(2)}` : '$0.00'
    ]);
    
    const csv = [headers, ...rows].map(row => row.join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `mileage-log-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
  };

  const totalBusinessMiles = filteredTrips.filter(t => t.trip_type === 'business').reduce((sum, t) => sum + parseFloat(t.distance_miles), 0);
  const totalDeduction = totalBusinessMiles * IRS_RATE_2024;

  return (
    <div className="space-y-4">
      <Card className="p-4">
        <div className="flex gap-4 mb-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
            <Input placeholder="Search trips..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="pl-10" />
          </div>
          <Select value={typeFilter} onValueChange={setTypeFilter}>
            <SelectTrigger className="w-40"><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Trips</SelectItem>
              <SelectItem value="business">Business</SelectItem>
              <SelectItem value="personal">Personal</SelectItem>
              <SelectItem value="commute">Commute</SelectItem>
            </SelectContent>
          </Select>
          <Button onClick={exportToCSV}><FileDown className="h-4 w-4 mr-2" />Export CSV</Button>
        </div>
        <div className="grid grid-cols-3 gap-4 mb-4">
          <div className="bg-blue-50 p-4 rounded-lg">
            <div className="text-sm text-gray-600">Business Miles</div>
            <div className="text-2xl font-bold">{totalBusinessMiles.toFixed(1)}</div>
          </div>
          <div className="bg-green-50 p-4 rounded-lg">
            <div className="text-sm text-gray-600">Tax Deduction</div>
            <div className="text-2xl font-bold">${totalDeduction.toFixed(2)}</div>
          </div>
          <div className="bg-purple-50 p-4 rounded-lg">
            <div className="text-sm text-gray-600">IRS Rate</div>
            <div className="text-2xl font-bold">${IRS_RATE_2024}/mi</div>
          </div>
        </div>
      </Card>
      <div className="space-y-2">
        {filteredTrips.map(trip => (
          <Card key={trip.id} className="p-4">
            <div className="flex justify-between items-start">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-2">
                  <span className="font-semibold">{trip.trip_date}</span>
                  <span className={`px-2 py-1 rounded text-xs ${trip.trip_type === 'business' ? 'bg-green-100 text-green-800' : 'bg-gray-100'}`}>
                    {trip.trip_type}
                  </span>
                </div>
                <div className="text-sm text-gray-600 mb-1">{trip.start_location} → {trip.end_location}</div>
                <div className="text-sm">{trip.purpose}</div>
              </div>
              <div className="text-right">
                <div className="font-semibold">{trip.distance_miles} mi</div>
                {trip.trip_type === 'business' && (
                  <div className="text-green-600">${(trip.distance_miles * IRS_RATE_2024).toFixed(2)}</div>
                )}
                <Button variant="ghost" size="sm" onClick={() => deleteTrip(trip.id)} className="mt-2">
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}