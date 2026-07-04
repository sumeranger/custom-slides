LangSmith：LLM 應用的開發與營運平台
什麼是 LangSmith？

LangSmith 是由 LangChain 推出的 LLM 開發平台，專門協助團隊開發、測試、評估、除錯及監控 AI 應用程式。它能完整記錄 AI Agent、RAG、Workflow 的執行過程，讓開發者快速找出問題並持續優化模型表現。

為什麼需要 LangSmith？

AI 應用與傳統系統最大的差異在於：

回應具有隨機性，難以重現問題
Prompt、Model、Tool 彼此互相影響
很難知道 AI 為什麼產生某個答案
缺乏系統化的品質驗證方式

LangSmith 提供完整的可觀測性（Observability）與評估能力，降低 AI 系統維護成本。

核心功能
Prompt Trace（執行追蹤）
完整記錄 Prompt
Token 使用量
Model 回應
Tool Calling 流程
每一步執行耗時

可快速定位 AI 回答異常原因。

Evaluation（品質評估）

建立測試資料集，自動比較：

Prompt A vs Prompt B
Model A vs Model B
Workflow 版本差異

可利用 AI Judge 或人工評分持續驗證品質。

Dataset 管理

集中管理：

問答案例
Regression Test
Benchmark

每次修改 Prompt 或模型後，都能重新驗證是否造成品質下降。

Production Monitoring

正式環境持續監控：

Latency
Error Rate
Token Cost
User Feedback
Trace Log

方便追蹤線上問題與成本。

Debug Agent Workflow

支援 Agent、RAG、多工具流程：

可視化查看：

LLM 呼叫
Tool 呼叫
Retriever 結果
Chain 執行流程

快速分析 AI 推理過程。

導入效益
提高 AI 回答品質
加速 Prompt Debug
建立 Regression Testing 流程
持續監控正式環境
降低 AI 維運成本
支援團隊協作與版本管理
適用情境
RAG 系統
AI Agent
Chatbot
文件問答
Workflow Automation
多模型比較與 A/B Testing
一句話總結

LangSmith 是 AI 應用的「可觀測性（Observability）與品質管理平台」，協助團隊從開發、測試到正式上線，持續追蹤、評估並優化 LLM 應用的品質、效能與成本。