import React from 'react';
import AdminTeacherRequestsPage from './AdminTeacherRequestsPage';
import AdminLessonRequestList from './AdminLessonRequestList';

const AdminRequestsSection = ({ teacherRequests, lessonRequests }) => {
    return (
        <div className="flex h-screen bg-gray-100 p-6 overflow-hidden">
            {/* Багшийн хүсэлтүүдийн хэсэг */}
            <div className="flex-1 bg-white shadow-md rounded-lg p-6 overflow-y-auto">
                <h2 className="text-xl font-semibold mb-4">Багшийн хүсэлтүүд</h2>
                <AdminTeacherRequestsPage requests={teacherRequests} />
            </div>

            {/* Хичээлүүдийн хүсэлтүүдийн хэсэг */}
            <div className="flex-1 bg-white shadow-md rounded-lg p-6 overflow-y-auto">
                <h2 className="text-xl font-semibold mb-4">Хичээл үүсгэх хүсэлтүүд</h2>
                <AdminLessonRequestList requests={lessonRequests} />
            </div>
        </div>
    );
};

export default AdminRequestsSection;
