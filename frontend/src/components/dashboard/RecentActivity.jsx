import StatusBadge from '../common/StatusBadge';
import { formatRelativeTime } from '../../utils/formatters';

export default function RecentActivity({ activities }) {
  return (
    <div className="bg-white rounded shadow p-6">
      <h3 className="text-lg font-semibold text-gray-800 mb-4">Recent Activity</h3>
      <div className="space-y-3">
        {activities.map((activity) => (
          <div key={activity.id} className="flex items-center justify-between py-2 border-b last:border-b-0">
            <div className="flex-1">
              <p className="text-sm font-medium text-gray-800">{activity.citizenName}</p>
              <p className="text-xs text-gray-500">{activity.schemeName}</p>
            </div>
            <div className="flex items-center gap-3">
              <StatusBadge status={activity.status} />
              <span className="text-xs text-gray-400">{formatRelativeTime(activity.updatedAt)}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
