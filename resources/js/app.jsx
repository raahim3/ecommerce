import { createInertiaApp, router } from '@inertiajs/react';
import { createRoot } from 'react-dom/client';
import { CartProvider } from '@/components/site/cart';
import { Toaster } from '@/components/ui/sonner';
import { toast } from 'sonner';

// Global flash messages listener via Inertia router events
router.on('navigate', (event) => {
    const flash = event.detail.page.props.flash;
    if (flash?.success) {
        toast.success(flash.success);
    }
    if (flash?.error) {
        toast.error(flash.error);
    }
    if (flash?.status) {
        toast.info(flash.status);
    }
});

createInertiaApp({
    resolve: name => {
        const pages = import.meta.glob('./Pages/**/*.jsx', { eager: true });
        const exact = pages[`./Pages/${name}.jsx`];
        if (exact) return exact.default || exact;

        const normalizedName = `./pages/${name.toLowerCase()}.jsx`;
        for (const path in pages) {
            if (path.toLowerCase() === normalizedName) {
                return pages[path].default || pages[path];
            }
        }
        throw new Error(`Page not found: ${name}`);
    },
    setup({ el, App, props }) {
        createRoot(el).render(
            <CartProvider>
                <App {...props} />
                <Toaster richColors position="top-right" />
            </CartProvider>
        );
    },
});