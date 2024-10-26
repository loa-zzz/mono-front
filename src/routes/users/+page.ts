import { validateUser, type User } from '../../types/User';

export async function load({ fetch }) {
    let loading = true;
    let users: User[] = [];
    let errorMessage = '';

    try {
        // ユーザーデータをフェッチ
        const RESPONSE = await fetch('http://localhost:8080/users', {
            method: 'GET',
            credentials: 'include', // 認証情報を送信する場合
            headers: {
              'Content-Type': 'application/json',
            }
          });

        // ステータスコードが正常ではない場合はエラーを投げる
        if (!RESPONSE.ok) {
            throw new Error(`HTTPエラー: ${RESPONSE.status}`);
        }

        users = await RESPONSE.json();

        // 取得したユーザーデータの型を確認する
        if (!Array.isArray(users) || !users.every(user => validateUser(user))) {
            throw new Error('ユーザー情報の形式が正しくありません');
        }
    } catch (error) {
        console.error('データ取得エラー:', error);
        errorMessage = 'データ取得に失敗しました。';
    } finally {
        loading = false;
    }

    console.log('データのロード状態:', loading);
    return { users, loading, errorMessage };
}

