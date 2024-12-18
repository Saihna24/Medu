import React, { useRef } from 'react';

const CommentList = ({ comments }) => {
  const containerRef = useRef(null);

  const handleScroll = (event) => {
    const { scrollTop, scrollHeight, clientHeight } = event.currentTarget;
    if (scrollTop + clientHeight >= scrollHeight) {
      console.log('Scrolled to bottom');
    }
  };

  return (
    <div
      className="bg-white p-4 rounded-lg shadow-md overflow-y-auto max-h-[300px]"
      ref={containerRef}
      onScroll={handleScroll}
    >
      {comments.length === 0 ? (
        <p className="text-gray-600">No comments yet.</p>
      ) : (
        comments.map((comment, index) => (
          <div key={index} className="p-2 border-b border-gray-200">
            <p className="text-gray-800 font-bold">{comment.name}</p>
            <p className="text-gray-800">{comment.text}</p>
          </div>
        ))
      )}
    </div>
  );
};

export default CommentList;
