interface PromptCardProps {
    question: string;
    answer: string;
}

export function PromptCard({ question, answer }: PromptCardProps) {
    return (
        <div className="w-full max-w-sm mx-auto bg-white rounded-2xl p-8 my-4 card-shadow text-center">
            <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-4">{question}</h3>
            <p className="text-2xl font-serif text-accent leading-relaxed">"{answer}"</p>
        </div>
    );
}
