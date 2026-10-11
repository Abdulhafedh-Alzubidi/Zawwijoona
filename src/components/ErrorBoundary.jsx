import React from 'react';
import { AlertTriangle, RefreshCw, Home } from 'lucide-react';

export default class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error('ErrorBoundary caught an unhandled error:', error, errorInfo);
  }

  handleClearCacheAndReload = async () => {
    try {
      if ('serviceWorker' in navigator) {
        const registrations = await navigator.serviceWorker.getRegistrations();
        for (const reg of registrations) {
          await reg.unregister();
        }
      }
      if ('caches' in window) {
        const cacheKeys = await caches.keys();
        for (const key of cacheKeys) {
          await caches.delete(key);
        }
      }
      localStorage.clear();
      sessionStorage.clear();
    } catch (e) {
      console.error('Error clearing cache:', e);
    }
    window.location.reload();
  };

  render() {
    if (this.state.hasError) {
      return (
        <div dir="rtl" className="min-h-screen bg-[#fdfbf7] flex items-center justify-center p-4 font-sans font-arabic">
          <div className="bg-white p-8 rounded-3xl shadow-xl max-w-lg w-full border border-amber-100 text-center">
            <div className="w-16 h-16 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center mx-auto mb-5 border border-amber-200">
              <AlertTriangle size={36} />
            </div>

            <h1 className="text-2xl font-black text-gray-900 mb-2">
              حدث خطأ أثناء تحميل التطبيق
            </h1>
            <p className="text-gray-600 text-sm mb-6 leading-relaxed">
              قد يكون ذلك بسبب نسخة قديمة مخزنة في متصفحك أو انقطاع في الاتصال. اضغط على الزر أدناه لتحديث النسخة ومسح الذاكرة المؤقتة.
            </p>

            {this.state.error && (
              <div className="bg-red-50 text-red-700 text-xs p-3 rounded-xl text-left mb-6 font-mono overflow-auto max-h-32 border border-red-100" dir="ltr">
                {this.state.error.toString()}
              </div>
            )}

            <div className="flex flex-col sm:flex-row gap-3">
              <button
                type="button"
                onClick={this.handleClearCacheAndReload}
                className="flex-1 flex items-center justify-center gap-2 py-3.5 px-4 rounded-xl bg-gradient-to-r from-amber-600 to-orange-500 hover:from-amber-700 hover:to-orange-600 text-white font-bold text-sm shadow-md transition-transform active:scale-95"
              >
                <RefreshCw size={18} />
                <span>تحديث ومسح الذاكرة المؤقتة</span>
              </button>
              <button
                type="button"
                onClick={() => { window.location.href = '/'; }}
                className="flex items-center justify-center gap-2 py-3.5 px-4 rounded-xl border border-gray-200 bg-gray-50 hover:bg-gray-100 text-gray-700 font-bold text-sm transition"
              >
                <Home size={18} />
                <span>الرئيسية</span>
              </button>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
