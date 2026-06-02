<template>
	<view class="page">
		<view class="swiper-box">
			<swiper class="swiper" :autoplay="true" :interval="2500" :duration="700" :circular="true">
				<swiper-item v-for="item in swiperList" :key="item.id" @click="handleClickSwiper(item.path)">
					<view class="swiper-item">
						<image :src="item.url" class="img-box" mode="aspectFill"></image>
					</view>
				</swiper-item>
			</swiper>
		</view>
		<view class="home-content-box">
			<view class="search-box" @click="handleClickSearch">
				<view class="search-main">
					<view class="search-icon">
						<image src="https://doctor.gzxinxingyiyuan.com/images/image/home/searchIcon1.png" mode="" class="img-box"></image>
					</view>
					<view class="search-text">搜尋醫生、科室、醫院、藥品</view>
				</view>
			</view>
			<view class="domain">
				<view class="domain-card" v-for="(item, index) in domainList" :style="{ backgroundImage: `url(${item.bgc})` }" @click="handleClickDomain(item.path)">
					<view class="domain-card-top">
						<view class="domain-card-title">
							{{ item.title }}
						</view>
						<view class="hot-sale" v-if="index == 1">热卖</view>
					</view>
					<view class="domain-card-subTitle">
						{{ item.subTitle }}
					</view>
					<view
						class="domain-card-btn"
						:class="{
							'domain-card-btn1': index === 0 || index === 2,
							'domain-card-btn2': index === 1 || index === 3
						}"
					>
						{{ item.actionText }}
					</view>
				</view>
			</view>
			<view class="main-box">
				<view class="main-card" v-for="item in mainList" @click="clickMainList(item)">
					<view class="main-pic">
						<image :src="item.name" mode="" class="img-box"></image>
					</view>
					<view class="main-title">{{ item.title }}</view>
				</view>
			</view>
			<view class="capsule-box">
				<swiper class="swiper" :autoplay="true" :interval="2500" :duration="700" :circular="true">
					<swiper-item v-for="item in swiperList1">
						<view class="swiper-item capsule-card">
							<view class="capsule-card-title">{{ item.title }}</view>
							<view class="capsule-card-desc">{{ item.desc }}</view>
						</view>
					</swiper-item>
				</swiper>
			</view>
			<view class="appointment-box">
				<view class="appointment-box-title">我的預約</view>
				<view class="appointment-box-all">
					<view class="appointment-box-all-text">全部</view>
					<view class="appointment-box-all-icon">
						<uni-icons type="right" size="16" color="#a2a2a2"></uni-icons>
					</view>
				</view>
			</view>
			<view class="appointment-card">
				<view class="appointment-avator">
					<image src="https://doctor.gzxinxingyiyuan.com/images/image/recommend/avaPicCicle.png" mode="" class="img-box"></image>
				</view>
				<view class="appointment-content">
					<view class="appointment-content-top">
						<view>
							<view>张三</view>
							<view>主任医生</view>
							<view></view>
						</view>
						<view>2026-02-06</view>
					</view>
					<view>全科医疗科</view>
				</view>
			</view>
			<view class="appointment-box">
				<view class="appointment-box-title">醫生推薦</view>
				<view class="appointment-box-all">
					<view class="appointment-box-all-text">全部</view>
					<view class="appointment-box-all-icon">
						<uni-icons type="right" size="16" color="#a2a2a2"></uni-icons>
					</view>
				</view>
			</view>
			<view class="doctor-box">
				<view class="doctor-card" v-for="i in 2">
					<view>
						<image src="https://doctor.gzxinxingyiyuan.com/images/image/recommend/avaPicsquare1.png" mode="" class="img-box"></image>
						<view>
							<image src="https://doctor.gzxinxingyiyuan.com/images/image/recommend/commendIconF.png" mode="" class="img-box"></image>
						</view>
					</view>
					<view>
						<view>
							<view>张三</view>
							<view>主任医师</view>
						</view>
						<view>全科医疗科</view>
						<view>顶级专家</view>
						<view>
							<view>
								<text style="font-size: 20rpx">￥</text>
								<text>49</text>
							</view>
							<view>预约费</view>
						</view>
					</view>
				</view>
			</view>
		</view>

		<!-- 非通话中的字幕预览面板（通话中使用原生浮层） -->
		<subtitle-panel
			:visible="subtitleVisible"
			:in-call="false"
			:subtitle-list="subtitleList"
			:current-line="currentSubtitleLine"
			@switch-lang="onSwitchLang"
		/>
	</view>
