#!/usr/bin/env python3
"""檢出 TONE.md 已知的壞表達，簡體與繁體輸入都適用。

改寫自 oil-tone 的 tone_lint.py（MIT, https://github.com/oil-oil/oil-tone）。
原版規則以簡體字面撰寫，對繁體文稿幾乎全部漏抓；這裡在比對前先做一次
簡繁正規化，讓同一組規則兩種字形通吃。純標準庫，無外部依賴。
"""

from __future__ import annotations

import argparse
import html
import re
import sys
from pathlib import Path


Rule = tuple[re.Pattern[str], str]

# 規則以簡體字面撰寫；比對前會把輸入正規化成簡體，繁體文稿一樣抓得到。
RULES: tuple[Rule, ...] = (
    (re.compile(r"先保哪一个|保(?:重点|逻辑|意思|准确|清楚|自然|风格|质量|结构)"), "使用「遵循、保留、確保」等準確動詞。"),
    (re.compile(r"(?:一个|这个)?(?:代码)?问题.{0,8}怎么走"), "改成「一個程式碼問題通常怎麼處理」。"),
    (re.compile(r"(?:线索|结果|结论|内容).{0,8}(?:带回来|丢回来|交回来)"), "寫清楚誰說明或提交了什麼。"),
    (re.compile(r"(?:先)?把(?:事实|证据).{0,8}(?:找出来|建立(?:起来)?)"), "改成具體動作，例如查看呼叫、檢查設定、確認當前實作。"),
    (re.compile(r"(?:逻辑|流程).{0,6}跑(?:到|下去)"), "使用「執行」或具體說明呼叫關係。"),
    (re.compile(r"(?:问题|流程|事情|能力|价值).{0,6}落(?:下去|到|地)"), "說明具體實作或處理動作。"),
    (re.compile(r"(?:吃下|吞下).{0,10}(?:对话|内容|信息|上下文)"), "使用「讀取、接收、包含」等準確動詞。"),
    (re.compile(r"(?:把)?(?:内容|信息|上下文).{0,8}(?:塞进|塞到|喂给)"), "使用「寫入、加入、提供」等準確動詞。"),
    (re.compile(r"跑测试"), "使用「執行測試」。"),
    (re.compile(r"(?:搞|弄)(?:顺|清楚|明白|好|完|懂|定|起来|下去)"), "說明具體動作和結果，不使用含義含糊的單字動作詞。"),
    (re.compile(r"承接(?:需求|任务|工作|内容)"), "使用「處理、負責、實作」等準確動詞。"),
    (re.compile(r"(?:赋能|撬动|抓手|闭环|沉淀价值|价值落地)"), "刪除宣傳黑話，直接說明具體作用。"),
    (re.compile(r"原因很简单[：:，,。]?"), "刪除模板化領起語，直接說明具體原因。"),
    (re.compile(r"(?:真正重要的是|真正的关键是|这不仅仅?是|从更大的角度看)"), "刪除沒有增加資訊的總結或昇華表達。"),
    (re.compile(r"(?:核心问题是|关键区别在于|综上所述|说白了|本质上)"), "刪除模板化領起語，直接說明具體內容。"),
)

# 上列規則涉及的漢字裡，簡繁字形不同的全部在此。比對前把繁體逐字換成簡體，
# 規則就不必維護兩套字面。新增規則若引入新的異形字，記得一併補進這張表，
# 並在 --self-test 加一組繁體案例守住。
TRAD_TO_SIMP = str.maketrans({
    "個": "个", "麼": "么", "丟": "丢", "關": "关", "寫": "写",
    "動": "动", "單": "单", "對": "对", "帶": "带", "實": "实",
    "構": "构", "來": "来", "測": "测", "點": "点", "環": "环",
    "碼": "码", "確": "确", "簡": "简", "線": "线", "經": "经",
    "結": "结", "給": "给", "論": "论", "試": "试", "話": "话",
    "質": "质", "賦": "赋", "這": "这", "進": "进", "邏": "逻",
    "輯": "辑", "鍵": "键", "閉": "闭", "問": "问", "題": "题",
    "風": "风", "順": "顺", "澱": "淀", "餵": "喂", "號": "号",
    "資": "资", "訊": "讯", "說": "说", "價": "价",
    "體": "体", "產": "产", "讓": "让", "從": "从", "為": "为",
    "內": "内", "僅": "仅", "務": "务", "區": "区", "別": "别",
    "據": "据", "綜": "综", "證": "证", "準": "准", "於": "于",
})


def normalize(text: str) -> str:
    return text.translate(TRAD_TO_SIMP)


def read_text(name: str) -> str:
    return sys.stdin.read() if name == "-" else Path(name).read_text(encoding="utf-8")


