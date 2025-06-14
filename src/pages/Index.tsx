
import { useState } from 'react';
import { Card, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Building2, Search, FileText, Users, Shield } from "lucide-react";
import Dashboard from "@/components/Dashboard";
import { useToast } from "@/hooks/use-toast";
import { supabase } from '@/integrations/supabase/client';
import LoginForm from "@/components/LoginForm";

const Index = () => {
  const [currentUser, setCurrentUser] = useState<any | null>(null);
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);

  const handleLogin = async (username: string, password: string) => {
    setLoading(true);
    console.log('Login attempt for username:', username);
    
    try {
      // First, let's check if there are any users in the profiles table at all
      console.log('Checking all profiles in the database...');
      const { data: allProfiles, error: allProfilesError } = await supabase
        .from('profiles')
        .select('*');
      
      console.log('All profiles in database:', allProfiles);
      console.log('All profiles error:', allProfilesError);

      // Query the profiles table directly using username
      console.log('Querying profiles table for username:', username);
      const { data: profileData, error: profileError } = await supabase
        .from('profiles')
        .select('*')
        .eq('username', username)
        .maybeSingle();

      console.log('Profile query result:', { profileData, profileError });

      if (profileError) {
        console.log('Database error:', profileError);
        toast({ 
          title: "Login Failed", 
          description: "Database error occurred", 
          variant: "destructive" 
        });
        setLoading(false);
        return;
      }

      if (!profileData) {
        console.log('Profile not found for username:', username);
        toast({ 
          title: "Login Failed", 
          description: "Invalid username or user not found", 
          variant: "destructive" 
        });
        setLoading(false);
        return;
      }

      console.log('Profile found:', profileData);

      // Get user role
      console.log('Querying user roles for user_id:', profileData.id);
      const { data: roleData, error: roleError } = await supabase
        .from('user_roles')
        .select('role')
        .eq('user_id', profileData.id)
        .maybeSingle();

      console.log('Role query result:', { roleData, roleError });

      // Get committee info if profile has committee_id
      let committeeData = null;
      if (profileData.committee_id) {
        console.log('Querying committee for committee_id:', profileData.committee_id);
        const { data: committee } = await supabase
          .from('committees')
          .select('name')
          .eq('id', profileData.committee_id)
          .maybeSingle();
        
        if (committee) {
          committeeData = committee;
        }
        console.log('Committee query result:', committee);
      }

      const userProfile = {
        id: profileData.id,
        email: profileData.email,
        username: profileData.username,
        name: profileData.full_name || profileData.username,
        role: roleData?.role || 'DEO',
        committee: committeeData?.name || null
      };
      
      console.log('Final user profile:', userProfile);
      
      setCurrentUser(userProfile);
      toast({
        title: "Login Successful",
        description: `Welcome back, ${userProfile.name}!`,
      });
    } catch (error) {
      console.error('Login error:', error);
      toast({ 
        title: "Login Failed", 
        description: "An error occurred during login", 
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
