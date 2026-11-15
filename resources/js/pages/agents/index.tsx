import { Head } from '@inertiajs/react';
import { Panel, PageHeading, Empty } from '@/components/workspace';
export default function Agents({
    agents,
}: {
    agents: { id: number; name: string; email: string }[];
}) {
    return (
        <>
            <Head title="Agent Management" />
            <Panel>
                <PageHeading
                    title="Agent Management"
                    description="Active people authorised to work in this branch."
                />
                <div className="hq-agent-grid mt-6">
                    {agents.map((agent) => (
                        <article className="hq-agent" key={agent.id}>
                            <div className="flex items-center justify-between">
                                <div className="hq-avatar">
                                    {agent.name.charAt(0)}
                                </div>
                                <span className="hq-badge">Active member</span>
                            </div>
                            <h3>{agent.name}</h3>
                            <p>{agent.email}</p>
                            <p className="mt-3">Account #{agent.id}</p>
                        </article>
                    ))}
                </div>
                {agents.length === 0 && (
                    <Empty>No active branch members.</Empty>
                )}
                <p className="hq-subtitle mt-6">
                    This directory uses actual branch memberships. Invitations,
                    agent-profile editing and performance metrics are pending;
                    access changes currently require the administrative
                    provisioning process.
                </p>
            </Panel>
        </>
    );
}
