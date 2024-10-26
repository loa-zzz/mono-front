import type { PageLoad } from './$types';
import type { User } from '../../../types/User';
import { error } from '@sveltejs/kit';

export const load: PageLoad = async ({ params, fetch }) => {
    const RESPONSE = await fetch(`http://localhost:8080/users/${params.id}`, {
        method: 'GET'
    });

    if (!RESPONSE.ok) {
        throw error(404, `Could not fetch user with id ${params.id}`);
    }

    const USER: User = await RESPONSE.json();

    if (!USER) {
        throw error(404, `User with id ${params.id} not found`);
    }

    return {
        user: USER
    };
}
