import { useState } from 'react';
import { useAuth } from '../lib/auth';
import { Button } from '../components/ui/button';
import { Loader2 } from 'lucide-react';

export default function Login() {
  const { login } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      await login({ email, password });
    } catch (err: any) {
      setError(err.message || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <div className="max-w-md w-full bg-white p-8 rounded-xl shadow-lg border border-gray-200">
        <div className="text-center mb-8">
          <h1 className="text-2xl font-bold text-[#1B3A6B]">IMH PLATE</h1>
          <p className="text-gray-500 mt-2">Prijavite se za pristup sistemu</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#1B3A6B] focus:border-transparent outline-none transition-all"
              placeholder="admin@imh.ba"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Lozinka</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#1B3A6B] focus:border-transparent outline-none transition-all"
              placeholder="••••••••"
              required
            />
          </div>

          {error && (
            <div className="p-3 bg-red-50 text-red-700 text-sm rounded-lg border border-red-200">
              {error}
            </div>
          )}

          <Button type="submit" className="w-full h-11 text-base" disabled={loading}>
            {loading ? <Loader2 className="w-5 h-5 animate-spin mr-2" /> : 'Prijava'}
          </Button>
        </form>

        <div className="mt-6 text-center text-xs text-gray-400">
          <p>IMH Pravilnik o Platama v1.0</p>
          <p>© 2026 P.P.U. International Montessori House</p>
        </div>
      </div>
    </div>
  );
}
