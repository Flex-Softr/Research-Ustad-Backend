interface Speaker {
    name: string;
    bio: string;
    imageUrl: string;
}

export interface IEvent {
    _id?: string;
    title: string;
    description: string;
    startDate: Date | string;
    endDate: Date | string;
    location: string;
    maxAttendees: number;
    speakers: Speaker[];
    imageUrl: string;
    registrationLink: string;
    category: string;
    status: 'upcoming' | 'ongoing' | 'finished';
    eventDuration: number;
}
