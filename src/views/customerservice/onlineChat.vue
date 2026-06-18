<template>
    <div class="app">

        <!-- 登录弹窗：改用 a-modal，不遮挡整个系统 -->
        <a-modal v-model:open="loginVisible" title="客服登录" :closable="false" :mask-closable="false" width="360px"
            centered>

            <a-form layout="vertical">
                <a-form-item label="客服ID">
                    <div>{{ loginId }}</div>
                </a-form-item>
                <a-form-item style="margin-bottom: 0;">
                    <a-button type="primary" block :loading="loginLoading" @click="doLogin">
                        登录并上线
                    </a-button>
                </a-form-item>
            </a-form>

        </a-modal>

        <!-- 顶部 -->
        <div class="top-bar">
            <h1>客服工作台</h1>
            <div style="display: flex; align-items: center; gap: 12px;">
                <span :class="['status-dot', wsConnected ? 'online' : 'offline']"></span>
                <span>{{ statusText }}</span>
                <a-button v-if="serviceId" danger size="small" @click="confirmOffline">下线</a-button>
            </div>
        </div>

        <div class="main">

            <!-- 左侧 -->
            <div class="sidebar">
                <div class="sidebar-header">用户会话 ({{ userIds.length }})</div>

                <div class="user-list">
                    <div v-for="uid in sortedUserIds" :key="uid"
                        :class="['user-item', currentUserId === uid && 'active']" @click="selectUser(uid)">
                        <div class="user-avatar">{{ (userNameMap[uid] || uid).slice(0, 2) }}</div>

                        <div class="user-info">
                            <div>{{ userNameMap[uid] || uid }}</div>
                            <div class="user-last-msg">{{ sessions[uid].lastMsg }}</div>
                        </div>

                        <span v-if="sessions[uid].unread" class="unread-badge">
                            {{ sessions[uid].unread }}
                        </span>
                    </div>
                </div>
            </div>

            <!-- 右侧 -->
            <div class="chat-area">

                <div v-if="!currentUserId" class="empty-state">
                    请选择用户
                </div>

                <template v-else>
                    <div class="chat-header">
                        <span class="chat-header-title">与 {{ userNameMap[currentUserId] || currentUserId }} 对话</span>
                    </div>

                    <div class="msg-list" ref="msgListRef" @scroll="handleScroll">
                        <!-- 没有更多消息提示 -->
                        <div v-if="currentUserId && sessions[currentUserId] && !sessions[currentUserId].hasMore && sessions[currentUserId].messages.length > 0"
                            class="no-more-messages">
                            没有更多消息了
                        </div>

                        <!-- 加载中提示 -->
                        <div v-if="currentUserId && sessions[currentUserId] && sessions[currentUserId].loadingMore"
                            class="loading-more">
                            加载中...
                        </div>

                        <div v-for="(msg, i) in currentMessages" :key="i">

                            <div v-if="showTime(i)" class="msg-time">
                                {{ formatTime(msg.sendTime) }}
                            </div>

                            <div :class="['msg-row', msg.senderType === 'user' ? 'msg-row-left' : 'msg-row-right']">

                                <template v-if="msg.senderType === 'user'">
                                    <div class="msg-avatar msg-avatar-user">U</div>
                                    <div class="msg-bubble msg-bubble-left">{{ msg.content }}</div>
                                </template>

                                <template v-else>
                                    <div class="msg-bubble msg-bubble-right">{{ msg.content }}</div>
                                    <div class="msg-avatar msg-avatar-service">客服</div>
                                </template>

                            </div>
                        </div>
                    </div>

                    <div class="input-area">
                        <textarea v-model="inputMsg" @keydown="handleKeyDown"></textarea>
                        <button class="btn-send" @click="sendReply">发送</button>
                    </div>
                </template>

            </div>
        </div>
    </div>
</template>

<script setup>
import { ref, reactive, computed, onMounted, nextTick } from 'vue'
import { Modal } from 'ant-design-vue'
import { serviceOnlineLogin, serviceOffline, sendChatReply, getChatHistory } from '@/api/yyf'

