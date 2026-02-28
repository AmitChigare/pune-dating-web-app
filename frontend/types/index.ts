export type UserRole = "user" | "admin";

export interface User {
    id: string;
    email: string;
    is_active: boolean;
    is_verified: boolean;
    role: UserRole;
    created_at: string;
}

export interface Profile {
    id: string;
    user_id: string;
    first_name: string;
    last_name?: string;
    bio?: string;
    birth_date: string;
    gender: string;
    interested_in: string;
    latitude?: number;
    longitude?: number;
    phone_number?: string;
    photos?: Photo[];
}

export interface Photo {
    id: string;
    url: string;
    is_primary: boolean;
    order: number;
}

export interface Match {
    id: string;
    user1_id: string;
    user2_id: string;
    is_active: boolean;
    created_at: string;
    peer_profile?: Profile; // hydrated on frontend
}

export interface Message {
    id: string;
    match_id: string;
    sender_id: string;
    content: string;
    is_read: boolean;
    created_at: string;
}

export interface Report {
    id: string;
    reporter_id: string;
    reported_id: string;
    reason: string;
    details?: string;
    status: "pending" | "resolved" | "dismissed";
    created_at: string;
}
