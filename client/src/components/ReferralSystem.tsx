import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Copy, Gift, Users, Star, CheckCircle } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { useToast } from '@/hooks/use-toast';

interface Referral {
  id: string;
  referral_code: string;
  referred_email: string;
  status: string;
  reward_type: string;
  reward_value: string;
  created_at: string;
}

interface Incentive {
  id: string;
  incentive_type: string;
  description: string;
  reward_type: string;
  reward_value: string;
  status: string;
  expires_at: string;
}

export const ReferralSystem: React.FC = () => {
  const [referralCode, setReferralCode] = useState('');
  const [referrals, setReferrals] = useState<Referral[]>([]);
  const [incentives, setIncentives] = useState<Incentive[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    loadReferralData();
  }, []);

  const loadReferralData = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      // Get or create referral code
      const { data: existingReferrals } = await supabase
        .from('referrals')
        .select('referral_code')
        .eq('referrer_id', user.id)
        .limit(1);

      if (existingReferrals && existingReferrals.length > 0) {
        setReferralCode(existingReferrals[0].referral_code);
      } else {
        // Generate new referral code
        const code = `TAX${user.id.substring(0, 8).toUpperCase()}`;
        const { error } = await supabase
          .from('referrals')
          .insert({ referrer_id: user.id, referral_code: code });
        
        if (!error) setReferralCode(code);
      }

      // Load referrals
      const { data: refData } = await supabase
        .from('referrals')
        .select('*')
        .eq('referrer_id', user.id)
        .order('created_at', { ascending: false });

      if (refData) setReferrals(refData);

      // Load incentives
      const { data: incData } = await supabase
        .from('incentives')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (incData) setIncentives(incData);
    } catch (error) {
      console.error('Error loading referral data:', error);
    } finally {
      setLoading(false);
    }
  };

  const copyReferralCode = () => {
    navigator.clipboard.writeText(referralCode);
    toast({
      title: 'Copied!',
      description: 'Referral code copied to clipboard',
    });
  };

  const copyReferralLink = () => {
    const link = `${window.location.origin}/signup?ref=${referralCode}`;
    navigator.clipboard.writeText(link);
    toast({
      title: 'Copied!',
      description: 'Referral link copied to clipboard',
    });
  };

  const completedReferrals = referrals.filter(r => r.status === 'completed').length;
  const pendingReferrals = referrals.filter(r => r.status === 'pending').length;

  return (
    <div className="space-y-6">
      {/* Referral Code Card */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Gift className="h-5 w-5 text-purple-600" />
            Your Referral Code
          </CardTitle>
          <CardDescription>
            Share your code and earn rewards when friends sign up
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex gap-2">
            <Input
              value={referralCode}
              readOnly
              className="font-mono text-lg"
            />
            <Button onClick={copyReferralCode} variant="outline">
              <Copy className="h-4 w-4" />
            </Button>
          </div>
          <Button onClick={copyReferralLink} className="w-full" variant="secondary">
            Copy Referral Link
          </Button>
          
          <div className="grid grid-cols-2 gap-4 pt-4">
            <div className="text-center p-4 bg-green-50 rounded-lg">
              <div className="text-3xl font-bold text-green-600">{completedReferrals}</div>
              <div className="text-sm text-gray-600">Successful Referrals</div>
            </div>
            <div className="text-center p-4 bg-blue-50 rounded-lg">
              <div className="text-3xl font-bold text-blue-600">{pendingReferrals}</div>
              <div className="text-sm text-gray-600">Pending</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Rewards Card */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Star className="h-5 w-5 text-yellow-600" />
            Your Rewards & Incentives
          </CardTitle>
          <CardDescription>
            Earn rewards through referrals and reviews
          </CardDescription>
        </CardHeader>
        <CardContent>
          {incentives.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <Gift className="h-12 w-12 mx-auto mb-3 text-gray-300" />
              <p>No rewards yet. Start referring friends to earn!</p>
            </div>
          ) : (
            <div className="space-y-3">
              {incentives.map((incentive) => (
                <div
                  key={incentive.id}
                  className="flex items-center justify-between p-4 border rounded-lg"
                >
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <CheckCircle className="h-4 w-4 text-green-600" />
                      <span className="font-medium">{incentive.description}</span>
                    </div>
                    <p className="text-sm text-gray-500 mt-1">
                      {incentive.reward_type}: {incentive.reward_value}
                    </p>
                  </div>
                  <Badge variant={incentive.status === 'active' ? 'default' : 'secondary'}>
                    {incentive.status}
                  </Badge>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* How It Works */}
      <Card>
        <CardHeader>
          <CardTitle>How to Earn Rewards</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex gap-3">
            <div className="flex-shrink-0 w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center text-purple-600 font-bold">
              1
            </div>
            <div>
              <h4 className="font-semibold">Share Your Code</h4>
              <p className="text-sm text-gray-600">
                Send your referral code or link to friends
              </p>
            </div>
          </div>
          <div className="flex gap-3">
            <div className="flex-shrink-0 w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center text-purple-600 font-bold">
              2
            </div>
            <div>
              <h4 className="font-semibold">They Sign Up</h4>
              <p className="text-sm text-gray-600">
                Your friend creates an account using your code
              </p>
            </div>
          </div>
          <div className="flex gap-3">
            <div className="flex-shrink-0 w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center text-purple-600 font-bold">
              3
            </div>
            <div>
              <h4 className="font-semibold">You Both Get Rewarded</h4>
              <p className="text-sm text-gray-600">
                Get 30 days extended trial + 20% off annual plan
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
