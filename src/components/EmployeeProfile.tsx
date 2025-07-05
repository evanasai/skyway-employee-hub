
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';
import { ArrowLeft, User, Mail, Phone, Calendar, Building, Badge } from 'lucide-react';

interface EmployeeProfileProps {
  onBack?: () => void;
}

const EmployeeProfile: React.FC<EmployeeProfileProps> = ({ onBack }) => {
  const { user } = useAuth();
  const [employeeData, setEmployeeData] = useState<any>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    department: ''
  });

  useEffect(() => {
    if (user) {
      fetchEmployeeData();
    }
  }, [user]);

  const fetchEmployeeData = async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('employees')
        .select('*')
        .eq('employee_id', user.employeeId)
        .single();

      if (error) throw error;
      
      setEmployeeData(data);
      setFormData({
        name: data.name || '',
        email: data.email || '',
        phone: data.phone || '',
        department: data.department || ''
      });
    } catch (error) {
      console.error('Error fetching employee data:', error);
      toast({
        title: "Error",
        description: "Failed to fetch profile data",
        variant: "destructive"
      });
    }
  };

  const handleUpdateProfile = async () => {
    if (!employeeData) return;

    try {
      const { error } = await supabase
        .from('employees')
        .update({
          name: formData.name,
          email: formData.email,
          phone: formData.phone,
          department: formData.department,
          updated_at: new Date().toISOString()
        })
        .eq('id', employeeData.id);

      if (error) throw error;

      setIsEditing(false);
      fetchEmployeeData();
      
      toast({
        title: "Profile Updated",
        description: "Your profile has been updated successfully",
      });
    } catch (error) {
      console.error('Error updating profile:', error);
      toast({
        title: "Error",
        description: "Failed to update profile",
        variant: "destructive"
      });
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  if (!employeeData) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-4 text-gray-600">Loading profile...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
      <div className="max-w-2xl mx-auto space-y-6">
        {onBack && (
          <Button variant="ghost" onClick={onBack} className="mb-4">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Dashboard
          </Button>
        )}

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <User className="h-6 w-6" />
              <span>My Profile</span>
            </CardTitle>
            <CardDescription>
              View and manage your personal information
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Profile Picture Placeholder */}
            <div className="flex justify-center">
              <div className="w-24 h-24 bg-blue-600 rounded-full flex items-center justify-center">
                <span className="text-white text-2xl font-bold">
                  {employeeData.name?.charAt(0)?.toUpperCase()}
                </span>
              </div>
            </div>

            {/* Basic Information */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <div className="flex items-center space-x-3">
                  <Badge className="h-5 w-5 text-gray-600" />
                  <div>
                    <Label className="text-sm text-gray-500">Employee ID</Label>
                    <p className="font-medium">{employeeData.employee_id}</p>
                  </div>
                </div>

                <div className="flex items-center space-x-3">
                  <User className="h-5 w-5 text-gray-600" />
                  <div className="flex-1">
                    <Label className="text-sm text-gray-500">Full Name</Label>
                    {isEditing ? (
                      <Input
                        value={formData.name}
                        onChange={(e) => setFormData({...formData, name: e.target.value})}
                        className="mt-1"
                      />
                    ) : (
                      <p className="font-medium">{employeeData.name}</p>
                    )}
                  </div>
                </div>

                <div className="flex items-center space-x-3">
                  <Mail className="h-5 w-5 text-gray-600" />
                  <div className="flex-1">
                    <Label className="text-sm text-gray-500">Email</Label>
                    {isEditing ? (
                      <Input
                        type="email"
                        value={formData.email}
                        onChange={(e) => setFormData({...formData, email: e.target.value})}
                        className="mt-1"
                      />
                    ) : (
                      <p className="font-medium">{employeeData.email}</p>
                    )}
                  </div>
                </div>

                <div className="flex items-center space-x-3">
                  <Phone className="h-5 w-5 text-gray-600" />
                  <div className="flex-1">
                    <Label className="text-sm text-gray-500">Phone</Label>
                    {isEditing ? (
                      <Input
                        value={formData.phone}
                        onChange={(e) => setFormData({...formData, phone: e.target.value})}
                        className="mt-1"
                      />
                    ) : (
                      <p className="font-medium">{employeeData.phone}</p>
                    )}
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <div className="flex items-center space-x-3">
                  <Building className="h-5 w-5 text-gray-600" />
                  <div className="flex-1">
                    <Label className="text-sm text-gray-500">Department</Label>
                    {isEditing ? (
                      <Input
                        value={formData.department}
                        onChange={(e) => setFormData({...formData, department: e.target.value})}
                        className="mt-1"
                      />
                    ) : (
                      <p className="font-medium">{employeeData.department}</p>
                    )}
                  </div>
                </div>

                <div className="flex items-center space-x-3">
                  <Badge className="h-5 w-5 text-gray-600" />
                  <div>
                    <Label className="text-sm text-gray-500">Role</Label>
                    <p className="font-medium capitalize">{employeeData.role}</p>
                  </div>
                </div>

                <div className="flex items-center space-x-3">
                  <Calendar className="h-5 w-5 text-gray-600" />
                  <div>
                    <Label className="text-sm text-gray-500">Joining Date</Label>
                    <p className="font-medium">
                      {employeeData.joining_date ? formatDate(employeeData.joining_date) : 'Not specified'}
                    </p>
                  </div>
                </div>

                <div className="flex items-center space-x-3">
                  <Calendar className="h-5 w-5 text-gray-600" />
                  <div>
                    <Label className="text-sm text-gray-500">Status</Label>
                    <p className={`font-medium ${employeeData.is_active ? 'text-green-600' : 'text-red-600'}`}>
                      {employeeData.is_active ? 'Active' : 'Inactive'}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex space-x-2">
              {isEditing ? (
                <>
                  <Button onClick={handleUpdateProfile}>
                    Save Changes
                  </Button>
                  <Button variant="outline" onClick={() => setIsEditing(false)}>
                    Cancel
                  </Button>
                </>
              ) : (
                <Button onClick={() => setIsEditing(true)}>
                  Edit Profile
                </Button>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default EmployeeProfile;
