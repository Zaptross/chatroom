import { Client } from './client';

export enum MessageType {
    JOIN = 'join',
    LEAVE = 'leave',
    MESSAGE = 'message',
}

export type Event = JoinEvent | LeaveEvent | MessageEvent;

export type JoinEvent = Client & {
    type: MessageType.JOIN;
    time: number;
};

export type LeaveEvent = Pick<Client, 'id'> & {
    type: MessageType.LEAVE;
    time: number;
};

export type MessageEvent = Pick<Client, 'id'> & {
    type: MessageType.MESSAGE;
    time: number;
    message: string;
};