</template>

<script setup>
import { reactive, ref } from 'vue';
import { getSystemInfo } from '@/utils/global.js';
import { onPullDownRefresh, onLoad, onShow } from '@dcloudio/uni-app';
import { updateTabbarBadge } from '@/utils/tabBarBadge.js';
import { jiaoyan, getuser } from '@/api/yyf.js';
import { getMsgCount } from '@/api/base.js';
import { genTestUserSig } from '@/debug/GenerateTestUserSig.js';
import subtitlePanel from '@/components/subtitlePanel/subtitlePanel.vue';
import { connectSubtitleWs, resolveSubtitleWsHost } from '@/utils/speechWs.js';

// ============================================================
// 字幕相关状态
// ============================================================
/** 字幕列表（isFinal=true 的最终结果） */
const subtitleList = ref([]);
/** 当前中间结果行（isFinal=false） */
const currentSubtitleLine = ref(null);
/** 字幕面板是否可见 */
const subtitleVisible = ref(false);
/** 当前显示语言：simplified | traditional | none */
const currentLang = ref('simplified');
/** 字幕 WS 关闭函数 */
let subtitleWsClose = null;
/** 原生字幕浮层实例（通话中覆盖在 TUICallKit 上方） */
let nativeSubtitleView = null;
/** 原生语言切换按钮浮层 */
let nativeLangView = null;

// ============================================================
// 语言选项（与 Web 端对齐）
// ============================================================
const langOptions = [
	{ label: '简体中文', value: 'simplified' },
	{ label: '繁體中文', value: 'traditional' },
	{ label: 'English',  value: 'none' },
];

// ============================================================
// 原生浮层（通话中用，覆盖在 TUICallKit 原生层上方）
// ============================================================

/**
 * 获取 TUICallKit 通话所在的原生 window。
 * TUICallKit 插件通话时会打开一个新的原生 WebviewObject，
 * 通过遍历所有 webview 找到 id 包含 "TUICallKit" 的那个。
 */
const getCallWindow = () => {
	// #ifdef APP-PLUS
	try {
		const wins = plus.webview.all();
		for (let i = wins.length - 1; i >= 0; i--) {
			const id = wins[i].id || '';
			console.log('[v0] webview id:', id);
			if (id.toLowerCase().includes('tuicall') || id.toLowerCase().includes('call')) {
				return wins[i];
			}
		}
		// 找不到时取最顶层 webview（通话时它一定是最新打开的）
		return wins[wins.length - 1] || plus.webview.currentWebview();
	} catch (e) {
		return plus.webview.currentWebview();
	}
	// #endif
};

