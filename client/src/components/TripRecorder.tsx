import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Card } from '@/components/ui/card';
import { MapPin, Navigation } from 'lucide-react';
import { supabase } from '@/lib/supabase';

export function TripRecorder({ onTripAdded }: { onTripAdded: () => void }) {
  const [startLocation, setStartLocation] = useState('');
  const [endLocation, setEndLocation] = useState('');
  const [startCoords, setStartCoords] = useState<{lat: number, lng: number} | null>(null);
  const [distance, setDistance] = useState('');
  const [purpose, setPurpose] = useState('');
  const [tripType, setTripType] = useState('business');
  const [tripDate, setTripDate] = useState(new Date().toISOString().split('T')[0]);
  const [isRoundTrip, setIsRoundTrip] = useState(false);
  const [notes, setNotes] = useState('');
  const [loading, setLoading] = useState(false);

  const getCurrentLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition((position) => {
        setStartCoords({ lat: position.coords.latitude, lng: position.coords.longitude });
      });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const { error } = await supabase.from('mileage_trips').insert({
      user_id: user.id,
      trip_date: tripDate,
      start_location: startLocation,
      end_location: endLocation,
      start_lat: startCoords?.lat,
      start_lng: startCoords?.lng,
      distance_miles: parseFloat(distance),
      purpose,
      trip_type: tripType,
      is_round_trip: isRoundTrip,
      notes
    });

    setLoading(false);
    if (!error) {
      setStartLocation('');
      setEndLocation('');
      setDistance('');
      setPurpose('');
      setNotes('');
      onTripAdded();
    }
  };

  return (
    <Card className="p-6">
      <h3 className="text-lg font-semibold mb-4">Record New Trip</h3>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <Label>Trip Date</Label>
            <Input type="date" value={tripDate} onChange={(e) => setTripDate(e.target.value)} required />
          </div>
          <div>
            <Label>Trip Type</Label>
            <Select value={tripType} onValueChange={setTripType}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="business">Business</SelectItem>
                <SelectItem value="personal">Personal</SelectItem>
                <SelectItem value="commute">Commute</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
        <div>
          <Label>Start Location</Label>
          <div className="flex gap-2">
            <Input value={startLocation} onChange={(e) => setStartLocation(e.target.value)} required />
            <Button type="button" size="icon" onClick={getCurrentLocation}><Navigation className="h-4 w-4" /></Button>
          </div>
        </div>
        <div>
          <Label>End Location</Label>
          <Input value={endLocation} onChange={(e) => setEndLocation(e.target.value)} required />
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <Label>Distance (miles)</Label>
            <Input type="number" step="0.1" value={distance} onChange={(e) => setDistance(e.target.value)} required />
          </div>
          <div className="flex items-end">
            <label className="flex items-center gap-2">
              <input type="checkbox" checked={isRoundTrip} onChange={(e) => setIsRoundTrip(e.target.checked)} />
              Round Trip
            </label>
          </div>
        </div>
        <div>
          <Label>Purpose</Label>
          <Input value={purpose} onChange={(e) => setPurpose(e.target.value)} placeholder="Client meeting, site visit, etc." required />
        </div>
        <div>
          <Label>Notes</Label>
          <Textarea value={notes} onChange={(e) => setNotes(e.target.value)} />
        </div>
        <Button type="submit" disabled={loading} className="w-full">Record Trip</Button>
      </form>
    </Card>
  );
}