# 共有時の表示（2026-09-19）

- タイトル：SHINING food｜デモサイト
- 説明：SHINING foodのデリバリー・テイクアウトを体験できるデモサイトです。実際のご注文・決済は行われません。
- 画像：`public/og.png`（PNG、1731 × 909px）。既存の太陽マーク・SHINING food表記と「全国の気になるおいしさを、北軽井沢・嬬恋へ。」を配置。
- Open GraphとXの大きい画像カードに同じ画像・タイトル・説明を設定。画像URLは既存の公開先を使う絶対URL。
- 検索エンジン向けnoindex/nofollowは継続。共有先の画像キャッシュは各サービス側の更新タイミングに依存する。

## 画像制作

ユーザーのOGP画像作成指示に基づき、組み込みimagegenで1点生成。写真や追加の販売訴求は使用していない。採用画像を目視で確認し、ブランド名、日本語全文、余白、欠けのないことを照合。

生成プロンプト：

```text
Use case: ads-marketing.
Asset type: Finished Open Graph social sharing card, PNG raster image, landscape 1200 × 630 pixels (1.90476:1).
Create exactly one flat, premium, minimal typographic brand card for SHINING food. Ivory off-white solid background #faf9f5. Deep forest green #174c3b text. Muted gold #a57e42 only for the sun logo mark. No photographic or illustrated backdrop.
Logo centered in upper area: a thin gold outlined circular sun with exactly eight short straight rays, to the left of the wordmark "SHINING food". "SHINING" uppercase clean sans serif semibold; "food" lowercase elegant Georgia-like italic serif. Small, widely letter-spaced uppercase text "DELIVERY & TAKEOUT" directly beneath the wordmark. Maintain balanced clean proportions, plenty of air, crisp antialiased text.
Large centered Japanese headline below the logo, in a clean premium Japanese sans serif, rendered EXACTLY as two lines:
全国の気になるおいしさを、
北軽井沢・嬬恋へ。
Preserve every Japanese character, especially 軽, 嬬, and 恋, the middle dot ・, comma 、 and full stop 。. Do not add quotes. These two lines are the entire headline.
Composition: logo roughly in upper third, headline in middle-to-lower area, visually centered and evenly spaced. All content comfortably within at least 80 pixel outer safe margins on a 1200×630 canvas. Keep generous blank outer edges, no cropped letters or logo. Headline should be clearly readable when reduced to social preview size.
No extra copy, no URL, no demo notice, no decorative scene, no photo, no shadow, no gradient, no border, no watermark, no mockup, no UI. Output only the finished card.
```

指定比率とほぼ同じ1731 × 909pxで出力されたため、画像を再加工せず、その実寸をメタデータに反映。

## 確認

- ローカルプレビュー再読込後、DOMのOpen Graph／Xタイトル、デモ説明、絶対画像URL、実寸、代替テキスト、noindex/nofollowを確認。
- `/og.png` をブラウザーで開き、読み込み完了と実寸を確認。本番ビルドに含まれる画像と原本のSHA-256一致を確認。
- TypeScript型検査、本番ビルド成功。外部サービスへの投稿やキャッシュ更新操作は行っていない。
