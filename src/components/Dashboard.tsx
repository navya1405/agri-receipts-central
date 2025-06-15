import { useState, useEffect, useCallback } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Building2, LogOut, FileText, Search, BarChart3, Users, Plus, Download, TrendingUp, Menu, X, Shield } from "lucide-react";
import { 
  Sidebar, 
  SidebarContent, 
  SidebarHeader, 
  SidebarMenu, 
  SidebarMenuButton, 
  SidebarMenuItem, 
  SidebarProvider, 
  SidebarTrigger,
  SidebarInset,
  useSidebar
} from "@/components/ui/sidebar";
import ReceiptEntry from "./ReceiptEntry";
import ReceiptSearch from "./ReceiptSearch";
import ReceiptList from "./ReceiptList";
import Analytics from "./Analytics";
import TraderAnalytics from "./TraderAnalytics";
import UserManagement from "./UserManagement";
import { useReceiptData } from '@/hooks/useReceiptData';

const INACTIVITY_TIMEOUT = 30000; // 30 seconds

const Dashboard = ({ user, onLogout }) => {
  const [activeTab, setActiveTab] = useState('overview');
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { userAccessibleReceipts } = useReceiptData(user);

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-lg">Loading user information...</div>
      </div>
    );
  }

  // Calculate real-time statistics
  const calculateStatistics = () => {
    const currentDate = new Date();
    const currentMonth = currentDate.getMonth();
    const currentYear = currentDate.getFullYear();
    const lastMonth = currentMonth === 0 ? 11 : currentMonth - 1;
    const lastMonthYear = currentMonth === 0 ? currentYear - 1 : currentYear;

    // This month's receipts
    const thisMonthReceipts = userAccessibleReceipts.filter(receipt => {
      const receiptDate = new Date(receipt.date);
      return receiptDate.getMonth() === currentMonth && receiptDate.getFullYear() === currentYear;
    });

    // Last month's receipts
    const lastMonthReceipts = userAccessibleReceipts.filter(receipt => {
      const receiptDate = new Date(receipt.date);
      return receiptDate.getMonth() === lastMonth && receiptDate.getFullYear() === lastMonthYear;
    });

    // Active traders this month (unique trader names)
    const activeTraders = new Set(
      thisMonthReceipts
        .filter(receipt => receipt.trader_name)
        .map(receipt => receipt.trader_name)
    );

    // Total value this month
    const totalValue = thisMonthReceipts.reduce((sum, receipt) => sum + (Number(receipt.value) || 0), 0);

    return {
      totalReceipts: userAccessibleReceipts.length,
      thisMonthCount: thisMonthReceipts.length,
      lastMonthCount: lastMonthReceipts.length,
      monthlyDifference: thisMonthReceipts.length - lastMonthReceipts.length,
      activeTraders: activeTraders.size,
      totalValue: totalValue
    };
  };

  const stats = calculateStatistics();

  const getRoleColor = (role) => {
    switch (role) {
      case 'DEO': return 'bg-blue-100 text-blue-800';
      case 'Supervisor': return 'bg-purple-100 text-purple-800';
      case 'JD': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getMenuItems = () => {
    // Updated role-based access control - Overview first, then other items
    switch (user.role) {
      case 'DEO':
        return [
          { id: 'overview', label: 'Overview', icon: BarChart3 },
          { id: 'entry', label: 'New Receipt', icon: Plus },
          { id: 'list', label: 'My Receipts', icon: FileText }
        ];
      case 'Supervisor':
        return [
          { id: 'overview', label: 'Overview', icon: BarChart3 },
          { id: 'entry', label: 'New Receipt', icon: Plus },
          { id: 'analytics', label: 'Committee Analytics', icon: TrendingUp },
          { id: 'trader-analytics', label: 'Trader Analysis', icon: Users },
          { id: 'list', label: 'Committee Receipts', icon: FileText }
        ];
      case 'JD':
        return [
          { id: 'overview', label: 'Overview', icon: BarChart3 },
          { id: 'analytics', label: 'District Analytics', icon: TrendingUp },
          { id: 'list', label: 'All Receipts', icon: FileText },
          { id: 'user-management', label: 'User Management', icon: Shield }
        ];
      default:
        return [
          { id: 'overview', label: 'Overview', icon: BarChart3 }
        ];
    }
  };

  const getUserCommitteeInfo = () => {
    // Mock committee data - in real app this would come from user profile
    const committeeMap = {
      'demo_deo': { name: 'Tuni AMC', fullName: 'Tuni Agricultural Market Committee' },
      'demo_supervisor': { name: 'Kakinada AMC', fullName: 'Kakinada Agricultural Market Committee' },
      'demo_jd': { name: 'East Godavari District', fullName: 'East Godavari District - All AMCs' }
    };
    
    return committeeMap[user.username] || { name: 'Tuni AMC', fullName: 'Tuni Agricultural Market Committee' };
  };

  const committeeInfo = getUserCommitteeInfo();

  // Statistics component for reuse
  const StatisticsCards = () => (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6 mb-6">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">
            {user.role === 'JD' ? 'Total Receipts (District)' : 'Total Receipts'}
          </CardTitle>
          <FileText className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{stats.totalReceipts}</div>
          <p className="text-xs text-muted-foreground">{committeeInfo.name}</p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">This Month</CardTitle>
          <Plus className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{stats.thisMonthCount}</div>
          <p className="text-xs text-muted-foreground">
            {stats.monthlyDifference >= 0 ? '+' : ''}{stats.monthlyDifference} from last month
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Active Traders</CardTitle>
          <Users className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{stats.activeTraders}</div>
          <p className="text-xs text-muted-foreground">This month</p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Total Value</CardTitle>
          <BarChart3 className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">
            ₹{stats.totalValue >= 100000 ? (stats.totalValue / 100000).toFixed(1) + 'L' : (stats.totalValue / 1000).toFixed(1) + 'K'}
          </div>
          <p className="text-xs text-muted-foreground">This month</p>
        </CardContent>
      </Card>
    </div>
  );

  const renderContent = () => {
    // Role-based access control
    const allowedTabs = getMenuItems().map(item => item.id);
    
    if (!allowedTabs.includes(activeTab)) {
      return (
        <Card>
          <CardContent className="p-6">
            <div className="text-center text-red-600">
              Access denied. You don't have permission to view this section.
            </div>
          </CardContent>
        </Card>
      );
    }

    switch (activeTab) {
      case 'entry':
        if (user.role === 'DEO' || user.role === 'Supervisor') {
          return (
            <div className="space-y-6">
              <StatisticsCards />
              <ReceiptEntry user={user} />
            </div>
          );
        }
        break;
      case 'list':
        return (
          <div className="space-y-6">
            <StatisticsCards />
            <ReceiptList user={user} />
          </div>
        );
      case 'analytics':
        if (user.role === 'Supervisor' || user.role === 'JD') {
          return (
            <div className="space-y-6">
              <StatisticsCards />
              <Analytics user={user} />
            </div>
          );
        }
        break;
      case 'trader-analytics':
        if (user.role === 'Supervisor') {
          return (
            <div className="space-y-6">
              <StatisticsCards />
              <TraderAnalytics user={user} />
            </div>
          );
        }
        break;
      case 'user-management':
        if (user.role === 'JD') {
          return (
            <div className="space-y-6">
              <StatisticsCards />
              <UserManagement user={user} />
            </div>
          );
        }
        break;
      case 'overview':
      default:
        return (
          <div className="space-y-6">
            <StatisticsCards />
            <Card>
              <CardHeader>
                <CardTitle>
                  {user.role === 'JD' 
                    ? 'East Godavari District AMC System' 
                    : `${committeeInfo.fullName}`
                  }
                </CardTitle>
                <CardDescription>
                  {user.role === 'JD' 
                    ? 'Digital receipt management system for East Godavari District - Managing all AMCs'
                    : `Digital receipt management system for ${committeeInfo.name}`
                  }
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center space-x-4">
                    <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                    <span className="text-sm">
                      {user.role === 'JD' 
                        ? 'System is operational for all AMCs in East Godavari District'
                        : `System is operational for ${committeeInfo.name}`
                      }
                    </span>
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

                  {user.role === 'Supervisor' && (
                    <div className="p-4 bg-purple-50 rounded-lg">
                      <h4 className="font-medium text-purple-900 mb-2">Committee Supervisor Tools</h4>
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
                          onClick={() => setActiveTab('analytics')}
                          className="w-full justify-start"
                        >
                          <TrendingUp className="mr-2 h-4 w-4" />
                          Committee Analytics
                        </Button>
                        <Button 
                          variant="outline" 
                          size="sm" 
                          onClick={() => setActiveTab('trader-analytics')}
                          className="w-full justify-start"
                        >
                          <Users className="mr-2 h-4 w-4" />
                          Trader Performance
                        </Button>
                      </div>
                    </div>
                  )}

                  {user.role === 'JD' && (
                    <div className="p-4 bg-red-50 rounded-lg">
                      <h4 className="font-medium text-red-900 mb-2">District Director Tools</h4>
                      <div className="space-y-2">
                        <Button 
                          variant="outline" 
                          size="sm" 
                          onClick={() => setActiveTab('analytics')}
                          className="w-full justify-start"
                        >
                          <TrendingUp className="mr-2 h-4 w-4" />
                          District Analytics
                        </Button>
                        <Button 
                          variant="outline" 
                          size="sm" 
                          onClick={() => setActiveTab('user-management')}
                          className="w-full justify-start"
                        >
                          <Shield className="mr-2 h-4 w-4" />
                          User Management
                        </Button>
                      </div>
                    </div>
                  )}

                  {user.role === 'JD' && (
                    <div className="p-4 bg-gray-50 rounded-lg">
                      <h4 className="font-medium text-gray-900 mb-2">AMCs in East Godavari District</h4>
                      <div className="grid grid-cols-2 gap-2 text-sm text-gray-600">
                        <div>• Tuni AMC</div>
                        <div>• Kakinada AMC</div>
                        <div>• Rajahmundry AMC</div>
                        <div>• Amalapuram AMC</div>
                        <div>• Peddapuram AMC</div>
                        <div>• Ramachandrapuram AMC</div>
                        <div>• Mandapeta AMC</div>
                        <div>• Korumilli AMC</div>
                        <div>• Sankhavaram AMC</div>
                        <div>• Yelamanchili AMC</div>
                      </div>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        );
    }
  };

  // Auto-collapsing JD Sidebar Component
  const AutoCollapsibleJDSidebar = () => {
    const { setOpen } = useSidebar();
    const [inactivityTimer, setInactivityTimer] = useState(null);

    const resetInactivityTimer = useCallback(() => {
      if (inactivityTimer) {
        clearTimeout(inactivityTimer);
      }
      
      const timer = setTimeout(() => {
        setOpen(false);
      }, INACTIVITY_TIMEOUT);
      
      setInactivityTimer(timer);
    }, [inactivityTimer, setOpen]);

    useEffect(() => {
      // Start the inactivity timer when component mounts
      resetInactivityTimer();

      // Add event listeners for user activity
      const events = ['mousedown', 'mousemove', 'keypress', 'scroll', 'touchstart'];
      
      events.forEach(event => {
        document.addEventListener(event, resetInactivityTimer, true);
      });

      // Cleanup on unmount
      return () => {
        if (inactivityTimer) {
          clearTimeout(inactivityTimer);
        }
        events.forEach(event => {
          document.removeEventListener(event, resetInactivityTimer, true);
        });
      };
    }, [resetInactivityTimer, inactivityTimer]);

    return (
      <Sidebar>
        <SidebarHeader className="p-4">
          <div className="flex items-center space-x-3">
            <Building2 className="h-6 w-6 text-blue-600" />
            <div>
              <h2 className="text-lg font-bold text-gray-900">East Godavari District</h2>
              <p className="text-xs text-gray-600">AMC Management System</p>
            </div>
          </div>
        </SidebarHeader>
        <SidebarContent>
          <SidebarMenu>
            {getMenuItems().map((item) => (
              <SidebarMenuItem key={item.id}>
                <SidebarMenuButton 
                  onClick={() => {
                    setActiveTab(item.id);
                    resetInactivityTimer();
                  }}
                  isActive={activeTab === item.id}
                  className="w-full justify-start"
                >
                  <item.icon className="mr-3 h-4 w-4" />
                  <span>{item.label}</span>
                </SidebarMenuButton>
              </SidebarMenuItem>
            ))}
          </SidebarMenu>
        </SidebarContent>
      </Sidebar>
    );
  };

  // If user is JD, use the collapsible sidebar layout with auto-collapse
  if (user.role === 'JD') {
    return (
      <SidebarProvider>
        <div className="min-h-screen flex w-full bg-gray-50">
          <AutoCollapsibleJDSidebar />
          <SidebarInset className="flex-1">
            {/* Header */}
            <header className="bg-white shadow-sm border-b sticky top-0 z-10">
              <div className="flex justify-between items-center p-4">
                <div className="flex items-center space-x-3">
                  <SidebarTrigger />
                  <div>
                    <h1 className="text-xl font-bold text-gray-900">
                      East Godavari District AMC System
                    </h1>
                    <p className="text-sm text-gray-600">
                      Agricultural Market Committee Management
                    </p>
                  </div>
                </div>
                
                <div className="flex items-center space-x-4">
                  <div className="text-right">
                    <p className="text-sm font-medium text-gray-900">{user.name || user.email}</p>
                    <div className="flex items-center space-x-2">
                      <Badge className={`text-xs ${getRoleColor(user.role)}`}>{user.role}</Badge>
                      <span className="text-xs text-gray-500">{committeeInfo.name}</span>
                    </div>
                  </div>
                  <Button variant="outline" size="sm" onClick={onLogout}>
                    <LogOut className="h-4 w-4 mr-2" />
                    Logout
                  </Button>
                </div>
              </div>
            </header>

            {/* Main Content */}
            <main className="p-4 sm:p-8">
              {renderContent()}
            </main>
          </SidebarInset>
        </div>
      </SidebarProvider>
    );
  }

  // For DEO and Supervisor roles, use the existing layout
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center space-x-3">
              <Button
                variant="ghost"
                size="sm"
                className="lg:hidden"
                onClick={() => setSidebarOpen(!sidebarOpen)}
              >
                {sidebarOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
              </Button>
              <Building2 className="h-6 w-6 sm:h-8 sm:w-8 text-blue-600" />
              <div>
                <h1 className="text-lg sm:text-xl font-bold text-gray-900">Kakinada AMC System</h1>
                <p className="text-xs sm:text-sm text-gray-600 hidden sm:block">
                  Agricultural Market Committee Receipt Management
                </p>
              </div>
            </div>
            
            <div className="flex items-center space-x-2 sm:space-x-4">
              <div className="text-right">
                <p className="text-xs sm:text-sm font-medium text-gray-900 truncate max-w-32 sm:max-w-none">{user.name || user.email}</p>
                <div className="flex items-center space-x-1 sm:space-x-2">
                  <Badge className={`text-xs ${getRoleColor(user.role)}`}>{user.role}</Badge>
                  <span className="text-xs text-gray-500 hidden sm:inline">{committeeInfo.name}</span>
                </div>
              </div>
              <Button variant="outline" size="sm" onClick={onLogout}>
                <LogOut className="h-3 w-3 sm:h-4 sm:w-4 sm:mr-2" />
                <span className="hidden sm:inline">Logout</span>
              </Button>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-8">
        <div className="flex flex-col lg:flex-row gap-4 lg:gap-8">
          {/* Mobile Overlay */}
          {sidebarOpen && (
            <div 
              className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
              onClick={() => setSidebarOpen(false)}
            />
          )}

          {/* Sidebar Navigation */}
          <div className={`
            fixed lg:static inset-y-0 left-0 z-50 lg:z-auto
            w-64 lg:w-64 transform transition-transform duration-300 ease-in-out
            ${sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
            lg:block
          `}>
            <Card className="h-full lg:h-auto">
              <CardHeader className="lg:block">
                <CardTitle className="text-lg flex items-center justify-between">
                  Navigation
                  <Button
                    variant="ghost"
                    size="sm"
                    className="lg:hidden"
                    onClick={() => setSidebarOpen(false)}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </CardTitle>
              </CardHeader>
              <CardContent className="p-0">
                <nav className="space-y-1">
                  {getMenuItems().map((item) => (
                    <button
                      key={item.id}
                      onClick={() => {
                        setActiveTab(item.id);
                        setSidebarOpen(false);
                      }}
                      className={`w-full flex items-center px-4 py-3 text-sm font-medium rounded-none hover:bg-gray-50 transition-colors ${
                        activeTab === item.id 
                          ? 'bg-blue-50 text-blue-700 border-r-2 border-blue-700' 
                          : 'text-gray-700'
                      }`}
                    >
                      <item.icon className="mr-3 h-4 w-4 flex-shrink-0" />
                      <span className="truncate">{item.label}</span>
                    </button>
                  ))}
                </nav>
              </CardContent>
            </Card>
          </div>

          {/* Main Content */}
          <div className="flex-1 min-w-0">
            {renderContent()}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