/** 创建字幕原生浮层，挂载到通话窗口 */
const showNativeSubtitle = () => {
	// #ifdef APP-PLUS
	try {
		// 延迟 800ms 等待通话窗口完全打开
		setTimeout(() => {
			try {
				const callWin = getCallWindow();
				console.log('[v0] 目标通话窗口:', callWin ? callWin.id : 'null');

				// 语言切换按钮区域
				nativeLangView = new plus.nativeObj.View('langSwitchView', {
					top: '51%',
					left: '5%',
					width: '90%',
					height: '40px',
					backgroundColor: 'rgba(0,0,0,0.01)',
				});

				// 字幕文字区域
				nativeSubtitleView = new plus.nativeObj.View('subtitleView', {
					top: '56%',
					left: '5%',
					width: '90%',
					height: '160px',
					backgroundColor: 'rgba(0,0,0,0.01)',
				});

				// 挂载到通话窗口（不指定 parent 时默认挂到 currentWebview，通话是另一个 window 所以需要显式挂载）
				nativeLangView.show(callWin);
				nativeSubtitleView.show(callWin);

				updateNativeLangBar();
				updateNativeSubtitle();

				// 点击语言切换按钮
				nativeLangView.addEventListener('click', (e) => {
					const x = e.screenX || 0;
					const screenWidth = plus.screen.resolutionWidth;
					const sectionWidth = (screenWidth * 0.9) / 3;
					const offsetX = x - screenWidth * 0.05;
					const idx = Math.max(0, Math.min(2, Math.floor(offsetX / sectionWidth)));
					const lang = langOptions[idx];
					if (lang) onSwitchLang(lang.value);
				});

				console.log('[v0] 原生字幕浮层已创建');
			} catch (inner) {
				console.error('[v0] showNativeSubtitle 内层失败:', inner);
			}
		}, 800);
	} catch (e) {
		console.error('[v0] showNativeSubtitle 外层失败:', e);
	}
	// #endif
};

/** 隐藏并销毁原生字幕浮层 */
const hideNativeSubtitle = () => {
	// #ifdef APP-PLUS
	try {
		if (nativeSubtitleView) {
			nativeSubtitleView.close();
			nativeSubtitleView = null;
		}
		if (nativeLangView) {
			nativeLangView.close();
			nativeLangView = null;
		}
	} catch (e) {
		console.error('[Subtitle] hideNativeSubtitle 失败:', e);
	}
	// #endif
};

/** 获取要显示的文本：simplified 显示 convertedText，其余显示 originalText */
const getDisplayText = (item) => {
	if (!item) return '';
	if (currentLang.value === 'simplified') {
		return item.convertedText || item.originalText || '';
	}
	return item.originalText || item.convertedText || '';
};

/** 更新语言切换按钮原生浮层 */
const updateNativeLangBar = () => {
	// #ifdef APP-PLUS
	if (!nativeLangView) return;
	try {
		const drawCmds = langOptions.map((lang, idx) => {
			const isActive = currentLang.value === lang.value;
			// 每个按钮宽度约 33%，留 1% 间距
			const btnW = 32;
			const left = idx * 33 + '%';
			return [
				{
					tag: 'rect',
					color: isActive ? '#4080ff' : 'rgba(0,0,0,0.5)',
					rectStyles: {
						borderColor: isActive ? '#4080ff' : 'rgba(255,255,255,0.4)',
						borderWidth: '1px',
						borderRadius: '14px',
					},
					position: { top: '2px', left, width: btnW + '%', height: '36px' },
				},
				{
					tag: 'font',
					text: lang.label,
					textStyles: {
						size: '11px',
						color: '#ffffff',
						align: 'center',
						verticalAlign: 'middle',
					},
					position: { top: '2px', left, width: btnW + '%', height: '36px' },
				},
			];
		}).flat();
		nativeLangView.draw(drawCmds);
	} catch (e) {
		console.error('[v0] updateNativeLangBar 失败:', e);
	}
	// #endif
};

