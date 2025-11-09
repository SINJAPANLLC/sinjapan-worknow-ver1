import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import { Card } from '../../components/ui/Card';
import { Badge } from '../../components/ui/Badge';
import { slideUp, fadeIn } from '../../utils/animations';
import {
  Package,
  MapPin,
  TruckIcon,
  CheckCircle,
  Clock,
  ChevronRight,
  Navigation,
  AlertCircle,
} from 'lucide-react';
import WorkerMap from '../../components/map/WorkerMap';
import { RoleBottomNav } from '../../components/layout/RoleBottomNav';

interface DeliveryAssignment {
  id: string;
  worker_id: string;
  job_id: string;
  status: string;
  started_at?: string;
  completed_at?: string;
  picked_up_at?: string;
  delivered_at?: string;
  pickup_location?: string;
  pickup_lat?: number;
  pickup_lng?: number;
  delivery_location?: string;
  delivery_lat?: number;
  delivery_lng?: number;
  job_title?: string;
  worker_name?: string;
}

export default function DeliveryManagePage() {
  const [selectedDelivery, setSelectedDelivery] = useState<DeliveryAssignment | null>(null);

  const { data: deliveries = [], isLoading } = useQuery({
    queryKey: ['client-deliveries'],
    queryFn: async () => {
      const jobsResponse = await fetch('/api/jobs/my-jobs', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
        },
      });
      if (!jobsResponse.ok) throw new Error('Failed to fetch jobs');
      const jobs = await jobsResponse.json();

      const allAssignments: DeliveryAssignment[] = [];
      
      for (const job of jobs.items || []) {
        try {
          const assignmentsResponse = await fetch(`/api/assignments?job_id=${job.id}`, {
            headers: {
              'Authorization': `Bearer ${localStorage.getItem('token')}`,
            },
          });
          if (assignmentsResponse.ok) {
            const assignmentsData = await assignmentsResponse.json();
            const assignments = assignmentsData.items || [];
            allAssignments.push(...assignments.map((a: any) => ({
              ...a,
              job_title: job.title,
            })));
          }
        } catch (error) {
          console.error(`Failed to fetch assignments for job ${job.id}:`, error);
        }
      }

      return allAssignments.filter((assignment: DeliveryAssignment) => 
        assignment.pickup_location && assignment.delivery_location &&
        ['pending_pickup', 'picking_up', 'in_delivery'].includes(assignment.status)
      );
    },
    refetchInterval: 5000,
  });

  const getStatusDisplay = (status: string) => {
    const displays: { [key: string]: { label: string; icon: any; color: string } } = {
      pending_pickup: { label: '受取待ち', icon: Clock, color: 'from-yellow-500 to-orange-500' },
      picking_up: { label: '受取中', icon: Package, color: 'from-orange-500 to-red-500' },
      in_delivery: { label: '配達中', icon: TruckIcon, color: 'from-blue-500 to-cyan-500' },
      delivered: { label: '配達完了', icon: CheckCircle, color: 'from-green-500 to-emerald-500' },
    };
    return displays[status] || { label: status, icon: AlertCircle, color: 'from-gray-500 to-gray-600' };
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#00CED1] via-[#00B4B4] to-[#009999] pb-24 pt-28">
      <div className="container mx-auto px-4 max-w-7xl">
        {/* Header */}
        <motion.div {...fadeIn} className="mb-6">
          <h1 className="text-4xl font-bold text-white mb-2">配達管理</h1>
          <p className="text-white/80">リアルタイムで配達状況を追跡</p>
        </motion.div>

        <div className="grid lg:grid-cols-2 gap-6 h-[calc(100vh-14rem)]">
          {/* Deliveries List */}
          <motion.div {...slideUp} className="flex flex-col gap-4 overflow-hidden">
            <Card className="p-4 bg-white/95 backdrop-blur-sm">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-bold text-gray-900">進行中の配達</h2>
                <Badge variant="primary" size="lg">
                  {deliveries.length}件
                </Badge>
              </div>
            </Card>

            <div className="flex-1 overflow-y-auto space-y-4">
              {isLoading ? (
                <Card className="p-8 text-center">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
                  <p className="text-gray-600">読み込み中...</p>
                </Card>
              ) : deliveries.length === 0 ? (
                <Card className="p-8 text-center">
                  <TruckIcon className="w-16 h-16 mx-auto mb-4 text-gray-300" />
                  <p className="text-gray-600 text-lg font-medium mb-2">
                    進行中の配達はありません
                  </p>
                  <p className="text-gray-500 text-sm">
                    配達案件が作成されると、ここに表示されます
                  </p>
                </Card>
              ) : (
                deliveries.map((delivery: DeliveryAssignment) => {
                  const statusDisplay = getStatusDisplay(delivery.status);
                  const StatusIcon = statusDisplay.icon;
                  const isSelected = selectedDelivery?.id === delivery.id;

                  return (
                    <motion.div key={delivery.id} {...fadeIn}>
                      <Card
                        className={`cursor-pointer transition-all ${
                          isSelected
                            ? 'ring-2 ring-primary shadow-xl'
                            : 'hover:shadow-lg'
                        }`}
                        onClick={() => setSelectedDelivery(delivery)}
                      >
                        <div className="p-4">
                          {/* Status Header */}
                          <div className="flex items-center gap-3 mb-4">
                            <div className={`w-12 h-12 bg-gradient-to-br ${statusDisplay.color} rounded-xl flex items-center justify-center shadow-md`}>
                              <StatusIcon className="w-6 h-6 text-white" />
                            </div>
                            <div className="flex-1">
                              <h3 className="font-bold text-gray-900">
                                {delivery.job_title || '配達案件'}
                              </h3>
                              <p className="text-sm text-gray-600">
                                ワーカー: {delivery.worker_name || delivery.worker_id}
                              </p>
                            </div>
                            <Badge
                              variant={
                                delivery.status === 'in_delivery'
                                  ? 'primary'
                                  : 'warning'
                              }
                            >
                              {statusDisplay.label}
                            </Badge>
                          </div>

                          {/* Locations */}
                          <div className="space-y-3 mb-4">
                            <div className="flex items-start gap-3 bg-orange-50 rounded-lg p-3">
                              <div className="w-8 h-8 bg-orange-200 rounded-lg flex items-center justify-center flex-shrink-0">
                                <Package className="w-4 h-4 text-orange-700" />
                              </div>
                              <div className="flex-1 min-w-0">
                                <p className="text-xs text-orange-800 font-semibold mb-1">受取場所</p>
                                <p className="text-sm text-gray-900 break-words">
                                  {delivery.pickup_location}
                                </p>
                                {delivery.picked_up_at && (
                                  <p className="text-xs text-green-600 mt-1 flex items-center gap-1">
                                    <CheckCircle className="w-3 h-3" />
                                    受取完了: {new Date(delivery.picked_up_at).toLocaleTimeString('ja-JP')}
                                  </p>
                                )}
                              </div>
                            </div>

                            <div className="flex items-center justify-center">
                              <ChevronRight className="w-5 h-5 text-gray-400" />
                            </div>

                            <div className="flex items-start gap-3 bg-cyan-50 rounded-lg p-3">
                              <div className="w-8 h-8 bg-cyan-200 rounded-lg flex items-center justify-center flex-shrink-0">
                                <MapPin className="w-4 h-4 text-cyan-700" />
                              </div>
                              <div className="flex-1 min-w-0">
                                <p className="text-xs text-cyan-800 font-semibold mb-1">配達先</p>
                                <p className="text-sm text-gray-900 break-words">
                                  {delivery.delivery_location}
                                </p>
                                {delivery.delivered_at && (
                                  <p className="text-xs text-green-600 mt-1 flex items-center gap-1">
                                    <CheckCircle className="w-3 h-3" />
                                    配達完了: {new Date(delivery.delivered_at).toLocaleTimeString('ja-JP')}
                                  </p>
                                )}
                              </div>
                            </div>
                          </div>

                          {/* Time Info */}
                          {delivery.started_at && (
                            <div className="flex items-center gap-2 text-xs text-gray-600 pt-3 border-t border-gray-200">
                              <Clock className="w-4 h-4" />
                              開始時刻: {new Date(delivery.started_at).toLocaleString('ja-JP')}
                            </div>
                          )}
                        </div>
                      </Card>
                    </motion.div>
                  );
                })
              )}
            </div>
          </motion.div>

          {/* Map View */}
          <motion.div
            {...slideUp}
            transition={{ delay: 0.1 }}
            className="relative"
          >
            <Card className="h-full overflow-hidden">
              {selectedDelivery && selectedDelivery.pickup_lat && selectedDelivery.pickup_lng ? (
                <div className="h-full relative">
                  <div className="absolute top-4 left-4 z-[1000] bg-white rounded-lg shadow-lg p-3">
                    <div className="flex items-center gap-2">
                      <Navigation className="w-5 h-5 text-primary" />
                      <div>
                        <p className="text-xs text-gray-600">選択中の配達</p>
                        <p className="text-sm font-bold text-gray-900">
                          {selectedDelivery.job_title || '配達案件'}
                        </p>
                      </div>
                    </div>
                  </div>
                  <WorkerMap
                    center={[selectedDelivery.pickup_lat, selectedDelivery.pickup_lng]}
                    jobs={[]}
                    isOnline={false}
                    activeDelivery={selectedDelivery}
                  />
                </div>
              ) : (
                <div className="h-full flex items-center justify-center bg-gray-50">
                  <div className="text-center">
                    <MapPin className="w-16 h-16 mx-auto mb-4 text-gray-300" />
                    <p className="text-gray-600 text-lg font-medium mb-2">
                      {selectedDelivery
                        ? '位置情報がありません'
                        : '配達を選択してください'}
                    </p>
                    <p className="text-gray-500 text-sm">
                      {selectedDelivery
                        ? 'この配達には位置情報が設定されていません'
                        : '左のリストから配達を選択すると、マップに表示されます'}
                    </p>
                  </div>
                </div>
              )}
            </Card>
          </motion.div>
        </div>
      </div>

      <RoleBottomNav />
    </div>
  );
}
