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
						<view class="domain-card-title">{{ item.title }}</view>
						<view class="hot-sale" v-if="index == 1">热卖</view>
					</view>
					<view class="domain-card-subTitle">{{ item.subTitle }}</view>
					<view
						class="domain-card-btn"
						:class="{
							'domain-card-btn1': index === 0 || index === 2,
							'domain-card-btn2': index === 1 || index === 3
						}"
					>{{ item.actionText }}</view>
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

		<!-- 字幕弹窗：通话中且视频最小化后可见 -->
		<view v-if="subtitleVisible" class="subtitle-popup">
			<!-- 标题栏 -->
			<view class="subtitle-header">
				<text class="subtitle-title">实时字幕</text>
				<view class="lang-bar">
					<view
						v-for="lang in langOptions"
						:key="lang.value"
						class="lang-btn"
						:class="{ 'lang-btn--active': currentLang === lang.value }"
						@click="onSwitchLang(lang.value)"
					>{{ lang.label }}</view>
				</view>
			</view>
			<!-- 字幕内容 -->
			<scroll-view class="subtitle-scroll" scroll-y :scroll-top="subtitleScrollTop">
				<view
					v-for="(item, idx) in subtitleList"
					:key="idx"
					class="subtitle-row"
				>
					<text
						class="speaker-tag"
						:class="item.speakerRole === 'doctor' ? 'speaker-doctor' : 'speaker-patient'"
					>{{ item.speakerRole === 'doctor' ? '醫生' : '患者' }}</text>
					<text class="subtitle-text">{{ getDisplayText(item) }}</text>
				</view>
				<!-- 识别中的中间结果 -->
				<view v-if="currentSubtitleLine" class="subtitle-row subtitle-row--interim">
					<text
						class="speaker-tag"
						:class="currentSubtitleLine.speakerRole === 'doctor' ? 'speaker-doctor' : 'speaker-patient'"
					>{{ currentSubtitleLine.speakerRole === 'doctor' ? '醫生' : '患者' }}</text>
					<text class="subtitle-text">{{ getDisplayText(currentSubtitleLine) }}...</text>
				</view>
				<!-- 无内容时的提示 -->
				<view v-if="subtitleList.length === 0 && !currentSubtitleLine" class="subtitle-empty">
					<text>等待字幕中...</text>
				</view>
			</scroll-view>
		</view>
	</view>
</template>

<script setup>
import { reactive, ref, nextTick } from 'vue';
import { getSystemInfo } from '@/utils/global.js';
import { onPullDownRefresh, onLoad, onShow } from '@dcloudio/uni-app';
import { updateTabbarBadge } from '@/utils/tabBarBadge.js';
import { jiaoyan, getuser } from '@/api/yyf.js';
import { getMsgCount } from '@/api/base.js';
import { genTestUserSig } from '@/debug/GenerateTestUserSig.js';
import { connectSubtitleWs, resolveSubtitleWsHost } from '@/utils/speechWs.js';

// ============================================================
// 字幕相关状态
// ============================================================
const subtitleList = ref([]);
const currentSubtitleLine = ref(null);
const subtitleVisible = ref(false);
const subtitleScrollTop = ref(0);
const currentLang = ref('simplified');
let subtitleWsClose = null;

const langOptions = [
	{ label: '简体中文', value: 'simplified' },
	{ label: '繁體中文', value: 'traditional' },
	{ label: 'English',  value: 'none' },
];

const getDisplayText = (item) => {
	if (!item) return '';
	if (currentLang.value === 'simplified') {
		return item.convertedText || item.originalText || '';
	}
	return item.originalText || item.convertedText || '';
};

const onSwitchLang = (lang) => {
	currentLang.value = lang;
};

const scrollToBottom = () => {
	nextTick(() => {
		subtitleScrollTop.value = subtitleList.value.length * 9999;
	});
};

const handleSubtitleMessage = (subtitle) => {
	if (!subtitle || subtitle.type !== 'text') return;
	if (subtitle.isFinal) {
		subtitleList.value.push(subtitle);
		currentSubtitleLine.value = null;
		if (subtitleList.value.length > 100) {
			subtitleList.value = subtitleList.value.slice(-80);
		}
	} else {
		currentSubtitleLine.value = subtitle;
	}
	scrollToBottom();
};

