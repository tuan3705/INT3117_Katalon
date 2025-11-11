// A reusable component to display a single event's summary information.
// components/features/event-card.tsx

import { Event, User, EventStatus, RegistrationStatus } from '@prisma/client';
import Link from 'next/link';
import Image from 'next/image';

// Badge for manager
const EventStatusBadge = ({ status }: { status: EventStatus }) => {
    const statusConfig = {
        PENDING_APPROVAL: { text: 'Chờ duyệt', style: 'bg-yellow-100 text-yellow-800' },
        PUBLISHED: { text: 'Đã đăng', style: 'bg-green-100 text-green-800' },
        REJECTED: { text: 'Bị từ chối', style: 'bg-red-100 text-red-800' },
    };
    const config = statusConfig[status];
    if (!config) return null;
    return (
        <div className={`badge ${config.style} badge-sm font-semibold`}>
            {config.text}
        </div>
    );
};

// Badge for volunteer
const RegistrationStatusBadge = ({ status, isEventPast }: { status: RegistrationStatus, isEventPast: boolean }) => {
    let text = '';
    let style = '';

    switch (status) {
        case 'PENDING':
            text = 'Chờ duyệt';
            style = 'badge-warning';
            break;
        case 'APPROVED':
            if (isEventPast) {
                text = 'Không hoàn thành';
                style = 'badge-ghost';
            } else {
                text = 'Đã duyệt';
                style = 'badge-info';
            }
            break;
        case 'REJECTED':
            text = 'Bị từ chối';
            style = 'badge-error';
            break;
        case 'COMPLETED':
            text = 'Đã hoàn thành';
            style = 'badge-success';
            break;
    }

    if (!text) return null;
    return (
        <div className={`badge ${style} badge-sm font-semibold`}>
            {text}
        </div>
    );
};

// create an object with artribute creator
type EventWithCreator = Event & {
    creator: User;
};

type EventCardProps = {
    event: EventWithCreator;
    showStatus?: boolean;
    registrationStatus?: RegistrationStatus;
};



export const EventCard = ({ event, showStatus, registrationStatus }: EventCardProps) => {
    const eventDate = new Date(event.startDateTime).toLocaleDateString('vi-VN', {
        weekday: 'short',
        year: 'numeric',
        month: 'short',
        day: 'numeric',
    });

    const eventTime = new Date(event.startDateTime).toLocaleTimeString('vi-VN', {
        hour: '2-digit',
        minute: '2-digit',
    });

    const isEventPast = new Date(event.endDateTime) < new Date();

    // Category icons and colors
    const categoryConfig = {
        ENVIRONMENT: { icon: '🌱', color: 'text-success', bg: 'bg-success/10' },
        EDUCATION: { icon: '📚', color: 'text-info', bg: 'bg-info/10' },
        HEALTHCARE: { icon: '⚕️', color: 'text-error', bg: 'bg-error/10' },
        COMMUNITY: { icon: '🤝', color: 'text-warning', bg: 'bg-warning/10' },
    };

    const categoryInfo = categoryConfig[event.category] || categoryConfig.COMMUNITY;

    return (
        <Link href={`/events/${event.id}`} className="group">
            <div className="card bg-base-100 shadow-lg hover:shadow-2xl transition-all duration-300 border border-base-300 h-full group-hover:-translate-y-1">
                {/* Image placeholder */}
                <figure className="relative h-48 bg-gradient-to-br from-primary/20 to-secondary/20">
                    {event.imageUrl ? (
                        <Image src={event.imageUrl} alt={event.title} className="w-full h-full object-cover"></Image>
                    ) : (
                        <div className="flex items-center justify-center w-full h-full">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-20 w-20 text-primary/40" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                            </svg>
                        </div>
                    )}

                    {/* Category badge overlay */}
                    <div className={`absolute top-3 left-3 ${categoryInfo.bg} backdrop-blur-sm px-3 py-1 rounded-full flex items-center gap-2`}>
                        <span className="text-lg">{categoryInfo.icon}</span>
                    </div>

                    {/* Status badge overlay */}
                    {showStatus && (
                        <div className="absolute top-3 right-3">
                            <EventStatusBadge status={event.status} />
                        </div>
                    )}
                    {registrationStatus && (
                        <div className="absolute top-3 right-3">
                            <RegistrationStatusBadge status={registrationStatus} isEventPast={isEventPast} />
                        </div>
                    )}
                </figure>

                <div className="card-body">
                    {/* Creator */}
                    <div className="flex items-center gap-2 text-sm text-base-content/60">
                        <div className="avatar placeholder">
                            <div className="bg-primary/10 text-primary rounded-full w-6">
                                <span className="text-xs">
                                    {event.creator.name?.charAt(0).toUpperCase() || 'U'}
                                </span>
                            </div>
                        </div>
                        <span className="font-medium">{event.creator.name}</span>
                    </div>

                    {/* Title */}
                    <h3 className="card-title text-lg line-clamp-2 group-hover:text-primary transition-colors">
                        {event.title}
                    </h3>

                    {/* Location */}
                    <div className="flex items-center gap-2 text-sm text-base-content/70">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                        </svg>
                        <span className="line-clamp-1">{event.location}</span>
                    </div>

                    {/* Date & Time */}
                    <div className="flex items-center gap-2 text-sm text-base-content/70">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                        </svg>
                        <span>{eventDate} • {eventTime}</span>
                    </div>

                    {/* Footer - View Details */}
                    <div className="card-actions justify-end mt-4">
                        <button className="btn btn-primary btn-sm gap-2 group-hover:btn-active">
                            Xem chi tiết
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                            </svg>
                        </button>
                    </div>
                </div>
            </div>
        </Link>
    );
};