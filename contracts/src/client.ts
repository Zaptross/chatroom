export type Client = {
    color: string;
    name: string;
    id: string;
};

export type UserClient = Client & {
    pk: string;
};
