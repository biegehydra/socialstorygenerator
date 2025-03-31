import { Root, Message, Participant } from '../instagram-models';

/**
 * Interface for Instagram conversation statistics
 */
export interface InstagramStats {
    conversationTitle: string;
    participantCount: number;
    participants: string[];
    messageCount: number;
    firstMessageDate: Date;
    lastMessageDate: Date;
    topSenders: { name: string; count: number }[];
    mediaCount: {
        photos: number;
        videos: number;
        audio: number;
    };
    reactionCount: number;
}

/**
 * Process Instagram data and extract useful statistics and information
 */
export function processInstagramData(data: Root): InstagramStats {
    if (!data || !data.messages || !data.participants) {
        throw new Error('Invalid Instagram data format');
    }

    // Extract basic information
    const conversationTitle = data.title;
    const participants = data.participants.map(p => p.name);
    const participantCount = participants.length;
    const messageCount = data.messages.length;

    // Sort messages by timestamp (oldest first)
    const sortedMessages = [...data.messages].sort((a, b) => a.timestamp_ms - b.timestamp_ms);

    // Get first and last message dates
    const firstMessageDate = new Date(sortedMessages[0]?.timestamp_ms);
    const lastMessageDate = new Date(sortedMessages[sortedMessages.length - 1]?.timestamp_ms);

    // Count messages per sender
    const messageCountByParticipant = new Map<string, number>();

    // Count media types and reactions
    let photoCount = 0;
    let videoCount = 0;
    let audioCount = 0;
    let reactionCount = 0;

    // Process all messages
    for (const message of data.messages) {
        // Count messages by sender
        const sender = message.sender_name;
        messageCountByParticipant.set(sender, (messageCountByParticipant.get(sender) || 0) + 1);

        // Count photos
        if (message.photos && message.photos.length) {
            photoCount += message.photos.length;
        }

        // Count videos
        if (message.videos && message.videos.length) {
            videoCount += message.videos.length;
        }

        // Count audio files
        if (message.audio_files && message.audio_files.length) {
            audioCount += message.audio_files.length;
        }

        // Count reactions
        if (message.reactions && message.reactions.length) {
            reactionCount += message.reactions.length;
        }
    }

    // Get top senders (sorted by message count)
    const topSenders = Array.from(messageCountByParticipant.entries())
        .map(([name, count]) => ({ name, count }))
        .sort((a, b) => b.count - a.count);

    return {
        conversationTitle,
        participantCount,
        participants,
        messageCount,
        firstMessageDate,
        lastMessageDate,
        topSenders,
        mediaCount: {
            photos: photoCount,
            videos: videoCount,
            audio: audioCount,
        },
        reactionCount
    };
}

/**
 * Get a time period summary of the conversation
 */
export function getConversationTimeline(data: Root): { period: string; messageCount: number }[] {
    const messages = data.messages;
    const timeline: { period: string; messageCount: number }[] = [];

    // Group messages by month
    const messagesByMonth = new Map<string, number>();

    for (const message of messages) {
        const date = new Date(message.timestamp_ms);
        const month = date.toISOString().slice(0, 7); // YYYY-MM format
        messagesByMonth.set(month, (messagesByMonth.get(month) || 0) + 1);
    }

    // Convert to array and sort by date
    return Array.from(messagesByMonth.entries())
        .map(([period, messageCount]) => ({ period, messageCount }))
        .sort((a, b) => a.period.localeCompare(b.period));
}

/**
 * Extract conversation content by type
 */
export function getConversationContent(data: Root, contentType: 'text' | 'photos' | 'videos' | 'audio') {
    const results: { sender: string; timestamp: Date; content: any }[] = [];

    for (const message of data.messages) {
        const timestamp = new Date(message.timestamp_ms);
        const sender = message.sender_name;

        if (contentType === 'text' && message.content) {
            results.push({
                sender,
                timestamp,
                content: message.content
            });
        } else if (contentType === 'photos' && message.photos) {
            for (const photo of message.photos) {
                results.push({
                    sender,
                    timestamp,
                    content: photo
                });
            }
        } else if (contentType === 'videos' && message.videos) {
            for (const video of message.videos) {
                results.push({
                    sender,
                    timestamp,
                    content: video
                });
            }
        } else if (contentType === 'audio' && message.audio_files) {
            for (const audio of message.audio_files) {
                results.push({
                    sender,
                    timestamp,
                    content: audio
                });
            }
        }
    }

    return results.sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());
} 