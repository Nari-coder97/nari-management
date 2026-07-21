# スマホで使う＆同期する セットアップ手順

スマホとPCで同じデータを使うために、次の3ステップを行います。
**Aは1回だけ**（クラウドDBの用意）、**Bも1回だけ**（アプリの公開）、**Cは各端末で1回**（ログイン）です。

所要時間：全部で30〜40分くらい。難しい操作はありません。

---

## パート A：データの保管庫を作る（Supabase・無料）

### A-1. アカウント作成
1. [https://supabase.com](https://supabase.com) を開き、右上の「Start your project」→ GitHubまたはメールで**無料アカウント**を作成。

### A-2. プロジェクトを作る
1. 「New project」をクリック。
2. 入力：
   - **Name**：`nari-management`（何でもOK）
   - **Database Password**：適当な強いパスワード（メモしておく。あとで使わないが念のため）
   - **Region**：`Northeast Asia (Tokyo)` を選ぶ（日本から速い）
3. 「Create new project」。1〜2分で準備完了。

### A-3. データの置き場所を作る（コピペでOK）
1. 左メニューの **SQL Editor** を開く → 「New query」。
2. 下をまるごと貼り付けて、右下の **Run** を押す。

```sql
create table if not exists app_state (
  user_id uuid primary key references auth.users(id) on delete cascade,
  data jsonb not null,
  updated_at timestamptz not null default now()
);
alter table app_state enable row level security;
create policy "own rows" on app_state
  for all to authenticated
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);
```

「Success」と出ればOK。これで**自分だけが自分のデータを読み書きできる**設定になりました。

### A-4. メール確認をオフにする（メール＋パスワード方式にするため）
このアプリは**メール＋パスワード**でログインします。メールのやり取りを不要にするため、確認をオフにします。

1. 左メニュー **Authentication** → **Sign In / Providers**（または Providers）→ **Email** を開く。
2. **「Confirm email」**（メール確認）の**トグルをオフ**にして Save。

> これで、登録したメール＆パスワードだけで、どの端末からでもすぐログインできます（確認メールのリンクを開く手間なし）。

### A-5. 接続情報を2つ控える
1. 左下の **Project Settings**（歯車）→ **API**。
2. 次の2つをコピーしてメモ：
   - **Project URL**（例：`https://abcdefg.supabase.co`）
   - **anon public**（`eyJ...` と続く長い文字列）※これは公開して安全なキーです

---

## パート B：アプリをネットに公開する（GitHub Pages・無料）

スマホから開けるよう、アプリを「住所（URL）」に置きます。

### B-1. GitHubアカウント
1. [https://github.com](https://github.com) で無料アカウントを作成（Aでメール作成済みなら共通でOK）。

### B-2. 置き場所（リポジトリ）を作る
1. 右上「＋」→ **New repository**。
2. **Repository name**：`nari-management`
3. **Public** を選択 → **Create repository**。

### B-3. ファイルをアップロード
1. 作成後の画面で「**uploading an existing file**」をクリック。
2. `nari-management` フォルダの中の**全ファイル**をドラッグ＆ドロップ：
   - `index.html` / `sw.js` / `manifest.webmanifest`
   - `icon-180.png` / `icon-192.png` / `icon-512.png`
   - `README.md` / `SETUP.md`
3. 下の「**Commit changes**」を押す。

### B-4. 公開をオンにする
1. リポジトリの **Settings** → 左メニュー **Pages**。
2. **Source** を「Deploy from a branch」、Branch を **main / (root)** にして **Save**。
3. 1分ほど待つと、上部に公開URLが出ます：
   `https://<あなたのユーザー名>.github.io/nari-management/`
   → これがアプリのURLです。

### B-5. スマホのホーム画面に追加
1. iPhoneの **Safari** で上のURLを開く。
2. 下の**共有ボタン**（□に↑）→ **「ホーム画面に追加」**。
3. アイコンが付いて、アプリのように全画面で開けます。

---

## パート C：ログインして同期する（各端末で1回）

1. アプリ（PCでもスマホでも）を開き、**設定タブ**へ。
2. 「同期」欄に、A-5でメモした **Supabase URL** と **anon key** を貼り付け → **接続する**。
3. **メールアドレス**と**パスワード**（6文字以上・自分で決める）を入力。
4. 初回は **新規登録（初回）** を押す。次回以降・他の端末では **ログイン** を押す。
5. これで完了。**PCとスマホで"同じメール・同じパスワード"でログインすれば、データは自動で同期**されます。

> 使い方：普段どおり編集するだけで自動保存＆同期されます。アプリを開き直したときや「今すぐ同期」で最新に更新されます。

---

## よくある質問

- **お金はかかる？** → SupabaseもGitHub Pagesも無料枠で十分です。個人利用なら課金不要。
- **他人に見られない？** → データは自分のログイン専用（A-3のRLS設定）。安全です。
- **オフラインでも使える？** → 一度開けばオフラインでも起動・編集できます。オンラインに戻ると同期します。
- **ログインできない／登録できない** → 「新規登録」は初回だけ。2回目以降は「ログイン」。パスワードを忘れたら、Supabaseの Authentication → Users から自分のユーザーを消して登録し直せます。「メール確認がオン」と出たら A-4 を再確認。
- **パスワードは安全？** → Supabase側で暗号化して保管され、平文では保存されません。データは自分のログイン専用（A-3のRLS）です。
- **困ったら** → この手順のどこで詰まったか教えてください。画面を見ながら一緒に進めます。
