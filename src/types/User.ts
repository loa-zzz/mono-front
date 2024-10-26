export interface User {
    id: number;
    name: string;
    age: number;
}
// ユーザー情報の型を確認する関数
export function validateUser(user: User): user is User {
    return (
        typeof user.id === 'number' &&
        typeof user.name === 'string' &&
        typeof user.age === 'number'
    );
}