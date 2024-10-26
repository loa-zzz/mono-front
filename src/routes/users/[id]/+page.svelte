<script lang="ts">
	import { goto } from '$app/navigation';
	import type { User } from '../../../types/User'; // Userインターフェースのパスを指定

	/** @type {import('./$types').PageData} */
	export let data;
	let user: User | null = data.user || null; // ユーザー情報を初期化
	let originalUser: User | null = user ? { ...user } : null; // 初期状態を保持するための変数

	let isNewMode = false; // 新規登録モードかどうかを判定
	type ErrorMessages = { id: string; name: string; age: string };
	let errorMessages: ErrorMessages = { id: '', name: '', age: '' }; // エラーメッセージの初期化
	let touchedFields = { id: false, name: false, age: false }; // フィールドごとのタッチ状態
	let loading = false; // ローディング状態
	const HALF_SIZE_NUM_REGEXP = /^\d+$/; // 半角数字の正規表現
	const HALF_SIZE_ALPHA_REGEXP = /^[A-Za-z\s]+$/; // 半角英字の正規表現

	// 新規登録モードに切り替える関数
	function enterNewMode() {
        // フィールドを空にする
		user = { id: '', name: '', age: ''}; // input type=text
		isNewMode = true; // 新規登録モードを有効にする
		clearErrorMessages(); // エラーメッセージもクリア
		touchedFields = { id: false, name: false, age: false }; // フィールドのタッチ状態をリセット
	}

	// エラーメッセージをクリアする関数
	function clearErrorMessages() {
		errorMessages = { id: '', name: '', age: '' }; // エラーメッセージを初期化
	}

	// バリデーションを実行する関数
	function validateFields(): boolean {
		// 全てのバリデーションが通っているか確認
		return validateId() && validateName() && validateAge();
	}

	// 各フィールドのバリデーションを実行する共通関数
	function validateField<T extends keyof User>(
		field: T,
		user: User,
		regex: RegExp,
		message: string
	): boolean {
		if (user[field] === null) return false; // プロパティがnullの場合はバリデーション失敗
		const value = user[field].toString(); // プロパティを文字列に変換
		if (touchedFields[field] && !regex.test(value)) {
			errorMessages[field] = message; // エラーメッセージを設定
			return false; // バリデーション失敗
		}
		errorMessages[field] = ''; // エラーメッセージをクリア
		return true; // バリデーション成功
	}

	// IDのバリデーションを行う関数
	function validateId(): boolean {
		if (user) {
			return validateField('id', user, HALF_SIZE_NUM_REGEXP, 'IDは半角数字のみです');
		}
		return false; // userがnullまたはundefinedの場合は失敗
	}

	// 名前のバリデーションを行う関数
	function validateName(): boolean {
		if (user) {
			return validateField('name', user, HALF_SIZE_ALPHA_REGEXP, '名前は半角英字のみです');
		}
		return false; // userがnullまたはundefinedの場合は失敗
	}

	// 年齢のバリデーションを行う関数
	function validateAge(): boolean {
		if (user) {
			return validateField('age', user, HALF_SIZE_NUM_REGEXP, '年齢は半角数字のみです');
		}
		return false; // userがnullまたはundefinedの場合は失敗
	}

	// フォームが変更されたかを確認
	$: hasChanges =
		user &&
		(originalUser?.id !== user?.id ||
			originalUser?.name !== user?.name ||
			originalUser?.age !== user?.age);

	// 全てのバリデーションが通っているか確認
	$: isFormValid = user && validateFields() && (isNewMode || hasChanges);

	// ユーザー情報を保存する関数
	async function saveUser() {
		if (!user || !validateFields()) return; // ユーザー情報が無いか、バリデーション失敗の場合は処理を中止

		// エラーメッセージをクリア
		errorMessages.id = '';
		loading = true; // ローディング状態を有効にする
		const method = isNewMode ? 'POST' : 'PUT'; // メソッドの選択
		const url = isNewMode
			? 'http://localhost:8080/users' // 新規登録の場合のURL
			: `http://localhost:8080/users/${user.id}`; // 更新の場合のURL

		try {
			const response = await fetch(url, {
				method,
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify(user) // ユーザー情報をJSONに変換
			});
			if (response.status === 409) {
				const errorData = await response.text();
				console.log('Error Data:', errorData); // ここでログ出力
				if (errorData) {
					errorMessages.id = errorData; // 取得したエラーメッセージを設定
					return;
				} else {
					// エラーメッセージがない場合の処理
					throw new Error('ユーザー情報の保存に失敗しました。');
				}
			}
			alert(isNewMode ? 'ユーザーが登録されました！' : 'ユーザー情報が更新されました！');
			goto('/users'); // ユーザー一覧ページへ遷移
		} catch (error: any) {
			alert(error.message); // エラーメッセージを表示
		} finally {
			loading = false; // ローディング状態を無効にする
		}
	}

	// ユーザーを削除する関数
	async function deleteUser() {
		if (!user) return; // ユーザー情報が無い場合は処理を中止
		loading = true; // ローディング状態を有効にする

		try {
			const response = await fetch(`http://localhost:8080/users/${user.id}`, { method: 'DELETE' });
			if (!response.ok) throw new Error('ユーザー削除に失敗しました。'); // 削除失敗時のエラーハンドリング
			alert('ユーザーが削除されました');
			goto('/users'); // ユーザー一覧ページへ遷移
		} catch (error: any) {
			alert(error.message); // エラーメッセージを表示
		} finally {
			loading = false; // ローディング状態を無効にする
		}
	}
