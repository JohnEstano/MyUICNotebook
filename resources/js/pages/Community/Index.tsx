import { useState, useEffect, useMemo } from 'react'
import { Head, usePage, Link, router } from '@inertiajs/react'
import { PlaceholderPattern } from '@/components/ui/placeholder-pattern'
import AppLayout from '@/layouts/app-layout'
import { type BreadcrumbItem } from '@/types'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { toast } from 'sonner'
import { Plus } from 'lucide-react'
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select'
import {
    Table,
    TableHeader,
    TableRow,
    TableHead,
    TableBody,
    TableCell,
} from '@/components/ui/table'

const BREADCRUMBS: BreadcrumbItem[] = [
    { title: 'Community', href: '/community' },
]

type SortOption = 'recent' | 'oldest' | 'az' | 'za'
const sortLabels: Record<SortOption, string> = {
    recent: 'Most Recent',
    oldest: 'Oldest',
    az: 'Title A-Z',
    za: 'Title Z-A',
}

interface Notebook {
    id: number
    title: string
    description?: string
    color: string
    created_by: number
    creator?: { id: number; name: string }
}

interface PageProps {
    notebooks: Notebook[]
    auth: { user: { id: number } }
}

export default function CommunityIndex() {
   
    const { notebooks, auth } = usePage().props as unknown as PageProps
    const [list, setList] = useState<Notebook[]>(notebooks)


    const [sortOption, setSortOption] = useState<SortOption>('recent')
    const [isLoading, setIsLoading] = useState(true)
    const [isDialogOpen, setIsDialogOpen] = useState(false)
    const [newTitle, setNewTitle] = useState('')
    const [newDescription, setNewDescription] = useState('')
    const [newColor, setNewColor] = useState('#22c55e')
    const [isCreating, setIsCreating] = useState(false)

 
    useEffect(() => {
        setList(notebooks)
    }, [notebooks])

 
    useEffect(() => {
        const timer = setTimeout(() => setIsLoading(false), 500)
        return () => clearTimeout(timer)
    }, [])

    const sortedNotebooks = useMemo(() => {
        const arr = [...list]
        switch (sortOption) {
            case 'recent':
                return arr.sort((a, b) => b.id - a.id)
            case 'oldest':
                return arr.sort((a, b) => a.id - b.id)
            case 'az':
                return arr.sort((a, b) => a.title.localeCompare(b.title))
            case 'za':
                return arr.sort((a, b) => b.title.localeCompare(a.title))
            default:
                return arr
        }
    }, [sortOption, list])


    const handleCreate = () => {
        if (!newTitle.trim()) return toast.error('Title is required')
        setIsCreating(true)

        router.post(
            route('community.store'),
            { title: newTitle, description: newDescription, color: newColor, is_public: true },
            {
                onSuccess: () => {
                    toast.success('Notebook created!')
                    setIsDialogOpen(false)
                    router.reload({ only: ['notebooks'] })
                },
                onError: () => toast.error('Creation failed'),
                onFinish: () => setIsCreating(false),
            }
        )
    }

    return (
        <AppLayout breadcrumbs={BREADCRUMBS}>
            <Head title="Community" />

            <div className="p-4 space-y-6">

                <div className="flex justify-between items-center">
                    <h1 className="text-5xl font-bold">Community Notebooks</h1>

                    <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                        <DialogTrigger asChild>
                            <Button>
                                <Plus className="w-4 h-4 mr-2" />
                                New Notebook
                            </Button>
                        </DialogTrigger>
                        <DialogContent>
                            <DialogHeader>
                                <DialogTitle>Create New Public Notebook</DialogTitle>
                                <p className=" text-muted-foreground">This notebook is public and can be viewed by everyone.</p>
                            </DialogHeader>
                            <div className="space-y-4">
                                <div>

                                    <Label>Title</Label>
                                    <Input
                                        value={newTitle}
                                        onChange={(e) => setNewTitle(e.target.value)}
                                    />
                                </div>
                                <div>
                                    <Label>Description (optional)</Label>
                                    <Textarea
                                        value={newDescription}
                                        onChange={(e) => setNewDescription(e.target.value)}
                                    />
                                </div>
                                <div>
                                    <Label>Color</Label>
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
                                </div>
                                <div className="flex justify-end">
                                    <Button onClick={handleCreate} disabled={isCreating}>
                                        {isCreating ? 'Creating...' : 'Create Notebook'}
                                    </Button>
                                </div>

                            </div>
                        </DialogContent>
                    </Dialog>
                </div>
                <p className="text-s text-muted-foreground">Welcome to the Community Page. Explore other Notebooks shared by others.</p>



                <div className="flex items-center gap-4">

                    <Select
                        value={sortOption}
                        onValueChange={(value) => setSortOption(value as SortOption)}
                    >
                        <SelectTrigger className="w-[180px]">
                            <SelectValue placeholder="Sort by" />
                        </SelectTrigger>
                        <SelectContent>
                            {Object.entries(sortLabels).map(([value, label]) => (
                                <SelectItem key={value} value={value}>
                                    {label}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
                    {isLoading ? (
                        Array.from({ length: 8 }).map((_, idx) => (
                            <div
                                key={idx}
                                className="aspect-square w-full p-3 flex flex-col justify-between animate-pulse bg-muted rounded-lg"
                            >
                                <div className="h-4 bg-muted-foreground/20 rounded w-1/2"></div>
                                <div className="h-4 bg-muted-foreground/20 rounded w-1/3 mt-2"></div>
                            </div>
                        ))
                    ) : sortedNotebooks.length === 0 ? (
                        <div className="col-span-full text-center text-muted-foreground py-8">
                            No public notebooks found. Be the first to create one!
                        </div>
                    ) : (
                        sortedNotebooks.map((notebook) => (
                            <div
                                key={notebook.id}
                                onClick={() => router.visit(`/notebooks/${notebook.id}`)}
                                className="aspect-square w-full transition-all duration-200 hover:scale-[1.02] hover:shadow-lg p-3 flex flex-col justify-between cursor-pointer rounded-lg"
                                style={{
                                    backgroundColor: notebook.color || "#f5f5f5",
                                    boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)'
                                }}
                            >
                                <div className="flex flex-col justify-between flex-1">
                                    <div>
                                        <h3 className="font-semibold text-white/90 text-lg leading-tight line-clamp-2">
                                            {notebook.title}

                                        </h3>
                                        <p className="text-xs text-white/90 ">
                                            by {notebook.creator?.name || 'Unknown'}
                                        </p>
                                    </div>

                                </div>
                            </div>
                        ))
                    )}
                </div>
            </div>

        </AppLayout>
    )
}