const BASE_URL = 'https://hqgy.gzxinxingyiyuan.com/api/'
const WS_URL = 'ws://hqgy.gzxinxingyiyuan.com/api/ws/chat'

// 状态
const loginId = ref(sessionStorage.getItem('username'))
const serviceId = ref('')
const ws = ref(null)
const wsConnected = ref(false)
const loginVisible = ref(true)   // 控制登录弹窗
const loginLoading = ref(false)  // 登录按钮 loading

const sessions = reactive({})
const currentUserId = ref('')
const inputMsg = ref('')
const userNameMap = reactive({}) // 缓存 userId -> userName
const historyLoading = ref(false) // 加载历史记录状态

const msgListRef = ref(null)

// computed
const userIds = computed(() => Object.keys(sessions))

const sortedUserIds = computed(() => {
    return [...userIds.value].sort((a, b) => {
        return (sessions[b].lastTime || '').localeCompare(sessions[a].lastTime || '')
    })
})

const currentMessages = computed(() => {
    return sessions[currentUserId.value]?.messages || []
})

const statusText = computed(() => {
    return serviceId.value ? `${serviceId.value} 在线` : '未登录'
})

// ================= 登录 =================
const doLogin = async () => {
    console.log(WS_URL)

    if (!loginId.value) {
        Modal.warning({ title: '提示', content: '请输入客服ID' })
        return
    }
    loginLoading.value = true
    try {
        const res = await serviceOnlineLogin(loginId.value)
        if (res.code === '200') {
            serviceId.value = loginId.value
            loginVisible.value = false
            connectWS()
        }
    } finally {
        loginLoading.value = false
    }
}

// ================= WS =================
const connectWS = () => {
    console.log(WS_URL)
    ws.value = new WebSocket(`${WS_URL}?serviceId=${serviceId.value}`)

    ws.value.onopen = () => {
        wsConnected.value = true
    }

    ws.value.onmessage = e => {
        handleMsg(JSON.parse(e.data))
    }

    ws.value.onclose = () => {
        wsConnected.value = false
        setTimeout(connectWS, 3000)
    }
}