/** 更新原生字幕内容（显示最近 2 条 + 1 条中间结果） */
const updateNativeSubtitle = () => {
	// #ifdef APP-PLUS
	if (!nativeSubtitleView) return;
	try {
		const recent = subtitleList.value.slice(-2);
		const lines = [...recent];
		if (currentSubtitleLine.value) lines.push(currentSubtitleLine.value);

		const drawCmds = [];
		// 半透明背景
		drawCmds.push({
			tag: 'rect',
			color: 'rgba(0,0,0,0.6)',
			rectStyles: { borderRadius: '8px' },
			position: { top: '0px', left: '0px', width: '100%', height: '100%' },
		});

		const lineHeight = 48;
		lines.forEach((item, idx) => {
			const text = getDisplayText(item);
			const role = item.speakerRole === 'doctor' ? '醫生' : '患者';
			const roleColor = item.speakerRole === 'doctor' ? '#a8c8ff' : '#b7eb8f';
			const top = idx * lineHeight + 8;
			// 说话人标签
			drawCmds.push({
				tag: 'font',
				text: role,
				textStyles: { size: '11px', color: roleColor, align: 'left', verticalAlign: 'middle' },
				position: { top: top + 'px', left: '4px', width: '38px', height: lineHeight + 'px' },
			});
			// 字幕文字
			drawCmds.push({
				tag: 'font',
				text,
				textStyles: { size: '14px', color: '#ffffff', align: 'left', verticalAlign: 'middle', whiteSpace: 'normal' },
				position: { top: top + 'px', left: '44px', width: 'calc(100% - 48px)', height: lineHeight + 'px' },
			});
		});

		nativeSubtitleView.draw(drawCmds);
	} catch (e) {
		console.error('[Subtitle] updateNativeSubtitle 失败:', e);
	}
	// #endif
};

// ============================================================
// 字幕 WebSocket
// ============================================================

/** 处理收到的字幕消息 */
const handleSubtitleMessage = (subtitle) => {
	if (subtitle.type !== 'text') return;
	if (subtitle.isFinal) {
		subtitleList.value.push(subtitle);
		currentSubtitleLine.value = null;
		// 超过 100 条时截断
		if (subtitleList.value.length > 100) {
			subtitleList.value = subtitleList.value.slice(-80);
		}
	} else {
		currentSubtitleLine.value = subtitle;
	}
	updateNativeSubtitle();
};

/** 语言切换：仅切换前端显示字段，不重连 WS */
const onSwitchLang = (lang) => {
	currentLang.value = lang;
	updateNativeLangBar();
	updateNativeSubtitle();
};

