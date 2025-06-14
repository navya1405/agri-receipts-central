
import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { Users, UserPlus, Edit, Trash2, Shield } from 'lucide-react';

const UserManagement = ({ user }: { user: any }) => {
  const [users, setUsers] = useState([
    { id: '1', name: 'Demo DEO User', email: 'demo_deo@amc.gov.in', role: 'DEO', committee: 'Tuni AMC' },
    { id: '3', name: 'Demo Supervisor User', email: 'demo_supervisor@amc.gov.in', role: 'Supervisor', committee: 'Tuni AMC' },
    { id: '4', name: 'Demo Joint Director', email: 'demo_jd@amc.gov.in', role: 'JD', committee: 'State Level' }
  ]);
  const [newUser, setNewUser] = useState({ name: '', email: '', role: 'DEO', committee: 'Tuni AMC' });
  const [editingUser, setEditingUser] = useState<any>(null);
  const { toast } = useToast();

  const handleAddUser = () => {
    if (!newUser.name || !newUser.email) {
      toast({
        title: "Error",
        description: "Please fill in all required fields",
        variant: "destructive",
      });
      return;
    }

    const user = {
      id: Date.now().toString(),
      ...newUser
    };

    setUsers([...users, user]);
    setNewUser({ name: '', email: '', role: 'DEO', committee: 'Tuni AMC' });
    
    toast({
      title: "User Added",
      description: `${newUser.name} has been added successfully`,
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

    setUsers(users.map(u => u.id === editingUser.id ? editingUser : u));
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
        <p className="text-gray-600">Manage system users and their roles</p>
      </div>

      {/* Add New User */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <UserPlus className="h-5 w-5" />
            Add New User
          </CardTitle>
          <CardDescription>Create new user accounts for the AMC system</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
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
            <Button onClick={handleAddUser}>Add User</Button>
          </div>
        </CardContent>
      </Card>

      {/* User List */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            System Users
          </CardTitle>
          <CardDescription>Manage existing users and their permissions</CardDescription>
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
                    <p className="text-xs text-gray-500">{user.committee}</p>
                  </div>
                </div>
                <div className="flex items-center space-x-3">
                  <Badge className={getRoleColor(user.role)}>{user.role}</Badge>
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
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
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
            </div>
            <div className="flex gap-2">
              <Button onClick={handleUpdateUser}>Update User</Button>
              <Button variant="outline" onClick={() => setEditingUser(null)}>Cancel</Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* System Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Users</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{users.length}</div>
            <p className="text-xs text-muted-foreground">Active users</p>
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
      </div>
    </div>
  );
};

export default UserManagement;
