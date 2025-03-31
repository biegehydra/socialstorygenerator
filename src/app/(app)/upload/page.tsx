import { processJsonFile } from '@/app/actions/upload';
import FileUploadContainer from './FileUploadContainer';

export default function UploadPage() {
    return (
        <div className="w-full max-w-2xl mx-auto bg-white p-8 rounded-lg shadow-md">
            <h1 className="text-2xl font-bold text-gray-900 mb-6">Upload Social Media Data</h1>
            <p className="mb-6 text-gray-600">
                Upload your social media export file in JSON format to generate stories.
            </p>

            <FileUploadContainer serverAction={processJsonFile} />
        </div>
    );
} 