</script>

<!-- ユーザーがロードされていない場合、ローディングメッセージを表示 -->
{#if !user}
	<p>Loading...</p>
{:else}
	<div class="container">
		<h1>{isNewMode ? '新規ユーザー登録' : 'ユーザー詳細'}</h1>

		<label>
			ID:
			<input
				type="text"
				bind:value={user.id}
				on:input={() => (touchedFields.id = true)}
				on:blur={validateId}
				disabled={!isNewMode}
			/>
			{#if touchedFields.id && errorMessages.id}<span class="error-message">{errorMessages.id}</span
				>{/if}
		</label>

		<label>
			Name:
			<input
				type="text"
				bind:value={user.name}
				on:input={() => (touchedFields.name = true)}
				on:blur={validateName}
			/>
			{#if touchedFields.name && errorMessages.name}<span class="error-message"
					>{errorMessages.name}</span
				>{/if}
		</label>

		<label>
			Age:
			<input
				type="text"
				bind:value={user.age}
				on:input={() => (touchedFields.age = true)}
				on:blur={validateAge}
			/>
			{#if touchedFields.age && errorMessages.age}<span class="error-message"
					>{errorMessages.age}</span
				>{/if}
		</label>

		<div class="button-group">
			<button on:click={saveUser} disabled={!isFormValid || loading} class="btn-primary">
				{loading ? '保存中...' : isNewMode ? '登録' : '更新'}
			</button>

			{#if !isNewMode}
				<button on:click={deleteUser} disabled={loading} class="btn-danger">削除</button>
			{/if}

			<button on:click={() => goto('/users')} class="btn-primary">ユーザー検索に戻る</button>

			{#if !isNewMode}
				<button on:click={enterNewMode} class="btn-primary">新規登録</button>
			{/if}
		</div>
	</div>
{/if}

<style>
	.container {
		max-width: 600px;
		margin: 0 auto;
		padding: 20px;
		background-color: #f4f6f9;
		border-radius: 12px;
		box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
	}

	h1 {
		text-align: center;
		color: #34495e;
		font-size: 28px;
		margin-bottom: 20px;
	}

	label {
		display: block;
		margin-bottom: 15px;
		color: #333;
		font-weight: bold;
		font-size: 16px;
	}

	input {
		width: 100%;
		padding: 12px;
		margin-top: 5px;
		border: 1px solid #ccc;
		border-radius: 8px;
		box-sizing: border-box;
		font-size: 16px;
		transition: border-color 0.3s ease;
	}

	input:focus {
		border-color: #3498db;
		outline: none;
	}

	.error-message {
		color: #e74c3c;
		font-size: 14px;
		margin-top: 5px;
	}

	.button-group {
		display: flex;
		justify-content: space-between;
		margin-top: 20px;
	}

	button {
		flex: 1; /* ボタンの幅を均等に */
		margin: 0 5px; /* ボタン間のスペース */
		padding: 10px;
		border: none;
		border-radius: 8px;
		color: white;
		cursor: pointer;
		font-size: 16px;
		transition: background-color 0.3s ease;
	}

	.btn-primary {
		background-color: #3498db;
	}

	.btn-primary:hover {
		background-color: #2980b9;
	}

	.btn-danger {
		background-color: #e74c3c;
	}

	.btn-danger:hover {
		background-color: #c0392b;
	}
</style>
