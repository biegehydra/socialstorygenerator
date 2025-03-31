'use client';

import { useState } from 'react';
import FileUpload from '@/app/components/FileUpload';

type ProcessJsonResult = {
    success: boolean;
    message?: string;
    data?: any;
};

type FileUploadContainerProps = {
    serverAction: (formData: FormData) => Promise<ProcessJsonResult>;
};

export default function FileUploadContainer({ serverAction }: FileUploadContainerProps) {
    const [result, setResult] = useState<ProcessJsonResult | null>(null);
    const [isProcessing, setIsProcessing] = useState(false);

    const handleFileSelected = async (file: File) => {
        setIsProcessing(true);
        setResult(null);

        try {
            // Create a FormData object to send to the server
            const formData = new FormData();
            formData.append('file', file);

            // Call the server action
            const response = await serverAction(formData);
            setResult(response);

            // You could add additional client-side handling here
            // For example, redirect to another page on success
            if (response.success) {
                console.log('File processed successfully:', response.data);
            }

        } catch (error) {
            console.error('Error processing file:', error);
            setResult({
                success: false,
                message: error instanceof Error ? error.message : 'An unexpected error occurred'
            });
        } finally {
            setIsProcessing(false);
        }
    };

    const handleError = (error: string) => {
        setResult({
            success: false,
            message: error
        });
    };

    return (
        <div className="space-y-6">
            <FileUpload
                onFileSelected={handleFileSelected}
                onError={handleError}
            />

            {!isProcessing && result && (
                <div className={`mt-4 p-4 rounded-md ${result.success ? 'bg-green-50' : 'bg-red-50'}`}>
                    {result.success ? (
                        <div className="text-green-700">
                            <h3 className="font-medium">File uploaded successfully!</h3>
                            {result.data && (
                                <div className="mt-2">
                                    <p>Your data is ready for processing.</p>
                                    {/* You could display a summary of the uploaded data here */}
                                </div>
                            )}
                        </div>
                    ) : (
                        <div className="text-red-700">
                            <h3 className="font-medium">Error</h3>
                            <p>{result.message || 'An unknown error occurred'}</p>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
} 