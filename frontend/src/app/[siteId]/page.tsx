import { DataTable } from '@/components/DataTable';
import { SearchBar } from '@/components/SearchBar';
import { dummyTopResponse, dummySites } from '@/lib/utils';
import { notFound } from 'next/navigation';

export default function SitePage({
  params: { siteId },
}: {
  params: { siteId: string };
}) {
  const site = dummySites.find(s => s.id === siteId);
  
  if (!site) {
    notFound();
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