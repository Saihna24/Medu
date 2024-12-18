import React, { useState } from 'react';

const CommentSection = ({ addComment }) => {
  const [name, setName] = useState('');
  const [comment, setComment] = useState('');

  const handleSubmit = (event) => {
    event.preventDefault();
    if (name && comment) {
      addComment({ name, text: comment });
      setName('');
      setComment('');
    }
  };

  return (
    <div>
      <h2 className="text-3xl font-bold text-gray-800 mb-4"> </h2>
      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <input
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Таны нэр"
          className="p-2 border border-gray-300 rounded"
        />
        <textarea
          value={comment}
          onChange={(e) => setComment(e.target.value)}
          placeholder="Таны сэтгэгдэл"
          className="p-2 border border-gray-300 rounded"
          rows="4"
        />
        <button
          type="submit"
          className="bg-primary text-white px-4 py-2 rounded-lg hover:bg-green-600"
        >
          Илгээх
        </button>
      </form>
    </div>
  );
};

export default CommentSection;
