import React, { useEffect } from 'react';
import { Folder, Award, MoreVertical, Plus, Menu } from 'lucide-react';

export const PanicOverlay = ({ isOpen, onExit }) => {
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape' && isOpen) {
        onExit();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onExit]);

  if (!isOpen) return null;

  const mockClasses = [
    {
      id: 1,
      name: 'AP US History - Period 2',
      section: 'Mr. Richardson • Room 204',
      due: 'Due tomorrow: Chapter 18 DBQ Outline',
      color: 'bg-emerald-700',
    },
    {
      id: 2,
      name: 'Honors Physics 1',
      section: 'Dr. Evelyn Martinez • Science Lab 3',
      due: 'Due Friday: Kinematics Lab Report',
      color: 'bg-blue-700',
    },
    {
      id: 3,
      name: 'Algebra II & Trigonometry',
      section: 'Ms. Jenkins • Room 112',
      due: 'No work due soon',
      color: 'bg-indigo-700',
    },
    {
      id: 4,
      name: 'English Literature 11',
      section: 'Mrs. Gallagher • Library Wing',
      due: 'Due next Tuesday: Great Gatsby Essay Draft',
      color: 'bg-amber-700',
    },
    {
      id: 5,
      name: 'Spanish III',
      section: 'Señor Gomez • Room 108',
      due: 'Due Thursday: Vocab Unit 4 Quiz',
      color: 'bg-rose-700',
    },
    {
      id: 6,
      name: 'Computer Science Principles',
      section: 'Mr. Zhao • Tech Lab B',
      due: 'Due Friday: Algorithm Complexity Worksheet',
      color: 'bg-teal-700',
    },
  ];

  return (
    <div className="fixed inset-0 z-[100] bg-white text-gray-800 font-sans overflow-y-auto select-none">
      {/* Mock Google Classroom Navigation */}
      <header className="border-b border-gray-200 bg-white sticky top-0 z-10 px-4 h-16 flex items-center justify-between shadow-xs">
        <div className="flex items-center gap-4">
          <button className="p-2 rounded-full hover:bg-gray-100 text-gray-600">
            <Menu className="w-5 h-5" />
          </button>
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-emerald-600 text-white flex items-center justify-center font-bold text-sm">
              C
            </div>
            <span className="text-xl font-medium text-gray-700 tracking-tight">
              Google Classroom
            </span>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button className="p-2 rounded-full hover:bg-gray-100 text-gray-600">
            <Plus className="w-5 h-5" />
          </button>

          {/* Discreet Uncloak Button */}
          <button
            onClick={onExit}
            className="px-3 py-1.5 rounded-full text-xs font-medium text-gray-500 hover:text-gray-800 hover:bg-gray-100 border border-gray-200 transition-colors"
            title="Press Esc or click here to resume Nova Games"
          >
            Return (Esc)
          </button>

          <div className="w-8 h-8 rounded-full bg-blue-600 text-white flex items-center justify-center font-semibold text-xs">
            S
          </div>
        </div>
      </header>

      {/* Main Class Cards Grid */}
      <main className="max-w-6xl mx-auto p-6">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-6 text-sm font-medium text-gray-600 border-b border-gray-200 pb-2 w-full">
            <span className="text-emerald-700 font-semibold border-b-2 border-emerald-600 pb-2 -mb-2">
              To-do
            </span>
            <span className="cursor-pointer hover:text-gray-900">Enrolled</span>
            <span className="cursor-pointer hover:text-gray-900">Calendar</span>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {mockClasses.map((item) => (
            <div
              key={item.id}
              onClick={onExit}
              className="border border-gray-200 rounded-lg overflow-hidden shadow-xs hover:shadow-md transition-shadow cursor-pointer bg-white flex flex-col justify-between h-64"
            >
              <div>
                <div className={`${item.color} p-4 text-white relative`}>
                  <div className="flex items-start justify-between">
                    <div>
                      <h3 className="font-semibold text-lg line-clamp-1">{item.name}</h3>
                      <p className="text-xs text-white/80 mt-1">{item.section}</p>
                    </div>
                    <MoreVertical className="w-5 h-5 text-white/80" />
                  </div>
                </div>

                <div className="p-4">
                  <div className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">
                    Upcoming
                  </div>
                  <p className="text-xs text-gray-700 font-medium">{item.due}</p>
                </div>
              </div>

              <div className="p-3 border-t border-gray-100 flex justify-end gap-2 text-gray-500">
                <button className="p-2 hover:bg-gray-50 rounded-full">
                  <Folder className="w-4 h-4" />
                </button>
                <button className="p-2 hover:bg-gray-50 rounded-full">
                  <Award className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      </main>
    </div>
  );
};