// ================= 消息 =================
const handleMsg = (msg) => {
    console.log('handleMsg', msg)
    const uid = msg.userId
    if (!sessions[uid]) {
        sessions[uid] = {
            messages: [],
            unread: 0,
            currentPage: 1,
            pageSize: 20,
            hasMore: true,
            loadingMore: false
        }
    } else {
        // 确保分页相关属性存在
        if (sessions[uid].hasMore === undefined) {
            sessions[uid].hasMore = true
        }
        if (!sessions[uid].currentPage) {
            sessions[uid].currentPage = 1
        }
        if (!sessions[uid].pageSize) {
            sessions[uid].pageSize = 20
        }
        if (sessions[uid].loadingMore === undefined) {
            sessions[uid].loadingMore = false
        }
    }

    // 缓存用户名
    if (msg.userName) {
        userNameMap[uid] = msg.userName
    }

    // 如果 WebSocket 消息没有 sendTime，补充当前时间
    if (!msg.sendTime) {
        msg.sendTime = new Date().toLocaleString('zh-CN', {
            year: 'numeric', month: '2-digit', day: '2-digit',
            hour: '2-digit', minute: '2-digit', second: '2-digit',
            hour12: false
        }).replace(/\//g, '-')
    }

    // 去重：如果该消息已存在（根据 id 判断），不重复添加
    if (msg.id && sessions[uid].messages.some(m => m.id === msg.id)) {
        return
    }

    sessions[uid].messages.push(msg)
    sessions[uid].lastMsg = msg.content
    sessions[uid].lastTime = msg.sendTime

    if (uid !== currentUserId.value) {
        sessions[uid].unread++
    }

    if (uid === currentUserId.value) {
        scrollBottom()
    }
}

// ================= 选择用户 =================
const selectUser = async (uid) => {
    currentUserId.value = uid

    // 确保 session 已初始化
    if (!sessions[uid]) {
        sessions[uid] = {
            messages: [],
            unread: 0,
            currentPage: 1,
            pageSize: 2000,
            hasMore: true,
            loadingMore: false
        }
    }

    sessions[uid].unread = 0

    // 加载历史记录（无论是否有实时消息，都加载第一页历史）
    console.log(`选择用户 ${uid}，开始加载历史记录`)
    console.log(sessions[uid].messages.length)

    // 无论是否有实时消息，都加载历史记录，以获取完整的聊天历史
    await loadHistory(uid)
    console.log(`选择用户 ${uid}，历史记录加载完毕`)

    nextTick(scrollBottom)
}

// ================= 加载历史记录 =================
const loadHistory = async (uid, loadMore = false) => {
    console.log('loadHistory 函数被调用，uid:', uid)
    console.log('sessions[uid]:', sessions[uid])
    // 如果正在加载，直接返回
    // 首次加载时忽略 hasMore 的值，总是尝试加载历史记录
    if (!sessions[uid] || sessions[uid].loadingMore) {
        console.log('loadHistory 函数返回，原因:', !sessions[uid] ? 'sessions[uid] 不存在' : 'loadingMore 为 true')
        return
    }
    // 加载更多时，如果已经没有更多数据，直接返回
    if (loadMore && !sessions[uid].hasMore) {
        console.log('loadHistory 函数返回，原因: 加载更多时 hasMore 为 false')
        return
    }
    console.log('loadHistory 函数继续执行')

    sessions[uid].loadingMore = true
    try {
        const page = loadMore ? sessions[uid].currentPage + 1 : 1
        console.log(`开始加载历史消息，userId: ${uid}, page: ${page}`)

        const res = await getChatHistory({
            userId: uid,
            currentPage: page,
            pageSize: sessions[uid].pageSize
        })

        console.log(`历史消息接口返回:`, res)

        if (res.code === '200' && res.data) {
            // 检查接口返回的数据结构
            let list = []
            let total = 0

            if (Array.isArray(res.data)) {
                // 接口直接返回消息列表
                list = res.data
                // 对于一次性返回所有消息的接口，设置 hasMore 为 false
                sessions[uid].hasMore = false
            } else if (res.data.data) {
                // 接口返回的数据包含 data 和 total 字段
                list = res.data.data
                total = res.data.total || 0
                // 判断是否还有更多数据
                const loadedCount = sessions[uid].messages.length + list.length
                sessions[uid].hasMore = loadedCount < total
            }

            console.log(`历史消息数据:`, list)
            console.log(`服务ID: ${serviceId.value}`)

            // 处理历史消息数据，确保必要字段存在
            for (const msg of list) {
                // 确保 userId 字段存在
                if (!msg.userId) {
                    msg.userId = uid
                }
                // 确保 senderType 字段存在
                if (!msg.senderType) {
                    msg.senderType = 'user' // 默认为用户消息
                }
                // 确保 serviceId 字段存在
                if (!msg.serviceId && serviceId.value) {
                    msg.serviceId = serviceId.value
                }
                // 从历史消息中提取用户名
                if (msg.userName) {
                    userNameMap[uid] = msg.userName
                }
            }

            if (loadMore) {
                // 加载更多模式：追加到现有消息前面
                sessions[uid].messages = [...list, ...sessions[uid].messages]
                sessions[uid].currentPage = page
            } else {
                // 首次加载模式：直接替换为新数据
                sessions[uid].messages = list
                sessions[uid].currentPage = 1
            }

            // 按时间排序
            sessions[uid].messages.sort((a, b) => (a.sendTime || '').localeCompare(b.sendTime || ''))

            console.log(`加载用户 ${uid} 历史记录: ${list.length} 条, 模式: ${loadMore ? '加载更多' : '首次加载'}`)
            console.log(`加载历史完成`)
        } else {
            console.error(`历史消息接口返回错误:`, res)
            sessions[uid].hasMore = false
        }
    } catch (e) {
        console.error('加载历史记录失败', e)
        sessions[uid].hasMore = false
    } finally {
        sessions[uid].loadingMore = false
    }
}



// ================= 发送 =================
const sendReply = async () => {
    if (!inputMsg.value) return

    const content = inputMsg.value
    inputMsg.value = ''

    const res = await sendChatReply({
        userId: currentUserId.value,
        serviceId: serviceId.value,
        content
    })

    // 构造完整的消息对象
    const msg = {
        id: 'local-' + Date.now(),
        sessionId: currentUserId.value,
        userId: currentUserId.value,
        serviceId: serviceId.value,
        senderType: 'service',
        senderId: serviceId.value,
        content,
        msgType: 'text',
        sendTime: new Date().toLocaleString('zh-CN', {
            year: 'numeric', month: '2-digit', day: '2-digit',
            hour: '2-digit', minute: '2-digit', second: '2-digit',
            hour12: false
        }).replace(/\//g, '-')
    }

    sessions[currentUserId.value].messages.push(msg)
    sessions[currentUserId.value].lastMsg = content
    sessions[currentUserId.value].lastTime = msg.sendTime
    scrollBottom()
}

// ================= 工具 =================
const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault()
        sendReply()
    }
}

