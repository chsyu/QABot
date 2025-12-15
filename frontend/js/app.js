/**
 * 客服聊天機器人前端應用程式
 * 
 * 本檔案使用 jQuery 框架開發，包含所有的功能邏輯：
 * - API 連線配置
 * - DOM 元素操作
 * - 文件上傳功能
 * - 聊天訊息處理
 * - 歷史記錄管理
 * 
 * jQuery 是廣泛使用的 JavaScript 函式庫，提供簡潔的語法來操作 DOM 和處理事件
 */

// ============================================
// API 配置
// ============================================
/**
 * API 基礎 URL
 * 設定後端 API 伺服器的位址
 * 開發環境通常使用 localhost:8000
 */
const API_BASE_URL = 'http://localhost:8000';

// ============================================
// DOM 元素初始化（使用 jQuery 選擇器）
// ============================================
/**
 * 使用 jQuery 選擇器取得頁面上的 DOM 元素
 * jQuery 使用 $() 函數來選取元素，語法類似 CSS 選擇器
 * #id 代表選取 id 屬性的元素
 * 
 * 注意：這些變數儲存的是 jQuery 物件，不是原生 DOM 元素
 */
const $dropZone = $('#dropZone');           // 檔案拖放區域
const $fileInput = $('#fileInput');         // 隱藏的文字輸入框
const $uploadStatus = $('#uploadStatus');   // 上傳狀態顯示區域
const $chatMessages = $('#chatMessages');   // 聊天訊息容器
const $messageInput = $('#messageInput');   // 訊息輸入框
const $sendBtn = $('#sendBtn');             // 發送按鈕
const $clearHistoryBtn = $('#clearHistoryBtn'); // 清除歷史按鈕

// ============================================
// 文件上傳功能
// ============================================

/**
 * 使用 jQuery 的事件綁定方法 .on()
 * 當使用者點擊拖放區域時，觸發隱藏的檔案選擇對話框
 * .on('click', ...) 等同於原生的 addEventListener('click', ...)
 */
$dropZone.on('click', function() {
    // jQuery 物件的 .click() 方法可以觸發點擊事件
    $fileInput.click();
});

/**
 * 拖放事件：當檔案被拖到拖放區域上方時
 * jQuery 的事件處理可以使用 function(e) 來接收事件物件
 * preventDefault() 阻止瀏覽器預設行為
 * .addClass() 方法用來添加 CSS 類別
 */
$dropZone.on('dragover', function(e) {
    e.preventDefault();
    // jQuery 的 .addClass() 等同於原生的 classList.add()
    $(this).addClass('drag-over');
});

/**
 * 拖放事件：當檔案離開拖放區域時
 * .removeClass() 方法用來移除 CSS 類別
 */
$dropZone.on('dragleave', function() {
    $(this).removeClass('drag-over');
});

/**
 * 拖放事件：當檔案被放下時
 * 取得被放下的檔案並呼叫處理函數
 */
$dropZone.on('drop', function(e) {
    e.preventDefault();
    $(this).removeClass('drag-over');
    const files = e.originalEvent.dataTransfer.files;
    // originalEvent 是 jQuery 包裝後存取原生事件物件的方式
    if (files.length > 0) {
        handleFileUpload(files[0]);
    }
});

/**
 * 當使用者透過檔案選擇對話框選擇檔案時
 * jQuery 的 .on('change', ...) 綁定變更事件
 */
$fileInput.on('change', function(e) {
    // jQuery 物件的 .prop() 方法可以取得屬性值
    // this 指向原生的 DOM 元素，所以需要用 this.files 或 $(this)[0].files
    if (this.files.length > 0) {
        handleFileUpload(this.files[0]);
    }
});

/**
 * 處理檔案上傳
 * 使用 jQuery 的 $.ajax() 來發送 HTTP 請求
 * 
 * @param {File} file - 要上傳的檔案物件
 */
function handleFileUpload(file) {
    // 驗證檔案格式：只允許 .txt 檔案
    if (!file.name.endsWith('.txt')) {
        showUploadStatus('只支援 .txt 格式的文件', 'error');
        return;
    }

    // 建立 FormData 物件，用於傳送檔案到伺服器
    const formData = new FormData();
    formData.append('file', file);

    // 顯示上傳中的狀態
    showUploadStatus('上傳中...', 'loading');
    $sendBtn.prop('disabled', true); // jQuery 的 .prop() 方法設定屬性

    // 使用 jQuery 的 $.ajax() 方法發送 POST 請求
    $.ajax({
        url: `${API_BASE_URL}/upload`,
        method: 'POST',
        data: formData,
        processData: false,  // 告訴 jQuery 不要處理資料（因為是 FormData）
        contentType: false,  // 告訴 jQuery 不要設定 Content-Type（讓瀏覽器自動設定）
        success: function(data) {
            // 請求成功時執行的回呼函數
            showUploadStatus(`文件上傳成功：${data.filename}`, 'success');
        },
        error: function(xhr, status, error) {
            // 請求失敗時執行的回呼函數
            // xhr.responseJSON 可以取得伺服器回傳的 JSON 資料
            const detail = xhr.responseJSON?.detail || error;
            showUploadStatus(`上傳失敗：${detail}`, 'error');
        },
        complete: function() {
            // 無論成功或失敗都會執行的回呼函數（類似 try-finally）
            $sendBtn.prop('disabled', false);
        }
    });
}

