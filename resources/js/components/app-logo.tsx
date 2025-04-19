import AppLogoIcon from './app-logo-icon';
import { StickyNote, Bird } from 'lucide-react';

export default function AppLogo() {
    return (
        <>
            <div className="text-sidebar-primary-foreground flex aspect-square size-8 items-center justify-center rounded-md">
                <StickyNote className="size-5 text-pink-500 dark:text-pink-500" />
            </div>

            <div className="ml-1 grid flex-1 text-left text-sm">
                <span className="mb-0.5 truncate leading-none font-semibold">MyUIC Notebook</span>
            </div>
        </>
    );
}
