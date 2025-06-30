
export interface User {
  id: string;
  employeeId: string;
  name: string;
  email: string;
  role: 'employee' | 'supervisor' | 'admin' | 'super_admin';
  department: string;
  phone: string;
  avatar?: string;
  isActive: boolean;
  lastLogin?: Date;
  checkInStatus: 'in' | 'out' | 'idle';
}

export interface AttendanceRecord {
  id: string;
  employeeId: string;
  checkInTime: Date;
  checkOutTime?: Date;
  location: {
    latitude: number;
    longitude: number;
    address: string;
  };
  faceImageUrl?: string;
  notes?: string;
  status: 'checked_in' | 'checked_out';
}

export interface TaskType {
  id: string;
  name: string;
  description?: string;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface TaskSubmission {
  id: string;
  employeeId: string;
  employeeName: string;
  taskType: string;
  taskDescription: string;
  location: {
    latitude: number;
    longitude: number;
    address?: string;
  };
  startTime: Date;
  endTime?: Date;
  preWorkPhoto: string;
  postWorkPhoto?: string;
  comments?: string;
  status: 'in_progress' | 'completed' | 'delayed' | 'approved' | 'rejected' | 'pending_review';
  supervisorFeedback?: string;
  reviewedBy?: string;
  reviewedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

export interface Task {
  id: string;
  title: string;
  description: string;
  assignedTo: string;
  assignedBy: string;
  status: 'pending' | 'in_progress' | 'completed' | 'approved';
  priority: 'low' | 'medium' | 'high';
  dueDate: Date;
  createdAt: Date;
  completedAt?: Date;
  preWorkPhoto?: string;
  postWorkPhoto?: string;
  notes?: string;
  location?: {
    latitude: number;
    longitude: number;
    address: string;
  };
}

export interface Asset {
  id: string;
  name: string;
  category: string;
  quantity: number;
  assigned: number;
  available: number;
  reorderLevel: number;
  status: 'in_stock' | 'low_stock' | 'out_of_stock';
}

export interface AssetRequest {
  id: string;
  employeeId: string;
  assetId: string;
  quantity: number;
  reason: string;
  status: 'pending' | 'approved' | 'rejected';
  requestDate: Date;
  approvedBy?: string;
  approvedDate?: Date;
}

export interface LeaveRequest {
  id: string;
  employeeId: string;
  type: 'sick' | 'casual' | 'earned' | 'emergency';
  startDate: Date;
  endDate: Date;
  reason: string;
  status: 'pending' | 'approved' | 'rejected';
  appliedDate: Date;
  approvedBy?: string;
}

export interface AdvanceRequest {
  id: string;
  employeeId: string;
  amount: number;
  reason: string;
  status: 'pending' | 'approved' | 'rejected';
  requestDate: Date;
  approvedBy?: string;
}
