import AppLayout from '@/layouts/app-layout';
import { Head, usePage, router, useForm } from '@inertiajs/react';
import {
  Dialog, DialogContent, DialogDescription, DialogHeader,
  DialogTitle, DialogTrigger, DialogFooter
} from "@/components/ui/dialog";
import {
  Select, SelectContent, SelectItem,
  SelectTrigger, SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "sonner";
import { useEffect, useState } from 'react';
import type { User, Notebook } from '@/types';
import { Textarea } from "@/components/ui/textarea";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
} from "@/components/ui/dropdown-menu";
import { MoreHorizontal, Trash2, UserRoundPlus, Plus, Pencil } from "lucide-react";
import { ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar'
import { Link } from '@inertiajs/react'
import { Label } from "@/components/ui/label";



export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

const Show = () => {
  const { props } = usePage<{ notebook: Notebook; users: User[]; auth: { user: User } }>();
  const notebook = props.notebook;
  const [isEditDialogOpen, setEditDialogOpen] = useState(false);
  const { data, setData, put } = useForm({
    title: notebook.title,
    description: notebook.description,
    color: notebook.color,
    is_public: notebook.is_public
  });
  const [openShareDialog, setOpenShareDialog] = useState(false);
  const [openDeleteDialog, setOpenDeleteDialog] = useState(false);
  const [selectedNotebook, setSelectedNotebook] = useState<Notebook>(notebook);
  const [searchTerm, setSearchTerm] = useState('');
  const [searchResults, setSearchResults] = useState<User[]>([]);


  const canCreateNote = selectedNotebook?.users?.some(
    (user) => user.id === props.auth.user.id && (user.pivot?.permission === 'owner' || user.pivot?.permission === 'editor')
  );


  useEffect(() => {
    if (searchTerm.trim() === '') {
      setSearchResults([]);
      return;
    }



    const delay = setTimeout(() => {
      fetch(`/users/search?query=${encodeURIComponent(searchTerm)}`)
        .then((res) => res.json())
        .then((data) => setSearchResults(data.users))
        .catch((err) => console.error(err));
    }, 300);

    return () => clearTimeout(delay);
  }, [searchTerm]);

  const handleShare = (user: User, permission: string, notebookId: number) => {
    if (!selectedNotebook) {
      toast.error("No notebook selected.");
      return;
    }


    if (
      selectedNotebook.permission !== 'owner' &&
      selectedNotebook.permission !== 'editor'
    ) {
      toast.error("You don't have permission to share this notebook.");
      return;
    }

    if (permission === 'remove') {
      handleRemove(user.id, notebookId);
      return;
    }

    const typedPermission = permission as 'viewer' | 'editor' | 'owner';
    const userPermission = user.pivot?.permission;

    router.post(
      route('notebooks.share', { notebook: notebookId }),
      { user_id: user.id, permission: typedPermission },
      {
        preserveScroll: true,
        onSuccess: () => {
          toast.success(`User ${user.name} updated to ${typedPermission}.`);

          setSelectedNotebook((prev) => {
            if (!prev) return prev;

            const isExisting = prev.users.some((u) => u.id === user.id);
            let updatedUsers = [...prev.users];

            if (isExisting) {
              updatedUsers = updatedUsers.map((u) =>
                u.id === user.id ? { ...u, pivot: { ...u.pivot, permission: typedPermission } } : u
              );
            } else {
              updatedUsers.push({
                ...user,
                pivot: { permission: typedPermission },
              });
            }

            return { ...prev, users: updatedUsers };
          });
        },
        onError: () => toast.error('Failed to update user permissions.'),
      }
    );
  };
  const handleRemove = (userId: number, notebookId: number) => {
    router.post(
      route('notebooks.share', { notebook: notebookId }),
      { user_id: userId, permission: 'remove' },
      {
        preserveScroll: true,
        onSuccess: () => {
          toast.success('User removed successfully.');
          setSelectedNotebook((prev) => {
            if (!prev) return prev;
            const updatedUsers = prev.users.filter((u) => u.id !== userId);
            return { ...prev, users: updatedUsers };
          });
        },
        onError: () => toast.error('Failed to remove collaborator.'),
      }
    );
  };
  const handleEdit = () => {
    put(route('notebooks.update', { notebook: notebook.id }), {
      onSuccess: () => setEditDialogOpen(false),
      preserveState: true,
    });
  };

  const handleDelete = () => {
    if (!selectedNotebook) {
      toast.error("No notebook selected for deletion.");
      return;
    }


    if (
      selectedNotebook.permission !== 'owner' &&
      selectedNotebook.permission !== 'editor'
    ) {
      toast.error("You don't have permission to delete this notebook.");
      return;
    }

    router.delete(route('notebooks.destroy', selectedNotebook.id), {
      onSuccess: () => {
        toast.success(`Notebook "${selectedNotebook.title}" deleted.`);
      },
      onError: () => {
        toast.error("Failed to delete notebook.");
      },
    });
  };

  const handleCreateNote = () => {
    console.log("canCreateNote =", canCreateNote);


    const url = route('notes.editor', { notebook: notebook.id });
    console.log("Navigating to:", url);
    router.visit(url);
  };




  return (
    <AppLayout breadcrumbs={[{ title: 'Notebooks', href: '/notebooks' }, { title: notebook.title, href: `/notebooks/${notebook.id}` }]}>
      <Head title={notebook.title} />

      <div className="container mx-auto max-w-5xl px-4 py-8 space-y-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold mb-4 md:mb-0" >{notebook.title}</h1>
            <div className="flex items-center gap-3 mt-1 text-sm text-gray-500">
              <span>
                Notebook Created by: {notebook.creator.name} &middot; {new Date().toLocaleDateString()}
              </span>
              <div className="flex items-center -space-x-2">
                {notebook.users.slice(0, 5).map((user, index) => (
                  <Avatar
                    key={user.id}
                    className="w-6 h-6 shadow-sm"
                    style={{ zIndex: 10 - index }}
                  >
                    {user.avatar ? (
                      <AvatarImage src={user.avatar} alt={user.name} />
                    ) : (
                      <AvatarFallback className="text-[10px]">
                        {user.name
                          .split(' ')
                          .map((n) => n[0])
                          .join('')
                          .toUpperCase()
                          .slice(0, 2)}
                      </AvatarFallback>
                    )}
                  </Avatar>
                ))}
                {notebook.users.length > 5 && (
                  <div className="w-6 h-6 rounded-full bg-gray-200 text-[10px] text-center leading-6 font-medium shadow-sm z-0">
                    +{notebook.users.length - 5}
                  </div>
                )}
              </div>

            </div>

            <p>
              Description:  {notebook.description}
            </p>
            <p className="mt-2 text-sm text-muted-foreground">
              <strong>You {' '}
                {notebook.permission === 'owner'
                  ? 'are the Owner'
                  : notebook.permission === 'editor'
                    ? 'can Edit'
                    : notebook.permission === 'viewer'
                      ? 'can View'
                      : 'No Access'}</strong>
            </p>

          </div>

          <div className="flex gap-2">



            {(notebook.permission === 'owner' || notebook.permission === 'editor') && (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon" className="rounded-full">
                    <MoreHorizontal className="h-5 w-5" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem onSelect={() => setOpenShareDialog(true)}>
                    <UserRoundPlus className="h-5 w-5 mr-2" />
                    Share
                  </DropdownMenuItem>
                  <DropdownMenuItem onSelect={() => setEditDialogOpen(true)}>
                    <Pencil className="h-5 w-5 mr-2" />
                    Edit
                  </DropdownMenuItem>


                  {notebook.permission === 'owner' && (
                    <DropdownMenuItem onSelect={() => setOpenDeleteDialog(true)}>
                      <Trash2 className="h-5 w-5 mr-2" />
                      Delete
                    </DropdownMenuItem>
                  )}
                </DropdownMenuContent>
              </DropdownMenu>
            )}


            {canCreateNote && (
              <Button
                onClick={handleCreateNote}
                className="rounded-full p-5 hover:opacity-80 transition-all"
                style={{
                  backgroundColor: notebook.color,
                  color: notebook.color
                }}
              >
                <Plus className="h-7 w-7" />
              </Button>
            )}




            {/* Share Dialog */}
            <Dialog open={openShareDialog} onOpenChange={setOpenShareDialog}>
              <DialogContent className="w-96">
                <DialogHeader>
                  <DialogTitle>Share Notebook</DialogTitle>

                  <DialogDescription>
                    Add or remove collaborators for this notebook.
                    <div className="flex justify-center">

                    </div>
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-4">

                  <div className="space-y-4">
                    <Input
                      placeholder="Search users…"
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                    />



                    {/* Collaborators */}
                    {selectedNotebook.users.length > 0 && (
                      <div className="space-y-2 pt-2">
                        <p className="text-sm font-medium">People with Access</p>
                        {selectedNotebook.users.map((user) => (
                          <div key={user.id} className="flex items-center justify-between">
                            <div className="text-sm">
                              <p className="font-medium text-gray-800">{user.name}</p>
                              <p className="text-xs text-gray-500">{user.email}</p>
                            </div>
                            {user.pivot?.permission === 'owner' ? (
                              <span className="text-sm font-medium">Owner</span>
                            ) : (
                              <Select
                                value={user.pivot?.permission || 'viewer'}
                                onValueChange={(value) => handleShare(user, value, selectedNotebook.id)}
                              >
                                <SelectTrigger className="w-[130px]">
                                  <SelectValue placeholder="Permission" />
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="viewer">Can view</SelectItem>
                                  <SelectItem value="editor">Can edit</SelectItem>
                                  <SelectItem value="remove">Remove</SelectItem>
                                </SelectContent>
                              </Select>
                            )}
                          </div>
                        ))}
                      </div>
                    )}

                    {/* Search Results */}
                    {searchTerm.trim() !== '' && (
                      <div className="space-y-2 pt-4">
                        <p className="text-sm font-medium">Search Results</p>
                        {searchResults.length > 0 ? (
                          searchResults.map((user) => (
                            <div
                              key={user.id}
                              className="flex items-center justify-between"
                            >
                              <div>
                                <p className="font-medium text-sm text-gray-800">{user.name}</p>
                                <p className="text-xs text-gray-500">{user.email}</p>
                              </div>
                              <Select
                                onValueChange={(value) =>
                                  handleShare(user, value, selectedNotebook.id)
                                }
                              >
                                <SelectTrigger className="w-[130px]">
                                  <SelectValue placeholder="Permission" />
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="viewer">Can view</SelectItem>
                                  <SelectItem value="editor">Can edit</SelectItem>
                                </SelectContent>
                              </Select>
                            </div>
                          ))
                        ) : (
                          <p className="text-gray-500 text-sm">No users found.</p>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              </DialogContent>
            </Dialog>

            <Dialog open={isEditDialogOpen} onOpenChange={setEditDialogOpen}>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Edit Notebook</DialogTitle>
                  <DialogDescription>Update notebook details.</DialogDescription>
                </DialogHeader>

                <div className="mt-2 space-y-4">
                  <Input
                    value={data.title}
                    onChange={(e) => setData('title', e.target.value)}
                    placeholder="Notebook Title"
                    className="w-full"
                  />

                  {/* Replace the existing color input with this */}
                  <div className="space-y-2">
                    <Label htmlFor="color" className="block">Color</Label>
                    <div className="flex flex-wrap gap-3">
                      {[
                        "#000000", "#ef4444", "#f43f5e", "#f97316",
                        "#22c55e", "#3b82f6", "#eab308", "#8b5cf6"
                      ].map((color) => (
                        <label
                          key={color}
                          className="relative w-8 h-8 rounded-full cursor-pointer border-2 transition-all"
                          style={{
                            backgroundColor: color,
                            borderColor: data.color === color ? "black" : "transparent",
                          }}
                        >
                          <input
                            type="radio"
                            name="edit-color"
                            value={color}
                            className="sr-only"
                            checked={data.color === color}
                            onChange={() => setData('color', color)}
                          />
                        </label>
                      ))}
                      <label className="relative w-8 h-8 rounded-full border-2 border-dashed border-muted-foreground cursor-pointer flex items-center justify-center">
                        <input
                          type="color"
                          value={data.color}
                          onChange={(e) => setData('color', e.target.value)}
                          className="absolute opacity-0 w-full h-full cursor-pointer"
                        />
                        <div
                          className="w-5 h-5 rounded-full"
                          style={{ backgroundColor: data.color }}
                        />
                      </label>
                    </div>
                  </div>

                  <Textarea
                    value={data.description}
                    onChange={(e) => setData('description', e.target.value)}
                    placeholder="Notebook Description"
                    className="w-full"
                  />

                  <div className="flex items-center space-x-2">
                    <input
                      id="is_public"
                      type="checkbox"
                      checked={data.is_public}
                      onChange={(e) => setData('is_public', e.target.checked)}
                      className="h-4 w-4 text-blue-600 border-gray-300 rounded"
                    />
                    <label htmlFor="is_public" className="text-sm">
                      Public Notebook
                    </label>
                  </div>
                </div>

                <DialogFooter>
                  <Button variant="secondary" onClick={() => setEditDialogOpen(false)}>
                    Cancel
                  </Button>
                  <Button onClick={handleEdit} disabled={!data.title.trim()}>
                    Save
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>

            {/* Delete Dialog */}
            <Dialog open={openDeleteDialog} onOpenChange={setOpenDeleteDialog}>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Delete this Notebook? <div className="flex justify-center">

                  </div></DialogTitle>

                  <DialogDescription>This will <span className="font-bold">permanently delete</span> the notebook alongside the notes stored inside. This action cannot be <span className="font-bold">undone</span>. Are you really really absolutely skibidi sure?

                  </DialogDescription>
                </DialogHeader>
                <div className="flex justify-end">
                  <Button variant="destructive" onClick={handleDelete}>
                    Confirm Delete
                  </Button>
                </div>
              </DialogContent>
            </Dialog>

          </div>
        </div>





        {notebook.notes.length > 0 ? (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 mt-6">
            {[...notebook.notes]
              .sort((a, b) => new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime())
              .map((note) => (
                <Link
                  key={note.id}
                  href={`/notebooks/${note.notebook_id}/notes/${note.id}`}
                  className="block hover:no-underline"
                >
                  <Card className="hover:shadow-md transition-shadow duration-200 h-full">
                    <CardHeader className="pb-2">
                      <CardTitle className="text-base font-semibold truncate">
                        <div className="text-xs text-gray-500">
                          <p>{new Date(note.updated_at).toLocaleDateString()}</p>
                        </div>
                        {note.title || 'Untitled Note'}
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="">
                      <p className="text-sm text-muted-foreground line-clamp-3">
                        {note.content || 'No content available.'}
                      </p>
                    </CardContent>
                  </Card>

                </Link>
              ))}
          </div>
        ) : (
          <p className="text-sm flex flex-col justify-center items-center text-muted-foreground mt-6">
            This notebook is empty. Start writing notes!
            <div className="flex justify-center mt-4">

            </div>
          </p>
        )}



      </div>
    </AppLayout>
  );
};

export default Show;
