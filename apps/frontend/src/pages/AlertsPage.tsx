import React, { useState } from 'react';
import { useAlerts } from '@/hooks/useAlerts';
import { useBrands } from '@/hooks/useBrands';
import {
  Button,
  Card,
  CardHeader,
  CardTitle,
  CardContent,
  Modal,
  ModalFooter,
  Input,
  Select,
  Loading,
  useToast,
} from '@/components/ui';
import type { Alert } from '@/types';

export const AlertsPage: React.FC = () => {
  const { alerts, isLoading, createAlert, updateAlert, deleteAlert, isCreating, isDeleting } =
    useAlerts();
  const { brands } = useBrands();
  const { showToast } = useToast();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingAlert, setEditingAlert] = useState<Alert | null>(null);
  const [formData, setFormData] = useState({
    type: 'MENTION_DETECTED' as const,
    channel: 'EMAIL' as const,
    config: {},
    threshold: undefined as number | undefined,
    isActive: true,
  });

  const handleOpenCreate = () => {
    setEditingAlert(null);
    setFormData({
      type: 'MENTION_DETECTED',
      channel: 'EMAIL',
      config: {},
      threshold: undefined,
      isActive: true,
    });
    setIsModalOpen(true);
  };

  const handleOpenEdit = (alert: Alert) => {
    setEditingAlert(alert);
    setFormData({
      type: alert.type,
      channel: alert.channel,
      config: alert.config || {},
      threshold: alert.threshold,
      isActive: alert.isActive,
    });
    setIsModalOpen(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (editingAlert) {
      updateAlert(
        { id: editingAlert.id, data: formData },
        {
          onSuccess: () => {
            showToast('Alert updated successfully', 'success');
            setIsModalOpen(false);
          },
          onError: () => {
            showToast('Failed to update alert', 'error');
          },
        }
      );
    } else {
      createAlert(formData, {
        onSuccess: () => {
          showToast('Alert created successfully', 'success');
          setIsModalOpen(false);
        },
        onError: () => {
          showToast('Failed to create alert', 'error');
        },
      });
    }
  };

  const handleDelete = (id: string) => {
    if (confirm('Are you sure you want to delete this alert?')) {
      deleteAlert(id, {
        onSuccess: () => {
          showToast('Alert deleted successfully', 'success');
        },
        onError: () => {
          showToast('Failed to delete alert', 'error');
        },
      });
    }
  };

  const handleToggleActive = (alert: Alert) => {
    updateAlert(
      { id: alert.id, data: { isActive: !alert.isActive } },
      {
        onSuccess: () => {
          showToast(
            `Alert ${!alert.isActive ? 'enabled' : 'disabled'} successfully`,
            'success'
          );
        },
        onError: () => {
          showToast('Failed to update alert', 'error');
        },
      }
    );
  };

  const getChannelIcon = (channel: string) => {
    switch (channel) {
      case 'EMAIL':
        return (
          <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
            />
          </svg>
        );
      case 'SLACK':
        return (
          <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24">
            <path d="M5.042 15.165a2.528 2.528 0 0 1-2.52 2.523A2.528 2.528 0 0 1 0 15.165a2.527 2.527 0 0 1 2.522-2.52h2.52v2.52zM6.313 15.165a2.527 2.527 0 0 1 2.521-2.52 2.527 2.527 0 0 1 2.521 2.52v6.313A2.528 2.528 0 0 1 8.834 24a2.528 2.528 0 0 1-2.521-2.522v-6.313zM8.834 5.042a2.528 2.528 0 0 1-2.521-2.52A2.528 2.528 0 0 1 8.834 0a2.528 2.528 0 0 1 2.521 2.522v2.52H8.834zM8.834 6.313a2.528 2.528 0 0 1 2.521 2.521 2.528 2.528 0 0 1-2.521 2.521H2.522A2.528 2.528 0 0 1 0 8.834a2.528 2.528 0 0 1 2.522-2.521h6.312zM18.956 8.834a2.528 2.528 0 0 1 2.522-2.521A2.528 2.528 0 0 1 24 8.834a2.528 2.528 0 0 1-2.522 2.521h-2.522V8.834zM17.688 8.834a2.528 2.528 0 0 1-2.523 2.521 2.527 2.527 0 0 1-2.52-2.521V2.522A2.527 2.527 0 0 1 15.165 0a2.528 2.528 0 0 1 2.523 2.522v6.312zM15.165 18.956a2.528 2.528 0 0 1 2.523 2.522A2.528 2.528 0 0 1 15.165 24a2.527 2.527 0 0 1-2.52-2.522v-2.522h2.52zM15.165 17.688a2.527 2.527 0 0 1-2.52-2.523 2.526 2.526 0 0 1 2.52-2.52h6.313A2.527 2.527 0 0 1 24 15.165a2.528 2.528 0 0 1-2.522 2.523h-6.313z" />
          </svg>
        );
      case 'WEBHOOK':
        return (
          <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M13 10V3L4 14h7v7l9-11h-7z"
            />
          </svg>
        );
      default:
        return null;
    }
  };

  const getTypeLabel = (type: string) => {
    switch (type) {
      case 'MENTION_DETECTED':
        return 'Mention Detected';
      case 'MENTION_LOST':
        return 'Mention Lost';
      case 'COMPETITOR_MENTIONED':
        return 'Competitor Mentioned';
      case 'WEEKLY_DIGEST':
        return 'Weekly Digest';
      default:
        return type;
    }
  };

  if (isLoading) {
    return <Loading text="Loading alerts..." />;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Alerts</h1>
          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
            Configure notifications for brand mentions and updates
          </p>
        </div>
        <Button onClick={handleOpenCreate} variant="primary">
          Create Alert
        </Button>
      </div>

      {alerts.length === 0 ? (
        <Card>
          <CardContent className="text-center py-12">
            <svg
              className="mx-auto h-12 w-12 text-gray-400"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"
              />
            </svg>
            <h3 className="mt-2 text-sm font-medium text-gray-900 dark:text-white">
              No alerts configured
            </h3>
            <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
              Get started by creating your first alert
            </p>
            <div className="mt-6">
              <Button onClick={handleOpenCreate} variant="primary">
                Create Alert
              </Button>
            </div>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4">
          {alerts.map((alert) => (
            <Card key={alert.id} hover>
              <div className="flex items-start justify-between">
                <div className="flex items-start gap-4 flex-1">
                  <div className="p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                    {getChannelIcon(alert.channel)}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                        {getTypeLabel(alert.type)}
                      </h3>
                      <span
                        className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                          alert.isActive
                            ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400'
                            : 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-400'
                        }`}
                      >
                        {alert.isActive ? 'Active' : 'Inactive'}
                      </span>
                    </div>
                    <div className="flex items-center gap-4 text-sm text-gray-500 dark:text-gray-400">
                      <span className="flex items-center gap-1">
                        {getChannelIcon(alert.channel)}
                        {alert.channel}
                      </span>
                      {alert.threshold && (
                        <span>Threshold: {alert.threshold}</span>
                      )}
                    </div>
                    {alert.config && Object.keys(alert.config).length > 0 && (
                      <div className="mt-2 text-sm text-gray-600 dark:text-gray-400">
                        <details>
                          <summary className="cursor-pointer hover:text-gray-900 dark:hover:text-gray-200">
                            Configuration
                          </summary>
                          <pre className="mt-2 p-2 bg-gray-50 dark:bg-gray-900 rounded text-xs overflow-x-auto">
                            {JSON.stringify(alert.config, null, 2)}
                          </pre>
                        </details>
                      </div>
                    )}
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => handleToggleActive(alert)}
                  >
                    {alert.isActive ? 'Disable' : 'Enable'}
                  </Button>
                  <Button size="sm" variant="secondary" onClick={() => handleOpenEdit(alert)}>
                    Edit
                  </Button>
                  <Button
                    size="sm"
                    variant="danger"
                    onClick={() => handleDelete(alert.id)}
                    disabled={isDeleting}
                  >
                    Delete
                  </Button>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}

      {/* Create/Edit Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingAlert ? 'Edit Alert' : 'Create Alert'}
        size="lg"
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <Select
            label="Alert Type"
            value={formData.type}
            onChange={(e) =>
              setFormData({ ...formData, type: e.target.value as any })
            }
            options={[
              { value: 'MENTION_DETECTED', label: 'Mention Detected' },
              { value: 'MENTION_LOST', label: 'Mention Lost' },
              { value: 'COMPETITOR_MENTIONED', label: 'Competitor Mentioned' },
              { value: 'WEEKLY_DIGEST', label: 'Weekly Digest' },
            ]}
          />

          <Select
            label="Notification Channel"
            value={formData.channel}
            onChange={(e) =>
              setFormData({ ...formData, channel: e.target.value as any })
            }
            options={[
              { value: 'EMAIL', label: 'Email' },
              { value: 'SLACK', label: 'Slack' },
              { value: 'WEBHOOK', label: 'Webhook' },
            ]}
          />

          {formData.channel === 'EMAIL' && (
            <Input
              label="Email Address"
              type="email"
              placeholder="your@email.com"
              value={formData.config.email || ''}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  config: { ...formData.config, email: e.target.value },
                })
              }
            />
          )}

          {formData.channel === 'SLACK' && (
            <Input
              label="Slack Webhook URL"
              type="url"
              placeholder="https://hooks.slack.com/services/..."
              value={formData.config.webhookUrl || ''}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  config: { ...formData.config, webhookUrl: e.target.value },
                })
              }
            />
          )}

          {formData.channel === 'WEBHOOK' && (
            <Input
              label="Webhook URL"
              type="url"
              placeholder="https://your-webhook-url.com"
              value={formData.config.url || ''}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  config: { ...formData.config, url: e.target.value },
                })
              }
            />
          )}

          <Input
            label="Threshold (optional)"
            type="number"
            placeholder="Enter threshold value"
            value={formData.threshold || ''}
            onChange={(e) =>
              setFormData({
                ...formData,
                threshold: e.target.value ? parseInt(e.target.value) : undefined,
              })
            }
            helperText="Number of occurrences before triggering the alert"
          />

          <div className="flex items-center">
            <input
              type="checkbox"
              id="isActive"
              checked={formData.isActive}
              onChange={(e) =>
                setFormData({ ...formData, isActive: e.target.checked })
              }
              className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
            />
            <label
              htmlFor="isActive"
              className="ml-2 block text-sm text-gray-900 dark:text-white"
            >
              Enable alert immediately
            </label>
          </div>

          <ModalFooter>
            <Button
              type="button"
              variant="secondary"
              onClick={() => setIsModalOpen(false)}
            >
              Cancel
            </Button>
            <Button type="submit" variant="primary" isLoading={isCreating}>
              {editingAlert ? 'Update Alert' : 'Create Alert'}
            </Button>
          </ModalFooter>
        </form>
      </Modal>
    </div>
  );
};
