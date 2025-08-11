interface Speaker {
    name: string;
    bio: string;
    imageUrl: string;
}

export interface IEvent {
    _id?: string;
    title: string;
    description: string;
    agenda: string;
    startDate: Date | string;
    endDate: Date | string;
    location: string;
    maxAttendees: number;
    registered: number; // Number of people currently registered
    speakers: Speaker[];
    imageUrl: string;
    registrationLink: string;
    category: string;
    status: 'upcoming' | 'ongoing' | 'finished';
    eventDuration: number;
    registrationFee: number; // 0 for free events, positive number for paid events
}
