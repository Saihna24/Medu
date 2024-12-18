import { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const PasswordReset = () => {
  const [step, setStep] = useState(1);
  const [email, setEmail] = useState('');
  const [code, setCode] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [message, setMessage] = useState('');

  const navigate = useNavigate();

  const handleRequestResetCode = async () => {
    try {
      const response = await axios.post('http://localhost:5000/api/request-reset', { email });
      setMessage(response.data.message || 'Код илгээлээ!');
      setStep(2);
    } catch (error) {
      setMessage(error.response?.data?.error || 'Алдаа гарлаа.');
    }
  };

  const handleVerifyResetCode = async () => {
    try {
      const response = await axios.post('http://localhost:5000/api/verify-reset-code', { email, code });
      setMessage(response.data.message || 'Код баталгаажсан!');
      setStep(3);
    } catch (error) {
      setMessage(error.response?.data?.error || 'Алдаа гарлаа.');
    }
  };

  const handleResetPassword = async () => {
    try {
      const response = await axios.post('http://localhost:5000/api/reset-password', { email, newPassword });
      setMessage(response.data.message || 'Нууц үг амжилттай солигдлоо!');
      navigate('/auth');
    } catch (error) {
      setMessage(error.response?.data?.error || 'Алдаа гарлаа.');
    }
  };

  return (
    <div className="max-w-md mx-auto p-6 bg-white rounded-lg shadow-md">
      <h2 className="text-2xl font-bold mb-4">Нууц үг сэргээх</h2>

      {step === 1 && (
        <div>
          <h3 className="text-xl font-semibold mb-2">Код хүсэх</h3>
          <input
            type="email"
            placeholder="И-мэйл хаяг"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full p-2 border border-gray-300 rounded-md mb-4"
          />
          <button
            onClick={handleRequestResetCode}
            className="w-full py-2 px-4 bg-[#99FFA9] text-white rounded-md hover:bg-[#8BCE91]"
          >
            Код хүсэх
          </button>
        </div>
      )}

      {step === 2 && (
        <div>
          <h3 className="text-xl font-semibold mb-2">Код баталгаажуулах</h3>
          <input
            type="email"
            placeholder="И-мэйл хаяг"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full p-2 border border-gray-300 rounded-md mb-4"
            readOnly
          />
          <input
            type="text"
            placeholder="Код"
            value={code}
            onChange={(e) => setCode(e.target.value)}
            className="w-full p-2 border border-gray-300 rounded-md mb-4"
          />
          <button
            onClick={handleVerifyResetCode}
            className="w-full py-2 px-4 bg-[#99FFA9] text-white rounded-md hover:bg-[#8BCE91]"
          >
            Код баталгаажуулах
          </button>
        </div>
      )}

      {step === 3 && (
        <div>
          <h3 className="text-xl font-semibold mb-2">Шинэ нууц үг үүсгэх</h3>
          <div className="relative mb-4">
            <input
              type={showPassword ? 'text' : 'password'}
              placeholder="Шинэ нууц үг"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              className="w-full p-2 border border-gray-300 rounded-md"
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute inset-y-0 right-0 flex items-center pr-3"
            >
              {showPassword ? "хаах" : "харах" }
            </button>
          </div>
          <button
            onClick={handleResetPassword}
            className="w-full py-2 px-4 bg-[#99FFA9] text-white rounded-md hover:bg-[#8BCE91]"
          >
            Нууц үг солих
          </button>
        </div>
      )}

      <div className="mt-4">
        {step === 1 && (
          <button
            onClick={() => navigate('/auth')}
            className="w-full py-2 px-4 text-blue-500 hover:underline"
          >
            Буцах
          </button>
        )}
        {step > 1 && (
          <button
            onClick={() => setStep(step - 1)}
            className="w-full py-2 px-4 text-blue-500 hover:underline"
          >
            Буцах
          </button>
        )}
      </div>

      {message && <p className="mt-4 text-center text-red-500">{message}</p>}
    </div>
  );
};

export default PasswordReset;
