interface Speaker {
    name: string;
    bio: string;
    imageUrl: string;
}
// import mongoose from "mongoose";

// }
export interface IEvent {
    title: string;
    description: string;
    startDate: Date;
    endDate: Date;
    location: string;
    maxAttendees: number;
    speakers:Speaker [];  // Array of ObjectId
    imageUrl: string;
    registrationLink: string;
    category: string;
    status:'upcoming'|'ongoing'| 'finished'
    eventDuration:number

}
