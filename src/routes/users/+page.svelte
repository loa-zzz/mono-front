<script lang="ts">
	import type { User } from '../../types/User';
	export let data; // dataオブジェクトを受け取る

	// 初期状態の変数を定義
	let filteredUsers: User[] = [];
	let paginatedUsers: User[] = [];
	let searchId = '';
	let searchName = '';
	let sortBy = 'id';
	let sortOrder: 'asc' | 'desc' = 'asc'; // ソート順の型を定義
	let currentPage = 1;
	const ITEMS_PER_PAGE = 10;

	// ユーザー情報が読み込まれたら、フィルタリング・ソート・ページネーションを適用
	$: {
		if (!data.loading && !data.errorMessage) {
			filteredUsers = filterUsers(data.users, searchId, searchName);
			const SORTED_USERS = sortUsers(filteredUsers, sortBy, sortOrder);
			paginatedUsers = paginate(SORTED_USERS, currentPage, ITEMS_PER_PAGE); // paginatedUsersをここで設定
		}
	}

	// ユーザーをフィルタリングする関数
	function filterUsers(users: User[], id: string, name: string): User[] {
		return users.filter((user) => {
			const MATCHES_ID = id === '' || user.id.toString() === id; // IDを文字列に変換
			const MATCHES_NAME = name === '' || user.name.toLowerCase().includes(name.toLowerCase());
			return MATCHES_ID && MATCHES_NAME;
		});
	}

	// ユーザーをソートする関数
	function sortUsers(users: User[], sortBy: string, sortOrder: 'asc' | 'desc'): User[] {
		return users.slice().sort((a, b) => {
			if (sortBy === 'id') {
				return sortOrder === 'asc'
					? a.id - b.id
					: b.id - a.id;
			} else if (sortBy === 'age') {
				return sortOrder === 'asc'
					? a.age - b.age
					: b.age - a.age;
			} else if (sortBy === 'name') {
				return sortOrder === 'asc' ? a.name.localeCompare(b.name) : b.name.localeCompare(a.name);
			}
			return 0; // デフォルトは変更なし
		});
	}

	// ユーザーをページごとに分割する関数
	function paginate(users: User[], currentPage: number, itemsPerPage: number): User[] {
		const START_INDEX = (currentPage - 1) * itemsPerPage;
		return users.slice(START_INDEX, START_INDEX + itemsPerPage);
	}

	// 昇順・降順をトグルする関数
	function toggleSortOrder(): void {
		sortOrder = sortOrder === 'asc' ? 'desc' : 'asc';
	}

	// 検索条件をクリアする関数
	function clearSearch(): void {
		searchId = '';
		searchName = '';
		currentPage = 1; // 検索条件クリア後にページ番号をリセット
	}

	// ページを変更する関数
	function changePage(newPage: number): void {
		const TOTAL_PAGES = Math.ceil(filteredUsers.length / ITEMS_PER_PAGE);
		if (newPage >= 1 && newPage <= TOTAL_PAGES) {
			currentPage = newPage;
		}
	}
</script>

