import { useParams } from 'react-router-dom';
import { DataTable } from '../components/DataTable';
import { SearchBar } from '../components/SearchBar';
import { dummyTopResponse, dummySites } from '../lib/utils';

export function SitePage() {
  const { siteId = '' } = useParams();
  const site = dummySites.find(s => s.id === siteId);
  
  if (!site) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">Site Not Found</h1>
          <p className="text-gray-600">
            Sorry, we don't support this platform yet. Check back later!
          </p>
        </div>
      </div>
    );
  }

  const data = dummyTopResponse(siteId);

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-16">
        <h1 className="text-4xl font-bold text-center mb-2">{site.name} H-Index Rankings</h1>
        <p className="text-center text-gray-600 mb-8 max-w-2xl mx-auto">
          {site.hIndexDescription}
        </p>

        <div className="flex justify-center mb-8">
          <SearchBar
            siteId={siteId}
            placeholder={`Search for a ${site.entityName.toLowerCase()}...`}
          />
        </div>

        <DataTable
          data={data.entries}
          siteId={siteId}
          metricName={site.metricName}
        />
      </div>
    </div>
  );
}