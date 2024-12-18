import React from 'react';

const AboutPage = () => {
  return (
    <main className="bg-gray-100 min-h-screen py-12 px-4 sm:px-6 lg:px-8">
      <section className="container mx-auto mb-12 px-4 sm:px-6 lg:px-8">
        <h1 className="text-3xl sm:text-4xl font-bold text-gray-800 mb-8 text-center">Бидний тухай</h1>
        <p className="text-base sm:text-lg text-gray-600 mb-6">
          Манай цахим сургалтын платформд тавтай морил! Бидний эрхэм зорилго бол суралцагчдад зорилгодоо 
          хүрэхэд нь туслах өндөр чанартай боловсролын нөөцөөр хангах явдал юм. Бид хүн бүр өөрийн хэрэгцээнд 
          нийцсэн зүйлийг олох боломжтой болгохын тулд янз бүрийн салбаруудаас өргөн хүрээний сургалтуудыг санал болгож байна.
        </p>
        <p className="text-base sm:text-lg text-gray-600 mb-6">
          Манай платформ нь интерактив контент, мэргэжилтэн багш нар болон сайжруулах уян хатан сургалтын сонголтуудтай
          таны боловсролын туршлага. Бид таныг амжилтад хүрч, чадавхдаа бүрэн хүрэхэд тань туслах үүрэг хүлээдэг.
        </p>
        <p className="text-base sm:text-lg text-gray-600">
          Манай платформыг сонгосон танд баярлалаа. Хэрэв танд асуулт байгаа эсвэл тусламж хэрэгтэй бол чөлөөтэй асуугаарай
          бидэнтэй холбоо барина уу. Бид туслахаар энд байна!
        </p>
      </section>
      
      {/* Contact Section */}
      <section className="container mx-auto px-4 sm:px-6 lg:px-8 py-6 bg-white rounded-lg shadow-md">
        <h2 className="text-2xl sm:text-3xl font-bold text-gray-800 mb-4 text-center">Бидэнтэй холбогдох</h2>
        <p className="text-base sm:text-lg text-gray-600 mb-4 text-center">
          Хэрэв танд асуух зүйл байвал доорхи холбоо барих хаягаар бидэнтэй холбогдоно уу.
        </p>
        <div className="flex flex-col items-center">
          <p className="text-base sm:text-lg text-gray-800 mb-2">И-Мэйл: Medu-online-course@gmail.com</p>
          <p className="text-base sm:text-lg text-gray-800 mb-2">Утас: (976) 8000-0000</p>
          <p className="text-base sm:text-lg text-gray-800 mb-2">Хаяг: Улаанбаатар хот</p>
        </div>
      </section>
    </main>
  );
};

export default AboutPage;
