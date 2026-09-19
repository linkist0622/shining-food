# SHINING food — PWA preview v2.4

既存デモ公開先: https://shining-food-owner-demo.linkist39.chatgpt.site/
Vercel公開予定ドメイン: https://shining-food.com/ （公開・DNS設定は未完了）
GitHub: https://github.com/linkist0622/shining-food （preview/pwa-v2ブランチ）

2026-09-19のユーザー指示により、Vercel / shining-food.comへの公開を準備。Next.jsの本番ビルド設定は `vercel.json` に追加済み。手順と接続残件は [docs/VERCEL_DEPLOYMENT.md](docs/VERCEL_DEPLOYMENT.md)。VercelのProduction環境への公開は、実注文・決済の開始を意味しません。

住所入力・経路と調理20分によるお届け目安の実装と接続残件は [docs/DELIVERY_CHECK.md](docs/DELIVERY_CHECK.md)。地図APIは未接続のため、現在の公開版では実距離・到着時刻を自動表示せず、店舗確認へ案内します。

ユーザーの承認（2026-09-18）に基づき、コード・候補商品データ・写真・実装資料を公開リポジトリのpreview/pwa-v2ブランチで管理します。Sites側の作業原本と公開版にもコード・画像を保持しています。

本番の画面・操作を想定したプレビューです。実注文、Stripe API、カード入力、Wallet認証、LINE送信、施設への連絡はありません。顧客・店舗の入力はブラウザーのメモリーにのみ保持します。PWA先行。iOS/Androidのネイティブパッケージは未作成です。

## 起動

Node 22.13以上、pnpm（package.jsonのpackageManagerを参照）。

```bash
corepack enable
pnpm install --frozen-lockfile
pnpm dev:vercel
```

Vercelでは `pnpm build:vercel` / `pnpm start:vercel` を使用します。元のVinext / Cloudflare Workers用スクリプトと依存関係も残しています。旧環境の詳細は [docs/STARTER.md](docs/STARTER.md)。

## 画面と操作

1. ロゴ・写真・コピーの約10秒のイントロ。「全国の気になるおいしさを…」の一文は3秒後に表示開始（従来6秒後）。開始時からスキップ可能。動きを減らす設定は約0.7秒。
2. 下部の「メニュー／BBQ予約／カート／注文状況／ご利用案内」で移動。
3. 商品・受取方法・配送先・連絡先・本人受渡しを入力して申し込む。通常商品のデリバリーは「できるだけ早く」が初期選択。「日時を指定する」を選ぶと希望日・時間が表示される。テイクアウトとBBQは従来どおり日時指定。
4. 白い確認画面で「店舗側の確認へ進む」。店舗が受付・見積・追加確認・お断りを選ぶ。
5. 白い確認画面で「お客様の画面へ戻る」。見積があれば了承し、支払方法を選択する。
6. 模擬支払が成功したときのみ完了。通信断の間に処理が終われば失敗し、再接続後に再試行可能。
7. 「確認を終えてトップへ」で入力・カート・見積・回答・決済・役割・フィルターを消し、イントロへ戻る。相談継続中は自動消去しない。

## 構成・データ編集

| ファイル | 内容 |
|---|---|
| app/page.tsx | 顧客画面とプレビュー画面切替 |
| app/globals.css | 白・アイボリー・深緑・ゴールド、可変幅、固定バー |
| components/food/ | イントロ、共通入力、店舗確認、支払表示、PWA |
| lib/demo.ts | 既存の例示商品3件、BBQ、施設、検証、注文状態遷移 |
| lib/catalog.json | 候補16商品群＋24商品見出し。提供制約と参考価格 |
| lib/preview.ts | プレビュー専用の役割と消去処理 |
| public/images/ | 写真。catalog配下は供給元の商品群写真 |
| public/images/credits.json | 写真の由来 |
| public/sw.js / manifest.webmanifest / offline.html | PWA、静的なオフライン案内 |
| tests/demo.test.mjs | 必須6経路、ガード、候補・施設制約の検証 |
| app/qa/page.tsx | 開発時だけの390px/320px iframe。productionは404 |

候補40件の写真は16商品群の代表写真。子商品の正確な写真であると誤認させないため「商品群の参考写真」と表示します。正式価格は元台帳で全件空欄です。catalogの`price`は画面操作用の仮設定で、`officialPrice:null`を維持しています。原価、顧客情報、秘密鍵、社内資料原本は含めません。商品群と個別商品を合わせた40件は、40種類の正式SKUが決まった意味ではありません。

