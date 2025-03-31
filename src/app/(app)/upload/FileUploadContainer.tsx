'use client';

import { useState } from 'react';
import FileUpload from '@/app/components/FileUpload';
import { InstagramStats } from '@/lib/processors';

type ProcessJsonResult = {
    success: boolean;
    message?: string;
    data?: any;
    stats?: InstagramStats;
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
            // Create a FormData object to send to server
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

    const formatDate = (date: Date): string => {
        return new Date(date).toLocaleDateString(undefined, {
            year: 'numeric',
            month: 'short',
            day: 'numeric'
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
                            {result.stats && (
                                <div className="mt-4 bg-white p-4 rounded-lg border border-gray-200 text-gray-800">
                                    <h4 className="text-lg font-medium mb-3">{result.stats.conversationTitle}</h4>

                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <div className="space-y-2">
                                            <div className="flex justify-between">
                                                <span className="text-gray-600">Participants:</span>
                                                <span className="font-medium">{result.stats.participantCount}</span>
                                            </div>
                                            <div className="flex justify-between">
                                                <span className="text-gray-600">Messages:</span>
                                                <span className="font-medium">{result.stats.messageCount.toLocaleString()}</span>
                                            </div>
                                            <div className="flex justify-between">
                                                <span className="text-gray-600">Date Range:</span>
                                                <span className="font-medium">
                                                    {formatDate(result.stats.firstMessageDate)} - {formatDate(result.stats.lastMessageDate)}
                                                </span>
                                            </div>
                                        </div>

                                        <div className="space-y-2">
                                            <div className="flex justify-between">
                                                <span className="text-gray-600">Photos:</span>
                                                <span className="font-medium">{result.stats.mediaCount.photos.toLocaleString()}</span>
                                            </div>
                                            <div className="flex justify-between">
                                                <span className="text-gray-600">Videos:</span>
                                                <span className="font-medium">{result.stats.mediaCount.videos.toLocaleString()}</span>
                                            </div>
                                            <div className="flex justify-between">
                                                <span className="text-gray-600">Audio:</span>
                                                <span className="font-medium">{result.stats.mediaCount.audio.toLocaleString()}</span>
                                            </div>
                                            <div className="flex justify-between">
                                                <span className="text-gray-600">Reactions:</span>
                                                <span className="font-medium">{result.stats.reactionCount.toLocaleString()}</span>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="mt-4">
                                        <h5 className="font-medium mb-2">Top Participants</h5>
                                        <div className="space-y-1">
                                            {result.stats.topSenders.slice(0, 5).map((sender, index) => (
                                                <div key={index} className="flex justify-between">
                                                    <span>{sender.name}</span>
                                                    <span className="font-medium">{sender.count.toLocaleString()} messages</span>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
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