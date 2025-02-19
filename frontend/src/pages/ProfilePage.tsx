import { useParams, Link } from 'react-router-dom';
import { dummyProfileResponse, dummySites } from '../lib/utils';
import { Calendar, Award, BarChart3, ArrowLeft } from 'lucide-react';

export function ProfilePage() {
  const { siteId = '', accountId = '' } = useParams();
  const site = dummySites.find(s => s.id === siteId);

  if (!site) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">Site Not Found</h1>
          <p className="text-gray-600 mb-8">
            Sorry, we don't support this platform yet. Check back later!
          </p>
          <Link
            to="/"
            className="inline-flex items-center text-blue-600 hover:text-blue-800"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Home
          </Link>
        </div>
      </div>
    );
  }

  const data = dummyProfileResponse(siteId, accountId);

  if (!data) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="container mx-auto px-4 py-16">
          <div className="max-w-2xl mx-auto text-center">
            <h1 className="text-4xl font-bold text-gray-900 mb-4">
              {site.entityName} Not Found
            </h1>
            <p className="text-gray-600 mb-8">
              Sorry, we couldn't find a {site.entityName.toLowerCase()} with the identifier "{accountId}"
              on {site.name}.
            </p>
            <Link
              to={`/${siteId}`}
              className="inline-flex items-center text-blue-600 hover:text-blue-800"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to {site.name} Rankings
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-16">
        <div className="max-w-4xl mx-auto">
          <Link
            to={`/${siteId}`}
            className="inline-flex items-center text-blue-600 hover:text-blue-800 mb-6"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to {site.name} Rankings
          </Link>

          <div className="bg-white rounded-lg shadow-sm p-8 mb-8">
            <h1 className="text-3xl font-bold mb-6">{data.profile.name}</h1>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
              <div className="bg-gray-50 p-6 rounded-lg">
                <div className="flex items-center">
                  <Award className="h-8 w-8 text-blue-600 mr-3" />
                  <div>
                    <p className="text-sm text-gray-600">H-Index</p>
                    <p className="text-2xl font-bold">{data.profile.hIndex}</p>
                  </div>
                </div>
              </div>
              
              <div className="bg-gray-50 p-6 rounded-lg">
                <div className="flex items-center">
                  <BarChart3 className="h-8 w-8 text-green-600 mr-3" />
                  <div>
                    <p className="text-sm text-gray-600">Total {site.metricName}</p>
                    <p className="text-2xl font-bold">{data.profile.totalMetrics.toLocaleString()}</p>
                  </div>
                </div>
              </div>
            </div>

            <h2 className="text-2xl font-bold mb-4">Top Content</h2>
            <div className="space-y-4">
              {data.profile.topContent.map((item) => (
                <a
                  key={item.id}
                  href={item.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="block bg-gray-50 p-4 rounded-lg hover:bg-gray-100 transition-colors"
                >
                  <h3 className="font-medium text-lg mb-2">{item.title}</h3>
                  <div className="flex items-center text-sm text-gray-600">
                    <span className="flex items-center mr-4">
                      <BarChart3 className="h-4 w-4 mr-1" />
                      {item.metrics.toLocaleString()} {site.metricName}
                    </span>
                    <span className="flex items-center">
                      <Calendar className="h-4 w-4 mr-1" />
                      {new Date(item.date).toLocaleDateString()}
                    </span>
                  </div>
                </a>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}