const scrollBottom = () => {
    nextTick(() => {
        const el = msgListRef.value
        if (el) el.scrollTop = el.scrollHeight
    })
}

// 处理滚动事件，实现上滑加载更多
const handleScroll = () => {
    const el = msgListRef.value
    if (!el || !currentUserId.value) return

    const { scrollTop } = el
    // 当滚动到距离顶部 50px 以内时，加载更多历史消息
    if (scrollTop < 50) {
        const uid = currentUserId.value
        loadHistory(uid, true)
    }
}

const showTime = (i) => {
    if (i === 0) return true
    const prev = currentMessages.value[i - 1]
    const curr = currentMessages.value[i]
    return new Date(curr.sendTime) - new Date(prev.sendTime) > 300000
}

const formatTime = (t) => {
    const d = new Date(t)
    return d.toLocaleString()
}

// ================= 下线（a-modal confirm 替代 confirm()） =================
const confirmOffline = () => {
    Modal.confirm({
        title: '确认下线',
        content: '确定要下线吗？下线后用户发消息时将自动分配到其他在线客服。',
        okText: '确定下线',
        okType: 'danger',
        cancelText: '取消',
        onOk: async () => {
            if (serviceId.value) {
                await serviceOffline(serviceId.value)
            }
            ws.value?.close()
            serviceId.value = ''
            loginVisible.value = true
            location.reload(true)
        }
    })
}
</script>

<style>
* {
    margin: 0;
    padding: 0;
    box-sizing: border-box;
}

body {
    font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", "PingFang SC", "Hiragino Sans GB", "Microsoft YaHei", sans-serif;
    background: #f0f2f5;
    height: 100vh;
    display: flex;
    flex-direction: column;
}

/* 顶部导航 */
.top-bar {
    display: flex;
    align-items: center;
    justify-content: space-between;
    height: 56px;
    padding: 0 24px;
    background: #fff;
    border-bottom: 1px solid #e8e8e8;
    flex-shrink: 0;
}

.top-bar h1 {
    font-size: 18px;
    color: #333;
}

.status-dot {
    width: 8px;
    height: 8px;
    border-radius: 50%;
    display: inline-block;
}

.status-dot.online {
    background: #52c41a;
}

.status-dot.offline {
    background: #ccc;
}

/* 主体 */
.main {
    display: flex;
    flex: 1;
    overflow: hidden;
}

/* 左侧用户列表 */
.sidebar {
    width: 260px;
    background: #fff;
    border-right: 1px solid #e8e8e8;
    display: flex;
    flex-direction: column;
    flex-shrink: 0;
}

.sidebar-header {
    padding: 16px;
    border-bottom: 1px solid #f0f0f0;
    font-size: 14px;
    color: #666;
}

.user-list {
    flex: 1;
    overflow-y: auto;
}

.user-item {
    display: flex;
    align-items: center;
    padding: 14px 16px;
    cursor: pointer;
    border-bottom: 1px solid #f5f5f5;
    transition: background 0.2s;
    position: relative;
}

