
import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Building2, LogOut, FileText, Search, BarChart3, Users, Plus, Download } from "lucide-react";
import ReceiptEntry from "./ReceiptEntry";
import ReceiptSearch from "./ReceiptSearch";
import ReceiptList from "./ReceiptList";

const Dashboard = ({ user, onLogout }) => {
  const [activeTab, setActiveTab] = useState('overview');

  const getRoleColor = (role) => {
    switch (role) {
      case 'DEO': return 'bg-blue-100 text-blue-800';
      case 'Officer': return 'bg-green-100 text-green-800';
      case 'Supervisor': return 'bg-purple-100 text-purple-800';
      case 'JD': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getMenuItems = () => {
    const commonItems = [
      { id: 'overview', label: 'Overview', icon: BarChart3 }
    ];

    switch (user.role) {
      case 'DEO':
        return [
          ...commonItems,
          { id: 'entry', label: 'New Receipt', icon: Plus },
          { id: 'list', label: 'My Receipts', icon: FileText }
        ];
      case 'Officer':
        return [
          ...commonItems,
          { id: 'search', label: 'Verify Receipt', icon: Search }
        ];
      case 'Supervisor':
        return [
          ...commonItems,
          { id: 'list', label: 'Committee Receipts', icon: FileText },
          { id: 'export', label: 'Export Data', icon: Download }
        ];
      case 'JD':
        return [
          ...commonItems,
          { id: 'list', label: 'All Receipts', icon: FileText },
          { id: 'users', label: 'Manage Users', icon: Users },
          { id: 'export', label: 'Export Data', icon: Download }
        ];
      default:
        return commonItems;
    }
  };

  const renderContent = () => {
    switch (activeTab) {
      case 'entry':
        return <ReceiptEntry user={user} />;
      case 'search':
        return <ReceiptSearch user={user} />;
      case 'list':
        return <ReceiptList user={user} />;
      case 'overview':
      default:
        return (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Total Receipts</CardTitle>
                  <FileText className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">1,234</div>
                  <p className="text-xs text-muted-foreground">+20.1% from last month</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">This Month</CardTitle>
                  <Plus className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">89</div>
                  <p className="text-xs text-muted-foreground">+15.2% from last month</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Verified Today</CardTitle>
                  <Search className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">45</div>
                  <p className="text-xs text-muted-foreground">+8.3% from yesterday</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Total Value</CardTitle>
                  <BarChart3 className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">₹12.4L</div>
                  <p className="text-xs text-muted-foreground">+12.5% from last month</p>
                </CardContent>
              </Card>
            </div>

            <Card>
              <CardHeader>
                <CardTitle>Welcome to AMC Receipt System</CardTitle>
                <CardDescription>
                  Digital management of agricultural market committee trade receipts
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center space-x-4">
                    <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                    <span className="text-sm">System is operational and running smoothly</span>
                  </div>
                  
                  {user.role === 'DEO' && (
                    <div className="p-4 bg-blue-50 rounded-lg">
                      <h4 className="font-medium text-blue-900 mb-2">Quick Actions</h4>
                      <div className="space-y-2">
                        <Button 
                          variant="outline" 
                          size="sm" 
                          onClick={() => setActiveTab('entry')}
                          className="w-full justify-start"
                        >
                          <Plus className="mr-2 h-4 w-4" />
                          Add New Receipt
                        </Button>
                        <Button 
                          variant="outline" 
                          size="sm" 
                          onClick={() => setActiveTab('list')}
                          className="w-full justify-start"
                        >
                          <FileText className="mr-2 h-4 w-4" />
                          View My Receipts
                        </Button>
                      </div>
                    </div>
                  )}

                  {user.role === 'Officer' && (
                    <div className="p-4 bg-green-50 rounded-lg">
                      <h4 className="font-medium text-green-900 mb-2">Verification Tools</h4>
                      <Button 
                        variant="outline" 
                        size="sm" 
                        onClick={() => setActiveTab('search')}
                        className="w-full justify-start"
                      >
                        <Search className="mr-2 h-4 w-4" />
                        Verify Receipt
                      </Button>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        );
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center space-x-3">
              <Building2 className="h-8 w-8 text-blue-600" />
              <div>
                <h1 className="text-xl font-bold text-gray-900">AMC Receipt System</h1>
                <p className="text-sm text-gray-600">Agricultural Market Committee</p>
              </div>
            </div>
            
            <div className="flex items-center space-x-4">
              <div className="text-right">
                <p className="text-sm font-medium text-gray-900">{user.name}</p>
                <div className="flex items-center space-x-2">
                  <Badge className={getRoleColor(user.role)}>{user.role}</Badge>
                  {user.committee && (
                    <span className="text-xs text-gray-500">{user.committee}</span>
                  )}
                </div>
              </div>
              <Button variant="outline" size="sm" onClick={onLogout}>
                <LogOut className="h-4 w-4 mr-2" />
                Logout
              </Button>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex flex-col lg:flex-row gap-8">
          {/* Sidebar Navigation */}
          <div className="lg:w-64">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Navigation</CardTitle>
              </CardHeader>
              <CardContent className="p-0">
                <nav className="space-y-1">
                  {getMenuItems().map((item) => (
                    <button
                      key={item.id}
                      onClick={() => setActiveTab(item.id)}
                      className={`w-full flex items-center px-4 py-3 text-sm font-medium rounded-none hover:bg-gray-50 ${
                        activeTab === item.id 
                          ? 'bg-blue-50 text-blue-700 border-r-2 border-blue-700' 
                          : 'text-gray-700'
                      }`}
                    >
                      <item.icon className="mr-3 h-4 w-4" />
                      {item.label}
                    </button>
                  ))}
                </nav>
              </CardContent>
            </Card>
          </div>

          {/* Main Content */}
          <div className="flex-1">
            {renderContent()}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
