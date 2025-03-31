'use server';

import { revalidatePath } from 'next/cache';

// Type for the expected JSON structure
type SocialData = {
    // Define your expected JSON structure here
    // For example:
    posts?: Array<any>;
    user?: {
        name?: string;
        id?: string;
    };
    // Add other expected fields
};

/**
 * Process the uploaded JSON file
 */
export async function processJsonFile(formData: FormData): Promise<{ success: boolean; message?: string; data?: SocialData }> {
    try {
        const file = formData.get('file') as File;

        if (!file) {
            return { success: false, message: 'No file uploaded' };
        }

        // Validate file type
        if (!file.name.toLowerCase().endsWith('.json') && !file.type.includes('json')) {
            return { success: false, message: 'Only JSON files are allowed' };
        }

        // Read file content
        const content = await file.text();

        // Parse JSON
        let data: SocialData;
        try {
            data = JSON.parse(content);
        } catch (e) {
            return { success: false, message: 'Invalid JSON format' };
        }

        // Validate the structure if needed
        // This is where you could add validation for the expected structure

        // Store the data or process it further
        // For example, you could save it to a database or analyze it

        // Revalidate the path to refresh the data on the client
        revalidatePath('/');

        return {
            success: true,
            data
        };
    } catch (error) {
        console.error('Error processing file:', error);
        return {
            success: false,
            message: error instanceof Error ? error.message : 'Failed to process file'
        };
    }
} 