import { useForm, router } from '@inertiajs/react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { ScrollArea } from '@/components/ui/scroll-area';
import AppLayout from '@/layouts/app-layout';
import { Head } from '@inertiajs/react';
import { useEffect, useState, ChangeEvent } from 'react';
import { type BreadcrumbItem } from '@/types';
import { useEditor, EditorContent, BubbleMenu } from '@tiptap/react'
import StarterKit from '@tiptap/starter-kit'
import Underline from '@tiptap/extension-underline'
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import Placeholder from '@tiptap/extension-placeholder'
import TextStyle from '@tiptap/extension-text-style'
import Highlight from '@tiptap/extension-highlight';
import TextAlign from '@tiptap/extension-text-align'
import {
  Save, Plus, Menu, Image as ImageIcon, Trash, Bold,
  Italic,
  Underline as UnderlineIcon,
  AlignLeft,
  AlignCenter,
  AlignRight,
  AlignJustify,
  Eraser,
  RemoveFormatting,
  Highlighter,
  ChevronLeft,
  ChevronRight
} from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogFooter,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import axios from 'axios';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';
import { usePage } from '@inertiajs/react';


type Notebook = {
  id: number;
  title: string;
  color: string;
};

type Note = {
  id: number;
  title: string;
  content: string;
  notebook_id: number;
  created_by: number;
  created_at: string;
  updated_at: string;
};

type Props = {
  notebook: Notebook;
  notes: Note[];
  selectedNote?: Note;
  attachments?: ImagePreview[];
  permission: string;
};

type FormData = {
  title: string;
  content: string;
  notebook_id: number;
};

type Attachment = {
  id: number;
  url: string;
  filename: string;
};

type ImagePreview = {
  id: number;
  url: string;
};

