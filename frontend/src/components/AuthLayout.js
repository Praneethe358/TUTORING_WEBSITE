const AuthLayout = ({ children }) => (
  <div className="min-h-screen bg-slate-900 text-slate-100 flex items-center justify-center px-4">
    <div className="w-full max-w-md bg-slate-800/70 border border-slate-700 rounded-2xl shadow-2xl p-8">
      <div className="mb-6 text-center">
        <p className="text-sm text-slate-400">Student Access</p>
      </div>
      {children}
    </div>
  </div>
);

export default AuthLayout;
