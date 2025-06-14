
import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Building2, Search, FileText, Users, Shield } from "lucide-react";
import LoginForm from "@/components/LoginForm";
import Dashboard from "@/components/Dashboard";
import { useToast } from "@/hooks/use-toast";

const Index = () => {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [currentUser, setCurrentUser] = useState(null);
  const { toast } = useToast();

  const handleLogin = (userData) => {
    setCurrentUser(userData);
    setIsLoggedIn(true);
    toast({
      title: "Login Successful",
      description: `Welcome back, ${userData.name}!`,
    });
  };

  const handleLogout = () => {
    setCurrentUser(null);
    setIsLoggedIn(false);
    toast({
      title: "Logged Out",
      description: "You have been successfully logged out.",
    });
  };

  if (!isLoggedIn) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-green-50">
        {/* Header */}
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

        {/* Hero Section */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
              Digital Receipt Management
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Secure, efficient, and transparent management of agricultural market committee trade receipts with role-based access and real-time verification.
            </p>
          </div>

          {/* Features Grid */}
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
            <Card className="text-center hover:shadow-lg transition-shadow">
              <CardHeader>
                <FileText className="h-12 w-12 text-blue-600 mx-auto mb-2" />
                <CardTitle className="text-lg">Receipt Entry</CardTitle>
                <CardDescription>
                  Digital entry and validation of trade receipts
                </CardDescription>
              </CardHeader>
            </Card>

            <Card className="text-center hover:shadow-lg transition-shadow">
              <CardHeader>
                <Search className="h-12 w-12 text-green-600 mx-auto mb-2" />
                <CardTitle className="text-lg">Quick Verification</CardTitle>
                <CardDescription>
                  Instant receipt verification at checkposts
                </CardDescription>
              </CardHeader>
            </Card>

            <Card className="text-center hover:shadow-lg transition-shadow">
              <CardHeader>
                <Users className="h-12 w-12 text-purple-600 mx-auto mb-2" />
                <CardTitle className="text-lg">Role-Based Access</CardTitle>
                <CardDescription>
                  Secure access control for different user roles
                </CardDescription>
              </CardHeader>
            </Card>

            <Card className="text-center hover:shadow-lg transition-shadow">
              <CardHeader>
                <Shield className="h-12 w-12 text-red-600 mx-auto mb-2" />
                <CardTitle className="text-lg">Audit Trail</CardTitle>
                <CardDescription>
                  Complete tracking of all system activities
                </CardDescription>
              </CardHeader>
            </Card>
          </div>

          {/* Login Section */}
          <div className="max-w-md mx-auto">
            <LoginForm onLogin={handleLogin} />
          </div>
        </div>
      </div>
    );
  }

  return <Dashboard user={currentUser} onLogout={handleLogout} />;
};

export default Index;
