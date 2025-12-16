# QABot - 基於 RAG 的客服聊天機器人

## 📋 專案簡介

這是一個基於 RAG (Retrieval-Augmented Generation) 技術開發的客服聊天機器人系統。透過上傳客服資料文件，系統會自動建立向量索引，並使用本地的 Ollama 大語言模型來回答用戶的問題。

### 主要特色

- 🤖 使用 **Ollama** 本地部署模型，無需網路連線即可運行
- 📄 支援文字檔 (.txt) 拖放上傳，自動建立向量索引
- 💬 基於 RAG 技術，根據上傳的資料回答問題
- 💾 使用 ChromaDB 向量資料庫儲存文件嵌入
- 📝 自動保存聊天歷史記錄
- 🎨 現代化的網頁介面，操作簡單直覺

## 🛠️ 技術架構

### 後端技術
- **FastAPI**: Web 框架
- **Ollama**: 本地 LLM 服務（使用 `qwen2.5:7b-instruct` 和 `nomic-embed-text`）
- **LangChain**: RAG 框架
- **ChromaDB**: 向量資料庫
- **SQLite**: 聊天歷史與文件儲存
- **Uvicorn**: ASGI 伺服器

### 前端技術
- **HTML5**: 網頁結構
- **TailwindCSS**: 樣式框架
- **jQuery**: JavaScript 函式庫

## 📦 前置需求

### 1. Python 環境
- Python 3.10 或以上版本
- pip 或 pipenv 套件管理工具

### 2. Ollama
- 需要在本地安裝並運行 Ollama 服務
- 下載連結：https://ollama.ai/

### 3. 瀏覽器
- 支援現代瀏覽器（Chrome、Firefox、Safari、Edge 等）

## 🚀 安裝步驟

### 步驟 1: 安裝 Ollama

#### macOS / Linux
```bash
curl -fsSL https://ollama.ai/install.sh | sh
```