// ============================================================
// TUICallKit 初始化（APP 端）
// ============================================================
// #ifdef APP-PLUS
try {
	const TUICallKit = uni.requireNativePlugin('TencentCloud-TUICallKit');
	console.log('TUICallKit:', TUICallKit);

	if (!TUICallKit) {
		throw new Error('插件��加载成功');
	}

	const userID = uni.getStorageSync('phone');
	const validUserID = String(userID).replace(/[^a-zA-Z0-9_-]/g, '');
	const { userSig, sdkAppID } = genTestUserSig(validUserID);

	uni.$TUICallKit = TUICallKit;

	try {
		uni.$TUICallKit.login({
			SDKAppID: sdkAppID,
			userID: validUserID,
			userSig,
			success: (res) => {
				console.log('TUICallKit 登录成功:', res);
				setupTUICallKitListeners();
			},
			fail: (err) => {
				console.error('TUICallKit 登录失败:', err);
				uni.showToast({ title: '通话服务登录失败', icon: 'none' });
			}
		});
	} catch (e) {
		console.error('login 同步异常:', e);
	}

	try {
		uni.$TUICallKit.setSelfInfo({
			nickName: uni.getStorageSync('userName') || '患者',
			avatar: '',
			success: (res) => console.log('setSelfInfo 成功:', res),
			fail: (err) => console.error('setSelfInfo 失败:', err)
		});
	} catch (e) {
		console.error('setSelfInfo 同步异常:', e);
	}

	const setupTUICallKitListeners = () => {
		try {
			// 通话开始：连接字幕 WS，创建原生浮层
			uni.$TUICallKit.on('onCallBegin', async (data) => {
				// UniApp TUICallKit 插件回调字段：roomID（大写D）
				const roomId = String(data.roomID || data.roomId || data.roomIDStr || '');
				// userId 与 Web 端 startRecording 传的 userId（手机号）一致，去掉非法字符
				const rawPhone = uni.getStorageSync('phone') || '';
				const userId = String(rawPhone).replace(/[^a-zA-Z0-9_-]/g, '');

				if (!roomId || !userId) return;

				// 重置字幕状态
				subtitleList.value = [];
				currentSubtitleLine.value = null;
				subtitleVisible.value = true;

				// 从存储的 API 地址推导字幕 WS host
				const apiBaseUrl = uni.getStorageSync('apiBaseUrl') || 'http://192.168.100.14:18085';
				const wsHost = resolveSubtitleWsHost(apiBaseUrl);

				// 连接字幕 WS（患者仅接收，不采集音频）
				console.log('[v0] 字幕WS参数:', { wsHost, roomId, userId });
				try {
					const { socketTask, close } = connectSubtitleWs(wsHost, roomId, userId);
					subtitleWsClose = close;

					socketTask.onOpen(() => {
						console.log('[v0] 字幕WS已连接');
					});
					socketTask.onMessage((res) => {
						try {
							const subtitle = JSON.parse(res.data);
							handleSubtitleMessage(subtitle);
						} catch (e) {}
					});
					socketTask.onClose((res) => {
						console.log('[v0] 字幕WS已关闭', res);
					});
					socketTask.onError((err) => {
						console.error('[v0] 字幕WS错误:', err);
					});
				} catch (e) {
					console.error('[v0] connectSubtitleWs 异常:', e);
				}

				// 创建原生字幕浮层（覆盖在 TUICallKit 上方）
				showNativeSubtitle();
			});

			// 通话结束：关闭字幕 WS，清理原生浮层
			uni.$TUICallKit.on('onCallEnd', (data) => {
				console.log('通话结束:', data);

				// 关闭字幕 WS
				if (subtitleWsClose) {
					subtitleWsClose();
					subtitleWsClose = null;
				}

				// 隐藏原生浮层
				hideNativeSubtitle();

				// 延迟清理字幕状态（让用户看完最后的字幕）
				setTimeout(() => {
					subtitleVisible.value = false;
					subtitleList.value = [];
					currentSubtitleLine.value = null;
				}, 3000);
			});

			uni.$TUICallKit.on('onInvited', (data) => {
				console.log('收到来电邀���:', data);
			});

			uni.$TUICallKit.on('onError', (err) => {
				console.error('TUICallKit 错误:', err);
			});

			console.log('TUICallKit 监听器设置完成');
		} catch (e) {
			console.error('设置监听器失败:', e);
		}
	};
} catch (err) {
	console.error('TUICallKit 初始化失败:', err);
	uni.showToast({ title: '通话组件初始化失败', icon: 'none' });
}
// #endif

// ============================================================
// 轮播图
// ============================================================
const swiperList = reactive([
	{
		id: 1,
		name: 'swiper1',
		url: '/static/images/swiper1.png',
		path: false
	},
	{
		id: 2,
		name: 'swiper2',
		url: 'https://doctor.gzxinxingyiyuan.com/images/image/swiper/item3.png',
		path: '/pages/home/list/domainShop'
	}
]);

const handleClickSwiper = (v) => {
	v && uni.navigateTo({ url: v });
};

// ============================================================
// 搜索
// ============================================================
const handleClickSearch = () => {
	uni.navigateTo({ url: '/pages/home/list/search' });
};

