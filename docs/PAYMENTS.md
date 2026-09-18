# 支払方法の設計メモ

確認日: 2026-09-19（日本時間。外部調査ログはUTC 2026-09-18）。Stripe公式資料による機能上の対応です。SHINING foodのアカウントが有効化済み・契約済みという確認ではありません。

| 方法 | 分類 | 公式条件・実装 |
|---|---|---|
| クレジット／デビットカード | カード | 日本アカウントでの対応ブランド・資格を実装時に照合。Checkout / Elements |
| Apple Pay | ウォレット | 対応端末・ブラウザー・登録カード等で表示。Checkout / Elements / Express Checkout。Elements等ではドメイン登録 |
| Google Pay | ウォレット | 有効化、HTTPS、端末・ブラウザー・登録カード等の条件。Checkout / Elements / Express Checkout |
| PayPay | QR・コード決済 | 日本アカウント・日本の顧客・JPY。Checkout / Elements / Payment Links。Express Checkout非対応。継続課金・setup非対応 |

- https://docs.stripe.com/payments/cards
- https://docs.stripe.com/payments/paypay?locale=ja-JP
- https://docs.stripe.com/apple-pay?platform=web
- https://docs.stripe.com/google-pay?platform=web
- https://docs.stripe.com/elements/express-checkout-element
- https://docs.stripe.com/currencies

JPYは小数なし。今回のアプリは全4候補を見本として表示し、端末適格判定は実装していません。本番ではStripeアカウント・端末・通貨・実装方式に応じた条件で表示します。PayPayをExpress Checkoutに混在させません。

Stripe.js、Stripe API、Wallet認証、カード番号入力、PayPay起動は一切実装していません。模擬処理はローカルのタイマーと状態遷移のみ。処理開始時と終了時のネットワーク状態、attemptIdとrevision、状態を確認します。失敗では確定しません。Suica等は根拠なく追加していません。
