interface Speaker {
    name: string;
    bio: string;
    imageUrl: string;
}

export interface IEvent {
    id:string;
    _id?: string;
    title: string;
    description: string;
    startDate: Date;
    endDate: Date;
    location: string;
    maxAttendees: number;
    speakers: Speaker[];
    imageUrl: string;
    registrationLink: string;
    category: string;
    status: 'upcoming' | 'ongoing' | 'finished';
    eventDuration: number;
}