.user-item:hover {
    background: #f5f5f5;
}

.user-item.active {
    background: #e6f7ff;
    border-right: 3px solid #1A6B8A;
}

.user-avatar {
    width: 40px;
    height: 40px;
    border-radius: 50%;
    background: #1A6B8A;
    display: flex;
    align-items: center;
    justify-content: center;
    color: #fff;
    font-size: 14px;
    font-weight: bold;
    flex-shrink: 0;
}

.user-info {
    margin-left: 12px;
    flex: 1;
    overflow: hidden;
}

.user-last-msg {
    font-size: 12px;
    color: #999;
    margin-top: 4px;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
}

.unread-badge {
    position: absolute;
    top: 10px;
    right: 12px;
    min-width: 18px;
    height: 18px;
    line-height: 18px;
    text-align: center;
    background: #ff4d4f;
    color: #fff;
    border-radius: 9px;
    font-size: 11px;
    padding: 0 5px;
}

/* 右侧聊天区 */
.chat-area {
    flex: 1;
    display: flex;
    flex-direction: column;
    background: #f5f5f5;
}

.chat-header {
    height: 56px;
    padding: 0 24px;
    background: #fff;
    border-bottom: 1px solid #e8e8e8;
    display: flex;
    align-items: center;
    justify-content: space-between;
    flex-shrink: 0;
}

.chat-header-title {
    font-size: 16px;
    color: #333;
    font-weight: 500;
}

.empty-state {
    flex: 1;
    display: flex;
    align-items: center;
    justify-content: center;
    color: #bbb;
    font-size: 16px;
}

.msg-list {
    height: 500px;
    overflow-y: auto;
    padding: 20px 24px;

}

.msg-time {
    text-align: center;
    padding: 12px 0;
    font-size: 12px;
    color: #999;
}

.no-more-messages {
    text-align: center;
    padding: 10px 0;
    font-size: 12px;
    color: #999;
    background: #f5f5f5;
    margin-bottom: 10px;
    border-radius: 4px;
}

.loading-more {
    text-align: center;
    padding: 10px 0;
    font-size: 12px;
    color: #999;
    margin-bottom: 10px;
}

.msg-row {
    margin-bottom: 20px;
    display: flex;
}

.msg-row-left {
    justify-content: flex-start;
}

.msg-row-right {
    justify-content: flex-end;
}

.msg-avatar {
    width: 36px;
    height: 36px;
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 12px;
    color: #fff;
    font-weight: bold;
    flex-shrink: 0;
}

.msg-avatar-user {
    background: #1A6B8A;
}

.msg-avatar-service {
    background: #52c41a;
}

.msg-bubble {
    max-width: 60%;
    padding: 10px 14px;
    border-radius: 8px;
    font-size: 14px;
    line-height: 1.6;
    word-break: break-all;
}

.msg-bubble-left {
    margin-left: 10px;
    background: #fff;
    border-top-left-radius: 2px;
    color: #333;
}

.msg-bubble-right {
    margin-right: 10px;
    background: #95ec69;
    border-top-right-radius: 2px;
    color: #333;
}

.input-area {
    padding: 16px 24px;
    background: #fff;
    border-top: 1px solid #e8e8e8;
    flex-shrink: 0;
}

.input-area textarea {
    width: 100%;
    height: 80px;
    padding: 10px 12px;
    border: 1px solid #d9d9d9;
    border-radius: 4px;
    resize: none;
    font-size: 14px;
    line-height: 1.5;
    outline: none;
    font-family: inherit;
}

.input-area textarea:focus {
    border-color: #1A6B8A;
    box-shadow: 0 0 0 2px rgba(24, 144, 255, 0.1);
}

.btn-send {
    margin-top: 10px;
    float: right;
    padding: 8px 24px;
    background: #07c160;
    color: #fff;
    border: none;
    border-radius: 4px;
    cursor: pointer;
    font-size: 14px;
}

.btn-send:hover {
    background: #06ad56;
}

/* 登录弹窗内容区 */
.login-form {
    padding: 8px 0 4px;
}
</style>
