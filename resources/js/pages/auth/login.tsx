import AppLogo from '@/components/app-logo';
import { Form, Head, Link } from '@inertiajs/react';
import {
    ArrowRight,
    Eye,
    EyeOff,
    LockKeyhole,
    Mail,
    ShieldCheck,
} from 'lucide-react';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Spinner } from '@/components/ui/spinner';
import { store } from '@/routes/login';
import { request } from '@/routes/password';
import './login.css';

function Brand() {
    return <div className="sky-brand"><AppLogo className="max-w-[270px]" /><small>SMART CALLING & CRM</small></div>;
}

function Orbit() {
    return (
        <svg
            className="sky-orbit"
            viewBox="0 0 470 290"
            fill="none"
            aria-hidden="true"
        >
            <defs>
                <radialGradient id="halo">
                    <stop stopColor="#D4AF37" stopOpacity=".14" />
                    <stop offset="1" stopColor="#D4AF37" stopOpacity="0" />
                </radialGradient>
                <linearGradient id="orbit-line">
                    <stop stopColor="#D4AF37" stopOpacity=".05" />
                    <stop offset=".5" stopColor="#D4AF37" stopOpacity=".55" />
                    <stop offset="1" stopColor="#D4AF37" stopOpacity=".05" />
                </linearGradient>
            </defs>
            <ellipse cx="235" cy="145" rx="190" ry="135" fill="url(#halo)" />
            {[80, 115, 150].map((r) => (
                <circle
                    key={r}
                    cx="235"
                    cy="145"
                    r={r}
                    stroke="#D4AF37"
                    strokeOpacity=".13"
                    strokeDasharray={r === 115 ? '3 6' : undefined}
                />
            ))}
            <ellipse
                cx="235"
                cy="145"
                rx="215"
                ry="64"
                transform="rotate(-24 235 145)"
                stroke="url(#orbit-line)"
            />
            <path
                d="M98 86 235 145 363 213M144 235 235 145 348 55"
                stroke="#D4AF37"
                strokeOpacity=".2"
            />
            {[
                [98, 86],
                [363, 213],
                [144, 235],
                [348, 55],
            ].map(([x, y]) => (
                <g key={x}>
                    <circle
                        cx={x}
                        cy={y}
                        r="13"
                        fill="var(--card)"
                        stroke="#D4AF37"
                        strokeOpacity=".4"
                    />
                    <circle cx={x} cy={y} r="3" fill="#D4AF37" />
                </g>
            ))}
            <rect
                x="201"
                y="111"
                width="68"
                height="68"
                rx="21"
                fill="var(--accent)"
                stroke="#D4AF37"
                strokeOpacity=".65"
            />
            <image href="/brand/skybound-symbol.svg?v=3" x="215" y="126" width="40" height="38" />
            <text
                x="235"
                y="270"
                textAnchor="middle"
                fill="var(--muted-foreground)"
                fontSize="8"
                letterSpacing="3"
            >
                ONE CONNECTED WORKSPACE
            </text>
        </svg>
    );
}

type Props = { status?: string; canResetPassword: boolean };

