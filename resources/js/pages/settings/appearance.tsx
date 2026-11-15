import { Head } from '@inertiajs/react';
import AppearanceTabs from '@/components/appearance-tabs';
import Heading from '@/components/heading';
import { useAppearance } from '@/hooks/use-appearance';
import { edit as editAppearance } from '@/routes/appearance';

export default function Appearance() {
    const { appearance, resolvedAppearance } = useAppearance();
    return (
        <>
            <Head title="Appearance settings" />

            <h1 className="sr-only">Appearance settings</h1>

            <div className="space-y-6">
                <Heading
                    variant="small"
                    title="Appearance settings"
                    description="Choose a light, dark or device-matched theme. Your choice is saved in this browser."
                />
                <AppearanceTabs />
                <p className="text-sm text-muted-foreground" role="status" aria-live="polite">
                    {appearance === 'system' ? 'Following your device. ' : ''}
                    Currently displaying {resolvedAppearance === 'dark' ? 'Dark' : 'Light'} mode.
                </p>
            </div>
        </>
    );
}

Appearance.layout = {
    breadcrumbs: [
        {
            title: 'Appearance settings',
            href: editAppearance(),
        },
    ],
};