// ============================================================
// 功能区
// ============================================================
const domainList = reactive([
	{
		title: '求診醫療',
		subTitle: '環球港醫網全程為您服務',
		actionText: '去看病',
		bgc: 'https://doctor.gzxinxingyiyuan.com/images/image/home/mainBgc1.png',
		path: '/pages/home/list/domainDoctor'
	},
	{
		title: '華興藥房',
		subTitle: '一键購藥 極速送達',
		actionText: '去買藥',
		bgc: 'https://doctor.gzxinxingyiyuan.com/images/image/home/mainBgc2.png',
		path: '/pages/home/list/domainShop'
	},
	{
		title: '醫療諮詢',
		subTitle: 'AI諮詢 守護安康',
		actionText: '去諮詢',
		bgc: '/static/images/mainBgc3.png',
		path: '/pages/home/list/domainConsult'
	},
	{
		title: '我的指標',
		subTitle: '健康指標在綫查看',
		actionText: '去查看',
		bgc: 'https://doctor.gzxinxingyiyuan.com/images/image/home/mainBgc4.png',
		path: '/pages/home/list/domainIndicator'
	}
]);

const handleClickDomain = async (url) => {
	const needAuthCheckPages = ['/pages/home/list/domainDoctor', '/pages/home/list/domainShop'];
	if (!needAuthCheckPages.includes(url)) {
		return uni.navigateTo({ url });
	}
	const userId = uni.getStorageSync('userId');
	try {
		const res = await jiaoyan({ userId });
		if (res.code === '200') {
			if (res.data.signTag === '0') {
				uni.showModal({
					title: '提示',
					content: '未签署合同!',
					showCancel: false,
					confirmText: '确定',
					success: (result) => {
						if (result.confirm) uni.reLaunch({ url: '/pages/mine/mine' });
					}
				});
				return;
			}
			uni.navigateTo({ url });
		} else {
			uni.showToast({ title: res.msg || '校验失败', icon: 'none' });
		}
	} catch (error) {
		uni.showToast({ title: '网络异常', icon: 'none' });
	}
};

// ============================================================
// 用户信息校验
// ============================================================
const checkUserInfoComplete = (userData) => {
	const requiredFields = ['userName', 'sex', 'birthyDay', 'height', 'weight', 'serialNumber', 'orgName'];
	for (const field of requiredFields) {
		if (!userData[field] || userData[field] === '' || userData[field] === null) {
			return false;
		}
	}
	return true;
};

const initPageCheck = async () => {
	const userId = uni.getStorageSync('userId');
	try {
		const jiaoyanRes = await jiaoyan({ userId });
		if (jiaoyanRes.code === '200' && jiaoyanRes.data.signTag === '0') {
			uni.showModal({
				title: '提示',
				content: '未签署合同!',
				showCancel: false,
				confirmText: '确定',
				success: (result) => {
					if (result.confirm) uni.reLaunch({ url: '/pages/mine/mine' });
				}
			});
			return;
		}
		const userRes = await getuser({ serialNumber: uni.getStorageSync('phone') });
		if (userRes.code === '200' && userRes.data && userRes.data.data) {
			const userData = userRes.data.data;
			if (!checkUserInfoComplete(userData)) {
				uni.showModal({
					title: '提示',
					content: '请完善个人信息!',
					showCancel: false,
					confirmText: '确定',
					success: (result) => {
						if (result.confirm) uni.navigateTo({ url: '/pages/mine/minelist/EditProfile' });
					}
				});
			}
		}
	} catch (error) {
		console.error('initPageCheck error:', error);
	}
};

// ============================================================
// 金刚区
// ============================================================
const mainList = reactive([
	{
		name: 'https://doctor.gzxinxingyiyuan.com/images/image/home/girdIcon3.png',
		title: '港醫講醫',
		path: '/pages/home/infomation/infomation'
	},
	{
		name: 'https://doctor.gzxinxingyiyuan.com/images/image/home/girdIcon1.png',
		title: '我的設備',
		path: '',
		flag: 'navigate'
	},
	{
		name: 'https://doctor.gzxinxingyiyuan.com/images/image/home/girdIcon2.png',
		title: '我的親屬',
		path: false
	},
	{
		name: 'https://doctor.gzxinxingyiyuan.com/images/image/home/girdIcon4.png',
		title: '心裏診療',
		path: false,
		flag: 'webview'
	}
]);

