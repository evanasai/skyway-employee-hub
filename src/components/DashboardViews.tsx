
import React from 'react';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';
import TaskSubmissionForm from './TaskSubmissionForm';
import LeaveRequestForm from './LeaveRequestForm';
import AdvanceRequestForm from './AdvanceRequestForm';
import AssetRequestForm from './AssetRequestForm';
import PayslipsView from './PayslipsView';
import SupportView from './SupportView';
import MonthlyPerformance from './MonthlyPerformance';
import MyDocuments from './MyDocuments';
import EmployeeProfile from './EmployeeProfile';

interface DashboardViewsProps {
  currentView: string;
  onBack: () => void;
}

const MobileBackButton = ({ onBack }: { onBack: () => void }) => (
  <Button
    variant="ghost"
    size="sm"
    onClick={onBack}
    className="mb-4 md:hidden"
  >
    <ArrowLeft className="h-4 w-4 mr-2" />
    Back to Dashboard
  </Button>
);

const DashboardViews: React.FC<DashboardViewsProps> = ({ currentView, onBack }) => {
  const baseClassName = "min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-4";

  switch (currentView) {
    case 'task':
      return (
        <div className={baseClassName}>
          <MobileBackButton onBack={onBack} />
          <TaskSubmissionForm />
        </div>
      );

    case 'leave':
      return (
        <div className={baseClassName}>
          <MobileBackButton onBack={onBack} />
          <LeaveRequestForm onBack={onBack} />
        </div>
      );

    case 'advance':
      return (
        <div className={baseClassName}>
          <MobileBackButton onBack={onBack} />
          <AdvanceRequestForm onBack={onBack} />
        </div>
      );

    case 'asset':
      return (
        <div className={baseClassName}>
          <MobileBackButton onBack={onBack} />
          <AssetRequestForm onBack={onBack} />
        </div>
      );

    case 'profile':
      return <EmployeeProfile onBack={onBack} />;

    case 'payslips':
      return (
        <div className={baseClassName}>
          <MobileBackButton onBack={onBack} />
          <PayslipsView onBack={onBack} />
        </div>
      );

    case 'support':
      return (
        <div className={baseClassName}>
          <MobileBackButton onBack={onBack} />
          <SupportView onBack={onBack} />
        </div>
      );

    case 'performance':
      return (
        <div className={baseClassName}>
          <MobileBackButton onBack={onBack} />
          <MonthlyPerformance onBack={onBack} />
        </div>
      );

    case 'documents':
      return (
        <div className={baseClassName}>
          <MobileBackButton onBack={onBack} />
          <MyDocuments onBack={onBack} />
        </div>
      );

    default:
      return null;
  }
};

export default DashboardViews;