/**
 * 顯示上傳狀態訊息
 * 
 * @param {string} message - 要顯示的訊息文字
 * @param {string} type - 訊息類型：'success'（成功）、'error'（錯誤）、'loading'（載入中）
 */
function showUploadStatus(message, type) {
    // jQuery 的 .removeClass() 移除類別
    $uploadStatus.removeClass('hidden');
    
    // jQuery 的 .removeClass() 和 .addClass() 可以鏈式呼叫
    // 根據類型設定不同的樣式類別
    $uploadStatus.removeClass('bg-green-100 bg-red-100 bg-blue-100 text-green-700 text-red-700 text-blue-700')
                 .addClass('mt-4 p-3 rounded-lg');
    
    if (type === 'success') {
        $uploadStatus.addClass('bg-green-100 text-green-700');
    } else if (type === 'error') {
        $uploadStatus.addClass('bg-red-100 text-red-700');
    } else {
        $uploadStatus.addClass('bg-blue-100 text-blue-700');
    }
    
    // jQuery 的 .text() 方法設定元素的文字內容（會自動跳脫 HTML）
    $uploadStatus.text(message);
    
    // 如果不是載入中狀態，5 秒後自動隱藏訊息
    if (type !== 'loading') {
        setTimeout(function() {
            $uploadStatus.addClass('hidden');
        }, 5000);
    }
}

// ============================================
// 聊天訊息功能
// ============================================

/**
 * 使用 jQuery 的 .click() 簡寫方法
 * 點擊發送按鈕時觸發發送訊息
 */
$sendBtn.on('click', sendMessage);

/**
 * 在輸入框按下 Enter 鍵時發送訊息
 * Shift + Enter 可以換行（不會發送）
 */
$messageInput.on('keypress', function(e) {
    if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault();
        sendMessage();
    }
});

/**
 * 發送聊天訊息到伺服器
 * 使用 jQuery 的 $.ajax() 或 $.post() 來發送請求
 */
function sendMessage() {
    // jQuery 的 .val() 方法可以取得或設定表單元素的值
    const message = $messageInput.val().trim();
    // 如果訊息為空，不執行任何動作
    if (!message) return;

    // 立即顯示使用者的訊息
    addMessage('user', message);
    $messageInput.val('');  // 清空輸入框
    $sendBtn.prop('disabled', true);  // 禁用發送按鈕

    // 顯示載入中的訊息
    const loadingId = addMessage('bot', '思考中...', true);

    // 使用 jQuery 的 $.ajax() 發送 POST 請求
    $.ajax({
        url: `${API_BASE_URL}/chat`,
        method: 'POST',
        contentType: 'application/json',  // 設定 Content-Type
        data: JSON.stringify({ message }),  // 將物件轉換為 JSON 字串
        success: function(data) {
            // 移除載入訊息，顯示 AI 的真實回應
            removeMessage(loadingId);
            addMessage('bot', data.response);
        },
        error: function(xhr) {
            // 顯示錯誤訊息
            removeMessage(loadingId);
            const detail = xhr.responseJSON?.detail || '發生錯誤';
            addMessage('bot', `錯誤：${detail}`, false, true);
        },
        complete: function() {
            // 恢復發送按鈕狀態，並將游標聚焦回輸入框
            $sendBtn.prop('disabled', false);
            $messageInput.focus();  // jQuery 的 .focus() 方法聚焦元素
        }
    });
}

/**
 * 在聊天區域新增一則訊息
 * 
 * @param {string} role - 訊息角色：'user'（使用者）或 'bot'（機器人）
 * @param {string} content - 訊息內容
 * @param {boolean} isLoading - 是否為載入中狀態（預設 false）
 * @param {boolean} isError - 是否為錯誤訊息（預設 false）
 * @returns {number} 訊息的唯一 ID，可用於後續刪除
 */
