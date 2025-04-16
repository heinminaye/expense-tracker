interface InputProps {
  label: string;
  type: string;
  name: string;
  register: any;
  error?: { message: string };
}

const Input: React.FC<InputProps> = ({ label, type, name, register, error }) => (
  <div className="mb-6">
    <label className="block text-sm font-medium text-gray-700">{label}</label>
    <input
      type={type}
      {...register(name)}
      className="mt-1 block w-full px-3 py-2 bg-gray-50 border border-gray-300 rounded-md text-sm shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
      placeholder={`Enter ${label}`}
    />
    {error && <p className="text-red-500 text-xs mt-1">{error.message}</p>}
  </div>
);

export default Input;