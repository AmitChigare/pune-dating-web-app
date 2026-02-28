import { Profile, Photo } from '@/types';
import { getImageUrl } from '@/utils/imageUrl';
import { Heart, X, Star, ChevronLeft, ChevronRight } from 'lucide-react';
import { useState } from 'react';

interface ProfileCardProps {
    profile: Profile;
    onLike?: () => void;
    onPass?: () => void;
    onSuperLike?: () => void;
    showActions?: boolean;
}

export function ProfileCard({ profile, onLike, onPass, onSuperLike, showActions = true }: ProfileCardProps) {
    const photos = profile.photos && profile.photos.length > 0
        ? profile.photos
        : [{ url: 'https://via.placeholder.com/400x500' } as Photo];

    const [currentPhotoIndex, setCurrentPhotoIndex] = useState(0);

    const nextPhoto = (e: React.MouseEvent) => {
        e.stopPropagation();
        if (currentPhotoIndex < photos.length - 1) {
            setCurrentPhotoIndex(prev => prev + 1);
        }
    };

    const prevPhoto = (e: React.MouseEvent) => {
        e.stopPropagation();
        if (currentPhotoIndex > 0) {
            setCurrentPhotoIndex(prev => prev - 1);
        }
    };

    return (
        <div className="w-full max-w-sm mx-auto bg-white rounded-2xl overflow-hidden card-shadow">
            <div className="relative h-[500px] w-full bg-gray-100 group">
                <img
                    src={getImageUrl(photos[currentPhotoIndex].url)}
                    alt={profile.first_name}
                    className="object-cover w-full h-full"
                />

                {/* Photo Carousel Controls */}
                {photos.length > 1 && (
                    <>
                        <div className="absolute top-2 w-full flex gap-1 px-2 z-20">
                            {photos.map((_, i) => (
                                <div key={i} className={`h-1 flex-1 rounded-full ${i === currentPhotoIndex ? 'bg-white' : 'bg-white/40'}`} />
                            ))}
                        </div>

                        {currentPhotoIndex > 0 && (
                            <button onClick={prevPhoto} className="absolute left-2 top-1/2 -translate-y-1/2 p-1 bg-black/20 hover:bg-black/40 text-white rounded-full z-20 opacity-0 group-hover:opacity-100 transition-opacity">
                                <ChevronLeft size={24} />
                            </button>
                        )}

                        {currentPhotoIndex < photos.length - 1 && (
                            <button onClick={nextPhoto} className="absolute right-2 top-1/2 -translate-y-1/2 p-1 bg-black/20 hover:bg-black/40 text-white rounded-full z-20 opacity-0 group-hover:opacity-100 transition-opacity">
                                <ChevronRight size={24} />
                            </button>
                        )}

                        {/* Invisible clickable areas for easy tapping */}
                        <div className="absolute inset-y-0 left-0 w-1/2 z-10 cursor-pointer" onClick={prevPhoto} />
                        <div className="absolute inset-y-0 right-0 w-1/2 z-10 cursor-pointer" onClick={nextPhoto} />
                    </>
                )}

                <div className="absolute bottom-0 w-full bg-gradient-to-t from-black/60 to-transparent p-6 text-white pb-8 pointer-events-none z-20">
                    <h2 className="text-3xl font-serif font-bold">{profile.first_name}, {new Date().getFullYear() - new Date(profile.birth_date).getFullYear()}</h2>
                    <p className="text-lg opacity-90">{profile.bio}</p>
                </div>
            </div>

            {showActions && (
                <div className="flex justify-center items-center gap-6 p-6 -mt-8 relative z-10">
                    <button
                        onClick={onPass}
                        className="w-16 h-16 bg-white rounded-full flex items-center justify-center card-shadow text-gray-500 hover:text-red-500 hover:scale-105 transition-all"
                    >
                        <X size={32} />
                    </button>

                    <button
                        onClick={onSuperLike}
                        className="w-12 h-12 bg-white rounded-full flex items-center justify-center card-shadow text-blue-500 hover:scale-105 transition-all"
                    >
                        <Star size={24} />
                    </button>

                    <button
                        onClick={onLike}
                        className="w-16 h-16 bg-white rounded-full flex items-center justify-center card-shadow text-accent hover:text-red-500 hover:scale-105 transition-all"
                    >
                        <Heart size={32} fill="currentColor" className="text-accent" />
                    </button>
                </div>
            )}
        </div>
    );
}
