# Vercel公開準備 — shining-food.com

2026-09-19のユーザー指示：「GitHubに反映済ならそのままVercelに本番公開。shining-food.com」。

## コード側の準備

- GitHub：`linkist0622/shining-food`、対象ブランチ：`preview/pwa-v2`。
- Framework Preset：Next.js。Root Directory：リポジトリ直下。
- `vercel.json` が Install Command=`pnpm install --frozen-lockfile`、Build Command=`pnpm run build:vercel` を指定。Output DirectoryはNext.js既定のまま。
- `build:vercel` は `next build`。APIはNode.jsの `process.env` から秘密値を読み取る。旧Cloudflare専用importを配達APIから除去。
- OGPのサイトURL・画像URLを `https://shining-food.com` に設定。
- デモ案内・検索除外を維持。実注文、決済、LINE通知、店舗認証は未実装のまま。

## 接続後に行うこと

1. ユーザーの正しいVercelチームで、このGitHubリポジトリをImportする。既存の同用途プロジェクトがあれば再利用する。
2. Production Branchが `preview/pwa-v2` になっていることを確認する。別ブランチの旧コードを公開しない。
3. Productionへデプロイし、READYを確認する。
4. Settings → Domainsで `shining-food.com` を追加。Vercelが実際に指定したDNSレコードをドメイン管理会社側へ設定する。値を推測しない。既存のMX/TXTメール設定は保つ。
5. ドメイン検証・HTTPS証明書の準備完了後、トップ、画像、OGP、カート、配達APIを確認する。

## Google Maps接続

VercelのProduction用Environment Variablesへ `GOOGLE_MAPS_ROUTES_API_KEY` を秘密値として設定し、再デプロイする。Google Cloud側のRoutes API・課金・利用量上限の設定が必要。キーをGitHubやチャットへ記載しない。

未設定でもデモは動作し、住所確認では「自動確認は準備中」を表示する。実際の経路・配達可否・到着時刻は生成しない。詳細は [DELIVERY_CHECK.md](DELIVERY_CHECK.md)。

## 今回の接続状況

Vercelプラグインは有効だが、チーム一覧が0件。公開ツールは `Tool deploy_to_vercel not found` を返した。Vercel上のプロジェクト作成、公開、独自ドメイン設定の完了は確認できていない。接続先チームの再確認またはCLI認証が必要。

## ローカル検証済み

- Next.js 16.3.4の本番ビルド・型検査と、既存の注文／配達テストを通過。
- 本番サーバーでトップ・OGP画像・manifestは200、開発専用 `/qa` は404。
- `shining-food.com` のOGP参照を確認。
- 同一サイトからの住所POSTは200・`not_configured`・`no-store`、別OriginからのPOSTは403。Next.js内部URLと公開Hostの差を考慮。
- Vercel公開環境での表示・API・独自ドメイン・HTTPSは接続完了後に検証する。

公式手順：[Next.js](https://vercel.com/docs/frameworks/full-stack/nextjs)、[独自ドメイン](https://vercel.com/docs/domains/working-with-domains/add-a-domain)。
