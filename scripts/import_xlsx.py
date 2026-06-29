#!/usr/bin/env python3
"""将 Excel 信贷产品表导入为网站使用的 JSON 数据。

用法:
  python scripts/import_xlsx.py                    # 默认覆盖 data/products.json
  python scripts/import_xlsx.py 新产品.xlsx        # 指定文件覆盖
  python scripts/import_xlsx.py 新产品.xlsx --append  # 追加/按序号更新

Excel 要求: 第一行为标题，第二行为列名（与现有模板一致）。
"""
from __future__ import annotations

import argparse
import json
import re
import sys
from datetime import datetime, timezone
from pathlib import Path

import pandas as pd

ROOT = Path(__file__).resolve().parent.parent
DATA_DIR = ROOT / "data"
OUTPUT = DATA_DIR / "products.json"

COLUMN_MAP = {
    "序号": "id",
    "银行名称（全程）": "bank",
    "银行名称（全称）": "bank",
    "产品名称": "name",
    "产品分类": "category",
    "服务对象": "target",
    "申请条件": "conditions",
    "适用县区": "region",
    "担保方式": "guarantee",
    "额度": "amount",
    "期限": "term",
    "年利率": "rate",
    "申请流程": "process",
    "联系人及电话": "contact",
}

REQUIRED = ["bank", "name"]


def find_default_xlsx() -> Path | None:
    candidates = sorted(ROOT.glob("*.xlsx"))
    return candidates[0] if candidates else None


def parse_amount_max(text: str) -> float | None:
    if not text or not isinstance(text, str):
        return None
    nums = re.findall(r"(\d+(?:\.\d+)?)\s*万", text)
    if not nums:
        nums = re.findall(r"(\d+(?:\.\d+)?)", text)
    return max(float(n) for n in nums) if nums else None


def parse_term_max_months(text: str) -> int | None:
    if not text or not isinstance(text, str):
        return None
    months: list[int] = []
    for m in re.findall(r"(\d+)\s*个月", text):
        months.append(int(m))
    for y in re.findall(r"(\d+)\s*年", text):
        months.append(int(y) * 12)
    return max(months) if months else None


def normalize_row(row: dict) -> dict | None:
    item: dict = {}
    for src, dst in COLUMN_MAP.items():
        if src in row and pd.notna(row[src]):
            val = row[src]
            if dst == "id":
                item[dst] = int(val) if float(val) == int(float(val)) else val
            else:
                item[dst] = str(val).strip()

    if not item.get("bank") or not item.get("name"):
        return None

    if "id" not in item:
        item["id"] = f"{item['bank']}-{item['name']}"

    item["amountMax"] = parse_amount_max(item.get("amount", ""))
    item["termMaxMonths"] = parse_term_max_months(item.get("term", ""))
    return item


def read_products(xlsx_path: Path) -> list[dict]:
    df = pd.read_excel(xlsx_path, header=1)
    products = []
    for _, row in df.iterrows():
        item = normalize_row(row.to_dict())
        if item:
            products.append(item)
    return products


def merge_products(existing: list[dict], incoming: list[dict]) -> list[dict]:
    by_id = {str(p["id"]): p for p in existing}
    for p in incoming:
        by_id[str(p["id"])] = p
    merged = list(by_id.values())
    merged.sort(key=lambda x: (int(x["id"]) if str(x["id"]).isdigit() else 999999, str(x["id"])))
    return merged


def build_payload(products: list[dict], source: str) -> dict:
    banks = sorted({p["bank"] for p in products})
    categories = sorted({p.get("category", "") for p in products if p.get("category")})
    guarantees = sorted({p.get("guarantee", "") for p in products if p.get("guarantee")})
    regions = sorted({p.get("region", "") for p in products if p.get("region")})

    return {
        "meta": {
            "title": "榕江县小微企业金融服务信贷平台",
            "subtitle": "汇集榕江县银行机构小微企业信贷产品，按区县、银行、产品分类、担保方式、融资额度和贷款期限快速查询。",
            "updatedAt": datetime.now(timezone.utc).astimezone().isoformat(timespec="seconds"),
            "sourceFile": source,
            "total": len(products),
            "stats": {
                "products": len(products),
                "banks": len(banks),
                "regions": len(regions),
            },
            "filters": {
                "banks": banks,
                "categories": categories,
                "guarantees": guarantees,
                "regions": regions,
            },
        },
        "products": products,
    }


def main() -> int:
    parser = argparse.ArgumentParser(description="导入 Excel 信贷产品数据")
    parser.add_argument("xlsx", nargs="?", help="Excel 文件路径，默认使用目录下第一个 .xlsx")
    parser.add_argument(
        "--append",
        action="store_true",
        help="追加模式：相同序号/id 的产品会被更新，新产品会追加",
    )
    parser.add_argument(
        "--output",
        default=str(OUTPUT),
        help=f"输出 JSON 路径，默认 {OUTPUT}",
    )
    args = parser.parse_args()

    xlsx_path = Path(args.xlsx) if args.xlsx else find_default_xlsx()
    if not xlsx_path or not xlsx_path.exists():
        print("错误: 未找到 Excel 文件", file=sys.stderr)
        return 1

    incoming = read_products(xlsx_path)
    if not incoming:
        print("错误: Excel 中未读取到有效产品数据", file=sys.stderr)
        return 1

    output_path = Path(args.output)
    output_path.parent.mkdir(parents=True, exist_ok=True)

    if args.append and output_path.exists():
        with open(output_path, encoding="utf-8") as f:
            existing_data = json.load(f)
        products = merge_products(existing_data.get("products", []), incoming)
        mode = "追加/更新"
    else:
        products = incoming
        mode = "覆盖"

    payload = build_payload(products, xlsx_path.name)
    with open(output_path, "w", encoding="utf-8") as f:
        json.dump(payload, f, ensure_ascii=False, indent=2)

    print(f"{mode}完成: {len(incoming)} 条来自 Excel，合计 {len(products)} 条 -> {output_path}")
    return 0


if __name__ == "__main__":
    sys.exit(main())
