import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Target, TrendingUp, Calendar } from 'lucide-react';

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-secondary">
      <div className="container mx-auto px-4 py-16">
        {/* Hero Section */}
        <div className="text-center mb-16">
          <div className="flex items-center justify-center gap-4 mb-4">
            <img src="/m-letter.jpg" alt="Momentum Logo" className="w-16 h-16" />
            <h1 className="text-5xl font-bold">Momentum</h1>
          </div>
          <p className="text-xl text-muted-foreground mb-8">
            Build consistent habits, track your daily progress, and manage your career journey
          </p>
          <Link to="/dashboard">
            <Button size="lg">Get Started</Button>
          </Link>
        </div>

        {/* Features Section */}
        <div className="grid md:grid-cols-3 gap-6 max-w-5xl mx-auto">
          <Card>
            <CardHeader>
              <Target className="w-10 h-10 mb-2 text-primary" />
              <CardTitle>Set Goals</CardTitle>
              <CardDescription>
                Define your habits and set achievable goals
              </CardDescription>
            </CardHeader>
          </Card>

          <Card>
            <CardHeader>
              <Calendar className="w-10 h-10 mb-2 text-primary" />
              <CardTitle>Track Daily</CardTitle>
              <CardDescription>
                Log your progress every day and build streaks
              </CardDescription>
            </CardHeader>
          </Card>

          <Card>
            <CardHeader>
              <TrendingUp className="w-10 h-10 mb-2 text-primary" />
              <CardTitle>See Progress</CardTitle>
              <CardDescription>
                Visualize your improvement over time
              </CardDescription>
            </CardHeader>
          </Card>
        </div>
      </div>
    </div>
  );
}