def visible_lines(text: str) -> list[tuple[int, str]]:
    lines: list[tuple[int, str]] = []
    in_fence = False
    in_script = False
    for number, raw in enumerate(text.splitlines(), start=1):
        stripped = raw.strip()
        if stripped.startswith("```"):
            in_fence = not in_fence
            continue
        if in_fence:
            continue
        if re.search(r"<(script|style)\b", raw, flags=re.IGNORECASE):
            in_script = True
        if in_script:
            if re.search(r"</(script|style)>", raw, flags=re.IGNORECASE):
                in_script = False
            continue
        without_tags = re.sub(r"<[^>]+>", " ", raw)
        without_code = re.sub(r"`[^`]*`", " ", without_tags)
        visible = html.unescape(re.sub(r"\s+", " ", without_code)).strip()
        if visible:
            lines.append((number, visible))
    return lines


def find_failures(text: str) -> list[tuple[int, str, str]]:
    failures: list[tuple[int, str, str]] = []
    for line_number, line in visible_lines(text):
        probe = normalize(line)
        for pattern, fix in RULES:
            if pattern.search(probe):
                # 回報原始字形，不回報正規化後的結果，方便直接搜尋定位。
                failures.append((line_number, line, fix))
                break
    return failures


SIMPLIFIED_BAD = (
    "模型不知道先保哪一个。",
    "一个问题平时可以怎么走。",
    "Explorer 把线索带回来。",
    "先把事实找出来。",
    "这个流程怎么跑下去。",
    "让这个能力落下去。",
    "子 Agent 直接吃下整段对话。",
    "把内容塞进提示词。",
    "让模型跑测试。",
    "先把这段流程搞顺。",
    "这个功能负责承接需求。",
    "这套方案可以赋能开发团队。",
    "原因很简单：它读取了错误的文件。",
    "真正重要的是，我们理解了工具的边界。",
    "说白了，本质上就是这样。",
)

# 每一條都對應上面同一位置的簡體案例。這組是本 repo 實際會遇到的字形，
# 原版 linter 對它們全數漏抓，是加簡繁正規化的原因。
TRADITIONAL_BAD = (
    "模型不知道先保哪一個。",
    "一個問題平時可以怎麼走。",
    "Explorer 把線索帶回來。",
    "先把事實找出來。",
    "這個流程怎麼跑下去。",
    "讓這個能力落下去。",
    "子 Agent 直接吃下整段對話。",
    "把內容塞進提示詞。",
    "讓模型跑測試。",
    "先把這段流程搞順。",
    "這個功能負責承接需求。",
    "這套方案可以賦能開發團隊。",
    "原因很簡單：它讀取了錯誤的檔案。",
    "真正重要的是，我們理解了工具的邊界。",
    "說白了，本質上就是這樣。",
)

GOOD = (
    "模型必須先遵循事實準確這項要求。",
    "一個程式碼問題通常怎麼處理。",
    "Explorer 把查到的呼叫和設定說明清楚。",
    "查看呼叫和設定，確認當前實作。",
    "這個流程由主 Agent 繼續執行。",
    "實作這項能力。",
    "子 Agent 讀取與任務有關的對話。",
    "把內容寫進提示詞。",
    "讓模型執行測試。",
    "這個功能負責處理需求。",
    "這套方法會根據情況變化，沒有固定流程。",
    "使用 Codex 時，先說明任務；完成後，再查看改動。",
    "模型必须先遵循事实准确这项要求。",
    "让模型运行测试。",
    "把内容写进提示词。",
)


def self_test() -> int:
    ok = True

    for label, cases in (("简体", SIMPLIFIED_BAD), ("繁體", TRADITIONAL_BAD)):
        failures = find_failures("\n".join(cases))
        caught = {line for line, _, _ in failures}
        missed = [c for i, c in enumerate(cases, start=1) if i not in caught]
        if missed:
            ok = False
            print(f"FAIL  {label}壞案例有 {len(missed)} 行漏抓：")
            for case in missed:
                print(f"      {case}")

    false_positives = find_failures("\n".join(GOOD))
    if false_positives:
        ok = False
        print("FAIL  好案例被誤判：")
        for line_number, line, _ in false_positives:
            print(f"      {line_number}: {line}")

    if not ok:
        return 1
    print(f"PASS  self-test（简体 {len(SIMPLIFIED_BAD)} + 繁體 "
          f"{len(TRADITIONAL_BAD)} 條壞案例全抓、{len(GOOD)} 條好案例無誤判）")
    return 0


def main() -> int:
    parser = argparse.ArgumentParser(description="檢出 TONE.md 已知的壞表達（簡繁通吃）。")
    parser.add_argument("files", nargs="*", help="UTF-8 檔案路徑，或用 - 讀 stdin")
    parser.add_argument("--self-test", action="store_true")
    args = parser.parse_args()
    if args.self_test:
        return self_test()
    if not args.files:
        parser.error("請提供一個以上檔案，或使用 --self-test")
    failed = False
    for name in args.files:
        for line_number, line, fix in find_failures(read_text(name)):
            print(f"FAIL  {name}:{line_number}: {line}\n      {fix}")
            failed = True
    if not failed:
        print("PASS  沒有已知的壞表達")
    return 1 if failed else 0


if __name__ == "__main__":
    raise SystemExit(main())
