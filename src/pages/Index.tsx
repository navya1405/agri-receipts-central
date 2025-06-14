
import { useState } from 'react';
import { Card, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Building2, Search, FileText, Users, Shield } from "lucide-react";
import Dashboard from "@/components/Dashboard";
import { useToast } from "@/hooks/use-toast";
import LoginForm from "@/components/LoginForm";

const Index = () => {
  const [currentUser, setCurrentUser] = useState<any | null>(null);
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);

  const handleLogin = async (username: string, password: string) => {
    setLoading(true);
    console.log('Demo login attempt for username:', username);
    
    // Simple demo user mapping
    const demoUsers = {
      'demo_deo': {
        id: '1',
        email: 'demo_deo@amc.gov.in',
        username: 'demo_deo',
        name: 'Demo DEO User',
        role: 'DEO',
        committee: 'Tuni Agricultural Market Committee'
      },
      'demo_officer': {
        id: '2',
        email: 'demo_officer@amc.gov.in',
        username: 'demo_officer',
        name: 'Demo Officer User',
        role: 'Officer',
        committee: 'Tuni Agricultural Market Committee'
      },
      'demo_supervisor': {
        id: '3',
        email: 'demo_supervisor@amc.gov.in',
        username: 'demo_supervisor',
        name: 'Demo Supervisor User',
        role: 'Supervisor',
        committee: 'Tuni Agricultural Market Committee'
      },
      'demo_jd': {
        id: '4',
        email: 'demo_jd@amc.gov.in',
        username: 'demo_jd',
        name: 'Demo Joint Director',
        role: 'JD',
        committee: null
      }
    };

    // Check if username exists in demo users
    const user = demoUsers[username.toLowerCase()];
    
    if (user) {
      console.log('Demo user found:', user);
      setCurrentUser(user);
      toast({
        title: "Login Successful",
        description: `Welcome back, ${user.name}!`,
      });
    } else {
      console.log('Demo user not found for username:', username);
      toast({ 
        title: "Login Failed", 
        description: "Invalid username. Please use demo_deo, demo_officer, demo_supervisor, or demo_jd", 
        variant: "destructive" 
      });
    }
    
    setLoading(false);
  };

  const handleLogout = () => {
    setCurrentUser(null);
    toast({
      title: "Logged Out",
      description: "You have been successfully logged out.",
    });
  };

  if (!currentUser) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-green-50">
        <header className="bg-white shadow-sm border-b">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center py-4">
              <div className="flex items-center space-x-3">
                <Building2 className="h-8 w-8 text-blue-600" />
                <div>
                  <h1 className="text-2xl font-bold text-gray-900">AMC Receipt System</h1>
                  <p className="text-sm text-gray-600">Agricultural Market Committee Management</p>
                </div>
              </div>
            </div>
          </div>
        </header>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-4xl font-bold text-gray-900 mb-4">
                Digital Receipt Management, Simplified.
              </h2>
              <p className="text-xl text-gray-600 max-w-3xl mx-auto mb-6">
                Secure, efficient, and transparent management of agricultural market committee trade receipts.
              </p>
              <div className="space-y-4">
                  <div className="flex items-start gap-4"><FileText className="h-6 w-6 text-blue-600 mt-1 shrink-0" /><p><strong>Receipt Entry & Validation:</strong> Digital entry of trade receipts with instant validation.</p></div>
                  <div className="flex items-start gap-4"><Search className="h-6 w-6 text-green-600 mt-1 shrink-0" /><p><strong>Quick Verification:</strong> Instant receipt verification at checkposts to ensure authenticity.</p></div>
                  <div className="flex items-start gap-4"><Users className="h-6 w-6 text-purple-600 mt-1 shrink-0" /><p><strong>Role-Based Access:</strong> Secure access for DEOs, Supervisors, and Directors.</p></div>
                  <div className="flex items-start gap-4"><Shield className="h-6 w-6 text-red-600 mt-1 shrink-0" /><p><strong>Audit & Reporting:</strong> Complete tracking of all system activities for transparency.</p></div>
              </div>

              {/* Demo Credentials Info */}
              <div className="mt-8 p-4 bg-blue-50 rounded-lg border border-blue-200">
                <h3 className="font-semibold text-blue-900 mb-2">Demo Login Credentials</h3>
                <div className="text-sm text-blue-800 space-y-1">
                  <p><strong>DEO:</strong> demo_deo</p>
                  <p><strong>Officer:</strong> demo_officer</p>
                  <p><strong>Supervisor:</strong> demo_supervisor</p>
                  <p><strong>Joint Director:</strong> demo_jd</p>
                </div>
                <p className="text-xs text-blue-600 mt-2">Use these usernames to login (password not required for demo).</p>
              </div>
            </div>
            <div className="flex justify-center">
              <LoginForm onLogin={handleLogin} loading={loading} />
            </div>
          </div>
        </div>
      </div>
    );
  }

  return <Dashboard user={currentUser} onLogout={handleLogout} />;
};

export default Index;