元資料: SHINING_food_Pricing_Master.xlsx と SHINING_food_Research_and_Proposals_v1.0_20260918.md（2026-09-18調査）。廃止7群は表示を残して注文追加を停止。実店舗専用版やデリバリー終了の商品を配達可能に変更しません。テイクアウトも許諾未確認のため店舗相談に進みます。比較調査だけの51ブランドや追加提案2ブランドを正式候補へ拡張していません。

施設候補12件は、Pilot台帳 `SHINING_food_Pilot_Operations_Checksheet_v0.1_20260919.xlsx` の `04_施設実走!A4:B15` と照合した施設名を、一覧・注文先選択・注文詳細に表示します。F番号は内部の対応キーとして保持し、画面には出しません。ホテル1130／スウィートグラス／浅間ハイランドパークの別操作例は統合し、重複表示を解消しました。浅間ハイランドパークは「別荘地・管理センター」で選択します。全12件とも施設許可は未照会、初期配達可否は未判定のため、店舗確認・見積へ進みます。v0.2〜v0.4の存在は確認できましたが本文は取得できず、名称照合の直接根拠はv0.1です。

最低注文金額はユーザー指示（2026-09-19）に基づき **3,980円**。追加のユーザー指示により、**デリバリーのみ（BBQの配達を含む）** に適用し、**テイクアウトは最低注文金額なし**。配達料を除く商品代金を基準としています。画面表示額は従来どおり税込想定。デリバリーで金額不足時は残額を示して申込みボタンを停止し、状態遷移側でも申込みを拒否します。正式価格・税の扱いは未確定です。

配達料金はユーザーの暫定方針「5kmまで1000円／それ以上2000円／商品代10000円以上無料」を参考計算に反映しました。距離計算は未接続のため未判定は1000円を仮表示し、範囲外自己申告は2000円、10000円以上は0円。最終額は店舗確認・見積で調整します。商品代と送料の免除条件・距離の測り方は正式運用前に事業室で確定してください。

## 状態遷移

```mermaid
stateDiagram-v2
  draft --> review: 申込み
  review --> payment: 通常注文受付
  review --> quoted: 見積提示
  review --> declined: お断り
  review --> awaiting_answer: 追加質問
  awaiting_answer --> review: 顧客回答
  quoted --> accepted: 顧客了承
  accepted --> confirmed: 模擬支払成功
  payment --> confirmed: 模擬支払成功
  declined --> draft: 代替案
  confirmed --> draft: 体験終了
```

見積了承前・相談中・お断り状態は支払不可。商品・人数・住所・日時変更で見積／了承／支払選択を失効。処理中は二重開始を防止し、旧revisionの完了応答も無視します。支払失敗は注文確定にしません。

## PWAと本番化の境界

- manifest、192/512pxアイコン、maskableアイコン、standalone起動、safe-area、更新案内を実装。
- SWキャッシュはoffline.htmlと3つのアイコンのみ。住所、カート、見積、決済、API結果、アプリHTMLをキャッシュしません。注文データ用IndexedDBは作りません。
- 更新は操作が空の状態のみ許可。入力中は「操作を終えると更新できます」と表示。
- 公開はHTTPSですが、この作業のブラウザーQAはHTTPの開発環境です。iPhone/Androidの実端末へのインストール、サービスワーカー更新、実キーボード・安全領域、OSの動き軽減設定での確認は未実施。コード検査とブラウザー幅確認を区別しています。
- 本番で顧客がStorePanelに入れないよう、別管理画面・サーバー認証・権限・監査ログを実装する必要があります。PREVIEW_MODEをfalseにするだけで本番化は完了しません。
- このリセットはプレビュー専用。本番の注文履歴・店舗記録を削除するAPIと共用しません。

## 検証

```bash
node --experimental-strip-types tests/demo.test.mjs
pnpm exec tsc --noEmit
pnpm exec eslint app/page.tsx components/food lib/demo.ts lib/preview.ts --quiet
pnpm build
```

今回の再開状況・次の作業は [docs/CONTINUATION.md](docs/CONTINUATION.md)。ブラウザー検証と残件は [docs/VERIFICATION.md](docs/VERIFICATION.md)、Stripe仕様は [docs/PAYMENTS.md](docs/PAYMENTS.md)、事業室への文案は [docs/HANDOFF.md](docs/HANDOFF.md) を参照。

## 公開更新と戻し方

GitHubへの保存とVercelへの公開は別です。今後の公開先はユーザー指定のVercel / shining-food.comです。接続完了後、対象ブランチの変更をVercelでビルド・公開します。既存Sitesデモは公開済みの状態を保持します。秘密鍵をリポジトリに保存しないでください。

変更を戻す場合は対象コミットをgit revertし、その状態を再ビルドして既存Siteへ公開します。Sites側で以前保存されたv0.2の版へ戻す場合も、公開履歴の版を確認して同じSiteへ再デプロイします。共有範囲は変更しません。
