import { useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Building2, Search, FileText, Users, Shield } from "lucide-react";
import Dashboard from "@/components/Dashboard";
import { useToast } from "@/hooks/use-toast";
import { supabase } from '@/integrations/supabase/client';
import type { Session } from '@supabase/supabase-js';
import AuthForm from "@/components/AuthForm";

const Index = () => {
  const [session, setSession] = useState<Session | null>(null);
  const [currentUser, setCurrentUser] = useState<any | null>(null);
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchSessionAndProfile = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      setSession(session);
      if (session?.user) {
        await fetchUserProfile(session.user);
      }
      setLoading(false);
    };

    fetchSessionAndProfile();

    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (_event, session) => {
      setSession(session);
      if (session?.user) {
        await fetchUserProfile(session.user);
      } else {
        setCurrentUser(null);
      }
    });

    return () => {
      subscription?.unsubscribe();
    };
  }, []);

  const fetchUserProfile = async (user) => {
    const { data, error } = await supabase
      .from('profiles')
      .select(`
        *,
        committee:committees(name),
        roles:user_roles(role)
      `)
      .eq('id', user.id)
      .single();

    if (error && error.code !== 'PGRST116') { // Ignore no rows found error
      toast({ title: "Error fetching profile", description: error.message, variant: "destructive" });
      setCurrentUser(user);
    } else if (data) {
      const userProfile = {
        ...user,
        ...data,
        name: data.full_name,
        role: data.roles && data.roles.length > 0 ? data.roles[0].role : 'DEO',
        committee: data.committee?.name || null
      };
      setCurrentUser(userProfile);
    } else {
       // Profile might not be created yet, use basic info
       setCurrentUser({
         ...user,
         name: user.email,
         role: 'DEO', // Default role
         committee: null
       });
    }
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    setCurrentUser(null);
    setSession(null);
    toast({
      title: "Logged Out",
      description: "You have been successfully logged out.",
    });
  };
  
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-lg">Loading...</div>
      </div>
    );
  }

  if (!session) {
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
            </div>
            <div className="flex justify-center">
              <AuthForm />
            </div>
          </div>
        </div>
      </div>
    );
  }

  return <Dashboard user={currentUser} onLogout={handleLogout} />;
};

export default Index;
