import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { Users, UserPlus, Edit, Trash2, Shield, Building2, Key, Eye, EyeOff } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';

const UserManagement = ({ user }: { user: any }) => {
  const [users, setUsers] = useState([
    { 
      id: '1', 
      name: 'Demo DEO User', 
      email: 'demo_deo@kakinada.gov.in', 
      role: 'DEO', 
      committee: 'Tuni AMC',
      fullCommittee: 'Tuni Agricultural Market Committee'
    },
    { 
      id: '2', 
      name: 'Demo Supervisor User', 
      email: 'demo_supervisor@kakinada.gov.in', 
      role: 'Supervisor', 
      committee: 'Kakinada AMC',
      fullCommittee: 'Kakinada Agricultural Market Committee'
    },
    { 
      id: '3', 
      name: 'Demo Joint Director', 
      email: 'demo_jd@kakinada.gov.in', 
      role: 'JD', 
      committee: 'District Level',
      fullCommittee: 'East Godavari District Office'
    },
    { 
      id: '4', 
      name: 'Rajahmundry DEO', 
      email: 'deo_rajahmundry@kakinada.gov.in', 
      role: 'DEO', 
      committee: 'Rajahmundry AMC',
      fullCommittee: 'Rajahmundry Agricultural Market Committee'
    },
    { 
      id: '5', 
      name: 'Amalapuram Supervisor', 
      email: 'supervisor_amalapuram@kakinada.gov.in', 
      role: 'Supervisor', 
      committee: 'Amalapuram AMC',
      fullCommittee: 'Amalapuram Agricultural Market Committee'
    }
  ]);

  const [newUser, setNewUser] = useState({ 
    name: '', 
    email: '', 
    role: 'DEO', 
    committee: 'Tuni AMC',
    fullCommittee: 'Tuni Agricultural Market Committee'
  });
  const [editingUser, setEditingUser] = useState<any>(null);
  const [passwordChangeUser, setPasswordChangeUser] = useState<any>(null);
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isChangingPassword, setIsChangingPassword] = useState(false);
  const { toast } = useToast();

  const committees = [
    { code: 'Tuni AMC', name: 'Tuni Agricultural Market Committee' },
    { code: 'Kakinada AMC', name: 'Kakinada Agricultural Market Committee' },
    { code: 'Rajahmundry AMC', name: 'Rajahmundry Agricultural Market Committee' },
    { code: 'Amalapuram AMC', name: 'Amalapuram Agricultural Market Committee' },
    { code: 'Peddapuram AMC', name: 'Peddapuram Agricultural Market Committee' },
    { code: 'Ramachandrapuram AMC', name: 'Ramachandrapuram Agricultural Market Committee' },
    { code: 'Mandapeta AMC', name: 'Mandapeta Agricultural Market Committee' },
    { code: 'Korumilli AMC', name: 'Korumilli Agricultural Market Committee' },
    { code: 'Sankhavaram AMC', name: 'Sankhavaram Agricultural Market Committee' },
    { code: 'Yelamanchili AMC', name: 'Yelamanchili Agricultural Market Committee' },
    { code: 'District Level', name: 'East Godavari District Office' }
  ];

  const handleChangePassword = async () => {
    if (!passwordChangeUser || !newPassword || !confirmPassword) {
      toast({
        title: "Error",
        description: "Please fill in all password fields",
        variant: "destructive",
      });
      return;
    }

    if (newPassword !== confirmPassword) {
      toast({
        title: "Error",
        description: "Passwords do not match",
        variant: "destructive",
      });
      return;
    }

    if (newPassword.length < 6) {
      toast({
        title: "Error",
        description: "Password must be at least 6 characters long",
        variant: "destructive",
      });
      return;
    }

    setIsChangingPassword(true);

    try {
      // In a real implementation, this would call a Supabase admin function
      // For demo purposes, we'll simulate the password change
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      toast({
        title: "Password Changed",
        description: `Password for ${passwordChangeUser.name} has been updated successfully`,
      });

      setPasswordChangeUser(null);
      setNewPassword('');
      setConfirmPassword('');
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to change password. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsChangingPassword(false);
    }
  };

  const handleAddUser = () => {
    if (!newUser.name || !newUser.email) {
      toast({
        title: "Error",
        description: "Please fill in all required fields",
        variant: "destructive",
      });
      return;
    }

    const selectedCommittee = committees.find(c => c.code === newUser.committee);
    const user = {
      id: Date.now().toString(),
      ...newUser,
      fullCommittee: selectedCommittee?.name || newUser.committee
    };

    setUsers([...users, user]);
    setNewUser({ 
      name: '', 
      email: '', 
      role: 'DEO', 
      committee: 'Tuni AMC',
      fullCommittee: 'Tuni Agricultural Market Committee'
    });
    
    toast({
      title: "User Added",
      description: `${newUser.name} has been added successfully to ${selectedCommittee?.name}`,
    });
  };

  const handleEditUser = (userId: string) => {
    const userToEdit = users.find(u => u.id === userId);
    if (userToEdit) {
      setEditingUser(userToEdit);
    }
  };

  const handleUpdateUser = () => {
    if (!editingUser) return;

    const selectedCommittee = committees.find(c => c.code === editingUser.committee);
    const updatedUser = {
      ...editingUser,
      fullCommittee: selectedCommittee?.name || editingUser.committee
    };

    setUsers(users.map(u => u.id === editingUser.id ? updatedUser : u));
    setEditingUser(null);
    
    toast({
      title: "User Updated",
      description: `${editingUser.name} has been updated successfully`,
    });
  };

  const handleDeleteUser = (userId: string) => {
    const userToDelete = users.find(u => u.id === userId);
    if (!userToDelete) return;

    setUsers(users.filter(u => u.id !== userId));
    
    toast({
      title: "User Deleted",
      description: `${userToDelete.name} has been removed`,
      variant: "destructive",
    });
  };

  const getRoleColor = (role: string) => {
    switch (role) {
      case 'DEO': return 'bg-blue-100 text-blue-800';
      case 'Supervisor': return 'bg-purple-100 text-purple-800';
      case 'JD': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-900 mb-2">User Management</h2>
        <p className="text-gray-600">Manage system users and their roles across East Godavari District AMCs</p>
      </div>

      {/* Add New User */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <UserPlus className="h-5 w-5" />
            Add New User
          </CardTitle>
          <CardDescription>Create new user accounts for the Kakinada District AMC system</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
            <Input
              placeholder="Full Name"
              value={newUser.name}
              onChange={(e) => setNewUser({ ...newUser, name: e.target.value })}
            />
            <Input
              placeholder="Email Address"
              type="email"
              value={newUser.email}
              onChange={(e) => setNewUser({ ...newUser, email: e.target.value })}
            />
            <Select value={newUser.role} onValueChange={(value) => setNewUser({ ...newUser, role: value })}>
              <SelectTrigger>
                <SelectValue placeholder="Select Role" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="DEO">DEO</SelectItem>
                <SelectItem value="Supervisor">Supervisor</SelectItem>
                <SelectItem value="JD">Joint Director</SelectItem>
              </SelectContent>
            </Select>
            <Select value={newUser.committee} onValueChange={(value) => setNewUser({ ...newUser, committee: value })}>
              <SelectTrigger>
                <SelectValue placeholder="Select Committee" />
              </SelectTrigger>
              <SelectContent>
                {committees.map(committee => (
                  <SelectItem key={committee.code} value={committee.code}>
                    {committee.code}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Button onClick={handleAddUser}>Add User</Button>
          </div>
        </CardContent>
      </Card>

      {/* User List */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            System Users - East Godavari District
          </CardTitle>
          <CardDescription>Manage existing users and their permissions across all AMCs</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {users.map((user) => (
              <div key={user.id} className="flex items-center justify-between p-4 border rounded-lg">
                <div className="flex items-center space-x-4">
                  <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                    <Users className="h-5 w-5 text-blue-600" />
                  </div>
                  <div>
                    <h4 className="font-medium">{user.name}</h4>
                    <p className="text-sm text-gray-600">{user.email}</p>
                    <div className="flex items-center space-x-2 mt-1">
                      <Building2 className="h-3 w-3 text-gray-400" />
                      <p className="text-xs text-gray-500">{user.committee}</p>
                    </div>
                  </div>
                </div>
                <div className="flex items-center space-x-3">
                  <Badge className={getRoleColor(user.role)}>{user.role}</Badge>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setPasswordChangeUser(user)}
                    title="Change Password"
                  >
                    <Key className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleEditUser(user.id)}
                  >
                    <Edit className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleDeleteUser(user.id)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Password Change Modal */}
      {passwordChangeUser && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Key className="h-5 w-5" />
              Change Password: {passwordChangeUser.name}
            </CardTitle>
            <CardDescription>Set a new password for this user account</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">New Password</label>
                  <div className="relative">
                    <Input
                      type={showPassword ? "text" : "password"}
                      placeholder="Enter new password"
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                      onClick={() => setShowPassword(!showPassword)}
                    >
                      {showPassword ? <EyeOff className="h-4 w-4 text-gray-400" /> : <Eye className="h-4 w-4 text-gray-400" />}
                    </Button>
                  </div>
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Confirm Password</label>
                  <Input
                    type={showPassword ? "text" : "password"}
                    placeholder="Confirm new password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                  />
                </div>
              </div>
              <div className="flex gap-2">
                <Button 
                  onClick={handleChangePassword}
                  disabled={isChangingPassword}
                >
                  {isChangingPassword ? 'Changing...' : 'Change Password'}
                </Button>
                <Button 
                  variant="outline" 
                  onClick={() => {
                    setPasswordChangeUser(null);
                    setNewPassword('');
                    setConfirmPassword('');
                  }}
                  disabled={isChangingPassword}
                >
                  Cancel
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Edit User Modal */}
      {editingUser && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Edit className="h-5 w-5" />
              Edit User: {editingUser.name}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
              <Input
                placeholder="Full Name"
                value={editingUser.name}
                onChange={(e) => setEditingUser({ ...editingUser, name: e.target.value })}
              />
              <Input
                placeholder="Email Address"
                type="email"
                value={editingUser.email}
                onChange={(e) => setEditingUser({ ...editingUser, email: e.target.value })}
              />
              <Select value={editingUser.role} onValueChange={(value) => setEditingUser({ ...editingUser, role: value })}>
                <SelectTrigger>
                  <SelectValue placeholder="Select Role" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="DEO">DEO</SelectItem>
                  <SelectItem value="Supervisor">Supervisor</SelectItem>
                  <SelectItem value="JD">Joint Director</SelectItem>
                </SelectContent>
              </Select>
              <Select value={editingUser.committee} onValueChange={(value) => setEditingUser({ ...editingUser, committee: value })}>
                <SelectTrigger>
                  <SelectValue placeholder="Select Committee" />
                </SelectTrigger>
                <SelectContent>
                  {committees.map(committee => (
                    <SelectItem key={committee.code} value={committee.code}>
                      {committee.code}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="flex gap-2">
              <Button onClick={handleUpdateUser}>Update User</Button>
              <Button variant="outline" onClick={() => setEditingUser(null)}>Cancel</Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* System Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Users</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{users.length}</div>
            <p className="text-xs text-muted-foreground">District-wide</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">DEO Users</CardTitle>
            <Shield className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{users.filter(u => u.role === 'DEO').length}</div>
            <p className="text-xs text-muted-foreground">Data entry operators</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Supervisors</CardTitle>
            <Shield className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{users.filter(u => u.role === 'Supervisor').length}</div>
            <p className="text-xs text-muted-foreground">Committee supervisors</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active AMCs</CardTitle>
            <Building2 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">10</div>
            <p className="text-xs text-muted-foreground">In East Godavari</p>
          </CardContent>
        </Card>
      </div>

      {/* District Overview */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Building2 className="h-5 w-5" />
            East Godavari District AMC Overview
          </CardTitle>
          <CardDescription>Agricultural Market Committees under Kakinada District administration</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3">
            {committees.filter(c => c.code !== 'District Level').map(committee => (
              <div key={committee.code} className="p-3 bg-gray-50 rounded-lg">
                <div className="text-sm font-medium text-gray-900">{committee.code}</div>
                <div className="text-xs text-gray-600 mt-1">
                  Users: {users.filter(u => u.committee === committee.code).length}
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default UserManagement;
