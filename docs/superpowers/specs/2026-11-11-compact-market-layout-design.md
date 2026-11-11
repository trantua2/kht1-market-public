# Compact Market Layout Design

## Goal

Move useful market data and filters into the first viewport by removing decorative headings and excess nested frames.

## Approved Layout

- Remove the complete `Danh mục vật phẩm / Chợ giang hồ` masthead.
- Remove the separate `Dữ liệu mới nhất` title block.
- Add one compact status strip directly below the site header.
- The left side of the strip shows active server, shop count, item count and available cities.
- The right side shows the latest update time and status dot.
- Place filters immediately below the status strip.

## Filter Presentation

- Keep two independent logical groups: `Khu vực & giá` and `Thuộc tính`.
- Do not wrap either group in a card, panel background or border.
- Separate the groups with one thin horizontal rule.
- Remove the uppercase helper labels `Bộ lọc chính` and `Tìm đúng món`.
- Render each reset action as a small `Đặt lại` text button.
- Resetting one group must preserve every value in the other group.

`Khu vực & giá` contains server, city, maximum price and currency. `Thuộc tính` contains item name, jewellery type, element, option and value range.

## Responsive Behavior

- Desktop keeps four primary controls on one row and six attribute controls on one row where space permits.
- Tablet uses two or three columns.
- Mobile uses one column, with headings and reset actions stacked when needed.
- Product results must begin within or immediately after the first viewport on common desktop resolutions.

## Verification

- UI contract tests verify the masthead and nested group frames are absent.
- Reset tests verify each group preserves the other group.
- Existing market server, filter and editorial UI tests remain green.
- Run the full test suite, typecheck and production build before deployment.
