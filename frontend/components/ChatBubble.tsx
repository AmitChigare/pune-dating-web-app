import { Message } from '@/types';
import { cn } from './Button';

interface ChatBubbleProps {
    message: Message;
    isMe: boolean;
}

export function ChatBubble({ message, isMe }: ChatBubbleProps) {
    return (
        <div className={cn("flex w-full mt-2 space-x-3 max-w-md", isMe ? "ml-auto justify-end" : "")}>
            <div className={cn(
                "p-3 rounded-2xl max-w-[80%]",
                isMe ? "bg-accent text-white rounded-br-sm" : "bg-primary text-black rounded-bl-sm"
            )}>
                <p className="text-sm">{message.content}</p>
            </div>
        </div>
    );
}
