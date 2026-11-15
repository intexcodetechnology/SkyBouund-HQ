import { Monitor, Moon, Sun } from 'lucide-react';
import type { HTMLAttributes, KeyboardEvent } from 'react';
import { useAppearance, type Appearance } from '@/hooks/use-appearance';
import { cn } from '@/lib/utils';
const options = [ { value: 'light', icon: Sun, label: 'Light' }, { value: 'dark', icon: Moon, label: 'Dark' }, { value: 'system', icon: Monitor, label: 'System' } ] as const;
export default function AppearanceToggleTab({ className, ...props }: HTMLAttributes<HTMLDivElement>) {
    const { appearance, updateAppearance } = useAppearance();
    function onKey(event: KeyboardEvent<HTMLButtonElement>, mode: Appearance) {
        const index = options.findIndex(option => option.value === mode);
        const next = event.key === 'Home' ? 0 : event.key === 'End' ? 2 : ['ArrowRight','ArrowDown'].includes(event.key) ? (index+1)%3 : ['ArrowLeft','ArrowUp'].includes(event.key) ? (index+2)%3 : -1;
        if (next < 0) return;
        event.preventDefault(); updateAppearance(options[next].value);
        const group = event.currentTarget.parentElement;
        (group?.querySelectorAll<HTMLButtonElement>('[role="radio"]')[next])?.focus();
    }
    return <div {...props} role="radiogroup" aria-label="Appearance" className={cn('appearance-control', className)}>{options.map(({value,icon:Icon,label}) => <button key={value} type="button" role="radio" aria-label={label} aria-checked={appearance===value} tabIndex={appearance===value?0:-1} className="appearance-option" onClick={()=>updateAppearance(value)} onKeyDown={event=>onKey(event,value)}><Icon aria-hidden="true"/><span>{label}</span></button>)}</div>;
}
