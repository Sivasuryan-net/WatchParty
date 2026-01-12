import { useState } from 'react';
import { useAuth } from '../context/AuthContext';

interface LoginProps {
    onNavigate: (page: any) => void;
}

export function Login({ onNavigate }: LoginProps) {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const { login, error, isLoading } = useAuth();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            await login({ email, password });
            onNavigate('home');
        } catch (err) {
            // Error handled by context
        }
    };

    return (
        <div className="min-h-screen bg-black flex items-center justify-center p-4">
            <div className="w-full max-w-md bg-[#181118] border border-white/5 rounded-2xl p-8 shadow-2xl">
                <h2 className="text-3xl font-bold text-white mb-2 text-center">Welcome Back</h2>
                <p className="text-white/40 text-center mb-8">Sign in to continue to WatchParty</p>

                {error && (
                    <div className="bg-red-500/10 border border-red-500/20 text-red-400 p-3 rounded-lg mb-6 text-sm">
                        {error}
                    </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label className="block text-white/60 text-sm font-medium mb-1">Email</label>
                        <input
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required
                            className="w-full bg-black/50 border border-white/10 rounded-lg h-12 px-4 text-white focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-colors"
                            placeholder="Enter your email"
                        />
                    </div>
                    <div>
                        <label className="block text-white/60 text-sm font-medium mb-1">Password</label>
                        <input
                            type="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                            className="w-full bg-black/50 border border-white/10 rounded-lg h-12 px-4 text-white focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-colors"
                            placeholder="Enter your password"
                        />
                    </div>

                    <button
                        type="submit"
                        disabled={isLoading}
                        className="w-full bg-primary hover:bg-primary/90 text-white font-bold h-12 rounded-lg transition-colors mt-4 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        {isLoading ? 'Signing In...' : 'Sign In'}
                    </button>
                </form>

                <p className="mt-6 text-center text-white/40 text-sm">
                    Don't have an account?{' '}
                    <button onClick={() => onNavigate('register')} className="text-primary hover:underline">
                        Sign up
                    </button>
                </p>
            </div>
        </div>
    );
}