<div class="container">
	<h1>ユーザー検索</h1>

	<div class="layout">
		<div class="search-form">
			<form>
				<div>
					<label for="id">ユーザーID:</label>
					<input
						id="id"
						type="text"
						bind:value={searchId}
						placeholder="ユーザーIDを入力"
						on:input={() => (currentPage = 1)}
					/>
				</div>
				<div>
					<label for="name">ユーザー名:</label>
					<input
						id="name"
						type="text"
						bind:value={searchName}
						placeholder="ユーザー名を入力"
						on:input={() => (currentPage = 1)}
					/>
				</div>
				<button type="button" class="btn primary" on:click={clearSearch}>クリア</button>
			</form>
		</div>

		<div class="search-results">
			{#if data.loading}
				<p>データを読み込んでいます...</p>
			{:else if data.errorMessage}
				<p class="error">{data.errorMessage}</p>
			{:else}
				<div class="pagination-container">
					<div class="sorting">
						<label for="sort">ソート:</label>
						<select id="sort" bind:value={sortBy} on:change={() => changePage(1)}>
							<option value="">選択してください</option>
							<option value="id">ID</option>
							<option value="name">名前</option>
							<option value="age">年齢</option>
						</select>
					</div>

					{#if sortBy !== ''}
						<div class="toggle-buttons">
							<button
								class="toggle-btn"
								class:active={sortOrder === 'asc'}
								on:click={toggleSortOrder}>昇順</button
							>
							<button
								class="toggle-btn"
								class:active={sortOrder === 'desc'}
								on:click={toggleSortOrder}>降順</button
							>
						</div>
					{/if}
				</div>

				<div class="pagination">
					{#if filteredUsers.length > 0}
						<button
							class="btn pagination-btn"
							on:click={() => changePage(currentPage - 1)}
							disabled={currentPage === 1}>前のページ</button
						>
						<span>ページ {currentPage} / {Math.ceil(filteredUsers.length / ITEMS_PER_PAGE)}</span>
						<button
							class="btn pagination-btn"
							on:click={() => changePage(currentPage + 1)}
							disabled={currentPage >= Math.ceil(filteredUsers.length / ITEMS_PER_PAGE)}
							>次のページ</button
						>
					{/if}
				</div>

				<div class="results">
					{#if filteredUsers.length > 0}
						<table>
							<thead>
								<tr>
									<th>ID</th>
									<th>名前</th>
									<th>年齢</th>
									<th>詳細</th>
								</tr>
							</thead>
							<tbody>
								{#each paginatedUsers as user}
									<tr>
										<td>{user.id}</td>
										<td>{user.name}</td>
										<td>{user.age}</td>
										<td><a class="detail-link" href={`/users/${user.id}`}>詳細</a></td>
									</tr>
								{/each}
							</tbody>
						</table>
					{:else}
						<p>ユーザーが見つかりません。</p>
					{/if}
				</div>
			{/if}
		</div>
	</div>
</div>

<style>
	* {
		box-sizing: border-box;
	}

	.container {
		max-width: 1200px;
		margin: 0 auto;
		padding: 20px;
		font-family: 'Arial', sans-serif;
		background-color: #ffffff;
		border-radius: 12px;
		box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);
	}

	h1 {
		text-align: center;
		margin-bottom: 20px;
		color: #2c3e50;
	}

	.layout {
		display: flex;
		gap: 20px;
	}

	.search-form {
		flex: 1;
		background: #ecf0f1;
		padding: 20px;
		border-radius: 8px;
		box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
	}

	.search-results {
		flex: 2;
		background: #ecf0f1;
		padding: 20px;
		border-radius: 8px;
		box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
	}

	.btn {
		padding: 10px 15px;
		border: none;
		border-radius: 5px;
		cursor: pointer;
		font-size: 16px;
		margin-right: 10px;
		transition: all 0.3s;
	}

	.btn.primary {
		background-color: #3498db;
		color: #ffffff;
	}

	.btn:hover {
		opacity: 0.9;
	}

	.toggle-btn {
		background: none;
		border: 2px solid #3498db;
		color: #3498db;
		padding: 8px 12px;
		margin: 0 5px;
		cursor: pointer;
		border-radius: 5px;
		transition: all 0.3s;
	}

	.toggle-btn.active {
		background-color: #3498db;
		color: #ffffff;
	}

	table {
		width: 100%;
		border-collapse: collapse;
	}

	th,
	td {
		padding: 10px;
		text-align: left;
		border-bottom: 1px solid #dddddd;
	}

	tr:nth-child(even) {
		background-color: #f9f9f9;
	}

	.pagination {
		display: flex;
		justify-content: space-between;
		align-items: center;
		margin: 20px 0;
	}

	.pagination-btn {
		background: #3498db;
		color: #ffffff;
		margin: 0 5px;
		padding: 10px 15px;
		border: none;
		border-radius: 5px;
	}

	.detail-link {
		color: #3498db;
		text-decoration: none;
	}

	.detail-link:hover {
		text-decoration: underline;
	}

	.error {
		color: red;
		text-align: center;
	}

	@media (max-width: 800px) {
		.layout {
			flex-direction: column;
		}
		.pagination-btn {
			background: #3498db;
			color: #ffffff;
			font-size: small;
			margin: 0 5px;
			padding: 6px 10px;
			border: none;
			border-radius: 5px;
		}
	}
</style>