export default function Login({ status, canResetPassword }: Props) {
    const [showPassword, setShowPassword] = useState(false);
    const [showHelp, setShowHelp] = useState(false);
    return (
        <>
            <Head title="Sign in — SKYBOUND HQ" />
            <div className="sky-login">
                <aside
                    className="sky-story"
                    aria-label="SKYBOUND HQ introduction"
                >
                    <Brand />
                    <div className="sky-story-copy">
                        <div className="sky-eyebrow">YOUR COMMAND CENTRE</div>
                        <h1>
                            Better connections.
                            <br />
                            <span>Greater possibilities.</span>
                        </h1>
                        <p>
                            Bring your people, conversations and customer
                            relationships into one focused workspace.
                        </p>
                    </div>
                    <Orbit />
                    <div className="sky-story-footer">
                        <span>CONNECT. ENGAGE. GROW.</span>
                        <span>BUILT FOR YOUR NEXT CHAPTER</span>
                    </div>
                </aside>
                <main className="sky-access">
                    <div className="sky-mobile-brand">
                        <Brand />
                    </div>
                    <div className="sky-form-wrap">
                        <div className="sky-lock" aria-hidden="true">
                            <LockKeyhole size={21} strokeWidth={1.4} />
                        </div>
                        <p className="sky-kicker">WELCOME TO SKYBOUND HQ</p>
                        <h2>Sign in to your workspace</h2>
                        <p className="sky-subtitle">
                            Your next great conversation starts here.
                            <br />
                            Enter your credentials to continue.
                        </p>
                        {status && (
                            <div role="status" className="sky-status">
                                {status}
                            </div>
                        )}
                        <Form
                            {...store.form()}
                            resetOnSuccess={['password']}
                            className="sky-form"
                        >
                            {({ processing, errors }) => (
                                <>
                                    <div className="sky-field">
                                        <Label htmlFor="email">
                                            Email address
                                        </Label>
                                        <div className="sky-input-wrap">
                                            <Mail
                                                className="sky-input-icon"
                                                aria-hidden="true"
                                            />
                                            <Input
                                                id="email"
                                                name="email"
                                                type="email"
                                                required
                                                autoComplete="username"
                                                placeholder="you@company.com"
                                                className="sky-input"
                                                aria-invalid={!!errors.email}
                                                aria-describedby={
                                                    errors.email
                                                        ? 'email-error'
                                                        : undefined
                                                }
                                            />
                                        </div>
                                        {errors.email && (
                                            <p
                                                id="email-error"
                                                className="sky-error"
                                                role="alert"
                                            >
                                                {errors.email}
                                            </p>
                                        )}
                                    </div>
                                    <div className="sky-field">
                                        <Label htmlFor="password">
                                            Password
                                        </Label>
                                        <div className="sky-input-wrap">
                                            <LockKeyhole
                                                className="sky-input-icon"
                                                aria-hidden="true"
                                            />
                                            <Input
                                                id="password"
                                                name="password"
                                                type={
                                                    showPassword
                                                        ? 'text'
                                                        : 'password'
                                                }
                                                required
                                                autoComplete="current-password"
                                                placeholder="Enter your password"
                                                className="sky-input"
                                                aria-invalid={!!errors.password}
                                                aria-describedby={
                                                    errors.password
                                                        ? 'password-error'
                                                        : undefined
                                                }
                                            />
                                            <button
                                                type="button"
                                                className="sky-eye"
                                                onClick={() =>
                                                    setShowPassword(
                                                        !showPassword,
                                                    )
                                                }
                                                aria-label={
                                                    showPassword
                                                        ? 'Hide password'
                                                        : 'Show password'
                                                }
                                                aria-pressed={showPassword}
                                            >
                                                {showPassword ? (
                                                    <EyeOff size={17} />
                                                ) : (
                                                    <Eye size={17} />
                                                )}
                                            </button>
                                        </div>
                                        {errors.password && (
                                            <p
                                                id="password-error"
                                                className="sky-error"
                                                role="alert"
                                            >
                                                {errors.password}
                                            </p>
                                        )}
                                    </div>
                                    <div className="sky-options">
                                        <div className="sky-remember">
                                            <Checkbox
                                                id="remember"
                                                name="remember"
                                                className="sky-checkbox"
                                            />
                                            <Label htmlFor="remember">
                                                Remember me
                                            </Label>
                                        </div>
                                        {canResetPassword && (
                                            <Link
                                                className="sky-link"
                                                href={request()}
                                            >
                                                Forgot password?
                                            </Link>
                                        )}
                                    </div>
                                    <Button
                                        type="submit"
                                        className="sky-submit"
                                        disabled={processing}
                                        aria-busy={processing}
                                        data-test="login-button"
                                    >
                                        {processing ? (
                                            <>
                                                <Spinner />
                                                Signing in…
                                            </>
                                        ) : (
                                            <>
                                                Sign in <ArrowRight size={16} />
                                            </>
                                        )}
                                    </Button>
                                </>
                            )}
                        </Form>
                        <div className="sky-security">
                            <ShieldCheck size={15} />
                            <span>
                                Two-factor verification follows sign-in for
                                accounts with an authenticator enabled.
                            </span>
                        </div>
                        <p className="sky-contact">
                            Need access?{' '}
                            <button
                                type="button"
                                className="sky-link"
                                aria-expanded={showHelp}
                                aria-controls="admin-help"
                                onClick={() => setShowHelp(!showHelp)}
                            >
                                Contact your administrator{' '}
                                <span aria-hidden="true">↗</span>
                            </button>
                        </p>
                        {showHelp && (
                            <div
                                id="admin-help"
                                className="sky-admin-help"
                                role="status"
                            >
                                Contact your organisation’s HQ administrator or
                                branch manager through your internal support
                                channel to request access or help with your
                                account.
                            </div>
                        )}
                    </div>
                    <footer className="sky-bottom">
                        © {new Date().getFullYear()} SKYBOUND HQ. All rights
                        reserved.
                    </footer>
                </main>
            </div>
        </>
    );
}