export default function Editor({ notebook, notes, selectedNote, attachments, permission }: Props) {
  const { auth } = usePage().props;
  const userPermission = permission;
  const isViewer = () => !['editor', 'owner'].includes(userPermission?.toLowerCase() || '');
  const [activeNoteId, setActiveNoteId] = useState<number | null>(selectedNote?.id || null);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [unsavedDialogOpen, setUnsavedDialogOpen] = useState(false);
  const [pendingAction, setPendingAction] = useState<(() => void) | null>(null);
  const [confirmDeleteDialogOpen, setConfirmDeleteDialogOpen] = useState(false);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const [currentNote, setCurrentNote] = useState<Note | null>(selectedNote ?? null);
  const [isSaving, setIsSaving] = useState(false);
  const [images, setImages] = useState<ImagePreview[]>(attachments || []);
  const [fullViewImage, setFullViewImage] = useState<string | null>(null);

  const { data, setData, post, put, reset } = useForm<FormData>({
    title: selectedNote?.title || '',
    content: selectedNote?.content || '',
    notebook_id: notebook.id,
  });


  useEffect(() => {
    const fetchAttachments = async () => {
      if (selectedNote?.id) {
        try {
          const response = await axios.get(`/api/notes/${selectedNote.id}/attachments`);
          setImages(response.data);
        } catch (error) {
          console.error('Error fetching attachments:', error);
        }
      } else {
        setImages([]);
      }
    };
    fetchAttachments();
  }, [selectedNote]);

  const [isLoadingAttachments, setIsLoadingAttachments] = useState(false);


  useEffect(() => {
    const fetchAttachments = async () => {
      setIsLoadingAttachments(true);
      try {
        if (selectedNote?.id) {
          const response = await axios.get(`/api/notes/${selectedNote.id}/attachments`);
          setImages(response.data);
        } else {
          setImages([]);
        }
      } catch (error) {
        console.error('Error fetching attachments:', error);
      } finally {
        setIsLoadingAttachments(false);
      }
    };
    fetchAttachments();
  }, [selectedNote]);

  useEffect(() => {
    if (attachments) {
      setImages(attachments);
    }
  }, [attachments]);

  useEffect(() => {
    const isUnsaved =
      data.title !== (currentNote?.title || '') ||
      data.content !== (currentNote?.content || '');
    setHasUnsavedChanges(isUnsaved);
  }, [data.title, data.content, currentNote]);

  const maybeProceed = (action: () => void) => {
    if (hasUnsavedChanges) {
      setPendingAction(() => action);
      setUnsavedDialogOpen(true);
    } else {
      action();
    }
  };

  const switchNote = (note: Note) => {
    setActiveNoteId(note.id);
    setCurrentNote(note);
    setData('title', note.title || '');
    setData('content', note.content || '');
    setImages([]);
    router.visit(
      route('notes.edit', { notebook: notebook.id, note: note.id, t: Date.now() }),
      {
        replace: true,
        preserveState: false,
      }
    );
  };

  const [isDesktopSidebarCollapsed, setIsDesktopSidebarCollapsed] = useState(false);


  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    }).format(date);
  };

  const FormatButton = ({ onClick, active, children }: {
    onClick: () => void;
    active?: boolean;
    children: React.ReactNode;
  }) => (
    <Button
      onMouseDown={e => e.preventDefault()}
      onClick={onClick}
      variant="ghost"
      size="icon"
      className={cn(
        'h-6 w-6 p-1 rounded-none transition-colors',
        active
          ? 'bg-secondary text-secondary-foreground hover:bg-secondary'
          : 'hover:bg-muted'
      )}
    >
      {children}
    </Button>
  )


  const createNewNote = () => {
    setActiveNoteId(null);
    setCurrentNote(null);
    reset();
    setImages([]);
    router.visit(route('notes.editor', { notebook: notebook.id }), {
      replace: true,
      preserveState: false,
    });
  };

  const handleSelectNote = (note: Note) => {
    maybeProceed(() => switchNote(note));
  };

  const handleNewNote = () => {
    maybeProceed(() => createNewNote());
  };



  const handleImageClick = (imgUrl: string) => {
    setFullViewImage(imgUrl);
  };



  const handleSave = (onSuccessCallback?: () => void) => {
    if (isViewer()) {
      toast.error("Viewers cannot save changes");
      return;
    }

    if (isSaving) return;
    setIsSaving(true);

    const successHandler = (response: any) => {
      const serverNote = response.props.note;
      const updatedNote = serverNote ?
        { ...serverNote, updated_at: new Date().toISOString() } :
        currentNote;

      setCurrentNote(updatedNote);
      setHasUnsavedChanges(false);
      setIsSaving(false);

      if (serverNote) {
        setData('title', serverNote.title);
        setData('content', serverNote.content);
      }

      window.dispatchEvent(
        new CustomEvent('note-updated', { detail: { note: updatedNote } })
      );
      onSuccessCallback?.();
    };

    if (activeNoteId) {
      put(route('notes.update', { note: activeNoteId }), {
        onSuccess: successHandler,
        onError: () => setIsSaving(false),
        preserveScroll: true,
      });
    } else {
      post(route('notes.store', { notebook: notebook.id }), {
        onSuccess: successHandler,
        onError: () => setIsSaving(false),
        preserveScroll: true,
      });
    }
  };
  const confirmSaveChanges = () => {
    setUnsavedDialogOpen(false);
    const action = pendingAction;
    setPendingAction(null);
    handleSave(() => {
      action?.();
      setHasUnsavedChanges(false);
    });
  };

  const handleImageSelect = async (e: ChangeEvent<HTMLInputElement>) => {
    if (isViewer()) {
      toast.error("Viewers cannot upload images");
      return;
    }
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      if (!file.type.startsWith('image/')) {
        alert('Only image files are allowed.');
        return;
      }
      if (!activeNoteId) {
        alert('Please save the note before adding images.');
        return;
      }
      const formData = new FormData();
      formData.append('file', file);
      formData.append('note_id', activeNoteId.toString());
      try {
        const response = await axios.post('/notes/attachments', formData, {
          headers: { 'Content-Type': 'multipart/form-data' },
        });
        if (response.data.attachment) {
          setImages((prev) => [...prev, response.data.attachment]);
        }
      } catch (error) {
        console.error('Upload failed:', error);
        alert('Failed to upload image');
      }
    }
  };


  const handleDeleteButtonClick = () => {
    if (!activeNoteId) return;
    setConfirmDeleteDialogOpen(true);
  };

  const handleDeleteNote = async () => {
    if (isViewer()) {
      toast.error("Viewers cannot delete notes");
      return;
    }
    console.log("handleDeleteNote triggered for note id:", activeNoteId);
    try {
      const csrfToken = document.querySelector('meta[name="csrf-token"]')?.getAttribute('content');
      const response = await axios.delete(route('notes.destroy', { note: activeNoteId }), {
        headers: {
          'X-CSRF-TOKEN': csrfToken || '',
        },
      });
      toast.success(response.data.message || 'Note deleted successfully');
      if (response.data.redirect) {
        router.visit(response.data.redirect);
      }
    } catch (error: any) {
      console.error('Deletion error:', error);
      toast.error(error.response?.data?.error || 'Failed to delete the note');
    } finally {
      setConfirmDeleteDialogOpen(false);
    }
  };
  const editor = useEditor({
    extensions: [
      StarterKit,
      Underline,
      TextStyle,
      TextAlign.configure({
        types: ['heading', 'paragraph'],
      }),
      Highlight,
      Placeholder.configure({
        placeholder: 'Write something amazing...',
      }),
    ],
    content: data.content,
    onUpdate: ({ editor }) => {
      setData('content', editor.getHTML());
    },
    editorProps: {
      attributes: {
        class: "prose prose-sm sm:prose lg:prose-lg xl:prose-2xl focus:outline-none",
      },
    },
  });


  const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Notebooks', href: '/notebooks' },
    { title: notebook.title, href: `/notebooks/${notebook.id}` },
    {
      title:
        activeNoteId && !hasUnsavedChanges
          ? data.title || 'Untitled Note'
          : data.title || 'New Note',
      href:
        activeNoteId && !hasUnsavedChanges
          ? `/notebooks/${notebook.id}/notes/${activeNoteId}`
          : `/notebooks/${notebook.id}/notes/`,
    },
  ];



  return (
    <AppLayout breadcrumbs={breadcrumbs}>
      <Head title="Note" />

      <div className="relative flex flex-col md:flex-row h-[calc(100vh-6rem)] gap-4 p-4 overflow-hidden">
        {/* Sidebar */}

        <Button
          onClick={() => setIsSidebarOpen(!isSidebarOpen)}
          className="md:hidden absolute top-4 left-4 z-30"
        >
          <Menu size={20} />
        </Button>
        <div
          className={cn(
            'w-full md:w-48 md:border-r border-border md:pr-4 mb-4 md:mb-0 transition-all duration-300 overflow-hidden',
            isSidebarOpen
              ? 'absolute inset-0 bg-background z-20 p-4 md:relative'
              : 'hidden md:block',
            isDesktopSidebarCollapsed && 'md:w-0 md:border-r-0 md:pr-0'
          )}
        >
          <div
            className="mb-2 p-2 text-foreground rounded-md"
            style={{ backgroundColor: notebook.color }}
          >
            <h2 className="text-xs font-bold text-white/80  line-clamp-1">
              {notebook.title}
            </h2>
          </div>

          <Tabs defaultValue="notes" className="h-[calc(100vh-12rem)] flex flex-col">
            <TabsList className="grid w-full grid-cols-2 h-8">
              <TabsTrigger value="notes" className="text-xs px-2 py-1">Notes</TabsTrigger>
              <TabsTrigger value="images" className="text-xs px-2 py-1">Images</TabsTrigger>
            </TabsList>

            {/* Notes Tab Content */}
            <TabsContent value="notes" className="flex-1 overflow-hidden">
              <ScrollArea className="h-full">
                {notes.map((note) => (
                  <div
                    key={note.id}
                    onClick={() => handleSelectNote(note)}
                    className={cn(
                      'px-2 py-1.5 cursor-pointer rounded text-xs transition-colors',
                      note.id === activeNoteId ? 'bg-accent text-accent-foreground' : ''
                    )}
                  >
                    {note.title || `Note #${note.id}`}
                  </div>
                ))}
              </ScrollArea>

            </TabsContent>

            {/* Images Tab Content */}
            <TabsContent value="images" className="flex-1 overflow-hidden">
              <div className="flex flex-col gap-1.5 h-full">
                <label className={cn(
                  "cursor-pointer flex items-center gap-1 px-1.5 py-1 border rounded hover:bg-muted text-[11px] w-full justify-center",
                  isViewer() && "cursor-not-allowed opacity-50"
                )}>
                  <ImageIcon size={12} />
                  <span>Upload Image</span>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleImageSelect}
                    className="hidden"
                    disabled={isViewer()}
                  />
                </label>
                <ScrollArea className="flex-1">
                  <div className="grid grid-cols-2 gap-1.5 p-1">
                    {isLoadingAttachments ? (
                      <div className="text-[11px] text-muted-foreground col-span-2 text-center">
                        Loading...
                      </div>
                    ) : (
                      images.map((img) => (
                        <img
                          key={img.id}
                          src={img.url}
                          alt="Note Attachment"
                          className="w-full h-20 object-cover rounded cursor-pointer border"
                          onClick={() => handleImageClick(img.url)}
                        />
                      ))
                    )}
                  </div>
                </ScrollArea>
              </div>

            </TabsContent>
          </Tabs>

        </div>


        {/* Editor Section */}
        <div className="flex-1 flex flex-col max-h-[calc(100vh-1rem)] space-y-4">
          <div className="flex w-full justify-between items-center">

            <Button
              onClick={() => setIsDesktopSidebarCollapsed(!isDesktopSidebarCollapsed)}
              variant="ghost"
              size="icon"
              className="hidden md:inline-flex"
            >
              {isDesktopSidebarCollapsed ? (
                <ChevronRight className="h-4 w-4" />
              ) : (
                <ChevronLeft className="h-4 w-4" />
              )}
            </Button>

       
            <div className="flex items-center gap-2">
              {currentNote && (
                <span className="text-xs text-muted-foreground">
                  {formatDate(currentNote.updated_at)}
                </span>
              )}

              <div className="flex items-center gap-1">
                {!isViewer() && (
                  <Button
                    onClick={handleNewNote}
                    variant="secondary"
                    className="ms-1 flex text-xs h-8"
                  >
                    <Plus size={14} className="mr-1" />
                    New
                  </Button>
                )}

                {activeNoteId && !isViewer() && (
                  <Button onClick={handleDeleteButtonClick} variant="ghost">
                    <Trash size={10} />
                  </Button>
                )}

                <Button
                  onClick={() => handleSave()}
                  variant="ghost"
                  disabled={isSaving || isViewer()}
                >
                  <Save size={10} />
                </Button>
              </div>
            </div>
          </div>

          <div className="flex justify-between items-center gap-4 px-8 w-full">
            <input
              type="text"
              placeholder="Title"
              value={data.title}
              onChange={(e) => !isViewer() && setData('title', e.target.value)}
              className="w-full px-4 py-2 text-2xl font-extrabold bg-transparent text-foreground focus:outline-none md:pt-0 pt-12"
              readOnly={isViewer()}
            />
          </div>
          {editor && (
            <BubbleMenu
              editor={editor}
              tippyOptions={{
                duration: [200, 150],
                animation: 'shift-away',
              }}
              className="rounded-md bg-white border p-1 shadow-md transition-all"
            >
              <div className="flex items-center space-x-1 bg-white shadow rounded p-1">
                <FormatButton
                  onClick={() => editor.chain().focus().toggleBold().run()}
                  active={editor.isActive('bold')}
                >
                  <Bold size={16} />
                </FormatButton>

                <FormatButton
                  onClick={() => editor.chain().focus().toggleItalic().run()}
                  active={editor.isActive('italic')}
                >
                  <Italic size={16} />
                </FormatButton>

                <FormatButton
                  onClick={() => editor.chain().focus().toggleUnderline().run()}
                  active={editor.isActive('underline')}
                >
                  <UnderlineIcon size={16} />
                </FormatButton>

                <FormatButton
                  onClick={() => editor?.chain().focus().toggleHighlight().run()}
                  active={editor?.isActive('highlight')}
                >
                  <Highlighter className="w-4 h-4" />
                </FormatButton>
                <FormatButton onClick={() => editor?.chain().focus().clearNodes().unsetAllMarks().run()}>

                  <RemoveFormatting className="h-4 w-4" />
                </FormatButton>




                <FormatButton
                  onClick={() => editor?.chain().focus().setTextAlign('left').run()}
                  active={editor?.isActive({ textAlign: 'left' })}
                >
                  <AlignLeft size={16} />
                </FormatButton>

                <FormatButton
                  onClick={() => editor?.chain().focus().setTextAlign('center').run()}
                  active={editor?.isActive({ textAlign: 'center' })}
                >
                  <AlignCenter size={16} />
                </FormatButton>

                <FormatButton
                  onClick={() => editor?.chain().focus().setTextAlign('right').run()}
                  active={editor?.isActive({ textAlign: 'right' })}
                >
                  <AlignRight size={16} />
                </FormatButton>

                <FormatButton
                  onClick={() => editor?.chain().focus().setTextAlign('justify').run()}
                  active={editor?.isActive({ textAlign: 'justify' })}
                >
                  <AlignJustify size={16} />
                </FormatButton>
              </div>
            </BubbleMenu>
          )}









          <div className="flex-1 overflow-auto">
            <EditorContent
              editor={editor}
              className="h-full outline-none ring-0 leading-loose px-6 max-w-5xl mx-auto focus:outline-none focus:ring-0"
            />
          </div>
        </div>

      </div>


      <Dialog
        open={Boolean(fullViewImage)}
        onOpenChange={(open) => {
          if (!open) setFullViewImage(null);
        }}
      >
        <DialogContent className="max-w-6xl bg-transparent shadow-none border-none p-0 flex items-center justify-center">
          {fullViewImage && (
            <img
              src={fullViewImage}
              alt="Full view"
              className="max-w-full max-h-[90vh] rounded"
            />
          )}
        </DialogContent>
      </Dialog>

      {/* Unsaved Changes Dialog */}
      <Dialog
        open={unsavedDialogOpen}
        onOpenChange={(open) => {
          if (!open) {
            setPendingAction(null);
          }
          setUnsavedDialogOpen(open);
        }}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Unsaved changes</DialogTitle>
            <DialogDescription>
              You have unsaved changes. Save first before leaving?
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="secondary"
              onClick={() => {
                setUnsavedDialogOpen(false);
                if (pendingAction) {
                  pendingAction();
                  setPendingAction(null);
                  setHasUnsavedChanges(false);
                }
              }}
              disabled={isSaving}
            >
              Discard Changes
            </Button>
            <Button onClick={confirmSaveChanges} disabled={isSaving}>
              Save
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Confirm Delete Dialog */}
      <Dialog
        open={confirmDeleteDialogOpen}
        onOpenChange={(open) => setConfirmDeleteDialogOpen(open)}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirm Delete</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete this note? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="secondary" onClick={() => setConfirmDeleteDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleDeleteNote} variant="destructive">
              Confirm
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </AppLayout>
  );
}