// ============================================================
// TUICallKit 监听器（函数提升到 try 块外，避免作用域问题）
// ============================================================
function setupTUICallKitListeners() {
	try {
		uni.$TUICallKit.on('onCallBegin', (data) => {
			// TUICallKit APP 插件回调字段为 roomID（大写D）
			const roomId = String(data.roomID || data.roomId || data.roomIDStr || '');
			const rawPhone = uni.getStorageSync('phone') || '';
			// userId 去掉非法字符（+86、空格等），与 Web 端 startRecording 传的保持一致
			const userId = rawPhone.replace(/[^a-zA-Z0-9_-]/g, '');

			console.log('[v0] onCallBegin roomId:', roomId, 'userId:', userId);

			if (!roomId || !userId) {
				console.log('[v0] roomId 或 userId 为空，跳过字幕连接');
				return;
			}

			// 重置字幕状态
			subtitleList.value = [];
			currentSubtitleLine.value = null;
			currentLang.value = 'simplified';
			subtitleVisible.value = true;

			// 字幕 WS host：从 storage 读取 API 地址推导
			// 如果没有存 apiBaseUrl，使用 yyf.js 里的生产地址
			const apiBaseUrl = uni.getStorageSync('apiBaseUrl') || 'https://hqgy.gzxinxingyiyuan.com/api';
			const wsHost = resolveSubtitleWsHost(apiBaseUrl);
			console.log('[v0] 字幕WS host:', wsHost, 'url将是:', `${wsHost}/ws/subtitle/${roomId}/${userId}`);

			try {
				const { socketTask, close } = connectSubtitleWs(wsHost, roomId, userId);
				subtitleWsClose = close;

				socketTask.onOpen(() => {
					console.log('[v0] 字幕WS已连接');
				});
				socketTask.onMessage((res) => {
					try {
						handleSubtitleMessage(JSON.parse(res.data));
					} catch (e) {}
				});
				socketTask.onClose((res) => {
					console.log('[v0] 字幕WS已关闭 code:', res.code);
				});
				socketTask.onError((err) => {
					console.error('[v0] 字幕WS错误:', JSON.stringify(err));
				});
			} catch (e) {
				console.error('[v0] connectSubtitleWs 异常:', e);
			}
		});

		uni.$TUICallKit.on('onCallEnd', () => {
			console.log('[v0] onCallEnd 通话结束，关闭字幕WS');
			if (subtitleWsClose) {
				subtitleWsClose();
				subtitleWsClose = null;
			}
			// 3秒后隐藏字幕面板，让用户看完最后内容
			setTimeout(() => {
				subtitleVisible.value = false;
				subtitleList.value = [];
				currentSubtitleLine.value = null;
			}, 3000);
		});

		uni.$TUICallKit.on('onInvited', (data) => {
			console.log('[v0] onInvited 收到来电:', JSON.stringify(data));
		});

		uni.$TUICallKit.on('onError', (err) => {
			console.error('[v0] TUICallKit error:', JSON.stringify(err));
		});

		console.log('[v0] TUICallKit 监听器设置完成');
	} catch (e) {
		console.error('[v0] setupTUICallKitListeners 失败:', e);
	}
}

// ============================================================
// TUICallKit 初始化（APP 端）
// ============================================================
// #ifdef APP-PLUS
try {
	const TUICallKit = uni.requireNativePlugin('TencentCloud-TUICallKit');
	if (!TUICallKit) throw new Error('TUICallKit 插件未加载');

	const rawPhone = uni.getStorageSync('phone') || '';
	const validUserID = rawPhone.replace(/[^a-zA-Z0-9_-]/g, '');
	const { userSig, sdkAppID } = genTestUserSig(validUserID);

	uni.$TUICallKit = TUICallKit;

	uni.$TUICallKit.login({
		SDKAppID: sdkAppID,
		userID: validUserID,
		userSig,
		success: (res) => {
			console.log('[v0] TUICallKit 登录成功:', JSON.stringify(res));
			// setupTUICallKitListeners 是普通函数，无作用域问题
			setupTUICallKitListeners();
		},
		fail: (err) => {
			console.error('[v0] TUICallKit 登录失败:', JSON.stringify(err));
			uni.showToast({ title: '通话服务登录失败', icon: 'none' });
		}
	});

	uni.$TUICallKit.setSelfInfo({
		nickName: uni.getStorageSync('userName') || '患者',
		avatar: '',
		success: () => {},
		fail: () => {}
	});
} catch (err) {
	console.error('[v0] TUICallKit 初始化失败:', err);
}
// #endif