#### Windows
請至 [Ollama 官網](https://ollama.ai/) 下載安裝程式並執行

### 步驟 2: 啟動 Ollama 服務

安裝完成後，Ollama 服務通常會自動啟動。如果沒有，請執行：

```bash
ollama serve
```

服務預設運行在 `http://localhost:11434`

### 步驟 3: 下載必要的 Ollama 模型

本專案需要使用以下兩個模型：

```bash
# 下載嵌入模型（用於將文字轉換為向量）
ollama pull nomic-embed-text

# 下載 LLM 模型（用於生成回答）
ollama pull qwen2.5:7b-instruct
```

**注意**：模型下載可能需要一些時間，取決於您的網路速度。qwen2.5:7b-instruct 約為 4.4GB，nomic-embed-text 約為 274MB。

### 步驟 4: 安裝 Python 依賴套件

#### 方法 A: 使用 pip
```bash
pip install -r requirements.txt
```

#### 方法 B: 使用 pipenv（推薦）
```bash
pipenv install
```

## 🎯 啟動與使用

### 步驟 1: 啟動後端伺服器

在專案根目錄執行：

#### 使用 uvicorn 直接啟動
```bash
python -m uvicorn backend.main:app --reload --host 0.0.0.0 --port 8000
```

#### 或使用 pipenv
```bash
pipenv run python backend/main.py
```

後端 API 將運行在 `http://localhost:8000`

### 步驟 2: 開啟前端網頁

使用瀏覽器開啟 `frontend/index.html` 檔案：

#### macOS
```bash
open frontend/index.html
```

#### Linux
```bash
xdg-open frontend/index.html
```

#### Windows
```bash
start frontend/index.html
```

或直接雙擊 `frontend/index.html` 檔案。

### 步驟 3: 上傳測試資料

1. 將 `test_data.txt` 檔案拖放到網頁上的拖放區域
2. 等待上傳完成（會顯示「文件上傳成功」訊息）
3. 系統會自動處理文件並建立向量索引

### 步驟 4: 開始對話

在上傳文件後，即可在輸入框中輸入問題，例如：
- 「退貨條件是什麼？」
- 「客服專線幾號？」
- 「免運費的條件是什麼？」
- 「會員等級有哪些？」

## 📁 專案結構

```
QABot/
├── backend/                 # 後端程式碼
│   ├── __init__.py
│   ├── main.py             # FastAPI 主應用程式
│   ├── ollama_client.py    # Ollama 客戶端配置
│   ├── rag.py              # RAG 邏輯處理
│   ├── database.py         # 資料庫初始化
│   └── models.py           # 資料模型定義
├── frontend/               # 前端程式碼
│   ├── index.html          # 主網頁
│   └── js/
│       └── app.js          # 前端 JavaScript 邏輯
├── chroma_db/              # ChromaDB 向量資料庫（自動生成）
├── custom_service.db       # SQLite 資料庫（自動生成）
├── test_data.txt           # 測試資料檔案
├── requirements.txt        # Python 依賴套件列表
├── Pipfile                 # pipenv 配置文件
├── LICENSE                 # MIT 授權文件
└── README.md               # 本文件
```

## ⚙️ 配置說明

### 修改模型設定

如需更換 Ollama 模型，請編輯 `backend/ollama_client.py`：

```python
EMBED_MODEL = "nomic-embed-text"  # 嵌入模型
LLM_MODEL = "qwen2.5:7b-instruct"  # LLM 模型
```

### 修改 API 連線位址

如果後端運行在不同位址或埠號，請編輯 `frontend/js/app.js`：

```javascript
const API_BASE_URL = 'http://localhost:8000';  // 修改為您的後端位址
```

### 修改 Ollama 服務位址

如果 Ollama 運行在不同位址，請設定環境變數：

```bash
export OLLAMA_BASE_URL="http://your-ollama-server:11434"
```

或在 `backend/ollama_client.py` 中直接修改：

```python
OLLAMA_BASE_URL = os.getenv("OLLAMA_BASE_URL", "http://localhost:11434")
```

## 🔍 常見問題

### Q1: 上傳文件後無法回答問題？

**A**: 請確認：
1. Ollama 服務是否正在運行（`ollama serve`）
2. 模型是否已正確下載（`ollama list` 查看）
3. 後端伺服器日誌是否有錯誤訊息

### Q2: 模型下載很慢或失敗？

**A**: 
- 確保網路連線正常
- 可以嘗試重新下載：`ollama pull <model-name>`
- 檢查磁碟空間是否充足

### Q3: 後端啟動失敗？

**A**: 
- 確認 Python 版本是否符合需求（3.10+）
- 確認所有依賴套件已正確安裝：`pip install -r requirements.txt`
- 檢查埠號 8000 是否被占用

### Q4: 前端無法連接到後端？

**A**:
- 確認後端伺服器已啟動
- 檢查瀏覽器控制台是否有 CORS 錯誤
- 確認 `frontend/js/app.js` 中的 `API_BASE_URL` 設定正確

### Q5: ChromaDB 權限錯誤？

**A**: 
- 確保 `chroma_db` 目錄有寫入權限
- 如果出現權限問題，可以刪除 `chroma_db` 目錄讓系統重新建立

## 📝 FastAPI API 文檔

### 自動生成的交互式文檔

FastAPI 自動生成互動式 API 文檔，啟動後端伺服器後，您可以透過以下網址訪問：

- **Swagger UI**（推薦）：http://localhost:8000/docs
  - 提供完整的 API 端點列表
  - 可以直接在瀏覽器中測試 API
  - 顯示請求/響應範例和數據模型

- **ReDoc**：http://localhost:8000/redoc
  - 提供更美觀的文檔閱讀介面
  - 適合查看完整的 API 規範

### API 基礎 URL

預設 API 基礎位址：`http://localhost:8000`

### 端點列表

#### 1. GET `/` - 健康檢查

檢查 API 服務是否正常運行。

**請求範例**:
```bash
curl http://localhost:8000/
```

**成功響應** (200 OK):
```json
{
  "message": "客服聊天機器人 API",
  "status": "running"
}
```

---

#### 2. POST `/upload` - 上傳文件

上傳文字檔案（.txt）到系統，系統會自動處理並建立向量索引。

**端點**: `/upload`

**請求方法**: `POST`

**Content-Type**: `multipart/form-data`

**請求參數**:
| 參數名 | 類型 | 必填 | 說明 |
|--------|------|------|------|
| file | File | 是 | 要上傳的文字檔案，僅支援 .txt 格式 |

**請求範例**:
```bash
curl -X POST "http://localhost:8000/upload" \
  -F "file=@test_data.txt"
```

**成功響應** (200 OK):
```json
{
  "message": "文件上傳成功",
  "filename": "test_data.txt",
  "size": 1234
}
```

**錯誤響應**:
- **400 Bad Request**: 檔案格式不正確
  ```json
  {
    "detail": "只支援 .txt 格式的文件"
  }
  ```

- **500 Internal Server Error**: 處理文件到向量庫失敗
  ```json
  {
    "detail": "處理文件到向量庫失敗：錯誤訊息"
  }
  ```

**注意事項**:
- 每次上傳新文件會清除舊的文件和向量索引
- 上傳後需要等待系統處理完成（通常幾秒鐘）
- 確保 Ollama 服務正在運行且模型已下載

---

#### 3. POST `/chat` - 發送聊天訊息

向聊天機器人發送問題，系統會使用 RAG 技術根據上傳的資料回答。

**端點**: `/chat`

**請求方法**: `POST`

**Content-Type**: `application/json`

**請求體** (ChatMessage):
| 欄位名 | 類型 | 必填 | 說明 |
|--------|------|------|------|
| message | string | 是 | 用戶的問題，不能為空 |

**請求範例**:
```bash
curl -X POST "http://localhost:8000/chat" \
  -H "Content-Type: application/json" \
  -d '{"message": "退貨條件是什麼？"}'
```

**成功響應** (200 OK, ChatResponse):
```json
{
  "response": "商品需在收到後7天內申請退貨，商品需保持全新狀態，未使用、未拆封，需保留完整包裝和發票。",
  "timestamp": "2024-01-01T12:00:00.123456"
}
```

**錯誤響應**:
- **400 Bad Request**: 訊息為空
  ```json
  {
    "detail": "訊息不能為空"
  }
  ```

- **500 Internal Server Error**: 處理訊息時發生錯誤
  ```json
  {
    "detail": "處理訊息時發生錯誤：錯誤訊息"
  }
  ```

**注意事項**:
- 如果尚未上傳文件，會返回提示訊息
- 回答是基於已上傳的資料內容生成
- 每次對話都會自動保存到聊天歷史

---

#### 4. GET `/history` - 獲取聊天歷史

獲取所有聊天歷史記錄，按時間順序排列。

**端點**: `/history`

**請求方法**: `GET`

**請求範例**:
```bash
curl http://localhost:8000/history
```

**成功響應** (200 OK, HistoryResponse):
```json
{
  "history": [
    {
      "id": 1,
      "timestamp": "2024-01-01T12:00:00",
      "user_message": "退貨條件是什麼？",
      "bot_response": "商品需在收到後7天內申請退貨...",
      "session_id": "123e4567-e89b-12d3-a456-426614174000"
    },
    {
      "id": 2,
      "timestamp": "2024-01-01T12:05:00",
      "user_message": "客服專線幾號？",
      "bot_response": "客服專線：0800-123-456...",
      "session_id": "123e4567-e89b-12d3-a456-426614174000"
    }
  ]
}
```

**空歷史響應** (200 OK):
```json
{
  "history": []
}
```

**錯誤響應**:
- **500 Internal Server Error**: 獲取歷史記錄時發生錯誤
  ```json
  {
    "detail": "獲取歷史記錄時發生錯誤：錯誤訊息"
  }
  ```

**注意事項**:
- 歷史記錄按時間戳記升序排列
- 所有記錄屬於同一個 session_id（除非清除歷史）

---

#### 5. DELETE `/history` - 清除聊天歷史

清除所有聊天歷史記錄，並生成新的 session ID。

**端點**: `/history`

**請求方法**: `DELETE`

**請求範例**:
```bash
curl -X DELETE http://localhost:8000/history
```

**成功響應** (200 OK):
```json
{
  "message": "聊天歷史已清除"
}
```

**錯誤響應**:
- **500 Internal Server Error**: 清除歷史記錄時發生錯誤
  ```json
  {
    "detail": "清除歷史記錄時發生錯誤：錯誤訊息"
  }
  ```

**注意事項**:
- 此操作不可逆，請謹慎使用
- 清除後會生成新的 session_id

---

### 錯誤處理

所有 API 端點使用統一的錯誤處理機制：

#### HTTP 狀態碼

| 狀態碼 | 說明 |
|--------|------|
| 200 | 請求成功 |
| 400 | 請求參數錯誤（例如：檔案格式不符、訊息為空） |
| 500 | 伺服器內部錯誤 |

#### 錯誤響應格式

所有錯誤響應都遵循以下格式：

```json
{
  "detail": "錯誤訊息說明"
}
```

### CORS 配置

API 已配置 CORS 中間件，允許所有來源訪問（`allow_origins=["*"]`）。這使得前端可以直接從瀏覽器呼叫 API，無需額外配置。

### 測試 API

#### 使用 cURL

```bash
# 健康檢查
curl http://localhost:8000/

# 上傳文件
curl -X POST "http://localhost:8000/upload" -F "file=@test_data.txt"

# 發送聊天訊息
curl -X POST "http://localhost:8000/chat" \
  -H "Content-Type: application/json" \
  -d '{"message": "您的問題"}'

# 獲取歷史記錄
curl http://localhost:8000/history

# 清除歷史記錄
curl -X DELETE http://localhost:8000/history
```

#### 使用 Swagger UI（推薦）

1. 啟動後端伺服器
2. 在瀏覽器打開 http://localhost:8000/docs
3. 點擊任意端點，展開詳細資訊
4. 點擊 "Try it out" 按鈕
5. 填入參數並點擊 "Execute"
6. 查看響應結果

#### 使用 Python requests

```python
import requests

# 上傳文件
with open('test_data.txt', 'rb') as f:
    files = {'file': f}
    response = requests.post('http://localhost:8000/upload', files=files)
    print(response.json())

# 發送聊天訊息
response = requests.post(
    'http://localhost:8000/chat',
    json={'message': '退貨條件是什麼？'}
)
print(response.json())

# 獲取歷史記錄
response = requests.get('http://localhost:8000/history')
print(response.json())
```

## 🎓 使用範例

1. **啟動服務**
   ```bash
   # 終端機 1: 啟動 Ollama（如果尚未運行）
   ollama serve
   
   # 終端機 2: 啟動後端
   python -m uvicorn backend.main:app --reload
   ```

2. **上傳資料**
   - 開啟 `frontend/index.html`
   - 將 `test_data.txt` 拖放到網頁上

3. **開始對話**
   - 輸入：「退貨需要什麼條件？」
   - 系統會根據上傳的資料回答問題

## 📄 授權

本專案採用 [MIT License](LICENSE) 授權。

Copyright (c) 2024 QABot Contributors

MIT License 允許您自由使用、修改、分發本專案，只需保留原始的版權聲明和許可證聲明。詳見 [LICENSE](LICENSE) 文件。

## 🤝 貢獻

歡迎提交 Issue 或 Pull Request！

---

**注意**：首次使用時請確保 Ollama 服務正在運行，並且已下載所需的模型。模型下載只需執行一次，之後即可重複使用。

