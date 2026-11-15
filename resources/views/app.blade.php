<!DOCTYPE html>
<html lang="{{ str_replace('_', '-', app()->getLocale()) }}" @class(['dark' => ($appearance ?? 'system') == 'dark'])>
    <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1">

        {{-- Resolve local browser preference before styles or React can paint. --}}
        <script>
            (function () {
                var mode = @json($appearance ?? 'system');
                try {
                    var stored = localStorage.getItem('appearance');
                    if (['light', 'dark', 'system'].indexOf(stored) !== -1) mode = stored;
                } catch (error) {}
                if (['light', 'dark', 'system'].indexOf(mode) === -1) mode = 'system';
                var dark = mode === 'dark' || (mode === 'system' && window.matchMedia('(prefers-color-scheme: dark)').matches);
                document.documentElement.classList.toggle('dark', dark);
                document.documentElement.dataset.appearance = mode;
                document.documentElement.style.colorScheme = dark ? 'dark' : 'light';
                var collapsed = null;
                try { collapsed = localStorage.getItem('skybound.sidebar.collapsed'); } catch (error) {}
                if (collapsed !== 'true' && collapsed !== 'false') collapsed = window.matchMedia('(min-width: 641px) and (max-width: 1000px)').matches ? 'true' : 'false';
                document.documentElement.dataset.sidebarCollapsed = collapsed;
            })();
        </script>
        <style>html { background: #f8f6f0; color-scheme: light; } html.dark { background: #101010; color-scheme: dark; }</style>

        <link rel="icon" href="/favicon.ico?v=skybound-3" sizes="any">
        <link rel="icon" href="/favicon.svg?v=skybound-3" type="image/svg+xml">
        <link rel="apple-touch-icon" href="/apple-touch-icon.png?v=skybound-3">

        @fonts

        @viteReactRefresh
        @vite(['resources/css/app.css', 'resources/js/app.tsx', "resources/js/pages/{$page['component']}.tsx"])
        <x-inertia::head>
            <title>{{ config('app.name', 'Laravel') }}</title>
        </x-inertia::head>
    </head>
    <body class="font-sans antialiased">
        <x-inertia::app />
    </body>
</html>
