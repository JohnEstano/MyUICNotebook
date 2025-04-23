import { useState, useEffect } from 'react';
import { PlaceholderPattern } from '@/components/ui/placeholder-pattern';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Head, usePage, Link } from '@inertiajs/react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { ArrowRight } from 'lucide-react';

const breadcrumbs: BreadcrumbItem[] = [
  { title: 'Dashboard', href: '/dashboard' },
];

interface Note {
  id: number;
  title: string;
  content: string;
  modified_at: string;
  notebook_id: number;
  notebook?: {
    title: string;
    color: string;
  };
  creator?: {
    name: string;
  };
}

export default function Dashboard() {
  const { auth, latestNote, publicNotes } = usePage().props as unknown as {
    auth: { user: { name: string } };
    latestNote: Note | null;
    publicNotes: Note[];
  };

  const [note, setNote] = useState<Note | null>(latestNote);

  useEffect(() => {
    const handleNoteUpdated = (event: CustomEvent<{ note: Note }>) => {
      setNote(event.detail.note);
    };
    window.addEventListener('note-updated', handleNoteUpdated as EventListener);
    return () => {
      window.removeEventListener('note-updated', handleNoteUpdated as EventListener);
    };
  }, []);

  return (
    <AppLayout breadcrumbs={breadcrumbs}>
      <Head title="Dashboard" />
      <div className="flex h-full flex-1 flex-col gap-4 rounded-xl p-4">

        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-2">
          <div>
            <h2 className="text-2xl font-bold">Hello, {auth.user.name}</h2>
            <p className="text-muted-foreground">Welcome to MyUIC Notebook!</p>
          </div>
        </div>

  
        <div className="grid auto-rows-min gap-4 md:grid-cols-3">
          <div className="border-sidebar-border/70 dark:border-sidebar-border relative aspect-video overflow-hidden rounded-xl border p-4 transition hover:shadow-lg">
            {note ? (
              <Link
                href={`/notebooks/${note.notebook_id}/notes/${note.id}`}
                className="relative z-10 flex h-full flex-col justify-between group"
              >
                <div>
                  <h2 className="text-sm font-semibold mb-3">Continue writing...</h2>
                  {note.notebook && (
                    <span
                      className="text-xs font-medium text-white/80 px-2 py-1 rounded-md inline-block max-w-max mb-2"
                      style={{ backgroundColor: note.notebook.color || '#000' }}
                    >
                      {note.notebook.title || 'Untitled Notebook'}
                    </span>
                  )}
                  <h2 className="text-lg font-semibold mb-1">{note.title || 'Untitled'}</h2>
                  <p className="line-clamp-3 text-sm text-muted-foreground">{note.content}</p>
                </div>
                <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
                  <ArrowRight className="w-4 h-4 text-muted-foreground group-hover:text-primary" />
                </div>
              </Link>
            ) : (
              <PlaceholderPattern className="absolute inset-0 size-full stroke-neutral-900/20 dark:stroke-neutral-100/20" />
            )}
          </div>
          <div className="border-sidebar-border/70 dark:border-sidebar-border relative aspect-video overflow-hidden rounded-xl border">
            <PlaceholderPattern className="absolute inset-0 size-full stroke-neutral-900/20 dark:stroke-neutral-100/20" />
          </div>
          <div className="border-sidebar-border/70 dark:border-sidebar-border relative aspect-video overflow-hidden rounded-xl border">
            <PlaceholderPattern className="absolute inset-0 size-full stroke-neutral-900/20 dark:stroke-neutral-100/20" />
          </div>
        </div>

        <div className="mt-8">
          <h3 className="text-xl font-semibold mb-4">Feed</h3>
          <div className="flex flex-col gap-4">
            {publicNotes.length > 0 ? (
              publicNotes.map((pub) => {
                const date = new Date(pub.modified_at).toLocaleDateString(undefined, { month: 'numeric', day: 'numeric' });
                return (
                  <Link
                    key={pub.id}
                    href={`/notebooks/${pub.notebook_id}/notes/${pub.id}`}
                    className="block w-full md:w-[70%]"
                  >
                    <Card className="hover:shadow-lg transition">
                      <CardHeader>
                        <div className="flex items-center space-x-2">
                          {pub.notebook && (
                            <span
                              className="text-xs font-medium text-white/80 px-2 py-1 rounded-md inline-block max-w-max"
                              style={{ backgroundColor: pub.notebook.color || '#000' }}
                            >
                              {pub.notebook.title}
                            </span>
                          )}
                          {pub.creator && (
                            <span className="text-xs text-muted-foreground truncate">
                              by {pub.creator.name}
                            </span>
                          )}
                           <p className="text-xs text-bold text-muted-foreground">{date}</p>
                        </div>
                        <CardTitle className="text-sm font-medium truncate mt-2">
                          {pub.title || 'Untitled'}
                        </CardTitle>
                       
                      </CardHeader>
                      <CardContent>
                        <p className="text-sm text-muted-foreground line-clamp-3">
                          {pub.content}
                        </p>
                      </CardContent>
                    </Card>
                  </Link>
                );
              })
            ) : (
              <p className="text-muted-foreground">No public notes available.</p>
            )}
          </div>
        </div>
      </div>
    </AppLayout>
  );
}
