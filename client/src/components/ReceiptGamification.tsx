import { Trophy, TrendingUp, Award, Zap, Target, Star } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/contexts/AuthContext';

interface GamificationData {
  captureRate: number;
  currentStreak: number;
  longestStreak: number;
  totalBadges: number;
  badges: Array<{
    id: string;
    badge_type: string;
    badge_name: string;
    badge_description: string;
    earned_at: string;
  }>;
}

const badgeIcons: Record<string, any> = {
  perfect_month: Trophy,
  streak_7: TrendingUp,
  streak_30: Award,
  streak_90: Zap,
  capture_100: Target,
  organization_pro: Star
};

const badgeColors: Record<string, string> = {
  perfect_month: 'bg-yellow-500',
  streak_7: 'bg-blue-500',
  streak_30: 'bg-purple-500',
  streak_90: 'bg-red-500',
  capture_100: 'bg-green-500',
  organization_pro: 'bg-indigo-500'
};

export default function ReceiptGamification() {
  const { user } = useAuth();
  const [data, setData] = useState<GamificationData>({
    captureRate: 0,
    currentStreak: 0,
    longestStreak: 0,
    totalBadges: 0,
    badges: []
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      loadGamificationData();
    }
  }, [user]);

  const loadGamificationData = async () => {
    try {
      const [profileRes, badgesRes] = await Promise.all([
        supabase
          .from('profiles')
          .select('receipt_capture_rate, current_streak_days, longest_streak_days, total_badges_earned')
          .eq('id', user?.id)
          .single(),
        supabase
          .from('receipt_badges')
          .select('*')
          .eq('user_id', user?.id)
          .order('earned_at', { ascending: false })
      ]);

      if (profileRes.data) {
        setData({
          captureRate: profileRes.data.receipt_capture_rate || 0,
          currentStreak: profileRes.data.current_streak_days || 0,
          longestStreak: profileRes.data.longest_streak_days || 0,
          totalBadges: profileRes.data.total_badges_earned || 0,
          badges: badgesRes.data || []
        });
      }
    } catch (error) {
      console.error('Error loading gamification data:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div className="animate-pulse h-64 bg-gray-100 rounded-lg" />;
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Trophy className="h-5 w-5 text-yellow-500" />
            Receipt Tracking Progress
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Capture Rate */}
          <div>
            <div className="flex justify-between mb-2">
              <span className="text-sm font-medium">Capture Rate</span>
              <span className="text-sm text-muted-foreground">{data.captureRate.toFixed(1)}%</span>
            </div>
            <Progress value={data.captureRate} className="h-3" />
            {data.captureRate === 100 && (
              <p className="text-xs text-green-600 mt-1">Perfect capture! Keep it up!</p>
            )}
          </div>

          {/* Streaks */}
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-blue-50 rounded-lg p-4">
              <div className="flex items-center gap-2 mb-1">
                <TrendingUp className="h-4 w-4 text-blue-600" />
                <span className="text-sm font-medium">Current Streak</span>
              </div>
              <p className="text-2xl font-bold text-blue-600">{data.currentStreak} days</p>
            </div>
            <div className="bg-purple-50 rounded-lg p-4">
              <div className="flex items-center gap-2 mb-1">
                <Award className="h-4 w-4 text-purple-600" />
                <span className="text-sm font-medium">Best Streak</span>
              </div>
              <p className="text-2xl font-bold text-purple-600">{data.longestStreak} days</p>
            </div>
          </div>

          {/* Badges */}
          {data.badges.length > 0 && (
            <div>
              <h3 className="text-sm font-medium mb-3">Earned Badges</h3>
              <div className="grid grid-cols-3 gap-3">
                {data.badges.slice(0, 6).map((badge) => {
                  const Icon = badgeIcons[badge.badge_type] || Trophy;
                  const color = badgeColors[badge.badge_type] || 'bg-gray-500';
                  
                  return (
                    <div
                      key={badge.id}
                      className="flex flex-col items-center p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                    >
                      <div className={`${color} p-2 rounded-full mb-2`}>
                        <Icon className="h-5 w-5 text-white" />
                      </div>
                      <span className="text-xs font-medium text-center">{badge.badge_name}</span>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Motivational Message */}
          <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg p-4">
            <p className="text-sm text-gray-700">
              {data.captureRate >= 90
                ? "🌟 Outstanding! You're a receipt tracking champion!"
                : data.captureRate >= 70
                ? "💪 Great job! You're well on your way to perfect tracking!"
                : data.captureRate >= 50
                ? "📈 Good progress! Keep uploading those receipts!"
                : "🎯 Let's boost that capture rate! Every receipt counts!"}
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}