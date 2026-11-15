export default function AppLogo({ className = '' }: { className?: string }) {
    return <img src="/brand/skybound-logo.svg?v=3" alt="SkyBound HQ" width="650" height="112" className={'h-auto w-full min-w-0 ' + className} />;
}
