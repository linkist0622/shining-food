# 住所・車の経路・お届け目安（2026-09-19）

## 今回の画面

- カートの受取方法の直後に「お届け先・待ち合わせ」を移動。住所入力が初期選択。
- 「範囲・時間を確認」で住所と車の経路を確認。施設・管理センターの選択は従来のフローを維持。
- 目安内かつ最短配達の場合、申込みボタンに「今ご注文の場合」の日本時間と「お届け目安」を表示。調理20分＋車の所要分数（秒を切上げ）を加算。
- 申込み時刻は申込み操作で確定し、店舗・お客様の注文詳細で保持。日時指定・テイクアウト・BBQに今すぐの到着時刻を混ぜない。
- 住所・受取方法などを変更すると判定と古い見積を失効。処理中の住所変更／画面移動で通信を中止し、遅れて届く旧住所の結果を採用しない。

## 出発地点

ユーザーから2026-09-19に指定された[Google Mapsリンク](https://maps.app.goo.gl/YhdZXmRqpHyoBCk27?g_st=ic)の転送先：SHINING resort、群馬県吾妻郡嬬恋村鎌原1053-8599。

Routes APIのorigin.addressにこの住所を指定。町全体の代表点やGoogle Mapsの画面中心座標は使用しない。Googleがこの住所を番地相当まで特定できない場合は店舗確認へ進める。

## 実接続の残件

**公開環境の地図API接続情報は未設定。現状は「自動確認は準備中」と表示し、実距離やお届け時刻を作らない。** UIと計算・サーバー接続処理は実装済み。実際のGoogle経路取得は未検証。

Google Cloudで課金を有効にしたプロジェクトのRoutes APIを有効化し、Sitesの秘密の実行時変数 `GOOGLE_MAPS_ROUTES_API_KEY` を設定する。キーはRoutes APIのみに制限し、利用量上限を設定する。秘密値はGitHub・ブラウザー・この資料に記載しない。現時点で新規契約・有料API実行はしていない。

## 計算と境界

- APIはGoogle Routes computeRoutes、DRIVE、TRAFFIC_UNAWARE。現在の渋滞・一時通行止めを織り込まない目安。
- origin/destinationのpartialMatch、番地未特定、空の経路、フォールバック、無効値、通信エラー時には断定しない。Googleの経路注意事項も表示。
- 既存の直線10kmの一次判定を維持。経路の道路上に補正された起終点の距離を目安とし、5km・10kmの前後100mは店舗確認。玄関位置の精度を保証しない。
- 参考配達料は5kmまで1,000円、5km超2,000円、商品代10,000円以上は無料を維持。範囲外でも相談可能。道路と受付枠の最終確認は店舗が行う。
- 判定の画面内有効時間は15分。期限切れは再確認し、古い到着時刻を案内しない。注文確定前の目安であることを明記。
- Google Mapsの表記を経路情報の近くに置き、調理20分は当サイトの条件として区別。

## データの扱い・確認

ボタンを押した住所だけを同一サイトのPOST経由でGoogleに送信。住所・経路のDB保存、localStorage保存、独自ログ出力、URLクエリーへの埋込みはしない。API応答はno-store。Google側の処理はリンクしたプライバシーポリシーに従う。サーバーの同時処理数制限はisolate単位で、全体の課金上限はGoogle側で設定する。

`tests/delivery.test.mjs` は模擬API応答で番地判定、境界、異常応答、時刻計算、日本時間・日付またぎ、住所変更、実申込時刻の保持を検証。APIキー未設定時に外部呼出しも架空の時間表示もしないことを確認。

2026-09-19の確認：型検査・既存注文テスト・配達テスト・本番ビルドを通過。プレビューで住所入力の初期選択、宛先欄の順序、未入力時の確認ボタン無効化、API未設定時の案内、施設への切替、320px・390pxのフォーム表示を確認。申込み後の配達料も申込時刻を基準に保持する。

一次資料：[Waypoint](https://developers.google.com/maps/documentation/routes/reference/rest/v2/Waypoint)、[Compute Routes](https://developers.google.com/maps/documentation/routes/reference/rest/v2/TopLevel/computeRoutes)、[接続設定](https://developers.google.com/maps/documentation/routes/get-api-key)、[課金](https://developers.google.com/maps/documentation/routes/usage-and-billing)、[表示・利用方針](https://developers.google.com/maps/documentation/routes/policies)。
