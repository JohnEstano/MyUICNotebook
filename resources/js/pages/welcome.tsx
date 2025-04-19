import { type SharedData } from '@/types';
import { Head, Link, usePage } from '@inertiajs/react';
import { Share2, NotebookPen, UsersRound, StickyNote } from 'lucide-react';

export default function Welcome() {
    const { auth } = usePage<SharedData>().props;

    return (
        <>
            <Head title="Welcome to MyUIC Notebook">
                <link rel="preconnect" href="https://fonts.bunny.net" />
                <link href="https://fonts.bunny.net/css?family=instrument-sans:400,500,600" rel="stylesheet" />
            </Head>

            {/* Navbar */}
            <header className="bg-white dark:bg-[#161615] shadow-md py-4 px-6">
                <div className="container mx-auto flex items-center justify-between">
                <StickyNote className="text-pink-500" />


                    {auth.user ? (
                        <Link
                            href={route('dashboard')}
                            className="inline-block rounded-sm border border-[#19140035] px-5 py-2 text-sm text-[#1b1b18] hover:border-[#1915014a] dark:border-[#3E3E3A] dark:text-[#EDEDEC] dark:hover:border-[#62605b]"
                        >
                            Dashboard
                        </Link>
                    ) : (
                        <div className="flex gap-4">
                            <Link
                                href={route('login')}
                                className="inline-block rounded-sm border border-transparent px-5 py-2 text-sm text-[#1b1b18] hover:border-[#19140035] dark:text-[#EDEDEC] dark:hover:border-[#3E3E3A]"
                            >
                                Log in
                            </Link>
                            <Link
                                href={route('register')}
                                className="inline-block rounded-sm border border-[#19140035] px-5 py-2 text-sm text-[#1b1b18] hover:border-[#1915014a] dark:border-[#3E3E3A] dark:text-[#EDEDEC] dark:hover:border-[#62605b]"
                            >
                                Register
                            </Link>
                        </div>
                    )}
                </div>
            </header>

            <div className="flex min-h-screen flex-col items-center bg-[#FDFDFC] p-6 text-[#1b1b18] lg:justify-center lg:p-8 dark:bg-[#0a0a0a]">
                <div className="flex w-full items-center justify-center opacity-100 transition-opacity duration-750 lg:grow starting:opacity-0">
                    <main className="flex w-full max-w-[335px] flex-col gap-6 lg:max-w-4xl lg:flex-row lg:items-start">
                        <div className="flex-1 rounded-br-lg rounded-bl-lg bg-white p-6 pb-10 text-sm leading-[1.6] shadow-[inset_0_0_0_1px_rgba(26,26,0,0.16)] lg:rounded-lg lg:p-16 dark:bg-[#161615] dark:text-[#EDEDEC] dark:shadow-[inset_0_0_0_1px_#fffaed2d]">
                            <div className="flex flex-col lg:flex-row justify-between gap-6">
                                <div className="flex-1">
                                    <h1 className="text-3xl font-bold tracking-tight text-neutral-900 dark:text-neutral-100 mb-2">
                                        Welcome to MyUIC Notebook
                                    </h1>
                                    <p className="text-sm text-muted-foreground mb-6">
                                        Write, organize, and share with ease.
                                    </p>

                                    <ul className="space-y-6">
                                        <li className="flex items-start gap-4">
                                            <NotebookPen className="h-7 w-7 text-yellow-500 dark:text-yellow-300" />
                                            <div>
                                                <h2 className="text-lg font-semibold text-neutral-800 dark:text-neutral-100">Note Editor</h2>
                                                <p className="text-sm text-muted-foreground">Image uploads and clean UI.</p>
                                            </div>
                                        </li>
                                        <li className="flex items-start gap-4">
                                            <Share2 className="h-7 w-7 text-blue-600 dark:text-blue-400" />
                                            <div>
                                                <h2 className="text-lg font-semibold text-neutral-800 dark:text-neutral-100">Share</h2>
                                                <p className="text-sm text-muted-foreground">Easily share your notebooks.</p>
                                            </div>
                                        </li>
                                        <li className="flex items-start gap-4">
                                            <UsersRound className="h-7 w-7 text-rose-600 dark:text-rose-400" />
                                            <div>
                                                <h2 className="text-lg font-semibold text-neutral-800 dark:text-neutral-100">Personal or Academic</h2>
                                                <p className="text-sm text-muted-foreground">For students and professionals.</p>
                                            </div>
                                        </li>
                                    </ul>
                                </div>

                                <div className="flex items-center justify-center">
                                    <div className="w-48 h-48 shrink-0 rounded-xl bg-pink-500 p-5 flex relative z-10">
                                        <h2 className="text-xl font-semibold text-white/80">MyUIC Notebook</h2>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </main>
                </div>

                <div className="hidden h-14.5 lg:block" />
                <p className="text-xs text-muted-foreground mt-5">@UIC-CCS 2025</p>
            </div>
        </>
    );
}
