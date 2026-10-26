import React, { useState } from 'react';
import { User, Mail, GraduationCap, Shield, Target, Save, CheckCircle2 } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { Card } from '../components/common/Card';
import { Button } from '../components/common/Button';
import { Input } from '../components/common/Input';
import { Select } from '../components/common/Select';
import { Badge } from '../components/common/Badge';
import { ReservationCategory, EducationLevel } from '../types/student';

export const StudentProfilePage: React.FC = () => {
  const { user, updateProfile } = useAuth();
  const { showToast } = useToast();

  const [profileData, setProfileData] = useState({
    fullName: user?.fullName || '',
    email: user?.email || '',
    dateOfBirth: user?.dateOfBirth || '',
    age: user?.age || 24,
    gender: user?.gender || 'Female',
    category: (user?.category || 'General / UR') as ReservationCategory,
    domicileState: user?.domicileState || 'Karnataka',
    isPwD: user?.isPwD || false,
    educationLevel: (user?.educationLevel || 'Bachelor of Engineering / B.Tech') as EducationLevel,
    majorStream: user?.majorStream || '',
    graduationYear: user?.graduationYear || 2024,
    graduationPercentage: user?.graduationPercentage || 74,
    preferredDailyStudyHours: user?.preferredDailyStudyHours || 6,
    targetCategories: user?.targetCategories || ['Civil Services', 'Teaching & Lectureship'],
  });

  const categoryOptions = [
    { label: 'General / Unreserved (UR)', value: 'General / UR' },
    { label: 'Economically Weaker Section (EWS)', value: 'EWS' },
    { label: 'Other Backward Classes (OBC-NCL)', value: 'OBC-NCL' },
    { label: 'Scheduled Caste (SC)', value: 'SC' },
    { label: 'Scheduled Tribe (ST)', value: 'ST' },
    { label: 'Person with Disability (PwD)', value: 'PwD' },
  ];

  const stateOptions = [
    'Karnataka',
    'Maharashtra',
    'Tamil Nadu',
    'Uttar Pradesh',
    'Delhi (NCT)',
    'Kerala',
    'Telangana',
    'Andhra Pradesh',
    'Rajasthan',
    'Madhya Pradesh',
    'Bihar',
    'West Bengal',
  ].map((s) => ({ label: s, value: s }));

  const educationOptions = [
    { label: 'Bachelor of Engineering / B.Tech', value: 'Bachelor of Engineering / B.Tech' },
    { label: 'Undergraduate (Final Year Student)', value: 'Undergraduate (Final Year)' },
    { label: 'Bachelor of Science (B.Sc)', value: 'Bachelor of Science (B.Sc)' },
    { label: 'Bachelor of Commerce (B.Com)', value: 'Bachelor of Commerce (B.Com)' },
    { label: 'Bachelor of Arts (B.A)', value: 'Bachelor of Arts (B.A)' },
    { label: 'Master of Technology (M.Tech)', value: 'Master of Technology (M.Tech)' },
    { label: 'Master of Science (M.Sc)', value: 'Master of Science (M.Sc)' },
    { label: 'Master of Arts (M.A)', value: 'Master of Arts (M.A)' },
    { label: 'Ph.D / Research Scholar', value: 'Ph.D / Research Scholar' },
  ];

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    updateProfile(profileData);
    showToast('Profile Updated Successfully', 'Your eligibility parameters and preferences have been saved.', 'success');
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Header */}
      <div>
        <div className="flex items-center gap-2 mb-1">
          <span className="text-xs font-bold text-wisteria uppercase tracking-widest">
            Aspirant Identity
          </span>
          <Badge variant="active" size="sm">
            Candidate ID: {user?.id}
          </Badge>
        </div>
        <h1 className="text-2xl sm:text-3xl font-black text-nocturne">Student Profile & Settings</h1>
        <p className="text-xs sm:text-sm text-eclipse/80 mt-1">
          Manage your personal information, academic qualifications, and reservation categories used for automatic eligibility evaluation.
        </p>
      </div>

      <form onSubmit={handleSave} className="space-y-6">
        {/* Personal Details */}
        <Card variant="default" className="p-6 space-y-4">
          <div className="flex items-center gap-2 pb-3 border-b border-opaline/60">
            <User className="w-4 h-4 text-wisteria" />
            <h2 className="text-sm font-bold text-nocturne uppercase tracking-wider">
              Personal Information
            </h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input
              label="Full Name"
              value={profileData.fullName}
              onChange={(e) => setProfileData({ ...profileData, fullName: e.target.value })}
              required
            />

            <Input
              label="Email Address"
              type="email"
              value={profileData.email}
              onChange={(e) => setProfileData({ ...profileData, email: e.target.value })}
              required
            />

            <Input
              label="Date of Birth"
              type="date"
              value={profileData.dateOfBirth}
              onChange={(e) => setProfileData({ ...profileData, dateOfBirth: e.target.value })}
              required
            />

            <Input
              label="Computed Age (Years)"
              type="number"
              value={profileData.age}
              onChange={(e) => setProfileData({ ...profileData, age: parseInt(e.target.value) || 24 })}
              required
            />
          </div>
        </Card>

        {/* Academic Profile */}
        <Card variant="default" className="p-6 space-y-4">
          <div className="flex items-center gap-2 pb-3 border-b border-opaline/60">
            <GraduationCap className="w-4 h-4 text-wisteria" />
            <h2 className="text-sm font-bold text-nocturne uppercase tracking-wider">
              Academic Background
            </h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Select
              label="Highest Qualification"
              options={educationOptions}
              value={profileData.educationLevel}
              onChange={(e) =>
                setProfileData({ ...profileData, educationLevel: e.target.value as EducationLevel })
              }
            />

            <Input
              label="Discipline / Major"
              value={profileData.majorStream}
              onChange={(e) => setProfileData({ ...profileData, majorStream: e.target.value })}
              placeholder="e.g. Computer Science & Engineering"
              required
            />

            <Input
              label="Passing Year"
              type="number"
              value={profileData.graduationYear}
              onChange={(e) =>
                setProfileData({ ...profileData, graduationYear: parseInt(e.target.value) || 2024 })
              }
              required
            />

            <Input
              label="Aggregate Percentage (%)"
              type="number"
              step="0.1"
              value={profileData.graduationPercentage}
              onChange={(e) =>
                setProfileData({
                  ...profileData,
                  graduationPercentage: parseFloat(e.target.value) || 60,
                })
              }
              required
            />
          </div>
        </Card>

        {/* Category & Domicile */}
        <Card variant="default" className="p-6 space-y-4">
          <div className="flex items-center gap-2 pb-3 border-b border-opaline/60">
            <Shield className="w-4 h-4 text-wisteria" />
            <h2 className="text-sm font-bold text-nocturne uppercase tracking-wider">
              Statutory Category & Domicile
            </h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Select
              label="Reservation Category"
              options={categoryOptions}
              value={profileData.category}
              onChange={(e) =>
                setProfileData({ ...profileData, category: e.target.value as ReservationCategory })
              }
              helperText="Applies Central & State statutory age relaxations"
            />

            <Select
              label="State of Domicile"
              options={stateOptions}
              value={profileData.domicileState}
              onChange={(e) => setProfileData({ ...profileData, domicileState: e.target.value })}
            />
          </div>

          <div className="p-3.5 rounded-xl bg-opaline/20 border border-opaline/60">
            <label className="flex items-center gap-2.5 text-xs text-eclipse cursor-pointer">
              <input
                type="checkbox"
                checked={profileData.isPwD}
                onChange={(e) => setProfileData({ ...profileData, isPwD: e.target.checked })}
                className="rounded border-opaline text-nocturne focus:ring-wisteria"
              />
              <span className="font-bold text-nocturne">
                Person with Benchmark Disability (PwD) Candidate
              </span>
            </label>
          </div>
        </Card>

        {/* Save Actions */}
        <div className="flex justify-end pt-2">
          <Button
            type="submit"
            variant="primary"
            size="md"
            leftIcon={<Save className="w-4 h-4" />}
          >
            Save Profile Changes
          </Button>
        </div>
      </form>
    </div>
  );
};
