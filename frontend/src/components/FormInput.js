const FormInput = ({ label, name, type = 'text', value, onChange, placeholder, required }) => (
  <label className="block mb-4">
    <span className="block text-sm font-medium text-slate-200 mb-1">{label}</span>
    <input
      type={type}
      name={name}
      value={value}
      onChange={onChange}
      placeholder={placeholder}
      required={required}
      className="w-full px-3 py-2 rounded-lg bg-slate-900 border border-slate-700 text-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-500"
    />
  </label>
);

export default FormInput;
