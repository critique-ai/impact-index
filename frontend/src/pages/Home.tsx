import Link from 'next/link';
import { AnimatedTitle } from '../components/AnimatedTitle';
import { dummySites } from '../lib/utils';
import { ArrowRight } from 'lucide-react';

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white">
      <div className="container mx-auto px-4 py-16">
        <AnimatedTitle />
        
        <div className="mt-12 max-w-2xl mx-auto text-center">
          <p className="text-xl text-gray-600 mb-8">
            Discover the impact and reach of content creators across different platforms
            through the lens of the H-index metric - a powerful measure of both quality and quantity.
          </p>
          
          <div className="grid gap-8 mt-12">
            {dummySites.map((site) => (
              <Link
                key={site.id}
                href={`/${site.id}`}
                className="block p-6 bg-white rounded-lg border border-gray-200 shadow-sm hover:shadow-md transition-shadow"
              >
                <div className="flex justify-between items-center">
                  <div>
                    <h2 className="text-2xl font-bold text-gray-900">{site.name}</h2>
                    <p className="mt-2 text-gray-600">{site.description}</p>
                  </div>
                  <ArrowRight className="h-6 w-6 text-gray-400" />
                </div>
              </Link>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}