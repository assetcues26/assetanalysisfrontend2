import { useState, useEffect, useMemo } from 'react';

import { useNavigate } from 'react-router-dom';

import { motion } from 'framer-motion';

import { PackageOpen, SearchX } from 'lucide-react';

import { AuroraPageLayout } from '../components/layout/AuroraPageLayout';

import { PageWrapper } from '../components/layout/PageWrapper';

import { Badge } from '../components/ui/Badge';

import { Button } from '@/components/ui/button';

import { HistoryGrid } from '../components/history/HistoryGrid';

import { HistorySearch } from '../components/history/HistorySearch';

import { useHistory } from '../hooks/useHistory';



const TABS = ['Browse', 'Search', 'Recent'];



export function HistoryPage() {

  const navigate = useNavigate();

  const { history, deleteEntry, searchEntries, historyCount } = useHistory();

  const [activeTab, setActiveTab] = useState('Browse');

  const [searchQuery, setSearchQuery] = useState('');

  const [debouncedQuery, setDebouncedQuery] = useState('');



  useEffect(() => {

    const t = setTimeout(() => setDebouncedQuery(searchQuery), 300);

    return () => clearTimeout(t);

  }, [searchQuery]);



  const sortedHistory = useMemo(

    () => [...history].sort((a, b) => new Date(b.processedAt) - new Date(a.processedAt)),

    [history],

  );



  const filtered = useMemo(() => {

    if (activeTab !== 'Search') return sortedHistory;

    return searchEntries(debouncedQuery);

  }, [activeTab, sortedHistory, searchEntries, debouncedQuery]);



  const recentEntries = sortedHistory.slice(0, 5);



  return (

    <AuroraPageLayout>

      <PageWrapper className="py-6 sm:py-8">

        <section className="pb-8">

          <div className="mb-5 flex flex-col gap-2 sm:mb-6 sm:flex-row sm:flex-wrap sm:items-center sm:justify-between sm:gap-4">

            <h1 className="text-xl font-bold text-gray-900 sm:text-3xl">Asset History</h1>

            <Badge variant="count" className="w-fit">

              {historyCount} items

            </Badge>

          </div>



          <div className="-mx-1 mb-6 flex gap-1 overflow-x-auto border-b border-gray-200/80 px-1 pb-px scrollbar-thin">

            {TABS.map((tab) => (

              <button

                key={tab}

                type="button"

                onClick={() => setActiveTab(tab)}

                className={`relative shrink-0 touch-manipulation whitespace-nowrap px-4 py-3 text-sm font-medium transition-colors duration-200 ${

                  activeTab === tab ? 'text-gray-900' : 'text-gray-500 active:text-gray-700'

                }`}

              >

                {tab}

                {activeTab === tab && (

                  <motion.span

                    layoutId="history-page-tab-underline"

                    className="absolute bottom-0 left-0 right-0 h-0.5 bg-gradient-to-r from-blue-500 to-indigo-500"

                  />

                )}

              </button>

            ))}

          </div>



          {activeTab === 'Search' && (

            <div className="mb-6">

              <HistorySearch value={searchQuery} onChange={setSearchQuery} />

            </div>

          )}



          {historyCount === 0 ? (

            <div className="flex flex-col items-center gap-4 rounded-2xl border border-dashed border-gray-200/80 bg-white/60 px-4 py-14 text-center backdrop-blur-sm sm:py-16">

              <PackageOpen size={48} className="text-gray-600" />

              <p className="text-gray-600">No assets scanned yet</p>

              <Button className="w-full max-w-xs sm:w-auto" onClick={() => navigate('/capture')}>

                Start Your First Scan

              </Button>

            </div>

          ) : activeTab === 'Browse' ? (

            <HistoryGrid entries={sortedHistory} onDelete={deleteEntry} />

          ) : activeTab === 'Search' ? (

            filtered.length === 0 ? (

              <div className="flex flex-col items-center gap-3 px-2 py-12 text-gray-500">

                <SearchX size={40} />

                <p className="text-center text-sm">No results found for your search</p>

              </div>

            ) : (

              <HistoryGrid entries={filtered} onDelete={deleteEntry} />

            )

          ) : (

            <HistoryGrid entries={recentEntries} onDelete={deleteEntry} />

          )}

        </section>

      </PageWrapper>

    </AuroraPageLayout>

  );

}

