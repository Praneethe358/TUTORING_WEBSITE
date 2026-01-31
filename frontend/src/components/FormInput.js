const FormInput = ({ label, name, type = 'text', value, onChange, placeholder, required }) => (
  <label className="block mb-4">
    <span className="block text-sm font-medium text-gray-700 mb-1">{label}</span>
    <input
      type={type}
      name={name}
      value={value}
      onChange={onChange}
      placeholder={placeholder}
      required={required}
      className="w-full px-3 py-2 rounded-lg bg-white border border-blue-200 text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
    />
  </label>
);

export default FormInput;