function addMessage(role, content, isLoading = false, isError = false) {
    // 使用時間戳記作為唯一 ID
    const messageId = Date.now();
    
    // jQuery 可以使用 $('<div>') 建立新元素
    const $messageDiv = $('<div>').attr('id', `msg-${messageId}`);
    
    // 根據角色決定訊息對齊方式：使用者靠右，機器人靠左
    const flexClass = role === 'user' ? 'justify-end' : 'justify-start';
    $messageDiv.addClass(`flex ${flexClass}`);
    
    // 根據角色和狀態決定訊息氣泡的樣式類別
    const bubbleClass = role === 'user' 
        ? 'bg-blue-500 text-white rounded-lg px-4 py-2 max-w-xs'
        : isError
            ? 'bg-red-100 text-red-700 rounded-lg px-4 py-2 max-w-xs'
            : isLoading
                ? 'bg-gray-200 text-gray-600 rounded-lg px-4 py-2 max-w-xs'
                : 'bg-white border border-gray-200 rounded-lg px-4 py-2 max-w-xs';
    
    // jQuery 的鏈式呼叫建立訊息氣泡
    const $bubble = $('<div>').addClass(bubbleClass);
    const $paragraph = $('<p>').addClass('whitespace-pre-wrap').text(content);
    $bubble.append($paragraph);
    $messageDiv.append($bubble);
    
    // 移除「還沒有對話記錄」的提示訊息
    // jQuery 的 .find() 方法可以找尋子元素
    const $emptyMsg = $chatMessages.find('p.text-center');
    if ($emptyMsg.length > 0) {
        $emptyMsg.remove();  // jQuery 的 .remove() 方法移除元素
    }
    
    // jQuery 的 .append() 方法將元素加入容器
    $chatMessages.append($messageDiv);
    // 自動捲動到最底部
    scrollToBottom();
    
    return messageId;
}

/**
 * 移除指定的訊息
 * 
 * @param {number} messageId - 要移除的訊息 ID
 */
function removeMessage(messageId) {
    // jQuery 選擇器選取元素，如果不存在也不會報錯
    $(`#msg-${messageId}`).remove();
}

/**
 * HTML 跳脫函數
 * jQuery 的 .text() 方法會自動跳脫 HTML，但這裡示範手動跳脫的方式
 * 
 * @param {string} text - 要跳脫的文字
 * @returns {string} 跳脫後的 HTML 安全文字
 */
function escapeHtml(text) {
    // 使用 jQuery 建立臨時元素，.text() 會自動跳脫
    return $('<div>').text(text).html();
}

/**
 * 將聊天區域捲動到最底部
 * jQuery 的 .scrollTop() 可以取得或設定捲動位置
 */
function scrollToBottom() {
    // scrollHeight 需要從原生 DOM 元素取得
    const scrollHeight = $chatMessages[0].scrollHeight;
    $chatMessages.scrollTop(scrollHeight);
}

// ============================================
// 歷史記錄功能
// ============================================

/**
 * 清除聊天歷史記錄
 * 使用 jQuery 的 .on('click', ...) 綁定點擊事件
 */
$clearHistoryBtn.on('click', function() {
    // 使用 confirm 對話框確認使用者真的要清除
    if (!confirm('確定要清除所有聊天歷史嗎？')) return;

    // 使用 jQuery 的 $.ajax() 發送 DELETE 請求
    $.ajax({
        url: `${API_BASE_URL}/history`,
        method: 'DELETE',
        success: function() {
            // 清空聊天區域，顯示預設訊息
            // jQuery 的 .html() 方法設定元素的 HTML 內容
            $chatMessages.html('<p class="text-center text-gray-500">還沒有對話記錄</p>');
        },
        error: function(xhr) {
            const detail = xhr.responseJSON?.detail || '發生錯誤';
            alert(`清除失敗：${detail}`);
        }
    });
});

/**
 * 載入聊天歷史記錄
 * 使用 jQuery 的 $.ajax() 或 $.getJSON() 取得資料
 */
function loadHistory() {
    // 使用 jQuery 的 $.ajax() 發送 GET 請求
    $.ajax({
        url: `${API_BASE_URL}/history`,
        method: 'GET',
        success: function(data) {
            // 如果有歷史記錄，逐一顯示
            if (data.history && data.history.length > 0) {
                $chatMessages.empty();  // jQuery 的 .empty() 清空子元素
                // 使用 jQuery 的 $.each() 遍歷陣列
                $.each(data.history, function(index, item) {
                    addMessage('user', item.user_message);
                    addMessage('bot', item.bot_response);
                });
            }
        },
        error: function(xhr, status, error) {
            // 載入失敗時只在控制台記錄錯誤
            console.error('載入歷史記錄失敗：', error);
        }
    });
}

// ============================================
// 頁面初始化
// ============================================
/**
 * 使用 jQuery 的 $(document).ready() 確保 DOM 載入完成後再執行
 * 這是 jQuery 的最佳實踐，確保所有 HTML 元素都已載入
 * 也可以簡寫為 $(function() { ... })
 */
$(document).ready(function() {
    // 當頁面載入完成時，自動載入歷史記錄
    loadHistory();
});
