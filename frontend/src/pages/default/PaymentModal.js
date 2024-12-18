import React, { useState } from 'react';
import axios from 'axios';
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import qrCode from '../../assets/qrCode.png'
import khan from '../../assets/khan.png';
import tdb from '../../assets/tdb.png';
import arig from '../../assets/arig.png';
import golomt from '../../assets/golomt.png';
import has from '../../assets/has.png';
import mbank from '../../assets/m-bank.png';
import turiin from '../../assets/turiin.png';
const PaymentModal = ({ isOpen, onClose, courseId, userId, price }) => {
  const [paymentMethod, setPaymentMethod] = useState('bank'); // Анхны төлбөрийн сонголт

  if (!isOpen) return null;

  const handleOverlayClick = (e) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await axios.post('/api/purchase', { userId, courseId });
      toast.success('Сургалт амжилттай худалдаж авлаа');
      onClose();
    } catch (error) {
      console.error('Төлбөрийн алдаа:', error);
      toast.error('Төлбөрийг баталгаажуулахад алдаа гарлаа');
    }
  };

  return (
    <div
      className="fixed inset-0 flex items-center justify-center z-50 bg-black bg-opacity-50"
      onClick={handleOverlayClick}
    >
      <div
        className="bg-white p-6 rounded shadow-lg w-96"
        onClick={(e) => e.stopPropagation()}
      >
        <h2 className="text-xl font-semibold mb-4">Төлбөрийн мэдээлэл</h2>
        <div className="flex mb-4">
          <button
            onClick={() => setPaymentMethod('bank')}
            className={`flex-1 px-4 py-2 ${
              paymentMethod === 'bank' ? 'bg-primary-bright text-white' : 'bg-gray-200'
            } rounded-l`}
          >
            Дансаар төлөх
          </button>
          <button
            onClick={() => setPaymentMethod('qr')}
            className={`flex-1 px-4 py-2 ${
              paymentMethod === 'qr' ? 'bg-primary-bright text-white' : 'bg-gray-200'
            } rounded-r`}
          >
            QR-ээр төлөх
          </button>
        </div>

        {paymentMethod === 'bank' ? (
          <form onSubmit={handleSubmit}>
            {/* Дансаар төлөх хэсэг */}
            <div className="mb-4">
              <label className="block text-sm font-medium">Хүлээн авагч банк:</label>
              <input
                type="text"
                readOnly
                value="Худалдаа хөгжлийн банк"
                className="mt-1 p-2 border border-gray-300 rounded w-full"
              />
            </div>
            <div className="mb-4">
              <label className="block text-sm font-medium">Дансны дугаар:</label>
              <input
                type="text"
                readOnly
                value="429002284"
                className="mt-1 p-2 border border-gray-300 rounded w-full"
              />
            </div>
            <div className="mb-4">
              <label className="block text-sm font-medium">Хүлээн авагчийн нэр:</label>
              <input
                type="text"
                readOnly
                value="Мөнхсайхан Бадамцэцэг"
                className="mt-1 p-2 border border-gray-300 rounded w-full"
              />
            </div>
            <div className="mb-4">
              <label className="block text-sm font-medium">Гүйлгээний утга:</label>
              <input
                type="text"
                readOnly
                value={`${userId}-${courseId}`}
                className="mt-1 p-2 border border-gray-300 rounded w-full"
              />
            </div>
            <div className="mb-4">
              <label className="block text-sm font-medium">Сургалтын үнэ:</label>
              <input
                type="text"
                readOnly
                value={`${price}₮`}
                className="mt-1 p-2 border border-gray-300 rounded w-full"
              />
            </div>
            <div className="flex justify-end">
              <button
                type="button"
                onClick={onClose}
                className="mr-2 px-4 py-2 bg-gray-500 hover:bg-gray-700 text-white rounded"
              >
                Хаах
              </button>
              <button
                type="submit"
                className="px-4 py-2 bg-primary hover:bg-primary-bright text-white rounded"
              >
                Төлбөрийг баталгаажуулах
              </button>
            </div>
          </form>
        ) : (
          <div>
            {/* QR-ээр төлөх хэсэг */}
            <div className="mb-4">
              {/* <h3 className="text-lg font-semibold">QR-ээр төлөх</h3> */}
              <img
                src={qrCode}
                alt="QR код"
                className="mx-auto mb-4"
              />
              <div className="flex justify-center flex-wrap gap-4 mb-4">
                {/* Монгол банкнуудын логонууд */}
                <img src={khan} alt="Хаан банк" className="h-12 w-12 object-contain" />
                <img src={golomt} alt="Голомт банк" className="h-12 w-12 object-contain" />
                <img src={mbank} alt="М банк" className="h-12 w-12 object-contain" />
                <img src={turiin} alt="Төрийн банк" className="h-12 w-12 object-contain" />
                <img src={tdb} alt="Худалдаа хөгжлийн банк" className="h-12 w-12 object-contain" />
                <img src={arig} alt="Ариг банк" className="h-12 w-12 object-contain" />
                <img src={has} alt="Хас банк" className="h-12 w-12 object-contain" />
              </div>
              <div className="flex justify-end">
                <button
                  type="button"
                  onClick={onClose}
                  className="mr-2 px-4 py-2 bg-gray-500 hover:bg-gray-700 text-white rounded"
                >
                  Хаах
                </button>
                <button
                  onClick={handleSubmit}
                  className="px-4 py-2 bg-primary hover:bg-primary-bright text-white rounded"
                >
                  Төлбөрийг баталгаажуулах
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default PaymentModal;