const clickMainList = (val) => {
	val.path && uni.navigateTo({ url: val.path });
	if (val.flag === 'navigate') {
		plus.runtime.launchApplication(
			{ pname: 'www.ruoguzhichuang.com' },
			() => console.log('打开成功'),
			(err) => console.log('打开失败', err)
		);
	}
};

// ============================================================
// 胶囊区
// ============================================================
const swiperList1 = ref([
	{ title: '全面防癌基因檢查', desc: '為你摯愛買個最先進的防癌計劃' },
	{ title: '馴化NK療法', desc: '增強免疫力，提升身體防禦機制' },
	{ title: '糖尿病最新療法', desc: '前沿技術，改善糖尿病治療效果' },
	{ title: '肝硬化及脂肪肝療法', desc: '最新方案，幫助肝臟健康修復' },
	{ title: '玻璃肺結節清除療法', desc: '無創傷技術，輕鬆解決肺結節問題' },
]);

// ============================================================
// 未读消息
// ============================================================
const getCount = async () => {
	try {
		const res = await getMsgCount({ telphone: uni.getStorageSync('phone') });
		updateTabbarBadge(1, res.data.countUnreadMsg || 0);
	} catch (error) {}
};

onShow(() => {
	initPageCheck();
	setTimeout(() => { getCount(); }, 1000);
});
</script>

<style scoped lang="scss">
.swiper-box {
	width: 100%;
	height: 384rpx;
}

.swiper {
	width: 100%;
	height: 100%;
}

.swiper-item {
	width: 100%;
	height: 100%;
}

.home-content-box {
	width: 100%;
	min-height: 200rpx;
	background-color: $bg-page;
	border-radius: $radius-40 $radius-40 0 0;
	margin-top: -48rpx;
	padding: $space-32 $space-48;
	position: relative;
	z-index: 10;
}

.search-box {
	width: 100%;
	height: 100rpx;
	background-color: #fff;
	box-shadow: $box-shadow;
	border-radius: $radius-20;
	@include flex-center;
}

.search-main {
	@include flex-center;
}

.search-icon {
	width: 36rpx;
	height: 36rpx;
	margin-right: $space-8;
}

.search-text {
	color: $text-secondary;
	font-size: $font-28;
}

.domain {
	margin-top: $space-32;
	@include grid-col-2;
}

.domain-card {
	position: relative;
	width: 315rpx;
	height: 240rpx;
	background-color: #fff;
	background-size: 100% 100%;
	padding: $space-32;
	background-repeat: no-repeat;
	border-radius: $radius-20;
	box-shadow: $box-shadow;
}

.hot-sale {
	width: 64rpx;
	height: 34rpx;
	border-radius: $radius-10;
	background-color: $danger;
	font-size: $font-20;
	color: #fff;
	@include flex-center;
}

.domain-card-top {
	@include flex-between;
	color: $text-primary;
	font-size: $font-26;
	margin-bottom: $space-8;
}

.domain-card-title {
	color: $text-primary;
	font-size: $font-26;
	margin-bottom: $space-8;
}

.domain-card-subTitle {
	color: $text-secondary;
	font-size: $font-20;
}

.domain-card-btn {
	width: 120rpx;
	height: 52rpx;
	color: #fff;
	margin-top: $space-48;
	font-size: $font-26;
	border-radius: $radius-16;
	@include flex-center;
}

.domain-card-btn1 {
	background: linear-gradient(to right, $danger, $danger-secondary);
}

.domain-card-btn2 {
	background: linear-gradient(to right, $primary-light, $primary);
}

.main-box {
	width: 100%;
	height: 218rpx;
	background-color: #fff;
	box-shadow: $box-shadow;
	margin-top: $space-24;
	border-radius: $radius-20;
	padding: $space-16;
	display: grid;
	grid-template-columns: repeat(4, 1fr);
	gap: 48rpx;
}

.main-card {
	@include flex-col-center;
}

