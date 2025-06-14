
import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { LogIn, Eye, EyeOff } from "lucide-react";

const LoginForm = ({ onLogin }) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  // Demo users for different roles
  const demoUsers = {
    'deo': { name: 'Data Entry Operator', role: 'DEO', committee: 'Mumbai AMC' },
    'officer': { name: 'Checkpost Officer', role: 'Officer', committee: 'Mumbai AMC' },
    'supervisor': { name: 'Supervisor', role: 'Supervisor', committee: 'Mumbai AMC' },
    'jd': { name: 'Joint Director', role: 'JD', committee: null }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setIsLoading(true);
    
    // Simulate API call
    setTimeout(() => {
      const user = demoUsers[username.toLowerCase()];
      if (user && password === 'demo123') {
        onLogin({
          ...user,
          username: username,
          id: Math.random().toString(36).substr(2, 9)
        });
      } else {
        alert('Invalid credentials. Use demo usernames: deo, officer, supervisor, jd with password: demo123');
      }
      setIsLoading(false);
    }, 1000);
  };

  return (
    <Card className="w-full max-w-md">
      <CardHeader className="text-center">
        <div className="mx-auto mb-2 flex h-12 w-12 items-center justify-center rounded-full bg-blue-100">
          <LogIn className="h-6 w-6 text-blue-600" />
        </div>
        <CardTitle className="text-2xl">Sign In</CardTitle>
        <CardDescription>
          Enter your credentials to access the AMC system
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="username">Username</Label>
            <Input
              id="username"
              type="text"
              placeholder="Enter your username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="password">Password</Label>
            <div className="relative">
              <Input
                id="password"
                type={showPassword ? "text" : "password"}
                placeholder="Enter your password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                onClick={() => setShowPassword(!showPassword)}
              >
                {showPassword ? (
                  <EyeOff className="h-4 w-4 text-gray-400" />
                ) : (
                  <Eye className="h-4 w-4 text-gray-400" />
                )}
              </Button>
            </div>
          </div>

          <Button 
            type="submit" 
            className="w-full bg-blue-600 hover:bg-blue-700"
            disabled={isLoading}
          >
            {isLoading ? "Signing In..." : "Sign In"}
          </Button>
        </form>

        <div className="mt-6 p-4 bg-gray-50 rounded-lg">
          <p className="text-xs text-gray-600 font-medium mb-2">Demo Credentials:</p>
          <div className="text-xs text-gray-500 space-y-1">
            <div>• DEO: username "deo", password "demo123"</div>
            <div>• Officer: username "officer", password "demo123"</div>
            <div>• Supervisor: username "supervisor", password "demo123"</div>
            <div>• Joint Director: username "jd", password "demo123"</div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default LoginForm;
