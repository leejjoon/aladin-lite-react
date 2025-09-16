// components/InfoModal.tsx
import React from 'react';

interface InfoModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const InfoModal: React.FC<InfoModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  const coverageMapUrl = 'https://spherex-hips-data.web.app/hips_rgb';
  const channelMapUrlTemplate = 'https://spherex-hips-data.web.app/SPHx_Allsky_L2_{band}_C{channel:03d}_N2048';

  const generateExampleUrl = (band: string, channel: number) => {
    const channelString = String(channel).padStart(3, '0');
    return channelMapUrlTemplate.replace('{band}', band).replace('{channel:03d}', channelString);
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex justify-center items-center">
      <div className="bg-gray-800 text-white rounded-lg shadow-xl p-6 w-full max-w-2xl">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-2xl font-bold text-cyan-400">SPHEREx HiPS Survey Information</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-white text-2xl">&times;</button>
        </div>
        <div className="space-y-4 text-gray-300">
          <p>
            This interface provides access to the SPHEREx all-sky survey data, presented as Hierarchical Progressive Surveys (HiPS).
          </p>
          <div>
            <h3 className="font-semibold text-cyan-500">Default Coverage Map URL:</h3>
            <a href={coverageMapUrl} target="_blank" rel="noopener noreferrer" className="text-sm text-blue-400 hover:underline break-all">{coverageMapUrl}</a>
          </div>
          <div>
            <h3 className="font-semibold text-cyan-500">Channel Maps URL Template:</h3>
            <p className="text-sm bg-gray-700 p-2 rounded break-all">{channelMapUrlTemplate}</p>
          </div>
          <div>
            <h3 className="font-semibold text-cyan-500">Example Channel Map URLs:</h3>
            <ul className="list-disc list-inside text-sm space-y-1">
              <li>
                <span className="font-mono">Band B1, Channel 1:</span>
                <a href={generateExampleUrl('B1', 1)} target="_blank" rel="noopener noreferrer" className="ml-2 text-blue-400 hover:underline break-all">{generateExampleUrl('B1', 1)}</a>
              </li>
              <li>
                <span className="font-mono">Band B2, Channel 18:</span>
                <a href={generateExampleUrl('B2', 18)} target="_blank" rel="noopener noreferrer" className="ml-2 text-blue-400 hover:underline break-all">{generateExampleUrl('B2', 18)}</a>
              </li>
              <li>
                <span className="font-mono">Band B6, Channel 88:</span>
                <a href={generateExampleUrl('B6', 88)} target="_blank" rel="noopener noreferrer" className="ml-2 text-blue-400 hover:underline break-all">{generateExampleUrl('B6', 88)}</a>
              </li>
            </ul>
          </div>
        </div>
        <div className="mt-6 text-right">
          <button
            onClick={onClose}
            className="bg-cyan-500 hover:bg-cyan-600 text-white font-bold py-2 px-4 rounded"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

export default InfoModal;
