'use client';

import { useEffect, useState } from 'react';
import { DashboardOverview } from '@/components/dashboard/DashboardOverview';
import { PrescriptionQueue } from '@/components/prescriptions/PrescriptionQueue';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { TrendingUp, Activity, Loader2, AlertCircle } from 'lucide-react';
import api from '@/lib/api';
import { formatCurrency } from '@/lib/utils';

type DashboardStats = {
  totalOrders: number;
  todaysOrders: number;
  pendingOrders: number;
  processingOrders: number;
  deliveredOrders: number;
  cancelledOrders: number;

  totalRevenue: number;
  todaysRevenue: number;
  thisMonthRevenue: number;

  totalPrescriptions: number;
  pendingPrescriptions: number;
  approvedPrescriptions: number;
  rejectedPrescriptions: number;

  totalProducts: number;
  lowStockProducts: number;
  outOfStockProducts: number;

  totalCustomers: number;
  newCustomersToday: number;
};

type PrescriptionQueueItem = {
  id: number;
  patientName: string;
  status: string;
  fileUrl: string;
  message?: string | null;
  createdAt: string;
  userName?: string | null;
};

type ApiResponse<T> = {
  success: boolean;
  message: string;
  data: T;
  errors?: string[];
};

type PagedResponse<T> = {
  items: T[];
  totalCount: number;
  pageNumber: number;
  pageSize: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPreviousPage: boolean;
};

const emptyStats: DashboardStats = {
  totalOrders: 0,
  todaysOrders: 0,
  pendingOrders: 0,
  processingOrders: 0,
  deliveredOrders: 0,
  cancelledOrders: 0,

  totalRevenue: 0,
  todaysRevenue: 0,
  thisMonthRevenue: 0,

  totalPrescriptions: 0,
  pendingPrescriptions: 0,
  approvedPrescriptions: 0,
  rejectedPrescriptions: 0,

  totalProducts: 0,
  lowStockProducts: 0,
  outOfStockProducts: 0,

  totalCustomers: 0,
  newCustomersToday: 0,
};

function normalizePrescriptionData(
  data: PagedResponse<PrescriptionQueueItem> | PrescriptionQueueItem[]
): PrescriptionQueueItem[] {
  return Array.isArray(data) ? data : data.items;
}

export default function DashboardPage() {
  const [stats, setStats] = useState<DashboardStats>(emptyStats);
  const [prescriptions, setPrescriptions] = useState<PrescriptionQueueItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const getDashboardData = async () => {
    try {
      setIsLoading(true);
      setErrorMessage(null);

      const [statsResponse, prescriptionResponse] = await Promise.all([
        api.get<ApiResponse<DashboardStats>>('/dashboard'),
        api.get<ApiResponse<PagedResponse<PrescriptionQueueItem> | PrescriptionQueueItem[]>>(
          '/prescriptions',
          {
            params: {
              status: 'Pending',
              pageNumber: 1,
              pageSize: 5,
            },
          }
        ),
      ]);

      if (statsResponse.data.success && statsResponse.data.data) {
        setStats(statsResponse.data.data);
      }

      if (prescriptionResponse.data.success && prescriptionResponse.data.data) {
        setPrescriptions(normalizePrescriptionData(prescriptionResponse.data.data));
      }
    } catch (error) {
      console.error('Failed to load dashboard:', error);
      setErrorMessage('Failed to load dashboard data. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    getDashboardData();
  }, []);

  if (isLoading) {
    return (
      <div className="flex min-h-[500px] items-center justify-center">
        <div className="flex items-center gap-2 text-sm text-gray-500">
          <Loader2 className="h-5 w-5 animate-spin" />
          Loading dashboard...
        </div>
      </div>
    );
  }

  return (
    <div className="animate-fade-in space-y-8">
      <div className="flex flex-col gap-2">
        <h1 className="text-3xl font-bold tracking-tight text-gray-900">
          Platform Management
        </h1>
        <p className="text-sm text-gray-500">
          Monitor orders, revenue, prescriptions, products, and customer activity.
        </p>
      </div>

      {errorMessage && (
        <div className="flex items-center gap-2 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          <AlertCircle className="h-4 w-4" />
          {errorMessage}
        </div>
      )}

      <DashboardOverview stats={stats} />

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg font-medium">
              <TrendingUp className="h-5 w-5 text-blue-500" />
              Sales Overview
            </CardTitle>
          </CardHeader>

          <CardContent className="space-y-4">
            <div className="flex justify-between rounded-lg bg-gray-50 p-4">
              <span className="text-sm text-gray-500">Today&apos;s Revenue</span>
              <span className="font-semibold text-gray-900">
                {formatCurrency(stats.todaysRevenue)}
              </span>
            </div>

            <div className="flex justify-between rounded-lg bg-gray-50 p-4">
              <span className="text-sm text-gray-500">This Month&apos;s Revenue</span>
              <span className="font-semibold text-gray-900">
                {formatCurrency(stats.thisMonthRevenue)}
              </span>
            </div>

            <div className="flex justify-between rounded-lg bg-gray-50 p-4">
              <span className="text-sm text-gray-500">Total Revenue</span>
              <span className="font-semibold text-gray-900">
                {formatCurrency(stats.totalRevenue)}
              </span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg font-medium">
              <Activity className="h-5 w-5 text-orange-500" />
              Prescription Queue
            </CardTitle>
          </CardHeader>

          <CardContent>
            <PrescriptionQueue initialItems={prescriptions} />
          </CardContent>
        </Card>
      </div>
    </div>
  );
}