// ============================================================
// 轮播图
// ============================================================
const swiperList = reactive([
	{ id: 1, name: 'swiper1', url: '/static/images/swiper1.png', path: false },
	{ id: 2, name: 'swiper2', url: 'https://doctor.gzxinxingyiyuan.com/images/image/swiper/item3.png', path: '/pages/home/list/domainShop' }
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
	{ title: '求診醫療', subTitle: '環球港醫網全程為您服務', actionText: '去看病', bgc: 'https://doctor.gzxinxingyiyuan.com/images/image/home/mainBgc1.png', path: '/pages/home/list/domainDoctor' },
	{ title: '華興藥房', subTitle: '一键購藥 極速送達', actionText: '去買藥', bgc: 'https://doctor.gzxinxingyiyuan.com/images/image/home/mainBgc2.png', path: '/pages/home/list/domainShop' },
	{ title: '醫療諮詢', subTitle: 'AI諮詢 守護安康', actionText: '去諮詢', bgc: '/static/images/mainBgc3.png', path: '/pages/home/list/domainConsult' },
	{ title: '我的指標', subTitle: '健康指標在綫查看', actionText: '去查看', bgc: 'https://doctor.gzxinxingyiyuan.com/images/image/home/mainBgc4.png', path: '/pages/home/list/domainIndicator' }
]);

