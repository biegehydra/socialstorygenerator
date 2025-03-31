export interface Root {
    participants: Participant[]
    messages: Message[]
    title: string
    is_still_participant: boolean
    thread_path: string
    magic_words: any[]
    joinable_mode: JoinableMode
  }
  
  export interface Participant {
    name: string
  }
  
  export interface Message {
    sender_name: string
    timestamp_ms: number
    content?: string
    reactions?: Reaction[]
    share?: Share
    is_geoblocked_for_viewer: boolean
    photos?: Photo[]
    sticker?: Sticker
    audio_files?: AudioFile[]
    videos?: Video[]
  }
  
  export interface Reaction {
    reaction: string
    actor: string
  }
  
  export interface Share {
    link?: string
    share_text?: string
    original_content_owner?: string
  }
  
  export interface Photo {
    uri: string
    creation_timestamp?: number
    ai_stickers?: AiSticker[]
  }
  
  export interface AiSticker {
    input: string
  }
  
  export interface Sticker {
    uri: string
    ai_stickers: AiSticker2[]
  }
  
  export interface AiSticker2 {
    input: string
  }
  
  export interface AudioFile {
    uri: string
    creation_timestamp: number
  }
  
  export interface Video {
    uri: string
    creation_timestamp?: number
  }
  
  export interface JoinableMode {
    mode: number
    link: string
  }
  