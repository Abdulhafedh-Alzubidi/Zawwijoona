import  { useState } from 'react';
import { auth } from './firebase'; // نستدعي إعدادات فايربيس اللي سويناها
import { createUserWithEmailAndPassword, signInWithEmailAndPassword, updateProfile } from 'firebase/auth';
import { Mail, Lock, AlertCircle, User, Eye, EyeOff } from 'lucide-react';

export default function Auth({ onLoginSuccess, toggleLang, isRtl }) {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [username, setUsername] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      if (isLogin) {
        // كود تسجيل الدخول
        await signInWithEmailAndPassword(auth, email, password);
      } else {
        // كود إنشاء حساب جديد
        const userCredential = await createUserWithEmailAndPassword(auth, email, password);
        // تحديث بيانات المستخدم مع اسم المستخدم
        if (username.trim()) {
          await updateProfile(userCredential.user, { displayName: username });
        }
      }
      // إذا نجحت العملية، نبلغ التطبيق الأساسي
      onLoginSuccess();
    } catch (err) {
      // ترجمة وتبسيط أخطاء فايربيس للمستخدم
      if (err.code === 'auth/email-already-in-use') setError(isRtl ? 'هذا الإيميل مسجل مسبقاً!' : 'This email is already in use!');
      else if (err.code === 'auth/wrong-password' || err.code === 'auth/user-not-found') setError(isRtl ? 'الإيميل أو كلمة المرور غير صحيحة' : 'Invalid email or password');
      else if (err.code === 'auth/weak-password') setError(isRtl ? 'كلمة المرور ضعيفة، يجب أن تكون 6 أحرف على الأقل' : 'Weak password, must be at least 6 characters');
      else setError(isRtl ? 'حدث خطأ، يرجى المحاولة مرة أخرى' : 'An error occurred, please try again');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#fdfbf7] flex items-center justify-center p-4" dir={isRtl ? 'rtl' : 'ltr'}>
      <div className="bg-white p-8 rounded-3xl shadow-xl w-full max-w-md border border-amber-100">
        <div className="text-center mb-8">
          <h2 className="text-3xl font-extrabold text-amber-700 mb-2">
            {isLogin ? (isRtl ? 'أهلاً بك مجدداً 👋' : 'Welcome Back 👋') : (isRtl ? 'إنشاء حساب جديد 💍' : 'Create New Account 💍')}
          </h2>
          <p className="text-gray-500 font-medium">
            {isLogin ? (isRtl ? 'سجل دخولك لمتابعة تخطيط زفافك' : 'Sign in to continue planning your wedding') : (isRtl ? 'ابدأ رحلة التخطيط لزفافك بكل سهولة' : 'Start planning your wedding with ease')}
          </p>
        </div>

        {error && (
          <div className="bg-red-50 text-red-600 p-4 rounded-xl mb-6 flex items-center gap-2 text-sm font-bold">
            <AlertCircle size={20} />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
          {!isLogin && (
            <div>
              <label className="block text-gray-700 font-bold mb-2">{isRtl ? 'اسم المستخدم' : 'Username'}</label>
              <div className="relative">
                <input
                  type="text"
                  required
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="w-full bg-gray-50 border border-gray-200 text-gray-800 rounded-xl px-4 py-3 pl-10 focus:outline-none focus:ring-2 focus:ring-amber-500 transition"
                  placeholder={isRtl ? 'اسمك الجميل' : 'Your Beautiful Name'}
                />
                <User className="absolute left-3 top-3.5 text-gray-400" size={20} />
              </div>
            </div>
          )}

          <div>
            <label className="block text-gray-700 font-bold mb-2">{isRtl ? 'البريد الإلكتروني' : 'Email Address'}</label>
            <div className="relative">
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full bg-gray-50 border border-gray-200 text-gray-800 rounded-xl px-4 py-3 pl-10 focus:outline-none focus:ring-2 focus:ring-amber-500 transition"
                placeholder="example@mail.com"
                dir="ltr"
              />
              <Mail className="absolute left-3 top-3.5 text-gray-400" size={20} />
            </div>
          </div>

          <div>
            <label className="block text-gray-700 font-bold mb-2">{isRtl ? 'كلمة المرور' : 'Password'}</label>
            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full bg-gray-50 border border-gray-200 text-gray-800 rounded-xl px-4 py-3 pl-10 pr-10 focus:outline-none focus:ring-2 focus:ring-amber-500 transition"
                placeholder="••••••••"
                dir="ltr"
              />
              <Lock className="absolute left-3 top-3.5 text-gray-400" size={20} />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-3.5 text-gray-400 hover:text-gray-600 transition"
              >
                {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
              </button>
            </div>
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full bg-gradient-to-r from-amber-600 to-orange-500 hover:from-amber-700 hover:to-orange-600 text-white font-bold py-3.5 rounded-xl shadow-lg transition-transform active:scale-95 disabled:opacity-70"
          >
            {isLoading ? (isRtl ? 'جاري التحميل...' : 'Loading...') : (isLogin ? (isRtl ? 'دخول' : 'Sign In') : (isRtl ? 'إنشاء حساب' : 'Sign Up'))}
          </button>
        </form>

        <div className="mt-8 text-center">
          <div className="mt-6 text-center border-t border-gray-100 pt-4">
            <button
              type="button"
              onClick={toggleLang}
              className="text-sm font-medium text-gray-500 hover:text-gray-800 transition-colors underline underline-offset-4"
            >
              {isRtl ? 'Switch to English' : 'التبديل إلى العربية'}

            </button>
          </div>
          <p className="text-gray-600 font-medium">
            {isLogin ? (isRtl ? 'ليس لديك حساب؟ ' : 'Don\'t have an account? ') : (isRtl ? 'لديك حساب بالفعل؟ ' : 'Already have an account? ')}
            <button
              onClick={() => { setIsLogin(!isLogin); setError(''); setUsername(''); }}
              className="text-amber-600 font-bold hover:underline"
            >
              {isLogin ? (isRtl ? 'سجل الآن' : 'Sign Up') : (isRtl ? 'سجل دخولك' : 'Sign In')}
            </button>
          </p>
        </div>
      </div>
    </div>
  );
}