const handleClickDomain = async (url) => {
	const needAuthCheckPages = ['/pages/home/list/domainDoctor', '/pages/home/list/domainShop'];
	if (!needAuthCheckPages.includes(url)) return uni.navigateTo({ url });
	const userId = uni.getStorageSync('userId');
	try {
		const res = await jiaoyan({ userId });
		if (res.code === '200') {
			if (res.data.signTag === '0') {
				uni.showModal({
					title: '提示', content: '未签署合同!', showCancel: false, confirmText: '确定',
					success: (result) => { if (result.confirm) uni.reLaunch({ url: '/pages/mine/mine' }); }
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
	return requiredFields.every(field => userData[field] && userData[field] !== '' && userData[field] !== null);
};

const initPageCheck = async () => {
	const userId = uni.getStorageSync('userId');
	try {
		const jiaoyanRes = await jiaoyan({ userId });
		if (jiaoyanRes.code === '200' && jiaoyanRes.data.signTag === '0') {
			uni.showModal({
				title: '提示', content: '未签署合同!', showCancel: false, confirmText: '确定',
				success: (result) => { if (result.confirm) uni.reLaunch({ url: '/pages/mine/mine' }); }
			});
			return;
		}
		const userRes = await getuser({ serialNumber: uni.getStorageSync('phone') });
		if (userRes.code === '200' && userRes.data?.data) {
			if (!checkUserInfoComplete(userRes.data.data)) {
				uni.showModal({
					title: '提示', content: '请完善个人信息!', showCancel: false, confirmText: '确定',
					success: (result) => { if (result.confirm) uni.navigateTo({ url: '/pages/mine/minelist/EditProfile' }); }
				});
			}
		}
	} catch (error) {}
};

// ============================================================
// 金刚区
// ============================================================
const mainList = reactive([
	{ name: 'https://doctor.gzxinxingyiyuan.com/images/image/home/girdIcon3.png', title: '港醫講醫', path: '/pages/home/infomation/infomation' },
	{ name: 'https://doctor.gzxinxingyiyuan.com/images/image/home/girdIcon1.png', title: '我的設備', path: '', flag: 'navigate' },
	{ name: 'https://doctor.gzxinxingyiyuan.com/images/image/home/girdIcon2.png', title: '我的親屬', path: false },
	{ name: 'https://doctor.gzxinxingyiyuan.com/images/image/home/girdIcon4.png', title: '心裏診療', path: false, flag: 'webview' }
]);

const clickMainList = (val) => {
	val.path && uni.navigateTo({ url: val.path });
	if (val.flag === 'navigate') {
		// #ifdef APP-PLUS
		plus.runtime.launchApplication(
			{ pname: 'www.ruoguzhichuang.com' },
			() => {},
			() => {}
		);
		// #endif
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
.swiper-box { width: 100%; height: 384rpx; }
.swiper { width: 100%; height: 100%; }
.swiper-item { width: 100%; height: 100%; }
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
.search-main { @include flex-center; }
.search-icon { width: 36rpx; height: 36rpx; margin-right: $space-8; }
.search-text { color: $text-secondary; font-size: $font-28; }
.domain { margin-top: $space-32; @include grid-col-2; }
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
.domain-card-top { @include flex-between; color: $text-primary; font-size: $font-26; margin-bottom: $space-8; }
.domain-card-title { color: $text-primary; font-size: $font-26; margin-bottom: $space-8; }
.domain-card-subTitle { color: $text-secondary; font-size: $font-20; }
.domain-card-btn {
	width: 120rpx;
	height: 52rpx;
	color: #fff;
	margin-top: $space-48;
	font-size: $font-26;
	border-radius: $radius-16;
	@include flex-center;
}
.domain-card-btn1 { background: linear-gradient(to right, $danger, $danger-secondary); }
.domain-card-btn2 { background: linear-gradient(to right, $primary-light, $primary); }
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
.main-card { @include flex-col-center; }
.main-pic { width: 98rpx; height: 98rpx; }
.main-title { font-size: $font-28; color: $text-primary; margin-top: $space-16; }
.capsule-box {
	width: 100%;
	height: 160rpx;
	margin-top: $space-32;
	background: url('https://doctor.gzxinxingyiyuan.com/images/image/capsule/item2.png') no-repeat;
	background-size: 100% 100%;
}
.capsule-card { color: #fff; position: relative; z-index: 11; @include flex-col-center; }
.capsule-card-title { font-size: $font-26; @include flex-col-center; }
.capsule-card-desc { margin-top: $space-16; font-size: $font-40; @include flex-col-center; }
.appointment-box { height: 40rpx; margin-top: $space-32; font-size: $font-36; color: $text-primary; @include flex-between; }
.appointment-box-all { @include flex-start; }
.appointment-box-all-text { margin-right: $space-8; font-size: $font-24; color: $text-secondary; }
.appointment-box-all-icon { width: 32rpx; height: 32rpx; @include flex-center; }
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
.appointment-avator { width: 116rpx; height: 116rpx; margin-right: $space-32; border-radius: 50%; overflow: hidden; }
.appointment-content { flex: 1; }
.appointment-content-top { @include flex-between; margin-bottom: $space-16; }
.doctor-box { width: 100%; margin-top: $space-20; }
.doctor-card {
	width: 100%;
	background-color: #fff;
	border-radius: $radius-20;
	box-shadow: $box-shadow;
	margin-bottom: $space-20;
	padding: $space-32;
	@include flex-start;
}

/* ============================================================
   字幕弹窗（底部，视频最小化后可见）
   ============================================================ */
.subtitle-popup {
	margin: 24rpx 32rpx 40rpx;
	border-radius: 20rpx;
	background-color: rgba(0, 0, 0, 0.88);
	overflow: hidden;
}

.subtitle-header {
	padding: 20rpx 24rpx 12rpx;
	border-bottom: 1rpx solid rgba(255, 255, 255, 0.1);
	display: flex;
	flex-direction: row;
	align-items: center;
	justify-content: space-between;
}

.subtitle-title {
	font-size: 26rpx;
	color: rgba(255, 255, 255, 0.9);
	font-weight: 600;
}

.lang-bar {
	display: flex;
	flex-direction: row;
	gap: 10rpx;
}

.lang-btn {
	padding: 6rpx 18rpx;
	border-radius: 24rpx;
	font-size: 22rpx;
	color: rgba(255, 255, 255, 0.55);
	background-color: rgba(255, 255, 255, 0.08);
}

.lang-btn--active {
	background-color: #4080ff;
	color: #ffffff;
}

.subtitle-scroll {
	height: 300rpx;
	padding: 16rpx 24rpx;
}

.subtitle-row {
	display: flex;
	flex-direction: row;
	align-items: flex-start;
	margin-bottom: 18rpx;
}

.subtitle-row--interim { opacity: 0.6; }

.speaker-tag {
	font-size: 20rpx;
	padding: 2rpx 10rpx;
	border-radius: 8rpx;
	margin-right: 12rpx;
	flex-shrink: 0;
	margin-top: 6rpx;
}

.speaker-doctor {
	background-color: rgba(64, 128, 255, 0.28);
	color: #a8c8ff;
}

.speaker-patient {
	background-color: rgba(82, 196, 26, 0.2);
	color: #b7eb8f;
}

.subtitle-text {
	flex: 1;
	font-size: 28rpx;
	color: #ffffff;
	line-height: 1.6;
}

.subtitle-empty {
	display: flex;
	align-items: center;
	justify-content: center;
	height: 200rpx;
	font-size: 26rpx;
	color: rgba(255, 255, 255, 0.3);
}
</style>
