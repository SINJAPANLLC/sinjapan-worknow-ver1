import { useQuery } from '@tanstack/react-query';
import { jobsAPI, type Job } from '../../lib/api';

export default function JobsPage() {
  const { data, isLoading, error } = useQuery({
    queryKey: ['jobs'],
    queryFn: () => jobsAPI.list({ status: 'published' }),
  });

  if (isLoading) {
    return (
      <div className="p-8">
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-teal-600"></div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-8">
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <p className="text-red-800">エラーが発生しました。後でもう一度お試しください。</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-8">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900">求人一覧</h1>
        <p className="text-gray-600 mt-2">
          {data?.total || 0}件の求人が見つかりました
        </p>
      </div>

      {data?.items.length === 0 ? (
        <div className="bg-white rounded-lg shadow p-12 text-center">
          <p className="text-gray-500 text-lg">現在、公開中の求人はありません。</p>
        </div>
      ) : (
        <div className="grid gap-6">
          {data?.items.map((job: Job) => (
            <div
              key={job.id}
              className="bg-white rounded-lg shadow hover:shadow-lg transition-shadow p-6"
            >
              <div className="flex justify-between items-start mb-4">
                <div className="flex-1">
                  <h2 className="text-xl font-semibold text-gray-900 mb-2">
                    {job.title}
                  </h2>
                  <p className="text-gray-600 line-clamp-2">{job.description}</p>
                </div>
                {job.hourly_rate && (
                  <div className="ml-4 text-right">
                    <p className="text-2xl font-bold text-teal-600">
                      ¥{job.hourly_rate.toLocaleString()}
                    </p>
                    <p className="text-sm text-gray-500">/ 時間</p>
                  </div>
                )}
              </div>

              <div className="flex flex-wrap gap-2 mb-4">
                {job.location && (
                  <span className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-blue-100 text-blue-800">
                    📍 {job.location}
                  </span>
                )}
                {job.employment_type && (
                  <span className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-purple-100 text-purple-800">
                    💼 {job.employment_type}
                  </span>
                )}
                {job.tags.map((tag) => (
                  <span
                    key={tag}
                    className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-gray-100 text-gray-800"
                  >
                    #{tag}
                  </span>
                ))}
              </div>

              <div className="flex justify-between items-center">
                <p className="text-sm text-gray-500">
                  掲載日: {new Date(job.created_at).toLocaleDateString('ja-JP')}
                </p>
                <button className="px-4 py-2 bg-teal-600 hover:bg-teal-700 text-white font-medium rounded-lg transition-colors">
                  詳細を見る
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
