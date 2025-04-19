import { PlaceholderPattern } from '@/components/ui/placeholder-pattern';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Head, usePage } from '@inertiajs/react';
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"

import {
    Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { useEffect, useMemo, useState } from 'react';
import {
    Dialog, DialogContent, DialogDescription, DialogHeader,
    DialogTitle, DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { router } from '@inertiajs/react';
import { Plus, Share2, Copy, Trash2, UserRoundPlus, MoreHorizontal, Check } from "lucide-react";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import {
    Card,
    CardContent,
    CardDescription,
    CardFooter,
    CardHeader,
    CardTitle,
} from "@/components/ui/card"


const sortLabels: Record<SortOption, string> = {
    recent: "Most Recent",
    oldest: "Oldest",
    az: "Title A-Z",
    za: "Title Z-A",
};

const BREADCRUMBS: BreadcrumbItem[] = [
    { title: 'Notebooks', href: '/notebooks' },
];

const MAX_TABLE_HEIGHT = 'calc(100vh - 240px)';
const LOADING_TIMEOUT = 500;

interface Notebook {
    id: number;
    title: string;
    description?: string;
    color: string;
    created_by: number;
    creator: {
        id: number;
        name: string;
    } | null;

    users?: Collaborator[];
    is_public: boolean;
}

interface Collaborator {
    id: number;
    name: string;
    email: string;
    avatar?: string;
    pivot: { permission: string };
}

interface User {
    id: number;
    name: string;
    email: string;
    avatar?: string;
}

interface PageProps {
    notebooks: Notebook[];
    auth: { user: { id: number } };
}

type SortOption = 'recent' | 'oldest' | 'az' | 'za';

export default function Index() {
    const { notebooks, auth } = usePage().props as unknown as PageProps;
    const currentUserId = auth.user.id;

    const [sortOption, setSortOption] = useState<SortOption>('recent');
    const [isLoading, setIsLoading] = useState(true);
    const [selectedNotebook, setSelectedNotebook] = useState<Notebook | null>(null);
    const [notebookList, setNotebookList] = useState<Notebook[]>(notebooks);
    const [newTitle, setNewTitle] = useState('');
    const [newDescription, setNewDescription] = useState('');
    const [newColor, setNewColor] = useState('#38b000');
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [isCreating, setIsCreating] = useState(false);
    const [newIsPublic, setNewIsPublic] = useState(false);

    const [searchTerm, setSearchTerm] = useState('');
    const [searchResults, setSearchResults] = useState<User[]>([]);


    const myNotebooks = notebookList.filter(nb => nb.created_by === currentUserId);
    const sharedNotebooks = notebookList.filter(nb => nb.created_by !== currentUserId);

    useEffect(() => {
        setNotebookList(notebooks);
    }, [notebooks]);

    useEffect(() => {
        const timer = setTimeout(() => setIsLoading(false), LOADING_TIMEOUT);
        return () => clearTimeout(timer);
    }, []);


    useEffect(() => {
        if (searchTerm.trim() === '') {
            setSearchResults([]);
            return;
        }
        const timeoutId = setTimeout(() => {
            fetch(route('users.search') + `?query=${encodeURIComponent(searchTerm)}`, {
                headers: { 'Accept': 'application/json' },
            })
                .then(response => response.json())
                .then(data => {
                    setSearchResults(data.users);
                })
                .catch(() => {
                    toast.error("User search failed.");
                });
        }, 300);
        return () => clearTimeout(timeoutId);
    }, [searchTerm]);


    const handleShare = (user: User, permission: string, notebookId: number) => {
        router.post(route('notebooks.share', notebookId), { user_id: user.id, permission }, {
            onSuccess: () => {
                if (permission === 'remove') {
                    handleRemove(user.id, notebookId);
                    return;
                } else {
                    toast.success("User permission updated.");
                    if (selectedNotebook) {
                        let updatedUsers = selectedNotebook.users ? [...selectedNotebook.users] : [];
                        const existingIndex = updatedUsers.findIndex(u => u.id === user.id);
                        if (existingIndex >= 0) {
                            updatedUsers[existingIndex].pivot.permission = permission;
                        } else {
                            updatedUsers.push({ ...user, pivot: { permission } });
                        }
                        const updatedNotebook = { ...selectedNotebook, users: updatedUsers };
                        setSelectedNotebook(updatedNotebook);
                        setNotebookList(notebookList.map(nb =>
                            nb.id === updatedNotebook.id ? updatedNotebook : nb
                        ));
                    }
                }
                setSearchTerm('');
                setSearchResults([]);
            },
            onError: () => {
                toast.error("Failed to update collaborator.");
            },
        });
    };


    const handleRemove = (userId: number, notebookId: number) => {
        router.post(route('notebooks.share', notebookId), { user_id: userId, permission: 'remove' }, {
            onSuccess: () => {
                toast.success("User removed successfully.");
                if (selectedNotebook) {
                    const updatedUsers = selectedNotebook.users?.filter(u => u.id !== userId) || [];
                    const updatedNotebook = { ...selectedNotebook, users: updatedUsers };
                    setSelectedNotebook(updatedNotebook);
                    setNotebookList(notebookList.map(nb =>
                        nb.id === updatedNotebook.id ? updatedNotebook : nb
                    ));
                }
            },
            onError: () => {
                toast.error("Failed to remove collaborator.");
            },
        });
    };


    const sortedMyNotebooks = useMemo(() => {
        const sorted = [...myNotebooks];
        switch (sortOption) {
            case 'recent': return sorted.sort((a, b) => b.id - a.id);
            case 'oldest': return sorted.sort((a, b) => a.id - b.id);
            case 'az': return sorted.sort((a, b) => a.title.localeCompare(b.title));
            case 'za': return sorted.sort((a, b) => b.title.localeCompare(a.title));
            default: return sorted;
        }
    }, [sortOption, myNotebooks]);

    const sortedSharedNotebooks = useMemo(() => {
        const sorted = [...sharedNotebooks];
        switch (sortOption) {
            case 'recent': return sorted.sort((a, b) => b.id - a.id);
            case 'oldest': return sorted.sort((a, b) => a.id - b.id);
            case 'az': return sorted.sort((a, b) => a.title.localeCompare(b.title));
            case 'za': return sorted.sort((a, b) => b.title.localeCompare(a.title));
            default: return sorted;
        }
    }, [sortOption, sharedNotebooks]);

    const handleDelete = () => {
        if (!selectedNotebook) {
            toast.error("No notebook selected for deletion.");
            return;
        }
        router.delete(route('notebooks.destroy', selectedNotebook.id), {
            onSuccess: () => {
                setNotebookList(prev => prev.filter(n => n.id !== selectedNotebook.id));
                toast.success(`Notebook "${selectedNotebook.title}" deleted.`);
                setSelectedNotebook(null);
            },
            onError: () => {
                toast.error("Failed to delete notebook.");
            },
        });
    };

    const handleCreate = () => {
        if (isCreating) return;
        if (newTitle.trim() === '') {
            toast.error("Title is required.");
            return;
        }
        setIsCreating(true);
        router.post('/notebooks', {
            title: newTitle,
            description: newDescription,
            color: newColor,
            is_public: newIsPublic,
        }, {
            preserveScroll: true,
            onSuccess: () => {
                toast.success("Notebook created!");
                setIsDialogOpen(false);
                setNewTitle('');
                setNewDescription('');
                setNewColor('#22c55e');
                setIsCreating(false);

                router.reload({ only: ['notebooks'] });
            },
            onError: () => {
                toast.error("Failed to create notebook.");
                setIsCreating(false);
            },
        });
    };

    return (
        <AppLayout breadcrumbs={BREADCRUMBS}>
            <Head title="My Notebooks" />
            <div className="p-4">

                <div className="flex flex-col md:flex-row justify-between items-center mb-4">
                    <h1 className="text-5xl font-bold mb-4 md:mb-0">My Notebooks</h1>

                    <div className="flex flex-col md:flex-row items-center gap-4 w-full md:w-auto">

                        <Select value={sortOption} onValueChange={(value: SortOption) => setSortOption(value)}>
                            <SelectTrigger
                                className="border border-input bg-white dark:bg-black rounded-md focus:ring-1 focus:ring-ring focus:outline-none focus:border-ring text-sm px-3 h-9 w-full md:w-auto min-w-[125px]"
                            >
                                <SelectValue placeholder="Select sort" />
                            </SelectTrigger>
                            <SelectContent>
                                {(Object.keys(sortLabels) as SortOption[]).map((option) => (
                                    <SelectItem key={option} value={option}>
                                        {sortLabels[option]}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>


                        {/* Create New Notebook */}
                        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                            <DialogTrigger asChild>
                                <Button className="w-full md:w-auto">
                                    <Plus className="mr-2 h-4 w-4" />
                                    New Notebook
                                </Button>
                            </DialogTrigger>
                            <DialogContent>
                                <DialogHeader>
                                    <DialogTitle>Create New Notebook</DialogTitle>
                                    <DialogDescription>
                                        Fill in the details below to add a new notebook.
                                    </DialogDescription>
                                </DialogHeader>
                                <div className="space-y-4">
                                    <div>
                                        <Label htmlFor="title">Title</Label>
                                        <Input
                                            id="title"
                                            value={newTitle}
                                            onChange={e => setNewTitle(e.target.value)}
                                        />
                                    </div>
                                    <div>
                                        <Label htmlFor="description">Description</Label>
                                        <Textarea
                                            id="description"
                                            value={newDescription}
                                            onChange={e => setNewDescription(e.target.value)}
                                        />
                                    </div>
                                    <div>
                                        <Label htmlFor="color" className="mb-2 block">Color</Label>
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
                                                        borderColor: newColor === color ? "black" : "transparent",
                                                    }}
                                                >
                                                    <input
                                                        type="radio"
                                                        name="preset-color"
                                                        value={color}
                                                        className="sr-only"
                                                        checked={newColor === color}
                                                        onChange={() => setNewColor(color)}
                                                    />
                                                </label>
                                            ))}
                                            <label className="relative w-8 h-8 rounded-full border-2 border-dashed border-muted-foreground cursor-pointer flex items-center justify-center">
                                                <input
                                                    type="color"
                                                    value={newColor}
                                                    onChange={(e) => setNewColor(e.target.value)}
                                                    className="absolute opacity-0 w-full h-full cursor-pointer"
                                                />
                                                <div
                                                    className="w-5 h-5 rounded-full"
                                                    style={{ backgroundColor: newColor }}
                                                />
                                            </label>
                                        </div>
                                        <div className="flex items-center space-x-2 mt-5">
                                            <input
                                                type="checkbox"
                                                id="is_public"
                                                checked={newIsPublic}
                                                onChange={(e) => setNewIsPublic(e.target.checked)}
                                                className="h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                                            />
                                            <label htmlFor="is_public" className="text-sm font-medium">
                                                Make Public
                                            </label>

                                        </div>
                                        <p className="text-xs text-muted-foreground ml-6">
                                            Public notebooks are visible to everyone in the Community section.
                                        </p>
                                    </div>
                                    <div className="flex justify-end">
                                        <Button onClick={handleCreate} disabled={isCreating}>
                                            {isCreating ? 'Creating...' : 'Create'}
                                        </Button>
                                    </div>

                                </div>
                            </DialogContent>
                        </Dialog>
                    </div>
                </div>



                {/* Tabs for My Notebooks and Shared With You */}
                <Tabs defaultValue="my">
                    <TabsList>
                        <TabsTrigger value="my">Owned</TabsTrigger>
                        <TabsTrigger value="shared">Shared With Me</TabsTrigger>
                    </TabsList>
                    <TabsContent value="my">
                        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 lg:grid-cols-6 gap-2">
                            {isLoading ? (
                                Array.from({ length: 8 }).map((_, idx) => (
                                    <Card
                                        key={idx}
                                        className="aspect-square w-full p-3 flex flex-col justify-between animate-pulse"
                                    >
                                        <div className="h-4 bg-muted rounded w-1/2"></div>
                                        <div className="h-4 bg-muted rounded w-1/3 mt-2"></div>
                                    </Card>
                                ))
                            ) : sortedMyNotebooks.length === 0 ? (
                                <div className="col-span-full text-center text-muted-foreground py-8">
                                    You don't own any notebooks.
                                </div>
                            ) : (
                                sortedMyNotebooks.map((notebook) => (
                                    <Card
                                        key={notebook.id}
                                        onClick={() => router.visit(`/notebooks/${notebook.id}`)}
                                        className="aspect-square w-full transition-all duration-200 hover:scale-[1.02] hover:shadow-lg p-3 flex flex-col justify-between cursor-pointer"
                                        style={{ backgroundColor: notebook.color || "#f5f5f5" }}
                                    >
                                        <div className="flex flex-col justify-between flex-1">
                                            <div>
                                                <h3 className="font-semibold text-white/80 text-lg leading-tight line-clamp-2">
                                                    {notebook.title}
                                                </h3>

                                                <p className="text-xs text-white/80 drop-shadow">
                                                    by: {notebook.creator?.name ?? 'Unknown'}
                                                </p>
                                            </div>
                                        </div>




                                    </Card>
                                ))
                            )}
                        </div>
                    </TabsContent>






                    <TabsContent value="shared">
                        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 lg:grid-cols-6 gap-2">
                            {isLoading ? (
                                Array.from({ length: 8 }).map((_, idx) => (
                                    <Card
                                        key={idx}
                                        className="aspect-square w-full p-3 flex flex-col justify-between animate-pulse"
                                    >
                                        <div className="h-4 bg-muted rounded w-1/2"></div>
                                        <div className="h-4 bg-muted rounded w-1/3 mt-2"></div>
                                    </Card>
                                ))
                            ) : sortedSharedNotebooks.length === 0 ? (
                                <div className="col-span-full text-center text-muted-foreground py-8">
                                    No notebooks have been shared with you.
                                </div>
                            ) : (
                                sortedSharedNotebooks.map((notebook) => (
                                    <Card
                                        key={notebook.id}
                                        onClick={() => router.visit(`/notebooks/${notebook.id}`)}
                                        className="aspect-square w-full transition-all duration-200 hover:scale-[1.02] hover:shadow-lg p-3 flex flex-col justify-between cursor-pointer"
                                        style={{ backgroundColor: notebook.color || "#f5f5f5" }}
                                    >
                                        <div className="flex flex-col justify-between flex-1">
                                            <div>
                                                <h3 className="font-semibold text-white/80 text-lg leading-tight line-clamp-2">
                                                    {notebook.title}
                                                </h3>

                                                <p className="text-xs text-white/80 drop-shadow">
                                                    by: {notebook.creator?.name ?? 'Unknown'}
                                                </p>
                                            </div>
                                        </div>
                                    </Card>
                                ))
                            )}
                        </div>
                    </TabsContent>

                </Tabs>
            </div>
        </AppLayout>
    );
}