.main-pic {
	width: 98rpx;
	height: 98rpx;
}

.main-title {
	font-size: $font-28;
	color: $text-primary;
	margin-top: $space-16;
}

.capsule-box {
	width: 100%;
	height: 160rpx;
	margin-top: $space-32;
	background: url('https://doctor.gzxinxingyiyuan.com/images/image/capsule/item2.png') no-repeat;
	background-size: 100% 100%;
}

.capsule-card {
	color: #fff;
	position: relative;
	z-index: 11;
	@include flex-col-center;
}

.capsule-card-title {
	font-size: $font-26;
	@include flex-col-center;
}

.capsule-card-desc {
	margin-top: $space-16;
	font-size: $font-40;
	@include flex-col-center;
}

.appointment-box {
	height: 40rpx;
	margin-top: $space-32;
	font-size: $font-36;
	color: $text-primary;
	@include flex-between;
}

.appointment-box-all {
	@include flex-start;
}

.appointment-box-all-text {
	margin-right: $space-8;
	font-size: $font-24;
	color: $text-secondary;
}

.appointment-box-all-icon {
	width: 32rpx;
	height: 32rpx;
	@include flex-center;
}

.appointment-card {
	width: 100%;
	height: 202rpx;
	border-radius: $radius-20;
	background-color: #fff;
	box-shadow: $box-shadow;
	margin-top: $space-20;
	padding: $space-32;
	@include flex-between;
}

.appointment-avator {
	width: 116rpx;
	height: 116rpx;
	margin-right: $space-32;
	border-radius: 50%;
	border: 1px solid $primary;
}

.appointment-content {
	flex: 1;

	> :nth-child(2) {
		color: $text-secondary;
		font-size: $font-24;
	}
}

.appointment-content-top {
	margin-bottom: $space-20;
	@include flex-between;

	> :nth-child(1) {
		@include flex-between;

		> :nth-child(1) {
			color: $text-primary;
			font-size: $font-32;
			margin-right: $space-24;
		}

		> :nth-child(2) {
			color: $text-regular;
			font-size: $font-24;
			margin-right: $space-24;
		}
	}

	> :nth-child(2) {
		color: $text-secondary;
		font-size: $font-24;
	}
}

.doctor-card {
	width: 100%;
	height: 248rpx;
	border-radius: $radius-20;
	background-color: #fff;
	box-shadow: $box-shadow;
	margin-top: $space-20;
	padding: $space-32;
	@include flex-start;

	> :nth-child(1) {
		width: 184rpx;
		height: 184rpx;
		border-radius: $radius-20;
		margin-right: $space-32;
		position: relative;

		> :nth-child(2) {
			width: 50rpx;
			height: 56rpx;
			position: absolute;
			top: 0;
			left: 22rpx;
		}
	}

	> :nth-child(2) {
		flex: 1;
		position: relative;

		> :nth-child(1) {
			@include flex-start;

			> :nth-child(1) {
				color: $text-primary;
				font-size: $font-32;
				margin-right: $space-24;
			}

			> :nth-child(2) {
				color: $text-regular;
				font-size: $font-24;
			}
		}

		> :nth-child(2) {
			margin-top: $space-20;
			color: $text-secondary;
			font-size: $font-24;
		}

		> :nth-child(3) {
			width: fit-content;
			margin-top: $space-20;
			color: $primary;
			font-size: $font-24;
			padding: $space-8 $space-16;
			border: 1px solid $primary;
			border-radius: $radius-20;
		}

		> :nth-child(4) {
			@include flex-start-baseline;
			position: absolute;
			bottom: 0;
			right: 0;
			color: $primary;
			font-size: $font-24;

			> :nth-child(1) {
				margin-right: $space-8;
				font-size: $font-28;
				color: $danger;
			}

			> :nth-child(2) {
				font-size: $font-20;
				color: $text-regular;
			}
		}
	}
}
</style>
