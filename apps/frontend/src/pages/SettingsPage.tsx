import React, { useState } from 'react';
import { useAuthStore } from '@/stores/authStore';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { profileService } from '@/services/profile';
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
  CardFooter,
  Button,
  Input,
  Modal,
  ModalFooter,
  useToast,
} from '@/components/ui';

export const SettingsPage: React.FC = () => {
  const { user, logout, setUser } = useAuthStore();
  const { showToast } = useToast();
  const queryClient = useQueryClient();

  const [profileData, setProfileData] = useState({
    name: user?.name || '',
    email: user?.email || '',
  });

  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });

  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deletePassword, setDeletePassword] = useState('');

  // Update profile mutation
  const updateProfileMutation = useMutation({
    mutationFn: profileService.updateProfile,
    onSuccess: (data) => {
      setUser(data);
      queryClient.invalidateQueries({ queryKey: ['profile'] });
      showToast('Profile updated successfully', 'success');
    },
    onError: (error: any) => {
      showToast(error.response?.data?.message || 'Failed to update profile', 'error');
    },
  });

  // Change password mutation
  const changePasswordMutation = useMutation({
    mutationFn: profileService.changePassword,
    onSuccess: () => {
      showToast('Password changed successfully', 'success');
      setPasswordData({
        currentPassword: '',
        newPassword: '',
        confirmPassword: '',
      });
    },
    onError: (error: any) => {
      showToast(error.response?.data?.message || 'Failed to change password', 'error');
    },
  });

  // Delete account mutation
  const deleteAccountMutation = useMutation({
    mutationFn: profileService.deleteAccount,
    onSuccess: () => {
      showToast('Account deleted successfully', 'success');
      logout();
    },
    onError: (error: any) => {
      showToast(error.response?.data?.message || 'Failed to delete account', 'error');
    },
  });

  const handleUpdateProfile = (e: React.FormEvent) => {
    e.preventDefault();

    // Check if at least one field changed
    if (profileData.name === user?.name && profileData.email === user?.email) {
      showToast('No changes to save', 'info');
      return;
    }

    const updates: any = {};
    if (profileData.name !== user?.name) updates.name = profileData.name;
    if (profileData.email !== user?.email) updates.email = profileData.email;

    updateProfileMutation.mutate(updates);
  };

  const handleChangePassword = (e: React.FormEvent) => {
    e.preventDefault();

    if (passwordData.newPassword !== passwordData.confirmPassword) {
      showToast('Passwords do not match', 'error');
      return;
    }

    if (passwordData.newPassword.length < 8) {
      showToast('Password must be at least 8 characters', 'error');
      return;
    }

    changePasswordMutation.mutate(passwordData);
  };

  const handleLogout = () => {
    logout();
    showToast('Logged out successfully', 'success');
  };

  const handleDeleteAccount = () => {
    if (!deletePassword) {
      showToast('Please enter your password to confirm deletion', 'error');
      return;
    }

    deleteAccountMutation.mutate({ password: deletePassword });
  };

  return (
    <div className="space-y-6 max-w-4xl">
      <div>
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Settings</h1>
        <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
          Manage your account settings and preferences
        </p>
      </div>

      {/* Account Information */}
      <Card>
        <CardHeader>
          <CardTitle>Account Information</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4 py-2">
              <div className="text-sm font-medium text-gray-500 dark:text-gray-400">Plan</div>
              <div className="text-sm text-gray-900 dark:text-white font-semibold">
                {user?.plan || 'FREE'}
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4 py-2 border-t border-gray-200 dark:border-gray-700">
              <div className="text-sm font-medium text-gray-500 dark:text-gray-400">Email</div>
              <div className="text-sm text-gray-900 dark:text-white">{user?.email}</div>
            </div>
            <div className="grid grid-cols-2 gap-4 py-2 border-t border-gray-200 dark:border-gray-700">
              <div className="text-sm font-medium text-gray-500 dark:text-gray-400">Member Since</div>
              <div className="text-sm text-gray-900 dark:text-white">
                {user?.createdAt ? new Date(user.createdAt).toLocaleDateString() : 'N/A'}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Profile Settings */}
      <Card>
        <CardHeader>
          <CardTitle>Profile Settings</CardTitle>
        </CardHeader>
        <form onSubmit={handleUpdateProfile}>
          <CardContent>
            <div className="space-y-4">
              <Input
                label="Name"
                type="text"
                value={profileData.name}
                onChange={(e) => setProfileData({ ...profileData, name: e.target.value })}
                placeholder="Enter your name"
              />
              <Input
                label="Email"
                type="email"
                value={profileData.email}
                onChange={(e) => setProfileData({ ...profileData, email: e.target.value })}
                placeholder="Enter your email"
                helperText="Changing your email will require verification"
              />
            </div>
          </CardContent>
          <CardFooter>
            <Button
              type="submit"
              variant="primary"
              isLoading={updateProfileMutation.isPending}
            >
              Save Changes
            </Button>
          </CardFooter>
        </form>
      </Card>

      {/* Change Password */}
      <Card>
        <CardHeader>
          <CardTitle>Change Password</CardTitle>
        </CardHeader>
        <form onSubmit={handleChangePassword}>
          <CardContent>
            <div className="space-y-4">
              <Input
                label="Current Password"
                type="password"
                value={passwordData.currentPassword}
                onChange={(e) =>
                  setPasswordData({ ...passwordData, currentPassword: e.target.value })
                }
                placeholder="Enter current password"
              />
              <Input
                label="New Password"
                type="password"
                value={passwordData.newPassword}
                onChange={(e) =>
                  setPasswordData({ ...passwordData, newPassword: e.target.value })
                }
                placeholder="Enter new password"
                helperText="Must be at least 8 characters"
              />
              <Input
                label="Confirm New Password"
                type="password"
                value={passwordData.confirmPassword}
                onChange={(e) =>
                  setPasswordData({ ...passwordData, confirmPassword: e.target.value })
                }
                placeholder="Confirm new password"
              />
            </div>
          </CardContent>
          <CardFooter>
            <Button
              type="submit"
              variant="primary"
              isLoading={changePasswordMutation.isPending}
            >
              Change Password
            </Button>
          </CardFooter>
        </form>
      </Card>

      {/* Plan Upgrade */}
      <Card>
        <CardHeader>
          <CardTitle>Upgrade Plan</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
            You are currently on the <span className="font-semibold">{user?.plan || 'FREE'}</span> plan.
          </p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {['STARTER', 'PRO', 'ENTERPRISE'].map((plan) => (
              <div
                key={plan}
                className={`p-4 border-2 rounded-lg ${
                  user?.plan === plan
                    ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                    : 'border-gray-200 dark:border-gray-700'
                }`}
              >
                <h3 className="font-semibold text-gray-900 dark:text-white">{plan}</h3>
                <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                  {plan === 'STARTER' && '$29/month'}
                  {plan === 'PRO' && '$79/month'}
                  {plan === 'ENTERPRISE' && 'Custom pricing'}
                </p>
                {user?.plan !== plan && (
                  <Button
                    size="sm"
                    variant="primary"
                    className="mt-3 w-full"
                    onClick={() => showToast('Plan upgrade not yet implemented', 'info')}
                  >
                    Upgrade
                  </Button>
                )}
                {user?.plan === plan && (
                  <div className="mt-3 text-center">
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400">
                      Current Plan
                    </span>
                  </div>
                )}
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Danger Zone */}
      <Card>
        <CardHeader>
          <CardTitle className="text-red-600 dark:text-red-400">Danger Zone</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-center justify-between p-4 border border-red-200 dark:border-red-800 rounded-lg">
              <div>
                <h3 className="text-sm font-medium text-gray-900 dark:text-white">
                  Log Out
                </h3>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  Sign out of your account on this device
                </p>
              </div>
              <Button variant="danger" onClick={handleLogout}>
                Log Out
              </Button>
            </div>
            <div className="flex items-center justify-between p-4 border border-red-200 dark:border-red-800 rounded-lg">
              <div>
                <h3 className="text-sm font-medium text-gray-900 dark:text-white">
                  Delete Account
                </h3>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  Permanently delete your account and all data
                </p>
              </div>
              <Button variant="danger" onClick={() => setShowDeleteModal(true)}>
                Delete Account
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Delete Account Modal */}
      <Modal
        isOpen={showDeleteModal}
        onClose={() => {
          setShowDeleteModal(false);
          setDeletePassword('');
        }}
        title="Delete Account"
      >
        <div className="space-y-4">
          <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4">
            <p className="text-sm text-red-800 dark:text-red-200 font-medium">
              Warning: This action cannot be undone!
            </p>
            <p className="text-sm text-red-700 dark:text-red-300 mt-2">
              All your data including brands, queries, mentions, and alerts will be permanently deleted.
            </p>
          </div>

          <Input
            label="Enter your password to confirm"
            type="password"
            value={deletePassword}
            onChange={(e) => setDeletePassword(e.target.value)}
            placeholder="Password"
          />
        </div>

        <ModalFooter>
          <Button
            variant="ghost"
            onClick={() => {
              setShowDeleteModal(false);
              setDeletePassword('');
            }}
          >
            Cancel
          </Button>
          <Button
            variant="danger"
            onClick={handleDeleteAccount}
            isLoading={deleteAccountMutation.isPending}
          >
            Delete My Account
          </Button>
        </ModalFooter>
      </Modal>
    </div>
  );
};
