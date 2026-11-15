import { Head, Link } from '@inertiajs/react';
import { Button } from '@/components/ui/button';
import { Panel, PageHeading } from '@/components/workspace';
export default function SystemSettings({
    database,
    timezone,
}: {
    database: string;
    timezone: string;
}) {
    return (
        <>
            <Head title="System Settings" />
            <Panel>
                <PageHeading
                    title="System Settings & Configuration"
                    description="Current application configuration and integration availability."
                />
                <div className="hq-summary mt-6">
                    <div>
                        <span>Database engine</span>
                        <b>{database.toUpperCase()}</b>
                    </div>
                    <div>
                        <span>Storage timezone</span>
                        <b>{timezone}</b>
                    </div>
                    <div>
                        <span>Tenant access</span>
                        <b>Organisation + authorised branch</b>
                    </div>
                    <div>
                        <span>Telephony / Asterisk</span>
                        <b>Pending integration</b>
                    </div>
                    <div>
                        <span>WhatsApp handoff</span>
                        <b>Pending integration</b>
                    </div>
                    <div>
                        <span>Automated reminders</span>
                        <b>Pending worker integration</b>
                    </div>
                </div>
                <p className="hq-subtitle mt-5">
                    Integration settings are managed through deployment
                    configuration until their validated administration workflows
                    are implemented. Customer data cannot be reset from this
                    screen.
                </p>
                <Button asChild className="hq-gold-button mt-6">
                    <Link href="/settings/security">
                        Manage Account Security
                    </Link>
                </Button>
            </Panel>
        </>
    );
}
