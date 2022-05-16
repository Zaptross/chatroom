import { Client, UserClient } from '.';

// Connect has no response json.
export type GetMessageConnectParams = UserClient;

// Register requires no params.
export type GetMessageRegisterResponse = Omit<UserClient, 'name'>;

export type GetMessageUsersParams = Omit<UserClient, 'name' | 'pk'>;
export type GetMessageUsersResponse = Client[];

// Message has no response json.
export type PostMessageParams = Pick<UserClient, 'id' | 'pk'> & {
    message: string;
};

export type DeleteMessageParams = Pick<UserClient, 'id' | 'pk'>;
