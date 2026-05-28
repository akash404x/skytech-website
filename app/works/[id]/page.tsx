import { doc, getDoc } from 'firebase/firestore';
import { notFound } from 'next/navigation';
import Footer from '@/components/Footer';
import Navbar from '@/components/Navbar';
import { db } from '@/lib/firebase';
import { mapWork } from '@/lib/firestore-mappers';
import { formatDate } from '@/lib/format';
import type { Work } from '@/lib/types';

interface WorkPageProps {
  params: Promise<{ id: string }>;
}

async function getWork(id: string): Promise<Work | null> {
  try {
    const docRef = doc(db, 'works', id);
    const docSnap = await getDoc(docRef);
    
    if (!docSnap.exists()) {
      return null;
    }
    
    const work = mapWork(docSnap.id, docSnap.data());
    
    if (work.status !== 'active') {
      return null;
    }
    
    return work;
  } catch (error) {
    console.error('Error fetching work:', error);
    return null;
  }
}

export async function generateMetadata({ params }: WorkPageProps) {
  const { id } = await params;
  const work = await getWork(id);
  
  if (!work) {
    return {
      title: 'Work Not Found - SkyTech',
    };
  }
  
  return {
    title: `${work.title} - SkyTech Portfolio`,
    description: work.shortDescription,
  };
}

export default async function WorkPage({ params }: WorkPageProps) {
  const { id } = await params;
  const work = await getWork(id);
  
  if (!work) {
    notFound();
  }
  
  return (
    <div className="tech-page flex min-h-screen flex-col">
      <Navbar />
      <main className="flex-1">
        <WorkDetailView work={work} />
      </main>
      <Footer />
    </div>
  );
}

function WorkDetailView({ work }: { work: Work }) {
  return (
    <section className="relative overflow-hidden py-12 md:py-20">
      <div className="work-detail-bg pointer-events-none absolute inset-0" aria-hidden>
        <div className="work-detail-grid absolute inset-0" />
      </div>
      
      <div className="tech-section-backdrop" aria-hidden />
      
      <div className="relative z-[1] mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <span className="mb-2 inline-flex items-center gap-2 rounded-full border border-cyan-500/30 bg-cyan-500/10 px-3 py-1 text-sm font-medium text-cyan-300">
            {work.category}
          </span>
          <h1 className="tech-heading-gradient text-3xl font-bold md:text-4xl lg:text-5xl">
            {work.title}
          </h1>
          <p className="mt-4 text-lg tech-text">{work.shortDescription}</p>
        </div>
        
        {work.thumbnail && (
          <div className="relative mb-8 aspect-video w-full overflow-hidden rounded-2xl border border-white/10 bg-slate-800/50">
            <img
              src={work.thumbnail}
              alt={work.title}
              className="h-full w-full object-cover"
            />
          </div>
        )}
        
        <div className="grid gap-8 lg:grid-cols-3">
          <div className="lg:col-span-2">
            <div className="tech-glass-panel rounded-2xl border border-white/10 p-6 md:p-8">
              <h2 className="mb-4 text-2xl font-bold text-white">Project Overview</h2>
              <p className="whitespace-pre-wrap text-slate-300 leading-relaxed">{work.fullDescription}</p>
              
              {work.technologiesUsed && work.technologiesUsed.length > 0 && (
                <div className="mt-8">
                  <h3 className="mb-4 text-lg font-semibold text-white">Technologies Used</h3>
                  <div className="flex flex-wrap gap-2">
                    {work.technologiesUsed.map((tech) => (
                      <span
                        key={tech}
                        className="rounded-full border border-cyan-500/30 bg-cyan-500/10 px-3 py-1.5 text-sm text-cyan-300"
                      >
                        {tech}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
            
            {work.images && work.images.length > 1 && (
              <div className="mt-8">
                <h2 className="mb-4 text-2xl font-bold text-white">Project Gallery</h2>
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  {work.images.map((image, index) => (
                    <div
                      key={index}
                      className="relative aspect-video overflow-hidden rounded-xl border border-white/10 bg-slate-800/50"
                    >
                      <img
                        src={image}
                        alt={`${work.title} - Image ${index + 1}`}
                        className="h-full w-full object-cover"
                      />
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
          
          <div className="space-y-6">
            <div className="tech-glass-panel rounded-2xl border border-white/10 p-6">
              <h3 className="mb-4 text-lg font-semibold text-white">Project Details</h3>
              
              {work.clientName && (
                <div className="mb-4">
                  <p className="text-sm text-slate-400">Client</p>
                  <p className="font-medium text-white">{work.clientName}</p>
                </div>
              )}
              
              {work.completionDate && (
                <div className="mb-4">
                  <p className="text-sm text-slate-400">Completed</p>
                  <p className="font-medium text-white">{formatDate(work.completionDate)}</p>
                </div>
              )}
              
              <div>
                <p className="text-sm text-slate-400">Category</p>
                <p className="font-medium text-white">{work.category}</p>
              </div>
            </div>
            
            {(work.githubLink || work.liveDemoLink) && (
              <div className="tech-glass-panel rounded-2xl border border-white/10 p-6">
                <h3 className="mb-4 text-lg font-semibold text-white">Links</h3>
                <div className="space-y-3">
                  {work.githubLink && (
                    <a
                      href={work.githubLink}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-2 rounded-lg border border-cyan-500/30 bg-cyan-500/10 px-4 py-3 text-cyan-300 transition hover:bg-cyan-500/20"
                    >
                      <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/>
                      </svg>
                      <span>View on GitHub</span>
                    </a>
                  )}
                  {work.liveDemoLink && (
                    <a
                      href={work.liveDemoLink}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-2 rounded-lg border border-purple-500/30 bg-purple-500/10 px-4 py-3 text-purple-300 transition hover:bg-purple-500/20"
                    >
                      <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                      </svg>
                      <span>Live Demo</span>
                    </a>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
